// backend/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { userSession } from '../ic-integration/userSession.js';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-secret-key-change-in-production';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '5m'; // Very short-lived access tokens
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d'; // Long-lived refresh tokens
const JWT_ROTATION_THRESHOLD = process.env.JWT_ROTATION_THRESHOLD || '1h'; // Rotate refresh tokens after 1 hour

// Role definitions and permissions
const ROLES = {
  ADMIN: 'admin',
  THERAPIST: 'therapist', 
  PATIENT: 'patient'
};

const PERMISSIONS = {
  // User management
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  
  // Appointment management
  CREATE_APPOINTMENT: 'create_appointment',
  READ_APPOINTMENT: 'read_appointment',
  UPDATE_APPOINTMENT: 'update_appointment',
  DELETE_APPOINTMENT: 'delete_appointment',
  
  // Chat and messaging
  SEND_MESSAGE: 'send_message',
  READ_MESSAGE: 'read_message',
  DELETE_MESSAGE: 'delete_message',
  
  // Token operations
  TRANSFER_TOKENS: 'transfer_tokens',
  STAKE_TOKENS: 'stake_tokens',
  VIEW_BALANCE: 'view_balance',
  
  // System administration
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_SYSTEM: 'manage_system',
  VIEW_ANALYTICS: 'view_analytics'
};

// Role-based permission mapping
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Full system access
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.CREATE_APPOINTMENT,
    PERMISSIONS.READ_APPOINTMENT,
    PERMISSIONS.UPDATE_APPOINTMENT,
    PERMISSIONS.DELETE_APPOINTMENT,
    PERMISSIONS.SEND_MESSAGE,
    PERMISSIONS.READ_MESSAGE,
    PERMISSIONS.DELETE_MESSAGE,
    PERMISSIONS.TRANSFER_TOKENS,
    PERMISSIONS.STAKE_TOKENS,
    PERMISSIONS.VIEW_BALANCE,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_SYSTEM,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [ROLES.THERAPIST]: [
    // Therapist-specific permissions
    PERMISSIONS.READ_USER, // Can read patient profiles
    PERMISSIONS.CREATE_APPOINTMENT,
    PERMISSIONS.READ_APPOINTMENT,
    PERMISSIONS.UPDATE_APPOINTMENT,
    PERMISSIONS.SEND_MESSAGE,
    PERMISSIONS.READ_MESSAGE,
    PERMISSIONS.TRANSFER_TOKENS,
    PERMISSIONS.VIEW_BALANCE
  ],
  [ROLES.PATIENT]: [
    // Patient-specific permissions
    PERMISSIONS.READ_USER, // Can read own profile
    PERMISSIONS.UPDATE_USER, // Can update own profile
    PERMISSIONS.CREATE_APPOINTMENT,
    PERMISSIONS.READ_APPOINTMENT, // Own appointments
    PERMISSIONS.SEND_MESSAGE,
    PERMISSIONS.READ_MESSAGE,
    PERMISSIONS.TRANSFER_TOKENS,
    PERMISSIONS.STAKE_TOKENS,
    PERMISSIONS.VIEW_BALANCE
  ]
};

// In-memory storage for refresh tokens (in production, use Redis or database)
const refreshTokens = new Map(); // Store token with metadata
const revokedTokens = new Set(); // Blacklist for revoked tokens
const tokenRotationLog = new Map(); // Track token rotation history
const sessionTokens = new Map(); // Track active session tokens
const logoutEvents = new Map(); // Track logout events for security

// Rate limiting for authentication attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// JWT Token Generation with Enhanced Security
class JWTService {
  static generateAccessToken(payload) {
    const tokenId = this.generateTokenId();
    const enhancedPayload = {
      ...payload,
      jti: tokenId, // JWT ID for tracking
      iat: Math.floor(Date.now() / 1000),
      tokenType: 'access'
    };
    
    return jwt.sign(enhancedPayload, JWT_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRY,
      issuer: 'mentalverse-backend',
      audience: 'mentalverse-app'
    });
  }

  static generateRefreshToken(payload) {
    const tokenId = this.generateTokenId();
    const enhancedPayload = {
      ...payload,
      jti: tokenId,
      iat: Math.floor(Date.now() / 1000),
      tokenType: 'refresh'
    };
    
    const refreshToken = jwt.sign(enhancedPayload, JWT_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRY,
      issuer: 'mentalverse-backend',
      audience: 'mentalverse-app'
    });
    
    // Store refresh token with metadata
    refreshTokens.set(refreshToken, {
      tokenId,
      principal: payload.principal,
      sessionId: payload.sessionId,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      rotationCount: 0
    });
    
    return refreshToken;
  }

  static verifyToken(token) {
    if (revokedTokens.has(token)) {
      throw new Error('Token has been revoked');
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Update last used time for refresh tokens
    if (decoded.tokenType === 'refresh' && refreshTokens.has(token)) {
      const metadata = refreshTokens.get(token);
      metadata.lastUsed = Date.now();
      refreshTokens.set(token, metadata);
    }
    
    return decoded;
  }

  static revokeToken(token, reason = 'manual_revocation') {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const tokenId = decoded.jti;
      const sessionId = decoded.sessionId;
      
      revokedTokens.add(token);
      
      // Remove from refresh tokens if it's a refresh token
      if (decoded.tokenType === 'refresh') {
        refreshTokens.delete(token);
      }
      
      // Remove from active session tokens
      if (decoded.tokenType === 'access') {
        sessionTokens.delete(sessionId);
      }
      
      // Log the revocation
      tokenRotationLog.set(tokenId, {
        action: 'revoked',
        timestamp: Date.now(),
        reason,
        sessionId
      });
      
      console.log(`Token revoked: ${tokenId}, reason: ${reason}`);
      return true;
    } catch (error) {
      console.error('Token revocation error:', error.message);
      return false;
    }
  }

  static isRefreshTokenValid(token) {
    if (revokedTokens.has(token)) {
      return false;
    }
    
    const metadata = refreshTokens.get(token);
    if (!metadata) {
      return false;
    }
    
    // Check if token needs rotation based on age
    const tokenAge = Date.now() - metadata.createdAt;
    const rotationThreshold = this.parseTimeToMs(JWT_ROTATION_THRESHOLD);
    
    return tokenAge < rotationThreshold;
  }

  static shouldRotateRefreshToken(token) {
    const metadata = refreshTokens.get(token);
    if (!metadata) return false;
    
    const tokenAge = Date.now() - metadata.createdAt;
    const rotationThreshold = this.parseTimeToMs(JWT_ROTATION_THRESHOLD);
    
    return tokenAge >= rotationThreshold;
  }

  static rotateRefreshToken(oldToken) {
    const oldMetadata = refreshTokens.get(oldToken);
    if (!oldMetadata) {
      throw new Error('Invalid refresh token for rotation');
    }
    
    // Generate new refresh token
    const newToken = this.generateRefreshToken({
      principal: oldMetadata.principal,
      sessionId: oldMetadata.sessionId
    });
    
    // Update rotation count
    const newMetadata = refreshTokens.get(newToken);
    newMetadata.rotationCount = oldMetadata.rotationCount + 1;
    refreshTokens.set(newToken, newMetadata);
    
    // Revoke old token
    this.revokeToken(oldToken);
    
    // Log rotation
    tokenRotationLog.set(oldMetadata.tokenId, {
      oldToken: oldToken.substring(0, 20) + '...',
      newToken: newToken.substring(0, 20) + '...',
      rotatedAt: Date.now(),
      principal: oldMetadata.principal,
      rotationCount: newMetadata.rotationCount
    });
    
    return newToken;
  }

  static generateTokenId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  static parseTimeToMs(timeString) {
    const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const match = timeString.match(/^(\d+)([smhd])$/);
    if (!match) return 3600000; // Default 1 hour
    return parseInt(match[1]) * units[match[2]];
  }

  static getTokenStats() {
    return {
      activeRefreshTokens: refreshTokens.size,
      revokedTokens: revokedTokens.size,
      totalRotations: tokenRotationLog.size,
      activeSessions: sessionTokens.size,
      logoutEvents: logoutEvents.size
    };
  }

  // Invalidate all tokens for a session
  static invalidateSession(sessionId, reason = 'logout') {
    let invalidatedCount = 0;
    
    // Find and revoke all tokens for this session
    for (const [token, metadata] of refreshTokens.entries()) {
      if (metadata.sessionId === sessionId) {
        revokedTokens.add(token);
        refreshTokens.delete(token);
        invalidatedCount++;
      }
    }
    
    // Remove from active session tokens
    sessionTokens.delete(sessionId);
    
    // Log the session invalidation
    logoutEvents.set(sessionId, {
      timestamp: Date.now(),
      reason,
      tokensInvalidated: invalidatedCount
    });
    
    console.log(`Session ${sessionId} invalidated: ${invalidatedCount} tokens revoked`);
    return invalidatedCount;
  }
  
  // Revoke all tokens for a user (admin function)
  static revokeAllUserTokens(principal, reason = 'admin_revocation') {
    let revokedCount = 0;
    
    // Find all tokens for this principal
    for (const [token, metadata] of refreshTokens.entries()) {
      if (metadata.principal === principal) {
        revokedTokens.add(token);
        refreshTokens.delete(token);
        
        // Log the revocation
        tokenRotationLog.set(metadata.tokenId, {
          action: 'admin_revoked',
          timestamp: Date.now(),
          reason,
          principal
        });
        
        revokedCount++;
      }
    }
    
    console.log(`Revoked ${revokedCount} tokens for user: ${principal}`);
    return revokedCount;
  }
  
  // Check if a session is compromised
  static isSessionCompromised(sessionId) {
    const logoutEvent = logoutEvents.get(sessionId);
    return logoutEvent && logoutEvent.reason === 'security_breach';
  }
  
  static cleanupExpiredTokens() {
    const now = Date.now();
    const refreshExpiryMs = this.parseTimeToMs(JWT_REFRESH_EXPIRY);
    let cleanedCount = 0;
    
    // Clean up expired refresh tokens
    for (const [token, metadata] of refreshTokens.entries()) {
      if (now - metadata.createdAt > refreshExpiryMs) {
        refreshTokens.delete(token);
        revokedTokens.add(token);
        cleanedCount++;
      }
    }
    
    // Clean up old rotation logs (keep for 30 days)
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    for (const [tokenId, log] of tokenRotationLog.entries()) {
      if (log.timestamp < thirtyDaysAgo) {
        tokenRotationLog.delete(tokenId);
      }
    }
    
    // Clean up old logout events (keep for 30 days)
    for (const [sessionId, event] of logoutEvents.entries()) {
      if (event.timestamp < thirtyDaysAgo) {
        logoutEvents.delete(sessionId);
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired tokens`);
    }
    
    return {
      cleanedTokens: cleanedCount,
      activeRefreshTokens: refreshTokens.size,
      revokedTokens: revokedTokens.size,
      activeSessions: sessionTokens.size
    };
  }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'TOKEN_MISSING'
    });
  }

  try {
    const decoded = JWTService.verifyToken(token);
    req.user = decoded;
    
    // Update session activity if session exists
    if (decoded.sessionId) {
      userSession.updateSessionActivity(decoded.sessionId);
    }
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.message === 'Token has been revoked') {
      return res.status(401).json({ 
        error: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    } else {
      return res.status(403).json({ 
        error: 'Invalid access token',
        code: 'TOKEN_INVALID'
      });
    }
  }
};

// Role-based authorization middleware
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        code: 'INSUFFICIENT_ROLE'
      });
    }

    next();
  };
};

// Permission-based authorization middleware
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];
    
    const hasPermission = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        error: `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Resource ownership middleware (for patient data access)
const requireOwnership = (resourceIdParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role;
    const userId = req.user.principal;
    const resourceId = req.params[resourceIdParam] || req.body[resourceIdParam];

    // Admins can access any resource
    if (userRole === ROLES.ADMIN) {
      return next();
    }

    // Therapists can access their assigned patients' resources
    if (userRole === ROLES.THERAPIST) {
      // TODO: Implement therapist-patient relationship check
      // For now, allow therapists to access resources
      return next();
    }

    // Patients can only access their own resources
    if (userRole === ROLES.PATIENT) {
      if (resourceId && resourceId !== userId) {
        return res.status(403).json({ 
          error: 'Access denied. You can only access your own resources.',
          code: 'OWNERSHIP_REQUIRED'
        });
      }
    }

    next();
  };
};

// Session validation middleware
const requireValidSession = (req, res, next) => {
  if (!req.user || !req.user.sessionId) {
    return res.status(401).json({ 
      error: 'Valid session required',
      code: 'SESSION_REQUIRED'
    });
  }

  const session = userSession.getSession(req.user.sessionId);
  if (!session) {
    return res.status(401).json({ 
      error: 'Session expired or invalid',
      code: 'SESSION_INVALID'
    });
  }

  req.session = session;
  next();
};

// Audit logging middleware
const auditLog = (action, resourceType = 'unknown') => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response is sent
      const logData = {
        userId: req.user?.principal || 'anonymous',
        userRole: req.user?.role || 'unknown',
        action,
        resourceType,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        statusCode: res.statusCode,
        success: res.statusCode < 400
      };
      
      console.log('AUDIT:', JSON.stringify(logData));
      
      // In production, send to audit log service/database
      // auditLogService.log(logData);
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

export {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  JWTService,
  authenticateToken,
  requireRole,
  requirePermission,
  requireOwnership,
  requireValidSession,
  auditLog,
  authLimiter
};