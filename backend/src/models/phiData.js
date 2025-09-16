const { phiEncryption } = require('../services/encryptionService');
const crypto = require('crypto');

/**
 * PHI (Protected Health Information) Data Model
 * Handles secure storage and retrieval of sensitive healthcare data
 */
class PHIDataModel {
  constructor() {
    this.dataStore = new Map(); // In production, use secure database
    this.indexStore = new Map(); // For searchable hashed indexes
    this.auditLog = [];
  }

  /**
   * Store PHI data with encryption
   */
  async storePHI(patientId, dataType, data, metadata = {}) {
    try {
      // Validate input
      if (!patientId || !dataType || !data) {
        throw new Error('Missing required parameters for PHI storage');
      }

      // Generate unique record ID
      const recordId = this.generateRecordId(patientId, dataType);
      
      // Encrypt the sensitive data
      const encryptedData = phiEncryption.encryptPHI(data, `phi:${dataType}`);
      
      // Create searchable hash for indexing (if needed)
      const searchableFields = metadata.searchableFields || [];
      const searchHashes = {};
      
      for (const field of searchableFields) {
        if (data[field]) {
          searchHashes[field] = phiEncryption.hashForIndexing(
            data[field].toString(),
            `index:${field}`
          );
        }
      }
      
      // Create PHI record
      const phiRecord = {
        recordId,
        patientId: phiEncryption.hashForIndexing(patientId, 'patient-id'),
        dataType,
        encryptedData,
        searchHashes,
        metadata: {
          ...metadata,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          accessCount: 0,
          dataClassification: this.classifyData(dataType),
          retentionPolicy: metadata.retentionPolicy || 'standard'
        },
        integrity: this.calculateIntegrity(encryptedData)
      };
      
      // Store encrypted record
      this.dataStore.set(recordId, phiRecord);
      
      // Update search indexes
      this.updateSearchIndexes(recordId, searchHashes);
      
      // Audit log
      this.logAccess('STORE', patientId, dataType, recordId);
      
      console.log(`✅ PHI data stored: ${dataType} for patient ${patientId.substring(0, 8)}...`);
      
      return {
        recordId,
        success: true,
        dataType,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to store PHI data:', error);
      this.logAccess('STORE_ERROR', patientId, dataType, null, error.message);
      throw new Error('Failed to store PHI data securely');
    }
  }

  /**
   * Retrieve and decrypt PHI data
   */
  async retrievePHI(recordId, requestorId, purpose = 'treatment') {
    try {
      // Validate access
      if (!recordId || !requestorId) {
        throw new Error('Missing required parameters for PHI retrieval');
      }

      // Get encrypted record
      const phiRecord = this.dataStore.get(recordId);
      if (!phiRecord) {
        throw new Error('PHI record not found');
      }
      
      // Verify data integrity
      if (!this.verifyIntegrity(phiRecord)) {
        throw new Error('PHI data integrity check failed');
      }
      
      // Decrypt the data
      const decryptedData = phiEncryption.decryptPHI(
        phiRecord.encryptedData,
        `phi:${phiRecord.dataType}`
      );
      
      // Update access metadata
      phiRecord.metadata.lastAccessed = new Date().toISOString();
      phiRecord.metadata.accessCount += 1;
      
      // Audit log
      this.logAccess('RETRIEVE', requestorId, phiRecord.dataType, recordId, purpose);
      
      console.log(`✅ PHI data retrieved: ${phiRecord.dataType} (${recordId})`);
      
      return {
        recordId,
        dataType: phiRecord.dataType,
        data: decryptedData,
        metadata: {
          createdAt: phiRecord.metadata.createdAt,
          lastAccessed: phiRecord.metadata.lastAccessed,
          accessCount: phiRecord.metadata.accessCount,
          dataClassification: phiRecord.metadata.dataClassification
        }
      };
    } catch (error) {
      console.error('❌ Failed to retrieve PHI data:', error);
      this.logAccess('RETRIEVE_ERROR', requestorId, 'unknown', recordId, error.message);
      throw new Error('Failed to retrieve PHI data');
    }
  }

  /**
   * Search PHI records by hashed indexes
   */
  async searchPHI(patientId, searchCriteria, requestorId) {
    try {
      const results = [];
      const patientHash = phiEncryption.hashForIndexing(patientId, 'patient-id');
      
      for (const [recordId, record] of this.dataStore) {
        // Check if record belongs to patient
        if (!phiEncryption.verifyHash(patientId, record.patientId)) {
          continue;
        }
        
        // Check search criteria against hashed indexes
        let matches = true;
        for (const [field, value] of Object.entries(searchCriteria)) {
          if (record.searchHashes[field]) {
            if (!phiEncryption.verifyHash(value.toString(), record.searchHashes[field])) {
              matches = false;
              break;
            }
          }
        }
        
        if (matches) {
          results.push({
            recordId,
            dataType: record.dataType,
            createdAt: record.metadata.createdAt,
            dataClassification: record.metadata.dataClassification
          });
        }
      }
      
      // Audit log
      this.logAccess('SEARCH', requestorId, 'multiple', null, `Found ${results.length} records`);
      
      return results;
    } catch (error) {
      console.error('❌ PHI search failed:', error);
      this.logAccess('SEARCH_ERROR', requestorId, 'multiple', null, error.message);
      throw new Error('Failed to search PHI records');
    }
  }

  /**
   * Delete PHI data (right to be forgotten)
   */
  async deletePHI(recordId, requestorId, reason = 'patient_request') {
    try {
      const phiRecord = this.dataStore.get(recordId);
      if (!phiRecord) {
        throw new Error('PHI record not found');
      }
      
      // Create deletion audit record
      const deletionRecord = {
        recordId,
        dataType: phiRecord.dataType,
        deletedAt: new Date().toISOString(),
        deletedBy: requestorId,
        reason,
        originalCreatedAt: phiRecord.metadata.createdAt,
        accessCount: phiRecord.metadata.accessCount
      };
      
      // Remove from data store
      this.dataStore.delete(recordId);
      
      // Remove from search indexes
      this.removeFromSearchIndexes(recordId);
      
      // Audit log
      this.logAccess('DELETE', requestorId, phiRecord.dataType, recordId, reason);
      
      console.log(`✅ PHI data deleted: ${recordId} (${reason})`);
      
      return {
        deleted: true,
        recordId,
        timestamp: deletionRecord.deletedAt,
        reason
      };
    } catch (error) {
      console.error('❌ Failed to delete PHI data:', error);
      this.logAccess('DELETE_ERROR', requestorId, 'unknown', recordId, error.message);
      throw new Error('Failed to delete PHI data');
    }
  }

  /**
   * Export patient data for portability (GDPR/HIPAA)
   */
  async exportPatientData(patientId, requestorId, format = 'json') {
    try {
      const exportData = {
        patientId,
        exportedAt: new Date().toISOString(),
        exportedBy: requestorId,
        format,
        records: []
      };
      
      // Find all records for patient
      for (const [recordId, record] of this.dataStore) {
        if (phiEncryption.verifyHash(patientId, record.patientId)) {
          // Decrypt and include in export
          const decryptedData = phiEncryption.decryptPHI(
            record.encryptedData,
            `phi:${record.dataType}`
          );
          
          exportData.records.push({
            recordId,
            dataType: record.dataType,
            data: decryptedData,
            createdAt: record.metadata.createdAt,
            lastAccessed: record.metadata.lastAccessed,
            accessCount: record.metadata.accessCount
          });
        }
      }
      
      // Audit log
      this.logAccess('EXPORT', requestorId, 'all', null, `Exported ${exportData.records.length} records`);
      
      return exportData;
    } catch (error) {
      console.error('❌ Failed to export patient data:', error);
      this.logAccess('EXPORT_ERROR', requestorId, 'all', null, error.message);
      throw new Error('Failed to export patient data');
    }
  }

  /**
   * Generate unique record ID
   */
  generateRecordId(patientId, dataType) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const hash = crypto.createHash('sha256')
      .update(`${patientId}:${dataType}:${timestamp}:${random}`)
      .digest('hex')
      .substring(0, 16);
    
    return `phi_${hash}_${timestamp}`;
  }

  /**
   * Classify data sensitivity level
   */
  classifyData(dataType) {
    const highSensitivity = ['medical_records', 'mental_health', 'genetic_data', 'substance_abuse'];
    const mediumSensitivity = ['demographics', 'insurance', 'billing'];
    
    if (highSensitivity.includes(dataType)) {
      return 'HIGH';
    } else if (mediumSensitivity.includes(dataType)) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  /**
   * Calculate data integrity hash
   */
  calculateIntegrity(encryptedData) {
    return crypto.createHash('sha256')
      .update(JSON.stringify(encryptedData))
      .digest('hex');
  }

  /**
   * Verify data integrity
   */
  verifyIntegrity(phiRecord) {
    const currentHash = this.calculateIntegrity(phiRecord.encryptedData);
    return currentHash === phiRecord.integrity;
  }

  /**
   * Update search indexes
   */
  updateSearchIndexes(recordId, searchHashes) {
    for (const [field, hashData] of Object.entries(searchHashes)) {
      const indexKey = `${field}:${hashData.hash}`;
      if (!this.indexStore.has(indexKey)) {
        this.indexStore.set(indexKey, new Set());
      }
      this.indexStore.get(indexKey).add(recordId);
    }
  }

  /**
   * Remove from search indexes
   */
  removeFromSearchIndexes(recordId) {
    for (const [indexKey, recordSet] of this.indexStore) {
      recordSet.delete(recordId);
      if (recordSet.size === 0) {
        this.indexStore.delete(indexKey);
      }
    }
  }

  /**
   * Log access for audit trail
   */
  logAccess(action, userId, dataType, recordId, details = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId: userId ? phiEncryption.hashForIndexing(userId, 'audit-user') : null,
      dataType,
      recordId,
      details,
      ipAddress: null, // Should be populated from request context
      userAgent: null  // Should be populated from request context
    };
    
    this.auditLog.push(logEntry);
    
    // Keep audit log size manageable (in production, use persistent storage)
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-5000);
    }
  }

  /**
   * Get audit trail for compliance
   */
  getAuditTrail(startDate, endDate, userId = null) {
    let filteredLogs = this.auditLog;
    
    if (startDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= new Date(endDate)
      );
    }
    
    if (userId) {
      const userHash = phiEncryption.hashForIndexing(userId, 'audit-user');
      filteredLogs = filteredLogs.filter(log => 
        log.userId && phiEncryption.verifyHash(userId, log.userId)
      );
    }
    
    return filteredLogs;
  }

  /**
   * Get PHI storage statistics
   */
  getStorageStats() {
    const stats = {
      totalRecords: this.dataStore.size,
      totalIndexes: this.indexStore.size,
      auditLogEntries: this.auditLog.length,
      dataTypes: {},
      classifications: { HIGH: 0, MEDIUM: 0, LOW: 0 }
    };
    
    for (const record of this.dataStore.values()) {
      // Count by data type
      stats.dataTypes[record.dataType] = (stats.dataTypes[record.dataType] || 0) + 1;
      
      // Count by classification
      const classification = record.metadata.dataClassification;
      if (stats.classifications[classification] !== undefined) {
        stats.classifications[classification]++;
      }
    }
    
    return stats;
  }
}

// Export singleton instance
const phiDataModel = new PHIDataModel();

module.exports = {
  PHIDataModel,
  phiDataModel
};