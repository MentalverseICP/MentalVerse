// Consent routes - Now proxied to smart contract
// All consent management is handled by the smart contract's consent validation system

import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { sanitizeMiddleware as sanitizeInput } from '../middleware/inputSanitizer.js';
import { icAgent } from '../ic-integration/icAgent.js';

const router = express.Router();

// Rate limiting for consent endpoints
import rateLimit from 'express-rate-limit';
const consentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 consent requests per windowMs
  message: 'Too many consent requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Get consent form for user - Proxied to smart contract
router.get('/form', [
  authenticateToken,
  consentLimiter,
], async (req, res) => {
  try {
    const userId = req.user.principal;
    const userRole = req.user.role;
    const { includeOptional = 'true' } = req.query;
    
    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'getConsentForm', {
      userId,
      userRole,
      includeOptional: includeOptional === 'true'
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to retrieve consent form',
        details: result.Err
      });
    }
    
    res.json({
      success: true,
      data: result.Ok
    });
    
  } catch (error) {
    console.error('❌ Failed to get consent form:', error);
    res.status(500).json({
      error: 'Failed to retrieve consent form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Submit consent form - Proxied to smart contract
router.post('/submit', [
  authenticateToken,
  consentLimiter,
  sanitizeInput,
  
  // Validation
  body('consents').isObject().withMessage('Consents must be an object'),
  body('consents.*.granted').isBoolean().withMessage('Each consent must have a boolean granted field'),
  body('consents.*.timestamp').isISO8601().withMessage('Each consent must have a valid timestamp'),
  body('acceptedTerms').isBoolean().equals(true).withMessage('Terms and conditions must be accepted'),
  body('acceptedPrivacyPolicy').isBoolean().equals(true).withMessage('Privacy policy must be accepted'),
  body('signature').optional().isString().isLength({ min: 2, max: 100 }).withMessage('Digital signature must be between 2 and 100 characters'),
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
    
    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'submitConsent', {
      userId,
      consents,
      acceptedTerms,
      acceptedPrivacyPolicy,
      signature: signature || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to submit consent',
        details: result.Err
      });
    }

    res.status(201).json({
      success: true,
      message: 'Consent submitted successfully',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to submit consent:', error);
    res.status(500).json({
      error: 'Failed to submit consent',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update specific consent - Proxied to smart contract
router.patch('/update/:consentType', [
  authenticateToken,
  consentLimiter,
  sanitizeInput,
  
  // Validation
  body('granted').isBoolean().withMessage('Granted must be a boolean'),
  body('reason').optional().isString().isLength({ max: 500 }).withMessage('Reason must not exceed 500 characters'),
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

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'updateConsent', {
      userId,
      consentType,
      granted,
      reason: reason || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to update consent',
        details: result.Err
      });
    }

    res.json({
      success: true,
      message: 'Consent updated successfully',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to update consent:', error);
    res.status(500).json({
      error: 'Failed to update consent',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Withdraw consent - Proxied to smart contract
router.post('/withdraw/:consentType', [
  authenticateToken,
  consentLimiter,
  sanitizeInput,
  
  // Validation
  body('reason').isString().isLength({ min: 5, max: 1000 }).withMessage('Withdrawal reason must be between 5 and 1000 characters'),
  body('confirmWithdrawal').isBoolean().equals(true).withMessage('Withdrawal must be confirmed'),
  body('effectiveDate').optional().isISO8601().withMessage('Effective date must be a valid ISO date'),
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
    const { reason, confirmWithdrawal, effectiveDate } = req.body;
    const userId = req.user.principal;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'withdrawConsent', {
      userId,
      consentType,
      reason,
      confirmWithdrawal,
      effectiveDate: effectiveDate || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to withdraw consent',
        details: result.Err
      });
    }

    res.json({
      success: true,
      message: 'Consent withdrawn successfully',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to withdraw consent:', error);
    res.status(500).json({
      error: 'Failed to withdraw consent',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get consent status - Proxied to smart contract
router.get('/status', [
  authenticateToken,
], async (req, res) => {
  try {
    const userId = req.user.principal;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'getConsentStatus', {
      userId
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to retrieve consent status',
        details: result.Err
      });
    }

    res.json({
      success: true,
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to get consent status:', error);
    res.status(500).json({
      error: 'Failed to retrieve consent status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get consent history - Proxied to smart contract
router.get('/history', [
  authenticateToken,
], async (req, res) => {
  try {
    const userId = req.user.principal;
    const { limit = 50, offset = 0 } = req.query;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'getConsentHistory', {
      userId,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to retrieve consent history',
        details: result.Err
      });
    }

    res.json({
      success: true,
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to get consent history:', error);
    res.status(500).json({
      error: 'Failed to retrieve consent history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Check specific consent - Proxied to smart contract
router.get('/check/:consentType', [
  authenticateToken,
], async (req, res) => {
  try {
    const { consentType } = req.params;
    const userId = req.user.principal;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'checkConsent', {
      userId,
      consentType
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to check consent',
        details: result.Err
      });
    }

    res.json({
      success: true,
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to check consent:', error);
    res.status(500).json({
      error: 'Failed to check consent',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Check consent renewal requirements - Proxied to smart contract
router.get('/renewal-check', [
  authenticateToken,
], async (req, res) => {
  try {
    const userId = req.user.principal;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'checkConsentRenewal', {
      userId
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to check consent renewal',
        details: result.Err
      });
    }

    res.json({
      success: true,
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to check consent renewal:', error);
    res.status(500).json({
      error: 'Failed to check consent renewal',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Export consent data - Proxied to smart contract
router.get('/export', [
  authenticateToken,
], async (req, res) => {
  try {
    const userId = req.user.principal;
    const { format = 'json' } = req.query;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'exportConsentData', {
      userId,
      format
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to export consent data',
        details: result.Err
      });
    }

    // Set appropriate headers for download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `consent-data-${userId}-${timestamp}.${format}`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
    
    res.json({
      success: true,
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to export consent data:', error);
    res.status(500).json({
      error: 'Failed to export consent data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;