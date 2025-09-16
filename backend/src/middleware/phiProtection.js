const { phiEncryption } = require('../services/encryptionService');
const { phiDataModel } = require('../models/phiData');

/**
 * PHI Protection Middleware
 * Automatically encrypts and protects sensitive healthcare data
 */

// Define PHI data fields that require encryption
const PHI_FIELDS = {
  // Patient registration fields
  medicalHistory: 'medical_records',
  currentMedications: 'medical_records',
  allergies: 'medical_records',
  therapyGoals: 'mental_health',
  emergencyContact: 'demographics',
  emergencyContactPhone: 'demographics',
  emergencyContactRelation: 'demographics',
  
  // Therapist fields
  licenseNumber: 'professional_credentials',
  specialization: 'professional_credentials',
  
  // Session and chat data
  sessionNotes: 'mental_health',
  chatMessage: 'mental_health',
  emotionalTone: 'mental_health',
  treatmentPlan: 'mental_health',
  diagnosis: 'mental_health',
  
  // Personal identifiers
  ssn: 'demographics',
  dateOfBirth: 'demographics',
  insuranceInfo: 'billing',
  
  // Communication data
  messageContent: 'communication',
  voiceRecording: 'communication',
  videoSession: 'communication'
};

// Sensitive fields that should be hashed for indexing
const INDEXABLE_FIELDS = {
  email: true,
  phone: true,
  lastName: true,
  licenseNumber: true
};

/**
 * Middleware to encrypt PHI data in request body
 */
function encryptPHIMiddleware(options = {}) {
  return async (req, res, next) => {
    try {
      if (!req.body) {
        return next();
      }

      const { excludeFields = [], includeFields = [] } = options;
      const encryptedData = {};
      const searchableHashes = {};
      
      // Get user ID for context
      const userId = req.user?.principal || req.body.principal || 'anonymous';
      
      for (const [field, value] of Object.entries(req.body)) {
        // Skip if field is excluded
        if (excludeFields.includes(field)) {
          continue;
        }
        
        // Check if field contains PHI
        const dataType = PHI_FIELDS[field];
        const shouldEncrypt = dataType || includeFields.includes(field);
        
        if (shouldEncrypt && value && value !== '') {
          try {
            // Store original PHI data encrypted
            const recordResult = await phiDataModel.storePHI(
              userId,
              dataType || 'general',
              { [field]: value },
              {
                requestId: req.headers['x-request-id'] || generateRequestId(),
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip,
                searchableFields: INDEXABLE_FIELDS[field] ? [field] : []
              }
            );
            
            // Replace with encrypted reference
            encryptedData[field] = {
              encrypted: true,
              recordId: recordResult.recordId,
              dataType: dataType || 'general',
              timestamp: recordResult.timestamp
            };
            
            // Create searchable hash if needed
            if (INDEXABLE_FIELDS[field]) {
              searchableHashes[`${field}_hash`] = phiEncryption.hashForIndexing(
                value.toString(),
                `search:${field}`
              );
            }
            
            console.log(`🔒 PHI field encrypted: ${field} for user ${userId.substring(0, 8)}...`);
          } catch (error) {
            console.error(`❌ Failed to encrypt PHI field ${field}:`, error);
            // Continue without encryption for non-critical fields
            if (dataType === 'medical_records' || dataType === 'mental_health') {
              return res.status(500).json({
                error: 'Failed to secure sensitive healthcare data',
                field: field
              });
            }
          }
        }
      }
      
      // Add encrypted data and hashes to request
      req.encryptedPHI = encryptedData;
      req.searchableHashes = searchableHashes;
      req.originalPHI = { ...req.body }; // Keep original for processing
      
      // Remove PHI from request body, replace with encrypted references
      for (const field of Object.keys(encryptedData)) {
        req.body[field] = encryptedData[field];
      }
      
      // Add searchable hashes
      Object.assign(req.body, searchableHashes);
      
      next();
    } catch (error) {
      console.error('❌ PHI encryption middleware error:', error);
      res.status(500).json({
        error: 'Failed to process sensitive data securely'
      });
    }
  };
}

/**
 * Middleware to decrypt PHI data in response
 */
function decryptPHIMiddleware(options = {}) {
  return async (req, res, next) => {
    try {
      // Store original json method
      const originalJson = res.json;
      
      // Override json method to decrypt PHI before sending
      res.json = async function(data) {
        try {
          const decryptedData = await decryptResponsePHI(data, req.user?.principal);
          return originalJson.call(this, decryptedData);
        } catch (error) {
          console.error('❌ Failed to decrypt PHI in response:', error);
          return originalJson.call(this, data); // Send without decryption
        }
      };
      
      next();
    } catch (error) {
      console.error('❌ PHI decryption middleware error:', error);
      next();
    }
  };
}

/**
 * Recursively decrypt PHI data in response objects
 */
async function decryptResponsePHI(data, requestorId) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return Promise.all(data.map(item => decryptResponsePHI(item, requestorId)));
  }
  
  const decrypted = { ...data };
  
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && value.encrypted && value.recordId) {
      try {
        // Decrypt PHI record
        const phiRecord = await phiDataModel.retrievePHI(
          value.recordId,
          requestorId,
          'api_response'
        );
        
        // Extract the original field value
        const originalField = key;
        if (phiRecord.data[originalField]) {
          decrypted[key] = phiRecord.data[originalField];
        } else {
          // If field name doesn't match, use the first value
          const firstValue = Object.values(phiRecord.data)[0];
          decrypted[key] = firstValue;
        }
      } catch (error) {
        console.error(`❌ Failed to decrypt PHI field ${key}:`, error);
        // Remove encrypted reference if decryption fails
        delete decrypted[key];
      }
    } else if (typeof value === 'object') {
      // Recursively decrypt nested objects
      decrypted[key] = await decryptResponsePHI(value, requestorId);
    }
  }
  
  return decrypted;
}

/**
 * Middleware for chat message encryption
 */
function encryptChatMessage() {
  return async (req, res, next) => {
    try {
      if (req.body.message || req.body.messageContent) {
        const message = req.body.message || req.body.messageContent;
        const userId = req.user?.principal || 'anonymous';
        const sessionId = req.body.sessionId || req.params.sessionId;
        
        // Encrypt chat message as mental health data
        const recordResult = await phiDataModel.storePHI(
          userId,
          'mental_health',
          {
            message: message,
            sessionId: sessionId,
            timestamp: new Date().toISOString()
          },
          {
            requestId: req.headers['x-request-id'] || generateRequestId(),
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            sessionContext: sessionId
          }
        );
        
        // Replace message with encrypted reference
        req.body.encryptedMessage = {
          encrypted: true,
          recordId: recordResult.recordId,
          dataType: 'mental_health',
          timestamp: recordResult.timestamp
        };
        
        // Keep original for processing but mark as encrypted
        req.originalMessage = message;
        req.body.message = '[ENCRYPTED]';
        req.body.messageContent = '[ENCRYPTED]';
        
        console.log(`🔒 Chat message encrypted for session ${sessionId}`);
      }
      
      next();
    } catch (error) {
      console.error('❌ Chat message encryption failed:', error);
      res.status(500).json({
        error: 'Failed to secure chat message'
      });
    }
  };
}

/**
 * Middleware for session notes encryption
 */
function encryptSessionNotes() {
  return async (req, res, next) => {
    try {
      const notesFields = ['notes', 'sessionNotes', 'treatmentNotes', 'progressNotes'];
      
      for (const field of notesFields) {
        if (req.body[field]) {
          const userId = req.user?.principal || 'anonymous';
          const patientId = req.body.patientId || req.params.patientId;
          
          // Encrypt session notes
          const recordResult = await phiDataModel.storePHI(
            patientId || userId,
            'mental_health',
            {
              [field]: req.body[field],
              therapistId: userId,
              sessionId: req.body.sessionId || req.params.sessionId,
              timestamp: new Date().toISOString()
            },
            {
              requestId: req.headers['x-request-id'] || generateRequestId(),
              userAgent: req.headers['user-agent'],
              ipAddress: req.ip,
              therapistId: userId
            }
          );
          
          // Replace with encrypted reference
          req.body[field] = {
            encrypted: true,
            recordId: recordResult.recordId,
            dataType: 'mental_health',
            timestamp: recordResult.timestamp
          };
          
          console.log(`🔒 Session notes encrypted: ${field}`);
        }
      }
      
      next();
    } catch (error) {
      console.error('❌ Session notes encryption failed:', error);
      res.status(500).json({
        error: 'Failed to secure session notes'
      });
    }
  };
}

/**
 * Audit PHI access for compliance
 */
function auditPHIAccess(action = 'access') {
  return (req, res, next) => {
    try {
      // Store original end method
      const originalEnd = res.end;
      
      // Override end method to log access
      res.end = function(chunk, encoding) {
        try {
          const userId = req.user?.principal || 'anonymous';
          const method = req.method;
          const path = req.path;
          const statusCode = res.statusCode;
          
          // Log PHI access
          console.log(`📋 PHI Access: ${action} - User: ${userId.substring(0, 8)}... - ${method} ${path} - Status: ${statusCode}`);
          
          // In production, send to audit service
          // auditService.logPHIAccess({
          //   action,
          //   userId,
          //   method,
          //   path,
          //   statusCode,
          //   timestamp: new Date().toISOString(),
          //   ipAddress: req.ip,
          //   userAgent: req.headers['user-agent']
          // });
        } catch (error) {
          console.error('❌ PHI audit logging failed:', error);
        }
        
        return originalEnd.call(this, chunk, encoding);
      };
      
      next();
    } catch (error) {
      console.error('❌ PHI audit middleware error:', error);
      next();
    }
  };
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Validate PHI access permissions
 */
function validatePHIAccess(requiredRole = null) {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          error: 'Authentication required for PHI access'
        });
      }
      
      // Check role-based access
      if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
        return res.status(403).json({
          error: 'Insufficient permissions for PHI access'
        });
      }
      
      // Add PHI access context
      req.phiAccess = {
        userId: user.principal,
        role: user.role,
        permissions: getPHIPermissions(user.role),
        timestamp: new Date().toISOString()
      };
      
      next();
    } catch (error) {
      console.error('❌ PHI access validation failed:', error);
      res.status(500).json({
        error: 'Failed to validate PHI access permissions'
      });
    }
  };
}

/**
 * Get PHI permissions based on user role
 */
function getPHIPermissions(role) {
  const permissions = {
    patient: {
      read: ['own_data'],
      write: ['own_data'],
      delete: ['own_data']
    },
    therapist: {
      read: ['assigned_patients', 'session_notes'],
      write: ['session_notes', 'treatment_plans'],
      delete: ['session_notes']
    },
    admin: {
      read: ['all_data'],
      write: ['all_data'],
      delete: ['all_data']
    }
  };
  
  return permissions[role] || permissions.patient;
}

module.exports = {
  encryptPHIMiddleware,
  decryptPHIMiddleware,
  encryptChatMessage,
  encryptSessionNotes,
  auditPHIAccess,
  validatePHIAccess,
  PHI_FIELDS,
  INDEXABLE_FIELDS
};