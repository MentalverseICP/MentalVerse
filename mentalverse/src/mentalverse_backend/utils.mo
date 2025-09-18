import Text "mo:base/Text";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Nat32 "mo:base/Nat32";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Blob "mo:base/Blob";
import Random "mo:base/Random";

module {
    // === TYPES ===
    public type ValidationResult = Result.Result<(), Text>;
    
    // === CONSTANTS ===
    public let MAX_NAME_LENGTH = 100;
    public let MAX_PHONE_LENGTH = 20;
    public let MAX_EMAIL_LENGTH = 254;
    public let NONCE_EXPIRY_MS = 300000; // 5 minutes
    
    // === TEXT VALIDATION FUNCTIONS ===
    
    // Validate text length
    public func validateTextLength(text: Text, maxLength: Nat, fieldName: Text) : ValidationResult {
        if (Text.size(text) > maxLength) {
            return #err(fieldName # " exceeds maximum length of " # Nat.toText(maxLength) # " characters");
        };
        #ok(())
    };
    
    // Validate text is not empty
    public func validateTextNotEmpty(text: Text, fieldName: Text) : ValidationResult {
        if (Text.size(text) == 0) {
            return #err(fieldName # " cannot be empty");
        };
        #ok(())
    };
    
    // Validate array size
    public func validateArraySize<T>(array: [T], maxSize: Nat, fieldName: Text) : ValidationResult {
        if (array.size() > maxSize) {
            return #err(fieldName # " array exceeds maximum size of " # Nat.toText(maxSize));
        };
        #ok(())
    };
    
    // Validate email format
    public func validateEmail(email: Text) : ValidationResult {
        if (not Text.contains(email, #char '@') or Text.size(email) < 5 or Text.size(email) > MAX_EMAIL_LENGTH) {
            return #err("Invalid email format");
        };
        #ok(())
    };
    
    // === TEXT SANITIZATION FUNCTIONS ===
    
    // Basic text sanitization
    public func sanitizeText(text: Text) : Text {
        // Remove potentially dangerous characters
        var sanitized = Text.replace(text, #char '<', "");
        sanitized := Text.replace(sanitized, #char '>', "");
        sanitized := Text.replace(sanitized, #char '\u{22}', ""); // double quote
        sanitized := Text.replace(sanitized, #char '\u{27}', ""); // single quote
        sanitized := Text.replace(sanitized, #char '\\', "");
        sanitized := Text.replace(sanitized, #char '&', "");
        sanitized := Text.replace(sanitized, #char '%', "");
        sanitized := Text.replace(sanitized, #char ';', "");
        sanitized := Text.replace(sanitized, #char '(', "");
        sanitized := Text.replace(sanitized, #char ')', "");
        sanitized := Text.replace(sanitized, #char '+', "");
        sanitized := Text.replace(sanitized, #char '\u{3D}', ""); // equals sign
        
        // Trim whitespace
        Text.trim(sanitized, #char ' ')
    };
    
    // Sanitize HTML/XML content more aggressively
    public func sanitizeHtmlContent(text: Text) : Text {
        var sanitized = sanitizeText(text);
        sanitized := Text.replace(sanitized, #text "script", "");
        sanitized := Text.replace(sanitized, #text "javascript", "");
        sanitized := Text.replace(sanitized, #text "onclick", "");
        sanitized := Text.replace(sanitized, #text "onload", "");
        sanitized := Text.replace(sanitized, #text "onerror", "");
        sanitized := Text.replace(sanitized, #text "eval", "");
        sanitized := Text.replace(sanitized, #text "expression", "");
        sanitized
    };
    
    // === MEDICAL DATA VALIDATION ===
    
    // Validate and sanitize medical data with strict requirements
    public func validateMedicalText(text: Text, fieldName: Text, maxLength: Nat) : Result.Result<Text, Text> {
        // Check length
        if (Text.size(text) > maxLength) {
            return #err(fieldName # " exceeds maximum length of " # Nat.toText(maxLength) # " characters");
        };
        
        // Check for empty content
        if (Text.size(text) == 0) {
            return #err(fieldName # " cannot be empty");
        };
        
        // Sanitize content
        let sanitized = sanitizeHtmlContent(text);
        
        // Ensure sanitization didn't remove all content
        if (Text.size(sanitized) == 0) {
            return #err(fieldName # " contains only invalid characters");
        };
        
        #ok(sanitized)
    };
    
    // === PRINCIPAL AND ID VALIDATION ===
    
    // Validate Principal ID format
    public func validatePrincipalId(principalText: Text, fieldName: Text) : ValidationResult {
        if (Text.size(principalText) == 0) {
            return #err(fieldName # " cannot be empty");
        };
        
        if (Text.size(principalText) < 10 or Text.size(principalText) > 100) {
            return #err(fieldName # " has invalid length");
        };
        
        // Basic format validation - should contain only alphanumeric and hyphens
        // This is a simplified check; in production, use proper Principal validation
        #ok(())
    };
    
    // === NUMERIC VALIDATION ===
    
    // Validate numeric ranges
    public func validateNumericRange(value: Nat, min: Nat, max: Nat, fieldName: Text) : ValidationResult {
        if (value < min or value > max) {
            return #err(fieldName # " must be between " # Nat.toText(min) # " and " # Nat.toText(max));
        };
        #ok(())
    };
    
    // === TIMESTAMP VALIDATION ===
    
    // Validate timestamp
    public func validateTimestamp(timestamp: Int, fieldName: Text) : ValidationResult {
        let now = Time.now();
        let fiveMinutesAgo = now - (5 * 60 * 1_000_000_000); // 5 minutes in nanoseconds
        let fiveMinutesFromNow = now + (5 * 60 * 1_000_000_000);
        
        if (timestamp < fiveMinutesAgo) {
            return #err(fieldName # " is too old (more than 5 minutes ago)");
        };
        
        if (timestamp > fiveMinutesFromNow) {
            return #err(fieldName # " is too far in the future (more than 5 minutes)");
        };
        
        #ok(())
    };
    
    // === HASH AND ENCRYPTION UTILITIES ===
    
    // Generate audit hash with salt and multiple rounds
    public func generateAuditHash(logId: Text, userId: Text, action: Text, timestamp: Int, previousHash: ?Text) : Text {
        let hashInput = logId # userId # action # Int.toText(timestamp) #
            (switch (previousHash) { case (?h) h; case null "genesis" }) #
            "MENTALVERSE_AUDIT_SALT";
        
        // Enhanced hash with salt and multiple rounds for tamper resistance
        let salt = "MV_SECURE_SALT_2024";
        let saltedInput = hashInput # salt;
        
        // Multiple hash rounds for increased security
        var hashValue = Text.hash(saltedInput);
        for (i in Iter.range(0, 2)) {
            hashValue := Text.hash(Nat32.toText(hashValue) # salt);
        };
        
        // Convert to hex-like representation for better readability
        let hexHash = Nat32.toText(hashValue);
        "AUD" # hexHash # "LOG"
    };
    
    // Generate random bytes for encryption
    public func generateRandomBytes(_length: Nat) : async Blob {
        let seed = await Random.blob();
        // In a real implementation, use proper cryptographic random generation
        seed
    };
    
    // === ID GENERATION UTILITIES ===
    
    // Generate unique ID with prefix
    public func generateId(prefix: Text) : Text {
        let timestamp = Int.toText(Time.now());
        let hash = Nat32.toText(Text.hash(timestamp # prefix));
        prefix # "_" # hash
    };
    
    // Generate appointment ID
    public func generateAppointmentId(patientId: Text, doctorId: Text) : Text {
        patientId # "_" # doctorId # "_" # Int.toText(Time.now())
    };
    
    // === FORMAT VALIDATION ===
    
    // Validate UUID format (basic)
    public func validateUuidFormat(uuid: Text) : Bool {
        // Basic UUID format check: 8-4-4-4-12 characters
        let parts = Text.split(uuid, #char '-');
        let partsArray = Iter.toArray(parts);
        
        if (partsArray.size() != 5) {
            return false;
        };
        
        // Check lengths: 8-4-4-4-12
        let expectedLengths = [8, 4, 4, 4, 12];
        for (i in Iter.range(0, 4)) {
            if (Text.size(partsArray[i]) != expectedLengths[i]) {
                return false;
            };
        };
        
        true
    };
    
    // === USER PROFILE VALIDATION ===
    
    // Validate user profile input
    public func validateUserProfileInput(
        firstName: Text,
        lastName: Text,
        email: Text,
        phone: Text
    ) : ValidationResult {
        // Validate first name
        switch (validateTextNotEmpty(firstName, "First name")) {
            case (#err(msg)) { return #err(msg); };
            case (#ok()) {};
        };
        
        switch (validateTextLength(firstName, MAX_NAME_LENGTH, "First name")) {
            case (#err(msg)) { return #err(msg); };
            case (#ok()) {};
        };
        
        // Validate last name
        switch (validateTextNotEmpty(lastName, "Last name")) {
            case (#err(msg)) { return #err(msg); };
            case (#ok()) {};
        };
        
        switch (validateTextLength(lastName, MAX_NAME_LENGTH, "Last name")) {
            case (#err(msg)) { return #err(msg); };
            case (#ok()) {};
        };
        
        // Validate email
        switch (validateEmail(email)) {
            case (#err(msg)) { return #err(msg); };
            case (#ok()) {};
        };
        
        // Validate phone
        switch (validateTextLength(phone, MAX_PHONE_LENGTH, "Phone number")) {
            case (#err(msg)) { return #err(msg); };
            case (#ok()) {};
        };
        
        #ok(())
    };
    
    // === CONVERSION UTILITIES ===
    
    // Convert boolean to text
    public func boolToText(b: Bool) : Text {
        if (b) "true" else "false"
    };
    
    // Convert optional text to text
    public func optionalTextToText(opt: ?Text) : Text {
        switch (opt) {
            case (?text) text;
            case null "";
        }
    };
    
    // === ARRAY UTILITIES ===
    
    // Check if array contains element
    public func arrayContains<T>(array: [T], element: T, equal: (T, T) -> Bool) : Bool {
        for (item in array.vals()) {
            if (equal(item, element)) {
                return true;
            };
        };
        false
    };
    
    // Filter array elements
    public func arrayFilter<T>(array: [T], predicate: (T) -> Bool) : [T] {
        Array.filter(array, predicate)
    };
    
    // === TIME UTILITIES ===
    
    // Get current timestamp in milliseconds
    public func getCurrentTimestampMs() : Int {
        Time.now() / 1_000_000 // Convert nanoseconds to milliseconds
    };
    
    // Check if timestamp is within window
    public func isTimestampWithinWindow(timestamp: Int, windowMs: Int) : Bool {
        let now = getCurrentTimestampMs();
        let diff = if (now > timestamp) now - timestamp else timestamp - now;
        diff <= windowMs
    };
}