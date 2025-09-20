// Consent Validation Middleware - Now handled by smart contract
// All consent validation operations are managed by the smart contract's comprehensive consent system

const { icAgent } = require('../ic-integration/icAgent');

/**
 * Legacy Consent Validation Middleware - Now Delegated to Smart Contract
 * All consent validation, checking, and management is handled by the smart contract
 */

/**
 * Middleware to check if user has required consent for PHI operations - Now handled by smart contract
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

      console.log('⚠️  Consent validation is now handled by the smart contract');
      
      // Delegate consent validation to smart contract
      try {
        const consentResult = await icAgent.callCanisterMethod('mentalverse', 'validateConsent', {
          userId,
          requiredConsents,
          operation: req.path
        });
        
        if (consentResult.Err) {
          const error = consentResult.Err;
          return res.status(403).json({
            error: error.message || 'Consent validation failed',
            code: error.code || 'CONSENT_VALIDATION_ERROR',
            message: error.userMessage || 'Please check your consent settings.',
            missingConsents: error.missingConsents || [],
            redirectTo: '/consent/form'
          });
        }
        
        // Add consent info to request for audit purposes
        req.consentInfo = consentResult.Ok || {
          validated: true,
          timestamp: new Date().toISOString(),
          source: 'smart_contract'
        };
        
        next();
      } catch (error) {
        console.error('❌ Smart contract consent validation failed:', error);
        return res.status(500).json({
          error: 'Failed to validate consent with smart contract',
          code: 'SMART_CONTRACT_ERROR'
        });
      }
    } catch (error) {
      console.error('❌ Consent validation middleware error:', error);
      res.status(500).json({
        error: 'Failed to validate consent',
        code: 'CONSENT_VALIDATION_ERROR'
      });
    }
  };
}

/**
 * Middleware to check PHI storage consent - Now handled by smart contract
 */
function requirePHIStorageConsent() {
  console.log('⚠️  PHI storage consent validation is now handled by the smart contract');
  return requireConsent(['PHI_STORAGE', 'DATA_PROCESSING']);
}

/**
 * Middleware to check therapy recording consent - Now handled by smart contract
 */
function requireTherapyRecordingConsent() {
  console.log('⚠️  Therapy recording consent validation is now handled by the smart contract');
  return requireConsent(['PHI_STORAGE', 'THERAPY_RECORDING']);
}

/**
 * Middleware to check research participation consent - Now handled by smart contract
 */
function requireResearchConsent() {
  console.log('⚠️  Research consent validation is now handled by the smart contract');
  return requireConsent(['RESEARCH_PARTICIPATION']);
}

/**
 * Middleware to check AI analysis consent - Now handled by smart contract
 */
function requireAIAnalysisConsent() {
  console.log('⚠️  AI analysis consent validation is now handled by the smart contract');
  return requireConsent(['AI_ANALYSIS', 'PHI_STORAGE']);
}

/**
 * Middleware to check data sharing consent - Now handled by smart contract
 */
function requireDataSharingConsent() {
  console.log('⚠️  Data sharing consent validation is now handled by the smart contract');
  return requireConsent(['DATA_SHARING']);
}

/**
 * Check consent expiration - Now handled by smart contract
 */
function checkConsentExpiration() {
  return async (req, res, next) => {
    console.log('⚠️  Consent expiration checking is now handled by the smart contract');
    
    try {
      const userId = req.user?.principal;
      
      if (!userId) {
        return next();
      }
      
      // Smart contract handles consent expiration checking
      const expirationResult = await icAgent.callCanisterMethod('mentalverse', 'checkConsentExpiration', userId);
      
      if (expirationResult.Err) {
        return res.status(403).json({
          error: 'Consent has expired',
          code: 'CONSENT_EXPIRED',
          message: 'Your consent has expired. Please renew your consent to continue.',
          redirectTo: '/consent/form'
        });
      }
      
      req.consentExpiration = expirationResult.Ok;
      next();
    } catch (error) {
      console.error('❌ Consent expiration check failed:', error);
      next(); // Continue without blocking - smart contract handles this
    }
  };
}

/**
 * Log consent action - Now handled by smart contract
 */
function logConsentAction(action) {
  return async (req, res, next) => {
    console.log('⚠️  Consent action logging is now handled by the smart contract');
    
    try {
      const userId = req.user?.principal;
      
      if (userId) {
        // Smart contract handles consent action logging
        await icAgent.callCanisterMethod('mentalverse', 'logConsentAction', {
          userId,
          action,
          timestamp: new Date().toISOString(),
          path: req.path,
          method: req.method
        });
      }
    } catch (error) {
      console.error('❌ Consent action logging failed:', error);
      // Don't block the request if logging fails
    }
    
    next();
  };
}

/**
 * Validate operation consent - Now handled by smart contract
 */
function validateOperationConsent(operation) {
  return async (req, res, next) => {
    console.log('⚠️  Operation consent validation is now handled by the smart contract');
    
    try {
      const userId = req.user?.principal;
      
      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required for operation consent validation'
        });
      }
      
      // Smart contract handles operation consent validation
      const validationResult = await icAgent.callCanisterMethod('mentalverse', 'validateOperationConsent', {
        userId,
        operation
      });
      
      if (validationResult.Err) {
        return res.status(403).json({
          error: 'Operation not permitted',
          code: 'OPERATION_NOT_PERMITTED',
          message: 'You do not have consent for this operation.',
          operation,
          redirectTo: '/consent/form'
        });
      }
      
      req.operationConsent = validationResult.Ok;
      next();
    } catch (error) {
      console.error('❌ Operation consent validation failed:', error);
      res.status(500).json({
        error: 'Failed to validate operation consent',
        code: 'OPERATION_CONSENT_ERROR'
      });
    }
  };
}

/**
 * Handle consent errors - Now handled by smart contract
 */
function handleConsentErrors() {
  return (error, req, res, next) => {
    console.log('⚠️  Consent error handling is now handled by the smart contract');
    
    if (error.code && error.code.startsWith('CONSENT_')) {
      return res.status(403).json({
        error: error.message || 'Consent error occurred',
        code: error.code,
        message: 'Please check your consent settings and try again.',
        redirectTo: '/consent/form'
      });
    }
    
    next(error);
  };
}

/**
 * Check if user can perform operation - Now handled by smart contract
 */
async function canPerformOperation(userId, operation) {
  console.log('⚠️  Operation permission checking is now handled by the smart contract');
  
  try {
    // Smart contract handles operation permission checking
    const permissionResult = await icAgent.callCanisterMethod('mentalverse', 'canPerformOperation', {
      userId,
      operation
    });
    
    return permissionResult.Ok || false;
  } catch (error) {
    console.error('❌ Operation permission check failed:', error);
    return false;
  }
}

/**
 * Add consent headers to response - Now handled by smart contract
 */
function addConsentHeaders() {
  return async (req, res, next) => {
    console.log('⚠️  Consent headers are now handled by the smart contract');
    
    try {
      const userId = req.user?.principal;
      
      if (userId) {
        // Smart contract provides consent status headers
        const consentHeaders = await icAgent.callCanisterMethod('mentalverse', 'getConsentHeaders', userId);
        
        if (consentHeaders.Ok) {
          const headers = consentHeaders.Ok;
          res.set('X-Consent-Status', headers.status || 'unknown');
          res.set('X-Consent-Version', headers.version || '1.0');
          res.set('X-Consent-Expires', headers.expires || 'never');
        }
      }
    } catch (error) {
      console.error('❌ Failed to add consent headers:', error);
      // Don't block the request if header addition fails
    }
    
    next();
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