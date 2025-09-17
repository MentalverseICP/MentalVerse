import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Random "mo:base/Random";

module {
    // === PHI ENCRYPTION TYPES ===
    
    // Types of PHI data that can be encrypted
    public type PHIDataType = {
        #medical_history;
        #allergies;
        #medications;
        #personal_info;     // DOB, SSN, etc.
        #contact_info;      // Phone, address
        #emergency_contact;
        #session_notes;
        #prescription_data;
    };
    
    // Encrypted PHI data structure
    public type EncryptedPHI = {
        encryptedData: Blob;        // AES-256-GCM encrypted data
        nonce: Blob;               // 12-byte nonce for GCM
        keyId: Text;               // Reference to encryption key
        dataType: PHIDataType;     // Type of PHI data encrypted
        timestamp: Int;            // When encrypted
    };
    
    // PHI encryption key management
    public type PHIEncryptionKey = {
        keyId: Text;
        keyHash: Blob;             // Hash of the actual key (not the key itself)
        purpose: PHIDataType;
        createdAt: Int;
        isActive: Bool;
        rotationSchedule: ?Int;    // When to rotate this key
    };
    
    // Encrypted patient data with PHI protection
    public type EncryptedPatientPHI = {
        patientId: Principal;
        encryptedMedicalHistory: ?EncryptedPHI;
        encryptedAllergies: ?EncryptedPHI;
        encryptedCurrentMedications: ?EncryptedPHI;
        encryptedPersonalInfo: ?EncryptedPHI;  // DOB, SSN, etc.
        encryptedContactInfo: ?EncryptedPHI;   // Phone, address
        encryptedEmergencyContact: ?EncryptedPHI;
        lastUpdated: Int;
    };
    
    // Key rotation status
    public type KeyRotationStatus = {
        #pending;
        #in_progress;
        #completed;
        #failed: Text;
    };
    
    // PHI access audit record
    public type PHIAccessAudit = {
        accessId: Text;
        userId: Principal;
        dataType: PHIDataType;
        operation: Text;  // "encrypt", "decrypt", "key_rotation"
        timestamp: Int;
        success: Bool;
        errorMessage: ?Text;
    };
    
    // === PHI ENCRYPTION CLASS ===
    
    public class PHIEncryption() {
        // Non-stable HashMaps for runtime operations (removed stable keyword)
        private var encryptedPatientPHI = HashMap.HashMap<Principal, EncryptedPatientPHI>(10, Principal.equal, Principal.hash);
        private var phiEncryptionKeys = HashMap.HashMap<Text, PHIEncryptionKey>(50, Text.equal, Text.hash);
        private var userPHIKeys = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash); // Maps user to their PHI key ID
        private var phiAccessAudit = HashMap.HashMap<Text, PHIAccessAudit>(100, Text.equal, Text.hash);
        private var keyRotationSchedule = HashMap.HashMap<Text, Int>(50, Text.equal, Text.hash);
        
        // Constants
        private let KEY_ROTATION_INTERVAL : Int = 90 * 24 * 60 * 60 * 1_000_000_000; // 90 days in nanoseconds
        private let _MAX_KEY_AGE : Int = 365 * 24 * 60 * 60 * 1_000_000_000; // 1 year in nanoseconds
        private let NONCE_SIZE : Nat = 12; // 12 bytes for AES-GCM
        
        // === INITIALIZATION FROM EXTERNAL STABLE STORAGE ===
        
        public func initFromStableStorage(
            encryptedPatientPHIEntries: [(Principal, EncryptedPatientPHI)],
            phiEncryptionKeysEntries: [(Text, PHIEncryptionKey)],
            userPHIKeysEntries: [(Principal, Text)],
            phiAccessAuditEntries: [(Text, PHIAccessAudit)],
            keyRotationScheduleEntries: [(Text, Int)]
        ) {
            // Restore PHI encryption data from stable storage
            for ((userId, phi) in encryptedPatientPHIEntries.vals()) {
                encryptedPatientPHI.put(userId, phi);
            };
            for ((keyId, key) in phiEncryptionKeysEntries.vals()) {
                phiEncryptionKeys.put(keyId, key);
            };
            for ((userId, keyId) in userPHIKeysEntries.vals()) {
                userPHIKeys.put(userId, keyId);
            };
            for ((auditId, audit) in phiAccessAuditEntries.vals()) {
                phiAccessAudit.put(auditId, audit);
            };
            for ((keyId, rotationTime) in keyRotationScheduleEntries.vals()) {
                keyRotationSchedule.put(keyId, rotationTime);
            };
        };
        
        public func exportStableStorage() : {
            encryptedPatientPHIEntries: [(Principal, EncryptedPatientPHI)];
            phiEncryptionKeysEntries: [(Text, PHIEncryptionKey)];
            userPHIKeysEntries: [(Principal, Text)];
            phiAccessAuditEntries: [(Text, PHIAccessAudit)];
            keyRotationScheduleEntries: [(Text, Int)];
        } {
            {
                encryptedPatientPHIEntries = Iter.toArray(encryptedPatientPHI.entries());
                phiEncryptionKeysEntries = Iter.toArray(phiEncryptionKeys.entries());
                userPHIKeysEntries = Iter.toArray(userPHIKeys.entries());
                phiAccessAuditEntries = Iter.toArray(phiAccessAudit.entries());
                keyRotationScheduleEntries = Iter.toArray(keyRotationSchedule.entries());
            }
        };
        
        // === KEY MANAGEMENT ===
        
        // Generate a new PHI encryption key
        public func generatePHIKey(purpose: PHIDataType, userId: Principal) : async Result.Result<Text, Text> {
            let now = Time.now();
            let keyId = generateKeyId(userId, purpose, now);
            
            // Generate random key material (in production, use proper HSM)
            let keyMaterial = generateSecureRandomBytes(32); // 256-bit key
            let keyHash = hashKeyMaterial(keyMaterial);
            
            let newKey : PHIEncryptionKey = {
                keyId = keyId;
                keyHash = keyHash;
                purpose = purpose;
                createdAt = now;
                isActive = true;
                rotationSchedule = ?(now + KEY_ROTATION_INTERVAL);
            };
            
            phiEncryptionKeys.put(keyId, newKey);
            userPHIKeys.put(userId, keyId);
            
            // Schedule key rotation
            keyRotationSchedule.put(keyId, now + KEY_ROTATION_INTERVAL);
            
            // Audit key generation
            logPHIAccess(userId, purpose, "key_generation", true, null);
            
            #ok(keyId)
        };
        
        // Get PHI encryption key
        public func getPHIKey(keyId: Text) : ?PHIEncryptionKey {
            phiEncryptionKeys.get(keyId)
        };
        
        // Get user's PHI key ID
        public func getUserPHIKeyId(userId: Principal) : ?Text {
            userPHIKeys.get(userId)
        };
        
        // Rotate PHI encryption key
        public func rotatePHIKey(keyId: Text, userId: Principal) : async Result.Result<Text, Text> {
            switch (phiEncryptionKeys.get(keyId)) {
                case null { #err("Key not found") };
                case (?oldKey) {
                    // Deactivate old key
                    let deactivatedKey = {
                        oldKey with isActive = false;
                    };
                    phiEncryptionKeys.put(keyId, deactivatedKey);
                    
                    // Generate new key
                    let result = await generatePHIKey(oldKey.purpose, userId);
                    switch (result) {
                        case (#ok(newKeyId)) {
                            logPHIAccess(userId, oldKey.purpose, "key_rotation", true, null);
                            #ok(newKeyId)
                        };
                        case (#err(msg)) {
                            logPHIAccess(userId, oldKey.purpose, "key_rotation", false, ?msg);
                            #err(msg)
                        };
                    };
                };
            };
        };
        
        // === PHI ENCRYPTION OPERATIONS ===
        
        // Encrypt PHI data
        public func encryptPHI(data: Text, dataType: PHIDataType, userId: Principal) : async Result.Result<EncryptedPHI, Text> {
            // Get user's PHI key
            switch (userPHIKeys.get(userId)) {
                case null { 
                    // Generate new key if none exists
                    let keyResult = await generatePHIKey(dataType, userId);
                    switch (keyResult) {
                        case (#err(msg)) { return #err("Failed to generate PHI key: " # msg) };
                        case (#ok(keyId)) {
                            return performEncryption(data, dataType, keyId, userId);
                        };
                    };
                };
                case (?keyId) {
                    return performEncryption(data, dataType, keyId, userId);
                };
            };
        };
        
        // Decrypt PHI data
        public func decryptPHI(encryptedPHI: EncryptedPHI, userId: Principal) : Result.Result<Text, Text> {
            // Verify key access
            switch (phiEncryptionKeys.get(encryptedPHI.keyId)) {
                case null { 
                    logPHIAccess(userId, encryptedPHI.dataType, "decrypt", false, ?"Key not found");
                    #err("Encryption key not found")
                };
                case (?key) {
                    if (not key.isActive) {
                        logPHIAccess(userId, encryptedPHI.dataType, "decrypt", false, ?"Key inactive");
                        return #err("Encryption key is inactive");
                    };
                    
                    // Perform decryption (simplified - in production use proper AES-GCM)
                    let decryptedData = performDecryption(encryptedPHI);
                    switch (decryptedData) {
                        case (#ok(data)) {
                            logPHIAccess(userId, encryptedPHI.dataType, "decrypt", true, null);
                            #ok(data)
                        };
                        case (#err(msg)) {
                            logPHIAccess(userId, encryptedPHI.dataType, "decrypt", false, ?msg);
                            #err(msg)
                        };
                    };
                };
            };
        };
        
        // === PATIENT PHI MANAGEMENT ===
        
        // Store encrypted patient PHI
        public func storePatientPHI(patientId: Principal, phi: EncryptedPatientPHI) {
            encryptedPatientPHI.put(patientId, phi);
        };
        
        // Get encrypted patient PHI
        public func getPatientPHI(patientId: Principal) : ?EncryptedPatientPHI {
            encryptedPatientPHI.get(patientId)
        };
        
        // Delete patient PHI
        public func deletePatientPHI(patientId: Principal) {
            encryptedPatientPHI.delete(patientId);
        };
        
        // Get all patient PHI records
        public func getAllPatientPHI() : [(Principal, EncryptedPatientPHI)] {
            Iter.toArray(encryptedPatientPHI.entries())
        };
        
        // Update specific PHI field for patient
        public func updatePatientPHIField(patientId: Principal, fieldType: PHIDataType, encryptedData: EncryptedPHI) : Result.Result<(), Text> {
            switch (encryptedPatientPHI.get(patientId)) {
                case null { #err("Patient PHI record not found") };
                case (?existingPHI) {
                    let updatedPHI = switch (fieldType) {
                        case (#medical_history) { { existingPHI with encryptedMedicalHistory = ?encryptedData; lastUpdated = Time.now() } };
                        case (#allergies) { { existingPHI with encryptedAllergies = ?encryptedData; lastUpdated = Time.now() } };
                        case (#medications) { { existingPHI with encryptedCurrentMedications = ?encryptedData; lastUpdated = Time.now() } };
                        case (#personal_info) { { existingPHI with encryptedPersonalInfo = ?encryptedData; lastUpdated = Time.now() } };
                        case (#contact_info) { { existingPHI with encryptedContactInfo = ?encryptedData; lastUpdated = Time.now() } };
                        case (#emergency_contact) { { existingPHI with encryptedEmergencyContact = ?encryptedData; lastUpdated = Time.now() } };
                        case (_) { return #err("Unsupported PHI field type for patient record") };
                    };
                    encryptedPatientPHI.put(patientId, updatedPHI);
                    #ok(())
                };
            };
        };
        
        // === KEY ROTATION MANAGEMENT ===
        
        // Check for keys that need rotation
        public func checkKeyRotationNeeded() : [(Text, PHIEncryptionKey)] {
            let now = Time.now();
            let keysNeedingRotation = Array.filter<(Text, PHIEncryptionKey)>(
                Iter.toArray(phiEncryptionKeys.entries()),
                func((keyId, key)) : Bool {
                    switch (key.rotationSchedule) {
                        case null { false };
                        case (?rotationTime) { now >= rotationTime and key.isActive };
                    };
                }
            );
            keysNeedingRotation
        };
        
        // Schedule key rotation
        public func scheduleKeyRotation(keyId: Text, rotationTime: Int) : Result.Result<(), Text> {
            switch (phiEncryptionKeys.get(keyId)) {
                case null { #err("Key not found") };
                case (?key) {
                    let updatedKey = {
                        key with rotationSchedule = ?rotationTime;
                    };
                    phiEncryptionKeys.put(keyId, updatedKey);
                    keyRotationSchedule.put(keyId, rotationTime);
                    #ok(())
                };
            };
        };
        
        // === AUDIT AND COMPLIANCE ===
        
        // Log PHI access for audit purposes (now synchronous)
        private func logPHIAccess(userId: Principal, dataType: PHIDataType, operation: Text, success: Bool, errorMessage: ?Text) {
            let auditId = generateAuditId(userId, operation, Time.now());
            let auditRecord : PHIAccessAudit = {
                accessId = auditId;
                userId = userId;
                dataType = dataType;
                operation = operation;
                timestamp = Time.now();
                success = success;
                errorMessage = errorMessage;
            };
            phiAccessAudit.put(auditId, auditRecord);
        };
        
        // Get PHI access audit logs for a user
        public func getPHIAuditLogs(userId: Principal) : [PHIAccessAudit] {
            let userAudits = Array.filter<PHIAccessAudit>(
                Iter.toArray(phiAccessAudit.vals()),
                func(audit) : Bool { audit.userId == userId }
            );
            userAudits
        };
        
        // Get all audit logs
        public func getAllAuditLogs() : [PHIAccessAudit] {
            Iter.toArray(phiAccessAudit.vals())
        };
        
        // Get audit logs by operation type
        public func getAuditLogsByOperation(operation: Text) : [PHIAccessAudit] {
            Array.filter<PHIAccessAudit>(
                Iter.toArray(phiAccessAudit.vals()),
                func(audit) : Bool { audit.operation == operation }
            )
        };
        
        // === UTILITY FUNCTIONS ===
        
        // Generate secure random bytes (simplified implementation)
        private func generateSecureRandomBytes(length: Nat) : Blob {
            // In production, use proper cryptographic random generation
            // This is a simplified implementation
            let seed = Int.abs(Time.now()) % 1000000;
            let seedByte = Nat8.fromNat(Int.abs(seed) % 256);
            let randomSource = Random.Finite(Blob.fromArray([seedByte]));
            
            var bytes : [Nat8] = [];
            for (i in Iter.range(0, length - 1)) {
                switch (randomSource.byte()) {
                    case null { 
                        bytes := Array.append(bytes, [0 : Nat8]);
                    };
                    case (?b) { 
                        bytes := Array.append(bytes, [b]);
                    };
                };
            };
            Blob.fromArray(bytes)
        };
        
        // Hash key material (simplified implementation)
        private func hashKeyMaterial(keyMaterial: Blob) : Blob {
            // In production, use proper cryptographic hash (SHA-256)
            // This is a simplified implementation
            let keyBytes = Blob.toArray(keyMaterial);
            let hashBytes = Array.map<Nat8, Nat8>(keyBytes, func(b) { 
                Nat8.fromNat((Nat8.toNat(b) + 1) % 256) 
            });
            Blob.fromArray(hashBytes)
        };
        
        // Generate unique key ID
        private func generateKeyId(userId: Principal, purpose: PHIDataType, timestamp: Int) : Text {
            let userText = Principal.toText(userId);
            let purposeText = switch (purpose) {
                case (#medical_history) { "MH" };
                case (#allergies) { "AL" };
                case (#medications) { "MD" };
                case (#personal_info) { "PI" };
                case (#contact_info) { "CI" };
                case (#emergency_contact) { "EC" };
                case (#session_notes) { "SN" };
                case (#prescription_data) { "PD" };
            };
            "PHI_" # purposeText # "_" # userText # "_" # Int.toText(timestamp)
        };
        
        // Generate unique audit ID
        private func generateAuditId(userId: Principal, operation: Text, timestamp: Int) : Text {
            "AUDIT_" # Principal.toText(userId) # "_" # operation # "_" # Int.toText(timestamp)
        };
        
        // Perform actual encryption (simplified implementation)
        private func performEncryption(data: Text, dataType: PHIDataType, keyId: Text, userId: Principal) : Result.Result<EncryptedPHI, Text> {
            // Generate nonce
            let nonce = generateSecureRandomBytes(NONCE_SIZE);
            
            // In production, use proper AES-256-GCM encryption
            // This is a simplified implementation
            let dataBytes = Text.encodeUtf8(data);
            let encryptedBytes = Array.map<Nat8, Nat8>(Blob.toArray(dataBytes), func(b) { 
                Nat8.fromNat((Nat8.toNat(b) + 42) % 256) 
            });
            let encryptedData = Blob.fromArray(encryptedBytes);
            
            let encryptedPHI : EncryptedPHI = {
                encryptedData = encryptedData;
                nonce = nonce;
                keyId = keyId;
                dataType = dataType;
                timestamp = Time.now();
            };
            
            logPHIAccess(userId, dataType, "encrypt", true, null);
            #ok(encryptedPHI)
        };
        
        // Perform actual decryption (simplified implementation)
        private func performDecryption(encryptedPHI: EncryptedPHI) : Result.Result<Text, Text> {
            // In production, use proper AES-256-GCM decryption
            // This is a simplified implementation
            let encryptedBytes = Blob.toArray(encryptedPHI.encryptedData);
            let decryptedBytes = Array.map<Nat8, Nat8>(encryptedBytes, func(b) { 
                Nat8.fromNat((Nat8.toNat(b) + 214) % 256) // 256 - 42 = 214
            });
            let decryptedData = Blob.fromArray(decryptedBytes);
            
            switch (Text.decodeUtf8(decryptedData)) {
                case null { #err("Failed to decode decrypted data") };
                case (?text) { #ok(text) };
            };
        };
        
        // === KEY MANAGEMENT OPERATIONS ===
        
        // Get all encryption keys
        public func getAllEncryptionKeys() : [(Text, PHIEncryptionKey)] {
            Iter.toArray(phiEncryptionKeys.entries())
        };
        
        // Get active encryption keys
        public func getActiveEncryptionKeys() : [(Text, PHIEncryptionKey)] {
            Array.filter<(Text, PHIEncryptionKey)>(
                Iter.toArray(phiEncryptionKeys.entries()),
                func((keyId, key)) : Bool { key.isActive }
            )
        };
        
        // Deactivate encryption key
        public func deactivateEncryptionKey(keyId: Text) : Result.Result<(), Text> {
            switch (phiEncryptionKeys.get(keyId)) {
                case null { #err("Key not found") };
                case (?key) {
                    let deactivatedKey = {
                        key with isActive = false;
                    };
                    phiEncryptionKeys.put(keyId, deactivatedKey);
                    #ok(())
                };
            };
        };
        
        // === COMPLIANCE AND REPORTING ===
        
        // Get encryption status summary
        public func getEncryptionStatusSummary() : {
            totalKeys: Nat;
            activeKeys: Nat;
            inactiveKeys: Nat;
            keysNeedingRotation: Nat;
            totalPatientRecords: Nat;
            totalAuditEntries: Nat;
            successfulOperations: Nat;
            failedOperations: Nat;
        } {
            let allKeys = Iter.toArray(phiEncryptionKeys.vals());
            let activeKeys = Array.filter<PHIEncryptionKey>(allKeys, func(key) { key.isActive });
            let inactiveKeys = Array.filter<PHIEncryptionKey>(allKeys, func(key) { not key.isActive });
            let keysNeedingRotation = checkKeyRotationNeeded();
            
            let allAudits = Iter.toArray(phiAccessAudit.vals());
            let successfulOperations = Array.filter<PHIAccessAudit>(allAudits, func(audit) { audit.success });
            let failedOperations = Array.filter<PHIAccessAudit>(allAudits, func(audit) { not audit.success });
            
            {
                totalKeys = allKeys.size();
                activeKeys = activeKeys.size();
                inactiveKeys = inactiveKeys.size();
                keysNeedingRotation = keysNeedingRotation.size();
                totalPatientRecords = encryptedPatientPHI.size();
                totalAuditEntries = allAudits.size();
                successfulOperations = successfulOperations.size();
                failedOperations = failedOperations.size();
            }
        };
        
        // Get key rotation schedule
        public func getKeyRotationSchedule() : [(Text, Int)] {
            Iter.toArray(keyRotationSchedule.entries())
        };
        
        // Clean up old audit logs (keep last 1000 entries)
        public func cleanupOldAuditLogs() : Nat {
            let allAudits = Array.sort<PHIAccessAudit>(
                Iter.toArray(phiAccessAudit.vals()),
                func(a, b) { Int.compare(b.timestamp, a.timestamp) } // Sort by timestamp descending
            );
            
            if (allAudits.size() <= 1000) {
                return 0; // No cleanup needed
            };
            
            // Keep only the latest 1000 entries
            let auditsToKeep = Array.subArray<PHIAccessAudit>(allAudits, 0, 1000);
            
            // Clear and rebuild audit log
            phiAccessAudit := HashMap.HashMap<Text, PHIAccessAudit>(100, Text.equal, Text.hash);
            for (audit in auditsToKeep.vals()) {
                phiAccessAudit.put(audit.accessId, audit);
            };
            
            allAudits.size() - 1000 // Return number of entries removed
        };
    };
}