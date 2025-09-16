const { auditService } = require('../services/auditService');
const crypto = require('crypto');

/**
 * Audit Middleware for automatic security event logging
 */

/**
 * Middleware to log authentication events
 */
function auditAuthEvents() {
  return async (req, res, next) => {
    const originalJson = res.json;
    const startTime = Date.now();
    
    res.json = function(data) {
      // Log authentication event after response
      setImmediate(async () => {
        try {
          const eventData = {
            action: determineAuthAction(req.path, req.method, data),
            userId: req.user?.principal || req.body?.email || 'anonymous',
            sessionId: req.sessionID || generateSessionId(req),
            ipAddress: getClientIP(req),
            userAgent: req.headers['user-agent'],
            success: res.statusCode < 400,
            failureReason: res.statusCode >= 400 ? data?.error : null,
            tokenType: req.headers.authorization ? 'Bearer' : null,
            loginMethod: req.body?.loginMethod || 'password',
            deviceFingerprint: generateDeviceFingerprint(req),
            location: await getLocationFromIP(getClientIP(req)),
            riskScore: calculateRiskScore(req, res.statusCode)
          };
          
          await auditService.logAuthEvent(eventData);
        } catch (error) {
          console.error('❌ Failed to log auth event:', error);
        }
      });
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Middleware to log PHI access events
 */
function auditPHIAccess(resourceType = 'unknown') {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log PHI access event after response
      setImmediate(async () => {
        try {
          const eventData = {
            action: determinePHIAction(req.method),
            userId: req.user?.principal,
            patientId: req.params?.userId || req.body?.patientId || req.user?.principal,
            resourceType,
            resourceId: req.params?.id || req.params?.sessionId || req.body?.id,
            ipAddress: getClientIP(req),
            success: res.statusCode < 400,
            accessReason: req.body?.reason || 'treatment',
            dataClassification: 'PHI',
            encryptionStatus: 'encrypted',
            consentId: req.consentInfo?.consentId,
            auditTrail: {
              endpoint: req.path,
              method: req.method,
              timestamp: new Date().toISOString(),
              responseCode: res.statusCode
            }
          };
          
          await auditService.logPHIAccess(eventData);
        } catch (error) {
          console.error('❌ Failed to log PHI access:', error);
        }
      });
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Middleware to log session events
 */
function auditSessionEvents() {
  return async (req, res, next) => {
    const originalJson = res.json;
    const sessionStart = Date.now();
    
    res.json = function(data) {
      // Log session event after response
      setImmediate(async () => {
        try {
          const sessionDuration = Date.now() - sessionStart;
          const action = determineSessionAction(req.path, req.method, data);
          
          if (action) {
            const eventData = {
              action,
              userId: req.user?.principal,
              sessionId: req.params?.sessionId || req.body?.sessionId || req.sessionID,
              ipAddress: getClientIP(req),
              sessionDuration,
              sessionType: req.body?.sessionType || 'therapy',
              endReason: data?.reason || 'normal',
              participantCount: req.body?.participants?.length || 2,
              dataTransferred: JSON.stringify(data).length
            };
            
            await auditService.logSessionEvent(eventData);
          }
        } catch (error) {
          console.error('❌ Failed to log session event:', error);
        }
      });
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Middleware to log consent events
 */
function auditConsentEvents() {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log consent event after response
      setImmediate(async () => {
        try {
          const action = determineConsentAction(req.path, req.method);
          
          if (action) {
            const eventData = {
              action,
              userId: req.user?.principal,
              consentId: data?.consentId || req.body?.consentId,
              consentType: req.body?.consentType || 'PHI_STORAGE',
              ipAddress: getClientIP(req),
              consentVersion: req.body?.version || '1.0',
              previousConsentId: req.body?.previousConsentId,
              expirationDate: req.body?.expirationDate,
              withdrawalReason: req.body?.reason,
              legalBasis: req.body?.legalBasis || 'consent'
            };
            
            await auditService.logConsentEvent(eventData);
          }
        } catch (error) {
          console.error('❌ Failed to log consent event:', error);
        }
      });
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Middleware to log security events
 */
function auditSecurityEvents() {
  return async (req, res, next) => {
    try {
      // Check for suspicious activity
      const riskScore = calculateRiskScore(req, 200);
      const isRateLimited = res.statusCode === 429;
      const isUnauthorized = res.statusCode === 401 || res.statusCode === 403;
      
      if (riskScore > 70 || isRateLimited || isUnauthorized) {
        const eventData = {
          action: isRateLimited ? 'RATE_LIMIT_EXCEEDED' : 
                 isUnauthorized ? 'UNAUTHORIZED_ACCESS' : 'SUSPICIOUS_ACTIVITY',
          userId: req.user?.principal || 'anonymous',
          ipAddress: getClientIP(req),
          severity: riskScore > 90 ? 'CRITICAL' : riskScore > 70 ? 'HIGH' : 'MEDIUM',
          threatType: determineThreatType(req),
          attackVector: req.path,
          blockedRequests: isRateLimited ? 1 : 0,
          riskScore,
          mitigationActions: [
            isRateLimited ? 'rate_limit_applied' : null,
            isUnauthorized ? 'access_denied' : null
          ].filter(Boolean)
        };
        
        await auditService.logSecurityEvent(eventData);
      }
    } catch (error) {
      console.error('❌ Failed to log security event:', error);
    }
    
    next();
  };
}

/**
 * Middleware to log data operations (GDPR)
 */
function auditDataOperations() {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log data operation after response
      setImmediate(async () => {
        try {
          const action = determineDataOperation(req.path, req.method);
          
          if (action) {
            const eventData = {
              action,
              userId: req.user?.principal,
              dataSubject: req.params?.userId || req.body?.userId || req.user?.principal,
              ipAddress: getClientIP(req),
              success: res.statusCode < 400,
              dataTypes: req.body?.dataTypes || ['medical_records'],
              recordCount: data?.recordCount || 1,
              requestId: req.headers['x-request-id'] || crypto.randomUUID(),
              legalBasis: req.body?.legalBasis || 'consent',
              retentionPeriod: req.body?.retentionPeriod,
              deletionMethod: req.body?.deletionMethod || 'secure_deletion'
            };
            
            await auditService.logDataOperation(eventData);
          }
        } catch (error) {
          console.error('❌ Failed to log data operation:', error);
        }
      });
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Comprehensive audit middleware that logs all relevant events
 */
function auditAllEvents() {
  return async (req, res, next) => {
    // Add request ID for tracking
    req.auditId = crypto.randomUUID();
    req.auditStartTime = Date.now();
    
    // Log request start
    console.log(`🔍 Audit Start: ${req.method} ${req.path} - ID: ${req.auditId.substring(0, 8)}...`);
    
    const originalJson = res.json;
    
    res.json = function(data) {
      const duration = Date.now() - req.auditStartTime;
      
      // Log request completion
      console.log(`✅ Audit Complete: ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

// Helper functions

function determineAuthAction(path, method, responseData) {
  if (path.includes('/login')) return 'LOGIN';
  if (path.includes('/logout')) return 'LOGOUT';
  if (path.includes('/register')) return 'REGISTER';
  if (path.includes('/refresh')) return 'TOKEN_REFRESH';
  if (path.includes('/reset')) return 'PASSWORD_RESET';
  return 'AUTH_ACTION';
}

function determinePHIAction(method) {
  switch (method) {
    case 'GET': return 'READ';
    case 'POST': return 'create';
    case 'PUT':
    case 'PATCH': return 'update';
    case 'DELETE': return 'delete';
    default: return 'access';
  }
}

function determineSessionAction(path, method, responseData) {
  if (path.includes('/sessions') && method === 'POST') return 'SESSION_START';
  if (path.includes('/sessions') && method === 'DELETE') return 'SESSION_END';
  if (path.includes('/end')) return 'SESSION_END';
  if (responseData?.sessionEnded) return 'SESSION_END';
  return null;
}

function determineConsentAction(path, method) {
  if (path.includes('/consent') && method === 'POST') return 'CONSENT_GIVEN';
  if (path.includes('/consent') && method === 'PUT') return 'CONSENT_UPDATED';
  if (path.includes('/withdraw')) return 'CONSENT_WITHDRAWN';
  return null;
}

function determineDataOperation(path, method) {
  if (path.includes('/export')) return 'DATA_EXPORT';
  if (path.includes('/delete') || path.includes('/forget')) return 'DATA_DELETE';
  if (path.includes('/anonymize')) return 'DATA_ANONYMIZE';
  if (path.includes('/transfer')) return 'DATA_TRANSFER';
  return null;
}

function determineThreatType(req) {
  const userAgent = req.headers['user-agent'] || '';
  const path = req.path;
  
  if (userAgent.includes('bot') || userAgent.includes('crawler')) return 'automated_access';
  if (path.includes('admin') || path.includes('config')) return 'privilege_escalation';
  if (req.body && JSON.stringify(req.body).includes('<script>')) return 'xss_attempt';
  if (path.includes('..') || path.includes('%2e%2e')) return 'path_traversal';
  
  return 'unknown';
}

function calculateRiskScore(req, statusCode) {
  let score = 0;
  
  // Failed authentication
  if (statusCode === 401 || statusCode === 403) score += 30;
  
  // Suspicious user agent
  const userAgent = req.headers['user-agent'] || '';
  if (userAgent.includes('bot') || userAgent.includes('crawler')) score += 20;
  
  // Multiple failed attempts (would need session tracking)
  // score += req.session?.failedAttempts * 10 || 0;
  
  // Suspicious paths
  if (req.path.includes('admin') || req.path.includes('config')) score += 25;
  
  // Rate limiting indicators
  if (statusCode === 429) score += 40;
  
  // Time-based factors (off-hours access)
  const hour = new Date().getHours();
  if (hour < 6 || hour > 22) score += 10;
  
  return Math.min(score, 100);
}

function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.ip || 
         'unknown';
}

function generateDeviceFingerprint(req) {
  const components = [
    req.headers['user-agent'],
    req.headers['accept-language'],
    req.headers['accept-encoding'],
    getClientIP(req)
  ].filter(Boolean);
  
  return crypto.createHash('sha256')
    .update(components.join('|'))
    .digest('hex')
    .substring(0, 16);
}

function generateSessionId(req) {
  return crypto.createHash('sha256')
    .update(`${getClientIP(req)}${req.headers['user-agent']}${Date.now()}`)
    .digest('hex')
    .substring(0, 16);
}

async function getLocationFromIP(ip) {
  // In production, use a geolocation service
  // For now, return mock data
  return {
    country: 'Unknown',
    city: 'Unknown',
    coordinates: null
  };
}

module.exports = {
  auditAuthEvents,
  auditPHIAccess,
  auditSessionEvents,
  auditConsentEvents,
  auditSecurityEvents,
  auditDataOperations,
  auditAllEvents
};