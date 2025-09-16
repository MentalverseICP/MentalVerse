const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/inputSanitizer');
const { auditPHIAccess, validatePHIAccess } = require('../middleware/phiProtection');
const { consentService } = require('../services/consentService');

const router = express.Router();

// Rate limiting for consent endpoints
const rateLimit = require('express-rate-limit');
const consentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 consent requests per windowMs
  message: 'Too many consent requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Get consent form for user
router.get('/form', [
  auth,
  consentLimiter,
  auditPHIAccess('view_consent_form'),
], async (req, res) => {
  try {
    const userRole = req.user.role;
    const { includeOptional = 'true' } = req.query;
    
    // Generate consent form based on user role
    const consentForm = consentService.generateConsentForm(
      userRole,
      includeOptional === 'true'
    );
    
    // Check if user has existing consents
    const currentConsent = await consentService.getCurrentConsent(req.user.principal);
    
    // Add current consent status to form
    if (currentConsent) {
      consentForm.sections.forEach(section => {
        section.consents.forEach(consent => {
          const userConsent = currentConsent.consents[consent.id];
          consent.currentStatus = {
            granted: userConsent?.granted || false,
            timestamp: userConsent?.timestamp,
            method: userConsent?.method
          };
        });
      });
    }
    
    res.json({
      success: true,
      data: consentForm
    });
    
  } catch (error) {
    console.error('❌ Failed to get consent form:', error);
    res.status(500).json({
      error: 'Failed to retrieve consent form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Submit consent form
router.post('/submit', [
  auth,
  consentLimiter,
  sanitizeInput,
  validatePHIAccess(),
  
  // Validation
  body('consents').isObject().withMessage('Consents must be an object'),
  body('consents.*.granted').isBoolean().withMessage('Each consent must have a boolean granted field'),
  body('consents.*.timestamp').isISO8601().withMessage('Each consent must have a valid timestamp'),
  body('acceptedTerms').isBoolean().equals(true).withMessage('Terms and conditions must be accepted'),
  body('acceptedPrivacyPolicy').isBoolean().equals(true).withMessage('Privacy policy must be accepted'),
  body('signature').optional().isString().isLength({ min: 2, max: 100 }).withMessage('Digital signature must be between 2 and 100 characters'),
  
  auditPHIAccess('submit_consent'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { consents, acceptedTerms, acceptedPrivacyPolicy, signature } = req.body;
    const userId = req.user.principal;
    
    // Add metadata to each consent
    const processedConsents = {};
    Object.entries(consents).forEach(([consentType, consentData]) => {
      processedConsents[consentType] = {
        ...consentData,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        method: 'web_form',
        signature: signature || null
      };
    });
    
    // Create consent record
    const consentResult = await consentService.createConsentRecord(
      userId,
      processedConsents,
      {
        requestId: req.headers['x-request-id'] || `consent_${Date.now()}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        sessionId: req.sessionID,
        method: 'web_form',
        acceptedTerms,
        acceptedPrivacyPolicy,
        signature
      }
    );
    
    res.status(201).json({
      success: true,
      message: 'Consent recorded successfully',
      data: {
        consentId: consentResult.consentId,
        timestamp: consentResult.timestamp,
        expirationDate: consentResult.expirationDate,
        consentsGranted: consentResult.consentsGranted
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to submit consent:', error);
    res.status(500).json({
      error: 'Failed to record consent',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update specific consent
router.patch('/update/:consentType', [
  auth,
  consentLimiter,
  sanitizeInput,
  validatePHIAccess(),
  
  // Validation
  body('granted').isBoolean().withMessage('Granted must be a boolean'),
  body('reason').optional().isString().isLength({ max: 500 }).withMessage('Reason must not exceed 500 characters'),
  
  auditPHIAccess('update_consent'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { consentType } = req.params;
    const { granted, reason } = req.body;
    const userId = req.user.principal;
    
    // Update consent
    const updateResult = await consentService.updateConsent(
      userId,
      consentType,
      granted,
      {
        requestId: req.headers['x-request-id'] || `update_${Date.now()}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        method: 'api_update',
        reason
      }
    );
    
    res.json({
      success: true,
      message: `Consent ${granted ? 'granted' : 'revoked'} successfully`,
      data: {
        consentType,
        granted,
        timestamp: updateResult.timestamp,
        consentId: updateResult.consentId
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to update consent:', error);
    res.status(500).json({
      error: 'Failed to update consent',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Withdraw consent
router.post('/withdraw/:consentType', [
  auth,
  consentLimiter,
  sanitizeInput,
  validatePHIAccess(),
  
  // Validation
  body('reason').isString().isLength({ min: 5, max: 1000 }).withMessage('Withdrawal reason must be between 5 and 1000 characters'),
  body('confirmWithdrawal').isBoolean().equals(true).withMessage('Withdrawal must be confirmed'),
  body('effectiveDate').optional().isISO8601().withMessage('Effective date must be a valid ISO date'),
  
  auditPHIAccess('withdraw_consent'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { consentType } = req.params;
    const { reason, effectiveDate } = req.body;
    const userId = req.user.principal;
    
    // Withdraw consent
    const withdrawalResult = await consentService.withdrawConsent(
      userId,
      consentType,
      reason,
      {
        requestId: req.headers['x-request-id'] || `withdraw_${Date.now()}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        method: 'api_withdrawal',
        effectiveDate
      }
    );
    
    res.json({
      success: true,
      message: 'Consent withdrawn successfully',
      data: {
        consentType,
        withdrawalId: withdrawalResult.withdrawalId,
        effectiveDate: withdrawalResult.effectiveDate
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to withdraw consent:', error);
    res.status(500).json({
      error: 'Failed to withdraw consent',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current consent status
router.get('/status', [
  auth,
  validatePHIAccess(),
  auditPHIAccess('view_consent_status'),
], async (req, res) => {
  try {
    const userId = req.user.principal;
    
    // Get current consent
    const currentConsent = await consentService.getCurrentConsent(userId);
    
    if (!currentConsent) {
      return res.json({
        success: true,
        data: {
          hasConsents: false,
          message: 'No consent records found'
        }
      });
    }
    
    // Check renewal status
    const renewalStatus = await consentService.checkConsentRenewal(userId);
    
    // Format response
    const consentStatus = {
      hasConsents: true,
      consentId: currentConsent.id,
      timestamp: currentConsent.timestamp,
      expirationDate: currentConsent.expirationDate,
      version: currentConsent.version,
      renewalStatus,
      consents: {}
    };
    
    // Add individual consent statuses
    Object.entries(currentConsent.consents).forEach(([consentType, consentData]) => {
      consentStatus.consents[consentType] = {
        granted: consentData.granted,
        timestamp: consentData.timestamp,
        method: consentData.method
      };
    });
    
    res.json({
      success: true,
      data: consentStatus
    });
    
  } catch (error) {
    console.error('❌ Failed to get consent status:', error);
    res.status(500).json({
      error: 'Failed to retrieve consent status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get consent history
router.get('/history', [
  auth,
  validatePHIAccess(),
  auditPHIAccess('view_consent_history'),
], async (req, res) => {
  try {
    const userId = req.user.principal;
    const { limit = 20, offset = 0, consentType } = req.query;
    
    // Get consent history
    const history = await consentService.getConsentHistory(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      consentType
    });
    
    res.json({
      success: true,
      data: history
    });
    
  } catch (error) {
    console.error('❌ Failed to get consent history:', error);
    res.status(500).json({
      error: 'Failed to retrieve consent history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Check specific consent
router.get('/check/:consentType', [
  auth,
  validatePHIAccess(),
  auditPHIAccess('check_consent'),
], async (req, res) => {
  try {
    const { consentType } = req.params;
    const userId = req.user.principal;
    
    // Check if user has granted this consent
    const hasConsent = await consentService.hasConsent(userId, consentType);
    
    res.json({
      success: true,
      data: {
        consentType,
        granted: hasConsent,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to check consent:', error);
    res.status(500).json({
      error: 'Failed to check consent',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Consent renewal reminder
router.get('/renewal-check', [
  auth,
  validatePHIAccess(),
  auditPHIAccess('consent_renewal_check'),
], async (req, res) => {
  try {
    const userId = req.user.principal;
    
    // Check if consents need renewal
    const renewalStatus = await consentService.checkConsentRenewal(userId);
    
    res.json({
      success: true,
      data: renewalStatus
    });
    
  } catch (error) {
    console.error('❌ Failed to check consent renewal:', error);
    res.status(500).json({
      error: 'Failed to check consent renewal',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Export consent data (for GDPR compliance)
router.get('/export', [
  auth,
  validatePHIAccess(),
  auditPHIAccess('export_consent_data'),
], async (req, res) => {
  try {
    const userId = req.user.principal;
    const { format = 'json' } = req.query;
    
    // Get all consent data for user
    const consentHistory = await consentService.getConsentHistory(userId, {
      limit: 1000, // Get all records
      offset: 0
    });
    
    const exportData = {
      userId,
      exportTimestamp: new Date().toISOString(),
      dataType: 'consent_records',
      version: '1.0',
      records: consentHistory.records
    };
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="consent-export-${userId.substring(0, 8)}-${Date.now()}.json"`);
      res.json(exportData);
    } else {
      res.status(400).json({
        error: 'Unsupported export format',
        supportedFormats: ['json']
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to export consent data:', error);
    res.status(500).json({
      error: 'Failed to export consent data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;