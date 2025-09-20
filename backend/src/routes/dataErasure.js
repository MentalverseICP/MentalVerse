// Data Erasure routes - Now proxied to smart contract
// All data erasure operations are handled by the smart contract's data management system

import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { sanitizeMiddleware as sanitizeInput } from '../middleware/inputSanitizer.js';
import { icAgent } from '../ic-integration/icAgent.js';

const router = express.Router();

// Rate limiting for data erasure endpoints
import rateLimit from 'express-rate-limit';
const erasureLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 erasure requests per hour
  message: 'Too many data erasure requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Submit data erasure request - Proxied to smart contract
router.post('/request', [
  authenticateToken,
  erasureLimiter,
  sanitizeInput,
  
  // Validation
  body('erasureType').isIn(['partial', 'complete']).withMessage('Erasure type must be partial or complete'),
  body('reason').isString().isLength({ min: 10, max: 1000 }).withMessage('Reason must be between 10 and 1000 characters'),
  body('dataCategories').optional().isArray().withMessage('Data categories must be an array'),
  body('confirmErasure').isBoolean().equals(true).withMessage('Erasure must be confirmed'),
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

    const { erasureType, reason, dataCategories, confirmErasure, effectiveDate } = req.body;
    const userId = req.user.principal;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'submitErasureRequest', {
      userId,
      erasureType,
      reason,
      dataCategories: dataCategories || [],
      confirmErasure,
      effectiveDate: effectiveDate || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to submit erasure request',
        details: result.Err
      });
    }

    res.status(201).json({
      success: true,
      message: 'Data erasure request submitted successfully',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to submit erasure request:', error);
    res.status(500).json({
      error: 'Failed to submit erasure request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get erasure request status - Proxied to smart contract
router.get('/status/:requestId', [
  authenticateToken,
], async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.principal;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'getErasureStatus', {
      userId,
      requestId
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to retrieve erasure status',
        details: result.Err
      });
    }

    res.json({
      success: true,
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to get erasure status:', error);
    res.status(500).json({
      error: 'Failed to retrieve erasure status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Request confirmation for erasure - Proxied to smart contract
router.post('/request-confirmation', [
  authenticateToken,
  sanitizeInput,
  
  // Validation
  body('requestId').isString().isLength({ min: 1 }).withMessage('Request ID is required'),
  body('confirmationCode').isString().isLength({ min: 6, max: 10 }).withMessage('Confirmation code must be between 6 and 10 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { requestId, confirmationCode } = req.body;
    const userId = req.user.principal;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'confirmErasureRequest', {
      userId,
      requestId,
      confirmationCode,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to confirm erasure request',
        details: result.Err
      });
    }

    res.json({
      success: true,
      message: 'Erasure request confirmed successfully',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to confirm erasure request:', error);
    res.status(500).json({
      error: 'Failed to confirm erasure request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Export user data before erasure - Proxied to smart contract
router.get('/export', [
  authenticateToken,
], async (req, res) => {
  try {
    const userId = req.user.principal;
    const { format = 'json', includeMetadata = 'true' } = req.query;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'exportUserData', {
      userId,
      format,
      includeMetadata: includeMetadata === 'true'
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to export user data',
        details: result.Err
      });
    }

    // Set appropriate headers for download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `user-data-export-${userId}-${timestamp}.${format}`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
    
    res.json({
      success: true,
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to export user data:', error);
    res.status(500).json({
      error: 'Failed to export user data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's erasure history - Proxied to smart contract
router.get('/history', [
  authenticateToken,
], async (req, res) => {
  try {
    const userId = req.user.principal;
    const { limit = 20, offset = 0 } = req.query;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'getErasureHistory', {
      userId,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to retrieve erasure history',
        details: result.Err
      });
    }

    res.json({
      success: true,
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to get erasure history:', error);
    res.status(500).json({
      error: 'Failed to retrieve erasure history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Cancel pending erasure request - Proxied to smart contract
router.delete('/cancel/:requestId', [
  authenticateToken,
  sanitizeInput,
  
  // Validation
  body('reason').optional().isString().isLength({ max: 500 }).withMessage('Cancellation reason must not exceed 500 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { requestId } = req.params;
    const { reason } = req.body;
    const userId = req.user.principal;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'cancelErasureRequest', {
      userId,
      requestId,
      reason: reason || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to cancel erasure request',
        details: result.Err
      });
    }

    res.json({
      success: true,
      message: 'Erasure request cancelled successfully',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to cancel erasure request:', error);
    res.status(500).json({
      error: 'Failed to cancel erasure request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Admin routes - Proxied to smart contract

// Get all erasure requests (Admin only) - Proxied to smart contract
router.get('/admin/requests', [
  authenticateToken,
  requireRole(['admin', 'data_protection_officer']),
], async (req, res) => {
  try {
    const { status, limit = 50, offset = 0, userId } = req.query;
    const adminId = req.user.principal;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'getAllErasureRequests', {
      adminId,
      filters: {
        status: status || null,
        userId: userId || null
      },
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to retrieve erasure requests',
        details: result.Err
      });
    }

    res.json({
      success: true,
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to get erasure requests:', error);
    res.status(500).json({
      error: 'Failed to retrieve erasure requests',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Process erasure request (Admin only) - Proxied to smart contract
router.post('/admin/process/:requestId', [
  authenticateToken,
  requireRole(['admin', 'data_protection_officer']),
  sanitizeInput,
  
  // Validation
  body('action').isIn(['approve', 'reject', 'require_review']).withMessage('Action must be approve, reject, or require_review'),
  body('adminNotes').optional().isString().isLength({ max: 1000 }).withMessage('Admin notes must not exceed 1000 characters'),
  body('scheduledDate').optional().isISO8601().withMessage('Scheduled date must be a valid ISO date'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { requestId } = req.params;
    const { action, adminNotes, scheduledDate } = req.body;
    const adminId = req.user.principal;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'processErasureRequest', {
      adminId,
      requestId,
      action,
      adminNotes: adminNotes || null,
      scheduledDate: scheduledDate || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to process erasure request',
        details: result.Err
      });
    }

    res.json({
      success: true,
      message: `Erasure request ${action}d successfully`,
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to process erasure request:', error);
    res.status(500).json({
      error: 'Failed to process erasure request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Execute approved erasure (Admin only) - Proxied to smart contract
router.post('/admin/execute/:requestId', [
  authenticateToken,
  requireRole(['admin', 'data_protection_officer']),
  sanitizeInput,
  
  // Validation
  body('confirmExecution').isBoolean().equals(true).withMessage('Execution must be confirmed'),
  body('executionNotes').optional().isString().isLength({ max: 1000 }).withMessage('Execution notes must not exceed 1000 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { requestId } = req.params;
    const { confirmExecution, executionNotes } = req.body;
    const adminId = req.user.principal;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'executeErasure', {
      adminId,
      requestId,
      confirmExecution,
      executionNotes: executionNotes || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to execute erasure',
        details: result.Err
      });
    }

    res.json({
      success: true,
      message: 'Data erasure executed successfully',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to execute erasure:', error);
    res.status(500).json({
      error: 'Failed to execute erasure',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get erasure statistics (Admin only) - Proxied to smart contract
router.get('/admin/statistics', [
  authenticateToken,
  requireRole(['admin', 'data_protection_officer']),
], async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const adminId = req.user.principal;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'getErasureStatistics', {
      adminId,
      timeframe
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to retrieve erasure statistics',
        details: result.Err
      });
    }

    res.json({
      success: true,
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to get erasure statistics:', error);
    res.status(500).json({
      error: 'Failed to retrieve erasure statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;