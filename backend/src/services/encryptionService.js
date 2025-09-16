const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

/**
 * PHI Encryption Service for HIPAA Compliance
 * Handles encryption at rest and in transit with proper key management
 */
class PHIEncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.tagLength = 16; // 128 bits
    this.saltLength = 32; // 256 bits
    
    // Key derivation settings
    this.pbkdf2Iterations = 100000;
    this.scryptOptions = {
      N: 16384, // CPU/memory cost parameter
      r: 8,     // Block size parameter
      p: 1      // Parallelization parameter
    };
    
    // Master key for encryption (should be stored securely)
    this.masterKey = null;
    this.keyCache = new Map();
    
    this.initializeService();
  }

  async initializeService() {
    try {
      await this.loadOrGenerateMasterKey();
      console.log('✅ PHI Encryption Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize PHI Encryption Service:', error);
      throw error;
    }
  }

  /**
   * Load or generate master encryption key
   */
  async loadOrGenerateMasterKey() {
    const keyPath = path.join(__dirname, '..', '..', '.encryption-key');
    
    try {
      // Try to load existing key
      const keyData = await fs.readFile(keyPath);
      this.masterKey = Buffer.from(keyData.toString().trim(), 'hex');
      
      if (this.masterKey.length !== this.keyLength) {
        throw new Error('Invalid master key length');
      }
      
      console.log('🔑 Master encryption key loaded');
    } catch (error) {
      // Generate new master key if not found
      console.log('🔑 Generating new master encryption key');
      this.masterKey = crypto.randomBytes(this.keyLength);
      
      // Save key securely (in production, use HSM or key management service)
      await fs.writeFile(keyPath, this.masterKey.toString('hex'), { mode: 0o600 });
      console.log('🔑 Master encryption key saved');
    }
  }

  /**
   * Derive encryption key from master key and context
   */
  deriveKey(context, salt = null) {
    if (!salt) {
      salt = crypto.randomBytes(this.saltLength);
    }
    
    const cacheKey = `${context}:${salt.toString('hex')}`;
    if (this.keyCache.has(cacheKey)) {
      return { key: this.keyCache.get(cacheKey), salt };
    }
    
    // Use PBKDF2 for key derivation
    const derivedKey = crypto.pbkdf2Sync(
      this.masterKey,
      Buffer.concat([Buffer.from(context, 'utf8'), salt]),
      this.pbkdf2Iterations,
      this.keyLength,
      'sha256'
    );
    
    this.keyCache.set(cacheKey, derivedKey);
    return { key: derivedKey, salt };
  }

  /**
   * Encrypt PHI data with AES-256-GCM
   */
  encryptPHI(data, context = 'default') {
    try {
      if (!data) {
        throw new Error('No data provided for encryption');
      }

      // Convert data to buffer if it's not already
      const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data), 'utf8');
      
      // Derive encryption key
      const { key, salt } = this.deriveKey(context);
      
      // Generate random IV
      const iv = crypto.randomBytes(this.ivLength);
      
      // Create cipher
      const cipher = crypto.createCipher(this.algorithm, key, { iv });
      
      // Encrypt data
      const encrypted = Buffer.concat([
        cipher.update(dataBuffer),
        cipher.final()
      ]);
      
      // Get authentication tag
      const tag = cipher.getAuthTag();
      
      // Combine all components
      const result = {
        encrypted: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        salt: salt.toString('base64'),
        algorithm: this.algorithm,
        timestamp: Date.now()
      };
      
      return result;
    } catch (error) {
      console.error('❌ PHI Encryption failed:', error);
      throw new Error('Failed to encrypt PHI data');
    }
  }

  /**
   * Decrypt PHI data
   */
  decryptPHI(encryptedData, context = 'default') {
    try {
      if (!encryptedData || !encryptedData.encrypted) {
        throw new Error('Invalid encrypted data provided');
      }

      const {
        encrypted,
        iv,
        tag,
        salt,
        algorithm
      } = encryptedData;
      
      // Verify algorithm
      if (algorithm !== this.algorithm) {
        throw new Error('Unsupported encryption algorithm');
      }
      
      // Convert from base64
      const encryptedBuffer = Buffer.from(encrypted, 'base64');
      const ivBuffer = Buffer.from(iv, 'base64');
      const tagBuffer = Buffer.from(tag, 'base64');
      const saltBuffer = Buffer.from(salt, 'base64');
      
      // Derive decryption key
      const { key } = this.deriveKey(context, saltBuffer);
      
      // Create decipher
      const decipher = crypto.createDecipher(algorithm, key, { iv: ivBuffer });
      decipher.setAuthTag(tagBuffer);
      
      // Decrypt data
      const decrypted = Buffer.concat([
        decipher.update(encryptedBuffer),
        decipher.final()
      ]);
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(decrypted.toString('utf8'));
      } catch {
        return decrypted.toString('utf8');
      }
    } catch (error) {
      console.error('❌ PHI Decryption failed:', error);
      throw new Error('Failed to decrypt PHI data');
    }
  }

  /**
   * Encrypt data for transmission (additional layer)
   */
  encryptForTransmission(data, recipientPublicKey = null) {
    try {
      // First encrypt with symmetric encryption
      const symmetricEncrypted = this.encryptPHI(data, 'transmission');
      
      if (recipientPublicKey) {
        // Additional asymmetric encryption for key exchange
        const sessionKey = crypto.randomBytes(this.keyLength);
        const encryptedSessionKey = crypto.publicEncrypt(
          {
            key: recipientPublicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
          },
          sessionKey
        );
        
        return {
          ...symmetricEncrypted,
          encryptedSessionKey: encryptedSessionKey.toString('base64'),
          keyExchange: 'rsa-oaep'
        };
      }
      
      return symmetricEncrypted;
    } catch (error) {
      console.error('❌ Transmission encryption failed:', error);
      throw new Error('Failed to encrypt data for transmission');
    }
  }

  /**
   * Hash sensitive data for indexing (one-way)
   */
  hashForIndexing(data, context = 'index') {
    try {
      const salt = crypto.randomBytes(this.saltLength);
      const hash = crypto.scryptSync(
        Buffer.from(data, 'utf8'),
        salt,
        64,
        this.scryptOptions
      );
      
      return {
        hash: hash.toString('base64'),
        salt: salt.toString('base64'),
        algorithm: 'scrypt',
        context
      };
    } catch (error) {
      console.error('❌ Hashing failed:', error);
      throw new Error('Failed to hash data for indexing');
    }
  }

  /**
   * Verify hashed data
   */
  verifyHash(data, hashData) {
    try {
      const { hash, salt, algorithm } = hashData;
      
      if (algorithm !== 'scrypt') {
        throw new Error('Unsupported hash algorithm');
      }
      
      const saltBuffer = Buffer.from(salt, 'base64');
      const computedHash = crypto.scryptSync(
        Buffer.from(data, 'utf8'),
        saltBuffer,
        64,
        this.scryptOptions
      );
      
      const expectedHash = Buffer.from(hash, 'base64');
      return crypto.timingSafeEqual(computedHash, expectedHash);
    } catch (error) {
      console.error('❌ Hash verification failed:', error);
      return false;
    }
  }

  /**
   * Secure key rotation
   */
  async rotateKeys() {
    try {
      console.log('🔄 Starting key rotation...');
      
      // Clear key cache
      this.keyCache.clear();
      
      // Generate new master key
      const oldMasterKey = this.masterKey;
      this.masterKey = crypto.randomBytes(this.keyLength);
      
      // Save new master key
      const keyPath = path.join(__dirname, '..', '..', '.encryption-key');
      await fs.writeFile(keyPath, this.masterKey.toString('hex'), { mode: 0o600 });
      
      console.log('✅ Key rotation completed');
      
      return {
        rotated: true,
        timestamp: Date.now(),
        oldKeyHash: crypto.createHash('sha256').update(oldMasterKey).digest('hex').substring(0, 8)
      };
    } catch (error) {
      console.error('❌ Key rotation failed:', error);
      throw new Error('Failed to rotate encryption keys');
    }
  }

  /**
   * Get encryption status and metrics
   */
  getEncryptionStatus() {
    return {
      algorithm: this.algorithm,
      keyLength: this.keyLength,
      masterKeyLoaded: !!this.masterKey,
      cacheSize: this.keyCache.size,
      pbkdf2Iterations: this.pbkdf2Iterations,
      initialized: !!this.masterKey
    };
  }

  /**
   * Clear sensitive data from memory
   */
  clearSensitiveData() {
    if (this.masterKey) {
      this.masterKey.fill(0);
      this.masterKey = null;
    }
    this.keyCache.clear();
    console.log('🧹 Sensitive encryption data cleared from memory');
  }
}

// Export singleton instance
const phiEncryption = new PHIEncryptionService();

module.exports = {
  PHIEncryptionService,
  phiEncryption
};