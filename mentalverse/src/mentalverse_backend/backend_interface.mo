import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Time "mo:base/Time";

module {
    // === TYPE DEFINITIONS ===
    
    public type UserId = Principal;
    
    public type UserType = {
        #patient;
        #provider;
        #admin;
    };
    
    public type Permission = {
        #read;
        #write;
        #admin;
        #phi_access;
    };
    
    public type ValidationResult = {
        #valid;
        #invalid: Text;
    };
    
    public type PaymentStatus = {
        #pending;
        #completed;
        #failed: Text;
        #refunded;
    };
    
    public type EncryptedPHI = {
        data: Blob;
        keyId: Text;
        timestamp: Int;
    };
    
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
    
    public type UserProfile = {
        id: UserId;
        userType: UserType;
        email: Text;
        createdAt: Int;
        lastLogin: ?Int;
        permissions: [Permission];
        isActive: Bool;
    };
    
    public type StakingInfo = {
        user: UserId;
        stakedAmount: Nat;
        stakingStartTime: Int;
        estimatedRewards: Nat;
        canUnstake: Bool;
    };
    
    public type PaymentRequest = {
        amount: Nat;
        currency: Text;
        description: Text;
        recipient: ?UserId;
    };
    
    public type SecureMessage = {
        id: Text;
        sender: UserId;
        recipient: UserId;
        encryptedContent: EncryptedPHI;
        timestamp: Int;
        messageType: Text;
    };
    
    // === BACKEND CANISTER INTERFACE ===
    
    public type BackendCanisterInterface = actor {
        // System health and initialization
        initialize: () -> async Result.Result<Text, Text>;
        getSystemHealth: () -> async SystemHealth;
        
        // User management
        registerUser: (email: Text, userType: UserType) -> async Result.Result<UserId, Text>;
        getUserProfile: (userId: UserId) -> async Result.Result<UserProfile, Text>;
        updateUserProfile: (userId: UserId, email: ?Text, userType: ?UserType) -> async Result.Result<(), Text>;
        
        // Authentication
        authenticateUser: (userId: UserId) -> async Result.Result<Bool, Text>;
        checkPermission: (userId: UserId, permission: Permission) -> async Result.Result<Bool, Text>;
        
        // Staking operations
        stake_mvt: (userId: UserId, amount: Nat) -> async Result.Result<(), Text>;
        unstake_mvt: (userId: UserId, amount: Nat) -> async Result.Result<(), Text>;
        get_staking_info: (userId: UserId) -> async Result.Result<StakingInfo, Text>;
        
        // Payment processing
        process_payment: (userId: UserId, request: PaymentRequest) -> async Result.Result<Text, Text>;
        
        // Secure messaging
        send_secure_message: (sender: UserId, recipient: UserId, content: Text, messageType: Text) -> async Result.Result<Text, Text>;
        get_user_messages: (userId: UserId) -> async Result.Result<[SecureMessage], Text>;
        
        // Utility functions
        validateEmail: (email: Text) -> async ValidationResult;
        sanitizeText: (text: Text) -> async Text;
        getCanisterIds: () -> async [(Text, Principal)];
        isSystemInitialized: () -> async Bool;
        
        // Inter-canister setup
        setMVTTokenCanister: (canisterId: Principal) -> async Result.Result<(), Text>;
        setSecureMessagingCanister: (canisterId: Principal) -> async Result.Result<(), Text>;
    };
}