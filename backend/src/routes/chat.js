// Chat routes - Now proxied to smart contract
// All chat functionality is handled by the smart contract's secure messaging system

import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { sanitizeMiddleware as sanitizeInput } from '../middleware/inputSanitizer.js';
import { icAgent } from '../ic-integration/icAgent.js';

const router = express.Router();

// Rate limiting for chat endpoints
import rateLimit from 'express-rate-limit';
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many chat requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Send chat message - Proxied to smart contract
router.post('/message', [
  authenticateToken,
  chatLimiter,
  sanitizeInput,
  
  // Validation
  body('message').isString().isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
  body('sessionId').isString().notEmpty().withMessage('Session ID is required'),
  body('recipientId').optional().isString().withMessage('Recipient ID must be a string'),
  body('messageType').optional().isIn(['text', 'voice', 'image']).withMessage('Invalid message type'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { message, sessionId, recipientId, messageType = 'text' } = req.body;
    const senderId = req.user.principal;
    
    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('secure_messaging', 'sendMessage', {
      sessionId,
      senderId,
      recipientId: recipientId || null,
      content: message,
      messageType
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to send message',
        details: result.Err
      });
    }

    res.status(201).json({
      success: true,
      message: 'Chat message sent successfully',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to send chat message:', error);
    res.status(500).json({
      error: 'Failed to send message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get chat history - Proxied to smart contract
router.get('/history/:sessionId', [
  authenticateToken,
], async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.principal;
    const { limit = 50, offset = 0 } = req.query;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('secure_messaging', 'getMessages', {
      sessionId,
      requesterId: userId,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to retrieve chat history',
        details: result.Err
      });
    }

    res.json({
      success: true,
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to get chat history:', error);
    res.status(500).json({
      error: 'Failed to retrieve chat history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create therapy session - Proxied to smart contract
router.post('/session', [
  authenticateToken,
  sanitizeInput,
  
  // Validation
  body('patientId').isString().notEmpty().withMessage('Patient ID is required'),
  body('sessionType').isIn(['individual', 'group', 'crisis', 'consultation']).withMessage('Invalid session type'),
  body('scheduledTime').isISO8601().withMessage('Valid scheduled time is required'),
  body('duration').isInt({ min: 15, max: 180 }).withMessage('Duration must be between 15 and 180 minutes'),
  body('notes').optional().isString().isLength({ max: 5000 }).withMessage('Notes must not exceed 5000 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { patientId, sessionType, scheduledTime, duration, notes } = req.body;
    const therapistId = req.user.principal;
    
    // Verify therapist role
    if (req.user.role !== 'therapist') {
      return res.status(403).json({
        error: 'Only therapists can create therapy sessions'
      });
    }

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'createTherapySession', {
      therapistId,
      patientId,
      sessionType: { [sessionType]: null },
      scheduledTime,
      duration,
      notes: notes || ''
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to create therapy session',
        details: result.Err
      });
    }

    res.status(201).json({
      success: true,
      message: 'Therapy session created successfully',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to create therapy session:', error);
    res.status(500).json({
      error: 'Failed to create therapy session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add session notes - Proxied to smart contract
router.post('/session/:sessionId/notes', [
  authenticateToken,
  sanitizeInput,
  
  // Validation
  body('notes').isString().isLength({ min: 1, max: 10000 }).withMessage('Notes must be between 1 and 10000 characters'),
  body('noteType').optional().isIn(['progress', 'treatment_plan', 'assessment', 'discharge']).withMessage('Invalid note type'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { sessionId } = req.params;
    const { notes, noteType = 'progress', isPrivate = false } = req.body;
    const authorId = req.user.principal;
    
    // Verify therapist role
    if (req.user.role !== 'therapist') {
      return res.status(403).json({
        error: 'Only therapists can add session notes'
      });
    }

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'addSessionNotes', {
      sessionId,
      authorId,
      notes,
      noteType: { [noteType]: null },
      isPrivate
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to add session notes',
        details: result.Err
      });
    }

    res.status(201).json({
      success: true,
      message: 'Session notes added successfully',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to add session notes:', error);
    res.status(500).json({
      error: 'Failed to add session notes',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get session notes - Proxied to smart contract
router.get('/session/:sessionId/notes', [
  authenticateToken,
], async (req, res) => {
  try {
    const { sessionId } = req.params;
    const requesterId = req.user.principal;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'getSessionNotes', {
      sessionId,
      requesterId
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to retrieve session notes',
        details: result.Err
      });
    }

    res.json({
      success: true,
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to get session notes:', error);
    res.status(500).json({
      error: 'Failed to retrieve session notes',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create emergency session - Proxied to smart contract
router.post('/emergency-session', [
  authenticateToken,
  sanitizeInput,
  
  // Validation
  body('urgencyLevel').isIn(['high', 'critical']).withMessage('Emergency sessions require high or critical urgency'),
  body('description').isString().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('contactNumber').optional().isMobilePhone().withMessage('Valid contact number required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { urgencyLevel, description, contactNumber } = req.body;
    const patientId = req.user.principal;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'createEmergencySession', {
      patientId,
      urgencyLevel: { [urgencyLevel]: null },
      description,
      contactNumber: contactNumber || null
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to create emergency session',
        details: result.Err
      });
    }

    res.status(201).json({
      success: true,
      message: 'Emergency session created successfully',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to create emergency session:', error);
    res.status(500).json({
      error: 'Failed to create emergency session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;