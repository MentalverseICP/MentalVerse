// backend/src/routes/auth.js
import express from 'express';
import { body } from 'express-validator';
import {
  JWTService,
  authenticateToken,
  requireRole,
  auditLog,
  authLimiter,
  ROLES
} from '../middleware/auth.js';
import { auditAuthEvents, auditPHIAccess as auditPHI } from '../middleware/auditMiddleware.js';
import {
  sanitizeMiddleware,
  createValidationRules,
  handleValidationErrors,
  suspiciousActivityLimiter,
  SECURITY_CONFIG
} from '../middleware/inputSanitizer.js';
import { 
  encryptPHIMiddleware, 
  decryptPHIMiddleware, 
  auditPHIAccess, 
  validatePHIAccess 
} from '../middleware/phiProtection.js';
import { userSession } from '../ic-integration/userSession.js';
import { icAgent } from '../ic-integration/icAgent.js';

const router = express.Router();

// User registration with role assignment
router.post('/register',
  auditAuthEvents(),
  authLimiter,
  suspiciousActivityLimiter,
  sanitizeMiddleware({
    body: {
      firstName: { type: 'name' },
      lastName: { type: 'name' },
      email: { type: 'email' },
      phone: { type: 'phone' },
      role: { type: 'text', options: { pattern: /^(patient|therapist|admin)$/, strict: true } },
      principal: { type: 'id', idType: 'principal' },
      // Role-specific fields (optional)
      specialization: { type: 'text', options: { maxLength: SECURITY_CONFIG.MAX_LENGTHS.specialization }, optional: true },
      experience: { type: 'text', options: { pattern: /^[0-9]+$/, maxLength: 2 }, optional: true },
      licenseNumber: { type: 'id', idType: 'licenseNumber', optional: true },
      medicalHistory: { type: 'text', options: { maxLength: SECURITY_CONFIG.MAX_LENGTHS.medicalHistory }, optional: true },
      currentMedications: { type: 'text', options: { maxLength: SECURITY_CONFIG.MAX_LENGTHS.notes }, optional: true },
      therapyGoals: { type: 'text', options: { maxLength: SECURITY_CONFIG.MAX_LENGTHS.notes }, optional: true }
    }
  }),
  // PHI protection middleware
  encryptPHIMiddleware({
    excludeFields: ['firstName', 'lastName', 'email', 'role', 'principal']
  }),
  auditPHIAccess('registration'),
  auditPHI('user_registration'),
  // Role-based validation
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
  handleValidationErrors,
  auditLog('USER_REGISTRATION', 'user'),
  async (req, res) => {
    try {
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

      // Create user session
      const sessionResult = await userSession.createSession(principal, {
        firstName,
        lastName,
        email,
        phone,
        role,
        registrationData: {
          specialization,
          experience,
          licenseNumber,
          medicalHistory,
          currentMedications,
          therapyGoals
        }
      });

      // Register user with IC backend if available
      try {
        if (icAgent.isInitialized) {
          const userData = {
            firstName,
            lastName,
            email,
            phoneNumber: phone ? [phone] : [],
            userType: { [role]: null }
          };
          
          const icResult = await icAgent.initializeUser(userData);
          console.log('IC user registration result:', icResult);
        }
      } catch (icError) {
        console.warn('IC registration failed, continuing with local registration:', icError.message);
      }

      // Generate JWT tokens
      const tokenPayload = {
        principal,
        role,
        sessionId: sessionResult.sessionId,
        email,
        firstName,
        lastName
      };

      const accessToken = JWTService.generateAccessToken(tokenPayload);
      const refreshToken = JWTService.generateRefreshToken({ principal, sessionId: sessionResult.sessionId });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          principal,
          role,
          firstName,
          lastName,
          email,
          sessionId: sessionResult.sessionId
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: '15m'
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.message.includes('already registered')) {
        return res.status(409).json({
          error: 'User already registered',
          code: 'USER_EXISTS'
        });
      }
      
      res.status(500).json({
        error: 'Registration failed',
        code: 'REGISTRATION_ERROR'
      });
    }
  }
);

// User login (for existing users)
router.post('/login',
  authLimiter,
  suspiciousActivityLimiter,
  sanitizeMiddleware({
    body: {
      principal: { type: 'id', idType: 'principal' },
      sessionData: { type: 'text', options: { maxLength: 1000 } }
    }
  }),
  [
    body('principal').notEmpty().withMessage('Principal is required'),
  ],
  handleValidationErrors,
  auditLog('USER_LOGIN', 'auth'),
  async (req, res) => {
    try {
      const { principal, sessionData } = req.body;

      // Check if user session exists or create new one
      let sessionResult = userSession.getSessionByPrincipal(principal);
      
      if (!sessionResult) {
        // Try to get user data from IC
        let userData = null;
        try {
          if (icAgent.isInitialized) {
            userData = await icAgent.getCurrentUser(principal);
          }
        } catch (error) {
          console.warn('Could not fetch user data from IC:', error.message);
        }

        // Create new session
        sessionResult = await userSession.createSession(principal, {
          ...userData,
          loginData: sessionData
        });
      } else {
        // Update existing session activity
        userSession.updateSessionActivity(sessionResult.sessionId);
      }

      // Get user role from session or default to patient
      const userRole = sessionResult.session.role || 'patient';
      const userEmail = sessionResult.session.email || '';
      const firstName = sessionResult.session.firstName || '';
      const lastName = sessionResult.session.lastName || '';

      // Generate JWT tokens
      const tokenPayload = {
        principal,
        role: userRole,
        sessionId: sessionResult.sessionId,
        email: userEmail,
        firstName,
        lastName
      };

      const accessToken = JWTService.generateAccessToken(tokenPayload);
      const refreshToken = JWTService.generateRefreshToken({ principal, sessionId: sessionResult.sessionId });

      res.json({
        message: 'Login successful',
        user: {
          principal,
          role: userRole,
          firstName,
          lastName,
          email: userEmail,
          sessionId: sessionResult.sessionId
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: '15m'
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Login failed',
        code: 'LOGIN_ERROR'
      });
    }
  }
);

// Token refresh with automatic rotation
router.post('/refresh',
  sanitizeMiddleware({
    body: {
      refreshToken: { type: 'text', options: { maxLength: 1000 } }
    }
  }),
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ],
  handleValidationErrors,
  auditLog('TOKEN_REFRESH', 'auth'),
  async (req, res) => {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      if (!JWTService.isRefreshTokenValid(refreshToken)) {
        return res.status(401).json({
          error: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        });
      }

      const decoded = JWTService.verifyToken(refreshToken);
      const { principal, sessionId } = decoded;

      // Verify session is still valid
      const session = userSession.getSession(sessionId);
      if (!session) {
        return res.status(401).json({
          error: 'Session expired',
          code: 'SESSION_EXPIRED'
        });
      }

      // Generate new access token
      const tokenPayload = {
        principal,
        role: session.role || 'patient',
        sessionId,
        email: session.email || '',
        firstName: session.firstName || '',
        lastName: session.lastName || ''
      };

      const newAccessToken = JWTService.generateAccessToken(tokenPayload);
      
      // Check if refresh token should be rotated
      let newRefreshToken = refreshToken;
      let rotated = false;
      
      if (JWTService.shouldRotateRefreshToken(refreshToken)) {
        newRefreshToken = JWTService.rotateRefreshToken(refreshToken);
        rotated = true;
        console.log(`Refresh token rotated for principal: ${principal}`);
      }

      const response = {
        accessToken: newAccessToken,
        expiresIn: '5m',
        rotated
      };
      
      // Include new refresh token if rotated
      if (rotated) {
        response.refreshToken = newRefreshToken;
      }

      res.json(response);

    } catch (error) {
      console.error('Token refresh error:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Refresh token expired',
          code: 'REFRESH_TOKEN_EXPIRED'
        });
      }
      
      res.status(401).json({
        error: 'Token refresh failed',
        code: 'REFRESH_ERROR'
      });
    }
  }
);

// Logout
router.post('/logout',
  authenticateToken,
  auditLog('USER_LOGOUT', 'auth'),
  async (req, res) => {
    try {
      const { sessionId, principal } = req.user;
      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];
      
      // Get refresh token and logout reason from request body
      const { refreshToken, reason = 'user_logout', invalidateAllSessions = false } = req.body;

      let tokensRevoked = 0;
      
      // Option 1: Invalidate all sessions for the user (security logout)
      if (invalidateAllSessions) {
        tokensRevoked = JWTService.revokeAllUserTokens(principal, reason);
        
        // Delete all sessions for this user
        const allSessions = userSession.getAllSessionsByPrincipal(principal);
        allSessions.forEach(session => {
          userSession.deleteSession(session.sessionId);
        });
        
      } else {
        // Option 2: Standard logout - invalidate current session only
        if (accessToken) {
          JWTService.revokeToken(accessToken, reason);
          tokensRevoked++;
        }
        if (refreshToken) {
          JWTService.revokeToken(refreshToken, reason);
          tokensRevoked++;
        }
        
        // Invalidate session tokens
        if (sessionId) {
          const sessionTokensInvalidated = JWTService.invalidateSession(sessionId, reason);
          tokensRevoked += sessionTokensInvalidated;
          
          // Delete session from user session service
          userSession.deleteSession(sessionId);
        }
      }

      res.json({
        message: 'Logout successful',
        tokensRevoked,
        sessionId,
        invalidatedAllSessions: invalidateAllSessions,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Logout failed',
        code: 'LOGOUT_ERROR'
      });
    }
  }
);

// Get current user profile
router.get('/profile',
  authenticateToken,
  auditLog('VIEW_PROFILE', 'user'),
  async (req, res) => {
    try {
      const { principal, role, sessionId, email, firstName, lastName } = req.user;
      
      // Get session data for additional info
      const session = userSession.getSession(sessionId);
      
      res.json({
        user: {
          principal,
          role,
          firstName,
          lastName,
          email,
          sessionId,
          sessionData: session ? {
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            userStats: session.userStats
          } : null
        }
      });

    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({
        error: 'Failed to fetch profile',
        code: 'PROFILE_ERROR'
      });
    }
  }
);

// Token statistics endpoint (admin only)
router.get('/token-stats',
  authenticateToken,
  requireRole(ROLES.ADMIN),
  auditLog('VIEW_TOKEN_STATS', 'admin'),
  async (req, res) => {
    try {
      const stats = JWTService.getTokenStats();
      res.json({
        tokenStatistics: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Token stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch token statistics',
        code: 'TOKEN_STATS_ERROR'
      });
    }
  }
);

// Manual token cleanup endpoint (admin only)
router.post('/cleanup-tokens',
  authenticateToken,
  requireRole(ROLES.ADMIN),
  auditLog('CLEANUP_TOKENS', 'admin'),
  async (req, res) => {
    try {
      JWTService.cleanupExpiredTokens();
      const stats = JWTService.getTokenStats();
      res.json({
        message: 'Token cleanup completed',
        statistics: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Token cleanup error:', error);
      res.status(500).json({
        error: 'Token cleanup failed',
        code: 'TOKEN_CLEANUP_ERROR'
      });
    }
  }
);

// Emergency logout - invalidate all user sessions (security feature)
router.post('/emergency-logout',
  authenticateToken,
  auditLog('EMERGENCY_LOGOUT', 'security'),
  async (req, res) => {
    try {
      const { principal } = req.user;
      const { reason = 'security_concern' } = req.body;
      
      // Revoke all tokens for this user
      const tokensRevoked = JWTService.revokeAllUserTokens(principal, reason);
      
      // Delete all sessions for this user
      const allSessions = userSession.getAllSessionsByPrincipal(principal);
      allSessions.forEach(session => {
        userSession.deleteSession(session.sessionId);
      });

      res.json({
        message: 'Emergency logout successful - all sessions invalidated',
        tokensRevoked,
        sessionsInvalidated: allSessions.length,
        reason,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Emergency logout error:', error);
      res.status(500).json({
        error: 'Emergency logout failed',
        code: 'EMERGENCY_LOGOUT_ERROR'
      });
    }
  }
);

// Admin endpoint to revoke user tokens
router.post('/revoke/:principal',
  authenticateToken,
  requireRole(ROLES.ADMIN),
  auditLog('REVOKE_USER_TOKENS', 'admin'),
  async (req, res) => {
    try {
      const { principal } = req.params;
      const { reason = 'admin_action' } = req.body;
      
      // Revoke all tokens for the specified user
      const tokensRevoked = JWTService.revokeAllUserTokens(principal, reason);
      
      // Find and delete all user sessions
      const allSessions = userSession.getAllSessionsByPrincipal(principal);
      allSessions.forEach(session => {
        userSession.deleteSession(session.sessionId);
      });

      res.json({
        message: `All tokens revoked for user: ${principal}`,
        tokensRevoked,
        sessionsInvalidated: allSessions.length,
        reason
      });

    } catch (error) {
      console.error('Token revocation error:', error);
      res.status(500).json({
        error: 'Token revocation failed',
        code: 'REVOCATION_ERROR'
      });
    }
  }
);

export default router;