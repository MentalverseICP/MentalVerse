const { consentService } = require('../services/consentService');

/**
 * Consent Validation Middleware
 * Ensures users have proper consent before processing PHI data
 */

/**
 * Middleware to check if user has required consent for PHI operations
 */
function requireConsent(requiredConsents = []) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.principal;
      
      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required for consent validation'
        });
      }

      // Check if user has current consent record
      const currentConsent = await consentService.getCurrentConsent(userId);
      
      if (!currentConsent) {
        return res.status(403).json({
          error: 'No consent record found',
          code: 'CONSENT_REQUIRED',
          message: 'You must provide consent before we can process your health information.',
          redirectTo: '/consent/form'
        });
      }

      // Check if consent has expired
      const renewalStatus = await consentService.checkConsentRenewal(userId);
      if (renewalStatus.needsRenewal && renewalStatus.reason === 'expired') {
        return res.status(403).json({
          error: 'Consent has expired',
          code: 'CONSENT_EXPIRED',
          message: 'Your consent has expired. Please renew your consent to continue.',
          expiredDays: renewalStatus.expiredDays,
          redirectTo: '/consent/form'
        });
      }

      // Check specific required consents
      const missingConsents = [];
      for (const consentType of requiredConsents) {
        const hasConsent = await consentService.hasConsent(userId, consentType);
        if (!hasConsent) {
          missingConsents.push(consentType);
        }
      }

      if (missingConsents.length > 0) {
        return res.status(403).json({
          error: 'Missing required consents',
          code: 'CONSENT_MISSING',
          message: 'Additional consent is required for this operation.',
          missingConsents,
          redirectTo: '/consent/form'
        });
      }

      // Add consent info to request for audit purposes
      req.consentInfo = {
        consentId: currentConsent.id,
        timestamp: currentConsent.timestamp,
        version: currentConsent.version,
        renewalStatus
      };

      next();
    } catch (error) {
      console.error('❌ Consent validation failed:', error);
      res.status(500).json({
        error: 'Failed to validate consent',
        code: 'CONSENT_VALIDATION_ERROR'
      });
    }
  };
}

/**
 * Middleware to check PHI storage consent
 */
function requirePHIStorageConsent() {
  return requireConsent(['PHI_STORAGE', 'DATA_PROCESSING']);
}

/**
 * Middleware to check therapy recording consent
 */
function requireTherapyRecordingConsent() {
  return requireConsent(['PHI_STORAGE', 'THERAPY_RECORDING']);
}

/**
 * Middleware to check research participation consent
 */
function requireResearchConsent() {
  return requireConsent(['RESEARCH_PARTICIPATION']);
}

/**
 * Middleware to check AI analysis consent
 */
function requireAIAnalysisConsent() {
  return requireConsent(['AI_ANALYSIS', 'PHI_STORAGE']);
}

/**
 * Middleware to check data sharing consent
 */
function requireDataSharingConsent() {
  return requireConsent(['DATA_SHARING_PROVIDERS']);
}

/**
 * Middleware to warn about expiring consent
 */
function checkConsentExpiration() {
  return async (req, res, next) => {
    try {
      const userId = req.user?.principal;
      
      if (!userId) {
        return next();
      }

      const renewalStatus = await consentService.checkConsentRenewal(userId);
      
      if (renewalStatus.needsRenewal && renewalStatus.reason === 'expiring_soon') {
        // Add warning header
        res.setHeader('X-Consent-Warning', 'expiring_soon');
        res.setHeader('X-Consent-Days-Remaining', renewalStatus.daysUntilExpiration.toString());
        
        // Add warning to response if it's a JSON response
        const originalJson = res.json;
        res.json = function(data) {
          if (typeof data === 'object' && data !== null) {
            data.consentWarning = {
              type: 'expiring_soon',
              daysRemaining: renewalStatus.daysUntilExpiration,
              message: `Your consent will expire in ${renewalStatus.daysUntilExpiration} days. Please renew to continue using our services.`,
              renewalUrl: '/consent/form'
            };
          }
          return originalJson.call(this, data);
        };
      }

      next();
    } catch (error) {
      console.error('❌ Consent expiration check failed:', error);
      next(); // Continue without warning on error
    }
  };
}

/**
 * Middleware to log consent-related actions
 */
function logConsentAction(action) {
  return (req, res, next) => {
    try {
      const userId = req.user?.principal;
      const consentId = req.consentInfo?.consentId;
      
      console.log(`📋 Consent Action: ${action} - User: ${userId?.substring(0, 8)}... - Consent: ${consentId?.substring(0, 8)}...`);
      
      // In production, send to audit service
      // auditService.logConsentAction({
      //   action,
      //   userId,
      //   consentId,
      //   timestamp: new Date().toISOString(),
      //   ipAddress: req.ip,
      //   userAgent: req.headers['user-agent'],
      //   path: req.path,
      //   method: req.method
      // });
      
      next();
    } catch (error) {
      console.error('❌ Consent action logging failed:', error);
      next(); // Continue without logging on error
    }
  };
}

/**
 * Middleware to validate consent for specific operations
 */
function validateOperationConsent(operation) {
  const operationConsents = {
    'store_medical_history': ['PHI_STORAGE', 'DATA_PROCESSING'],
    'record_therapy_session': ['PHI_STORAGE', 'THERAPY_RECORDING'],
    'ai_analysis': ['PHI_STORAGE', 'AI_ANALYSIS'],
    'share_with_provider': ['PHI_STORAGE', 'DATA_SHARING_PROVIDERS'],
    'research_participation': ['PHI_STORAGE', 'RESEARCH_PARTICIPATION'],
    'emergency_contact': ['EMERGENCY_CONTACT'],
    'marketing_communication': ['MARKETING_COMMUNICATIONS'],
    'chat_message': ['PHI_STORAGE', 'DATA_PROCESSING'],
    'session_notes': ['PHI_STORAGE', 'DATA_PROCESSING'],
    'treatment_plan': ['PHI_STORAGE', 'DATA_PROCESSING']
  };

  const requiredConsents = operationConsents[operation] || ['PHI_STORAGE'];
  
  return [
    requireConsent(requiredConsents),
    logConsentAction(operation)
  ];
}

/**
 * Middleware to handle consent errors gracefully
 */
function handleConsentErrors() {
  return (error, req, res, next) => {
    if (error.code === 'CONSENT_REQUIRED' || 
        error.code === 'CONSENT_EXPIRED' || 
        error.code === 'CONSENT_MISSING') {
      
      return res.status(403).json({
        error: error.message,
        code: error.code,
        consentRequired: true,
        redirectTo: '/consent/form',
        timestamp: new Date().toISOString()
      });
    }
    
    next(error);
  };
}

/**
 * Utility function to check if user can perform operation
 */
async function canPerformOperation(userId, operation) {
  try {
    const operationConsents = {
      'store_medical_history': ['PHI_STORAGE', 'DATA_PROCESSING'],
      'record_therapy_session': ['PHI_STORAGE', 'THERAPY_RECORDING'],
      'ai_analysis': ['PHI_STORAGE', 'AI_ANALYSIS'],
      'share_with_provider': ['PHI_STORAGE', 'DATA_SHARING_PROVIDERS'],
      'research_participation': ['PHI_STORAGE', 'RESEARCH_PARTICIPATION']
    };

    const requiredConsents = operationConsents[operation] || ['PHI_STORAGE'];
    
    for (const consentType of requiredConsents) {
      const hasConsent = await consentService.hasConsent(userId, consentType);
      if (!hasConsent) {
        return {
          allowed: false,
          missingConsent: consentType,
          reason: `Missing required consent: ${consentType}`
        };
      }
    }

    // Check if consent is expired
    const renewalStatus = await consentService.checkConsentRenewal(userId);
    if (renewalStatus.needsRenewal && renewalStatus.reason === 'expired') {
      return {
        allowed: false,
        reason: 'Consent has expired',
        expiredDays: renewalStatus.expiredDays
      };
    }

    return {
      allowed: true,
      renewalStatus
    };
  } catch (error) {
    console.error('❌ Failed to check operation permission:', error);
    return {
      allowed: false,
      reason: 'Failed to validate consent'
    };
  }
}

/**
 * Middleware to add consent status to response headers
 */
function addConsentHeaders() {
  return async (req, res, next) => {
    try {
      const userId = req.user?.principal;
      
      if (userId) {
        const currentConsent = await consentService.getCurrentConsent(userId);
        const renewalStatus = await consentService.checkConsentRenewal(userId);
        
        if (currentConsent) {
          res.setHeader('X-Consent-Status', 'active');
          res.setHeader('X-Consent-Version', currentConsent.version);
          res.setHeader('X-Consent-Expiration', currentConsent.expirationDate);
          
          if (renewalStatus.needsRenewal) {
            res.setHeader('X-Consent-Renewal-Required', 'true');
            res.setHeader('X-Consent-Renewal-Reason', renewalStatus.reason);
          }
        } else {
          res.setHeader('X-Consent-Status', 'missing');
        }
      }
      
      next();
    } catch (error) {
      console.error('❌ Failed to add consent headers:', error);
      next(); // Continue without headers on error
    }
  };
}

module.exports = {
  requireConsent,
  requirePHIStorageConsent,
  requireTherapyRecordingConsent,
  requireResearchConsent,
  requireAIAnalysisConsent,
  requireDataSharingConsent,
  checkConsentExpiration,
  logConsentAction,
  validateOperationConsent,
  handleConsentErrors,
  canPerformOperation,
  addConsentHeaders
};