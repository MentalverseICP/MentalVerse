// Authentication routes - Now proxied to smart contract
// All authentication operations are handled by the smart contract

import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { sanitizeMiddleware as sanitizeInput } from '../middleware/inputSanitizer.js';
import { icAgent } from '../ic-integration/icAgent.js';

const router = express.Router();

// Rate limiting for auth endpoints
import rateLimit from 'express-rate-limit';
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: 'Too many authentication attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// User registration - Proxied to smart contract
router.post('/register', [
  authLimiter,
  sanitizeInput,
  
  // Validation
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[\+]?[1-9]?[0-9]{7,15}$/).withMessage('Valid phone number is required'),
  body('role').isIn(['patient', 'therapist', 'admin']).withMessage('Valid role is required'),
  body('principal').notEmpty().withMessage('Principal is required'),
  
  // Conditional validation for therapist fields
  body('specialization').if(body('role').equals('therapist')).notEmpty().withMessage('Specialization is required for therapists'),
  body('experience').if(body('role').equals('therapist')).notEmpty().withMessage('Experience is required for therapists'),
  body('licenseNumber').if(body('role').equals('therapist')).notEmpty().withMessage('License number is required for therapists'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      principal,
      specialization,
      experience,
      licenseNumber,
      medicalHistory,
      currentMedications,
      therapyGoals
    } = req.body;

    // Validate role-specific requirements
    if (role === 'therapist') {
      if (!specialization || !experience || !licenseNumber) {
        return res.status(400).json({
          error: 'Therapist registration requires specialization, experience, and license number',
          code: 'MISSING_THERAPIST_FIELDS'
        });
      }
    }

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'registerUser', {
      principal,
      userData: {
        firstName,
        lastName,
        email,
        phone,
        role,
        specialization: specialization || null,
        experience: experience || null,
        licenseNumber: licenseNumber || null,
        medicalHistory: medicalHistory || null,
        currentMedications: currentMedications || null,
        therapyGoals: therapyGoals || null
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to register user',
        details: result.Err
      });
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to register user:', error);
    res.status(500).json({
      error: 'Failed to register user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// User login - Proxied to smart contract
router.post('/login', [
  authLimiter,
  sanitizeInput,
  
  // Validation
  body('principal').notEmpty().withMessage('Principal is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { principal, sessionData } = req.body;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'authenticateUser', {
      principal,
      sessionData: sessionData || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (result.Err) {
      return res.status(401).json({
        error: 'Authentication failed',
        details: result.Err
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to authenticate user:', error);
    res.status(500).json({
      error: 'Authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Refresh token - Proxied to smart contract
router.post('/refresh', [
  sanitizeInput,
  
  // Validation
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { refreshToken } = req.body;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'refreshToken', {
      refreshToken,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (result.Err) {
      return res.status(401).json({
        error: 'Token refresh failed',
        details: result.Err
      });
    }

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to refresh token:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// User logout - Proxied to smart contract
router.post('/logout', [
  authenticateToken,
], async (req, res) => {
  try {
    const userId = req.user.principal;
    const sessionId = req.user.sessionId;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'logoutUser', {
      userId,
      sessionId: sessionId || null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Logout failed',
        details: result.Err
      });
    }

    res.json({
      success: true,
      message: 'Logout successful',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to logout user:', error);
    res.status(500).json({
      error: 'Logout failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user profile - Proxied to smart contract
router.get('/profile', [
  authenticateToken,
], async (req, res) => {
  try {
    const userId = req.user.principal;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'getUserProfile', {
      userId
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to retrieve profile',
        details: result.Err
      });
    }

    res.json({
      success: true,
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to get user profile:', error);
    res.status(500).json({
      error: 'Failed to retrieve profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user profile - Proxied to smart contract
router.patch('/profile', [
  authenticateToken,
  sanitizeInput,
  
  // Validation
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().matches(/^[\+]?[1-9]?[0-9]{7,15}$/).withMessage('Valid phone number is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.principal;
    const updateData = req.body;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'updateUserProfile', {
      userId,
      updateData,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Failed to update profile',
        details: result.Err
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to update profile:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Emergency logout - Proxied to smart contract
router.post('/emergency-logout', [
  authenticateToken,
], async (req, res) => {
  try {
    const userId = req.user.principal;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'emergencyLogout', {
      userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (result.Err) {
      return res.status(400).json({
        error: 'Emergency logout failed',
        details: result.Err
      });
    }

    res.json({
      success: true,
      message: 'Emergency logout successful - all sessions terminated',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to perform emergency logout:', error);
    res.status(500).json({
      error: 'Emergency logout failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify session - Proxied to smart contract
router.get('/verify', [
  authenticateToken,
], async (req, res) => {
  try {
    const userId = req.user.principal;
    const sessionId = req.user.sessionId;

    // Proxy to smart contract
    const result = await icAgent.callCanisterMethod('mentalverse', 'verifySession', {
      userId,
      sessionId: sessionId || null
    });

    if (result.Err) {
      return res.status(401).json({
        error: 'Session verification failed',
        details: result.Err
      });
    }

    res.json({
      success: true,
      message: 'Session verified',
      data: result.Ok
    });

  } catch (error) {
    console.error('❌ Failed to verify session:', error);
    res.status(500).json({
      error: 'Session verification failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;