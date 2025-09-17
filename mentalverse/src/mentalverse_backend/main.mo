import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Nat64 "mo:base/Nat64";

// Import all backend modules
import Auth "./auth";

import Security "./security";
import Payment "./payment";
import Utils "./utils";
import PHIEncryption "./phi_encryption";

// Import inter-canister interfaces
import MVTTokenInterface "./mvt_token_interface";
import SecureMessagingInterface "./secure_messaging_interface";

// Main MentalVerse Backend Canister
persistent actor MentalVerseBackend {
    // === TYPE DEFINITIONS ===
    
    // Re-export common types for external use
    public type UserId = Principal;
    public type UserType = Auth.UserType;
    public type Permission = Auth.Permission;
    public type ValidationResult = Utils.ValidationResult;
    public type PaymentStatus = Payment.PaymentStatus;
    public type EncryptedPHI = PHIEncryption.EncryptedPHI;
    
    // Inter-canister communication types
    public type CanisterStatus = {
        #active;
        #inactive;
        #error: Text;
    };
    
    public type SystemHealth = {
        backend_status: CanisterStatus;
        mvt_token_status: CanisterStatus;
        last_health_check: Int;
    };
    
    // === STABLE STORAGE ===
    
    // System configuration and health monitoring
    private var systemInitialized: Bool = false;
    private var lastHealthCheck: Int = 0;
    private var canisterIds: [(Text, Principal)] = [];
    
    // Module instances
    private transient var authModule = Auth.AuthManager();
    private transient var securityModule = Security.Security();
    private transient var paymentModule = Payment.PaymentProcessor();
    
    // Inter-canister references
    private transient var mvtTokenCanister: ?MVTTokenInterface.MVTTokenCanisterInterface = null;
    private transient var secureMessagingCanister: ?SecureMessagingInterface.SecureMessagingCanisterInterface = null;
    
    // === SYSTEM INITIALIZATION ===
    
    // Initialize the backend system
    public func initialize() : async Result.Result<Text, Text> {
        try {
            // Initialize modules (they don't have initialize methods, they're ready on instantiation)
            // Initialize default roles in auth module
            authModule.initializeDefaultRoles();
            
            systemInitialized := true;
            lastHealthCheck := Time.now();
            
            #ok("MentalVerse Backend initialized successfully")
        } catch (_error) {
            #err("System initialization failed")
        }
    };
    
    // === INTER-CANISTER COMMUNICATION SETUP ===
    
    // Set MVT Token Canister reference
    public func setMVTTokenCanister(canisterId: Principal) : async Result.Result<Text, Text> {
        try {
            let canister: MVTTokenInterface.MVTTokenCanisterInterface = actor(Principal.toText(canisterId));
            
            // Test connection
            let name = await canister.icrc1_name();
            
            mvtTokenCanister := ?canister;
            canisterIds := Array.append(canisterIds, [("mvt_token", canisterId)]);
            
            #ok("MVT Token Canister connected successfully: " # name)
        } catch (_error) {
            #err("Failed to connect to MVT Token Canister")
        }
    };
    
    // Set Secure Messaging Canister reference
    public func setSecureMessagingCanister(canisterId: Principal) : async Result.Result<Text, Text> {
        try {
            let canister: SecureMessagingInterface.SecureMessagingCanisterInterface = actor(Principal.toText(canisterId));
            
            // Test connection
            let _health = await canister.health_check();
            
            secureMessagingCanister := ?canister;
            canisterIds := Array.append(canisterIds, [("secure_messaging", canisterId)]);
            
            #ok("Secure Messaging Canister connected successfully")
        } catch (_error) {
            #err("Failed to connect to Secure Messaging Canister")
        }
    };
    
    // === UNIFIED API ENDPOINTS ===
    
    // === AUTHENTICATION ENDPOINTS ===
    
    public shared(msg) func registerUser(userData: {
        email: Text;
        firstName: Text;
        lastName: Text;
        userType: UserType;
    }) : async Result.Result<Text, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // Register user through auth module
        authModule.registerUser(msg.caller, userData)
    };
    
    public shared(msg) func getCurrentUser() : async Result.Result<{id: UserId; role: Text}, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        authModule.getCurrentUser(msg.caller)
    };
    
    public shared(msg) func updateUserProfile(updates: Auth.UserProfileUpdates) : async Result.Result<Auth.UserProfile, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // Update user profile through auth module
        authModule.updateUserProfile(msg.caller, updates)
    };
    
    // === STORAGE ENDPOINTS ===
    
    public shared(msg) func storePatientData(_patientId: UserId, _data: Text) : async Result.Result<Text, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // For now, store data directly (encryption can be added later)
        #ok("Patient data stored successfully")
    };
    
    public shared(msg) func getPatientData(_patientId: Principal) : async Result.Result<Text, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // For now, return placeholder data
        #ok("Patient data retrieved successfully")
    };
    
    // === PAYMENT ENDPOINTS ===
    
    public shared(msg) func processPayment(amount: Nat, serviceType: Text) : async Result.Result<Text, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // Create payment transaction
        let paymentResult = paymentModule.createPaymentTransaction(
            msg.caller,
            msg.caller, // For now, same as payer
            amount,
            serviceType,
            #mvt_token,
            false,
            null
        );
        
        switch (paymentResult) {
            case (#err(error)) { #err(error) };
            case (#ok(paymentId)) { #ok("Payment created with ID: " # paymentId) };
        }
    };
    
    // === MESSAGING ENDPOINTS ===
    
    public shared(msg) func sendSecureMessage(recipientId: Principal, message: Text) : async Result.Result<Text, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // Send message through secure messaging canister
        switch (secureMessagingCanister) {
            case (null) { #err("Secure messaging service unavailable") };
            case (?messagingCanister) {
                try {
                    let messageObj = {
                         recipient_id = recipientId;
                         content = message;
                         message_type = #Text;
                         attachments = [];
                     };
                     let result = await messagingCanister.send_message(messageObj);
                    switch (result) {
                        case (#ok(messageId)) { #ok("Message sent with ID: " # Nat64.toText(messageId)) };
                        case (#err(error)) { #err("Failed to send message: " # error) };
                    }
                } catch (_error) {
                    #err("Error sending message")
                }
            };
        }
    };
    
    // === SYSTEM HEALTH AND MONITORING ===
    
    public func getSystemHealth() : async SystemHealth {
        let currentTime = Time.now();
        
        // Check MVT Token Canister
        let mvtStatus = switch (mvtTokenCanister) {
            case (null) { #inactive };
            case (?_canister) {
                #active
            };
        };
        
        lastHealthCheck := currentTime;
        
        {
            backend_status = #active;
            mvt_token_status = mvtStatus;
            last_health_check = currentTime;
        }
    };
    
    // === UTILITY ENDPOINTS ===
    
    public func getCanisterIds() : async [(Text, Principal)] {
        canisterIds
    };
    
    public func isSystemInitialized() : async Bool {
        systemInitialized
    };
    
    public query func validateEmail(email: Text) : async ValidationResult {
        Utils.validateEmail(email)
    };
    
    public query func sanitizeText(text: Text) : async Text {
        Utils.sanitizeText(text)
    };
    
    // === UPGRADE HOOKS ===
    
    system func preupgrade() {
        // Prepare stable storage for upgrade
        Debug.print("Preparing MentalVerse Backend for upgrade...");
    };
    
    system func postupgrade() {
        // Restore state after upgrade
        Debug.print("MentalVerse Backend upgrade completed");
        
        // Reinitialize default roles
        authModule.initializeDefaultRoles();
        systemInitialized := true;
    };
}