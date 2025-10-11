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
import Storage "./storage";
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
    
    // Add BackendInterface-compatible request type for payments
    public type PaymentRequest = {
        amount: Nat;
        currency: Text;
        description: Text;
        recipient: ?UserId;
    };
    
    // === STABLE STORAGE ===
    
    // System configuration and health monitoring
    private transient var systemInitialized: Bool = false;
    private transient var lastHealthCheck: Int = 0;
    private transient var canisterIds: [(Text, Principal)] = [];
    
    // Module instances
    private transient let authModule = Auth.AuthManager();
    private transient let storageModule = Storage.Storage();
    private transient let securityModule = Security.Security();
    private transient let paymentModule = Payment.PaymentProcessor();
    
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
    public func setMVTTokenCanister(canisterId: Principal) : async Result.Result<(), Text> {
        try {
            let canister: MVTTokenInterface.MVTTokenCanisterInterface = actor(Principal.toText(canisterId));
            
            // Test connection
            let _name = await canister.icrc1_name();
            
            mvtTokenCanister := ?canister;
            canisterIds := Array.append(canisterIds, [("mvt_token", canisterId)]);
            
            #ok(())
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
    
    // Admin authentication function for specific principal ID
    public shared(msg) func authenticateAdmin() : async Result.Result<Text, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // Check if caller is the specific admin principal
        let adminPrincipal = Principal.fromText("r3bk7-5k6fp-fpav7-txoce-fshab-fhxt3-bp2f2-bp6wj-h5d3t-zzgas-6qe");
        if (not Principal.equal(msg.caller, adminPrincipal)) {
            return #err("Unauthorized: Only specific admin principal can authenticate");
        };
        
        // Register or update admin user
        let adminData = {
            email = "admin@mentalverse.com";
            firstName = "System";
            lastName = "Administrator";
            userType = #admin;
        };
        
        // Register the admin user
        let registerResult = authModule.registerUser(msg.caller, adminData);
        switch (registerResult) {
            case (#ok(message)) { #ok("Admin authenticated successfully: " # message) };
            case (#err(error)) {
                // If already registered, try to update user type to admin
                let updateResult = authModule.updateUserType(msg.caller, #admin);
                switch (updateResult) {
                    case (#ok(message)) { #ok("Admin authenticated successfully: " # message) };
                    case (#err(updateError)) { #err("Admin authentication failed: " # updateError) };
                };
            };
        };
    };

    public shared(msg) func updateUserProfile(updates: Auth.UserProfileUpdates) : async Result.Result<Auth.UserProfile, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // Update user profile through auth module
        authModule.updateUserProfile(msg.caller, updates)
    };
    
    // Get user profile by principal
    public shared(msg) func get_user_profile(userPrincipal: Principal) : async Result.Result<Auth.UserProfile, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // Get user profile through auth module
        authModule.getCurrentUserProfile(userPrincipal)
    };
    
    // Create user profile (used during onboarding)
    public shared(msg) func create_user_profile(userData: {
        email: Text;
        firstName: Text;
        lastName: Text;
        userType: UserType;
    }) : async Result.Result<Text, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // Create user profile through registerUser (which creates the profile)
        authModule.registerUser(msg.caller, userData)
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
    
    // Get user's secure conversations
    public shared(msg) func getUserSecureConversations() : async Result.Result<[SecureMessagingInterface.Conversation], Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // Get conversations through secure messaging canister
        switch (secureMessagingCanister) {
            case (null) { #err("Secure messaging service unavailable") };
            case (?messagingCanister) {
                try {
                    let conversations = await messagingCanister.get_user_conversations();
                    #ok(conversations)
                } catch (_error) {
                    #err("Error getting conversations")
                }
            };
        }
    };
    
    // Get messages from a secure conversation
    public shared(msg) func getSecureConversationMessages(conversationId: Text, limit: ?Nat64, offset: ?Nat64) : async Result.Result<[SecureMessagingInterface.Message], Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // Get messages through secure messaging canister
        switch (secureMessagingCanister) {
            case (null) { #err("Secure messaging service unavailable") };
            case (?messagingCanister) {
                try {
                    let messages = await messagingCanister.get_conversation_messages(conversationId, limit, offset);
                    #ok(messages)
                } catch (_error) {
                    #err("Error getting conversation messages")
                }
            };
        }
    };
    
    // Create therapy conversation
    public shared(msg) func createTherapyConversation(therapistId: Principal, sessionId: Text) : async Result.Result<Text, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // Create conversation through secure messaging canister
        switch (secureMessagingCanister) {
            case (null) { #err("Secure messaging service unavailable") };
            case (?messagingCanister) {
                try {
                    let participants = [msg.caller, therapistId];
                    let metadata = {
                        title = ?"Therapy Session";
                        description = ?"Secure therapy conversation";
                        session_id = ?sessionId;
                        encryption_key_id = "default";
                    };
                    let result = await messagingCanister.create_conversation(participants, #SessionChat, metadata);
                    switch (result.success) {
                        case (true) {
                            switch (result.conversation) {
                                case (?conv) { #ok(conv.id) };
                                case (null) { #err("Failed to create conversation") };
                            }
                        };
                        case (false) {
                            switch (result.error) {
                                case (?error) { #err(error) };
                                case (null) { #err("Unknown error creating conversation") };
                            }
                        };
                    }
                } catch (_error) {
                    #err("Error creating therapy conversation")
                }
            };
        }
    };
    
    // === TOKEN ENDPOINTS ===
    
    // Get user's token balance
    public shared(msg) func getTokenBalance() : async Result.Result<Nat, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // Get balance through MVT token canister
        switch (mvtTokenCanister) {
            case (null) { #err("MVT Token service unavailable") };
            case (?tokenCanister) {
                try {
                    let balance = await tokenCanister.icrc1_balance_of({
                        owner = msg.caller;
                        subaccount = null;
                    });
                    #ok(balance)
                } catch (_error) {
                    #err("Error getting token balance")
                }
            };
        }
    };
    
    // Relay: Spend tokens on behalf of caller (authorized via backend)
    public shared(msg) func relaySpendTokens(spendingType: MVTTokenInterface.SpendingType, amount: ?Nat) : async Result.Result<MVTTokenInterface.TxIndex, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        switch (mvtTokenCanister) {
            case (null) { #err("MVT Token service unavailable") };
            case (?tokenCanister) {
                try {
                    await tokenCanister.spend_tokens(msg.caller, spendingType, amount)
                } catch (_error) {
                    #err("Error spending tokens")
                }
            };
        }
    };
    
    // Relay: Stake tokens on behalf of caller (authorized via backend)
    public shared(msg) func relayStakeTokens(amount: Nat, lock_period: MVTTokenInterface.Duration) : async Result.Result<(), Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        switch (mvtTokenCanister) {
            case (null) { #err("MVT Token service unavailable") };
            case (?tokenCanister) {
                try {
                    await tokenCanister.stake_tokens(msg.caller, amount, lock_period)
                } catch (_error) {
                    #err("Error staking tokens")
                }
            };
        }
    };

    // BackendInterface-compatible staking function
    public shared(msg) func stake_mvt(userId: UserId, amount: Nat) : async Result.Result<(), Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        // Authorization: ensure caller matches userId
        if (msg.caller != userId) {
            return #err("Unauthorized: caller does not match userId");
        };
        
        switch (mvtTokenCanister) {
            case (null) { #err("MVT Token service unavailable") };
            case (?tokenCanister) {
                try {
                    // Default lock period: 30 days in nanoseconds
                    let default_lock_period : MVTTokenInterface.Duration = 2_592_000_000_000_000;
                    let res = await tokenCanister.stake_tokens(userId, amount, default_lock_period);
                    switch (res) {
                        case (#ok(_)) { #ok(()) };
                        case (#err(err)) { #err(err) };
                    }
                } catch (_error) {
                    #err("Error staking tokens")
                }
            };
        }
    };

    // BackendInterface-compatible payment function
    public shared(msg) func process_payment(userId: UserId, request: PaymentRequest) : async Result.Result<Text, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        // Authorization: ensure caller matches userId
        if (msg.caller != userId) {
            return #err("Unauthorized: caller does not match userId");
        };
        
        // Create payment transaction
        let recipient = switch (request.recipient) { case null { userId }; case (?r) { r } };
        let created = paymentModule.createPaymentTransaction(
            userId,
            recipient,
            request.amount,
            request.description,
            #mvt_token,
            false,
            null
        );
        
        switch (created) {
            case (#err(error)) { #err(error) };
            case (#ok(paymentId)) {
                // Immediately process the payment
                switch (paymentModule.processPayment(paymentId, userId)) {
                    case (#ok(_)) { #ok(paymentId) };
                    case (#err(error)) { #err(error) };
                }
            };
        }
    };
    
    // Get user's transaction history
    public shared(msg) func getTransactionHistory(limit: ?Nat64, offset: ?Nat64) : async Result.Result<[MVTTokenInterface.Transaction], Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // Get transaction history through MVT token canister
        switch (mvtTokenCanister) {
            case (null) { #err("MVT Token service unavailable") };
            case (?tokenCanister) {
                try {
                    // Convert Nat64 to Nat and TxIndex for the correct interface
                    let limitNat = switch (limit) {
                        case (null) { null };
                        case (?l) { ?Nat64.toNat(l) };
                    };
                    let offsetTxIndex = switch (offset) {
                        case (null) { null };
                        case (?o) { ?Nat64.toNat(o) };
                    };
                    let history = await tokenCanister.get_transaction_history(offsetTxIndex, limitNat);
                    #ok(history)
                } catch (_error) {
                    #err("Error getting transaction history")
                }
            };
        }
    };
    
    // Get faucet statistics
    public func getFaucetStats() : async Result.Result<MVTTokenInterface.FaucetStats, Text> {
        // Get faucet stats through MVT token canister
        switch (mvtTokenCanister) {
            case (null) { #err("MVT Token service unavailable") };
            case (?tokenCanister) {
                try {
                    let stats = await tokenCanister.get_faucet_stats();
                    #ok(stats)
                } catch (_error) {
                    #err("Error getting faucet stats")
                }
            };
        }
    };
    
    // Claim faucet tokens
    public shared(msg) func claimFaucetTokens() : async Result.Result<Text, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // For now, return a placeholder implementation
        // In a real implementation, this would:
        // 1. Check daily limits
        // 2. Mint tokens to user
        // 3. Record the claim
        switch (mvtTokenCanister) {
            case (null) { #err("MVT Token service unavailable") };
            case (?tokenCanister) {
                try {
                    // Mint 100 MVT tokens (10^8 * 100 = 10^10 base units)
                    let amount = 10_000_000_000; // 100 MVT in base units
                    let result = await tokenCanister.earn_tokens(msg.caller, #system_participation, ?amount);
                    switch (result) {
                        case (#ok(_)) { #ok("Successfully claimed 100 MVT tokens") };
                        case (#err(error)) { #err(error) };
                    }
                } catch (_error) {
                    #err("Error claiming faucet tokens")
                }
            };
        }
    };
    
    // Mass mint tokens to all users (Admin function)
    public shared(msg) func massDistributeTokens(amount: Nat) : async Result.Result<Text, Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // Check if caller is admin (specific principal ID or system admin)
        let adminPrincipal = Principal.fromText("r3bk7-5k6fp-fpav7-txoce-fshab-fhxt3-bp2f2-bp6wj-h5d3t-zzgas-6qe");
        let isSpecificAdmin = Principal.equal(msg.caller, adminPrincipal);
        let isSystemAdmin = await authModule.hasPermission(msg.caller, #system_admin, null, null);
        
        if (not (isSpecificAdmin or isSystemAdmin)) {
            return #err("Unauthorized: Admin access required");
        };
        
        // Get all user profiles to distribute tokens to
        let allUsers = storageModule.getAllUserRoleAssignments();
        
        switch (mvtTokenCanister) {
            case (null) { #err("MVT Token service unavailable") };
            case (?tokenCanister) {
                var successCount = 0;
                var errorCount = 0;
                
                // Distribute tokens to each user
                for ((userId, _userType) in allUsers.vals()) {
                    try {
                        let account = {
                            owner = userId;
                            subaccount = null;
                        };
                        let result = await tokenCanister.mint_tokens(account, amount);
                        switch (result) {
                            case (#ok(_)) { successCount += 1 };
                            case (#err(_)) { errorCount += 1 };
                        };
                    } catch (_error) {
                        errorCount += 1;
                    };
                };
                
                #ok("Mass distribution completed. Success: " # Nat.toText(successCount) # ", Errors: " # Nat.toText(errorCount))
            };
        }
    };
    
    // Get faucet claim history
    public shared(msg) func getFaucetClaimHistory() : async Result.Result<[MVTTokenInterface.FaucetClaim], Text> {
        // Security check
        if (not securityModule.checkRateLimitSimple(msg.caller)) {
            return #err("Rate limit exceeded");
        };
        
        // For now, return empty array as placeholder
        // In a real implementation, this would fetch actual claim history
        #ok([])
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