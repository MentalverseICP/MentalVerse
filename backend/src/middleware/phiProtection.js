// PHI protection is now handled by the smart contract's built-in PHI encryption module
// This middleware is no longer needed as the smart contract provides comprehensive
// HIPAA-compliant encryption and protection for all PHI data

/**
 * Legacy PHI Protection Middleware - Now Delegated to Smart Contract
 * All PHI encryption, decryption, and protection is handled by the smart contract
 */

// PHI fields are now managed by the smart contract
const PHI_FIELDS = {
  // This mapping is maintained for reference only
  // All actual PHI handling is done by the smart contract
};

const INDEXABLE_FIELDS = {
  // This mapping is maintained for reference only
  // All actual indexing is done by the smart contract
};

/**
 * Middleware to encrypt PHI data - Now handled by smart contract
 */
function encryptPHIMiddleware(options = {}) {
  return async (req, res, next) => {
    console.log('⚠️  PHI encryption is now handled by the smart contract');
    // Pass through without processing - smart contract handles PHI encryption
    next();
  };
}

/**
 * Middleware to decrypt PHI data - Now handled by smart contract
 */
function decryptPHIMiddleware(options = {}) {
  return async (req, res, next) => {
    console.log('⚠️  PHI decryption is now handled by the smart contract');
    // Pass through without processing - smart contract handles PHI decryption
    next();
  };
}

/**
 * Encrypt chat message - Now handled by smart contract
 */
function encryptChatMessage(message, userId) {
  throw new Error('Chat message encryption is now handled by the smart contract');
}

/**
 * Encrypt session notes - Now handled by smart contract
 */
function encryptSessionNotes(notes, sessionId, therapistId) {
  throw new Error('Session notes encryption is now handled by the smart contract');
}

/**
 * Audit PHI access - Now handled by smart contract
 */
function auditPHIAccess(userId, operation, dataType, success = true, error = null) {
  console.log('⚠️  PHI access auditing is now handled by the smart contract');
  // Smart contract handles all PHI access auditing
}

/**
 * Validate PHI access - Now handled by smart contract
 */
function validatePHIAccess(userId, operation, dataType) {
  console.log('⚠️  PHI access validation is now handled by the smart contract');
  // Smart contract handles all PHI access validation
  return true; // Allow through - smart contract will validate
}

module.exports = {
  encryptPHIMiddleware,
  decryptPHIMiddleware,
  encryptChatMessage,
  encryptSessionNotes,
  auditPHIAccess,
  validatePHIAccess,
  PHI_FIELDS,
  INDEXABLE_FIELDS
};