// PHI encryption is now handled by the smart contract's built-in PHI encryption module
// This service is no longer needed as the smart contract provides comprehensive
// HIPAA-compliant encryption for all PHI data

class PHIEncryptionService {
  constructor() {
    console.log('⚠️  PHI encryption is now handled by the smart contract');
  }

  // All encryption methods are now handled by the smart contract
  encryptPHI(data, context = 'default') {
    throw new Error('PHI encryption is now handled by the smart contract');
  }

  decryptPHI(encryptedData, context = 'default') {
    throw new Error('PHI decryption is now handled by the smart contract');
  }

  encryptForTransmission(data, recipientPublicKey = null) {
    throw new Error('Transmission encryption is now handled by the smart contract');
  }

  hashForIndexing(data, context = 'index') {
    throw new Error('Hashing is now handled by the smart contract');
  }

  verifyHash(data, hashData) {
    throw new Error('Hash verification is now handled by the smart contract');
  }

  async rotateKeys() {
    throw new Error('Key rotation is now handled by the smart contract');
  }

  getEncryptionStatus() {
    return {
      status: 'delegated_to_smart_contract',
      message: 'PHI encryption is handled by the smart contract'
    };
  }

  clearSensitiveData() {
    // No sensitive data to clear as everything is handled by smart contract
    console.log('No sensitive data to clear - handled by smart contract');
  }
}

// Create instance for backward compatibility
const phiEncryption = new PHIEncryptionService();

module.exports = {
  PHIEncryptionService,
  phiEncryption
};