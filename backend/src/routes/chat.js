const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/inputSanitizer');
const { 
  encryptChatMessage, 
  encryptSessionNotes, 
  decryptPHIMiddleware, 
  auditPHIAccess, 
  validatePHIAccess 
} = require('../middleware/phiProtection');
const { validateOperationConsent, checkConsentExpiration, addConsentHeaders } = require('../middleware/consentValidation');
const { icIntegration } = require('../services/icIntegration');
const { phiDataModel } = require('../models/phiData');

const router = express.Router();

// Rate limiting for chat endpoints
const rateLimit = require('express-rate-limit');
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many chat requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Send chat message with PHI encryption
router.post('/message', [
  auth,
  chatLimiter,
  sanitizeInput,
  validatePHIAccess(),
  ...validateOperationConsent('chat_message'),
  
  // Validation
  body('message').isString().isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
  body('sessionId').isString().notEmpty().withMessage('Session ID is required'),
  body('recipientId').optional().isString().withMessage('Recipient ID must be a string'),
  body('messageType').optional().isIn(['text', 'voice', 'image']).withMessage('Invalid message type'),
  
  // PHI encryption for chat messages
  encryptChatMessage(),
  auditPHIAccess('chat_message'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { sessionId, recipientId, messageType = 'text', encryptedMessage } = req.body;
    const senderId = req.user.principal;
    const senderRole = req.user.role;
    
    // Verify session access
    const hasAccess = await verifySessionAccess(senderId, sessionId, senderRole);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied to this therapy session'
      });
    }

    // Create message record
    const messageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      sessionId,
      senderId,
      recipientId: recipientId || 'system',
      messageType,
      encryptedContent: encryptedMessage,
      timestamp: new Date().toISOString(),
      isEncrypted: true
    };

    // Store in IC canister
    try {
      const icResult = await icIntegration.logChatInteraction(
        sessionId,
        '[ENCRYPTED_MESSAGE]', // Don't store actual content in IC
        messageType
      );
      
      if (icResult.success) {
        messageData.icInteractionId = icResult.data;
      }
    } catch (icError) {
      console.error('❌ Failed to log to IC canister:', icError);
      // Continue without IC logging
    }

    res.status(201).json({
      success: true,
      message: 'Chat message sent successfully',
      data: {
        messageId: messageData.id,
        sessionId: messageData.sessionId,
        timestamp: messageData.timestamp,
        encrypted: true
      }
    });

  } catch (error) {
    console.error('❌ Chat message error:', error);
    res.status(500).json({
      error: 'Failed to send chat message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get chat history with PHI decryption
router.get('/history/:sessionId', [
  auth,
  validatePHIAccess(),
  decryptPHIMiddleware(),
  auditPHIAccess('chat_history'),
], async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.principal;
    const userRole = req.user.role;
    const { limit = 50, offset = 0 } = req.query;

    // Verify session access
    const hasAccess = await verifySessionAccess(userId, sessionId, userRole);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied to this therapy session'
      });
    }

    // Retrieve encrypted messages for this session
    const messages = await phiDataModel.searchPHI(
      userId,
      'mental_health',
      { sessionId },
      {
        limit: parseInt(limit),
        offset: parseInt(offset),
        sortBy: 'timestamp',
        sortOrder: 'desc'
      }
    );

    // Messages will be automatically decrypted by decryptPHIMiddleware
    res.json({
      success: true,
      data: {
        messages: messages.records,
        pagination: {
          total: messages.total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: messages.total > (parseInt(offset) + parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('❌ Chat history error:', error);
    res.status(500).json({
      error: 'Failed to retrieve chat history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create therapy session
router.post('/session', [
  auth,
  sanitizeInput,
  validatePHIAccess('therapist'),
  
  // Validation
  body('patientId').isString().notEmpty().withMessage('Patient ID is required'),
  body('sessionType').isIn(['individual', 'group', 'crisis', 'consultation']).withMessage('Invalid session type'),
  body('scheduledTime').isISO8601().withMessage('Valid scheduled time is required'),
  body('duration').isInt({ min: 15, max: 180 }).withMessage('Duration must be between 15 and 180 minutes'),
  body('notes').optional().isString().isLength({ max: 5000 }).withMessage('Notes must not exceed 5000 characters'),
  
  auditPHIAccess('create_session'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { patientId, sessionType, scheduledTime, duration, notes } = req.body;
    const therapistId = req.user.principal;
    
    // Verify therapist can create sessions for this patient
    const canCreateSession = await verifyTherapistPatientRelation(therapistId, patientId);
    if (!canCreateSession) {
      return res.status(403).json({
        error: 'Not authorized to create sessions for this patient'
      });
    }

    // Create session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const sessionData = {
      id: sessionId,
      patientId,
      therapistId,
      sessionType,
      scheduledTime,
      duration,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    // Encrypt session notes if provided
    if (notes) {
      const notesResult = await phiDataModel.storePHI(
        patientId,
        'mental_health',
        {
          sessionNotes: notes,
          sessionId,
          therapistId,
          noteType: 'initial_session_notes'
        },
        {
          requestId: req.headers['x-request-id'] || `req_${Date.now()}`,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
          sessionContext: sessionId
        }
      );
      
      sessionData.encryptedNotes = {
        encrypted: true,
        recordId: notesResult.recordId,
        dataType: 'mental_health',
        timestamp: notesResult.timestamp
      };
    }

    // Store in IC canister
    try {
      const icResult = await icIntegration.createTherapyConversation(
        patientId,
        sessionId
      );
      
      if (icResult.success) {
        sessionData.icConversationId = icResult.data;
      }
    } catch (icError) {
      console.error('❌ Failed to create IC conversation:', icError);
      // Continue without IC integration
    }

    res.status(201).json({
      success: true,
      message: 'Therapy session created successfully',
      data: sessionData
    });

  } catch (error) {
    console.error('❌ Session creation error:', error);
    res.status(500).json({
      error: 'Failed to create therapy session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add session notes with PHI encryption
router.post('/session/:sessionId/notes', [
  auth,
  sanitizeInput,
  validatePHIAccess('therapist'),
  ...validateOperationConsent('session_notes'),
  
  // Validation
  body('notes').isString().isLength({ min: 1, max: 10000 }).withMessage('Notes must be between 1 and 10000 characters'),
  body('noteType').optional().isIn(['progress', 'treatment_plan', 'assessment', 'discharge']).withMessage('Invalid note type'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean'),
  
  // PHI encryption for session notes
  encryptSessionNotes(),
  auditPHIAccess('session_notes'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { sessionId } = req.params;
    const { noteType = 'progress', isPrivate = false } = req.body;
    const therapistId = req.user.principal;
    
    // Verify therapist has access to this session
    const hasAccess = await verifySessionAccess(therapistId, sessionId, 'therapist');
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied to this therapy session'
      });
    }

    // Notes are already encrypted by encryptSessionNotes middleware
    const noteData = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      sessionId,
      therapistId,
      noteType,
      isPrivate,
      encryptedNotes: req.body.notes, // This is now encrypted
      timestamp: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Session notes added successfully',
      data: {
        noteId: noteData.id,
        sessionId: noteData.sessionId,
        noteType: noteData.noteType,
        timestamp: noteData.timestamp,
        encrypted: true
      }
    });

  } catch (error) {
    console.error('❌ Session notes error:', error);
    res.status(500).json({
      error: 'Failed to add session notes',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get session notes with PHI decryption
router.get('/session/:sessionId/notes', [
  auth,
  validatePHIAccess(),
  decryptPHIMiddleware(),
  auditPHIAccess('view_session_notes'),
], async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.principal;
    const userRole = req.user.role;

    // Verify access to session
    const hasAccess = await verifySessionAccess(userId, sessionId, userRole);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied to this therapy session'
      });
    }

    // Retrieve encrypted session notes
    const notes = await phiDataModel.searchPHI(
      userId,
      'mental_health',
      { sessionId, noteType: { $exists: true } },
      {
        sortBy: 'timestamp',
        sortOrder: 'desc'
      }
    );

    // Filter private notes for non-therapists
    let filteredNotes = notes.records;
    if (userRole !== 'therapist' && userRole !== 'admin') {
      filteredNotes = notes.records.filter(note => !note.isPrivate);
    }

    res.json({
      success: true,
      data: {
        notes: filteredNotes,
        total: filteredNotes.length
      }
    });

  } catch (error) {
    console.error('❌ Session notes retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve session notes',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Emergency session endpoint
router.post('/emergency-session', [
  auth,
  sanitizeInput,
  validatePHIAccess(),
  ...validateOperationConsent('emergency_session'),
  
  // Validation
  body('urgencyLevel').isIn(['high', 'critical']).withMessage('Emergency sessions require high or critical urgency'),
  body('description').isString().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('contactNumber').optional().isMobilePhone().withMessage('Valid contact number required'),
  
  encryptPHIMiddleware({
    includeFields: ['description', 'contactNumber']
  }),
  auditPHIAccess('emergency_session'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { urgencyLevel, encryptedPHI } = req;
    const userId = req.user.principal;
    
    // Create emergency session
    const emergencySessionId = `emergency_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const emergencyData = {
      id: emergencySessionId,
      userId,
      urgencyLevel,
      status: 'pending',
      encryptedDescription: encryptedPHI.description,
      encryptedContact: encryptedPHI.contactNumber,
      createdAt: new Date().toISOString(),
      estimatedResponseTime: urgencyLevel === 'critical' ? '5 minutes' : '15 minutes'
    };

    // Notify emergency response team
    // In production, this would trigger real emergency protocols
    console.log(`🚨 EMERGENCY SESSION CREATED: ${emergencySessionId} - Level: ${urgencyLevel}`);

    res.status(201).json({
      success: true,
      message: 'Emergency session created successfully',
      data: {
        sessionId: emergencyData.id,
        urgencyLevel: emergencyData.urgencyLevel,
        status: emergencyData.status,
        estimatedResponseTime: emergencyData.estimatedResponseTime,
        emergencyHotline: '988', // National Suicide Prevention Lifeline
        crisisText: 'Text HOME to 741741'
      }
    });

  } catch (error) {
    console.error('❌ Emergency session error:', error);
    res.status(500).json({
      error: 'Failed to create emergency session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper functions

/**
 * Verify user has access to a therapy session
 */
async function verifySessionAccess(userId, sessionId, userRole) {
  try {
    // In production, this would check the database
    // For now, we'll implement basic role-based access
    
    if (userRole === 'admin') {
      return true;
    }
    
    if (userRole === 'therapist') {
      // Therapists can access sessions they created or are assigned to
      return true; // Simplified for demo
    }
    
    if (userRole === 'patient') {
      // Patients can only access their own sessions
      return true; // Simplified for demo
    }
    
    return false;
  } catch (error) {
    console.error('❌ Session access verification failed:', error);
    return false;
  }
}

/**
 * Verify therapist-patient relationship
 */
async function verifyTherapistPatientRelation(therapistId, patientId) {
  try {
    // In production, this would check the database for active therapeutic relationships
    // For now, we'll allow all verified therapists to create sessions
    return true; // Simplified for demo
  } catch (error) {
    console.error('❌ Therapist-patient relation verification failed:', error);
    return false;
  }
}

module.exports = router;