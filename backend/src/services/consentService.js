const { phiEncryption } = require('./encryptionService');
const { phiDataModel } = require('../models/phiData');

/**
 * User Consent Management Service
 * Handles HIPAA/GDPR compliant consent tracking and management
 */

class ConsentService {
  constructor() {
    this.consentTypes = {
      PHI_STORAGE: {
        id: 'phi_storage',
        name: 'Protected Health Information Storage',
        description: 'Consent to store and process your protected health information including medical history, therapy notes, and treatment records.',
        required: true,
        category: 'essential',
        legalBasis: 'HIPAA Authorization, GDPR Article 6(1)(a) - Consent'
      },
      DATA_PROCESSING: {
        id: 'data_processing',
        name: 'Personal Data Processing',
        description: 'Consent to process your personal data for providing mental health services, appointment scheduling, and communication.',
        required: true,
        category: 'essential',
        legalBasis: 'GDPR Article 6(1)(a) - Consent'
      },
      THERAPY_RECORDING: {
        id: 'therapy_recording',
        name: 'Therapy Session Recording',
        description: 'Consent to record therapy sessions for quality assurance and treatment continuity purposes.',
        required: false,
        category: 'optional',
        legalBasis: 'HIPAA Authorization, GDPR Article 6(1)(a) - Consent'
      },
      RESEARCH_PARTICIPATION: {
        id: 'research_participation',
        name: 'Research Participation',
        description: 'Consent to use anonymized data for mental health research and service improvement.',
        required: false,
        category: 'optional',
        legalBasis: 'GDPR Article 6(1)(a) - Consent'
      },
      MARKETING_COMMUNICATIONS: {
        id: 'marketing_communications',
        name: 'Marketing Communications',
        description: 'Consent to receive marketing communications about new services and features.',
        required: false,
        category: 'marketing',
        legalBasis: 'GDPR Article 6(1)(a) - Consent'
      },
      DATA_SHARING_PROVIDERS: {
        id: 'data_sharing_providers',
        name: 'Data Sharing with Healthcare Providers',
        description: 'Consent to share relevant health information with your other healthcare providers for coordinated care.',
        required: false,
        category: 'optional',
        legalBasis: 'HIPAA Authorization, GDPR Article 6(1)(a) - Consent'
      },
      EMERGENCY_CONTACT: {
        id: 'emergency_contact',
        name: 'Emergency Contact Authorization',
        description: 'Consent to contact designated emergency contacts in case of mental health crisis or safety concerns.',
        required: false,
        category: 'safety',
        legalBasis: 'HIPAA Authorization, GDPR Article 6(1)(f) - Legitimate Interest'
      },
      AI_ANALYSIS: {
        id: 'ai_analysis',
        name: 'AI-Assisted Analysis',
        description: 'Consent to use AI tools for analyzing therapy sessions and providing personalized treatment recommendations.',
        required: false,
        category: 'optional',
        legalBasis: 'GDPR Article 6(1)(a) - Consent'
      }
    };
  }

  /**
   * Create consent record for a user
   */
  async createConsentRecord(userId, consentData, metadata = {}) {
    try {
      const consentId = `consent_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Validate consent data
      const validationResult = this.validateConsentData(consentData);
      if (!validationResult.isValid) {
        throw new Error(`Invalid consent data: ${validationResult.errors.join(', ')}`);
      }

      // Check for required consents
      const missingRequired = this.checkRequiredConsents(consentData);
      if (missingRequired.length > 0) {
        throw new Error(`Missing required consents: ${missingRequired.join(', ')}`);
      }

      // Create consent record
      const consentRecord = {
        id: consentId,
        userId,
        consents: consentData,
        timestamp: new Date().toISOString(),
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        version: '1.0',
        method: metadata.method || 'web_form',
        sessionId: metadata.sessionId,
        witnessId: metadata.witnessId, // For verbal consents
        documentVersion: this.getCurrentPolicyVersion(),
        expirationDate: this.calculateExpirationDate(consentData),
        status: 'active'
      };

      // Encrypt and store consent record
      const encryptedRecord = await phiDataModel.storePHI(
        userId,
        'consent_record',
        consentRecord,
        {
          requestId: metadata.requestId || `consent_${Date.now()}`,
          userAgent: metadata.userAgent,
          ipAddress: metadata.ipAddress,
          auditCategory: 'consent_management'
        }
      );

      // Log consent creation
      console.log(`✅ Consent record created: ${consentId} for user ${userId.substring(0, 8)}...`);
      
      return {
        success: true,
        consentId,
        recordId: encryptedRecord.recordId,
        timestamp: consentRecord.timestamp,
        expirationDate: consentRecord.expirationDate,
        consentsGranted: Object.keys(consentData).filter(key => consentData[key].granted)
      };

    } catch (error) {
      console.error('❌ Failed to create consent record:', error);
      throw error;
    }
  }

  /**
   * Update existing consent
   */
  async updateConsent(userId, consentType, granted, metadata = {}) {
    try {
      // Get current consent record
      const currentConsent = await this.getCurrentConsent(userId);
      if (!currentConsent) {
        throw new Error('No existing consent record found');
      }

      // Create updated consent data
      const updatedConsents = {
        ...currentConsent.consents,
        [consentType]: {
          granted,
          timestamp: new Date().toISOString(),
          method: metadata.method || 'web_form',
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          previousValue: currentConsent.consents[consentType]?.granted || false
        }
      };

      // Create new consent record (maintaining audit trail)
      const updateResult = await this.createConsentRecord(userId, updatedConsents, {
        ...metadata,
        previousConsentId: currentConsent.id,
        updateType: 'consent_modification'
      });

      // Mark previous record as superseded
      await this.markConsentSuperseded(currentConsent.recordId, updateResult.recordId);

      console.log(`🔄 Consent updated: ${consentType} = ${granted} for user ${userId.substring(0, 8)}...`);
      
      return updateResult;

    } catch (error) {
      console.error('❌ Failed to update consent:', error);
      throw error;
    }
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(userId, consentType, reason, metadata = {}) {
    try {
      if (this.consentTypes[consentType]?.required) {
        throw new Error(`Cannot withdraw required consent: ${consentType}`);
      }

      const withdrawalRecord = {
        userId,
        consentType,
        action: 'withdrawal',
        reason,
        timestamp: new Date().toISOString(),
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        method: metadata.method || 'web_form',
        effectiveDate: metadata.effectiveDate || new Date().toISOString()
      };

      // Store withdrawal record
      const withdrawalResult = await phiDataModel.storePHI(
        userId,
        'consent_withdrawal',
        withdrawalRecord,
        {
          requestId: metadata.requestId || `withdrawal_${Date.now()}`,
          userAgent: metadata.userAgent,
          ipAddress: metadata.ipAddress,
          auditCategory: 'consent_withdrawal'
        }
      );

      // Update current consent
      await this.updateConsent(userId, consentType, false, {
        ...metadata,
        method: 'withdrawal',
        withdrawalId: withdrawalResult.recordId
      });

      console.log(`❌ Consent withdrawn: ${consentType} for user ${userId.substring(0, 8)}...`);
      
      return {
        success: true,
        withdrawalId: withdrawalResult.recordId,
        consentType,
        effectiveDate: withdrawalRecord.effectiveDate
      };

    } catch (error) {
      console.error('❌ Failed to withdraw consent:', error);
      throw error;
    }
  }

  /**
   * Get current consent status for user
   */
  async getCurrentConsent(userId) {
    try {
      const consentRecords = await phiDataModel.searchPHI(
        userId,
        'consent_record',
        { userId, status: 'active' },
        {
          sortBy: 'timestamp',
          sortOrder: 'desc',
          limit: 1
        }
      );

      if (consentRecords.records.length === 0) {
        return null;
      }

      return consentRecords.records[0];

    } catch (error) {
      console.error('❌ Failed to get current consent:', error);
      throw error;
    }
  }

  /**
   * Check if user has granted specific consent
   */
  async hasConsent(userId, consentType) {
    try {
      const currentConsent = await this.getCurrentConsent(userId);
      
      if (!currentConsent) {
        return false;
      }

      const consent = currentConsent.consents[consentType];
      return consent && consent.granted === true;

    } catch (error) {
      console.error('❌ Failed to check consent:', error);
      return false;
    }
  }

  /**
   * Get consent history for user
   */
  async getConsentHistory(userId, options = {}) {
    try {
      const { limit = 50, offset = 0, consentType } = options;
      
      let searchCriteria = { userId };
      if (consentType) {
        searchCriteria[`consents.${consentType}`] = { $exists: true };
      }

      const history = await phiDataModel.searchPHI(
        userId,
        'consent_record',
        searchCriteria,
        {
          sortBy: 'timestamp',
          sortOrder: 'desc',
          limit,
          offset
        }
      );

      return {
        records: history.records,
        total: history.total,
        pagination: {
          limit,
          offset,
          hasMore: history.total > (offset + limit)
        }
      };

    } catch (error) {
      console.error('❌ Failed to get consent history:', error);
      throw error;
    }
  }

  /**
   * Generate consent form data
   */
  generateConsentForm(userRole = 'patient', includeOptional = true) {
    const consentForm = {
      title: 'Data Processing and Privacy Consent',
      description: 'Please review and provide your consent for data processing activities.',
      version: this.getCurrentPolicyVersion(),
      lastUpdated: new Date().toISOString(),
      sections: []
    };

    // Group consents by category
    const categories = {
      essential: {
        title: 'Essential Consents',
        description: 'These consents are required to provide our services.',
        consents: []
      },
      optional: {
        title: 'Optional Consents',
        description: 'These consents are optional but help us provide better services.',
        consents: []
      },
      marketing: {
        title: 'Marketing Communications',
        description: 'These consents relate to marketing and promotional communications.',
        consents: []
      },
      safety: {
        title: 'Safety and Emergency',
        description: 'These consents relate to safety and emergency procedures.',
        consents: []
      }
    };

    // Populate categories with relevant consents
    Object.values(this.consentTypes).forEach(consentType => {
      if (!includeOptional && !consentType.required) {
        return;
      }

      const category = categories[consentType.category];
      if (category) {
        category.consents.push({
          id: consentType.id,
          name: consentType.name,
          description: consentType.description,
          required: consentType.required,
          legalBasis: consentType.legalBasis
        });
      }
    });

    // Add non-empty categories to form
    Object.entries(categories).forEach(([key, category]) => {
      if (category.consents.length > 0) {
        consentForm.sections.push(category);
      }
    });

    return consentForm;
  }

  /**
   * Validate consent data
   */
  validateConsentData(consentData) {
    const errors = [];
    
    if (!consentData || typeof consentData !== 'object') {
      return { isValid: false, errors: ['Consent data must be an object'] };
    }

    // Check each consent
    Object.entries(consentData).forEach(([consentType, consentInfo]) => {
      if (!this.consentTypes[consentType]) {
        errors.push(`Unknown consent type: ${consentType}`);
        return;
      }

      if (typeof consentInfo !== 'object' || typeof consentInfo.granted !== 'boolean') {
        errors.push(`Invalid consent format for ${consentType}`);
      }

      if (!consentInfo.timestamp) {
        errors.push(`Missing timestamp for ${consentType}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check for missing required consents
   */
  checkRequiredConsents(consentData) {
    const requiredConsents = Object.values(this.consentTypes)
      .filter(consent => consent.required)
      .map(consent => consent.id);

    const missingRequired = [];
    
    requiredConsents.forEach(consentType => {
      if (!consentData[consentType] || !consentData[consentType].granted) {
        missingRequired.push(consentType);
      }
    });

    return missingRequired;
  }

  /**
   * Calculate consent expiration date
   */
  calculateExpirationDate(consentData) {
    // HIPAA authorizations typically expire after 1 year
    // GDPR consents should be renewed periodically
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    return expirationDate.toISOString();
  }

  /**
   * Get current policy version
   */
  getCurrentPolicyVersion() {
    return '2024.1.0'; // Update when privacy policy changes
  }

  /**
   * Mark consent record as superseded
   */
  async markConsentSuperseded(oldRecordId, newRecordId) {
    try {
      // In production, this would update the database record
      console.log(`🔄 Consent record ${oldRecordId} superseded by ${newRecordId}`);
    } catch (error) {
      console.error('❌ Failed to mark consent as superseded:', error);
    }
  }

  /**
   * Check if consents need renewal
   */
  async checkConsentRenewal(userId) {
    try {
      const currentConsent = await this.getCurrentConsent(userId);
      
      if (!currentConsent) {
        return { needsRenewal: true, reason: 'no_consent_record' };
      }

      const expirationDate = new Date(currentConsent.expirationDate);
      const now = new Date();
      const daysUntilExpiration = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiration <= 0) {
        return { needsRenewal: true, reason: 'expired', expiredDays: Math.abs(daysUntilExpiration) };
      }

      if (daysUntilExpiration <= 30) {
        return { needsRenewal: true, reason: 'expiring_soon', daysUntilExpiration };
      }

      return { needsRenewal: false, daysUntilExpiration };

    } catch (error) {
      console.error('❌ Failed to check consent renewal:', error);
      return { needsRenewal: true, reason: 'check_failed' };
    }
  }
}

module.exports = {
  ConsentService,
  consentService: new ConsentService()
};