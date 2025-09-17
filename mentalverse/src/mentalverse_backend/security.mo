import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Float "mo:base/Float";

module {
    // === TYPE DEFINITIONS ===
    
    public type ValidationResult = Result.Result<Text, Text>;
    
    // Enhanced rate limiting and DDoS protection types
    public type RateLimitInfo = {
        callCount: Nat;
        windowStart: Int;
        lastCall: Int;
        violations: Nat;        // Track repeated violations
        blockedUntil: ?Int;     // Temporary block timestamp
    };
    
    public type DDoSProtectionLevel = {
        #normal;     // Standard rate limits
        #elevated;   // Reduced rate limits
        #high;       // Strict rate limits
        #critical;   // Emergency mode - very restrictive
    };
    
    public type ThreatMetrics = {
        totalRequests: Nat;
        uniqueCallers: Nat;
        violationRate: Float;
        avgRequestsPerCaller: Float;
    };
    
    public type SecurityEventType = {
        #rate_limit_exceeded;
        #ddos_protection_block;
        #nonce_replay_attack;
        #suspicious_activity;
        #unauthorized_access;
        #invalid_timestamp;
    };
    
    // === SECURITY CLASS ===
    
    public class Security() {
        // === STABLE STORAGE ===
        
        // Rate limiting storage
        private var rateLimitEntries : [(Principal, RateLimitInfo)] = [];
        private var currentProtectionLevel : DDoSProtectionLevel = #normal;
        
        // Nonce tracking for replay protection
        private var nonceEntries : [(Text, Int)] = [];
        
        // === TRANSIENT STORAGE ===
        
        private var rateLimits = HashMap.HashMap<Principal, RateLimitInfo>(100, Principal.equal, Principal.hash);
        private var usedNonces = HashMap.HashMap<Text, Int>(1000, Text.equal, Text.hash);
        
        // === CONSTANTS ===
        
        private let NONCE_EXPIRY_MS : Int = 300000; // 5 minutes
        private let MAX_VIOLATIONS : Nat = 5;
        private let BLOCK_DURATION_BASE : Int = 60_000_000_000; // 1 minute in nanoseconds
        
        // === INITIALIZATION ===
        
        public func initializeFromStableStorage() {
            // Restore rate limiting data
            for ((principal, rateLimitInfo) in rateLimitEntries.vals()) {
                rateLimits.put(principal, rateLimitInfo);
            };
            
            // Restore nonce data
            for ((nonce, timestamp) in nonceEntries.vals()) {
                usedNonces.put(nonce, timestamp);
            };
        };
        
        public func saveToStableStorage() {
            rateLimitEntries := Iter.toArray(rateLimits.entries());
            nonceEntries := Iter.toArray(usedNonces.entries());
        };
        
        // === RATE LIMITING ===
        
        // Enhanced DDoS protection and rate limiting
        public func checkRateLimit(caller: Principal, maxCalls: Nat, windowMs: Int) : ValidationResult {
            let now = Time.now();
            let windowNs = Int.abs(windowMs * 1_000_000); // Convert ms to ns
            
            // Check if caller is currently blocked
            switch (rateLimits.get(caller)) {
                case (?info) {
                    switch (info.blockedUntil) {
                        case (?blockTime) {
                            if (now < blockTime) {
                                return #err("Access blocked until " # Int.toText(blockTime));
                            };
                        };
                        case null {};
                    };
                };
                case null {};
            };
            
            // Adjust rate limits based on protection level
            let adjustedMaxCalls = getAdjustedRateLimit(maxCalls);
            
            // Check rate limit
            switch (rateLimits.get(caller)) {
                case null {
                    // First call from this principal
                    rateLimits.put(caller, {
                        callCount = 1;
                        windowStart = now;
                        lastCall = now;
                        violations = 0;
                        blockedUntil = null;
                    });
                    #ok("Rate limit check passed")
                };
                case (?info) {
                    if (now - info.windowStart > windowNs) {
                        // New window - reset counter
                        rateLimits.put(caller, {
                            callCount = 1;
                            windowStart = now;
                            lastCall = now;
                            violations = info.violations;
                            blockedUntil = null;
                        });
                        #ok("Rate limit check passed")
                    } else if (info.callCount < adjustedMaxCalls) {
                        // Within rate limit
                        rateLimits.put(caller, {
                            callCount = info.callCount + 1;
                            windowStart = info.windowStart;
                            lastCall = now;
                            violations = info.violations;
                            blockedUntil = info.blockedUntil;
                        });
                        #ok("Rate limit check passed")
                    } else {
                        // Rate limit exceeded - apply progressive penalties
                        let newViolations = info.violations + 1;
                        // Convert Nat to Int for multiplication
                        let violationsAsInt = if (newViolations <= 2147483647) { 
                            newViolations 
                        } else { 
                            2147483647 
                        };
                        let blockDuration = BLOCK_DURATION_BASE * violationsAsInt; // Progressive blocking
                        let blockUntil = now + blockDuration;
                        
                        // Update rate limit info with penalty
                        rateLimits.put(caller, {
                            callCount = info.callCount + 1;
                            windowStart = info.windowStart;
                            lastCall = now;
                            violations = newViolations;
                            blockedUntil = ?blockUntil;
                        });
                        
                        // Check for suspicious activity
                        if (detectSuspiciousActivity(caller, now, info)) {
                            // Log security event
                            logSecurityEvent(
                                #ddos_protection_block,
                                "Principal blocked due to repeated rate limit violations: " # Principal.toText(caller),
                                ?caller
                            );
                        };
                        
                        #err("Rate limit exceeded. Access temporarily restricted for " # Int.toText(blockDuration / 1_000_000_000) # " seconds.")
                    }
                }
            };
        };
        
        // Simplified rate limiting check for Phase 2 security
        public func checkRateLimitSimple(caller: Principal) : Bool {
            switch (checkRateLimit(caller, 10, 60000)) { // 10 calls per minute
                case (#ok(_)) { true };
                case (#err(_)) { false };
            }
        };
        
        // Detect suspicious activity patterns
        private func detectSuspiciousActivity(_caller: Principal, now: Int, info: RateLimitInfo) : Bool {
            // Check for rapid successive violations
            if (info.violations >= MAX_VIOLATIONS) {
                return true;
            };
            
            // Check for very high frequency calls
            let timeSinceWindowStart = now - info.windowStart;
            if (timeSinceWindowStart > 0 and info.callCount > 100) {
                return true;
            };
            
            false
        };
        
        // Adjust rate limits based on current protection level
        private func getAdjustedRateLimit(baseLimit: Nat) : Nat {
            switch (currentProtectionLevel) {
                case (#normal) { baseLimit };
                case (#elevated) { baseLimit * 3 / 4 }; // 25% reduction
                case (#high) { baseLimit / 2 };         // 50% reduction
                case (#critical) { baseLimit / 4 };     // 75% reduction
            }
        };
        
        // Calculate current threat metrics
        public func calculateThreatMetrics() : ThreatMetrics {
            let now = Time.now();
            let recentWindow : Int = 300_000_000_000; // 5 minutes in nanoseconds
            
            var totalRequests = 0;
            var violations = 0;
            let uniqueCallers = rateLimits.size();
            
            for ((principal, info) in rateLimits.entries()) {
                if (now - info.lastCall < recentWindow) {
                    totalRequests += info.callCount;
                    violations += info.violations;
                }
            };
            
            let violationRate = if (totalRequests > 0) {
                Float.fromInt(violations) / Float.fromInt(totalRequests)
            } else { 0.0 };
            
            let avgRequestsPerCaller = if (uniqueCallers > 0) {
                Float.fromInt(totalRequests) / Float.fromInt(uniqueCallers)
            } else { 0.0 };
            
            {
                totalRequests = totalRequests;
                uniqueCallers = uniqueCallers;
                violationRate = violationRate;
                avgRequestsPerCaller = avgRequestsPerCaller;
            }
        };
        
        // Calculate and update protection level based on threat metrics
        public func updateProtectionLevel() : DDoSProtectionLevel {
            let metrics = calculateThreatMetrics();
            currentProtectionLevel := calculateProtectionLevel(metrics);
            currentProtectionLevel
        };
        
        private func calculateProtectionLevel(metrics: ThreatMetrics) : DDoSProtectionLevel {
            if (metrics.violationRate > 0.5 or metrics.avgRequestsPerCaller > 50.0) {
                #critical
            } else if (metrics.violationRate > 0.3 or metrics.avgRequestsPerCaller > 30.0) {
                #high
            } else if (metrics.violationRate > 0.1 or metrics.avgRequestsPerCaller > 20.0) {
                #elevated
            } else {
                #normal
            }
        };
        
        public func getCurrentProtectionLevel() : DDoSProtectionLevel {
            currentProtectionLevel
        };
        
        // === NONCE VALIDATION ===
        
        public func validateNonce(nonce: Text, timestamp: Int) : ValidationResult {
            let now = Time.now();
            let maxAge = NONCE_EXPIRY_MS * 1_000_000; // Convert to nanoseconds
            
            // Check if nonce was already used
            switch (usedNonces.get(nonce)) {
                case (?_) {
                    return #err("Nonce already used (replay attack detected)");
                };
                case null {};
            };
            
            // Check timestamp validity (within acceptable range)
            let timeDiff = Int.abs(now - timestamp);
            if (timeDiff > maxAge) {
                return #err("Timestamp too old or too far in future");
            };
            
            // Store nonce
            usedNonces.put(nonce, timestamp);
            
            // Clean old nonces periodically
            cleanOldNonces(now - maxAge);
            
            #ok("Nonce validation passed")
        };
        
        // Simplified nonce validation for Phase 2 security
        public func validateNonceSimple(caller: Principal, nonce: Nat, timestamp: Int) : Bool {
            let nonceText = Principal.toText(caller) # "_" # Nat.toText(nonce) # "_" # Int.toText(timestamp);
            switch (validateNonce(nonceText, timestamp)) {
                case (#ok(_)) { true };
                case (#err(_)) { false };
            }
        };
        
        private func cleanOldNonces(cutoffTime: Int) {
            let entries = Iter.toArray(usedNonces.entries());
            for ((nonce, timestamp) in entries.vals()) {
                if (timestamp < cutoffTime) {
                    usedNonces.delete(nonce);
                }
            }
        };
        
        // === TEXT SANITIZATION ===
        
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
        
        // === ENDPOINT ACCESS VALIDATION ===
        
        public type UserType = {
            #patient;
            #therapist;
            #doctor;
            #admin;
        };
        
        public func validateEndpointAccess(
            caller: Principal,
            _requiredRole: ?UserType,
            nonce: ?Nat,
            timestamp: ?Int
        ) : ValidationResult {
            // Rate limiting check
            switch (checkRateLimit(caller, 10, 60000)) {
                case (#err(msg)) { return #err("Rate limit exceeded: " # msg) };
                case (#ok(_)) {};
            };
            
            // Nonce and timestamp validation if provided
            switch (nonce, timestamp) {
                case (?n, ?t) {
                    let nonceText = Principal.toText(caller) # "_" # Nat.toText(n) # "_" # Int.toText(t);
                    switch (validateNonce(nonceText, t)) {
                        case (#err(msg)) { return #err("Invalid nonce: " # msg) };
                        case (#ok(_)) {};
                    };
                };
                case (_, _) {}; // No nonce/timestamp validation required
            };
            
            #ok("Endpoint access validation passed")
        };
        
        // === SECURITY EVENT LOGGING ===
        
        // Security event logging callback type
        public type SecurityEventLogger = (SecurityEventType, Text, ?Principal) -> ();
        
        private var securityEventLogger : ?SecurityEventLogger = null;
        
        public func setSecurityEventLogger(logger: SecurityEventLogger) {
            securityEventLogger := ?logger;
        };
        
        private func logSecurityEvent(
            eventType: SecurityEventType,
            description: Text,
            userId: ?Principal
        ) {
            switch (securityEventLogger) {
                case (?logger) {
                    logger(eventType, description, userId);
                };
                case null {
                    // Fallback to debug logging
                    Debug.print("Security Event: " # debug_show(eventType) # " - " # description);
                };
            }
        };
        
        // === SECURITY STATISTICS ===
        
        public func getSecurityStats() : {
            totalRateLimitEntries: Nat;
            totalNonceEntries: Nat;
            currentProtectionLevel: DDoSProtectionLevel;
            threatMetrics: ThreatMetrics;
        } {
            {
                totalRateLimitEntries = rateLimits.size();
                totalNonceEntries = usedNonces.size();
                currentProtectionLevel = currentProtectionLevel;
                threatMetrics = calculateThreatMetrics();
            }
        };
        
        // === CLEANUP OPERATIONS ===
        
        public func cleanupExpiredData() {
            let now = Time.now();
            let maxAge = NONCE_EXPIRY_MS * 1_000_000;
            
            // Clean old nonces
            cleanOldNonces(now - maxAge);
            
            // Clean old rate limit entries (older than 1 hour)
            let rateLimitMaxAge : Int = 3600_000_000_000; // 1 hour in nanoseconds
            let rateLimitEntries = Iter.toArray(rateLimits.entries());
            for ((principal, info) in rateLimitEntries.vals()) {
                if (now - info.lastCall > rateLimitMaxAge) {
                    rateLimits.delete(principal);
                }
            }
        };
        
        // === EMERGENCY FUNCTIONS ===
        
        public func emergencyResetRateLimits() {
            rateLimits := HashMap.HashMap<Principal, RateLimitInfo>(100, Principal.equal, Principal.hash);
            currentProtectionLevel := #normal;
        };
        
        public func emergencyBlockPrincipal(principal: Principal, durationSeconds: Nat) {
            let now = Time.now();
            // Convert Nat to Int safely 
            let durationInt = if (durationSeconds <= 2147483647) { 
                durationSeconds 
            } else { 
                2147483647 
            };
            let blockDuration = durationInt * 1_000_000_000; // Convert to nanoseconds
            let blockUntil = now + blockDuration;
            
            switch (rateLimits.get(principal)) {
                case (?info) {
                    rateLimits.put(principal, {
                        callCount = info.callCount;
                        windowStart = info.windowStart;
                        lastCall = info.lastCall;
                        violations = info.violations + 1;
                        blockedUntil = ?blockUntil;
                    });
                };
                case null {
                    rateLimits.put(principal, {
                        callCount = 0;
                        windowStart = now;
                        lastCall = now;
                        violations = 1;
                        blockedUntil = ?blockUntil;
                    });
                };
            };
            
            logSecurityEvent(
                #unauthorized_access,
                "Principal emergency blocked: " # Principal.toText(principal),
                ?principal
            );
        };
        
        public func emergencyUnblockPrincipal(principal: Principal) {
            switch (rateLimits.get(principal)) {
                case (?info) {
                    rateLimits.put(principal, {
                        callCount = info.callCount;
                        windowStart = info.windowStart;
                        lastCall = info.lastCall;
                        violations = 0; // Reset violations
                        blockedUntil = null; // Remove block
                    });
                };
                case null {};
            };
        };
    };
}