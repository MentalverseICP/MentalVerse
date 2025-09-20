// Audit Middleware - Now handled by smart contract
// All audit logging operations are managed by the smart contract's comprehensive audit system

/**
 * Legacy audit middleware - Smart contract handles all audit logging
 * These functions are kept as stubs to prevent breaking existing code
 */

/**
 * Middleware to log authentication events - Now handled by smart contract
 */
function auditAuthEvents() {
  return (req, res, next) => {
    console.log('⚠️  Authentication event auditing is now handled by the smart contract');
    // Smart contract handles all authentication event logging
    next();
  };
}

/**
 * Middleware to log PHI access events - Now handled by smart contract
 */
function auditPHIAccess(resourceType = 'unknown') {
  return (req, res, next) => {
    console.log('⚠️  PHI access auditing is now handled by the smart contract');
    // Smart contract handles all PHI access logging
    next();
  };
}

/**
 * Middleware to log session events - Now handled by smart contract
 */
function auditSessionEvents() {
  return (req, res, next) => {
    console.log('⚠️  Session event auditing is now handled by the smart contract');
    // Smart contract handles all session event logging
    next();
  };
}

/**
 * Middleware to log security events - Now handled by smart contract
 */
function auditSecurityEvents() {
  return (req, res, next) => {
    console.log('⚠️  Security event auditing is now handled by the smart contract');
    // Smart contract handles all security event logging
    next();
  };
}

/**
 * Middleware to log data operations (GDPR) - Now handled by smart contract
 */
function auditDataOperations() {
  return (req, res, next) => {
    console.log('⚠️  Data operation auditing is now handled by the smart contract');
    // Smart contract handles all GDPR data operation logging
    next();
  };
}

/**
 * Comprehensive audit middleware - Now handled by smart contract
 */
function auditAllEvents() {
  return (req, res, next) => {
    console.log('⚠️  Comprehensive auditing is now handled by the smart contract');
    // Smart contract handles all audit events
    next();
  };
}

// Helper functions - Now handled by smart contract
function getClientIP(req) {
  return req.ip || req.connection.remoteAddress || 'unknown';
}

function generateSessionId(req) {
  return req.sessionID || 'unknown';
}

function generateDeviceFingerprint(req) {
  return 'handled_by_smart_contract';
}

function calculateRiskScore(req, statusCode) {
  return 0; // Smart contract calculates risk scores
}

function determineAuthAction(path, method, data) {
  return 'handled_by_smart_contract';
}

function determinePHIAction(method) {
  return 'handled_by_smart_contract';
}

function determineSessionAction(path, method, data) {
  return 'handled_by_smart_contract';
}

function determineThreatType(req) {
  return 'handled_by_smart_contract';
}

function determineDataOperation(path, method) {
  return 'handled_by_smart_contract';
}

async function getLocationFromIP(ip) {
  return 'handled_by_smart_contract';
}

export {
  auditAuthEvents,
  auditPHIAccess,
  auditSessionEvents,
  auditSecurityEvents,
  auditDataOperations,
  auditAllEvents,
  getClientIP,
  generateSessionId,
  generateDeviceFingerprint,
  calculateRiskScore,
  determineAuthAction,
  determinePHIAction,
  determineSessionAction,
  determineThreatType,
  determineDataOperation,
  getLocationFromIP
};

// Default export for backward compatibility
export default {
  auditAuthEvents,
  auditPHIAccess,
  auditSessionEvents,
  auditSecurityEvents,
  auditDataOperations,
  auditAllEvents
};