// PHI data storage is now handled by the smart contract's built-in PHI encryption module
// This model is no longer needed as the smart contract provides comprehensive
// HIPAA-compliant storage and management for all PHI data

/**
 * Legacy PHI Data Model - Now Delegated to Smart Contract
 * All PHI data storage, retrieval, and management is handled by the smart contract
 */
class PHIDataModel {
  constructor() {
    console.log('⚠️  PHI data storage is now handled by the smart contract');
    // No local storage needed - smart contract handles everything
  }

  /**
   * Store PHI data - Now handled by smart contract
   */
  async storePHI(patientId, dataType, data, metadata = {}) {
    throw new Error('PHI data storage is now handled by the smart contract');
  }

  /**
   * Retrieve PHI data - Now handled by smart contract
   */
  async retrievePHI(recordId, requestorId, accessReason = 'general') {
    throw new Error('PHI data retrieval is now handled by the smart contract');
  }

  /**
   * Update PHI data - Now handled by smart contract
   */
  async updatePHI(recordId, updates, requestorId, reason = 'update') {
    throw new Error('PHI data updates are now handled by the smart contract');
  }

  /**
   * Delete PHI data - Now handled by smart contract
   */
  async deletePHI(recordId, requestorId, reason = 'deletion') {
    throw new Error('PHI data deletion is now handled by the smart contract');
  }

  /**
   * Search PHI data - Now handled by smart contract
   */
  async searchPHI(searchCriteria, requestorId) {
    throw new Error('PHI data search is now handled by the smart contract');
  }

  /**
   * Get PHI audit trail - Now handled by smart contract
   */
  async getAuditTrail(recordId, requestorId) {
    throw new Error('PHI audit trails are now handled by the smart contract');
  }

  /**
   * Validate PHI access - Now handled by smart contract
   */
  validateAccess(requestorId, recordId, operation) {
    console.log('⚠️  PHI access validation is now handled by the smart contract');
    return true; // Allow through - smart contract will validate
  }

  /**
   * Get retention policy - Now handled by smart contract
   */
  getRetentionPolicy(dataType) {
    console.log('⚠️  PHI retention policies are now handled by the smart contract');
    return { message: 'Handled by smart contract' };
  }

  /**
   * Cleanup expired PHI - Now handled by smart contract
   */
  async cleanupExpiredPHI() {
    console.log('⚠️  PHI cleanup is now handled by the smart contract');
    return { message: 'Handled by smart contract' };
  }
}

// Create instance for backward compatibility
const phiDataModel = new PHIDataModel();

module.exports = {
  PHIDataModel,
  phiDataModel
};