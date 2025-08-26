import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Nat8 "mo:base/Nat8";
import Option "mo:base/Option";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Float "mo:base/Float";

// MentalVerse Token (MVT) - ICRC-1 Compatible Token Implementation
// This module implements the MVT token with staking, rewards, and earning mechanisms

module {
  // ICRC-1 Standard Types
  public type Account = {
    owner : Principal;
    subaccount : ?[Nat8];
  };

  public type Balance = Nat;
  public type Timestamp = Nat64;
  public type Duration = Nat64;
  public type TxIndex = Nat;

  // Token Metadata (ICRC-1)
  public type TokenMetadata = {
    name : Text;
    symbol : Text;
    decimals : Nat8;
    fee : Nat;
    minting_account : ?Account;
    max_supply : ?Nat;
    min_burn_amount : ?Nat;
    max_memo : ?Nat;
    max_accounts : ?Nat;
    settle_to_accounts : ?Nat;
  };

  // Transfer Types
  public type TransferArgs = {
    from_subaccount : ?[Nat8];
    to : Account;
    amount : Nat;
    fee : ?Nat;
    memo : ?[Nat8];
    created_at_time : ?Timestamp;
  };

  public type TransferError = {
    #BadFee : { expected_fee : Nat };
    #BadBurn : { min_burn_amount : Nat };
    #InsufficientFunds : { balance : Nat };
    #TooOld;
    #CreatedInFuture : { ledger_time : Timestamp };
    #Duplicate : { duplicate_of : TxIndex };
    #TemporarilyUnavailable;
    #GenericError : { error_code : Nat; message : Text };
  };

  public type TransferResult = Result.Result<TxIndex, TransferError>;

  // MVT Specific Types
  public type StakeInfo = {
    amount : Nat;
    staked_at : Int;
    lock_period : Duration; // in nanoseconds
    reward_rate : Float; // annual percentage rate
    last_reward_claim : Int;
  };

  public type EarningType = {
    #appointment_completion;
    #platform_usage;
    #referral_bonus;
    #staking_reward;
    #doctor_consultation;
    #patient_feedback;
    #system_participation;
  };

  public type EarningRecord = {
    user_id : Principal;
    earning_type : EarningType;
    amount : Nat;
    timestamp : Int;
    description : Text;
  };

  public type SpendingType = {
    #premium_consultation;
    #advanced_features;
    #priority_booking;
    #extended_storage;
    #ai_insights;
    #telemedicine;
  };

  public type SpendingRecord = {
    user_id : Principal;
    spending_type : SpendingType;
    amount : Nat;
    timestamp : Int;
    description : Text;
  };

  // Token Configuration
  public let TOKEN_METADATA : TokenMetadata = {
    name = "MentalVerse Token";
    symbol = "MVT";
    decimals = 8;
    fee = 10000; // 0.0001 MVT
    minting_account = null; // Will be set to canister principal
    max_supply = ?1000000000000000; // 10M MVT with 8 decimals
    min_burn_amount = ?10000; // 0.0001 MVT
    max_memo = ?64;
    max_accounts = null;
    settle_to_accounts = null;
  };

  // Staking Configuration
  public let STAKING_CONFIG = {
    min_stake_amount = 100000000; // 1 MVT minimum
    lock_periods = [
      (2592000000000000 : Nat64, 5.0), // 30 days, 5% APR
      (7776000000000000 : Nat64, 8.0), // 90 days, 8% APR
      (15552000000000000 : Nat64, 12.0), // 180 days, 12% APR
      (31536000000000000 : Nat64, 18.0), // 365 days, 18% APR
    ];
  };

  // Earning Rates (in MVT with 8 decimals)
  public let EARNING_RATES = {
    appointment_completion = 50000000; // 0.5 MVT
    platform_usage_daily = 10000000; // 0.1 MVT per day
    referral_bonus = 500000000; // 5 MVT per referral
    doctor_consultation_fee = 20000000; // 0.2 MVT per consultation
    patient_feedback = 5000000; // 0.05 MVT per feedback
    system_participation = 25000000; // 0.25 MVT for various activities
  };

  // Spending Costs (in MVT with 8 decimals)
  public let SPENDING_COSTS = {
    premium_consultation = 200000000; // 2 MVT
    advanced_features_monthly = 100000000; // 1 MVT per month
    priority_booking = 50000000; // 0.5 MVT per booking
    extended_storage_monthly = 30000000; // 0.3 MVT per month
    ai_insights = 75000000; // 0.75 MVT per insight
    telemedicine_session = 150000000; // 1.5 MVT per session
  };

  // Helper Functions
  public func account_eq(a1 : Account, a2 : Account) : Bool {
    Principal.equal(a1.owner, a2.owner) and a1.subaccount == a2.subaccount
  };

  public func account_hash(account : Account) : Nat32 {
    switch (account.subaccount) {
      case null { Principal.hash(account.owner) };
      case (?subaccount) {
        // Simple hash combination
        Principal.hash(account.owner) ^ Array.foldLeft<Nat8, Nat32>(subaccount, 0, func(acc, x) = acc * 31 + Nat32.fromNat(Nat8.toNat(x)))
      };
    }
  };

  public func calculate_staking_reward(stake : StakeInfo, current_time : Int) : Nat {
    let time_diff = current_time - stake.last_reward_claim;
    let years = Float.fromInt(time_diff) / 31536000000000000.0; // nanoseconds in a year
    let reward = Float.fromInt(stake.amount) * (stake.reward_rate / 100.0) * years;
    Int.abs(Float.toInt(reward))
  };

  public func get_lock_period_rate(lock_period : Duration) : ?Float {
    Array.find<(Duration, Float)>(STAKING_CONFIG.lock_periods, func((period, rate)) = period == lock_period)
    |> Option.map<(Duration, Float), Float>(_, func((_, rate)) = rate)
  };

  public func validate_transfer_args(args : TransferArgs, _caller : Principal, current_time : Timestamp) : Result.Result<(), TransferError> {
    // Validate fee
    switch (args.fee) {
      case (?fee) {
        if (fee != TOKEN_METADATA.fee) {
          return #err(#BadFee({ expected_fee = TOKEN_METADATA.fee }));
        };
      };
      case null {};
    };

    // Validate timestamp
    switch (args.created_at_time) {
      case (?timestamp) {
        let drift_ns : Nat64 = 60000000000; // 60 seconds in nanoseconds
        if (timestamp + drift_ns < current_time) {
          return #err(#TooOld);
        };
        if (timestamp > current_time + drift_ns) {
          return #err(#CreatedInFuture({ ledger_time = current_time }));
        };
      };
      case null {};
    };

    #ok(())
  };

  // Transaction History Types
  public type Transaction = {
    index : TxIndex;
    timestamp : Timestamp;
    operation : {
      #transfer : {
        from : Account;
        to : Account;
        amount : Nat;
        fee : Nat;
      };
      #mint : {
        to : Account;
        amount : Nat;
      };
      #burn : {
        from : Account;
        amount : Nat;
      };
      #earn : {
        to : Account;
        amount : Nat;
        earning_type : EarningType;
      };
      #spend : {
        from : Account;
        amount : Nat;
        spending_type : SpendingType;
      };
      #stake : {
        from : Account;
        amount : Nat;
        lock_period : Duration;
      };
      #unstake : {
        to : Account;
        amount : Nat;
        reward : Nat;
      };
    };
  };

  // Utility functions for account management
  public func default_account(owner : Principal) : Account {
    { owner = owner; subaccount = null }
  };

  public func subaccount_account(owner : Principal, subaccount : [Nat8]) : Account {
    { owner = owner; subaccount = ?subaccount }
  };
}