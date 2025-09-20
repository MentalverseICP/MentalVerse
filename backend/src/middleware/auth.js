// Authentication middleware - Now proxied to smart contract
import rateLimit from 'express-rate-limit';
import { icAgent } from '../ic-integration/icAgent.js';

// Role definitions - kept for reference
const ROLES = {
  ADMIN: 'admin',
  THERAPIST: 'therapist', 
  PATIENT: 'patient'
};

// Permission definitions - kept for reference
const PERMISSIONS = {
  CREATE_USER: 'create:user',
  READ_USER: 'read:user',
  UPDATE_USER: 'update:user',
  DELETE_USER: 'delete:user',
  CREATE_APPOINTMENT: 'create:appointment',
  READ_APPOINTMENT: 'read:appointment',
  UPDATE_APPOINTMENT: 'update:appointment',
  DELETE_APPOINTMENT: 'delete:appointment',
  SEND_MESSAGE: 'send:message',
  READ_MESSAGE: 'read:message',
  DELETE_MESSAGE: 'delete:message',
  TRANSFER_TOKENS: 'transfer:tokens',
  STAKE_TOKENS: 'stake:tokens',
  VIEW_BALANCE: 'view:balance',
  VIEW_AUDIT_LOGS: 'view:audit_logs',
  MANAGE_SYSTEM: 'manage:system',
  VIEW_ANALYTICS: 'view:analytics'
};

// Legacy role permissions mapping - kept for reference
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
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
    PERMISSIONS.READ_USER,
    PERMISSIONS.CREATE_APPOINTMENT,
    PERMISSIONS.READ_APPOINTMENT,
    PERMISSIONS.UPDATE_APPOINTMENT,
    PERMISSIONS.SEND_MESSAGE,
    PERMISSIONS.READ_MESSAGE,
    PERMISSIONS.TRANSFER_TOKENS,
    PERMISSIONS.VIEW_BALANCE
  ],
  [ROLES.PATIENT]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.CREATE_APPOINTMENT,
    PERMISSIONS.READ_APPOINTMENT,
    PERMISSIONS.SEND_MESSAGE,
    PERMISSIONS.READ_MESSAGE,
    PERMISSIONS.TRANSFER_TOKENS,
    PERMISSIONS.STAKE_TOKENS,
    PERMISSIONS.VIEW_BALANCE
  ]
};

// Rate limiting for authentication - now handled by smart contract
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased since smart contract handles actual rate limiting
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => {
    // Skip local rate limiting since smart contract handles it
    return true;
  }
});

/**
 * Authentication middleware - proxied to smart contract
 * Validates tokens and sets user context from smart contract
 */
const authenticateToken = async (req, res, next) => {
  console.warn('authenticateToken: Authentication now handled by smart contract');
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'TOKEN_REQUIRED'
    });
  }

  try {
    // Validate token with smart contract
    const authResult = await icAgent.callCanisterMethod('validateToken', {
      token,
      endpoint: req.path,
      method: req.method
    });
    
    if (!authResult.isValid) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
    }
    
    // Set user info from smart contract response
    req.user = {
      principal: authResult.principal,
      role: authResult.role,
      profile: authResult.profile,
      permissions: authResult.permissions || []
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication service unavailable',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

/**
 * Role-based authorization middleware - proxied to smart contract
 */
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    console.warn('requireRole: Role authorization now handled by smart contract');
    
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    try {
      // Check role authorization with smart contract
      const authResult = await icAgent.callCanisterMethod('checkRoleAuthorization', {
        principal: req.user.principal,
        requiredRoles: allowedRoles,
        endpoint: req.path,
        method: req.method
      });

      if (!authResult.isAuthorized) {
        return res.status(403).json({
          error: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          code: 'INSUFFICIENT_ROLE'
        });
      }

      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      return res.status(500).json({
        error: 'Authorization service unavailable',
        code: 'AUTH_SERVICE_ERROR'
      });
    }
  };
};

/**
 * Permission-based authorization middleware - proxied to smart contract
 */
const requirePermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    console.warn('requirePermission: Permission authorization now handled by smart contract');
    
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    try {
      // Check permission authorization with smart contract
      const authResult = await icAgent.callCanisterMethod('checkPermissionAuthorization', {
        principal: req.user.principal,
        requiredPermissions,
        endpoint: req.path,
        method: req.method
      });

      if (!authResult.isAuthorized) {
        return res.status(403).json({ 
          error: `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    } catch (error) {
      console.error('Permission authorization error:', error);
      return res.status(500).json({
        error: 'Authorization service unavailable',
        code: 'AUTH_SERVICE_ERROR'
      });
    }
  };
};

/**
 * Resource ownership middleware - proxied to smart contract
 */
const requireOwnership = (resourceIdParam = 'id') => {
  return async (req, res, next) => {
    console.warn('requireOwnership: Ownership validation now handled by smart contract');
    
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const resourceId = req.params[resourceIdParam] || req.body[resourceIdParam];

    try {
      // Check resource ownership with smart contract
      const ownershipResult = await icAgent.callCanisterMethod('checkResourceOwnership', {
        principal: req.user.principal,
        resourceId,
        resourceType: req.path.split('/')[1], // Extract resource type from path
        operation: req.method
      });

      if (!ownershipResult.hasAccess) {
        return res.status(403).json({ 
          error: 'Access denied. You can only access your own resources.',
          code: 'OWNERSHIP_REQUIRED'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership validation error:', error);
      return res.status(500).json({
        error: 'Authorization service unavailable',
        code: 'AUTH_SERVICE_ERROR'
      });
    }
  };
};

/**
 * Session validation middleware - proxied to smart contract
 */
const requireValidSession = async (req, res, next) => {
  console.warn('requireValidSession: Session validation now handled by smart contract');
  
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  try {
    // Validate session with smart contract
    const sessionResult = await icAgent.callCanisterMethod('validateSession', {
      principal: req.user.principal,
      sessionToken: req.headers['x-session-token']
    });

    if (!sessionResult.isValid) {
      return res.status(401).json({ 
        error: 'Session expired or invalid',
        code: 'SESSION_INVALID'
      });
    }

    req.session = sessionResult.session;
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    return res.status(500).json({
      error: 'Session service unavailable',
      code: 'SESSION_SERVICE_ERROR'
    });
  }
};

/**
 * Audit logging middleware - now handled by smart contract
 */
const auditLog = (action, category = 'general') => {
  return async (req, res, next) => {
    console.warn('auditLog: Audit logging now handled by smart contract');
    
    try {
      // Log action to smart contract (fire and forget)
      icAgent.callCanisterMethod('logAuditEvent', {
        principal: req.user?.principal,
        action,
        category,
        endpoint: req.path,
        method: req.method,
        timestamp: Date.now()
      }).catch(error => {
        console.error('Audit logging failed:', error);
      });
    } catch (error) {
      console.error('Audit logging error:', error);
    }
    
    next();
  };
};

export {
  authenticateToken,
  requireRole,
  requirePermission,
  requireOwnership,
  requireValidSession,
  auditLog,
  authLimiter,
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS
};