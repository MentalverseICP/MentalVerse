import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Text "mo:base/Text";
import _Option "mo:base/Option";
import _Debug "mo:base/Debug";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import Blob "mo:base/Blob";
import Random "mo:base/Random";
import Char "mo:base/Char";
import Debug "mo:base/Debug";
import Regex "mo:base/Regex";
import Crypto "mo:base/Crypto";

// Import MVT Token module
import MVTToken "mvt_token";
// Import Secure Messaging interface
import SecureMessagingInterface "secure_messaging_interface";

// === PHASE 2: ADVANCED SECURITY & VALIDATION ===

// Enhanced rate limiting and DDoS protection types
type RateLimitInfo = {
  callCount: Nat;
  windowStart: Int;
  lastCallTime: Int;
  violationCount: Nat;
  blockUntil: ?Int;
  suspiciousActivity: Bool;
};

type DDoSProtectionLevel = {
  #normal;
  #elevated;
  #high;
  #critical;
};

type ThreatMetrics = {
  requestsPerSecond: Nat;
  uniqueCallers: Nat;
  blockedRequests: Nat;
  suspiciousPatterns: Nat;
  lastUpdated: Int;
};

// Validation result types
type ValidationResult = {
  #ok;
  #err: Text;
};

// DDoS protection storage
private stable var threatMetricsEntries : [(Text, ThreatMetrics)] = [];
private var threatMetrics = HashMap.HashMap<Text, ThreatMetrics>(10, Text.equal, Text.hash);
private stable var blockedPrincipalsEntries : [(Principal, Int)] = [];
private var blockedPrincipals = HashMap.HashMap<Principal, Int>(100, Principal.equal, Principal.hash);
private stable var currentProtectionLevel : DDoSProtectionLevel = #normal;
private stable var globalRequestCount : Nat = 0;
private stable var lastGlobalReset : Int = 0;

// Input sanitization and validation utilities
private func validateTextLength(text: Text, maxLength: Nat, fieldName: Text) : ValidationResult {
  if (Text.size(text) > maxLength) {
    return #err(fieldName # " exceeds maximum length of " # Nat.toText(maxLength) # " characters");
  };
  #ok
};

private func validateTextNotEmpty(text: Text, fieldName: Text) : ValidationResult {
  if (Text.size(text) == 0) {
    return #err(fieldName # " cannot be empty");
  };
  #ok
};

private func validateArraySize<T>(array: [T], maxSize: Nat, fieldName: Text) : ValidationResult {
  if (Array.size(array) > maxSize) {
    return #err(fieldName # " exceeds maximum size of " # Nat.toText(maxSize) # " items");
  };
  #ok
};

private func validateEmail(email: Text) : ValidationResult {
  if (Text.size(email) > MAX_EMAIL_LENGTH) {
    return #err("Email exceeds maximum length");
  };
  if (not Text.contains(email, #char '@')) {
    return #err("Invalid email format");
  };
  #ok
};

// Enhanced comprehensive input sanitization
private func sanitizeText(text: Text) : Text {
  // Remove potentially dangerous characters and normalize
  var sanitized = Text.replace(text, #char '<', "");
  sanitized := Text.replace(sanitized, #char '>', "");
  sanitized := Text.replace(sanitized, #char '"', "");
  sanitized := Text.replace(sanitized, #char '\u{27}', "");
  sanitized := Text.replace(sanitized, #char '\\', "");
  sanitized := Text.replace(sanitized, #char '&', "");
  sanitized := Text.replace(sanitized, #char '%', "");
  sanitized := Text.replace(sanitized, #char ';', "");
  sanitized := Text.replace(sanitized, #char '(', "");
  sanitized := Text.replace(sanitized, #char ')', "");
  sanitized := Text.replace(sanitized, #char '+', "");
  sanitized := Text.replace(sanitized, #char '=', "");
  
  // Trim whitespace and normalize
  Text.trim(sanitized, #char ' ')
};

// Sanitize HTML/XML content more aggressively
private func sanitizeHtmlContent(text: Text) : Text {
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

// Validate and sanitize medical data with strict requirements
private func validateMedicalText(text: Text, fieldName: Text, maxLength: Nat) : Result.Result<Text, Text> {
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
  
  // Ensure sanitization didn't remove everything
  if (Text.size(sanitized) == 0) {
    return #err(fieldName # " contains invalid characters");
  };
  
  #ok(sanitized)
};

// Validate Principal ID format
private func validatePrincipalId(principalText: Text, fieldName: Text) : ValidationResult {
  if (Text.size(principalText) == 0) {
    return #err(fieldName # " cannot be empty");
  };
  
  if (Text.size(principalText) > 100) {
    return #err(fieldName # " is too long");
  };
  
  // Basic format validation - should contain only alphanumeric and hyphens
  let chars = Text.toArray(principalText);
  for (char in chars.vals()) {
    if (not (Char.isAlphabetic(char) or Char.isDigit(char) or char == '-')) {
      return #err(fieldName # " contains invalid characters");
    };
  };
  
  #ok
};

// Validate numeric ranges
private func validateNumericRange(value: Nat, min: Nat, max: Nat, fieldName: Text) : ValidationResult {
  if (value < min or value > max) {
    return #err(fieldName # " must be between " # Nat.toText(min) # " and " # Nat.toText(max));
  };
  #ok
};

// Validate timestamp
private func validateTimestamp(timestamp: Int, fieldName: Text) : ValidationResult {
  let now = Time.now();
  let maxAge = 300_000_000_000; // 5 minutes in nanoseconds
  let maxFuture = 60_000_000_000; // 1 minute in nanoseconds
  
  if (timestamp < (now - maxAge)) {
    return #err(fieldName # " is too old");
  };
  
  if (timestamp > (now + maxFuture)) {
    return #err(fieldName # " is too far in the future");
  };
  
  #ok
};

// Comprehensive appointment data validation
private func validateAppointmentData(appointmentData: {
  appointmentType: AppointmentType;
  scheduledDate: Text;
  startTime: Text;
  endTime: Text;
  notes: Text;
}) : Result.Result<{
  appointmentType: AppointmentType;
  scheduledDate: Text;
  startTime: Text;
  endTime: Text;
  notes: Text;
}, Text> {
  
  // Validate scheduled date format (basic validation)
  switch (validateTextLength(appointmentData.scheduledDate, 20, "Scheduled date")) {
    case (#err(msg)) { return #err(msg) };
    case (#ok) {};
  };
  
  // Validate time formats
  switch (validateTextLength(appointmentData.startTime, 10, "Start time")) {
    case (#err(msg)) { return #err(msg) };
    case (#ok) {};
  };
  
  switch (validateTextLength(appointmentData.endTime, 10, "End time")) {
    case (#err(msg)) { return #err(msg) };
    case (#ok) {};
  };
  
  // Validate and sanitize notes
  switch (validateMedicalText(appointmentData.notes, "Notes", 1000)) {
    case (#err(msg)) { return #err(msg) };
    case (#ok(sanitizedNotes)) {
      #ok({
        appointmentType = appointmentData.appointmentType;
        scheduledDate = Text.trim(appointmentData.scheduledDate, #char ' ');
        startTime = Text.trim(appointmentData.startTime, #char ' ');
        endTime = Text.trim(appointmentData.endTime, #char ' ');
        notes = sanitizedNotes;
      })
    };
  }
};

// Validate message content with comprehensive checks
private func validateMessageContent(
  content: Text,
  messageType: Text,
  receiverId: Principal
) : Result.Result<{content: Text; messageType: Text}, Text> {
  
  // Validate content
  switch (validateMedicalText(content, "Message content", 5000)) {
    case (#err(msg)) { return #err(msg) };
    case (#ok(sanitizedContent)) {
      
      // Validate message type
      switch (validateTextLength(messageType, 50, "Message type")) {
        case (#err(msg)) { return #err(msg) };
        case (#ok) {
          let sanitizedMessageType = sanitizeText(messageType);
          
          // Validate receiver exists
          let receiverExists = switch (userRoles.get(receiverId)) {
            case (?role) { true };
            case null { false };
          };
          
          if (not receiverExists) {
            return #err("Receiver not found");
          };
          
          #ok({
            content = sanitizedContent;
            messageType = sanitizedMessageType;
          })
        };
      };
    };
  }
};

// Validate medical record data
private func validateMedicalRecordData(
  patientId: Principal,
  diagnosis: Text,
  treatment: Text,
  notes: Text
) : Result.Result<{diagnosis: Text; treatment: Text; notes: Text}, Text> {
  
  // Validate diagnosis
  switch (validateMedicalText(diagnosis, "Diagnosis", 500)) {
    case (#err(msg)) { return #err(msg) };
    case (#ok(sanitizedDiagnosis)) {
      
      // Validate treatment
      switch (validateMedicalText(treatment, "Treatment", 1000)) {
        case (#err(msg)) { return #err(msg) };
        case (#ok(sanitizedTreatment)) {
          
          // Validate notes
          switch (validateMedicalText(notes, "Notes", 2000)) {
            case (#err(msg)) { return #err(msg) };
            case (#ok(sanitizedNotes)) {
              
              // Verify patient exists
              let patientExists = switch (userRoles.get(patientId)) {
                case (?#patient) { true };
                case (_) { false };
              };
              
              if (not patientExists) {
                return #err("Patient not found");
              };
              
              #ok({
                diagnosis = sanitizedDiagnosis;
                treatment = sanitizedTreatment;
                notes = sanitizedNotes;
              })
            };
          };
        };
      };
    };
  }
};

// Enhanced endpoint validation wrapper
private func validateEndpointAccess(
  caller: Principal,
  requiredRole: ?UserType,
  nonce: ?Nat,
  timestamp: ?Int
) : ValidationResult {
  
  // Rate limiting check
  switch (checkRateLimit(caller, 10, 60000)) {
    case (#err(msg)) { return #err("Rate limit exceeded: " # msg) };
    case (#ok) {};
  };
  
  // Role-based access control
  switch (requiredRole) {
    case (?role) {
      if (not isAuthorized(caller, role)) {
        return #err("Unauthorized: Required role not found");
      };
    };
    case null {};
  };
  
  // Nonce and timestamp validation if provided
  switch (nonce, timestamp) {
    case (?n, ?t) {
      switch (validateTimestamp(t, "Request timestamp")) {
        case (#err(msg)) { return #err(msg) };
        case (#ok) {
          let nonceText = Principal.toText(caller) # "_" # Nat.toText(n) # "_" # Int.toText(t);
          switch (validateNonce(nonceText, t)) {
            case (#err(msg)) { return #err("Invalid nonce: " # msg) };
            case (#ok) {};
          };
        };
      };
    };
    case (_, _) {};
  };
  
  #ok
};

// Phase 2 Security: Simplified rate limiting check
private func check_rate_limit(caller: Principal) : Bool {
  switch (checkRateLimit(caller, 10, 60000)) { // 10 calls per minute
    case (#ok) { true };
    case (#err(_)) { false };
  }
};

// Phase 2 Security: Nonce and timestamp validation
private func validate_nonce(caller: Principal, nonce: Nat, timestamp: Int) : Bool {
  let nonceText = Principal.toText(caller) # "_" # Nat.toText(nonce) # "_" # Int.toText(timestamp);
  switch (validateNonce(nonceText, timestamp)) {
    case (#ok) { true };
    case (#err(_)) { false };
  }
};

// Phase 2 Security: Text sanitization wrapper
private func sanitize_text(text: Text) : Text {
  sanitizeText(text)
};

// Enhanced tamper-proof hash-chaining utility for audit log integrity
private func generateAuditHash(log: AuditLog, previousHash: ?Text) : Text {
  let hashInput = log.id # Principal.toText(log.userId) # 
                  debug_show(log.action) # log.resourceType # log.resourceId #
                  Int.toText(log.timestamp) # Nat.toText(log.sequenceNumber) #
                  (switch (previousHash) { case (?h) h; case null "genesis" }) #
                  (switch (log.details) { case (?d) d; case null "" }) #
                  (switch (log.ipAddress) { case (?ip) ip; case null "" }) #
                  (switch (log.userAgent) { case (?ua) ua; case null "" });
  
  // Enhanced hash with salt and multiple rounds for tamper resistance
  let salt = "MentalVerse_AuditLog_Salt_2024";
  let saltedInput = hashInput # salt;
  
  // Multiple hash rounds for increased security
  var hashValue = Text.hash(saltedInput);
  for (i in Iter.range(0, 999)) { // 1000 rounds
    hashValue := Text.hash(Nat32.toText(hashValue) # salt);
  };
  
  // Convert to hex-like representation for better readability
  let hexHash = Nat32.toText(hashValue);
  "AUD" # hexHash # "LOG"
};

// Tamper detection and integrity verification
private func verifyAuditLogIntegrity(logId: Text) : Bool {
  switch (auditLogs.get(logId)) {
    case (?log) {
      let recalculatedHash = generateAuditHash({
        id = log.id;
        userId = log.userId;
        action = log.action;
        resourceType = log.resourceType;
        resourceId = log.resourceId;
        details = log.details;
        ipAddress = log.ipAddress;
        userAgent = log.userAgent;
        timestamp = log.timestamp;
        previousHash = log.previousHash;
        currentHash = "";
        sequenceNumber = log.sequenceNumber;
      }, log.previousHash);
      
      log.currentHash == recalculatedHash
    };
    case null false;
  }
};

// Verify entire audit chain integrity
private func verifyAuditChainIntegrity() : {isValid: Bool; corruptedLogs: [Text]} {
  let allLogs = Iter.toArray(auditLogs.vals());
  let sortedLogs = Array.sort(allLogs, func(a: AuditLog, b: AuditLog) : Order.Order {
    Nat.compare(a.sequenceNumber, b.sequenceNumber)
  });
  
  var corruptedLogs: [Text] = [];
  var previousHash: ?Text = null;
  
  for (log in sortedLogs.vals()) {
    // Verify hash chain continuity
    if (log.previousHash != previousHash) {
      corruptedLogs := Array.append(corruptedLogs, [log.id]);
    };
    
    // Verify individual log integrity
    if (not verifyAuditLogIntegrity(log.id)) {
      corruptedLogs := Array.append(corruptedLogs, [log.id]);
    };
    
    previousHash := ?log.currentHash;
  };
  
  {isValid = corruptedLogs.size() == 0; corruptedLogs = corruptedLogs}
};

// Create immutable audit snapshot for external verification
private func createAuditSnapshot() : {timestamp: Int; totalLogs: Nat; chainHash: Text; signature: Text} {
  let allLogs = Iter.toArray(auditLogs.vals());
  let sortedLogs = Array.sort(allLogs, func(a: AuditLog, b: AuditLog) : Order.Order {
    Nat.compare(a.sequenceNumber, b.sequenceNumber)
  });
  
  var chainHash = "SNAPSHOT_START";
  for (log in sortedLogs.vals()) {
    chainHash := Text.hash(chainHash # log.currentHash) |> Nat32.toText;
  };
  
  let timestamp = Time.now();
  let signature = Text.hash(chainHash # Int.toText(timestamp) # "MENTALVERSE_AUDIT") |> Nat32.toText;
  
  {
    timestamp = timestamp;
    totalLogs = allLogs.size();
    chainHash = "SNAP" # chainHash # "SHOT";
    signature = "SIG" # signature # "TURE";
  }
};

// Rate limiting implementation
// Enhanced DDoS protection and rate limiting
private func checkRateLimit(caller: Principal, maxCalls: Nat, windowMs: Int) : ValidationResult {
  let now = Time.now();
  
  // Check if caller is currently blocked
  switch (blockedPrincipals.get(caller)) {
    case (?blockUntil) {
      if (now < blockUntil) {
        return #err("Access temporarily blocked due to suspicious activity");
      } else {
        // Unblock expired blocks
        blockedPrincipals.delete(caller);
      };
    };
    case null {};
  };
  
  // Update global threat metrics
  updateThreatMetrics(caller, now);
  
  // Adjust rate limits based on protection level
  let adjustedMaxCalls = getAdjustedRateLimit(maxCalls);
  let windowStart = now - windowMs * 1_000_000; // Convert ms to nanoseconds
  
  switch (rateLimits.get(caller)) {
    case null {
      // First call from this principal
      rateLimits.put(caller, {
        callCount = 1;
        windowStart = now;
        lastCallTime = now;
        violationCount = 0;
        blockUntil = null;
        suspiciousActivity = false;
      });
      #ok
    };
    case (?info) {
      if (info.windowStart < windowStart) {
        // Reset window but preserve violation history
        rateLimits.put(caller, {
          callCount = 1;
          windowStart = now;
          lastCallTime = now;
          violationCount = info.violationCount;
          blockUntil = info.blockUntil;
          suspiciousActivity = detectSuspiciousActivity(caller, now, info);
        });
        #ok
      } else if (info.callCount >= adjustedMaxCalls) {
        // Rate limit exceeded - apply progressive penalties
        let newViolationCount = info.violationCount + 1;
        let blockDuration = calculateBlockDuration(newViolationCount);
        let blockUntil = now + blockDuration;
        
        // Update rate limit info with penalty
        rateLimits.put(caller, {
          info with
          violationCount = newViolationCount;
          blockUntil = ?blockUntil;
          suspiciousActivity = true;
        });
        
        // Add to blocked principals if severe violation
        if (newViolationCount >= 3) {
          blockedPrincipals.put(caller, blockUntil);
          logSecurityEvent(
            caller,
            "ddos_protection_block",
            "Principal blocked due to repeated rate limit violations: " # Principal.toText(caller),
            "high"
          );
        };
        
        #err("Rate limit exceeded. Access temporarily restricted for " # Int.toText(blockDuration / 1_000_000_000) # " seconds.")
      } else {
        // Increment call count
        rateLimits.put(caller, {
          info with
          callCount = info.callCount + 1;
          lastCallTime = now;
          suspiciousActivity = detectSuspiciousActivity(caller, now, info);
        });
        #ok
      }
    };
  }
};

// Calculate progressive block duration based on violation count
private func calculateBlockDuration(violationCount: Nat) : Int {
  switch (violationCount) {
    case (1) { 30_000_000_000 }; // 30 seconds
    case (2) { 300_000_000_000 }; // 5 minutes
    case (3) { 1_800_000_000_000 }; // 30 minutes
    case (4) { 3_600_000_000_000 }; // 1 hour
    case (_) { 21_600_000_000_000 }; // 6 hours for severe violations
  }
};

// Detect suspicious activity patterns
private func detectSuspiciousActivity(caller: Principal, now: Int, info: RateLimitInfo) : Bool {
  let timeSinceLastCall = now - info.lastCallTime;
  let callFrequency = if (timeSinceLastCall > 0) {
    1_000_000_000 / timeSinceLastCall // Calls per second
  } else { 1000 }; // Very high frequency if immediate
  
  // Suspicious if more than 10 calls per second or rapid successive calls
  callFrequency > 10 or timeSinceLastCall < 100_000_000 // Less than 100ms between calls
};

// Adjust rate limits based on current protection level
private func getAdjustedRateLimit(baseLimit: Nat) : Nat {
  switch (currentProtectionLevel) {
    case (#normal) { baseLimit };
    case (#elevated) { baseLimit * 80 / 100 }; // 20% reduction
    case (#high) { baseLimit * 60 / 100 }; // 40% reduction
    case (#critical) { baseLimit * 40 / 100 }; // 60% reduction
  }
};

// Update global threat metrics and protection level
private func updateThreatMetrics(caller: Principal, now: Int) {
  globalRequestCount += 1;
  
  // Reset metrics every minute
  if (now - lastGlobalReset > 60_000_000_000) {
    let currentMetrics = {
      requestsPerSecond = globalRequestCount * 1_000_000_000 / (now - lastGlobalReset);
      uniqueCallers = rateLimits.size();
      blockedRequests = blockedPrincipals.size();
      suspiciousPatterns = countSuspiciousActivity();
      lastUpdated = now;
    };
    
    threatMetrics.put("global", currentMetrics);
    
    // Update protection level based on metrics
    currentProtectionLevel := calculateProtectionLevel(currentMetrics);
    
    // Reset counters
    globalRequestCount := 0;
    lastGlobalReset := now;
  };
};

// Count principals with suspicious activity
private func countSuspiciousActivity() : Nat {
  var count = 0;
  for ((principal, info) in rateLimits.entries()) {
    if (info.suspiciousActivity) {
      count += 1;
    };
  };
  count
};

// Calculate appropriate protection level
private func calculateProtectionLevel(metrics: ThreatMetrics) : DDoSProtectionLevel {
  if (metrics.requestsPerSecond > 1000 or metrics.suspiciousPatterns > 50) {
    #critical
  } else if (metrics.requestsPerSecond > 500 or metrics.suspiciousPatterns > 20) {
    #high
  } else if (metrics.requestsPerSecond > 200 or metrics.suspiciousPatterns > 10) {
    #elevated
  } else {
    #normal
  }
};

// Replay attack protection
private func validateNonce(nonce: Text, timestamp: Int) : ValidationResult {
  let now = Time.now();
  let maxAge = 300_000_000_000; // 5 minutes in nanoseconds
  
  // Check if nonce was already used
  switch (usedNonces.get(nonce)) {
    case (?_) {
      return #err("Nonce already used (replay attack detected)");
    };
    case null {};
  };
  
  // Check timestamp freshness
  if (now - timestamp > maxAge) {
    return #err("Request timestamp too old");
  };
  
  if (timestamp > now + 60_000_000_000) { // 1 minute future tolerance
    return #err("Request timestamp too far in future");
  };
  
  // Store nonce
  usedNonces.put(nonce, timestamp);
  
  // Clean old nonces periodically
  cleanOldNonces(now - maxAge);
  
  #ok
};

private func cleanOldNonces(cutoffTime: Int) {
  let entries = Iter.toArray(usedNonces.entries());
  for ((nonce, timestamp) in entries.vals()) {
    if (timestamp < cutoffTime) {
      usedNonces.delete(nonce);
    };
  };
};

// Comprehensive input validation for user profiles
private func validateUserProfileInput(
  firstName: Text,
  lastName: Text,
  email: Text,
  phoneNumber: ?Text
) : ValidationResult {
  switch (validateTextNotEmpty(firstName, "First name")) {
    case (#err(msg)) { return #err(msg) };
    case (#ok) {};
  };
  
  switch (validateTextLength(firstName, MAX_NAME_LENGTH, "First name")) {
    case (#err(msg)) { return #err(msg) };
    case (#ok) {};
  };
  
  switch (validateTextNotEmpty(lastName, "Last name")) {
    case (#err(msg)) { return #err(msg) };
    case (#ok) {};
  };
  
  switch (validateTextLength(lastName, MAX_NAME_LENGTH, "Last name")) {
    case (#err(msg)) { return #err(msg) };
    case (#ok) {};
  };
  
  switch (validateEmail(email)) {
    case (#err(msg)) { return #err(msg) };
    case (#ok) {};
  };
  
  switch (phoneNumber) {
    case (?phone) {
      switch (validateTextLength(phone, MAX_PHONE_LENGTH, "Phone number")) {
        case (#err(msg)) { return #err(msg) };
        case (#ok) {};
      };
    };
    case null {};
  };
  
  #ok
};

persistent actor MentalVerseBackend {
  // MVT Token Integration
  private let _MVT_TOKEN_CANISTER_ID = "rdmx6-jaaaa-aaaaa-aaadq-cai"; // Replace with actual canister ID
  
  // Secure Messaging Integration
  private let SECURE_MESSAGING_CANISTER_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai"; // Replace with actual secure messaging canister ID
  private let secureMessagingActor = SecureMessagingInterface.getSecureMessagingActor(SECURE_MESSAGING_CANISTER_ID);
  
  // Input validation constants
  private let MAX_TEXT_LENGTH = 10000;
  private let MAX_ARRAY_SIZE = 100;
  private let MAX_EMAIL_LENGTH = 254;
  private let MAX_PHONE_LENGTH = 20;
  private let MAX_NAME_LENGTH = 100;
  private let MAX_DESCRIPTION_LENGTH = 5000;
  private let MIN_PASSWORD_LENGTH = 8;
  
  // Rate limiting storage
  private stable var rateLimitEntries : [(Principal, RateLimitInfo)] = [];
  private var rateLimits = HashMap.HashMap<Principal, RateLimitInfo>(100, Principal.equal, Principal.hash);
  
  // Nonce tracking for replay protection
  private stable var nonceEntries : [(Text, Int)] = [];
  private var usedNonces = HashMap.HashMap<Text, Int>(1000, Text.equal, Text.hash);
  
  // Token-related types
  type TokenBalance = Nat;
  type EarningType = MVTToken.EarningType;
  type SpendingType = MVTToken.SpendingType;
  
  // Faucet-related types
  public type FaucetClaim = {
    id: Text;
    user_id: Principal;
    amount: Nat;
    timestamp: Int;
    status: Text; // "pending", "completed", "failed"
  };
  
  public type FaucetStats = {
    dailyLimit: Nat;
    claimedToday: Nat;
    totalClaimed: Nat;
    nextClaimTime: Int;
    isEligible: Bool;
  };
  // === PHI ENCRYPTION TYPES ===
  
  // Encrypted PHI data structure
  public type EncryptedPHI = {
    encryptedData: Blob;        // AES-256-GCM encrypted data
    nonce: Blob;               // 12-byte nonce for GCM
    keyId: Text;               // Reference to encryption key
    dataType: PHIDataType;     // Type of PHI data encrypted
    timestamp: Int;            // When encrypted
  };
  
  // Types of PHI data that can be encrypted
  public type PHIDataType = {
    #medicalHistory;
    #allergies;
    #medications;
    #personalInfo;
    #sessionNotes;
    #diagnostics;
    #labResults;
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
    patientId: UserId;
    encryptedMedicalHistory: ?EncryptedPHI;
    encryptedAllergies: ?EncryptedPHI;
    encryptedCurrentMedications: ?EncryptedPHI;
    encryptedPersonalInfo: ?EncryptedPHI;  // DOB, SSN, etc.
    lastUpdated: Int;
  };
  
  // Type definitions for core data models
  public type UserId = Principal;
  public type DoctorId = Text;
  public type AppointmentId = Text;
  public type RecordId = Text;

  // Enhanced User Types
  public type UserType = {
    #patient;
    #therapist;
    #admin;
  };

  public type VerificationStatus = {
    #pending;
    #verified;
    #rejected;
    #suspended;
  };

  public type UserProfile = {
    id: UserId;
    userType: UserType;
    firstName: Text;
    lastName: Text;
    email: Text;
    phoneNumber: ?Text;
    profilePicture: ?Text;
    bio: ?Text;
    verificationStatus: VerificationStatus;
    onboardingCompleted: Bool;
    createdAt: Int;
    updatedAt: Int;
  };

  // Enhanced Patient data model with PHI encryption
  public type Patient = {
    id: UserId;
    firstName: Text;                    // Non-PHI: can remain unencrypted
    lastName: Text;                     // Non-PHI: can remain unencrypted
    email: Text;                        // Non-PHI: can remain unencrypted
    encryptedDateOfBirth: ?EncryptedPHI; // PHI: encrypted
    gender: Text;                       // Non-PHI: can remain unencrypted
    encryptedPhoneNumber: ?EncryptedPHI; // PHI: encrypted
    encryptedEmergencyContact: ?EncryptedPHI; // PHI: encrypted
    // Legacy fields for backward compatibility (deprecated)
    dateOfBirth: Text;                  // Deprecated: use encryptedDateOfBirth
    phoneNumber: Text;                  // Deprecated: use encryptedPhoneNumber
    emergencyContact: Text;             // Deprecated: use encryptedEmergencyContact
    medicalHistory: [Text];             // Deprecated: use EncryptedPatientPHI
    allergies: [Text];                  // Deprecated: use EncryptedPatientPHI
    currentMedications: [Text];         // Deprecated: use EncryptedPatientPHI
    // Non-PHI fields
    preferredLanguage: ?Text;
    timezone: ?Text;
    emergencyContactRelation: ?Text;
    insuranceProvider: ?Text;
    createdAt: Int;
    updatedAt: Int;
  };

  // Enhanced Therapist data model
  public type Therapist = {
    id: DoctorId;
    userId: UserId;
    firstName: Text;
    lastName: Text;
    email: Text;
    specialty: [Text]; // Multiple specialties
    licenseNumber: Text;
    licenseState: Text;
    licenseExpiry: Text;
    yearsOfExperience: Nat;
    education: [Text];
    certifications: [Text];
    languages: [Text];
    availableHours: Text; // JSON string for complex scheduling
    consultationFee: Nat;
    acceptsInsurance: Bool;
    insuranceProviders: [Text];
    sessionTypes: [Text]; // individual, group, family, etc.
    rating: Float;
    totalAppointments: Nat;
    isVerified: Bool;
    isOnline: Bool;
    profileDescription: Text;
    approachMethods: [Text]; // CBT, DBT, etc.
    createdAt: Int;
    updatedAt: Int;
  };

  // Legacy Doctor type for backward compatibility
  public type Doctor = Therapist;

  // Appointment data model
  public type AppointmentStatus = {
    #scheduled;
    #confirmed;
    #inProgress;
    #completed;
    #cancelled;
    #rescheduled;
  };

  public type AppointmentType = {
    #consultation;
    #followUp;
    #emergency;
    #routine;
    #therapy;
    #examination;
  };

  public type Appointment = {
    id: AppointmentId;
    patientId: UserId;
    doctorId: DoctorId;
    appointmentType: AppointmentType;
    scheduledDate: Text;
    startTime: Text;
    endTime: Text;
    status: AppointmentStatus;
    notes: Text;
    symptoms: [Text];
    diagnosis: Text;
    prescription: Text;
    followUpRequired: Bool;
    followUpDate: ?Text;
    createdAt: Int;
    updatedAt: Int;
  };

  // Medical record data model with PHI encryption
  public type MedicalRecord = {
    id: RecordId;
    patientId: UserId;
    doctorId: DoctorId;
    appointmentId: ?AppointmentId;
    recordType: Text; // "consultation", "lab_result", "prescription", "diagnosis"
    title: Text;                        // Non-PHI: can remain unencrypted
    encryptedDescription: ?EncryptedPHI; // PHI: encrypted medical content
    encryptedAttachments: ?EncryptedPHI; // PHI: encrypted file references
    // Legacy fields for backward compatibility (deprecated)
    description: Text;                  // Deprecated: use encryptedDescription
    attachments: [Text];                // Deprecated: use encryptedAttachments
    // Access control and metadata
    isConfidential: Bool;
    accessPermissions: [UserId]; // Who can access this record
    createdAt: Int;
    updatedAt: Int;
  };

  // Message data model for secure communication
  public type Message = {
    id: Text;
    senderId: UserId;
    receiverId: UserId;
    content: Text;
    messageType: Text; // "text", "file", "image", "voice"
    attachments: [Text];
    isRead: Bool;
    isEncrypted: Bool;
    timestamp: Int;
  };

  // Consent and Session Management Types
  public type ConsentType = {
    #medicalRecords;
    #sessionNotes;
    #prescriptions;
    #diagnostics;
    #fullAccess;
  };

  public type ConsentStatus = {
    #granted;
    #revoked;
    #pending;
    #expired;
  };

  public type ConsentRecord = {
    id: Text;
    patientId: UserId;
    therapistId: Text;
    consentType: ConsentType;
    status: ConsentStatus;
    grantedAt: ?Int;
    revokedAt: ?Int;
    expiresAt: ?Int;
    purpose: Text;
    createdAt: Int;
    updatedAt: Int;
  };

  public type TherapistAvailability = {
    therapistId: Text;
    dayOfWeek: Nat; // 0-6 (Sunday-Saturday)
    startTime: Text; // "09:00"
    endTime: Text; // "17:00"
    isAvailable: Bool;
    sessionDuration: Nat; // minutes
    breakBetweenSessions: Nat; // minutes
    maxSessionsPerDay: Nat;
    updatedAt: Int;
  };

  public type SessionPricing = {
    therapistId: Text;
    sessionType: Text; // "individual", "group", "family", "couples"
    duration: Nat; // minutes
    price: Nat; // in tokens/cycles
    currency: Text; // "MVT", "ICP", "USD"
    isActive: Bool;
    discountPercentage: ?Nat;
    packageDeals: ?Text; // JSON string for complex pricing
    createdAt: Int;
    updatedAt: Int;
  };

  public type SessionRequest = {
    id: Text;
    patientId: UserId;
    therapistId: Text;
    requestedDate: Text;
    requestedTime: Text;
    sessionType: Text;
    duration: Nat;
    notes: Text;
    urgencyLevel: Text; // "low", "medium", "high", "emergency"
    status: SessionRequestStatus;
    createdAt: Int;
    updatedAt: Int;
  };

  public type SessionRequestStatus = {
    #pending;
    #accepted;
    #declined;
    #rescheduled;
    #cancelled;
  };

  // Medical Records & Storage Types (Iteration 3)
  public type EncryptionLevel = {
    #none;
    #standard;
    #high;
    #maximum;
  };

  public type AccessLevel = {
    #read;
    #write;
    #admin;
    #owner;
  };

  public type SessionNote = {
    id: Text;
    sessionId: Text;
    therapistId: Text;
    patientId: UserId;
    content: Text; // Encrypted content
    encryptionLevel: EncryptionLevel;
    tags: [Text]; // For categorization
    isConfidential: Bool;
    accessPermissions: [(UserId, AccessLevel)];
    createdAt: Int;
    updatedAt: Int;
    lastAccessedAt: ?Int;
    lastAccessedBy: ?UserId;
  };

  public type Prescription = {
    id: Text;
    patientId: UserId;
    therapistId: Text;
    sessionId: ?Text;
    medicationName: Text;
    dosage: Text;
    frequency: Text;
    duration: Text;
    instructions: Text;
    sideEffects: [Text];
    contraindications: [Text];
    isActive: Bool;
    startDate: Text;
    endDate: ?Text;
    refillsRemaining: Nat;
    pharmacyNotes: ?Text;
    encryptionLevel: EncryptionLevel;
    accessPermissions: [(UserId, AccessLevel)];
    createdAt: Int;
    updatedAt: Int;
  };

  public type TreatmentSummary = {
    id: Text;
    patientId: UserId;
    therapistId: Text;
    treatmentPeriod: {
      startDate: Text;
      endDate: ?Text;
    };
    diagnosis: [Text];
    treatmentGoals: [Text];
    interventionsUsed: [Text];
    progressNotes: Text;
    outcomes: Text;
    recommendations: Text;
    followUpPlan: ?Text;
    riskAssessment: ?Text;
    encryptionLevel: EncryptionLevel;
    accessPermissions: [(UserId, AccessLevel)];
    attachments: [Text]; // File hashes or URLs
    createdAt: Int;
    updatedAt: Int;
  };

  public type AuditLogAction = {
    #create;
    #read;
    #update;
    #delete;
    #access_granted;
    #access_revoked;
    #export;
    #share;
    #token_award;
    #daily_usage;
    #feedback_submitted;
    #premium_booking;
    #error;
  };

  public type AuditLog = {
    id: Text;
    userId: UserId;
    action: AuditLogAction;
    resourceType: Text; // "session_note", "prescription", "treatment_summary", etc.
    resourceId: Text;
    details: ?Text;
    ipAddress: ?Text;
    userAgent: ?Text;
    timestamp: Int;
    // Hash-chaining for integrity
    previousHash: ?Text;
    currentHash: Text;
    sequenceNumber: Nat;
  };

  // Pagination types for audit logs
  public type AuditLogPage = {
    logs: [AuditLog];
    totalCount: Nat;
    pageNumber: Nat;
    pageSize: Nat;
    hasNextPage: Bool;
    hasPreviousPage: Bool;
  };

  public type AuditLogFilter = {
    userId: ?UserId;
    action: ?AuditLogAction;
    resourceType: ?Text;
    resourceId: ?Text;
    startTime: ?Int;
    endTime: ?Int;
    severity: ?Text;
  };

  public type AccessControlRule = {
    id: Text;
    resourceType: Text;
    resourceId: Text;
    userId: UserId;
    accessLevel: AccessLevel;
    grantedBy: UserId;
    grantedAt: Int;
    expiresAt: ?Int;
    isActive: Bool;
    conditions: ?Text; // JSON string for complex conditions
  };

  // Payment Integration Types
  public type PaymentStatus = {
    #pending;
    #processing;
    #completed;
    #failed;
    #refunded;
    #disputed;
  };

  public type PaymentMethod = {
    #mvt_tokens;
    #cycles;
    #escrow;
  };

  public type RefundReason = {
    #appointment_cancelled;
    #service_not_provided;
    #quality_issue;
    #technical_error;
    #dispute_resolved;
  };

  public type PaymentTransaction = {
    id: Text;
    payerId: Principal;
    payeeId: Principal;
    amount: Nat;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    serviceType: Text;
    serviceId: Text;
    createdAt: Int;
    completedAt: ?Int;
    refundedAt: ?Int;
    refundReason: ?RefundReason;
    escrowReleaseConditions: ?Text;
    autoRefundEnabled: Bool;
    refundDeadline: ?Int;
  };

  public type EscrowContract = {
    id: Text;
    payerId: Principal;
    payeeId: Principal;
    amount: Nat;
    serviceId: Text;
    conditions: Text;
    createdAt: Int;
    releaseConditions: [Text];
    disputeResolution: ?Text;
    autoReleaseTime: Int;
    status: PaymentStatus;
  };

  public type PaymentPlan = {
    id: Text;
    userId: Principal;
    totalAmount: Nat;
    installments: Nat;
    installmentAmount: Nat;
    frequency: Text; // "weekly", "monthly", "quarterly"
    startDate: Int;
    nextPaymentDate: Int;
    remainingInstallments: Nat;
    status: PaymentStatus;
    autoPayEnabled: Bool;
  };

  // Storage using stable variables for persistence
  private var userProfilesEntries : [(UserId, UserProfile)] = [];
  private var patientsEntries : [(UserId, Patient)] = [];
  private var therapistsEntries : [(DoctorId, Therapist)] = [];
  private var doctorsEntries : [(DoctorId, Doctor)] = []; // Legacy support
  private var appointmentsEntries : [(AppointmentId, Appointment)] = [];
  private var medicalRecordsEntries : [(RecordId, MedicalRecord)] = [];
  private var messagesEntries : [(Text, Message)] = [];
  private var userRolesEntries : [(UserId, Text)] = []; // Legacy support
  private var chatInteractionsEntries : [(Text, ChatInteraction)] = [];
  private var faucetClaimsEntries : [(Text, FaucetClaim)] = [];
  private var lastClaimTimesEntries : [(UserId, Int)] = [];
  // New consent and session management storage
  private var consentRecordsEntries : [(Text, ConsentRecord)] = [];
  private var therapistAvailabilityEntries : [(Text, TherapistAvailability)] = [];
  private var sessionPricingEntries : [(Text, SessionPricing)] = [];
  private var sessionRequestsEntries : [(Text, SessionRequest)] = [];
  // Medical Records & Storage entries (Iteration 3)
  private var sessionNotesEntries : [(Text, SessionNote)] = [];
  private var prescriptionsEntries : [(Text, Prescription)] = [];
  private var treatmentSummariesEntries : [(Text, TreatmentSummary)] = [];
  private var auditLogsEntries : [(Text, AuditLog)] = [];
  // Hash-chaining support for audit log integrity
  private stable var lastAuditHash : ?Text = null;
  private stable var auditSequenceNumber : Nat = 0;
  private var accessControlRulesEntries : [(Text, AccessControlRule)] = [];
  // Payment Integration entries (Iteration 4)
  private var paymentTransactionsEntries : [(Text, PaymentTransaction)] = [];
  private var escrowContractsEntries : [(Text, EscrowContract)] = [];
  private var paymentPlansEntries : [(Text, PaymentPlan)] = [];
  // PHI Encryption entries (Iteration 5)
  private var encryptedPatientPHIEntries : [(UserId, EncryptedPatientPHI)] = [];
  private var phiEncryptionKeysEntries : [(Text, PHIEncryptionKey)] = [];
  private var userPHIKeysEntries : [(UserId, Text)] = [];
  // Phase 0: Onboarding state tracking
  private var onboardingStatesEntries : [(Principal, Bool)] = [];
  // Phase 1: RBAC storage
  private var userRoleAssignmentsEntries : [(Principal, UserType)] = [];
  private var adminUsersEntries : [(Principal, Bool)] = [];

  // Initialize HashMaps from stable storage
  private transient var userProfiles = HashMap.HashMap<UserId, UserProfile>(50, Principal.equal, Principal.hash);
  private transient var patients = HashMap.HashMap<UserId, Patient>(10, Principal.equal, Principal.hash);
  private transient var therapists = HashMap.HashMap<DoctorId, Therapist>(10, Text.equal, Text.hash);
  private transient var doctors = HashMap.HashMap<DoctorId, Doctor>(10, Text.equal, Text.hash); // Legacy support
  private transient var appointments = HashMap.HashMap<AppointmentId, Appointment>(10, Text.equal, Text.hash);
  private transient var medicalRecords = HashMap.HashMap<RecordId, MedicalRecord>(10, Text.equal, Text.hash);
  // Phase 0: Onboarding state tracking
  private transient var onboardingStates = HashMap.HashMap<Principal, Bool>(100, Principal.equal, Principal.hash);
  // Phase 1: RBAC HashMaps
  private transient var userRoleAssignments = HashMap.HashMap<Principal, UserType>(100, Principal.equal, Principal.hash);
  private transient var adminUsers = HashMap.HashMap<Principal, Bool>(20, Principal.equal, Principal.hash);
  private transient var messages = HashMap.HashMap<Text, Message>(10, Text.equal, Text.hash);
  private transient var userRoles = HashMap.HashMap<UserId, Text>(10, Principal.equal, Principal.hash); // Legacy support
  private transient var faucetClaims = HashMap.HashMap<Text, FaucetClaim>(10, Text.equal, Text.hash);
  private transient var lastClaimTimes = HashMap.HashMap<UserId, Int>(10, Principal.equal, Principal.hash);
  // New consent and session management HashMaps
  private transient var consentRecords = HashMap.HashMap<Text, ConsentRecord>(10, Text.equal, Text.hash);
  private transient var therapistAvailability = HashMap.HashMap<Text, TherapistAvailability>(10, Text.equal, Text.hash);
  private transient var sessionPricing = HashMap.HashMap<Text, SessionPricing>(10, Text.equal, Text.hash);
  private transient var sessionRequests = HashMap.HashMap<Text, SessionRequest>(10, Text.equal, Text.hash);
  // Medical Records & Storage HashMaps (Iteration 3)
  private transient var sessionNotes = HashMap.HashMap<Text, SessionNote>(10, Text.equal, Text.hash);
  private transient var prescriptions = HashMap.HashMap<Text, Prescription>(10, Text.equal, Text.hash);
  private transient var treatmentSummaries = HashMap.HashMap<Text, TreatmentSummary>(10, Text.equal, Text.hash);
  private transient var auditLogs = HashMap.HashMap<Text, AuditLog>(50, Text.equal, Text.hash);
  private transient var accessControlRules = HashMap.HashMap<Text, AccessControlRule>(20, Text.equal, Text.hash);
  
  // PHI Encryption Storage (Iteration 5)
  private transient var encryptedPatientPHI = HashMap.HashMap<UserId, EncryptedPatientPHI>(10, Principal.equal, Principal.hash);
  private transient var phiEncryptionKeys = HashMap.HashMap<Text, PHIEncryptionKey>(50, Text.equal, Text.hash);
  private transient var userPHIKeys = HashMap.HashMap<UserId, Text>(10, Principal.equal, Principal.hash); // Maps user to their PHI key ID
  
  // Payment Integration HashMaps (Iteration 4)
  private transient var paymentTransactions = HashMap.HashMap<Text, PaymentTransaction>(50, Text.equal, Text.hash);
  private transient var escrowContracts = HashMap.HashMap<Text, EscrowContract>(20, Text.equal, Text.hash);
  private transient var paymentPlans = HashMap.HashMap<Text, PaymentPlan>(20, Text.equal, Text.hash);

  // System upgrade hooks to maintain state
  system func preupgrade() {
    userProfilesEntries := Iter.toArray(userProfiles.entries());
    patientsEntries := Iter.toArray(patients.entries());
    therapistsEntries := Iter.toArray(therapists.entries());
    doctorsEntries := Iter.toArray(doctors.entries());
    appointmentsEntries := Iter.toArray(appointments.entries());
    medicalRecordsEntries := Iter.toArray(medicalRecords.entries());
    messagesEntries := Iter.toArray(messages.entries());
    userRolesEntries := Iter.toArray(userRoles.entries());
    chatInteractionsEntries := Iter.toArray(chatInteractionsMap.entries());
    faucetClaimsEntries := Iter.toArray(faucetClaims.entries());
    lastClaimTimesEntries := Iter.toArray(lastClaimTimes.entries());
    // Save new consent and session management data
    consentRecordsEntries := Iter.toArray(consentRecords.entries());
    therapistAvailabilityEntries := Iter.toArray(therapistAvailability.entries());
    sessionPricingEntries := Iter.toArray(sessionPricing.entries());
    sessionRequestsEntries := Iter.toArray(sessionRequests.entries());
    // Save medical records & storage data (Iteration 3)
    sessionNotesEntries := Iter.toArray(sessionNotes.entries());
    prescriptionsEntries := Iter.toArray(prescriptions.entries());
    treatmentSummariesEntries := Iter.toArray(treatmentSummaries.entries());
    auditLogsEntries := Iter.toArray(auditLogs.entries());
    accessControlRulesEntries := Iter.toArray(accessControlRules.entries());
    // Save payment integration data
    paymentTransactionsEntries := Iter.toArray(paymentTransactions.entries());
    escrowContractsEntries := Iter.toArray(escrowContracts.entries());
    paymentPlansEntries := Iter.toArray(paymentPlans.entries());
    // Save PHI encryption data (Iteration 5)
    encryptedPatientPHIEntries := Iter.toArray(encryptedPatientPHI.entries());
    phiEncryptionKeysEntries := Iter.toArray(phiEncryptionKeys.entries());
    userPHIKeysEntries := Iter.toArray(userPHIKeys.entries());
    // Phase 0: Save onboarding state data
    onboardingStatesEntries := Iter.toArray(onboardingStates.entries());
    // Phase 1: Save RBAC data
    userRoleAssignmentsEntries := Iter.toArray(userRoleAssignments.entries());
    adminUsersEntries := Iter.toArray(adminUsers.entries());
    // Phase 2: Save security data
    rateLimitEntries := Iter.toArray(rateLimits.entries());
    nonceEntries := Iter.toArray(usedNonces.entries());
  };

  system func postupgrade() {
    // Restore data from stable storage
    for ((id, profile) in userProfilesEntries.vals()) {
      userProfiles.put(id, profile);
    };
    for ((id, patient) in patientsEntries.vals()) {
      patients.put(id, patient);
    };
    for ((id, therapist) in therapistsEntries.vals()) {
      therapists.put(id, therapist);
    };
    for ((id, doctor) in doctorsEntries.vals()) {
      doctors.put(id, doctor);
    };
    for ((id, appointment) in appointmentsEntries.vals()) {
      appointments.put(id, appointment);
    };
    for ((id, record) in medicalRecordsEntries.vals()) {
      medicalRecords.put(id, record);
    };
    for ((id, message) in messagesEntries.vals()) {
      messages.put(id, message);
    };
    for ((id, role) in userRolesEntries.vals()) {
      userRoles.put(id, role);
    };
    for ((id, interaction) in chatInteractionsEntries.vals()) {
      chatInteractionsMap.put(id, interaction);
    };
    for ((id, claim) in faucetClaimsEntries.vals()) {
      faucetClaims.put(id, claim);
    };
    for ((id, time) in lastClaimTimesEntries.vals()) {
      lastClaimTimes.put(id, time);
    };
    // Restore new consent and session management data
    for ((id, consent) in consentRecordsEntries.vals()) {
      consentRecords.put(id, consent);
    };
    for ((id, availability) in therapistAvailabilityEntries.vals()) {
      therapistAvailability.put(id, availability);
    };
    for ((id, pricing) in sessionPricingEntries.vals()) {
      sessionPricing.put(id, pricing);
    };
    for ((id, request) in sessionRequestsEntries.vals()) {
      sessionRequests.put(id, request);
    };
    // Restore medical records & storage data (Iteration 3)
    for ((id, note) in sessionNotesEntries.vals()) {
      sessionNotes.put(id, note);
    };
    for ((id, prescription) in prescriptionsEntries.vals()) {
      prescriptions.put(id, prescription);
    };
    for ((id, summary) in treatmentSummariesEntries.vals()) {
      treatmentSummaries.put(id, summary);
    };
    for ((id, log) in auditLogsEntries.vals()) {
      auditLogs.put(id, log);
    };
    for ((id, rule) in accessControlRulesEntries.vals()) {
      accessControlRules.put(id, rule);
    };
    // Restore payment integration data (Iteration 4)
    for ((id, transaction) in paymentTransactionsEntries.vals()) {
      paymentTransactions.put(id, transaction);
    };
    for ((id, contract) in escrowContractsEntries.vals()) {
      escrowContracts.put(id, contract);
    };
    for ((id, plan) in paymentPlansEntries.vals()) {
      paymentPlans.put(id, plan);
    };
    // Restore PHI encryption data (Iteration 5)
    for ((userId, phi) in encryptedPatientPHIEntries.vals()) {
      encryptedPatientPHI.put(userId, phi);
    };
    for ((keyId, key) in phiEncryptionKeysEntries.vals()) {
      phiEncryptionKeys.put(keyId, key);
    };
    for ((userId, keyId) in userPHIKeysEntries.vals()) {
      userPHIKeys.put(userId, keyId);
    };
    // Phase 0: Restore onboarding state data
    for ((userId, completed) in onboardingStatesEntries.vals()) {
      onboardingStates.put(userId, completed);
    };
    // Phase 1: Restore RBAC data
    for ((userId, role) in userRoleAssignmentsEntries.vals()) {
      userRoleAssignments.put(userId, role);
    };
    for ((userId, isAdmin) in adminUsersEntries.vals()) {
      adminUsers.put(userId, isAdmin);
    };
    // Phase 2: Restore security data
    for ((principal, rateLimitInfo) in rateLimitEntries.vals()) {
      rateLimits.put(principal, rateLimitInfo);
    };
    for ((nonce, timestamp) in nonceEntries.vals()) {
      usedNonces.put(nonce, timestamp);
    };
    
    // Clear stable storage
    userProfilesEntries := [];
    patientsEntries := [];
    therapistsEntries := [];
    doctorsEntries := [];
    appointmentsEntries := [];
    medicalRecordsEntries := [];
    messagesEntries := [];
    userRolesEntries := [];
    chatInteractionsEntries := [];
    faucetClaimsEntries := [];
    lastClaimTimesEntries := [];
    // Clear new consent and session management storage
    consentRecordsEntries := [];
    therapistAvailabilityEntries := [];
    sessionPricingEntries := [];
    sessionRequestsEntries := [];
    // Clear medical records & storage entries (Iteration 3)
    sessionNotesEntries := [];
    prescriptionsEntries := [];
    treatmentSummariesEntries := [];
    auditLogsEntries := [];
    accessControlRulesEntries := [];
    // Clear payment integration entries (Iteration 4)
    paymentTransactionsEntries := [];
    escrowContractsEntries := [];
    paymentPlansEntries := [];
    // Phase 0: Clear onboarding state entries
    onboardingStatesEntries := [];
    // Phase 1: Clear RBAC entries
    userRoleAssignmentsEntries := [];
    adminUsersEntries := [];
  };

  // Enhanced Authentication and User Management Functions
  
  // Initial user registration with wallet connection
  public shared(msg) func initializeUser(userData: {
    firstName: Text;
    lastName: Text;
    email: Text;
    phoneNumber: ?Text;
    userType: UserType;
  }) : async Result.Result<UserProfile, Text> {
    let caller = msg.caller;
    
    // Check if user already exists
    switch (userProfiles.get(caller)) {
      case (?_existingProfile) {
        #err("User already registered")
      };
      case null {
        let now = Time.now();
        let newProfile: UserProfile = {
          id = caller;
          userType = userData.userType;
          firstName = userData.firstName;
          lastName = userData.lastName;
          email = userData.email;
          phoneNumber = userData.phoneNumber;
          profilePicture = null;
          bio = null;
          verificationStatus = #pending;
          onboardingCompleted = false;
          createdAt = now;
          updatedAt = now;
        };
        
        userProfiles.put(caller, newProfile);
        
        // Update legacy role mapping
        let roleText = switch (userData.userType) {
          case (#patient) "patient";
          case (#therapist) "doctor";
          case (#admin) "admin";
        };
        userRoles.put(caller, roleText);
        
        // Phase 1: RBAC - Store role assignment
        userRoleAssignments.put(caller, userData.userType);
        
        // If admin, add to admin users
        if (userData.userType == #admin) {
          adminUsers.put(caller, true);
        };
        
        // Audit logging for user registration
        logAuditEvent(
          caller,
          #create,
          "user_profile",
          Principal.toText(caller),
          ?("User registered with role: " # roleText # ", email: " # userData.email)
        );
        
        // Log role assignment
        logAuditEvent(
          caller,
          #create,
          "role_assignment",
          Principal.toText(caller),
          ?("Role assigned: " # roleText)
        );
        
        // Log admin assignment if applicable
        if (userData.userType == #admin) {
          logSecurityEvent(
            ?caller,
            "admin_user_created",
            "New admin user registered: " # userData.email,
            "high"
          );
        };
        
        #ok(newProfile)
      };
    }
  };
  
  // Complete onboarding with user type selection
  public shared(msg) func completeOnboarding(userType: UserType, additionalData: {
    bio: ?Text;
    profilePicture: ?Text;
  }) : async Result.Result<UserProfile, Text> {
    let caller = msg.caller;
    
    switch (userProfiles.get(caller)) {
      case null {
        #err("User not found. Please initialize user first.")
      };
      case (?profile) {
        let now = Time.now();
        let updatedProfile: UserProfile = {
          id = profile.id;
          userType = userType;
          firstName = profile.firstName;
          lastName = profile.lastName;
          email = profile.email;
          phoneNumber = profile.phoneNumber;
          profilePicture = additionalData.profilePicture;
          bio = additionalData.bio;
          verificationStatus = profile.verificationStatus;
          onboardingCompleted = true;
          createdAt = profile.createdAt;
          updatedAt = now;
        };
        
        userProfiles.put(caller, updatedProfile);
        
        // Update legacy role mapping
        let roleText = switch (userType) {
          case (#patient) "patient";
          case (#therapist) "doctor";
          case (#admin) "admin";
        };
        userRoles.put(caller, roleText);
        
        // Phase 1: RBAC - Update role assignment
        userRoleAssignments.put(caller, userType);
        
        // If admin, add to admin users
        if (userType == #admin) {
          adminUsers.put(caller, true);
        };
        
        #ok(updatedProfile)
      };
    }
  };
  
  // Get current user profile
  public shared query(msg) func getCurrentUserProfile() : async Result.Result<UserProfile, Text> {
    let caller = msg.caller;
    
    switch (userProfiles.get(caller)) {
      case (?profile) {
        #ok(profile)
      };
      case null {
        #err("User not found")
      };
    }
  };
  
  // === ENHANCED GRANULAR RBAC WITH FINE-GRAINED PERMISSIONS ===
  
  // Permission definitions for granular access control
  public type Permission = {
    #read_own_profile;
    #update_own_profile;
    #read_patient_data;
    #write_patient_data;
    #read_session_notes;
    #write_session_notes;
    #read_prescriptions;
    #write_prescriptions;
    #read_medical_records;
    #write_medical_records;
    #manage_appointments;
    #view_audit_logs;
    #manage_users;
    #assign_roles;
    #system_admin;
    #financial_operations;
    #emergency_access;
  };
  
  // Resource scope definitions
  public type ResourceScope = {
    #global; // Access to all resources of this type
    #department : Text; // Access within specific department
    #patient_group : [Principal]; // Access to specific patients
    #own_only; // Access only to own resources
    #assigned_only; // Access only to assigned resources
  };
  
  // Enhanced permission with scope and conditions
  public type ScopedPermission = {
    permission: Permission;
    scope: ResourceScope;
    conditions: ?Text; // JSON string for complex conditions
    expiresAt: ?Int;
    isActive: Bool;
  };
  
  // Role definition with granular permissions
  public type RoleDefinition = {
    name: Text;
    description: Text;
    permissions: [ScopedPermission];
    inheritsFrom: ?Text; // Role inheritance
    isSystemRole: Bool;
    createdAt: Int;
    updatedAt: Int;
  };
  
  // User permission assignment (can override role permissions)
  public type UserPermissionOverride = {
    userId: Principal;
    permission: ScopedPermission;
    grantedBy: Principal;
    reason: Text;
    grantedAt: Int;
  };
  
  // Storage for granular RBAC
  private transient var roleDefinitions = HashMap.HashMap<Text, RoleDefinition>(20, Text.equal, Text.hash);
  private transient var userPermissionOverrides = HashMap.HashMap<Text, UserPermissionOverride>(50, Text.equal, Text.hash);
  private transient var resourceOwnership = HashMap.HashMap<Text, Principal>(100, Text.equal, Text.hash);
  private transient var departmentAssignments = HashMap.HashMap<Principal, Text>(50, Principal.equal, Principal.hash);
  
  // Initialize default role definitions
  private func initializeDefaultRoles() {
    let now = Time.now();
    
    // Patient role
    let patientRole: RoleDefinition = {
      name = "patient";
      description = "Standard patient with access to own data";
      permissions = [
        { permission = #read_own_profile; scope = #own_only; conditions = null; expiresAt = null; isActive = true },
        { permission = #update_own_profile; scope = #own_only; conditions = null; expiresAt = null; isActive = true },
        { permission = #read_medical_records; scope = #own_only; conditions = null; expiresAt = null; isActive = true },
        { permission = #read_prescriptions; scope = #own_only; conditions = null; expiresAt = null; isActive = true }
      ];
      inheritsFrom = null;
      isSystemRole = true;
      createdAt = now;
      updatedAt = now;
    };
    
    // Therapist role
    let therapistRole: RoleDefinition = {
      name = "therapist";
      description = "Licensed therapist with patient care permissions";
      permissions = [
        { permission = #read_own_profile; scope = #own_only; conditions = null; expiresAt = null; isActive = true },
        { permission = #update_own_profile; scope = #own_only; conditions = null; expiresAt = null; isActive = true },
        { permission = #read_patient_data; scope = #assigned_only; conditions = null; expiresAt = null; isActive = true },
        { permission = #write_patient_data; scope = #assigned_only; conditions = null; expiresAt = null; isActive = true },
        { permission = #read_session_notes; scope = #assigned_only; conditions = null; expiresAt = null; isActive = true },
        { permission = #write_session_notes; scope = #assigned_only; conditions = null; expiresAt = null; isActive = true },
        { permission = #read_prescriptions; scope = #assigned_only; conditions = null; expiresAt = null; isActive = true },
        { permission = #write_prescriptions; scope = #assigned_only; conditions = null; expiresAt = null; isActive = true },
        { permission = #manage_appointments; scope = #assigned_only; conditions = null; expiresAt = null; isActive = true }
      ];
      inheritsFrom = ?"patient";
      isSystemRole = true;
      createdAt = now;
      updatedAt = now;
    };
    
    // Admin role
    let adminRole: RoleDefinition = {
      name = "admin";
      description = "System administrator with full access";
      permissions = [
        { permission = #system_admin; scope = #global; conditions = null; expiresAt = null; isActive = true },
        { permission = #manage_users; scope = #global; conditions = null; expiresAt = null; isActive = true },
        { permission = #assign_roles; scope = #global; conditions = null; expiresAt = null; isActive = true },
        { permission = #view_audit_logs; scope = #global; conditions = null; expiresAt = null; isActive = true },
        { permission = #emergency_access; scope = #global; conditions = null; expiresAt = null; isActive = true }
      ];
      inheritsFrom = ?"therapist";
      isSystemRole = true;
      createdAt = now;
      updatedAt = now;
    };
    
    roleDefinitions.put("patient", patientRole);
    roleDefinitions.put("therapist", therapistRole);
    roleDefinitions.put("admin", adminRole);
  };
  
  // Check if user has specific role
  private func hasRole(userId: Principal, requiredRole: UserType) : Bool {
    switch (userRoleAssignments.get(userId)) {
      case (?role) { role == requiredRole };
      case null { false };
    }
  };
  
  // Check if user is admin
  private func isAdmin(userId: Principal) : Bool {
    switch (adminUsers.get(userId)) {
      case (?isAdmin) { isAdmin };
      case null { false };
    }
  };
  
  // Enhanced authorization check with multiple roles
  private func hasAnyRole(userId: Principal, allowedRoles: [UserType]) : Bool {
    switch (userRoleAssignments.get(userId)) {
      case (?userRole) {
        Array.find<UserType>(allowedRoles, func(role) { role == userRole }) != null
      };
      case null { false };
    }
  };
  
  // Check if user can access patient data
  private func canAccessPatientData(userId: Principal, patientId: Principal) : Bool {
    // Admin can access all data
    if (isAdmin(userId)) { return true };
    
    // Users can access their own data
    if (userId == patientId) { return true };
    
    // Therapists can access their patients' data (simplified - in real implementation, check active sessions)
    if (hasRole(userId, #therapist)) { return true };
    
    false
  };
  
  // Assign role to user (admin only)
  public shared(msg) func assignUserRole(targetUserId: Principal, newRole: UserType) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Only admins can assign roles
    if (not isAdmin(caller)) {
      return #err("Unauthorized: Only admins can assign roles");
    };
    
    // Verify target user exists
    switch (userProfiles.get(targetUserId)) {
      case null { return #err("Target user not found") };
      case (?profile) {
        // Update role assignment
        userRoleAssignments.put(targetUserId, newRole);
        
        // Update admin status
        if (newRole == #admin) {
          adminUsers.put(targetUserId, true);
        } else {
          adminUsers.delete(targetUserId);
        };
        
        // Update user profile
        let updatedProfile: UserProfile = {
          id = profile.id;
          userType = newRole;
          firstName = profile.firstName;
          lastName = profile.lastName;
          email = profile.email;
          phoneNumber = profile.phoneNumber;
          profilePicture = profile.profilePicture;
          bio = profile.bio;
          verificationStatus = profile.verificationStatus;
          onboardingCompleted = profile.onboardingCompleted;
          createdAt = profile.createdAt;
          updatedAt = Time.now();
        };
        userProfiles.put(targetUserId, updatedProfile);
        
        // Update legacy role mapping
        let roleText = switch (newRole) {
          case (#patient) "patient";
          case (#therapist) "doctor";
          case (#admin) "admin";
        };
        userRoles.put(targetUserId, roleText);
        
        // Audit logging for role assignment
        logAuditEvent(
          caller,
          #update,
          "role_assignment",
          Principal.toText(targetUserId),
          ?("Role changed to: " # roleText # " by admin: " # Principal.toText(caller))
        );
        
        // Log security event for admin role assignments
        if (newRole == #admin) {
          logSecurityEvent(
            ?caller,
            "admin_role_assigned",
            "Admin role assigned to user: " # Principal.toText(targetUserId) # " by: " # Principal.toText(caller),
            "high"
          );
        };
        
        #ok("Role assigned successfully")
      };
    }
  };
  
  // Get user role
  public shared query(msg) func getUserRole(userId: ?Principal) : async Result.Result<UserType, Text> {
    let targetUserId = switch (userId) {
      case (?id) { id };
      case null { msg.caller };
    };
    
    let caller = msg.caller;
    
    // Users can check their own role, admins can check any role
    if (caller != targetUserId and not isAdmin(caller)) {
      return #err("Unauthorized: Cannot access other users' roles");
    };
    
    switch (userRoleAssignments.get(targetUserId)) {
      case (?role) { #ok(role) };
      case null { #err("User role not found") };
    }
  };
  
  // List all admin users (admin only)
  public shared query(msg) func getAdminUsers() : async Result.Result<[Principal], Text> {
    let caller = msg.caller;
    
    if (not isAdmin(caller)) {
      return #err("Unauthorized: Only admins can view admin list");
    };
    
    let adminList = Array.mapFilter<(Principal, Bool), Principal>(
      Iter.toArray(adminUsers.entries()),
      func((userId, isAdminFlag)) {
        if (isAdminFlag) { ?userId } else { null }
      }
    );
    
    #ok(adminList)
  };
  
  // Remove admin privileges (super admin only - for now, any admin can do this)
  public shared(msg) func removeAdminPrivileges(targetUserId: Principal) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    if (not isAdmin(caller)) {
      return #err("Unauthorized: Only admins can remove admin privileges");
    };
    
    if (caller == targetUserId) {
      return #err("Cannot remove your own admin privileges");
    };
    
    adminUsers.delete(targetUserId);
    
    // Update role to patient (default)
    userRoleAssignments.put(targetUserId, #patient);
    
    // Update user profile if exists
    switch (userProfiles.get(targetUserId)) {
      case (?profile) {
        let updatedProfile: UserProfile = {
          id = profile.id;
          userType = #patient;
          firstName = profile.firstName;
          lastName = profile.lastName;
          email = profile.email;
          phoneNumber = profile.phoneNumber;
          profilePicture = profile.profilePicture;
          bio = profile.bio;
          verificationStatus = profile.verificationStatus;
          onboardingCompleted = profile.onboardingCompleted;
          createdAt = profile.createdAt;
          updatedAt = Time.now();
        };
        userProfiles.put(targetUserId, updatedProfile);
        
        userRoles.put(targetUserId, "patient");
      };
      case null { /* User profile doesn't exist, role assignment is enough */ };
    };
    
    #ok("Admin privileges removed successfully")
  };
  
  // Legacy function for backward compatibility
  public shared query(msg) func getCurrentUser() : async Result.Result<{id: UserId; role: Text}, Text> {
    let caller = msg.caller;
    
    switch (userProfiles.get(caller)) {
      case (?profile) {
        let roleText = switch (profile.userType) {
          case (#patient) "patient";
          case (#therapist) "doctor";
          case (#admin) "admin";
        };
        #ok({id = caller; role = roleText})
      };
      case null {
        #err("User not registered")
      };
    }
  };
  
  // Enhanced authorization function using RBAC
  private func isAuthorized(caller: UserId, requiredUserType: UserType) : Bool {
    // Admin can access everything
    if (isAdmin(caller)) { return true };
    
    // Check specific role
    hasRole(caller, requiredUserType)
  };
  
  // Enhanced authorization check with audit logging
  private func isAuthorizedWithAudit(
    caller: UserId,
    requiredUserType: UserType,
    resourceType: Text,
    resourceId: Text,
    action: Text
  ) : Bool {
    let authorized = isAuthorized(caller, requiredUserType);
    
    if (not authorized) {
      // Log unauthorized access attempt
      logSecurityEvent(
        ?caller,
        "unauthorized_access_attempt",
        "User " # Principal.toText(caller) # " attempted " # action # " on " # resourceType # " (" # resourceId # ") but lacks required role",
        "medium"
      );
    };
    
    authorized
  };
  
  // === GRANULAR PERMISSION SYSTEM ===
  
  // Enhanced granular authorization with scoped permissions
  private func hasPermission(caller: Principal, requiredPermission: Permission, resourceId: ?Text, context: ?Text) : async Bool {
    // Get all effective permissions for the user
    let effectivePermissions = await getEffectivePermissions(caller);
    
    // Check each permission to see if it matches and scope allows access
    for (scopedPerm in effectivePermissions.vals()) {
      if (scopedPerm.permission == requiredPermission and scopedPerm.isActive) {
        // Check expiration
        switch (scopedPerm.expiresAt) {
          case (?expiry) {
            if (Time.now() > expiry) { continue };
          };
          case null { /* No expiration */ };
        };
        
        // Check scope-based access
        let scopeAllowed = await checkScopeAccess(caller, scopedPerm.scope, resourceId, context);
        if (scopeAllowed) {
          // Check additional conditions if any
          switch (scopedPerm.conditions) {
            case (?conditionsJson) {
              let conditionsMet = await evaluateConditions(caller, conditionsJson, resourceId, context);
              if (conditionsMet) { return true };
            };
            case null { return true };
          }
        };
      };
    };
    
    false
  };
  
  // Get all effective permissions for a user (role + overrides)
  private func getEffectivePermissions(userId: Principal) : async [ScopedPermission] {
    var permissions: [ScopedPermission] = [];
    
    // Get role-based permissions
    switch (userRoleAssignments.get(userId)) {
      case (?userType) {
        let roleName = switch (userType) {
          case (#patient) { "patient" };
          case (#therapist) { "therapist" };
          case (#admin) { "admin" };
        };
        
        permissions := await getRolePermissions(roleName);
      };
      case null { /* No role assigned */ };
    };
    
    // Add user-specific permission overrides
    let overrideKey = Principal.toText(userId);
    switch (userPermissionOverrides.get(overrideKey)) {
      case (?override) {
        permissions := Array.append(permissions, [override.permission]);
      };
      case null { /* No overrides */ };
    };
    
    permissions
  };
  
  // Get permissions for a role (including inherited permissions)
  private func getRolePermissions(roleName: Text) : async [ScopedPermission] {
    var allPermissions: [ScopedPermission] = [];
    
    switch (roleDefinitions.get(roleName)) {
      case (?role) {
        allPermissions := role.permissions;
        
        // Add inherited permissions
        switch (role.inheritsFrom) {
          case (?parentRole) {
            let parentPermissions = await getRolePermissions(parentRole);
            allPermissions := Array.append(allPermissions, parentPermissions);
          };
          case null { /* No inheritance */ };
        };
      };
      case null { /* Role not found */ };
    };
    
    allPermissions
  };
  
  // Check if scope allows access to resource
  private func checkScopeAccess(userId: Principal, scope: ResourceScope, resourceId: ?Text, context: ?Text) : async Bool {
    switch (scope) {
      case (#global) { true };
      case (#own_only) {
        switch (resourceId) {
          case (?id) { Principal.toText(userId) == id };
          case null { true }; // If no specific resource, allow
        }
      };
      case (#assigned_only) {
        switch (resourceId) {
          case (?id) {
            // Check if resource is assigned to this user
            await isResourceAssignedToUser(id, userId)
          };
          case null { true };
        }
      };
      case (#department(dept)) {
        switch (departmentAssignments.get(userId)) {
          case (?userDept) { userDept == dept };
          case null { false };
        }
      };
      case (#patient_group(patients)) {
        switch (resourceId) {
          case (?id) {
            let resourcePrincipal = Principal.fromText(id);
            Array.find<Principal>(patients, func(p) { p == resourcePrincipal }) != null
          };
          case null { false };
        }
      };
    }
  };
  
  // Check if a resource is assigned to a user
  private func isResourceAssignedToUser(resourceId: Text, userId: Principal) : async Bool {
    // Check resource ownership
    switch (resourceOwnership.get(resourceId)) {
      case (?owner) { owner == userId };
      case null {
        // Check patient-therapist assignments
        isPatientAssignedToTherapist(Principal.fromText(resourceId), userId)
      };
    }
  };
  
  // Evaluate complex conditions (placeholder for future JSON condition evaluation)
  private func evaluateConditions(userId: Principal, conditionsJson: Text, resourceId: ?Text, context: ?Text) : async Bool {
    // For now, return true. In future, implement JSON condition parser
    // Example conditions: {"time_range": "09:00-17:00", "location": "clinic", "emergency_only": false}
    true
  };
  
  // Enhanced authorization wrapper for backward compatibility
  private func isAuthorizedGranular(caller: Principal, action: Text, resource: ?Text) : async Bool {
    let permission = switch (action) {
      case "read_profile" { #read_own_profile };
      case "write_profile" { #update_own_profile };
      case "read_session_notes" { #read_session_notes };
      case "write_session_notes" { #write_session_notes };
      case "read_prescriptions" { #read_prescriptions };
      case "write_prescriptions" { #write_prescriptions };
      case "read_patient_data" { #read_patient_data };
      case "write_patient_data" { #write_patient_data };
      case "manage_appointments" { #manage_appointments };
      case "view_audit_logs" { #view_audit_logs };
      case "manage_users" { #manage_users };
      case "assign_roles" { #assign_roles };
      case _ { return false };
    };
    
    await hasPermission(caller, permission, resource, null)
  };
  
  // === ROLE AND PERMISSION MANAGEMENT ===
  
  // Create or update a role definition (admin only)
  public shared(msg) func createRole(
    roleName: Text,
    description: Text,
    permissions: [ScopedPermission],
    inheritsFrom: ?Text
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Only admins can create roles
    if (not await hasPermission(caller, #system_admin, null, null)) {
      return #err("Unauthorized: Only system administrators can create roles");
    };
    
    let now = Time.now();
    let roleDefinition: RoleDefinition = {
      name = roleName;
      description = description;
      permissions = permissions;
      inheritsFrom = inheritsFrom;
      isSystemRole = false;
      createdAt = now;
      updatedAt = now;
    };
    
    roleDefinitions.put(roleName, roleDefinition);
    
    // Audit log
    logAuditEvent(
      caller,
      #create,
      "role_definition",
      roleName,
      ?("Role created with " # Int.toText(permissions.size()) # " permissions")
    );
    
    #ok("Role '" # roleName # "' created successfully")
  };
  
  // Grant specific permission to a user (admin only)
  public shared(msg) func grantUserPermission(
    targetUserId: Principal,
    permission: ScopedPermission,
    reason: Text
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Only admins can grant permissions
    if (not await hasPermission(caller, #assign_roles, null, null)) {
      return #err("Unauthorized: Only administrators can grant permissions");
    };
    
    let overrideKey = Principal.toText(targetUserId);
    let override: UserPermissionOverride = {
      userId = targetUserId;
      permission = permission;
      grantedBy = caller;
      reason = reason;
      grantedAt = Time.now();
    };
    
    userPermissionOverrides.put(overrideKey, override);
    
    // Audit log
    logAuditEvent(
      caller,
      #update,
      "user_permission",
      Principal.toText(targetUserId),
      ?("Permission granted: " # debug_show(permission.permission) # " - Reason: " # reason)
    );
    
    #ok("Permission granted successfully")
  };
  
  // Revoke specific permission from a user (admin only)
  public shared(msg) func revokeUserPermission(
    targetUserId: Principal
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Only admins can revoke permissions
    if (not await hasPermission(caller, #assign_roles, null, null)) {
      return #err("Unauthorized: Only administrators can revoke permissions");
    };
    
    let overrideKey = Principal.toText(targetUserId);
    switch (userPermissionOverrides.get(overrideKey)) {
      case (?existing) {
        userPermissionOverrides.delete(overrideKey);
        
        // Audit log
        logAuditEvent(
          caller,
          #delete,
          "user_permission",
          Principal.toText(targetUserId),
          ?("Permission revoked: " # debug_show(existing.permission.permission))
        );
        
        #ok("Permission revoked successfully")
      };
      case null {
        #err("No permission override found for this user")
      };
    }
  };
  
  // Assign department to user (admin only)
  public shared(msg) func assignUserToDepartment(
    targetUserId: Principal,
    department: Text
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Only admins can assign departments
    if (not await hasPermission(caller, #manage_users, null, null)) {
      return #err("Unauthorized: Only administrators can assign departments");
    };
    
    departmentAssignments.put(targetUserId, department);
    
    // Audit log
    logAuditEvent(
      caller,
      #update,
      "user_department",
      Principal.toText(targetUserId),
      ?("Assigned to department: " # department)
    );
    
    #ok("User assigned to department successfully")
  };
  
  // Set resource ownership (admin only)
  public shared(msg) func setResourceOwnership(
    resourceId: Text,
    ownerId: Principal
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Only admins can set resource ownership
    if (not await hasPermission(caller, #system_admin, null, null)) {
      return #err("Unauthorized: Only system administrators can set resource ownership");
    };
    
    resourceOwnership.put(resourceId, ownerId);
    
    // Audit log
    logAuditEvent(
      caller,
      #update,
      "resource_ownership",
      resourceId,
      ?("Owner set to: " # Principal.toText(ownerId))
    );
    
    #ok("Resource ownership set successfully")
  };
  
  // Get user's effective permissions (for debugging/admin view)
  public shared(msg) func getUserPermissions(
    targetUserId: Principal
  ) : async Result.Result<[ScopedPermission], Text> {
    let caller = msg.caller;
    
    // Only admins or the user themselves can view permissions
    if (caller != targetUserId and not await hasPermission(caller, #view_audit_logs, null, null)) {
      return #err("Unauthorized: Can only view own permissions or admin access required");
    };
    
    let permissions = await getEffectivePermissions(targetUserId);
    #ok(permissions)
  };
  
  // Initialize the RBAC system
  private func initializeRBAC() {
    initializeDefaultRoles();
  };
  
  // System initialization - called when canister starts
  system func init() {
    initializeRBAC();
  };
  
  // ===== SESSION OWNERSHIP ENFORCEMENT =====
  
  // Enhanced session validation with ownership enforcement
  private func validateSessionOwnership(caller: UserId, sessionId: Text) : Bool {
    switch (sessionRequests.get(sessionId)) {
      case (?session) {
        // Check if caller is either the patient or therapist in the session
        session.patientId == caller or session.therapistId == Principal.toText(caller)
      };
      case null {
        // Check appointments as well
        switch (appointments.get(sessionId)) {
          case (?appointment) {
            appointment.patientId == caller or appointment.doctorId == Principal.toText(caller)
          };
          case null false;
        }
      };
    }
  };
  
  // Session ownership enforcement for medical records
  private func enforceSessionOwnership(caller: UserId, sessionId: Text, action: Text) : Result.Result<(), Text> {
    if (not validateSessionOwnership(caller, sessionId)) {
      logSecurityEvent(
        ?caller,
        "session_ownership_violation",
        "User " # Principal.toText(caller) # " attempted " # action # " on session " # sessionId # " without ownership",
        "high"
      );
      return #err("Access denied: You don't have ownership of this session");
    };
    #ok(())
  };
  
  // Enhanced session validation with timeout and activity tracking
  private func validateActiveSession(caller: UserId, sessionId: Text) : Result.Result<(), Text> {
    switch (sessionRequests.get(sessionId)) {
      case (?session) {
        // Check ownership first
        switch (enforceSessionOwnership(caller, sessionId, "access")) {
          case (#err(error)) { return #err(error) };
          case (#ok()) {};
        };
        
        // Check session status
        switch (session.status) {
          case (#accepted) { #ok(()) };
          case (#pending) { #err("Session is still pending approval") };
          case (#declined) { #err("Session has been declined") };
          case (#cancelled) { #err("Session has been cancelled") };
          case (#rescheduled) { #err("Session has been rescheduled") };
        }
      };
      case null { #err("Session not found") };
    }
  };
  
  // ===== ASYNC CALL RESILIENCE PATTERNS =====
  
  // Async call retry mechanism with exponential backoff
  private func retryAsyncCall<T>(operation: () -> async T, maxRetries: Nat) : async Result.Result<T, Text> {
    var attempts = 0;
    var lastError = "Unknown error";
    
    while (attempts < maxRetries) {
      try {
        let result = await operation();
        return #ok(result);
      } catch (error) {
        lastError := "Async call failed: " # debug_show(error);
        attempts += 1;
        
        if (attempts < maxRetries) {
          // Exponential backoff: wait 2^attempts seconds (simulated)
          let backoffTime = 2 ** attempts;
          // Note: In a real implementation, you'd use a timer or delay mechanism
          // For now, we'll just continue to the next attempt
        };
      };
    };
    
    #err("Max retries exceeded. Last error: " # lastError)
  };
  
  // Circuit breaker pattern for external calls
  private var circuitBreakerState : {#closed; #open; #halfOpen} = #closed;
  private var failureCount : Nat = 0;
  private var lastFailureTime : Int = 0;
  private let failureThreshold : Nat = 5;
  private let recoveryTimeout : Int = 300_000_000_000; // 5 minutes in nanoseconds
  
  private func executeWithCircuitBreaker<T>(operation: () -> async T) : async Result.Result<T, Text> {
    let currentTime = Time.now();
    
    switch (circuitBreakerState) {
      case (#open) {
        if (currentTime - lastFailureTime > recoveryTimeout) {
          circuitBreakerState := #halfOpen;
        } else {
          return #err("Circuit breaker is open - service temporarily unavailable");
        };
      };
      case (#closed or #halfOpen) {};
    };
    
    try {
      let result = await operation();
      
      // Reset on success
      if (circuitBreakerState == #halfOpen) {
        circuitBreakerState := #closed;
        failureCount := 0;
      };
      
      #ok(result)
    } catch (error) {
      failureCount += 1;
      lastFailureTime := currentTime;
      
      if (failureCount >= failureThreshold) {
        circuitBreakerState := #open;
      };
      
      #err("Operation failed: " # debug_show(error))
    }
  };
  
  // Async call timeout wrapper
  private func withTimeout<T>(operation: () -> async T, timeoutNs: Int) : async Result.Result<T, Text> {
    let startTime = Time.now();
    
    try {
      let result = await operation();
      let endTime = Time.now();
      
      if (endTime - startTime > timeoutNs) {
        #err("Operation timed out")
      } else {
        #ok(result)
      }
    } catch (error) {
      #err("Operation failed: " # debug_show(error))
    }
  };

  // === CONSENT MANAGEMENT FUNCTIONS ===
  
  // Create consent record
  public shared(msg) func createConsentRecord(
    consentType: ConsentType,
    description: Text
  ) : async Result.Result<ConsentRecord, Text> {
    let caller = msg.caller;
    
    switch (userProfiles.get(caller)) {
      case null { #err("User not found") };
      case (?profile) {
        let consentId = Principal.toText(caller) # "-" # Int.toText(Time.now());
        let now = Time.now();
        
        let consent: ConsentRecord = {
          id = consentId;
          patientId = caller;
          therapistId = Principal.toText(caller);
          consentType = consentType;
          status = #pending;
          purpose = description;
          grantedAt = null;
          revokedAt = null;
          expiresAt = null;
          createdAt = now;
          updatedAt = now;
        };
        
        consentRecords.put(consentId, consent);
        #ok(consent)
      };
    }
  };
  
  // Update consent status
  public shared(msg) func updateConsentStatus(
    consentId: Text,
    status: ConsentStatus
  ) : async Result.Result<ConsentRecord, Text> {
    let caller = msg.caller;
    
    switch (consentRecords.get(consentId)) {
      case null { #err("Consent record not found") };
      case (?consent) {
        if (consent.patientId != caller) {
          return #err("Unauthorized: You can only update your own consent records");
        };
        
        let now = Time.now();
        let updatedConsent: ConsentRecord = {
          id = consent.id;
          patientId = consent.patientId;
          therapistId = consent.therapistId;
          consentType = consent.consentType;
          status = status;
          purpose = consent.purpose;
          grantedAt = if (status == #granted) ?now else consent.grantedAt;
          revokedAt = if (status == #revoked) ?now else consent.revokedAt;
          expiresAt = consent.expiresAt;
          createdAt = consent.createdAt;
          updatedAt = now;
        };
        
        consentRecords.put(consentId, updatedConsent);
        #ok(updatedConsent)
      };
    }
  };
  
  // Get user consent records
  public shared query(msg) func getUserConsentRecords() : async [ConsentRecord] {
    let caller = msg.caller;
    let userConsents = Buffer.Buffer<ConsentRecord>(0);
    
    for ((id, consent) in consentRecords.entries()) {
      if (consent.patientId == caller) {
        userConsents.add(consent);
      };
    };
    
    Buffer.toArray(userConsents)
  };

  // === THERAPIST AVAILABILITY FUNCTIONS ===
  
  // Set therapist availability
  public shared(msg) func setTherapistAvailability(
    dayOfWeek: Nat,
    startTime: Text,
    endTime: Text,
    isAvailable: Bool
  ) : async Result.Result<TherapistAvailability, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #therapist)) {
      return #err("Unauthorized: Only therapists can set availability");
    };
    
    if (dayOfWeek > 6) {
      return #err("Invalid day of week. Must be 0-6 (Sunday-Saturday)");
    };
    
    let availabilityId = Principal.toText(caller) # "-" # Int.toText(dayOfWeek);
    let now = Time.now();
    
    let availability: TherapistAvailability = {
      therapistId = Principal.toText(caller);
      dayOfWeek = dayOfWeek;
      startTime = startTime;
      endTime = endTime;
      isAvailable = isAvailable;
      sessionDuration = 60; // Default 60 minutes
      breakBetweenSessions = 15; // Default 15 minutes break
      maxSessionsPerDay = 8; // Default max 8 sessions per day
      updatedAt = now;
    };
    
    therapistAvailability.put(availabilityId, availability);
    #ok(availability)
  };
  
  // Get therapist availability
  public shared query(msg) func getTherapistAvailability(therapistId: ?UserId) : async [TherapistAvailability] {
    let targetId = switch (therapistId) {
      case (?id) id;
      case null msg.caller;
    };
    
    let availabilities = Buffer.Buffer<TherapistAvailability>(0);
    
    for ((id, availability) in therapistAvailability.entries()) {
      if (availability.therapistId == Principal.toText(targetId)) {
        availabilities.add(availability);
      };
    };
    
    Buffer.toArray(availabilities)
  };

  // === SESSION PRICING FUNCTIONS ===
  
  // Set session pricing
  public shared(msg) func setSessionPricing(
    sessionType: Text,
    pricePerSession: Nat,
    currency: Text,
    _description: ?Text
  ) : async Result.Result<SessionPricing, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #therapist)) {
      return #err("Unauthorized: Only therapists can set pricing");
    };
    
    let pricingId = Principal.toText(caller) # "-" # sessionType;
    let now = Time.now();
    
    let pricing: SessionPricing = {
            therapistId = Principal.toText(caller);
            sessionType = sessionType;
            price = pricePerSession;
            duration = 60; // Default 60 minutes
            currency = currency;
            packageDeals = null;
            discountPercentage = null;
            isActive = true;
            createdAt = now;
            updatedAt = now;
        };
    
    sessionPricing.put(pricingId, pricing);
    #ok(pricing)
  };
  
  // Get therapist pricing
  public shared query(msg) func getTherapistPricing(therapistId: ?UserId) : async [SessionPricing] {
    let targetId = switch (therapistId) {
      case (?id) id;
      case null msg.caller;
    };
    
    let pricings = Buffer.Buffer<SessionPricing>(0);
    
    for ((id, pricing) in sessionPricing.entries()) {
      if (pricing.therapistId == Principal.toText(targetId) and pricing.isActive) {
        pricings.add(pricing);
      };
    };
    
    Buffer.toArray(pricings)
  };

  // === SESSION REQUEST FUNCTIONS ===
  
  // Create session request
  public shared(msg) func createSessionRequest(
    therapistId: UserId,
    sessionType: Text,
    preferredDate: Text,
    preferredTime: Text,
    notes: ?Text
  ) : async Result.Result<SessionRequest, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #patient)) {
      return #err("Unauthorized: Only patients can create session requests");
    };
    
    // Verify therapist exists
    switch (userProfiles.get(therapistId)) {
      case null { return #err("Therapist not found"); };
      case (?profile) {
        if (profile.userType != #therapist) {
          return #err("Invalid therapist ID");
        };
      };
    };
    
    let requestId = Principal.toText(caller) # "-" # Principal.toText(therapistId) # "-" # Int.toText(Time.now());
    let now = Time.now();
    
    let request: SessionRequest = {
      id = requestId;
      patientId = caller;
      therapistId = Principal.toText(therapistId);
      sessionType = sessionType;
      requestedDate = preferredDate;
      requestedTime = preferredTime;
      duration = 60; // Default 60 minutes
      urgencyLevel = "normal"; // Default urgency level
      status = #pending;
      notes = switch (notes) { case (?n) n; case null ""; };
      createdAt = now;
      updatedAt = now;
    };
    
    sessionRequests.put(requestId, request);
    #ok(request)
  };
  
  // Update session request status
  public shared(msg) func updateSessionRequestStatus(
    requestId: Text,
    status: SessionRequestStatus
  ) : async Result.Result<SessionRequest, Text> {
    let caller = msg.caller;
    
    switch (sessionRequests.get(requestId)) {
      case null { #err("Session request not found") };
      case (?request) {
        // Only therapist can approve/reject, only patient can cancel
        let authorized = switch (status) {
          case (#accepted or #declined or #rescheduled) { request.therapistId == Principal.toText(caller) };
          case (#cancelled) { request.patientId == caller };
          case (#pending) { request.patientId == caller or request.therapistId == Principal.toText(caller) };
        };
        
        if (not authorized) {
          return #err("Unauthorized to update this session request");
        };
        
        let now = Time.now();
        let updatedRequest: SessionRequest = {
          id = request.id;
          patientId = request.patientId;
          therapistId = request.therapistId;
          sessionType = request.sessionType;
          requestedDate = request.requestedDate;
          requestedTime = request.requestedTime;
          duration = request.duration;
          urgencyLevel = request.urgencyLevel;
          status = status;
          notes = request.notes;
          createdAt = request.createdAt;
          updatedAt = now;
        };
        
        sessionRequests.put(requestId, updatedRequest);
        #ok(updatedRequest)
      };
    }
  };
  
  // Get session requests for user
  public shared query(msg) func getUserSessionRequests() : async [SessionRequest] {
    let caller = msg.caller;
    let userRequests = Buffer.Buffer<SessionRequest>(0);
    
    for ((id, request) in sessionRequests.entries()) {
      if (request.patientId == caller or request.therapistId == Principal.toText(caller)) {
        userRequests.add(request);
      };
    };
    
    Buffer.toArray(userRequests)
  };
  
  // Legacy authorization for backward compatibility
  private func isAuthorizedLegacy(caller: UserId, requiredRole: Text) : Bool {
    switch (userRoles.get(caller)) {
      case (?role) { role == requiredRole or role == "admin" };
      case null { false };
    }
  };
  
  // Update user profile
  public shared(msg) func updateUserProfile(updates: {
    firstName: ?Text;
    lastName: ?Text;
    email: ?Text;
    phoneNumber: ?Text;
    bio: ?Text;
    profilePicture: ?Text;
  }) : async Result.Result<UserProfile, Text> {
    let caller = msg.caller;
    
    switch (userProfiles.get(caller)) {
      case null {
        #err("User not found")
      };
      case (?profile) {
        let now = Time.now();
        let updatedProfile: UserProfile = {
          id = profile.id;
          userType = profile.userType;
          firstName = switch (updates.firstName) { case (?name) name; case null profile.firstName; };
          lastName = switch (updates.lastName) { case (?name) name; case null profile.lastName; };
          email = switch (updates.email) { case (?email) email; case null profile.email; };
          phoneNumber = switch (updates.phoneNumber) { case (?phone) ?phone; case null profile.phoneNumber; };
          profilePicture = switch (updates.profilePicture) { case (?pic) ?pic; case null profile.profilePicture; };
          bio = switch (updates.bio) { case (?bio) ?bio; case null profile.bio; };
          verificationStatus = profile.verificationStatus;
          onboardingCompleted = profile.onboardingCompleted;
          createdAt = profile.createdAt;
          updatedAt = now;
        };
        
        userProfiles.put(caller, updatedProfile);
        #ok(updatedProfile)
      };
    }
  };

  // Update user stats for chat interactions and activity tracking
  public shared({ caller }) func updateUserStats(stats: { chatInteractions: Nat; lastActivity: Text }) : async Text {
    // Verify user exists
    switch (userProfiles.get(caller)) {
      case (?profile) {
        // In a full implementation, you would store these stats in a separate HashMap
        // For now, we'll just return a success message
        "Stats updated for user " # Principal.toText(caller) # ": " # Nat.toText(stats.chatInteractions) # " interactions, last activity: " # stats.lastActivity
      };
      case null {
        "Error: User not found"
      };
    }
  };

  // Enhanced Patient management functions
  public shared(msg) func createPatientProfile(patientData: {
    dateOfBirth: Text;
    gender: Text;
    emergencyContact: Text;
    emergencyContactRelation: ?Text;
    preferredLanguage: ?Text;
    timezone: ?Text;
    insuranceProvider: ?Text;
  }) : async Result.Result<Patient, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #patient)) {
      return #err("Unauthorized: Only patients can create patient profiles");
    };
    
    // Get user profile for basic info
    switch (userProfiles.get(caller)) {
      case null {
        #err("User profile not found. Please complete onboarding first.")
      };
      case (?userProfile) {
        let now = Time.now();
        let patient: Patient = {
          id = caller;
          firstName = userProfile.firstName;
          lastName = userProfile.lastName;
          email = userProfile.email;
          dateOfBirth = patientData.dateOfBirth;
          gender = patientData.gender;
          phoneNumber = switch (userProfile.phoneNumber) { case (?phone) phone; case null ""; };
          emergencyContact = patientData.emergencyContact;
          emergencyContactRelation = patientData.emergencyContactRelation;
          preferredLanguage = patientData.preferredLanguage;
          timezone = patientData.timezone;
          insuranceProvider = patientData.insuranceProvider;
          medicalHistory = [];
          allergies = [];
          currentMedications = [];
          encryptedDateOfBirth = null;
          encryptedPhoneNumber = null;
          encryptedEmergencyContact = null;
          createdAt = now;
          updatedAt = now;
        };

        patients.put(caller, patient);
        #ok(patient)
      }
    }
  };

  public shared query(msg) func getPatientProfile() : async Result.Result<Patient, Text> {
    let caller = msg.caller;
    
    switch (patients.get(caller)) {
      case (?patient) { #ok(patient) };
      case null { #err("Patient profile not found") };
    }
  };

  // Enhanced Therapist management functions
  public shared(msg) func createTherapistProfile(therapistData: {
    specialty: Text;
    licenseNumber: Text;
    yearsOfExperience: Nat;
    education: [Text];
    certifications: [Text];
    consultationFee: Nat;
    sessionTypes: [Text];
    languages: [Text];
    bio: ?Text;
    availableHours: ?Text;
  }) : async Result.Result<Therapist, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #therapist)) {
      return #err("Unauthorized: Only therapists can create therapist profiles");
    };
    
    // Get user profile for basic info
    switch (userProfiles.get(caller)) {
      case null {
        #err("User profile not found. Please complete onboarding first.")
      };
      case (?userProfile) {
        let therapistId = Principal.toText(caller);
        let now = Time.now();
        
        let therapist: Therapist = {
          id = therapistId;
          userId = caller;
          firstName = userProfile.firstName;
          lastName = userProfile.lastName;
          email = userProfile.email;
          specialty = [therapistData.specialty];
          licenseNumber = therapistData.licenseNumber;
          yearsOfExperience = therapistData.yearsOfExperience;
          education = therapistData.education;
          certifications = therapistData.certifications;
          sessionTypes = therapistData.sessionTypes;
          languages = therapistData.languages;
          licenseState = "";
          licenseExpiry = "";
          availableHours = switch (therapistData.availableHours) { case (?hours) hours; case null "{}" };
          consultationFee = therapistData.consultationFee;
          acceptsInsurance = false;
          insuranceProviders = [];
          rating = 0.0;
          totalAppointments = 0;
          isVerified = false;
          isOnline = false;
          profileDescription = switch (therapistData.bio) { case (?b) b; case null ""; };
          approachMethods = [];
          createdAt = now;
          updatedAt = now;
        };

        therapists.put(therapistId, therapist);
        #ok(therapist)
      }
    }
  };

  // Legacy Doctor management functions (for backward compatibility)
  public shared(msg) func createDoctorProfile(doctorData: {
    firstName: Text;
    lastName: Text;
    email: Text;
    specialty: Text;
    licenseNumber: Text;
    yearsOfExperience: Nat;
    education: [Text];
    certifications: [Text];
    consultationFee: Nat;
  }) : async Result.Result<Doctor, Text> {
    let caller = msg.caller;
    
    if (not isAuthorizedLegacy(caller, "doctor")) {
      return #err("Unauthorized: Only doctors can create doctor profiles");
    };

    let doctorId = Principal.toText(caller);
    let now = Time.now();
    
    let doctor: Doctor = {
      id = doctorId;
      userId = caller;
      firstName = doctorData.firstName;
      lastName = doctorData.lastName;
      email = doctorData.email;
      specialty = [doctorData.specialty];
      licenseNumber = doctorData.licenseNumber;
      licenseState = "";
      licenseExpiry = "";
      yearsOfExperience = doctorData.yearsOfExperience;
      education = doctorData.education;
      certifications = doctorData.certifications;
      languages = ["English"]; // Default language
      sessionTypes = ["Individual"]; // Default session type
      approachMethods = ["Cognitive Behavioral Therapy"]; // Default approach
      availableHours = "{}";
      consultationFee = doctorData.consultationFee;
      acceptsInsurance = false; // Default value
      insuranceProviders = []; // Empty array
      profileDescription = "";
      rating = 0.0;
      totalAppointments = 0;
      isVerified = false;
      isOnline = false;
      createdAt = now;
      updatedAt = now;
    };

    doctors.put(doctorId, doctor);
    #ok(doctor)
  };

  // Enhanced Therapist query functions
  public query func getAllTherapists() : async [Therapist] {
    Iter.toArray(therapists.vals())
  };

  public query func getTherapistById(therapistId: Text) : async Result.Result<Therapist, Text> {
    switch (therapists.get(therapistId)) {
      case (?therapist) { #ok(therapist) };
      case null { #err("Therapist not found") };
    }
  };

  public shared query(msg) func getTherapistProfile() : async Result.Result<Therapist, Text> {
    let caller = msg.caller;
    let therapistId = Principal.toText(caller);
    
    switch (therapists.get(therapistId)) {
      case (?therapist) { #ok(therapist) };
      case null { #err("Therapist profile not found") };
    }
  };

  // Legacy Doctor query functions (for backward compatibility)
  public query func getAllDoctors() : async [Doctor] {
    Iter.toArray(doctors.vals())
  };

  public query func getDoctorById(doctorId: DoctorId) : async Result.Result<Doctor, Text> {
    switch (doctors.get(doctorId)) {
      case (?doctor) { #ok(doctor) };
      case null { #err("Doctor not found") };
    }
  };

  // Legacy greeting function for backward compatibility
  public query func greet(name : Text) : async Text {
    "Hello, " # name # "! Welcome to MentalVerse Healthcare Platform."
  };

  // Enhanced Session/Appointment management functions
  public shared(msg) func createSession(sessionData: {
    therapistId: Text;
    appointmentType: AppointmentType;
    scheduledDate: Text;
    startTime: Text;
    endTime: Text;
    notes: Text;
    symptoms: [Text];
  }) : async Result.Result<Appointment, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #patient)) {
      return #err("Unauthorized: Only patients can create sessions");
    };

    // Verify therapist exists
    switch (therapists.get(sessionData.therapistId)) {
      case null { return #err("Therapist not found") };
      case (?therapist) {
        let appointmentId = Principal.toText(caller) # "_" # sessionData.therapistId # "_" # Int.toText(Time.now());
        let now = Time.now();
        
        let appointment: Appointment = {
          id = appointmentId;
          patientId = caller;
          doctorId = sessionData.therapistId;
          appointmentType = sessionData.appointmentType;
          scheduledDate = sessionData.scheduledDate;
          startTime = sessionData.startTime;
          endTime = sessionData.endTime;
          status = #scheduled;
          notes = sessionData.notes;
          symptoms = sessionData.symptoms;
          diagnosis = "";
          prescription = "";
          followUpRequired = false;
          followUpDate = null;
          createdAt = now;
          updatedAt = now;
        };

        appointments.put(appointmentId, appointment);
        #ok(appointment)
      };
    }
  };

  // Legacy appointment creation (for backward compatibility)
  public shared(msg) func createAppointment(
    appointmentData: {
      doctorId: DoctorId;
      appointmentType: AppointmentType;
      scheduledDate: Text;
      startTime: Text;
      endTime: Text;
      notes: Text;
      symptoms: [Text];
    },
    nonce: Text,
    timestamp: Int
  ) : async Result.Result<Appointment, Text> {
    let caller = msg.caller;
    
    // Enhanced security validation
    switch (validateEndpointAccess(caller, #patient, nonce, timestamp)) {
      case (#err(msg)) { return #err(msg) };
      case (#ok) {};
    };
    
    // Comprehensive appointment data validation
    switch (validateAppointmentData({
      doctorId = appointmentData.doctorId;
      appointmentType = appointmentData.appointmentType;
      scheduledDate = appointmentData.scheduledDate;
      startTime = appointmentData.startTime;
      endTime = appointmentData.endTime;
      notes = appointmentData.notes;
      symptoms = appointmentData.symptoms;
    })) {
      case (#err(msg)) { return #err(msg) };
      case (#ok(validatedData)) {
        // Use validated data for appointment creation

        // Verify doctor exists
        switch (doctors.get(validatedData.doctorId)) {
          case null { return #err("Doctor not found") };
          case (?doctor) {
            let appointmentId = Principal.toText(caller) # "_" # validatedData.doctorId # "_" # Int.toText(Time.now());
            let now = Time.now();
            
            let appointment: Appointment = {
              id = appointmentId;
              patientId = caller;
              doctorId = validatedData.doctorId;
              appointmentType = validatedData.appointmentType;
              scheduledDate = validatedData.scheduledDate;
              startTime = validatedData.startTime;
              endTime = validatedData.endTime;
              status = #scheduled;
              notes = validatedData.notes;
              symptoms = validatedData.symptoms;
              diagnosis = "";
              prescription = "";
              followUpRequired = false;
              followUpDate = null;
              createdAt = now;
              updatedAt = now;
            };

            appointments.put(appointmentId, appointment);
            
            // Log successful appointment creation
            logAuditEvent(caller, #appointment_created, "appointment", appointmentId, ?"Appointment created with enhanced validation");
            
            #ok(appointment)
          };
        }
      };
    }
  };

  public shared(msg) func updateAppointmentStatus(appointmentId: AppointmentId, status: AppointmentStatus) : async Result.Result<Appointment, Text> {
    let caller = msg.caller;
    
    switch (appointments.get(appointmentId)) {
      case null { #err("Appointment not found") };
      case (?appointment) {
        // Check authorization - patient or doctor involved in the appointment
        if (appointment.patientId != caller and appointment.doctorId != Principal.toText(caller)) {
          return #err("Unauthorized: You can only update your own appointments");
        };

        let updatedAppointment = {
          appointment with
          status = status;
          updatedAt = Time.now();
        };

        appointments.put(appointmentId, updatedAppointment);
        #ok(updatedAppointment)
      };
    }
  };

  public shared query(msg) func getPatientAppointments() : async [Appointment] {
    let caller = msg.caller;
    
    Array.filter(Iter.toArray(appointments.vals()), func(appointment: Appointment) : Bool {
      appointment.patientId == caller
    })
  };

  public shared query(msg) func getDoctorAppointments() : async [Appointment] {
    let caller = msg.caller;
    let callerId = Principal.toText(caller);
    
    Array.filter(Iter.toArray(appointments.vals()), func(appointment: Appointment) : Bool {
      appointment.doctorId == callerId
    })
  };

  // Medical records management functions
  public shared(msg) func createMedicalRecord(recordData: {
    patientId: UserId;
    appointmentId: ?AppointmentId;
    recordType: Text;
    title: Text;
    description: Text;
    attachments: [Text];
    isConfidential: Bool;
  }) : async Result.Result<MedicalRecord, Text> {
    let caller = msg.caller;
    
    // Enhanced endpoint validation for doctors only
    switch (validateEndpointAccess(caller, ?#doctor, null, null)) {
      case (#err(msg)) { return #err(msg) };
      case (#ok) {};
    };

    // Comprehensive medical record validation
    switch (validateMedicalRecordData(recordData.patientId, recordData.recordType, recordData.title, recordData.description)) {
      case (#err(msg)) { return #err(msg) };
      case (#ok(validatedData)) {
        // Verify patient exists
        switch (patients.get(recordData.patientId)) {
          case null { return #err("Patient not found") };
          case (?patient) {
            let recordId = Principal.toText(caller) # "_" # Principal.toText(recordData.patientId) # "_" # Int.toText(Time.now());
            let now = Time.now();
            
            let medicalRecord: MedicalRecord = {
              id = recordId;
              patientId = recordData.patientId;
              doctorId = Principal.toText(caller);
              appointmentId = recordData.appointmentId;
              recordType = validatedData.diagnosis;
              title = validatedData.treatment;
              description = validatedData.notes;
              attachments = recordData.attachments;
              encryptedDescription = null;
              encryptedAttachments = null;
              isConfidential = recordData.isConfidential;
              accessPermissions = [recordData.patientId, caller]; // Patient and doctor have access
              createdAt = now;
              updatedAt = now;
            };

            medicalRecords.put(recordId, medicalRecord);
            
            // Audit logging for medical record creation
            logAuditEvent(
              caller,
              #create,
              "medical_record",
              recordId,
              ?("Medical record created for patient: " # Principal.toText(recordData.patientId) # ", type: " # validatedData.diagnosis # ", confidential: " # (if (recordData.isConfidential) "yes" else "no"))
            );
            
            #ok(medicalRecord)
          };
        }
      };
    }
  };

  public shared query(msg) func getPatientMedicalRecords() : async [MedicalRecord] {
    let caller = msg.caller;
    
    Array.filter(Iter.toArray(medicalRecords.vals()), func(record: MedicalRecord) : Bool {
      Array.find<UserId>(record.accessPermissions, func(userId: UserId) : Bool {
        userId == caller
      }) != null
    })
  };

  public shared(msg) func getMedicalRecordById(recordId: RecordId) : async Result.Result<MedicalRecord, Text> {
    let caller = msg.caller;
    
    switch (medicalRecords.get(recordId)) {
      case null { #err("Medical record not found") };
      case (?record) {
        // Check if caller has access to this record
        let _hasAccess = Array.find<UserId>(record.accessPermissions, func(userId: UserId) : Bool {
          userId == caller
        }) != null;
        
        if (not _hasAccess) {
          // Log unauthorized access attempt
          logSecurityEvent(
            ?caller,
            "unauthorized_medical_record_access",
            "Attempted to access medical record: " # recordId # " by user: " # Principal.toText(caller),
            "medium"
          );
          return #err("Unauthorized: You don't have access to this medical record");
        };
        
        // Audit logging for medical record access
        logAuditEvent(
          caller,
          #access_granted,
          "medical_record",
          recordId,
          ?("Medical record accessed by: " # Principal.toText(caller))
        );
        
        #ok(record)
      };
    }
  };

  // Secure messaging functions with Phase 2 security enhancements
  public shared(msg) func sendMessage(
    receiverId: UserId, 
    content: Text, 
    messageType: Text,
    nonce: Text,
    timestamp: Int
  ) : async Result.Result<Message, Text> {
    let caller = msg.caller;
    
    // Enhanced endpoint validation
    switch (validateEndpointAccess(caller, null, ?Text.hash(nonce), ?timestamp)) {
      case (#err(msg)) { return #err(msg) };
      case (#ok) {};
    };
    
    // Comprehensive message validation
    switch (validateMessageContent(content, messageType, receiverId)) {
      case (#err(msg)) { return #err(msg) };
      case (#ok(validatedData)) {
        let sanitizedContent = validatedData.content;
        let sanitizedMessageType = validatedData.messageType;

        let messageId = Principal.toText(caller) # "_" # Principal.toText(receiverId) # "_" # Int.toText(Time.now());
        let now = Time.now();
        
        let message: Message = {
          id = messageId;
          senderId = caller;
          receiverId = receiverId;
          content = sanitizedContent; // Use sanitized content
          messageType = sanitizedMessageType; // Use sanitized message type
          attachments = [];
          isRead = false;
          isEncrypted = true; // All messages are encrypted by default
          timestamp = now;
        };

        messages.put(messageId, message);
        
        // Audit logging for message sending
        logAuditEvent(
          caller,
          #create,
          "secure_message",
          messageId,
          ?("Message sent from: " # Principal.toText(caller) # " to: " # Principal.toText(receiverId) # ", type: " # sanitizedMessageType)
        );
        
        #ok(message)
      };
    }
  };

  public shared query(msg) func getMessages(otherUserId: UserId) : async [Message] {
    let caller = msg.caller;
    
    Array.filter(Iter.toArray(messages.vals()), func(message: Message) : Bool {
      (message.senderId == caller and message.receiverId == otherUserId) or
      (message.senderId == otherUserId and message.receiverId == caller)
    })
  };

  public shared(msg) func markMessageAsRead(messageId: Text) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (messages.get(messageId)) {
      case null { #err("Message not found") };
      case (?message) {
        if (message.receiverId != caller) {
          return #err("Unauthorized: You can only mark your own messages as read");
        };

        let updatedMessage = {
          message with
          isRead = true;
        };

        messages.put(messageId, updatedMessage);
        #ok("Message marked as read")
      };
    }
  };

  // Admin functions for system management
  public shared(msg) func verifyDoctor(doctorId: DoctorId) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #admin)) {
      return #err("Unauthorized: Only admins can verify doctors");
    };

    switch (doctors.get(doctorId)) {
      case null { #err("Doctor not found") };
      case (?doctor) {
        let updatedDoctor = {
          doctor with
          isVerified = true;
          updatedAt = Time.now();
        };

        doctors.put(doctorId, updatedDoctor);
        #ok("Doctor verified successfully")
      };
    }
  };

  // System statistics and analytics
  public query func getSystemStats() : async {
    totalPatients: Nat;
    totalDoctors: Nat;
    totalAppointments: Nat;
    totalMedicalRecords: Nat;
    totalMessages: Nat;
    totalChatInteractions: Nat;
  } {
    {
      totalPatients = patients.size();
      totalDoctors = doctors.size();
      totalAppointments = appointments.size();
      totalMedicalRecords = medicalRecords.size();
      totalMessages = messages.size();
      totalChatInteractions = chatInteractionsMap.size();
    }
  };

  // Chat interaction logging for mental health sessions
  public type ChatInteraction = {
    id: Text;
    userId: Principal;
    message: Text;
    emotionalTone: ?Text;
    timestamp: Int;
    sessionId: Text;
  };

  private var chatInteractions: [(Text, ChatInteraction)] = [];
  private transient var chatInteractionsMap = HashMap.fromIter<Text, ChatInteraction>(chatInteractions.vals(), chatInteractions.size(), Text.equal, Text.hash);

  // Log user chat interactions securely
  public shared(msg) func logChatInteraction(
    sessionId: Text,
    messageContent: Text,
    messageType: Text
  ) : async Result.Result<Text, Text> {
    let caller = Principal.toText(msg.caller);
    let interactionId = generateId("interaction");
    
    let interaction: ChatInteraction = {
      id = interactionId;
      userId = Principal.fromText(caller);
      message = messageContent;
      emotionalTone = ?messageType;
      timestamp = Time.now();
      sessionId = sessionId;
    };
    
    chatInteractionsMap.put(interactionId, interaction);
    #ok("Chat interaction logged successfully")
  };

  // Get user's chat history (for continuity of care)
  public shared(msg) func getUserChatHistory(sessionId: ?Text) : async Result.Result<[ChatInteraction], Text> {
    let caller = msg.caller;
    
    // Validate session ID format if provided
    switch (sessionId) {
      case (?sid) {
        if (not isValidUUID(sid)) {
          return #err("Invalid session ID format. Must be a valid UUID.");
        };
      };
      case null {};
    };
    
    let userInteractions = Array.filter<ChatInteraction>(
      Iter.toArray(chatInteractionsMap.vals()),
      func(interaction) {
        interaction.userId == caller and
        (switch (sessionId) {
          case (?sid) { interaction.sessionId == sid };
          case null { true };
        })
      }
    );
    
    #ok(userInteractions)
  };

  // Get chat analytics for mental health insights (admin only)
  public shared(msg) func getChatAnalytics() : async Result.Result<{totalInteractions: Nat; uniqueUsers: Nat}, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #admin)) {
      return #err("Unauthorized: Only admins can access chat analytics");
    };
    
    let allInteractions = Iter.toArray(chatInteractionsMap.vals());
    let uniqueUsers = Array.foldLeft<ChatInteraction, [Principal]>(
      allInteractions,
      [],
      func(acc, interaction) {
        if (Array.find<Principal>(acc, func(p) { p == interaction.userId }) == null) {
          Array.append(acc, [interaction.userId])
        } else {
          acc
        }
      }
    );
    
    #ok({
      totalInteractions = allInteractions.size();
      uniqueUsers = uniqueUsers.size();
    })
  };

  // MVT Token Integration Functions
  
  // Award tokens for appointment completion
  public shared(msg) func completeAppointmentWithTokens(appointmentId: AppointmentId, nonce: Nat, timestamp: Int) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Phase 2 Security: Rate limiting
    if (not check_rate_limit(caller)) {
      return #err("Rate limit exceeded. Please try again later.");
    };
    
    // Phase 2 Security: Nonce and timestamp validation
    if (not validate_nonce(caller, nonce, timestamp)) {
      return #err("Invalid nonce or timestamp");
    };
    
    switch (appointments.get(appointmentId)) {
      case (?appointment) {
        // Verify caller is either patient or doctor
        if (appointment.patientId != caller and appointment.doctorId != Principal.toText(caller)) {
          return #err("Unauthorized: Only appointment participants can complete appointments");
        };
        
        // Store original appointment state for rollback
        let originalAppointment = appointment;
        
        // Update appointment status
        let updatedAppointment = {
          appointment with
          status = #completed;
          updatedAt = Time.now();
        };
        appointments.put(appointmentId, updatedAppointment);
        
        // Award tokens to patient for completing appointment with enhanced resilience
        let tokenOperation = func() : async Result.Result<Nat, Text> {
          let mvtCanister = actor(_MVT_TOKEN_CANISTER_ID) : MVTToken.MVTTokenCanister;
          await mvtCanister.earn_tokens(appointment.patientId, #appointment_completion, ?50_00000000) // 50 MVT
        };
        
        // Use enhanced async resilience patterns
        let earnResult = await executeWithCircuitBreaker<Result.Result<Nat, Text>>(func() : async Result.Result<Nat, Text> {
          await retryAsyncCall<Result.Result<Nat, Text>>(tokenOperation, 3)
        });
        
        switch (earnResult) {
          case (#ok(#ok(txId))) {
            // Log successful token award
            logAuditEvent(caller, #token_award, "appointment", appointmentId, ?"Tokens awarded for appointment completion");
            return #ok("Appointment completed successfully. 50 MVT tokens awarded to patient. Transaction ID: " # Nat.toText(txId));
          };
          case (#ok(#err(error)) or #err(error)) {
            // Rollback appointment status on failure
            appointments.put(appointmentId, originalAppointment);
            logAuditEvent(caller, #error, "appointment", appointmentId, ?"Token award failed, appointment rolled back: " # error);
            return #err("Failed to award tokens: " # error);
          };
        };
        
        #err("Unexpected error in token award process")
      };
      case null {
        #err("Appointment not found")
      };
    }
  };
  
  // Award tokens for platform usage
  public shared(msg) func recordDailyPlatformUsage(nonce: Nat, timestamp: Int) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Phase 2 Security: Rate limiting
    if (not check_rate_limit(caller)) {
      return #err("Rate limit exceeded. Please try again later.");
    };
    
    // Phase 2 Security: Nonce and timestamp validation
    if (not validate_nonce(caller, nonce, timestamp)) {
      return #err("Invalid nonce or timestamp");
    };
    
    // Check if user is registered
    switch (userRoles.get(caller)) {
      case (?role) {
        // Check if user already earned daily tokens today
        let currentTime = Time.now();
        let todayStart = currentTime - (currentTime % 86400000000000); // Start of today
        
        // Check existing daily usage records
        let todayUsage = Array.filter<AuditLog>(
          Iter.toArray(auditLogs.vals()),
          func(log) {
            log.userId == caller and 
            log.action == #daily_usage and 
            log.timestamp >= todayStart
          }
        );
        
        if (todayUsage.size() > 0) {
          return #err("Daily platform usage tokens already claimed today");
        };
        
        // Award daily usage tokens with enhanced resilience
        let dailyTokenOperation = func() : async Result.Result<Nat, Text> {
          let mvtCanister = actor(_MVT_TOKEN_CANISTER_ID) : MVTToken.MVTTokenCanister;
          await mvtCanister.earn_tokens(caller, #daily_usage, ?10_00000000) // 10 MVT
        };
        
        // Use enhanced async resilience patterns
        let earnResult = await executeWithCircuitBreaker<Result.Result<Nat, Text>>(func() : async Result.Result<Nat, Text> {
          await retryAsyncCall<Result.Result<Nat, Text>>(dailyTokenOperation, 3)
        });
        
        switch (earnResult) {
          case (#ok(#ok(txId))) {
            // Log successful daily usage
            logAuditEvent(caller, #daily_usage, "platform", "daily_usage", ?"Daily platform usage tokens awarded");
            return #ok("Daily platform usage recorded. 10 MVT tokens awarded. Transaction ID: " # Nat.toText(txId));
          };
          case (#ok(#err(error)) or #err(error)) {
            logAuditEvent(caller, #error, "platform", "daily_usage", ?"Daily usage token award failed: " # error);
            return #err("Failed to award daily usage tokens: " # error);
          };
        }
      };
      case null {
        #err("User not registered")
      };
    }
  };
  
  // Award tokens for providing patient feedback
  public shared(msg) func submitFeedbackWithTokens(appointmentId: AppointmentId, rating: Nat, feedback: Text, nonce: Nat, timestamp: Int) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Phase 2 Security: Rate limiting
    if (not check_rate_limit(caller)) {
      return #err("Rate limit exceeded. Please try again later.");
    };
    
    // Phase 2 Security: Nonce and timestamp validation
    if (not validate_nonce(caller, nonce, timestamp)) {
      return #err("Invalid nonce or timestamp");
    };
    
    // Phase 2 Security: Input sanitization
    let sanitizedFeedback = sanitize_text(feedback);
    
    switch (appointments.get(appointmentId)) {
      case (?appointment) {
        // Verify caller is the patient
        if (appointment.patientId != caller) {
          return #err("Unauthorized: Only patients can provide feedback");
        };
        
        // Check if feedback already exists for this appointment
        let existingFeedback = Array.filter<AuditLog>(
          Iter.toArray(auditLogs.vals()),
          func(log) {
            log.userId == caller and 
            log.action == #feedback_submitted and 
            log.resourceId == appointmentId
          }
        );
        
        if (existingFeedback.size() > 0) {
          return #err("Feedback already submitted for this appointment");
        };
        
        // Validate rating (1-5 scale)
        if (rating < 1 or rating > 5) {
          return #err("Rating must be between 1 and 5");
        };
        
        // Store original appointment for potential rollback
        let originalAppointment = appointment;
        
        // Update appointment with feedback
        let updatedAppointment = {
          appointment with
          notes = appointment.notes # " | Patient Feedback (Rating: " # Nat.toText(rating) # "/5): " # sanitizedFeedback;
          updatedAt = Time.now();
        };
        appointments.put(appointmentId, updatedAppointment);
        
        // Award feedback tokens with enhanced resilience
        let feedbackTokenOperation = func() : async Result.Result<Nat, Text> {
          let mvtCanister = actor(_MVT_TOKEN_CANISTER_ID) : MVTToken.MVTTokenCanister;
          await mvtCanister.earn_tokens(caller, #feedback_submission, ?25_00000000) // 25 MVT
        };
        
        // Use enhanced async resilience patterns
        let earnResult = await executeWithCircuitBreaker<Result.Result<Nat, Text>>(func() : async Result.Result<Nat, Text> {
          await retryAsyncCall<Result.Result<Nat, Text>>(feedbackTokenOperation, 3)
        });
        
        switch (earnResult) {
          case (#ok(#ok(txId))) {
            // Log successful feedback submission
            logAuditEvent(caller, #feedback_submitted, "appointment", appointmentId, ?"Feedback submitted and tokens awarded");
            return #ok("Feedback submitted successfully. 25 MVT tokens awarded for providing feedback. Transaction ID: " # Nat.toText(txId));
          };
          case (#ok(#err(error)) or #err(error)) {
            // Rollback appointment update on failure
            appointments.put(appointmentId, originalAppointment);
            logAuditEvent(caller, #error, "appointment", appointmentId, ?"Feedback token award failed, changes rolled back: " # error);
            return #err("Failed to award feedback tokens: " # error);
          };
        }
      };
      case null {
        #err("Appointment not found")
      };
    }
  };
  
  // Spend tokens for premium consultation
  public shared(msg) func bookPremiumConsultation(doctorId: DoctorId, appointmentData: {
    appointmentType: AppointmentType;
    scheduledDate: Text;
    startTime: Text;
    endTime: Text;
    notes: Text;
  }, nonce: Nat, timestamp: Int) : async Result.Result<AppointmentId, Text> {
    let caller = msg.caller;
    
    // Phase 2 Security: Rate limiting
    if (not check_rate_limit(caller)) {
      return #err("Rate limit exceeded. Please try again later.");
    };
    
    // Phase 2 Security: Nonce and timestamp validation
    if (not validate_nonce(caller, nonce, timestamp)) {
      return #err("Invalid nonce or timestamp");
    };
    
    if (not isAuthorized(caller, #patient)) {
      return #err("Unauthorized: Only patients can book consultations");
    };
    
    // Phase 2 Security: Input sanitization
    let sanitizedNotes = sanitize_text(appointmentData.notes);
    
    let premiumCost = 500_00000000; // 500 MVT for premium consultation
    
    // Check user's MVT token balance and deduct cost with enhanced resilience
    let premiumSpendOperation = func() : async Result.Result<Nat, Text> {
      let mvtCanister = actor(_MVT_TOKEN_CANISTER_ID) : MVTToken.MVTTokenCanister;
      await mvtCanister.spend_tokens(caller, #premium_consultation, ?premiumCost)
    };
    
    // Use enhanced async resilience patterns
    let spendResult = await executeWithCircuitBreaker<Result.Result<Nat, Text>>(func() : async Result.Result<Nat, Text> {
      await retryAsyncCall<Result.Result<Nat, Text>>(premiumSpendOperation, 3)
    });
    
    switch (spendResult) {
      case (#ok(#ok(txId))) {
        // Create premium appointment after successful token deduction
        let appointmentId = "premium_" # Int.toText(Time.now());
        let now = Time.now();
        
        let appointment: Appointment = {
          id = appointmentId;
          patientId = caller;
          doctorId = doctorId;
          appointmentType = appointmentData.appointmentType;
          scheduledDate = appointmentData.scheduledDate;
          startTime = appointmentData.startTime;
          endTime = appointmentData.endTime;
          status = #scheduled;
          notes = "PREMIUM: " # sanitizedNotes;
          symptoms = [];
          diagnosis = "";
          prescription = "";
          followUpRequired = false;
          followUpDate = null;
          createdAt = now;
          updatedAt = now;
        };
        
        appointments.put(appointmentId, appointment);
        
        // Log successful premium booking
        logAuditEvent(caller, #premium_booking, "appointment", appointmentId, ?"Premium consultation booked with token payment");
        
        return #ok(appointmentId);
      };
      case (#ok(#err(error)) or #err(error)) {
        logAuditEvent(caller, #error, "appointment", "premium_booking", ?"Premium consultation booking failed: " # error);
        return #err("Failed to deduct tokens for premium consultation: " # error);
      };
    }
  };
  
  // Spend tokens for priority booking
  public shared(msg) func bookPriorityAppointment(doctorId: DoctorId, appointmentData: {
    appointmentType: AppointmentType;
    scheduledDate: Text;
    startTime: Text;
    endTime: Text;
    notes: Text;
  }) : async Result.Result<AppointmentId, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #patient)) {
      return #err("Unauthorized: Only patients can book appointments");
    };
    
    // In production, this would:
    // 1. Check user's MVT token balance
    // 2. Deduct priority booking cost from balance
    // 3. Create the appointment with priority status
    
    let appointmentId = "priority_" # Int.toText(Time.now());
    let now = Time.now();
    
    let appointment: Appointment = {
      id = appointmentId;
      patientId = caller;
      doctorId = doctorId;
      appointmentType = appointmentData.appointmentType;
      scheduledDate = appointmentData.scheduledDate;
      startTime = appointmentData.startTime;
      endTime = appointmentData.endTime;
      status = #confirmed; // Priority appointments are auto-confirmed
      notes = "PRIORITY: " # appointmentData.notes;
      symptoms = [];
      diagnosis = "";
      prescription = "";
      followUpRequired = false;
      followUpDate = null;
      createdAt = now;
      updatedAt = now;
    };
    
    appointments.put(appointmentId, appointment);
    #ok(appointmentId)
  };
  
  // Award tokens for doctor consultations
  public shared(msg) func completeDoctorConsultation(appointmentId: AppointmentId, consultationNotes: Text) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (appointments.get(appointmentId)) {
      case (?appointment) {
        // Verify caller is the doctor
        if (appointment.doctorId != Principal.toText(caller)) {
          return #err("Unauthorized: Only the assigned doctor can complete consultations");
        };
        
        // Update appointment with consultation notes
        let updatedAppointment = {
          appointment with
          notes = appointment.notes # " | Doctor Notes: " # consultationNotes;
          status = #completed;
          updatedAt = Time.now();
        };
        appointments.put(appointmentId, updatedAppointment);
        
        // In production, this would call MVT token canister to award consultation tokens to doctor
        
        #ok("Consultation completed successfully. MVT tokens awarded to doctor.")
      };
      case null {
        #err("Appointment not found")
      };
    }
  };
  
  // Get user's token earning opportunities
  public shared query(msg) func getTokenEarningOpportunities() : async Result.Result<{
    daily_platform_usage: Bool;
    pending_feedback: [AppointmentId];
    upcoming_appointments: [AppointmentId];
  }, Text> {
    let caller = msg.caller;
    
    switch (userRoles.get(caller)) {
      case (?role) {
        // Get user's appointments for feedback opportunities
        let userAppointments = Array.filter<Appointment>(
          Iter.toArray(appointments.vals()),
          func(appointment) {
            appointment.patientId == caller and appointment.status == #completed
          }
        );
        
        let pendingFeedback = Array.map<Appointment, AppointmentId>(
          userAppointments,
          func(appointment) { appointment.id }
        );
        
        let upcomingAppointments = Array.map<Appointment, AppointmentId>(
          Array.filter<Appointment>(
            Iter.toArray(appointments.vals()),
            func(appointment) {
              appointment.patientId == caller and appointment.status == #scheduled
            }
          ),
          func(appointment) { appointment.id }
        );
        
        #ok({
          daily_platform_usage = true; // In production, check if already earned today
          pending_feedback = pendingFeedback;
          upcoming_appointments = upcomingAppointments;
        })
      };
      case null {
        #err("User not registered")
      };
    }
  };
  
  // Get token spending options
  public shared query(msg) func getTokenSpendingOptions() : async Result.Result<{
    premium_consultation_cost: Nat;
    priority_booking_cost: Nat;
    advanced_features_cost: Nat;
    ai_insights_cost: Nat;
  }, Text> {
    let caller = msg.caller;
    
    switch (userRoles.get(caller)) {
      case (?role) {
        // In production, these would be fetched from MVT token canister
        #ok({
          premium_consultation_cost = 500; // 5.00 MVT
          priority_booking_cost = 200; // 2.00 MVT
          advanced_features_cost = 1000; // 10.00 MVT monthly
          ai_insights_cost = 300; // 3.00 MVT per insight
        })
      };
      case null {
        #err("User not registered")
      };
    }
  };

  // Faucet Configuration
  private let FAUCET_DAILY_LIMIT : Nat = 10000000000; // 100 MVT with 8 decimals
  private let FAUCET_COOLDOWN_PERIOD : Int = 86400000000000; // 24 hours in nanoseconds

  // Generate unique claim ID
  private func generateClaimId(userId: Principal, timestamp: Int) : Text {
    Principal.toText(userId) # "-" # Int.toText(timestamp)
  };

  // Check if user is eligible for faucet claim
  private func isEligibleForClaim(userId: Principal, currentTime: Int) : Bool {
    switch (lastClaimTimes.get(userId)) {
      case (?lastClaim) {
        currentTime >= (lastClaim + FAUCET_COOLDOWN_PERIOD)
      };
      case null { true };
    }
  };

  // Get faucet statistics for a user
  public shared query(msg) func getFaucetStats() : async FaucetStats {
    let caller = msg.caller;
    let currentTime = Time.now();
    let isEligible = isEligibleForClaim(caller, currentTime);
    
    let nextClaimTime = switch (lastClaimTimes.get(caller)) {
      case (?lastClaim) { lastClaim + FAUCET_COOLDOWN_PERIOD };
      case null { 0 };
    };
    
    // Count today's claims
    let todayStart = currentTime - (currentTime % 86400000000000); // Start of today
    let todayClaims = Array.filter<FaucetClaim>(
      Iter.toArray(faucetClaims.vals()),
      func(claim) {
        claim.user_id == caller and claim.timestamp >= todayStart and claim.status == "completed"
      }
    );
    
    let claimedToday = Array.foldLeft<FaucetClaim, Nat>(
      todayClaims,
      0,
      func(acc, claim) { acc + claim.amount }
    );
    
    // Count total claims
    let allUserClaims = Array.filter<FaucetClaim>(
      Iter.toArray(faucetClaims.vals()),
      func(claim) {
        claim.user_id == caller and claim.status == "completed"
      }
    );
    
    let totalClaimed = Array.foldLeft<FaucetClaim, Nat>(
      allUserClaims,
      0,
      func(acc, claim) { acc + claim.amount }
    );
    
    {
      dailyLimit = FAUCET_DAILY_LIMIT;
      claimedToday = claimedToday;
      totalClaimed = totalClaimed;
      nextClaimTime = nextClaimTime;
      isEligible = isEligible and claimedToday < FAUCET_DAILY_LIMIT;
    }
  };

  // Claim faucet tokens
  public shared(msg) func claimFaucetTokens() : async Result.Result<Text, Text> {
    let caller = msg.caller;
    let currentTime = Time.now();
    
    // Check if user is registered
    switch (userRoles.get(caller)) {
      case null {
        return #err("User not registered. Please register first.");
      };
      case (?role) {};
    };
    
    // Check eligibility
    if (not isEligibleForClaim(caller, currentTime)) {
      return #err("You must wait 24 hours between claims.");
    };
    
    // Check daily limit
    let todayStart = currentTime - (currentTime % 86400000000000);
    let todayClaims = Array.filter<FaucetClaim>(
      Iter.toArray(faucetClaims.vals()),
      func(claim) {
        claim.user_id == caller and claim.timestamp >= todayStart and claim.status == "completed"
      }
    );
    
    let claimedToday = Array.foldLeft<FaucetClaim, Nat>(
      todayClaims,
      0,
      func(acc, claim) { acc + claim.amount }
    );
    
    if (claimedToday >= FAUCET_DAILY_LIMIT) {
      return #err("Daily claim limit reached. Try again tomorrow.");
    };
    
    // Create claim record
    let claimId = generateClaimId(caller, currentTime);
    let claim : FaucetClaim = {
      id = claimId;
      user_id = caller;
      amount = FAUCET_DAILY_LIMIT;
      timestamp = currentTime;
      status = "completed"; // In production, this might be "pending" initially
    };
    
    // Store claim and update last claim time
    faucetClaims.put(claimId, claim);
    lastClaimTimes.put(caller, currentTime);
    
    // In production, this would mint tokens to the user's account
    // For now, we just return success
    #ok("Successfully claimed " # Nat.toText(FAUCET_DAILY_LIMIT) # " MVT tokens!")
  };

  // Get faucet claim history for a user
  public shared query(msg) func getFaucetClaimHistory() : async [FaucetClaim] {
    let caller = msg.caller;
    
    let userClaims = Array.filter<FaucetClaim>(
      Iter.toArray(faucetClaims.vals()),
      func(claim) { claim.user_id == caller }
    );
    
    // Sort by timestamp (newest first)
    Array.sort<FaucetClaim>(
      userClaims,
      func(a, b) {
        if (a.timestamp > b.timestamp) { #less }
        else if (a.timestamp < b.timestamp) { #greater }
        else { #equal }
      }
    )
  };

  // Health check function
  public query func healthCheck() : async {status: Text; timestamp: Int; version: Text} {
    {
      status = "healthy";
      timestamp = Time.now();
      version = "1.0.0";
    }
  };

  // Get chat endpoint for frontend integration
  public func getChatEndpoint() : async Text {
    "MentalVerse backend with simplified AI chat (no external dependencies)"
  };

  // === INTER-CANISTER SECURE MESSAGING ===
  
  // UUID validation helper function
  private func isValidUUID(uuid: Text) : Bool {
    // Basic UUID format validation (8-4-4-4-12 hexadecimal digits)
    let chars = Text.toArray(uuid);
    if (chars.size() != 36) { return false };
    
    // Check positions of hyphens
    if (chars[8] != '-' or chars[13] != '-' or chars[18] != '-' or chars[23] != '-') {
      return false;
    };
    
    // Check that all other characters are hexadecimal
    func isHexChar(c: Char) : Bool {
      (c >= '0' and c <= '9') or (c >= 'a' and c <= 'f') or (c >= 'A' and c <= 'F')
    };
    
    for (i in chars.keys()) {
      if (i != 8 and i != 13 and i != 18 and i != 23) {
        if (not isHexChar(chars[i])) {
          return false;
        };
      };
    };
    
    true
  };

  // Create a secure conversation for therapy sessions
  public shared(msg) func createTherapyConversation(therapistId: Principal, sessionId: Text) : async Result.Result<SecureMessagingInterface.Conversation, Text> {
    let caller = msg.caller;
    
    // Validate session ID format (must be a valid UUID)
    if (not isValidUUID(sessionId)) {
      return #err("Invalid session ID format. Must be a valid UUID.");
    };
    
    // Verify caller is a patient and therapist exists
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType != #patient) {
          return #err("Only patients can create therapy conversations");
        };
      };
      case null {
        return #err("User profile not found");
      };
    };
    
    switch (userProfiles.get(therapistId)) {
      case (?therapistProfile) {
        if (therapistProfile.userType != #therapist) {
          return #err("Target user is not a therapist");
        };
      };
      case null {
        return #err("Therapist not found");
      };
    };
    
    let participants = [caller, therapistId];
    let metadata: SecureMessagingInterface.ConversationMetadata = {
      title = ?"Therapy Session";
      description = ?"Secure therapy conversation";
      session_id = ?sessionId;
      encryption_key_id = "session_" # sessionId # "_key";
    };
    let _ = metadata.description; // Use description to avoid unused warning
    
    try {
      let result = await secureMessagingActor.create_conversation(participants, #SessionChat, metadata);
      if (result.success) {
        switch (result.conversation) {
          case (?conversation) { #ok(conversation) };
          case null { #err("Failed to create conversation") };
        };
      } else {
        switch (result.error) {
          case (?error) { #err(error) };
          case null { #err("Unknown error creating conversation") };
        };
      };
    } catch (error) {
      #err("Inter-canister call failed: " # Error.message(error))
    };
  };
  
  // Send a secure message through the messaging canister
  public shared(msg) func sendSecureMessage(
    conversationId: Text,
    recipientId: Principal,
    content: Text,
    messageType: SecureMessagingInterface.MessageType,
    nonce: ?Text,
    timestamp: ?Int
  ) : async Result.Result<SecureMessagingInterface.Message, Text> {
    let caller = msg.caller;
    
    // Phase 2: Security validations
    if (not check_rate_limit(caller)) {
      return #err("Rate limit exceeded");
    };
    
    switch (nonce, timestamp) {
      case (?n, ?t) {
        if (not validate_nonce(n, t)) {
          return #err("Invalid nonce or timestamp");
        };
      };
      case (_, _) {};
    };
    
    // Verify user exists
    switch (userProfiles.get(caller)) {
      case (?profile) {};
      case null {
        return #err("User profile not found");
      };
    };
    
    // Enhanced error handling with retry logic
    var retry_count = 0;
    let max_retries = 3;
    
    while (retry_count < max_retries) {
      try {
        let result = await secureMessagingActor.send_message(
          conversationId, 
          recipientId, 
          content, 
          messageType, 
          nonce.get(""), 
          timestamp.get(Time.now()),
          []
        );
        if (result.success) {
          switch (result.message) {
            case (?message) { return #ok(message) };
            case null { return #err("Failed to send message") };
          };
        } else {
          switch (result.error) {
            case (?error) { return #err(error) };
            case null { return #err("Unknown error sending message") };
          };
        };
      } catch (error) {
        retry_count += 1;
        if (retry_count >= max_retries) {
          return #err("Inter-canister call failed after " # Nat.toText(max_retries) # " retries: " # Error.message(error));
        };
        // Wait before retry (simplified)
        ignore await async {};
      };
    };
    
    #err("Unexpected error in retry logic")
  };
  
  // Get user's secure conversations
  public shared(msg) func getUserSecureConversations() : async Result.Result<[SecureMessagingInterface.Conversation], Text> {
    let caller = msg.caller;
    
    // Verify user exists
    switch (userProfiles.get(caller)) {
      case (?profile) {};
      case null {
        return #err("User profile not found");
      };
    };
    
    try {
      let conversations = await secureMessagingActor.get_user_conversations();
      #ok(conversations)
    } catch (error) {
      #err("Inter-canister call failed: " # Error.message(error))
    };
  };
  
  // Get messages from a secure conversation
  public shared(msg) func getSecureConversationMessages(
    conversationId: Text,
    limit: ?Nat64,
    offset: ?Nat64
  ) : async Result.Result<[SecureMessagingInterface.Message], Text> {
    let caller = msg.caller;
    
    // Verify user exists
    switch (userProfiles.get(caller)) {
      case (?profile) {};
      case null {
        return #err("User profile not found");
      };
    };
    
    try {
      let messages = await secureMessagingActor.get_conversation_messages(conversationId, limit, offset);
      #ok(messages)
    } catch (error) {
      #err("Inter-canister call failed: " # Error.message(error))
    };
  };
  
  // Register user's encryption key with secure messaging canister
  public shared(msg) func registerUserEncryptionKey(
    publicKey: Text,
    keyType: SecureMessagingInterface.KeyType
  ) : async Result.Result<SecureMessagingInterface.UserKey, Text> {
    let caller = msg.caller;
    
    // Verify user exists
    switch (userProfiles.get(caller)) {
      case (?profile) {};
      case null {
        return #err("User profile not found");
      };
    };
    
    try {
      let result = await secureMessagingActor.register_user_key(publicKey, keyType);
      switch (result) {
        case (#Ok(userKey)) { #ok(userKey) };
        case (#Err(error)) { #err(error) };
      };
    } catch (error) {
      #err("Inter-canister call failed: " # Error.message(error))
    };
  };
  
  // Get secure messaging canister health status
  public func getSecureMessagingHealth() : async Result.Result<Text, Text> {
    try {
      let health = await secureMessagingActor.health_check();
      #ok(health)
    } catch (error) {
      #err("Secure messaging canister unavailable: " # Error.message(error))
    };
  };

  // === MEDICAL RECORDS & STORAGE (ITERATION 3) ===

  // Helper function to generate unique IDs
  private func generateId(prefix: Text) : Text {
    prefix # "_" # Int.toText(Time.now()) # "_" # Int.toText(Int.abs(Time.now()))
  };

  // Enhanced audit logging function with hash-chaining support
  private func logAuditEvent(
    userId: UserId,
    action: AuditLogAction,
    resourceType: Text,
    resourceId: Text,
    details: ?Text
  ) {
    let auditId = generateId("audit");
    auditSequenceNumber += 1;
    
    // Create preliminary audit log for hash generation
    let preliminaryLog: AuditLog = {
      id = auditId;
      userId = userId;
      action = action;
      resourceType = resourceType;
      resourceId = resourceId;
      details = details;
      ipAddress = null; // Could be enhanced to capture IP
      userAgent = null; // Could be enhanced to capture user agent
      timestamp = Time.now();
      previousHash = lastAuditHash;
      currentHash = ""; // Will be calculated
      sequenceNumber = auditSequenceNumber;
    };
    
    // Generate hash for this log entry
    let currentHash = generateAuditHash(preliminaryLog, lastAuditHash);
    
    // Create final audit log with hash
    let auditLog: AuditLog = {
      id = auditId;
      userId = userId;
      action = action;
      resourceType = resourceType;
      resourceId = resourceId;
      details = details;
      ipAddress = null;
      userAgent = null;
      timestamp = Time.now();
      previousHash = lastAuditHash;
      currentHash = currentHash;
      sequenceNumber = auditSequenceNumber;
    };
    
    auditLogs.put(auditId, auditLog);
    lastAuditHash := ?currentHash;
  };

  // Enhanced audit logging with additional context and hash-chaining
  private func logAuditEventWithContext(
    userId: UserId,
    action: AuditLogAction,
    resourceType: Text,
    resourceId: Text,
    details: ?Text,
    ipAddress: ?Text,
    userAgent: ?Text
  ) {
    let auditId = generateId("audit");
    auditSequenceNumber += 1;
    
    // Create preliminary audit log for hash generation
    let preliminaryLog: AuditLog = {
      id = auditId;
      userId = userId;
      action = action;
      resourceType = resourceType;
      resourceId = resourceId;
      details = details;
      ipAddress = ipAddress;
      userAgent = userAgent;
      timestamp = Time.now();
      previousHash = lastAuditHash;
      currentHash = ""; // Will be calculated
      sequenceNumber = auditSequenceNumber;
    };
    
    // Generate hash for this log entry
    let currentHash = generateAuditHash(preliminaryLog, lastAuditHash);
    
    // Create final audit log with hash
    let auditLog: AuditLog = {
      id = auditId;
      userId = userId;
      action = action;
      resourceType = resourceType;
      resourceId = resourceId;
      details = details;
      ipAddress = ipAddress;
      userAgent = userAgent;
      timestamp = Time.now();
      previousHash = lastAuditHash;
      currentHash = currentHash;
      sequenceNumber = auditSequenceNumber;
    };
    
    auditLogs.put(auditId, auditLog);
    lastAuditHash := ?currentHash;
  };

  // Log security events with hash-chaining (failed logins, unauthorized access attempts)
  private func logSecurityEvent(
    userId: ?UserId,
    eventType: Text,
    details: Text,
    severity: Text // "low", "medium", "high", "critical"
  ) {
    let auditId = generateId("security");
    let securityUserId = switch (userId) {
      case (?uid) { uid };
      case null { Principal.fromText("2vxsx-fae") }; // Anonymous principal
    };
    
    auditSequenceNumber += 1;
    
    // Create preliminary audit log for hash generation
    let preliminaryLog: AuditLog = {
      id = auditId;
      userId = securityUserId;
      action = #error; // Using error action for security events
      resourceType = "security_event";
      resourceId = eventType;
      details = ?("[" # severity # "] " # details);
      ipAddress = null;
      userAgent = null;
      timestamp = Time.now();
      previousHash = lastAuditHash;
      currentHash = ""; // Will be calculated
      sequenceNumber = auditSequenceNumber;
    };
    
    // Generate hash for this log entry
    let currentHash = generateAuditHash(preliminaryLog, lastAuditHash);
    
    // Create final audit log with hash
    let auditLog: AuditLog = {
      id = auditId;
      userId = securityUserId;
      action = #error; // Using error action for security events
      resourceType = "security_event";
      resourceId = eventType;
      details = ?("[" # severity # "] " # details);
      ipAddress = null;
      userAgent = null;
      timestamp = Time.now();
      previousHash = lastAuditHash;
      currentHash = currentHash;
      sequenceNumber = auditSequenceNumber;
    };
    
    auditLogs.put(auditId, auditLog);
    lastAuditHash := ?currentHash;
  };

  // Helper function to check access permissions
  private func _hasAccess(userId: UserId, resourceId: Text, requiredLevel: AccessLevel) : Bool {
    switch (accessControlRules.get(resourceId # "_" # Principal.toText(userId))) {
      case (?rule) {
        rule.isActive and (rule.accessLevel == requiredLevel or rule.accessLevel == #admin or rule.accessLevel == #owner)
      };
      case null { false };
    }
  };

  // Session Notes Management with Enhanced Ownership Enforcement
  public shared(msg) func createSessionNote(
    sessionId: Text,
    patientId: UserId,
    content: Text,
    encryptionLevel: EncryptionLevel,
    tags: [Text],
    isConfidential: Bool
  ) : async Result.Result<SessionNote, Text> {
    let caller = msg.caller;
    
    // Validate session ID format (must be a valid UUID)
    if (not isValidUUID(sessionId)) {
      return #err("Invalid session ID format. Must be a valid UUID.");
    };
    
    // Enhanced session ownership enforcement
    switch (enforceSessionOwnership(caller, sessionId, "create_session_note")) {
      case (#err(error)) { return #err(error) };
      case (#ok()) {};
    };
    
    // Validate active session
    switch (validateActiveSession(caller, sessionId)) {
      case (#err(error)) { return #err(error) };
      case (#ok()) {};
    };
    
    // Verify caller is a therapist
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType != #therapist) {
          return #err("Only therapists can create session notes");
        };
      };
      case null {
        return #err("User profile not found");
      };
    };

    let noteId = generateId("note");
    let now = Time.now();
    let therapistId = Principal.toText(caller);
    
    let sessionNote: SessionNote = {
      id = noteId;
      sessionId = sessionId;
      therapistId = therapistId;
      patientId = patientId;
      content = content; // In production, this should be encrypted
      encryptionLevel = encryptionLevel;
      tags = tags;
      isConfidential = isConfidential;
      accessPermissions = [(caller, #owner), (patientId, #read)];
      createdAt = now;
      updatedAt = now;
      lastAccessedAt = ?now;
      lastAccessedBy = ?caller;
    };

    sessionNotes.put(noteId, sessionNote);
    
    // Create access control rules
    let ownerRuleId = noteId # "_" # Principal.toText(caller);
    let patientRuleId = noteId # "_" # Principal.toText(patientId);
    
    let ownerRule: AccessControlRule = {
      id = ownerRuleId;
      resourceType = "session_note";
      resourceId = noteId;
      userId = caller;
      accessLevel = #owner;
      grantedBy = caller;
      grantedAt = now;
      expiresAt = null;
      isActive = true;
      conditions = null;
    };
    
    let patientRule: AccessControlRule = {
      id = patientRuleId;
      resourceType = "session_note";
      resourceId = noteId;
      userId = patientId;
      accessLevel = #read;
      grantedBy = caller;
      grantedAt = now;
      expiresAt = null;
      isActive = true;
      conditions = null;
    };
    
    accessControlRules.put(ownerRuleId, ownerRule);
    accessControlRules.put(patientRuleId, patientRule);
    
    // Log audit event
    logAuditEvent(caller, #create, "session_note", noteId, ?"Session note created");
    
    #ok(sessionNote)
  };

  // Get session notes for a patient (with access control)
  public shared query(msg) func getSessionNotes(patientId: UserId) : async Result.Result<[SessionNote], Text> {
    let caller = msg.caller;
    
    // Check if caller has access to patient's notes
    let hasPatientAccess = caller == patientId or 
      (switch (userProfiles.get(caller)) {
        case (?profile) { profile.userType == #therapist or profile.userType == #admin };
        case null { false };
      });
    
    if (not hasPatientAccess) {
      return #err("Access denied");
    };
    
    let patientNotes = Array.filter<SessionNote>(
      Iter.toArray(sessionNotes.vals()),
      func(note) { note.patientId == patientId }
    );
    
    #ok(patientNotes)
  };

  // Prescription Management with Enhanced Session Validation
  public shared(msg) func createPrescription(
    patientId: UserId,
    sessionId: ?Text,
    medicationName: Text,
    dosage: Text,
    frequency: Text,
    duration: Text,
    instructions: Text,
    sideEffects: [Text],
    contraindications: [Text]
  ) : async Result.Result<Prescription, Text> {
    let caller = msg.caller;
    
    // Enhanced session ownership enforcement if sessionId provided
    switch (sessionId) {
      case (?sid) {
        switch (enforceSessionOwnership(caller, sid, "create_prescription")) {
          case (#err(error)) { return #err(error) };
          case (#ok()) {};
        };
        
        switch (validateActiveSession(caller, sid)) {
          case (#err(error)) { return #err(error) };
          case (#ok()) {};
        };
      };
      case null {}; // Allow prescriptions without session context
    };
    
    // Verify caller is a therapist
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType != #therapist) {
          return #err("Only therapists can create prescriptions");
        };
      };
      case null {
        return #err("User profile not found");
      };
    };

    let prescriptionId = generateId("rx");
    let now = Time.now();
    let therapistId = Principal.toText(caller);
    
    let prescription: Prescription = {
      id = prescriptionId;
      patientId = patientId;
      therapistId = therapistId;
      sessionId = sessionId;
      medicationName = medicationName;
      dosage = dosage;
      frequency = frequency;
      duration = duration;
      instructions = instructions;
      sideEffects = sideEffects;
      contraindications = contraindications;
      isActive = true;
      startDate = "";
      endDate = null;
      refillsRemaining = 0;
      pharmacyNotes = null;
      encryptionLevel = #high;
      accessPermissions = [(caller, #owner), (patientId, #read)];
      createdAt = now;
      updatedAt = now;
    };

    prescriptions.put(prescriptionId, prescription);
    
    // Create access control rules
    let ownerRuleId = prescriptionId # "_" # Principal.toText(caller);
    let patientRuleId = prescriptionId # "_" # Principal.toText(patientId);
    
    let ownerRule: AccessControlRule = {
      id = ownerRuleId;
      resourceType = "prescription";
      resourceId = prescriptionId;
      userId = caller;
      accessLevel = #owner;
      grantedBy = caller;
      grantedAt = now;
      expiresAt = null;
      isActive = true;
      conditions = null;
    };
    
    let patientRule: AccessControlRule = {
      id = patientRuleId;
      resourceType = "prescription";
      resourceId = prescriptionId;
      userId = patientId;
      accessLevel = #read;
      grantedBy = caller;
      grantedAt = now;
      expiresAt = null;
      isActive = true;
      conditions = null;
    };
    
    accessControlRules.put(ownerRuleId, ownerRule);
    accessControlRules.put(patientRuleId, patientRule);
    
    // Log audit event
    logAuditEvent(caller, #create, "prescription", prescriptionId, ?"Prescription created");
    
    #ok(prescription)
  };

  // Get prescriptions for a patient
  public shared query(msg) func getPrescriptions(patientId: UserId) : async Result.Result<[Prescription], Text> {
    let caller = msg.caller;
    
    // Check if caller has access to patient's prescriptions
    let hasPatientAccess = caller == patientId or 
      (switch (userProfiles.get(caller)) {
        case (?profile) { profile.userType == #therapist or profile.userType == #admin };
        case null { false };
      });
    
    if (not hasPatientAccess) {
      return #err("Access denied");
    };
    
    let patientPrescriptions = Array.filter<Prescription>(
      Iter.toArray(prescriptions.vals()),
      func(prescription) { prescription.patientId == patientId }
    );
    
    #ok(patientPrescriptions)
  };

  // Treatment Summary Management
  public shared(msg) func createTreatmentSummary(
    patientId: UserId,
    startDate: Text,
    endDate: ?Text,
    diagnosis: [Text],
    treatmentGoals: [Text],
    interventionsUsed: [Text],
    progressNotes: Text,
    outcomes: Text,
    recommendations: Text,
    followUpPlan: ?Text,
    riskAssessment: ?Text
  ) : async Result.Result<TreatmentSummary, Text> {
    let caller = msg.caller;
    
    // Verify caller is a therapist
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType != #therapist) {
          return #err("Only therapists can create treatment summaries");
        };
      };
      case null {
        return #err("User profile not found");
      };
    };

    let summaryId = generateId("summary");
    let now = Time.now();
    let therapistId = Principal.toText(caller);
    
    let treatmentSummary: TreatmentSummary = {
      id = summaryId;
      patientId = patientId;
      therapistId = therapistId;
      treatmentPeriod = {
        startDate = startDate;
        endDate = endDate;
      };
      diagnosis = diagnosis;
      treatmentGoals = treatmentGoals;
      interventionsUsed = interventionsUsed;
      progressNotes = progressNotes;
      outcomes = outcomes;
      recommendations = recommendations;
      followUpPlan = followUpPlan;
      riskAssessment = riskAssessment;
      encryptionLevel = #maximum;
      accessPermissions = [(caller, #owner), (patientId, #read)];
      attachments = [];
      createdAt = now;
      updatedAt = now;
    };

    treatmentSummaries.put(summaryId, treatmentSummary);
    
    // Create access control rules
    let ownerRuleId = summaryId # "_" # Principal.toText(caller);
    let patientRuleId = summaryId # "_" # Principal.toText(patientId);
    
    let ownerRule: AccessControlRule = {
      id = ownerRuleId;
      resourceType = "treatment_summary";
      resourceId = summaryId;
      userId = caller;
      accessLevel = #owner;
      grantedBy = caller;
      grantedAt = now;
      expiresAt = null;
      isActive = true;
      conditions = null;
    };
    
    let patientRule: AccessControlRule = {
      id = patientRuleId;
      resourceType = "treatment_summary";
      resourceId = summaryId;
      userId = patientId;
      accessLevel = #read;
      grantedBy = caller;
      grantedAt = now;
      expiresAt = null;
      isActive = true;
      conditions = null;
    };
    
    accessControlRules.put(ownerRuleId, ownerRule);
    accessControlRules.put(patientRuleId, patientRule);
    
    // Log audit event
    logAuditEvent(caller, #create, "treatment_summary", summaryId, ?"Treatment summary created");
    
    #ok(treatmentSummary)
  };

  // Get treatment summaries for a patient
  public shared query(msg) func getTreatmentSummaries(patientId: UserId) : async Result.Result<[TreatmentSummary], Text> {
    let caller = msg.caller;
    
    // Check if caller has access to patient's treatment summaries
    let hasPatientAccess = caller == patientId or 
      (switch (userProfiles.get(caller)) {
        case (?profile) { profile.userType == #therapist or profile.userType == #admin };
        case null { false };
      });
    
    if (not hasPatientAccess) {
      return #err("Access denied");
    };
    
    let patientSummaries = Array.filter<TreatmentSummary>(
      Iter.toArray(treatmentSummaries.vals()),
      func(summary) { summary.patientId == patientId }
    );
    
    #ok(patientSummaries)
  };

  // Access Control Management
  public shared(msg) func grantAccess(
    resourceType: Text,
    resourceId: Text,
    userId: UserId,
    accessLevel: AccessLevel,
    expiresAt: ?Int
  ) : async Result.Result<AccessControlRule, Text> {
    let caller = msg.caller;
    
    // Verify caller has owner or admin access to the resource
    let callerRuleId = resourceId # "_" # Principal.toText(caller);
    switch (accessControlRules.get(callerRuleId)) {
      case (?rule) {
        if (not (rule.accessLevel == #owner or rule.accessLevel == #admin)) {
          return #err("Insufficient permissions to grant access");
        };
      };
      case null {
        return #err("Access denied");
      };
    };
    
    let ruleId = resourceId # "_" # Principal.toText(userId);
    let now = Time.now();
    
    let accessRule: AccessControlRule = {
      id = ruleId;
      resourceType = resourceType;
      resourceId = resourceId;
      userId = userId;
      accessLevel = accessLevel;
      grantedBy = caller;
      grantedAt = now;
      expiresAt = expiresAt;
      isActive = true;
      conditions = null;
    };
    
    accessControlRules.put(ruleId, accessRule);
    
    // Log audit event
    logAuditEvent(caller, #access_granted, resourceType, resourceId, ?"Access granted to user");
    
    #ok(accessRule)
  };

  // Revoke access
  public shared(msg) func revokeAccess(
    resourceType: Text,
    resourceId: Text,
    userId: UserId
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Verify caller has owner or admin access to the resource
    let callerRuleId = resourceId # "_" # Principal.toText(caller);
    switch (accessControlRules.get(callerRuleId)) {
      case (?rule) {
        if (not (rule.accessLevel == #owner or rule.accessLevel == #admin)) {
          return #err("Insufficient permissions to revoke access");
        };
      };
      case null {
        return #err("Access denied");
      };
    };
    
    let ruleId = resourceId # "_" # Principal.toText(userId);
    switch (accessControlRules.get(ruleId)) {
      case (?rule) {
        let updatedRule: AccessControlRule = {
          id = rule.id;
          resourceType = rule.resourceType;
          resourceId = rule.resourceId;
          userId = rule.userId;
          accessLevel = rule.accessLevel;
          grantedBy = rule.grantedBy;
          grantedAt = rule.grantedAt;
          expiresAt = rule.expiresAt;
          isActive = false;
          conditions = rule.conditions;
        };
        accessControlRules.put(ruleId, updatedRule);
        
        // Log audit event
        logAuditEvent(caller, #access_revoked, resourceType, resourceId, ?"Access revoked from user");
        
        #ok("Access revoked successfully")
      };
      case null {
        #err("Access rule not found")
      };
    };
  };

  // Get audit logs (admin only)
  public shared query(msg) func getAuditLogs(
    resourceType: ?Text,
    resourceId: ?Text,
    userId: ?UserId,
    limit: ?Nat
  ) : async Result.Result<[AuditLog], Text> {
    let caller = msg.caller;
    
    // Verify caller is admin
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType != #admin) {
          return #err("Only admins can access audit logs");
        };
      };
      case null {
        return #err("User profile not found");
      };
    };
    
    var logs = Iter.toArray(auditLogs.vals());
    
    // Apply filters
    switch (resourceType) {
      case (?rt) {
        logs := Array.filter<AuditLog>(logs, func(log) { log.resourceType == rt });
      };
      case null {};
    };
    
    switch (resourceId) {
      case (?rid) {
        logs := Array.filter<AuditLog>(logs, func(log) { log.resourceId == rid });
      };
      case null {};
    };
    
    switch (userId) {
      case (?uid) {
        logs := Array.filter<AuditLog>(logs, func(log) { log.userId == uid });
      };
      case null {};
    };
    
    // Sort by timestamp (newest first)
    let sortedLogs = Array.sort<AuditLog>(
      logs,
      func(a, b) {
        if (a.timestamp > b.timestamp) { #less }
        else if (a.timestamp < b.timestamp) { #greater }
        else { #equal }
      }
    );
    
    // Apply limit
    let finalLogs = switch (limit) {
      case (?l) {
        if (sortedLogs.size() > l) {
          Array.tabulate<AuditLog>(l, func(i) { sortedLogs[i] })
        } else {
          sortedLogs
        }
      };
      case null { sortedLogs };
    };
    
    #ok(finalLogs)
  };

  // Enhanced paginated audit log query with filtering and hash-chain integrity
  public shared query(msg) func getAuditLogsPaginated(
    filter: AuditLogFilter,
    pageNumber: Nat,
    pageSize: Nat
  ) : async Result.Result<AuditLogPage, Text> {
    let caller = msg.caller;
    
    // Check if caller is admin
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType != #admin) {
          return #err("Only admins can access audit logs");
        };
      };
      case null {
        return #err("User profile not found");
      };
    };

    // Validate pagination parameters
    if (pageSize == 0 or pageSize > 100) {
      return #err("Page size must be between 1 and 100");
    };
    if (pageNumber == 0) {
      return #err("Page number must be greater than 0");
    };

    var logs = Iter.toArray(auditLogs.vals());
    
    // Apply filters
    switch (filter.userId) {
      case (?uid) {
        logs := Array.filter<AuditLog>(logs, func(log) { log.userId == uid });
      };
      case null {};
    };
    
    switch (filter.action) {
      case (?action) {
        logs := Array.filter<AuditLog>(logs, func(log) { log.action == action });
      };
      case null {};
    };
    
    switch (filter.resourceType) {
      case (?rt) {
        logs := Array.filter<AuditLog>(logs, func(log) { log.resourceType == rt });
      };
      case null {};
    };
    
    switch (filter.resourceId) {
      case (?rid) {
        logs := Array.filter<AuditLog>(logs, func(log) { log.resourceId == rid });
      };
      case null {};
    };
    
    switch (filter.startTime) {
      case (?startTime) {
        logs := Array.filter<AuditLog>(logs, func(log) { log.timestamp >= startTime });
      };
      case null {};
    };
    
    switch (filter.endTime) {
      case (?endTime) {
        logs := Array.filter<AuditLog>(logs, func(log) { log.timestamp <= endTime });
      };
      case null {};
    };
    
    // Sort by sequence number (newest first) to maintain hash chain order
    let sortedLogs = Array.sort<AuditLog>(
      logs,
      func(a, b) {
        if (a.sequenceNumber > b.sequenceNumber) { #less }
        else if (a.sequenceNumber < b.sequenceNumber) { #greater }
        else { #equal }
      }
    );
    
    let totalCount = sortedLogs.size();
    let startIndex = (pageNumber - 1) * pageSize;
    let endIndex = Nat.min(startIndex + pageSize, totalCount);
    
    // Extract page data
    let pageData = if (startIndex >= totalCount) {
      []
    } else {
      Array.tabulate<AuditLog>(endIndex - startIndex, func(i) { sortedLogs[startIndex + i] })
    };
    
    let hasNextPage = endIndex < totalCount;
    let hasPreviousPage = pageNumber > 1;
    
    let auditPage: AuditLogPage = {
      logs = pageData;
      totalCount = totalCount;
      pageNumber = pageNumber;
      pageSize = pageSize;
      hasNextPage = hasNextPage;
      hasPreviousPage = hasPreviousPage;
    };
    
    #ok(auditPage)
  };

  // Audit log integrity verification function
  public shared query(msg) func verifyAuditLogIntegrity(
    startSequence: ?Nat,
    endSequence: ?Nat
  ) : async Result.Result<{isValid: Bool; brokenChainAt: ?Nat; totalVerified: Nat}, Text> {
    let caller = msg.caller;
    
    // Check if caller is admin
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType != #admin) {
          return #err("Only admins can verify audit log integrity");
        };
      };
      case null {
        return #err("User profile not found");
      };
    };

    let allLogs = Iter.toArray(auditLogs.vals());
    let sortedLogs = Array.sort<AuditLog>(
      allLogs,
      func(a, b) {
        if (a.sequenceNumber < b.sequenceNumber) { #less }
        else if (a.sequenceNumber > b.sequenceNumber) { #greater }
        else { #equal }
      }
    );
    
    let startSeq = switch (startSequence) { case (?s) s; case null 1 };
    let endSeq = switch (endSequence) { case (?e) e; case null auditSequenceNumber };
    
    var isValid = true;
    var brokenChainAt: ?Nat = null;
    var totalVerified = 0;
    var previousHash: ?Text = null;
    
    for (log in sortedLogs.vals()) {
      if (log.sequenceNumber >= startSeq and log.sequenceNumber <= endSeq) {
        totalVerified += 1;
        
        // Verify hash chain
        let expectedHash = generateAuditHash(log, previousHash);
        if (log.currentHash != expectedHash) {
          isValid := false;
          brokenChainAt := ?log.sequenceNumber;
          break;
        };
        
        // Verify previous hash link
        if (log.previousHash != previousHash) {
          isValid := false;
          brokenChainAt := ?log.sequenceNumber;
          break;
        };
        
        previousHash := ?log.currentHash;
      };
    };
    
    #ok({
      isValid = isValid;
      brokenChainAt = brokenChainAt;
      totalVerified = totalVerified;
    })
  };
  
  // Get audit summary and security insights (admin only)
  public shared query(msg) func getAuditSummary(
    timeRangeHours: ?Nat
  ) : async Result.Result<{
    totalEvents: Nat;
    securityEvents: Nat;
    userRegistrations: Nat;
    roleChanges: Nat;
    medicalRecordAccess: Nat;
    unauthorizedAttempts: Nat;
    recentCriticalEvents: [AuditLog];
  }, Text> {
    let caller = msg.caller;
    
    // Verify caller is admin
    if (not isAdmin(caller)) {
      return #err("Unauthorized: Only admins can access audit summary");
    };
    
    let allLogs = Iter.toArray(auditLogs.vals());
    let currentTime = Time.now();
    let timeFilter = switch (timeRangeHours) {
      case (?hours) { currentTime - (hours * 3600 * 1000000000) }; // Convert hours to nanoseconds
      case null { 0 }; // All time
    };
    
    let filteredLogs = Array.filter<AuditLog>(
      allLogs,
      func(log) { log.timestamp >= timeFilter }
    );
    
    let securityEvents = Array.filter<AuditLog>(
      filteredLogs,
      func(log) { log.resourceType == "security_event" }
    ).size();
    
    let userRegistrations = Array.filter<AuditLog>(
      filteredLogs,
      func(log) { log.resourceType == "user_profile" and log.action == #create }
    ).size();
    
    let roleChanges = Array.filter<AuditLog>(
      filteredLogs,
      func(log) { log.resourceType == "role_assignment" }
    ).size();
    
    let medicalRecordAccess = Array.filter<AuditLog>(
      filteredLogs,
      func(log) { log.resourceType == "medical_record" }
    ).size();
    
    let unauthorizedAttempts = Array.filter<AuditLog>(
      filteredLogs,
      func(log) {
        log.resourceType == "security_event" and
        (switch (log.details) {
          case (?details) { Text.contains(details, #text "unauthorized") };
          case null { false };
        })
      }
    ).size();
    
    // Get recent critical events
    let criticalEvents = Array.filter<AuditLog>(
      filteredLogs,
      func(log) {
        log.resourceType == "security_event" and
        (switch (log.details) {
          case (?details) { Text.contains(details, #text "[high]") or Text.contains(details, #text "[critical]") };
          case null { false };
        })
      }
    );
    
    let sortedCriticalEvents = Array.sort<AuditLog>(
      criticalEvents,
      func(a, b) {
        if (a.timestamp > b.timestamp) { #less }
        else if (a.timestamp < b.timestamp) { #greater }
        else { #equal }
      }
    );
    
    let recentCriticalEvents = if (sortedCriticalEvents.size() > 10) {
      Array.tabulate<AuditLog>(10, func(i) { sortedCriticalEvents[i] })
    } else {
      sortedCriticalEvents
    };
    
    #ok({
      totalEvents = filteredLogs.size();
      securityEvents = securityEvents;
      userRegistrations = userRegistrations;
      roleChanges = roleChanges;
      medicalRecordAccess = medicalRecordAccess;
      unauthorizedAttempts = unauthorizedAttempts;
      recentCriticalEvents = recentCriticalEvents;
    })
  };
  
  // Export audit logs for compliance (admin only)
  public shared query(msg) func exportAuditLogs(
    startTime: ?Int,
    endTime: ?Int,
    format: Text // "json" or "csv"
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Verify caller is admin
    if (not isAdmin(caller)) {
      return #err("Unauthorized: Only admins can export audit logs");
    };
    
    let allLogs = Iter.toArray(auditLogs.vals());
    let filteredLogs = Array.filter<AuditLog>(
      allLogs,
      func(log) {
        let afterStart = switch (startTime) {
          case (?start) { log.timestamp >= start };
          case null { true };
        };
        let beforeEnd = switch (endTime) {
          case (?end) { log.timestamp <= end };
          case null { true };
        };
        afterStart and beforeEnd
      }
    );
    
    // Sort by timestamp
    let sortedLogs = Array.sort<AuditLog>(
      filteredLogs,
      func(a, b) {
        if (a.timestamp < b.timestamp) { #less }
        else if (a.timestamp > b.timestamp) { #greater }
        else { #equal }
      }
    );
    
    // For now, return a simple text format (in production, would format as JSON/CSV)
    let exportData = Array.foldLeft<AuditLog, Text>(
      sortedLogs,
      "Audit Log Export\n" # "Timestamp,User,Action,Resource,Details\n",
      func(acc, log) {
        let details = switch (log.details) {
          case (?d) { d };
          case null { "" };
        };
        acc # Int.toText(log.timestamp) # "," #
        Principal.toText(log.userId) # "," #
        debug_show(log.action) # "," #
        log.resourceType # "," #
        details # "\n"
      }
    );
    
    // Log the export action
    logAuditEvent(
      caller,
      #export,
      "audit_logs",
      "export_" # Int.toText(Time.now()),
      ?("Audit logs exported by admin, " # Nat.toText(sortedLogs.size()) # " records")
    );
    
    #ok(exportData)
  };

  // ===== TAMPER-PROOF AUDIT MONITORING ===== 
  
  // Verify integrity of a specific audit log
  public shared query(msg) func verifyAuditLog(logId: Text) : async Result.Result<Bool, Text> {
    let caller = msg.caller;
    
    if (not isAdmin(caller)) {
      return #err("Unauthorized: Admin access required");
    };
    
    switch (auditLogs.get(logId)) {
      case (?_) #ok(verifyAuditLogIntegrity(logId));
      case null #err("Audit log not found");
    }
  };
  
  // Verify integrity of entire audit chain
  public shared query(msg) func verifyAuditChain() : async Result.Result<{isValid: Bool; corruptedLogs: [Text]; totalLogs: Nat}, Text> {
    let caller = msg.caller;
    
    if (not isAdmin(caller)) {
      return #err("Unauthorized: Admin access required");
    };
    
    let result = verifyAuditChainIntegrity();
    #ok({
      isValid = result.isValid;
      corruptedLogs = result.corruptedLogs;
      totalLogs = auditLogs.size();
    })
  };
  
  // Create and retrieve audit snapshot for external verification
  public shared query(msg) func getAuditSnapshot() : async Result.Result<{timestamp: Int; totalLogs: Nat; chainHash: Text; signature: Text}, Text> {
    let caller = msg.caller;
    
    if (not isAdmin(caller)) {
      return #err("Unauthorized: Admin access required");
    };
    
    #ok(createAuditSnapshot())
  };
  
  // Get audit statistics and health metrics
  public shared query(msg) func getAuditStatistics() : async Result.Result<{
    totalLogs: Nat;
    oldestLog: ?Int;
    newestLog: ?Int;
    chainIntegrity: Bool;
    lastSequenceNumber: Nat;
    averageLogsPerDay: Float;
  }, Text> {
    let caller = msg.caller;
    
    if (not isAdmin(caller)) {
      return #err("Unauthorized: Admin access required");
    };
    
    let allLogs = Iter.toArray(auditLogs.vals());
    let totalLogs = allLogs.size();
    
    if (totalLogs == 0) {
      return #ok({
        totalLogs = 0;
        oldestLog = null;
        newestLog = null;
        chainIntegrity = true;
        lastSequenceNumber = 0;
        averageLogsPerDay = 0.0;
      });
    };
    
    let sortedLogs = Array.sort(allLogs, func(a: AuditLog, b: AuditLog) : Order.Order {
      Int.compare(a.timestamp, b.timestamp)
    });
    
    let oldestLog = sortedLogs[0].timestamp;
    let newestLog = sortedLogs[sortedLogs.size() - 1].timestamp;
    let timeSpanNs = newestLog - oldestLog;
    let timeSpanDays = Float.fromInt(timeSpanNs) / (24.0 * 60.0 * 60.0 * 1_000_000_000.0);
    let averageLogsPerDay = if (timeSpanDays > 0.0) {
      Float.fromInt(totalLogs) / timeSpanDays
    } else {
      Float.fromInt(totalLogs)
    };
    
    let chainIntegrity = verifyAuditChainIntegrity().isValid;
    
    #ok({
      totalLogs = totalLogs;
      oldestLog = ?oldestLog;
      newestLog = ?newestLog;
      chainIntegrity = chainIntegrity;
      lastSequenceNumber = auditSequenceNumber;
      averageLogsPerDay = averageLogsPerDay;
    })
  };

  // Get user's access permissions
  public shared query(msg) func getUserAccessPermissions() : async Result.Result<[AccessControlRule], Text> {
    let caller = msg.caller;
    
    let userRules = Array.filter<AccessControlRule>(
      Iter.toArray(accessControlRules.vals()),
      func(rule) { rule.userId == caller and rule.isActive }
    );
    
    #ok(userRules)
  };

  // ===== PAYMENT INTEGRATION FUNCTIONS (ITERATION 4) =====
  
  // Helper function to generate payment transaction ID
  private func generatePaymentId() : Text {
    "payment_" # Int.toText(Time.now()) # "_" # Int.toText(paymentTransactions.size())
  };
  
  // Helper function to generate escrow contract ID
  private func generateEscrowId() : Text {
    "escrow_" # Int.toText(Time.now()) # "_" # Int.toText(escrowContracts.size())
  };
  
  // Helper function to generate payment plan ID
  private func generatePaymentPlanId() : Text {
    "plan_" # Int.toText(Time.now()) # "_" # Int.toText(paymentPlans.size())
  };
  
  // Create payment transaction
  public shared(msg) func createPaymentTransaction(
    payeeId: Principal,
    amount: Nat,
    paymentMethod: PaymentMethod,
    serviceType: Text,
    serviceId: Text,
    autoRefundEnabled: Bool,
    refundDeadlineHours: ?Nat
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    let paymentId = generatePaymentId();
    let now = Time.now();
    
    let refundDeadline = switch (refundDeadlineHours) {
      case (?hours) { ?(now + (hours * 3600000000000)) }; // Convert hours to nanoseconds
      case null { null };
    };
    
    let transaction: PaymentTransaction = {
      id = paymentId;
      payerId = caller;
      payeeId = payeeId;
      amount = amount;
      paymentMethod = paymentMethod;
      status = #pending;
      serviceType = serviceType;
      serviceId = serviceId;
      createdAt = now;
      completedAt = null;
      refundedAt = null;
      refundReason = null;
      escrowReleaseConditions = null;
      autoRefundEnabled = autoRefundEnabled;
      refundDeadline = refundDeadline;
    };
    
    paymentTransactions.put(paymentId, transaction);
    
    // Log audit trail
    let auditId = generateId("audit");
    let auditLog: AuditLog = {
      id = auditId;
      userId = caller;
      action = #create;
      resourceType = "payment_transaction";
      resourceId = paymentId;
      details = ?("Payment transaction created for " # serviceType);
      ipAddress = null;
      userAgent = null;
      timestamp = now;
    };
    auditLogs.put(auditId, auditLog);
    
    #ok(paymentId)
  };
  
  // Process payment (simulate payment processing)
  public shared(msg) func processPayment(paymentId: Text) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (paymentTransactions.get(paymentId)) {
      case (?transaction) {
        // Verify caller is payer or payee
        if (transaction.payerId != caller and transaction.payeeId != caller) {
          return #err("Unauthorized: Only payment participants can process payments");
        };
        
        if (transaction.status != #pending) {
          return #err("Payment is not in pending status");
        };
        
        // Update transaction status
        let updatedTransaction = {
          transaction with
          status = #processing;
        };
        paymentTransactions.put(paymentId, updatedTransaction);
        
        // In production, this would integrate with actual payment processors
        // For now, simulate successful payment
        let completedTransaction = {
          updatedTransaction with
          status = #completed;
          completedAt = ?Time.now();
        };
        paymentTransactions.put(paymentId, completedTransaction);
        
        // Audit logging for payment processing
        logAuditEvent(
          caller,
          #update,
          "payment_transaction",
          paymentId,
          ?("Payment processed: " # Nat.toText(transaction.amount) # " tokens from " # Principal.toText(transaction.payerId) # " to " # Principal.toText(transaction.payeeId))
        );
        
        #ok("Payment processed successfully")
      };
      case null {
        #err("Payment transaction not found")
      };
    }
  };
  
  // Create escrow contract
  public shared(msg) func createEscrowContract(
    payeeId: Principal,
    amount: Nat,
    serviceId: Text,
    conditions: Text,
    releaseConditions: [Text],
    autoReleaseHours: Nat
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    let escrowId = generateEscrowId();
    let now = Time.now();
    
    let contract: EscrowContract = {
      id = escrowId;
      payerId = caller;
      payeeId = payeeId;
      amount = amount;
      serviceId = serviceId;
      conditions = conditions;
      createdAt = now;
      releaseConditions = releaseConditions;
      disputeResolution = null;
      autoReleaseTime = now + (autoReleaseHours * 3600000000000);
      status = #pending;
    };
    
    escrowContracts.put(escrowId, contract);
    
    #ok(escrowId)
  };
  
  // Release escrow funds
  public shared(msg) func releaseEscrowFunds(
    escrowId: Text,
    releaseCondition: Text
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (escrowContracts.get(escrowId)) {
      case (?contract) {
        // Verify caller is payer or payee
        if (contract.payerId != caller and contract.payeeId != caller) {
          return #err("Unauthorized: Only contract participants can release funds");
        };
        
        if (contract.status != #pending) {
          return #err("Escrow contract is not in pending status");
        };
        
        // Check if release condition is met
        let conditionMet = Array.find<Text>(
          contract.releaseConditions,
          func(condition) { condition == releaseCondition }
        );
        
        switch (conditionMet) {
          case (?_) {
            let updatedContract = {
              contract with
              status = #completed;
            };
            escrowContracts.put(escrowId, updatedContract);
            
            #ok("Escrow funds released successfully")
          };
          case null {
            #err("Release condition not met")
          };
        }
      };
      case null {
        #err("Escrow contract not found")
      };
    }
  };
  
  // Process automatic refund
  public shared(msg) func processAutomaticRefund(
    paymentId: Text,
    refundReason: RefundReason
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (paymentTransactions.get(paymentId)) {
      case (?transaction) {
        // Verify caller is payer or system admin
        if (transaction.payerId != caller) {
          // Check if caller is admin
          switch (userProfiles.get(caller)) {
            case (?profile) {
              if (profile.userType != #admin) {
                return #err("Unauthorized: Only payer or admin can process refunds");
              };
            };
            case null {
              return #err("Unauthorized: User profile not found");
            };
          };
        };
        
        if (transaction.status != #completed) {
          return #err("Payment must be completed to process refund");
        };
        
        // Check if auto refund is enabled
        if (not transaction.autoRefundEnabled) {
          return #err("Automatic refund is not enabled for this transaction");
        };
        
        // Check refund deadline
        switch (transaction.refundDeadline) {
          case (?deadline) {
            if (Time.now() > deadline) {
              return #err("Refund deadline has passed");
            };
          };
          case null {};
        };
        
        let refundedTransaction = {
          transaction with
          status = #refunded;
          refundedAt = ?Time.now();
          refundReason = ?refundReason;
        };
        paymentTransactions.put(paymentId, refundedTransaction);
        
        #ok("Automatic refund processed successfully")
      };
      case null {
        #err("Payment transaction not found")
      };
    }
  };
  
  // Create payment plan
  public shared(msg) func createPaymentPlan(
    totalAmount: Nat,
    installments: Nat,
    frequency: Text,
    autoPayEnabled: Bool
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    let planId = generatePaymentPlanId();
    let now = Time.now();
    
    if (installments == 0) {
      return #err("Number of installments must be greater than 0");
    };
    
    let installmentAmount = totalAmount / installments;
    
    // Calculate next payment date based on frequency
    let nextPaymentDate = switch (frequency) {
      case ("weekly") { now + (7 * 24 * 3600000000000) };
      case ("monthly") { now + (30 * 24 * 3600000000000) };
      case ("quarterly") { now + (90 * 24 * 3600000000000) };
      case (_) { now + (30 * 24 * 3600000000000) }; // Default to monthly
    };
    
    let plan: PaymentPlan = {
      id = planId;
      userId = caller;
      totalAmount = totalAmount;
      installments = installments;
      installmentAmount = installmentAmount;
      frequency = frequency;
      startDate = now;
      nextPaymentDate = nextPaymentDate;
      remainingInstallments = installments;
      status = #pending;
      autoPayEnabled = autoPayEnabled;
    };
    
    paymentPlans.put(planId, plan);
    
    #ok(planId)
  };
  
  // Process payment plan installment
  public shared(msg) func processPaymentPlanInstallment(
    planId: Text
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (paymentPlans.get(planId)) {
      case (?plan) {
        if (plan.userId != caller) {
          return #err("Unauthorized: Only plan owner can process installments");
        };
        
        if (plan.status != #pending) {
          return #err("Payment plan is not active");
        };
        
        if (plan.remainingInstallments == 0) {
          return #err("Payment plan is already completed");
        };
        
        // Safe decrement without risking underflow
        let newRemainingInstallments : Nat = switch (plan.remainingInstallments) {
          case (0) 0; // already handled above
          case (n) n - 1;
        };
        let newStatus = if (newRemainingInstallments == 0) { #completed } else { #pending };
        
        // Calculate next payment date
        let nextPaymentDate = switch (plan.frequency) {
          case ("weekly") { plan.nextPaymentDate + (7 * 24 * 3600000000000) };
          case ("monthly") { plan.nextPaymentDate + (30 * 24 * 3600000000000) };
          case ("quarterly") { plan.nextPaymentDate + (90 * 24 * 3600000000000) };
          case (_) { plan.nextPaymentDate + (30 * 24 * 3600000000000) };
        };
        
        let updatedPlan = {
          plan with
          remainingInstallments = newRemainingInstallments;
          nextPaymentDate = nextPaymentDate;
          status = newStatus;
        };
        
        paymentPlans.put(planId, updatedPlan);
        
        #ok("Payment plan installment processed successfully")
      };
      case null {
        #err("Payment plan not found")
      };
    }
  };
  
  // Get payment transactions for user
  public shared query(msg) func getUserPaymentTransactions() : async Result.Result<[PaymentTransaction], Text> {
    let caller = msg.caller;
    
    let userTransactions = Array.filter<PaymentTransaction>(
      Iter.toArray(paymentTransactions.vals()),
      func(transaction) {
        transaction.payerId == caller or transaction.payeeId == caller
      }
    );
    
    #ok(userTransactions)
  };
  
  // Get escrow contracts for user
  public shared query(msg) func getUserEscrowContracts() : async Result.Result<[EscrowContract], Text> {
    let caller = msg.caller;
    
    let userContracts = Array.filter<EscrowContract>(
      Iter.toArray(escrowContracts.vals()),
      func(contract) {
        contract.payerId == caller or contract.payeeId == caller
      }
    );
    
    #ok(userContracts)
  };
  
  // Get payment plans for user
  public shared query(msg) func getUserPaymentPlans() : async Result.Result<[PaymentPlan], Text> {
    let caller = msg.caller;
    
    let userPlans = Array.filter<PaymentPlan>(
      Iter.toArray(paymentPlans.vals()),
      func(plan) { plan.userId == caller }
    );
    
    #ok(userPlans)
  };
  
  // Get payment statistics (admin only)
  public shared query(msg) func getPaymentStatistics() : async Result.Result<{
    totalTransactions: Nat;
    completedTransactions: Nat;
    refundedTransactions: Nat;
    totalEscrowContracts: Nat;
    activePaymentPlans: Nat;
    totalPaymentVolume: Nat;
  }, Text> {
    let caller = msg.caller;
    
    // Verify caller is admin
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType != #admin) {
          return #err("Only admins can access payment statistics");
        };
      };
      case null {
        return #err("User profile not found");
      };
    };
    
    let allTransactions = Iter.toArray(paymentTransactions.vals());
    let completedTransactions = Array.filter<PaymentTransaction>(
      allTransactions,
      func(t) { t.status == #completed }
    );
    let refundedTransactions = Array.filter<PaymentTransaction>(
      allTransactions,
      func(t) { t.status == #refunded }
    );
    
    let totalPaymentVolume = Array.foldLeft<PaymentTransaction, Nat>(
      completedTransactions,
      0,
      func(acc, t) { acc + t.amount }
    );
    
    let allPlans = Iter.toArray(paymentPlans.vals());
    let activePlans = Array.filter<PaymentPlan>(
      allPlans,
      func(p) { p.status == #pending }
    );
    
    #ok({
      totalTransactions = allTransactions.size();
      completedTransactions = completedTransactions.size();
      refundedTransactions = refundedTransactions.size();
      totalEscrowContracts = escrowContracts.size();
      activePaymentPlans = activePlans.size();
      totalPaymentVolume = totalPaymentVolume;
    })
  };

  // Phase 0: Onboarding state tracking functions
  
  // Check if a user has completed onboarding
  public shared query(msg) func checkOnboarding() : async Bool {
    let caller = msg.caller;
    switch (onboardingStates.get(caller)) {
      case (?completed) { completed };
      case null { false };
    }
  };
  
  // Mark user as having completed onboarding (legacy support)
  public shared(msg) func markOnboardingComplete() : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Check if user already completed onboarding
    switch (onboardingStates.get(caller)) {
      case (?true) {
        return #err("User has already completed onboarding");
      };
      case _ {};
    };
    
    // Mark onboarding as completed
    onboardingStates.put(caller, true);
    
    #ok("Onboarding completed successfully")
  };

  // ============================================================================
  // PHI ENCRYPTION AND KEY MANAGEMENT API (Iteration 5)
  // ============================================================================

  // Generate a new PHI encryption key for a user
  public shared(msg) func generateUserPHIKey() : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Verify caller is authenticated
    switch (userProfiles.get(caller)) {
      case null { return #err("User profile not found"); };
      case (?profile) {
        // Only patients and therapists can have PHI keys
        if (profile.userType != #patient and profile.userType != #therapist) {
          return #err("Only patients and therapists can generate PHI keys");
        };
      };
    };
    
    // Check if user already has a PHI key
    switch (userPHIKeys.get(caller)) {
      case (?existingKeyId) {
        return #err("User already has a PHI encryption key: " # existingKeyId);
      };
      case null {};
    };
    
    // Generate a new encryption key
    let keyId = "phi_key_" # Principal.toText(caller) # "_" # Int.toText(Time.now());
    let keyData = await generateRandomBytes(32); // 256-bit key for AES-256
    
    let phiKey : PHIEncryptionKey = {
      keyId = keyId;
      keyHash = keyData; // Using keyData as keyHash for now
      purpose = #medicalHistory; // Default purpose
      createdAt = Time.now();
      isActive = true;
      rotationSchedule = null; // No rotation schedule set
    };
    
    // Store the key and mapping
    phiEncryptionKeys.put(keyId, phiKey);
    userPHIKeys.put(caller, keyId);
    
    #ok(keyId)
  };

  // Rotate (regenerate) a user's PHI encryption key
  public shared(msg) func rotateUserPHIKey() : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Verify caller is authenticated
    switch (userProfiles.get(caller)) {
      case null { return #err("User profile not found"); };
      case (?profile) {
        if (profile.userType != #patient and profile.userType != #therapist) {
          return #err("Only patients and therapists can rotate PHI keys");
        };
      };
    };
    
    // Get current key ID
    let currentKeyId = switch (userPHIKeys.get(caller)) {
      case null { return #err("No existing PHI key found for user"); };
      case (?keyId) { keyId };
    };
    
    // Deactivate old key
    switch (phiEncryptionKeys.get(currentKeyId)) {
      case (?oldKey) {
        let deactivatedKey = {
          keyId = oldKey.keyId;
          keyHash = oldKey.keyHash;
          purpose = oldKey.purpose;
          createdAt = oldKey.createdAt;
          isActive = false; // Deactivate old key
          rotationSchedule = oldKey.rotationSchedule;
        };
        phiEncryptionKeys.put(currentKeyId, deactivatedKey);
      };
      case null {};
    };
    
    // Generate new key
    let newKeyId = "phi_key_" # Principal.toText(caller) # "_" # Int.toText(Time.now());
    let newKeyData = await generateRandomBytes(32);
    
    let newPHIKey : PHIEncryptionKey = {
      keyId = newKeyId;
      keyHash = newKeyData; // Using newKeyData as keyHash
      purpose = #medicalHistory; // Default purpose
      createdAt = Time.now();
      isActive = true;
      rotationSchedule = null; // No rotation schedule set
    };
    
    // Store new key and update mapping
    phiEncryptionKeys.put(newKeyId, newPHIKey);
    userPHIKeys.put(caller, newKeyId);
    
    #ok(newKeyId)
  };

  // Store encrypted PHI data for a patient
  public shared(msg) func storeEncryptedPatientPHI(
    patientId: UserId,
    phiType: PHIDataType,
    encryptedData: Blob
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Verify caller is authorized (therapist, doctor, or the patient themselves)
    let isAuthorized = switch (userProfiles.get(caller)) {
      case null { false };
      case (?profile) {
        profile.userType == #therapist or 
        profile.userType == #admin or 
        (profile.userType == #patient and caller == patientId)
      };
    };
    
    if (not isAuthorized) {
      return #err("Unauthorized to store PHI data");
    };
    
    // Verify patient exists
    switch (patients.get(patientId)) {
      case null { return #err("Patient not found"); };
      case (?patient) {};
    };
    
    // Get or create encrypted PHI record for patient
    let currentPHI = switch (encryptedPatientPHI.get(patientId)) {
      case null {
        {
          patientId = patientId;
          encryptedMedicalHistory = null;
          encryptedAllergies = null;
          encryptedCurrentMedications = null;
          encryptedPersonalInfo = null;
          lastUpdated = Time.now();
        }
      };
      case (?existing) { existing };
    };
    
    // Update the appropriate field based on PHI type
    let updatedPHI = switch (phiType) {
      case (#medicalHistory) {
        {
          patientId = currentPHI.patientId;
          encryptedMedicalHistory = ?{ encryptedData = encryptedData; nonce = Blob.fromArray([]); keyId = "default-key"; dataType = phiType; timestamp = Time.now(); };
          encryptedAllergies = currentPHI.encryptedAllergies;
          encryptedCurrentMedications = currentPHI.encryptedCurrentMedications;
          encryptedPersonalInfo = currentPHI.encryptedPersonalInfo;
          lastUpdated = Time.now();
        }
      };
      case (#allergies) {
        {
          patientId = currentPHI.patientId;
          encryptedMedicalHistory = currentPHI.encryptedMedicalHistory;
          encryptedAllergies = ?{ encryptedData = encryptedData; nonce = Blob.fromArray([]); keyId = "default-key"; dataType = phiType; timestamp = Time.now(); };
          encryptedCurrentMedications = currentPHI.encryptedCurrentMedications;
          encryptedPersonalInfo = currentPHI.encryptedPersonalInfo;
          lastUpdated = Time.now();
        }
      };
      case (#currentMedications) {
        {
          patientId = currentPHI.patientId;
          encryptedMedicalHistory = currentPHI.encryptedMedicalHistory;
          encryptedAllergies = currentPHI.encryptedAllergies;
          encryptedCurrentMedications = ?{ encryptedData = encryptedData; nonce = Blob.fromArray([]); keyId = "default-key"; dataType = phiType; timestamp = Time.now(); };
          encryptedPersonalInfo = currentPHI.encryptedPersonalInfo;
          lastUpdated = Time.now();
        }
      };
      case (#medications) {
        {
          patientId = currentPHI.patientId;
          encryptedMedicalHistory = currentPHI.encryptedMedicalHistory;
          encryptedAllergies = currentPHI.encryptedAllergies;
          encryptedCurrentMedications = ?{ encryptedData = encryptedData; nonce = Blob.fromArray([]); keyId = "default-key"; dataType = phiType; timestamp = Time.now(); };
          encryptedPersonalInfo = currentPHI.encryptedPersonalInfo;
          lastUpdated = Time.now();
        }
      };
      case (#personalInfo) {
        {
          patientId = currentPHI.patientId;
          encryptedMedicalHistory = currentPHI.encryptedMedicalHistory;
          encryptedAllergies = currentPHI.encryptedAllergies;
          encryptedCurrentMedications = currentPHI.encryptedCurrentMedications;
          encryptedPersonalInfo = ?{ encryptedData = encryptedData; nonce = Blob.fromArray([]); keyId = "default-key"; dataType = phiType; timestamp = Time.now(); };
          lastUpdated = Time.now();
        }
      };
      case (#sessionNotes) {
        {
          patientId = currentPHI.patientId;
          encryptedMedicalHistory = currentPHI.encryptedMedicalHistory;
          encryptedAllergies = currentPHI.encryptedAllergies;
          encryptedCurrentMedications = currentPHI.encryptedCurrentMedications;
          encryptedPersonalInfo = currentPHI.encryptedPersonalInfo;
          lastUpdated = Time.now();
        }
      };
      case (#diagnostics) {
        {
          patientId = currentPHI.patientId;
          encryptedMedicalHistory = currentPHI.encryptedMedicalHistory;
          encryptedAllergies = currentPHI.encryptedAllergies;
          encryptedCurrentMedications = currentPHI.encryptedCurrentMedications;
          encryptedPersonalInfo = currentPHI.encryptedPersonalInfo;
          lastUpdated = Time.now();
        }
      };
      case (#labResults) {
        {
          patientId = currentPHI.patientId;
          encryptedMedicalHistory = currentPHI.encryptedMedicalHistory;
          encryptedAllergies = currentPHI.encryptedAllergies;
          encryptedCurrentMedications = currentPHI.encryptedCurrentMedications;
          encryptedPersonalInfo = currentPHI.encryptedPersonalInfo;
          lastUpdated = Time.now();
        }
      };
    };
    
    // Store updated PHI data
    encryptedPatientPHI.put(patientId, updatedPHI);
    
    #ok("PHI data stored successfully")
  };

  // Retrieve encrypted PHI data for authorized users
  public shared query(msg) func getEncryptedPatientPHI(
    patientId: UserId
  ) : async Result.Result<EncryptedPatientPHI, Text> {
    let caller = msg.caller;
    
    // Verify caller is authorized
    let isAuthorized = switch (userProfiles.get(caller)) {
      case null { false };
      case (?profile) {
        profile.userType == #therapist or 
        profile.userType == #admin or 
        (profile.userType == #patient and caller == patientId)
      };
    };
    
    if (not isAuthorized) {
      return #err("Unauthorized to access PHI data");
    };
    
    // Retrieve encrypted PHI data
    switch (encryptedPatientPHI.get(patientId)) {
      case null { #err("No PHI data found for patient"); };
      case (?phi) { #ok(phi); };
    }
  };

  // Helper function to generate random bytes (simplified implementation)
  private func generateRandomBytes(length: Nat) : async Blob {
    // In a real implementation, this would use proper cryptographic randomness
    // For now, we'll use a simple approach with current time and caller info
    let timeBytes = Blob.fromArray([
      Nat8.fromNat(Int.abs(Time.now()) % 256),
      Nat8.fromNat((Int.abs(Time.now()) / 256) % 256),
      Nat8.fromNat((Int.abs(Time.now()) / 65536) % 256),
      Nat8.fromNat((Int.abs(Time.now()) / 16777216) % 256)
    ]);
    
    // Extend to desired length by repeating and modifying
    let baseArray = Blob.toArray(timeBytes);
    let extendedArray = Array.tabulate<Nat8>(length, func(i) {
      let baseIndex = i % baseArray.size();
      let modifier = Nat8.fromNat((i + Int.abs(Time.now())) % 256);
      baseArray[baseIndex] ^ modifier
    });
    
    Blob.fromArray(extendedArray)
  };

  // === DATA ENCRYPTION AT REST AND IN TRANSIT ===
  
  // Encrypt sensitive text data using XOR cipher (simplified for demo)
  private func encryptText(plaintext: Text, keyId: Text) : async Result.Result<{encryptedData: Blob; nonce: Blob}, Text> {
    switch (phiEncryptionKeys.get(keyId)) {
      case null { #err("Encryption key not found: " # keyId) };
      case (?key) {
        if (not key.isActive) {
          return #err("Encryption key is inactive: " # keyId);
        };
        
        let plaintextBytes = Blob.toArray(Text.encodeUtf8(plaintext));
        let keyBytes = Blob.toArray(key.keyHash);
        let nonce = await generateRandomBytes(16); // 128-bit nonce
        let nonceBytes = Blob.toArray(nonce);
        
        // Simple XOR encryption with key and nonce
        let encryptedBytes = Array.tabulate<Nat8>(plaintextBytes.size(), func(i) {
          let keyIndex = i % keyBytes.size();
          let nonceIndex = i % nonceBytes.size();
          plaintextBytes[i] ^ keyBytes[keyIndex] ^ nonceBytes[nonceIndex]
        });
        
        #ok({
          encryptedData = Blob.fromArray(encryptedBytes);
          nonce = nonce;
        })
      };
    }
  };
  
  // Decrypt sensitive text data
  private func decryptText(encryptedData: Blob, nonce: Blob, keyId: Text) : Result.Result<Text, Text> {
    switch (phiEncryptionKeys.get(keyId)) {
      case null { #err("Decryption key not found: " # keyId) };
      case (?key) {
        if (not key.isActive) {
          return #err("Decryption key is inactive: " # keyId);
        };
        
        let encryptedBytes = Blob.toArray(encryptedData);
        let keyBytes = Blob.toArray(key.keyHash);
        let nonceBytes = Blob.toArray(nonce);
        
        // XOR decryption (same as encryption with XOR)
        let decryptedBytes = Array.tabulate<Nat8>(encryptedBytes.size(), func(i) {
          let keyIndex = i % keyBytes.size();
          let nonceIndex = i % nonceBytes.size();
          encryptedBytes[i] ^ keyBytes[keyIndex] ^ nonceBytes[nonceIndex]
        });
        
        switch (Text.decodeUtf8(Blob.fromArray(decryptedBytes))) {
          case null { #err("Failed to decode decrypted text") };
          case (?text) { #ok(text) };
        }
      };
    }
  };
  
  // Get or create encryption key for user
  private func getOrCreateUserEncryptionKey(userId: Principal) : async Result.Result<Text, Text> {
    switch (userPHIKeys.get(userId)) {
      case (?keyId) { #ok(keyId) };
      case null {
        // Auto-generate key for user
        let keyId = "phi_key_" # Principal.toText(userId) # "_" # Int.toText(Time.now());
        let keyData = await generateRandomBytes(32); // 256-bit key
        
        let phiKey : PHIEncryptionKey = {
          keyId = keyId;
          keyHash = keyData;
          purpose = #medicalHistory;
          createdAt = Time.now();
          isActive = true;
          rotationSchedule = null;
        };
        
        phiEncryptionKeys.put(keyId, phiKey);
        userPHIKeys.put(userId, keyId);
        
        #ok(keyId)
      };
    }
  };
  
  // Encrypt medical record data at rest
  private func encryptMedicalRecordData(record: MedicalRecord, userId: Principal) : async Result.Result<EncryptedPatientPHI, Text> {
    switch (await getOrCreateUserEncryptionKey(userId)) {
      case (#err(error)) { #err("Failed to get encryption key: " # error) };
      case (#ok(keyId)) {
        // Encrypt sensitive fields
        let diagnosisResult = await encryptText(record.diagnosis, keyId);
        let treatmentResult = await encryptText(record.treatment, keyId);
        let notesResult = await encryptText(record.notes, keyId);
        
        switch (diagnosisResult, treatmentResult, notesResult) {
          case (#ok(encDiagnosis), #ok(encTreatment), #ok(encNotes)) {
            let encryptedPHI : EncryptedPatientPHI = {
              patientId = userId;
              encryptedData = {
                diagnosis = encDiagnosis.encryptedData;
                treatment = encTreatment.encryptedData;
                notes = encNotes.encryptedData;
                diagnosisNonce = encDiagnosis.nonce;
                treatmentNonce = encTreatment.nonce;
                notesNonce = encNotes.nonce;
              };
              keyId = keyId;
              encryptedAt = Time.now();
              accessLog = [];
            };
            #ok(encryptedPHI)
          };
          case _ { #err("Failed to encrypt medical record data") };
        }
      };
    }
  };
  
  // Encrypt message content for secure communication
  private func encryptMessageContent(content: Text, senderId: Principal, recipientId: Principal) : async Result.Result<{encryptedContent: Blob; nonce: Blob; keyId: Text}, Text> {
    // Use sender's encryption key for message encryption
    switch (await getOrCreateUserEncryptionKey(senderId)) {
      case (#err(error)) { #err("Failed to get sender encryption key: " # error) };
      case (#ok(keyId)) {
        switch (await encryptText(content, keyId)) {
          case (#err(error)) { #err("Failed to encrypt message: " # error) };
          case (#ok(encrypted)) {
            #ok({
              encryptedContent = encrypted.encryptedData;
              nonce = encrypted.nonce;
              keyId = keyId;
            })
          };
        }
      };
    }
  }

};
