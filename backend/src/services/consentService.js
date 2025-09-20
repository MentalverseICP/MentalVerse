// Consent Service - Now handled by smart contract
// All consent management operations are delegated to the smart contract's comprehensive consent system

const { icAgent } = require('../ic-integration/icAgent');

/**
 * Legacy Consent Service - Now Delegated to Smart Contract
 * All consent validation, storage, and management is handled by the smart contract
 */
class ConsentService {
  constructor() {
    console.warn('ConsentService: All consent operations now handled by smart contract');
    
    // Legacy consent types - kept for reference only
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
   * Create consent record - now handled by smart contract
   */
  async createConsentRecord(userId, consentData, metadata = {}) {
    console.warn('ConsentService.createConsentRecord: Now handled by smart contract');
    
    try {
      const result = await icAgent.callCanisterMethod('createConsentRecord', {
        userId,
        consentData,
        metadata: {
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          sessionId: metadata.sessionId,
          method: metadata.method || 'web_form'
        }
      });
      
      return result.success ? result : { success: false, error: result.error };
    } catch (error) {
      console.error('Smart contract consent creation failed:', error);
      throw new Error('Consent service unavailable');
    }
  }

  /**
   * Update existing consent - now handled by smart contract
   */
  async updateConsent(userId, consentType, granted, metadata = {}) {
    console.warn('ConsentService.updateConsent: Now handled by smart contract');
    
    try {
      const result = await icAgent.callCanisterMethod('updateConsent', {
        userId,
        consentType,
        granted,
        metadata: {
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          method: metadata.method || 'web_form'
        }
      });
      
      return result.success ? result : { success: false, error: result.error };
    } catch (error) {
      console.error('Smart contract consent update failed:', error);
      throw new Error('Consent service unavailable');
    }
  }

  /**
   * Get current consent for user - now handled by smart contract
   */
  async getCurrentConsent(userId) {
    console.warn('ConsentService.getCurrentConsent: Now handled by smart contract');
    
    try {
      const result = await icAgent.callCanisterMethod('getCurrentConsent', {
        userId
      });
      
      return result.consent || null;
    } catch (error) {
      console.error('Smart contract consent retrieval failed:', error);
      return null;
    }
  }

  /**
   * Check if user has granted specific consent - now handled by smart contract
   */
  async hasConsent(userId, consentType) {
    console.warn('ConsentService.hasConsent: Now handled by smart contract');
    
    try {
      const result = await icAgent.callCanisterMethod('hasConsent', {
        userId,
        consentType
      });
      
      return result.hasConsent || false;
    } catch (error) {
      console.error('Smart contract consent check failed:', error);
      return false;
    }
  }

  /**
   * Get consent history - now handled by smart contract
   */
  async getConsentHistory(userId, options = {}) {
    console.warn('ConsentService.getConsentHistory: Now handled by smart contract');
    
    try {
      const result = await icAgent.callCanisterMethod('getConsentHistory', {
        userId,
        options
      });
      
      return result.history || [];
    } catch (error) {
      console.error('Smart contract consent history retrieval failed:', error);
      return [];
    }
  }

  /**
   * Revoke consent - now handled by smart contract
   */
  async revokeConsent(userId, consentType, reason, metadata = {}) {
    console.warn('ConsentService.revokeConsent: Now handled by smart contract');
    
    try {
      const result = await icAgent.callCanisterMethod('revokeConsent', {
        userId,
        consentType,
        reason,
        metadata: {
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          method: metadata.method || 'web_form'
        }
      });
      
      return result.success ? result : { success: false, error: result.error };
    } catch (error) {
      console.error('Smart contract consent revocation failed:', error);
      throw new Error('Consent service unavailable');
    }
  }

  /**
   * Generate consent form data - now handled by smart contract
   */
  async generateConsentForm(userRole = 'patient', includeOptional = true) {
    console.warn('ConsentService.generateConsentForm: Now handled by smart contract');
    
    try {
      const result = await icAgent.callCanisterMethod('generateConsentForm', {
        userRole,
        includeOptional
      });
      
      return result.form || this._getFallbackConsentForm();
    } catch (error) {
      console.error('Smart contract consent form generation failed:', error);
      return this._getFallbackConsentForm();
    }
  }

  /**
   * Validate consent data - basic fallback validation
   */
  validateConsentData(consentData) {
    console.warn('ConsentService.validateConsentData: Basic validation only - smart contract handles full validation');
    
    const errors = [];
    
    if (!consentData || typeof consentData !== 'object') {
      return { isValid: false, errors: ['Consent data must be an object'] };
    }

    // Basic validation - smart contract handles comprehensive validation
    Object.entries(consentData).forEach(([consentType, consentInfo]) => {
      if (!this.consentTypes[consentType]) {
        errors.push(`Unknown consent type: ${consentType}`);
        return;
      }

      if (typeof consentInfo !== 'object' || typeof consentInfo.granted !== 'boolean') {
        errors.push(`Invalid consent format for ${consentType}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check for missing required consents - basic fallback check
   */
  checkRequiredConsents(consentData) {
    console.warn('ConsentService.checkRequiredConsents: Basic check only - smart contract handles full validation');
    
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
   * Get current policy version - static fallback
   */
  getCurrentPolicyVersion() {
    return '1.0.0';
  }

  /**
   * Calculate expiration date - static fallback
   */
  calculateExpirationDate(consentData) {
    // Default 2 years from now
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 2);
    return expirationDate.toISOString();
  }

  /**
   * Mark consent as superseded - stub
   */
  async markConsentSuperseded(oldRecordId, newRecordId) {
    console.warn('ConsentService.markConsentSuperseded: Now handled by smart contract');
    // Smart contract handles consent record management
    return true;
  }

  /**
   * Fallback consent form for when smart contract is unavailable
   */
  _getFallbackConsentForm() {
    return {
      title: 'Data Processing and Privacy Consent',
      description: 'Please review and provide your consent for data processing activities.',
      version: this.getCurrentPolicyVersion(),
      lastUpdated: new Date().toISOString(),
      sections: [
        {
          title: 'Essential Consents',
          description: 'These consents are required to provide our services.',
          consents: [
            {
              id: 'phi_storage',
              name: 'Protected Health Information Storage',
              description: 'Consent to store and process your protected health information.',
              required: true,
              legalBasis: 'HIPAA Authorization, GDPR Article 6(1)(a) - Consent'
            },
            {
              id: 'data_processing',
              name: 'Personal Data Processing',
              description: 'Consent to process your personal data for providing mental health services.',
              required: true,
              legalBasis: 'GDPR Article 6(1)(a) - Consent'
            }
          ]
        }
      ]
    };
  }
}

// Export singleton instance
const consentService = new ConsentService();

module.exports = {
  ConsentService,
  consentService
};