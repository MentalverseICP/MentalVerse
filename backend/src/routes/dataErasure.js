const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/inputSanitizer');
const { auditDataOperations } = require('../middleware/auditMiddleware');
const { dataErasureService } = require('../services/dataErasureService');
const { consentService } = require('../services/consentService');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for data erasure requests (very restrictive)
const erasureLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // Only 1 erasure request per day per IP
  message: {
    error: 'Too many erasure requests',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Only one data erasure request is allowed per 24 hours.',
    retryAfter: '24 hours'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply middleware to all routes
router.use(authenticateToken);
router.use(auditDataOperations());

/**
 * Request data erasure (Right to be Forgotten)
 * POST /api/data-erasure/request
 */
router.post('/request',
  erasureLimiter,
  sanitizeInput(['reason', 'legalBasis', 'dataCategories']),
  async (req, res) => {
    try {
      const userId = req.user.principal;
      const {
        reason,
        legalBasis = 'gdpr_article_17',
        dataCategories,
        deletionMethod,
        confirmationCode
      } = req.body;

      // Validate confirmation code (should be sent via email/SMS)
      if (!confirmationCode) {
        return res.status(400).json({
          error: 'Confirmation code required',
          code: 'CONFIRMATION_REQUIRED',
          message: 'A confirmation code is required to process data erasure requests.'
        });
      }

      // Verify confirmation code
      const codeValid = await verifyConfirmationCode(userId, confirmationCode);
      if (!codeValid) {
        return res.status(400).json({
          error: 'Invalid confirmation code',
          code: 'INVALID_CONFIRMATION',
          message: 'The provided confirmation code is invalid or expired.'
        });
      }

      // Check if user can request erasure
      const canErase = await checkErasureEligibility(userId);
      if (!canErase.eligible) {
        return res.status(403).json({
          error: 'Erasure not permitted',
          code: 'ERASURE_NOT_PERMITTED',
          message: canErase.reason,
          details: canErase.details
        });
      }

      // Process erasure request
      const requestData = {
        reason,
        legalBasis,
        dataCategories,
        deletionMethod,
        requestedBy: userId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      };

      const result = await dataErasureService.processErasureRequest(userId, requestData);

      res.json({
        message: 'Data erasure request processed successfully',
        requestId: result.requestId,
        status: result.status,
        deletedCategories: result.deletedCategories,
        retainedData: result.retainedData,
        completedAt: result.completedAt,
        verificationHash: result.verificationHash,
        nextSteps: {
          message: 'Your data has been securely deleted from our systems.',
          backupDeletion: 'Data in backups will be deleted within 90 days.',
          verification: 'You can verify the deletion using the provided verification hash.',
          contact: 'Contact support if you have any questions about this process.'
        }
      });

    } catch (error) {
      console.error('❌ Data erasure request failed:', error);
      
      res.status(500).json({
        error: 'Failed to process erasure request',
        code: 'ERASURE_PROCESSING_ERROR',
        message: 'An error occurred while processing your data erasure request. Please contact support.',
        requestId: req.body.requestId || 'unknown'
      });
    }
  }
);

/**
 * Get erasure request status
 * GET /api/data-erasure/status/:requestId
 */
router.get('/status/:requestId',
  sanitizeInput(['requestId']),
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const userId = req.user.principal;

      // Verify user owns this request
      const requestOwnership = await verifyRequestOwnership(requestId, userId);
      if (!requestOwnership.valid) {
        return res.status(403).json({
          error: 'Access denied',
          code: 'REQUEST_ACCESS_DENIED',
          message: 'You do not have permission to view this erasure request.'
        });
      }

      const status = await dataErasureService.getErasureStatus(requestId);

      res.json({
        requestId,
        status: status.status,
        progress: status.progress,
        completedSteps: status.completedSteps,
        totalSteps: status.totalSteps,
        estimatedCompletion: status.estimatedCompletion,
        lastUpdated: status.lastUpdated
      });

    } catch (error) {
      console.error('❌ Failed to get erasure status:', error);
      
      res.status(500).json({
        error: 'Failed to retrieve erasure status',
        code: 'STATUS_RETRIEVAL_ERROR',
        message: 'Unable to retrieve the status of your erasure request.'
      });
    }
  }
);

/**
 * Request confirmation code for erasure
 * POST /api/data-erasure/request-confirmation
 */
router.post('/request-confirmation',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 confirmation requests per 15 minutes
    message: {
      error: 'Too many confirmation requests',
      message: 'Please wait before requesting another confirmation code.'
    }
  }),
  async (req, res) => {
    try {
      const userId = req.user.principal;
      const { method = 'email' } = req.body; // email or sms

      // Generate and send confirmation code
      const confirmationCode = await generateConfirmationCode(userId);
      await sendConfirmationCode(userId, confirmationCode, method);

      res.json({
        message: 'Confirmation code sent',
        method,
        expiresIn: '15 minutes',
        note: 'Please check your email/SMS for the confirmation code.'
      });

    } catch (error) {
      console.error('❌ Failed to send confirmation code:', error);
      
      res.status(500).json({
        error: 'Failed to send confirmation code',
        code: 'CONFIRMATION_SEND_ERROR',
        message: 'Unable to send confirmation code. Please try again later.'
      });
    }
  }
);

/**
 * Get data export before erasure (optional)
 * GET /api/data-erasure/export
 */
router.get('/export',
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2, // 2 exports per hour
    message: {
      error: 'Too many export requests',
      message: 'Please wait before requesting another data export.'
    }
  }),
  async (req, res) => {
    try {
      const userId = req.user.principal;
      const { format = 'json', includeCategories } = req.query;

      // Check if user has consent for data export
      const hasExportConsent = await consentService.hasConsent(userId, 'DATA_EXPORT');
      if (!hasExportConsent) {
        return res.status(403).json({
          error: 'Export consent required',
          code: 'EXPORT_CONSENT_REQUIRED',
          message: 'You must provide consent for data export before proceeding.'
        });
      }

      // Generate data export
      const exportData = await generateDataExport(userId, {
        format,
        includeCategories: includeCategories ? includeCategories.split(',') : undefined
      });

      res.json({
        message: 'Data export generated successfully',
        exportId: exportData.exportId,
        downloadUrl: exportData.downloadUrl,
        expiresAt: exportData.expiresAt,
        categories: exportData.categories,
        recordCount: exportData.recordCount,
        format: exportData.format,
        note: 'This export will be automatically deleted after download or expiration.'
      });

    } catch (error) {
      console.error('❌ Data export failed:', error);
      
      res.status(500).json({
        error: 'Failed to generate data export',
        code: 'EXPORT_GENERATION_ERROR',
        message: 'Unable to generate data export. Please try again later.'
      });
    }
  }
);

/**
 * Admin: View erasure requests (admin only)
 * GET /api/data-erasure/admin/requests
 */
router.get('/admin/requests',
  requireRole(['admin', 'compliance_officer']),
  async (req, res) => {
    try {
      const {
        status,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = req.query;

      const requests = await getErasureRequests({
        status,
        startDate,
        endDate,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        requests: requests.data,
        pagination: {
          page: requests.page,
          limit: requests.limit,
          total: requests.total,
          pages: requests.pages
        },
        summary: {
          totalRequests: requests.total,
          pendingRequests: requests.summary.pending,
          completedRequests: requests.summary.completed,
          failedRequests: requests.summary.failed
        }
      });

    } catch (error) {
      console.error('❌ Failed to retrieve erasure requests:', error);
      
      res.status(500).json({
        error: 'Failed to retrieve erasure requests',
        code: 'ADMIN_RETRIEVAL_ERROR'
      });
    }
  }
);

/**
 * Admin: Manual erasure processing (admin only)
 * POST /api/data-erasure/admin/process/:requestId
 */
router.post('/admin/process/:requestId',
  requireRole(['admin', 'compliance_officer']),
  sanitizeInput(['notes', 'overrideReason']),
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const { notes, overrideReason } = req.body;
      const adminId = req.user.principal;

      // Process manual erasure
      const result = await processManualErasure(requestId, {
        adminId,
        notes,
        overrideReason,
        ipAddress: req.ip
      });

      res.json({
        message: 'Manual erasure processing initiated',
        requestId,
        processedBy: adminId,
        status: result.status,
        timestamp: result.timestamp
      });

    } catch (error) {
      console.error('❌ Manual erasure processing failed:', error);
      
      res.status(500).json({
        error: 'Failed to process manual erasure',
        code: 'MANUAL_PROCESSING_ERROR'
      });
    }
  }
);

// Helper functions

async function verifyConfirmationCode(userId, code) {
  // In production, verify against stored confirmation codes
  // For now, accept any 6-digit code
  return /^\d{6}$/.test(code);
}

async function checkErasureEligibility(userId) {
  try {
    // Check for active legal holds, ongoing treatments, etc.
    // For now, allow all erasures
    return {
      eligible: true
    };
  } catch (error) {
    return {
      eligible: false,
      reason: 'Unable to verify eligibility'
    };
  }
}

async function verifyRequestOwnership(requestId, userId) {
  // In production, verify the user owns this request
  return {
    valid: true
  };
}

async function generateConfirmationCode(userId) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // In production, store code with expiration
  // await storeConfirmationCode(userId, code, expiresAt);
  
  return code;
}

async function sendConfirmationCode(userId, code, method) {
  // In production, send via email/SMS service
  console.log(`📧 Confirmation code for ${userId.substring(0, 8)}...: ${code} (via ${method})`);
}

async function generateDataExport(userId, options) {
  // In production, generate actual data export
  return {
    exportId: `export_${Date.now()}`,
    downloadUrl: `/api/data-erasure/download/export_${Date.now()}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    categories: ['personal_data', 'medical_records', 'chat_messages'],
    recordCount: 150,
    format: options.format
  };
}

async function getErasureRequests(filters) {
  // In production, query actual erasure requests
  return {
    data: [],
    page: filters.page,
    limit: filters.limit,
    total: 0,
    pages: 0,
    summary: {
      pending: 0,
      completed: 0,
      failed: 0
    }
  };
}

async function processManualErasure(requestId, options) {
  // In production, process manual erasure
  return {
    status: 'processing',
    timestamp: new Date().toISOString()
  };
}

module.exports = router;