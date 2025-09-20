import Principal "mo:base/Principal";
import Result "mo:base/Result";
import MVTToken "./mvt_token";

module {
    // Import types from MVT Token module
    public type Account = MVTToken.Account;
    public type Balance = MVTToken.Balance;
    public type TransferArgs = MVTToken.TransferArgs;
    public type TransferResult = MVTToken.TransferResult;
    public type StakeInfo = MVTToken.StakeInfo;
    public type EarningType = MVTToken.EarningType;
    public type EarningRecord = MVTToken.EarningRecord;
    public type SpendingType = MVTToken.SpendingType;
    public type SpendingRecord = MVTToken.SpendingRecord;
    public type Transaction = MVTToken.Transaction;
    public type TxIndex = MVTToken.TxIndex;
    public type Duration = MVTToken.Duration;

    // Faucet statistics type
    public type FaucetStats = {
        total_claims : Nat;
        total_distributed : Nat;
        daily_limit : Nat;
        remaining_today : Nat;
        last_reset : Int;
    };

    // Inter-canister communication interface for MVT Token Canister
    public type MVTTokenCanisterInterface = actor {
        // ICRC-1 Standard Functions
        icrc1_name : () -> async Text;
        icrc1_symbol : () -> async Text;
        icrc1_decimals : () -> async Nat8;
        icrc1_fee : () -> async Nat;
        icrc1_total_supply : () -> async Nat;
        icrc1_balance_of : (Account) -> async Nat;
        icrc1_transfer : (TransferArgs) -> async TransferResult;
        
        // Token Management Functions
        mint_tokens : (Account, Nat) -> async Result.Result<TxIndex, Text>;
        burn_tokens : (Account, Nat) -> async Result.Result<TxIndex, Text>;
        enhanced_burn_tokens : (Account, Nat, Text) -> async Result.Result<TxIndex, Text>;
        
        // Earning and Spending Functions
        earn_tokens : (Principal, EarningType, ?Nat) -> async Result.Result<TxIndex, Text>;
        spend_tokens : (Principal, SpendingType, ?Nat) -> async Result.Result<TxIndex, Text>;
        
        // Staking Functions
        stake_tokens : (Principal, Nat, Duration) -> async Result.Result<(), Text>;
        unstake_tokens : (Principal) -> async Result.Result<Nat, Text>;
        claim_staking_rewards : (Principal) -> async Result.Result<Nat, Text>;
        
        // Query Functions
        get_user_stake : (Principal) -> async ?StakeInfo;
        get_user_earning_history : (Principal) -> async [EarningRecord];
        get_user_spending_history : (Principal) -> async [SpendingRecord];
        get_transaction_history : (?TxIndex, ?Nat) -> async [Transaction];
        get_reward_eligibility : (Principal) -> async Bool;
        get_user_activity_status : (Principal) -> async ?Int;
        
        // Activity and Rewards
        mark_user_active : (Principal) -> async Result.Result<(), Text>;
        distribute_daily_rewards : () -> async Result.Result<Nat, Text>;
        
        // Admin Functions
        add_authorized_canister : (Principal) -> async Result.Result<(), Text>;
        
        // Statistics and Info
        get_canister_call_stats : () -> async [(Principal, Nat)];
        get_staking_info : () -> async {
            total_staked : Nat;
            total_stakers : Nat;
            average_stake : Nat;
        };
        get_earning_rates : () -> async {
            session_completion : Nat;
            daily_login : Nat;
            referral : Nat;
            achievement : Nat;
        };
        get_spending_costs : () -> async {
            session_booking : Nat;
            premium_features : Nat;
            marketplace : Nat;
        };
        
        // Faucet Functions
        get_faucet_stats : () -> async FaucetStats;
        
        // Health Check
        health_check : () -> async {
            status : Text;
            total_supply : Nat;
            total_accounts : Nat;
        };
    };

    // Helper function to get MVT Token Canister actor reference
    public func getMVTTokenCanister(canister_id: Principal) : MVTTokenCanisterInterface {
        actor(Principal.toText(canister_id)) : MVTTokenCanisterInterface
    };
}