const crypto = require('crypto');
const { encryptionService } = require('./encryptionService');
const { icService } = require('./icService');

/**
 * Audit Service for HIPAA/GDPR Compliance
 * Provides tamper-resistant logging for security events
 */
class AuditService {
  constructor() {
    this.logBuffer = [];
    this.bufferSize = 100;
    this.flushInterval = 30000; // 30 seconds
    this.hashChain = null;
    this.sequenceNumber = 0;
    
    // Start periodic flush
    this.startPeriodicFlush();
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(eventData) {
    const auditEntry = {
      eventType: 'AUTHENTICATION',
      subType: eventData.action, // LOGIN, LOGOUT, LOGIN_FAILED, TOKEN_REFRESH
      userId: eventData.userId,
      sessionId: eventData.sessionId,
      ipAddress: eventData.ipAddress,
      userAgent: eventData.userAgent,
      timestamp: new Date().toISOString(),
      success: eventData.success,
      failureReason: eventData.failureReason,
      tokenType: eventData.tokenType,
      metadata: {
        loginMethod: eventData.loginMethod,
        deviceFingerprint: eventData.deviceFingerprint,
        location: eventData.location,
        riskScore: eventData.riskScore
      }
    };

    await this.createAuditLog(auditEntry);
  }

  /**
   * Log session management events
   */
  async logSessionEvent(eventData) {
    const auditEntry = {
      eventType: 'SESSION_MANAGEMENT',
      subType: eventData.action, // SESSION_START, SESSION_END, SESSION_TIMEOUT, SESSION_INVALIDATE
      userId: eventData.userId,
      sessionId: eventData.sessionId,
      ipAddress: eventData.ipAddress,
      timestamp: new Date().toISOString(),
      sessionDuration: eventData.sessionDuration,
      metadata: {
        sessionType: eventData.sessionType, // therapy, consultation, emergency
        endReason: eventData.endReason,
        participantCount: eventData.participantCount,
        dataTransferred: eventData.dataTransferred
      }
    };

    await this.createAuditLog(auditEntry);
  }

  /**
   * Log PHI access events
   */
  async logPHIAccess(eventData) {
    const auditEntry = {
      eventType: 'PHI_ACCESS',
      subType: eventData.action, // READ, WRITE, UPDATE, DELETE, EXPORT
      userId: eventData.userId,
      patientId: eventData.patientId,
      resourceType: eventData.resourceType, // medical_record, chat_message, session_notes
      resourceId: eventData.resourceId,
      ipAddress: eventData.ipAddress,
      timestamp: new Date().toISOString(),
      success: eventData.success,
      metadata: {
        accessReason: eventData.accessReason,
        dataClassification: eventData.dataClassification,
        encryptionStatus: eventData.encryptionStatus,
        consentId: eventData.consentId,
        auditTrail: eventData.auditTrail
      }
    };

    await this.createAuditLog(auditEntry);
  }

  /**
   * Log consent events
   */
  async logConsentEvent(eventData) {
    const auditEntry = {
      eventType: 'CONSENT_MANAGEMENT',
      subType: eventData.action, // CONSENT_GIVEN, CONSENT_WITHDRAWN, CONSENT_UPDATED, CONSENT_EXPIRED
      userId: eventData.userId,
      consentId: eventData.consentId,
      consentType: eventData.consentType,
      ipAddress: eventData.ipAddress,
      timestamp: new Date().toISOString(),
      metadata: {
        consentVersion: eventData.consentVersion,
        previousConsentId: eventData.previousConsentId,
        expirationDate: eventData.expirationDate,
        withdrawalReason: eventData.withdrawalReason,
        legalBasis: eventData.legalBasis
      }
    };

    await this.createAuditLog(auditEntry);
  }

  /**
   * Log data operations (GDPR compliance)
   */
  async logDataOperation(eventData) {
    const auditEntry = {
      eventType: 'DATA_OPERATION',
      subType: eventData.action, // DATA_EXPORT, DATA_DELETE, DATA_ANONYMIZE, DATA_TRANSFER
      userId: eventData.userId,
      dataSubject: eventData.dataSubject,
      ipAddress: eventData.ipAddress,
      timestamp: new Date().toISOString(),
      success: eventData.success,
      metadata: {
        dataTypes: eventData.dataTypes,
        recordCount: eventData.recordCount,
        requestId: eventData.requestId,
        legalBasis: eventData.legalBasis,
        retentionPeriod: eventData.retentionPeriod,
        deletionMethod: eventData.deletionMethod
      }
    };

    await this.createAuditLog(auditEntry);
  }

  /**
   * Log security events
   */
  async logSecurityEvent(eventData) {
    const auditEntry = {
      eventType: 'SECURITY',
      subType: eventData.action, // SUSPICIOUS_ACTIVITY, BREACH_ATTEMPT, RATE_LIMIT_EXCEEDED, UNAUTHORIZED_ACCESS
      userId: eventData.userId,
      ipAddress: eventData.ipAddress,
      timestamp: new Date().toISOString(),
      severity: eventData.severity, // LOW, MEDIUM, HIGH, CRITICAL
      metadata: {
        threatType: eventData.threatType,
        attackVector: eventData.attackVector,
        blockedRequests: eventData.blockedRequests,
        riskScore: eventData.riskScore,
        mitigationActions: eventData.mitigationActions
      }
    };

    await this.createAuditLog(auditEntry);
  }

  /**
   * Log system events
   */
  async logSystemEvent(eventData) {
    const auditEntry = {
      eventType: 'SYSTEM',
      subType: eventData.action, // BACKUP_CREATED, SYSTEM_UPDATE, CONFIG_CHANGE, SERVICE_START, SERVICE_STOP
      adminId: eventData.adminId,
      timestamp: new Date().toISOString(),
      success: eventData.success,
      metadata: {
        component: eventData.component,
        version: eventData.version,
        configChanges: eventData.configChanges,
        backupLocation: eventData.backupLocation,
        affectedUsers: eventData.affectedUsers
      }
    };

    await this.createAuditLog(auditEntry);
  }

  /**
   * Create tamper-resistant audit log entry
   */
  async createAuditLog(auditEntry) {
    try {
      // Add sequence number and hash chain
      this.sequenceNumber++;
      auditEntry.sequenceNumber = this.sequenceNumber;
      auditEntry.id = crypto.randomUUID();
      
      // Create hash of entry content
      const entryContent = JSON.stringify({
        ...auditEntry,
        previousHash: this.hashChain
      });
      
      const entryHash = crypto.createHash('sha256')
        .update(entryContent)
        .digest('hex');
      
      auditEntry.entryHash = entryHash;
      auditEntry.previousHash = this.hashChain;
      this.hashChain = entryHash;

      // Encrypt sensitive data
      const encryptedEntry = await this.encryptAuditEntry(auditEntry);
      
      // Add to buffer
      this.logBuffer.push(encryptedEntry);
      
      // Flush if buffer is full
      if (this.logBuffer.length >= this.bufferSize) {
        await this.flushLogs();
      }

      // Log to console for immediate visibility (in development)
      console.log(`📋 Audit Log: ${auditEntry.eventType}/${auditEntry.subType} - User: ${auditEntry.userId?.substring(0, 8) || 'N/A'}... - ${auditEntry.timestamp}`);
      
      return auditEntry.id;
    } catch (error) {
      console.error('❌ Failed to create audit log:', error);
      // In production, this should trigger an alert
      throw error;
    }
  }

  /**
   * Encrypt audit entry for storage
   */
  async encryptAuditEntry(entry) {
    try {
      // Separate sensitive and non-sensitive data
      const sensitiveFields = ['userId', 'patientId', 'sessionId', 'ipAddress', 'userAgent'];
      const encryptedEntry = { ...entry };
      
      for (const field of sensitiveFields) {
        if (entry[field]) {
          encryptedEntry[field] = await encryptionService.encryptForTransmission(entry[field]);
        }
      }
      
      // Encrypt metadata if it contains sensitive information
      if (entry.metadata) {
        encryptedEntry.metadata = await encryptionService.encryptForTransmission(
          JSON.stringify(entry.metadata)
        );
      }
      
      return encryptedEntry;
    } catch (error) {
      console.error('❌ Failed to encrypt audit entry:', error);
      throw error;
    }
  }

  /**
   * Flush logs to permanent storage (IC canister)
   */
  async flushLogs() {
    if (this.logBuffer.length === 0) return;
    
    try {
      const logsToFlush = [...this.logBuffer];
      this.logBuffer = [];
      
      // Store in IC canister for tamper-resistant storage
      await icService.storeAuditLogs(logsToFlush);
      
      console.log(`📋 Flushed ${logsToFlush.length} audit logs to IC canister`);
    } catch (error) {
      console.error('❌ Failed to flush audit logs:', error);
      // Re-add logs to buffer for retry
      this.logBuffer.unshift(...this.logBuffer);
      throw error;
    }
  }

  /**
   * Start periodic log flushing
   */
  startPeriodicFlush() {
    setInterval(async () => {
      try {
        await this.flushLogs();
      } catch (error) {
        console.error('❌ Periodic flush failed:', error);
      }
    }, this.flushInterval);
  }

  /**
   * Query audit logs (for compliance reporting)
   */
  async queryAuditLogs(filters) {
    try {
      const query = {
        eventType: filters.eventType,
        userId: filters.userId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: filters.limit || 100,
        offset: filters.offset || 0
      };
      
      const encryptedLogs = await icService.queryAuditLogs(query);
      
      // Decrypt logs for authorized access
      const decryptedLogs = [];
      for (const log of encryptedLogs) {
        const decryptedLog = await this.decryptAuditEntry(log);
        decryptedLogs.push(decryptedLog);
      }
      
      return decryptedLogs;
    } catch (error) {
      console.error('❌ Failed to query audit logs:', error);
      throw error;
    }
  }

  /**
   * Decrypt audit entry for authorized access
   */
  async decryptAuditEntry(encryptedEntry) {
    try {
      const decryptedEntry = { ...encryptedEntry };
      
      const sensitiveFields = ['userId', 'patientId', 'sessionId', 'ipAddress', 'userAgent'];
      
      for (const field of sensitiveFields) {
        if (encryptedEntry[field]) {
          decryptedEntry[field] = await encryptionService.decryptFromTransmission(encryptedEntry[field]);
        }
      }
      
      if (encryptedEntry.metadata && typeof encryptedEntry.metadata === 'string') {
        const decryptedMetadata = await encryptionService.decryptFromTransmission(encryptedEntry.metadata);
        decryptedEntry.metadata = JSON.parse(decryptedMetadata);
      }
      
      return decryptedEntry;
    } catch (error) {
      console.error('❌ Failed to decrypt audit entry:', error);
      throw error;
    }
  }

  /**
   * Verify audit log integrity
   */
  async verifyLogIntegrity(logs) {
    try {
      let previousHash = null;
      const verificationResults = [];
      
      for (const log of logs) {
        const decryptedLog = await this.decryptAuditEntry(log);
        
        // Verify hash chain
        if (decryptedLog.previousHash !== previousHash) {
          verificationResults.push({
            logId: decryptedLog.id,
            valid: false,
            reason: 'Hash chain broken'
          });
        } else {
          // Verify entry hash
          const entryContent = JSON.stringify({
            ...decryptedLog,
            entryHash: undefined // Exclude hash from verification
          });
          
          const calculatedHash = crypto.createHash('sha256')
            .update(entryContent)
            .digest('hex');
          
          const valid = calculatedHash === decryptedLog.entryHash;
          
          verificationResults.push({
            logId: decryptedLog.id,
            valid,
            reason: valid ? 'Valid' : 'Hash mismatch'
          });
        }
        
        previousHash = decryptedLog.entryHash;
      }
      
      return verificationResults;
    } catch (error) {
      console.error('❌ Failed to verify log integrity:', error);
      throw error;
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(startDate, endDate, reportType = 'HIPAA') {
    try {
      const filters = {
        startDate,
        endDate,
        limit: 10000
      };
      
      const logs = await this.queryAuditLogs(filters);
      
      const report = {
        reportType,
        generatedAt: new Date().toISOString(),
        period: { startDate, endDate },
        totalEvents: logs.length,
        eventSummary: {},
        securityEvents: [],
        phiAccessEvents: [],
        consentEvents: [],
        integrityVerification: await this.verifyLogIntegrity(logs)
      };
      
      // Categorize events
      for (const log of logs) {
        const eventKey = `${log.eventType}/${log.subType}`;
        report.eventSummary[eventKey] = (report.eventSummary[eventKey] || 0) + 1;
        
        if (log.eventType === 'SECURITY') {
          report.securityEvents.push(log);
        } else if (log.eventType === 'PHI_ACCESS') {
          report.phiAccessEvents.push(log);
        } else if (log.eventType === 'CONSENT_MANAGEMENT') {
          report.consentEvents.push(log);
        }
      }
      
      return report;
    } catch (error) {
      console.error('❌ Failed to generate compliance report:', error);
      throw error;
    }
  }

  /**
   * Emergency log flush (for critical events)
   */
  async emergencyFlush() {
    try {
      await this.flushLogs();
      console.log('🚨 Emergency audit log flush completed');
    } catch (error) {
      console.error('❌ Emergency flush failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const auditService = new AuditService();

module.exports = {
  auditService,
  AuditService
};