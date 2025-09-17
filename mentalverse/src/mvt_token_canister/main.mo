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
import _Debug "mo:base/Debug";
import Float "mo:base/Float";
import _Buffer "mo:base/Buffer";
import Char "mo:base/Char";

import MVTToken "../mentalverse_backend/mvt_token";

persistent actor MVTTokenCanister {
  // Import types from MVT Token module
  type Account = MVTToken.Account;
  type Balance = MVTToken.Balance;
  type TransferArgs = MVTToken.TransferArgs;
  type TransferResult = MVTToken.TransferResult;
  type TransferError = MVTToken.TransferError;
  type StakeInfo = MVTToken.StakeInfo;
  type EarningType = MVTToken.EarningType;
  type EarningRecord = MVTToken.EarningRecord;
  type SpendingType = MVTToken.SpendingType;
  type SpendingRecord = MVTToken.SpendingRecord;
  type Transaction = MVTToken.Transaction;
  type TxIndex = MVTToken.TxIndex;
  type Timestamp = MVTToken.Timestamp;
  type Duration = MVTToken.Duration;

  // Phase 2: Security types and storage
  type RateLimit = {
    principal: Principal;
    call_count: Nat;
    window_start: Int;
    window_duration: Int; // in nanoseconds
  };

  // Stable storage for upgrades
  private var balancesEntries : [(Account, Balance)] = [];
  private var stakesEntries : [(Principal, StakeInfo)] = [];
  private var transactionsEntries : [(TxIndex, Transaction)] = [];
  private var earningRecordsEntries : [(Text, EarningRecord)] = [];
  private var spendingRecordsEntries : [(Text, SpendingRecord)] = [];
  private var rateLimitsEntries : [(Principal, RateLimit)] = [];
  private var usedNoncesEntries : [(Text, Int)] = [];
  private var totalSupply : Nat = 0;
  private var nextTxIndex : TxIndex = 0;
  private var minting_account : Account = { owner = Principal.fromText("2vxsx-fae"); subaccount = null };

  // Runtime storage
  private transient var balances = HashMap.HashMap<Account, Balance>(100, MVTToken.account_eq, MVTToken.account_hash);
  private transient var stakes = HashMap.HashMap<Principal, StakeInfo>(50, Principal.equal, Principal.hash);
  private transient var transactions = HashMap.HashMap<TxIndex, Transaction>(1000, Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n % (2**32)) });
  private transient var earningRecords = HashMap.HashMap<Text, EarningRecord>(500, Text.equal, Text.hash);
  private transient var spendingRecords = HashMap.HashMap<Text, SpendingRecord>(500, Text.equal, Text.hash);
  private transient var rateLimits = HashMap.HashMap<Principal, RateLimit>(100, Principal.equal, Principal.hash);
  private transient var usedNonces = HashMap.HashMap<Text, Int>(1000, Text.equal, Text.hash);
  
  // Automated rewards tracking
  private transient var lastDailyRewardTime : Int = 0;
  private transient var activeUsers = HashMap.HashMap<Principal, Int>(100, Principal.equal, Principal.hash);
  private transient var rewardEligibleUsers = HashMap.HashMap<Principal, Bool>(100, Principal.equal, Principal.hash);
  
  // Inter-canister security guards
  private transient var authorizedCanisters = HashMap.HashMap<Principal, Bool>(10, Principal.equal, Principal.hash);
  private transient var canisterCallCounts = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);

  // Phase 2: Security constants
  private let MAX_CALLS_PER_MINUTE : Nat = 30;
  private let NONCE_EXPIRY_NS : Int = 300_000_000_000; // 5 minutes in nanoseconds
  private let MAX_TEXT_LENGTH : Nat = 1000;

  // Initialize authorized canisters
  private func init_authorized_canisters() {
    let mentalverse_backend = Principal.fromText("cytcv-raaaa-aaaac-a4aoa-cai");
    authorizedCanisters.put(mentalverse_backend, true);
  };

  // Initialize minting account to canister principal
  private func init() {
    // Use a placeholder principal for now - will be set properly in postupgrade
    minting_account := { owner = Principal.fromText("2vxsx-fae"); subaccount = null };
    init_authorized_canisters();
  };

  // System upgrade hooks
  system func preupgrade() {
    balancesEntries := Iter.toArray(balances.entries());
    stakesEntries := Iter.toArray(stakes.entries());
    transactionsEntries := Iter.toArray(transactions.entries());
    earningRecordsEntries := Iter.toArray(earningRecords.entries());
    spendingRecordsEntries := Iter.toArray(spendingRecords.entries());
    
    // Phase 2: Save security data
    rateLimitsEntries := Iter.toArray(rateLimits.entries());
    usedNoncesEntries := Iter.toArray(usedNonces.entries());
  };

  system func postupgrade() {
    balances := HashMap.fromIter<Account, Balance>(balancesEntries.vals(), balancesEntries.size(), MVTToken.account_eq, MVTToken.account_hash);
    stakes := HashMap.fromIter<Principal, StakeInfo>(stakesEntries.vals(), stakesEntries.size(), Principal.equal, Principal.hash);
    transactions := HashMap.fromIter<TxIndex, Transaction>(transactionsEntries.vals(), transactionsEntries.size(), Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n % (2**32)) });
    earningRecords := HashMap.fromIter<Text, EarningRecord>(earningRecordsEntries.vals(), earningRecordsEntries.size(), Text.equal, Text.hash);
    spendingRecords := HashMap.fromIter<Text, SpendingRecord>(spendingRecordsEntries.vals(), spendingRecordsEntries.size(), Text.equal, Text.hash);
    
    // Phase 2: Restore security data
    rateLimits := HashMap.fromIter<Principal, RateLimit>(rateLimitsEntries.vals(), rateLimitsEntries.size(), Principal.equal, Principal.hash);
    usedNonces := HashMap.fromIter<Text, Int>(usedNoncesEntries.vals(), usedNoncesEntries.size(), Text.equal, Text.hash);
    
    balancesEntries := [];
    stakesEntries := [];
    transactionsEntries := [];
    earningRecordsEntries := [];
    spendingRecordsEntries := [];
    rateLimitsEntries := [];
    usedNoncesEntries := [];
    
    init();
    init_authorized_canisters();
  };

  // Initialize on first deployment will be done after all functions are defined

  // Phase 2: Security validation functions
  private func check_rate_limit(caller: Principal) : Bool {
    let now = Time.now();
    let window_duration = 60_000_000_000; // 1 minute in nanoseconds
    
    switch (rateLimits.get(caller)) {
      case (?limit) {
        if (now - limit.window_start > window_duration) {
          // Reset window
          let new_limit = {
            principal = caller;
            call_count = 1;
            window_start = now;
            window_duration = window_duration;
          };
          rateLimits.put(caller, new_limit);
          true
        } else if (limit.call_count >= MAX_CALLS_PER_MINUTE) {
          false
        } else {
          // Increment count
          let updated_limit = {
            principal = caller;
            call_count = limit.call_count + 1;
            window_start = limit.window_start;
            window_duration = window_duration;
          };
          rateLimits.put(caller, updated_limit);
          true
        }
      };
      case null {
        // First call from this principal
        let new_limit = {
          principal = caller;
          call_count = 1;
          window_start = now;
          window_duration = window_duration;
        };
        rateLimits.put(caller, new_limit);
        true
      };
    }
  };

  private func _validate_nonce(nonce: Text, timestamp: Int) : Bool {
    let now = Time.now();
    
    // Check if nonce is already used
    switch (usedNonces.get(nonce)) {
      case (?_) { return false }; // Nonce already used
      case null {};
    };
    
    // Check timestamp validity (within 5 minutes)
    if (Int.abs(now - timestamp) > NONCE_EXPIRY_NS) {
      return false;
    };
    
    // Store nonce
    usedNonces.put(nonce, timestamp);
    
    // Clean up expired nonces (simple cleanup)
    let entries = Iter.toArray(usedNonces.entries());
    for ((stored_nonce, stored_time) in entries.vals()) {
      if (Int.abs(now - stored_time) > NONCE_EXPIRY_NS) {
        usedNonces.delete(stored_nonce);
      };
    };
    
    true
  };

  private func sanitize_text(text: Text) : Text {
    let chars = Text.toIter(text);
    let sanitized = _Buffer.Buffer<Char>(Text.size(text));
    
    for (char in chars) {
      if (Char.isAlphabetic(char) or Char.isDigit(char) or char == ' ' or char == '.' or char == ',' or char == '-' or char == '_') {
        sanitized.add(char);
      };
    };
    
    let result = Text.fromIter(sanitized.vals());
    if (Text.size(result) > MAX_TEXT_LENGTH) {
      let chars = Iter.toArray(result.chars());
      let truncated = Array.take(chars, MAX_TEXT_LENGTH);
      Text.fromIter(truncated.vals())
    } else {
      result
    }
  };

  // ICRC-1 Standard Functions
  
  public query func icrc1_name() : async Text {
    MVTToken.TOKEN_METADATA.name
  };

  public query func icrc1_symbol() : async Text {
    MVTToken.TOKEN_METADATA.symbol
  };

  public query func icrc1_decimals() : async Nat8 {
    MVTToken.TOKEN_METADATA.decimals
  };

  public query func icrc1_fee() : async Nat {
    MVTToken.TOKEN_METADATA.fee
  };

  public query func icrc1_metadata() : async [(Text, { #Text : Text; #Nat : Nat })] {
    [
      ("icrc1:name", #Text(MVTToken.TOKEN_METADATA.name)),
      ("icrc1:symbol", #Text(MVTToken.TOKEN_METADATA.symbol)),
      ("icrc1:decimals", #Nat(Nat8.toNat(MVTToken.TOKEN_METADATA.decimals))),
      ("icrc1:fee", #Nat(MVTToken.TOKEN_METADATA.fee)),
      ("icrc1:max_supply", #Nat(Option.get(MVTToken.TOKEN_METADATA.max_supply, 0))),
    ]
  };

  public query func icrc1_total_supply() : async Nat {
    totalSupply
  };

  public query func icrc1_minting_account() : async ?Account {
    ?minting_account
  };

  public query func icrc1_balance_of(account : Account) : async Nat {
    Option.get(balances.get(account), 0)
  };

  public shared(msg) func icrc1_transfer(args : TransferArgs) : async TransferResult {
    let caller = msg.caller;
    
    // Phase 2: Security validations
    if (not check_rate_limit(caller)) {
      return #err(#TemporarilyUnavailable);
    };
    
    let from_account = { owner = caller; subaccount = args.from_subaccount };
    let current_time = Nat64.fromNat(Int.abs(Time.now()));
    
    // Validate transfer arguments
    switch (MVTToken.validate_transfer_args(args, caller, current_time)) {
      case (#err(error)) { return #err(error) };
      case (#ok()) {};
    };
    
    let from_balance = Option.get(balances.get(from_account), 0);
    let fee = Option.get(args.fee, MVTToken.TOKEN_METADATA.fee);
    let total_amount = args.amount + fee;
    
    if (from_balance < total_amount) {
      return #err(#InsufficientFunds({ balance = from_balance }));
    };
    
    // Perform transfer with safe arithmetic
    let new_from_balance = switch (from_balance >= total_amount) {
      case (true) Nat.sub(from_balance, total_amount);
      case (false) return #err(#InsufficientFunds({ balance = from_balance }));
    };
    let to_balance = Option.get(balances.get(args.to), 0);
    let new_to_balance = to_balance + args.amount;
    
    balances.put(from_account, new_from_balance);
    balances.put(args.to, new_to_balance);
    
    // Record transaction
    let tx : Transaction = {
      index = nextTxIndex;
      timestamp = current_time;
      operation = #transfer({
        from = from_account;
        to = args.to;
        amount = args.amount;
        fee = fee;
      });
    };
    
    transactions.put(nextTxIndex, tx);
    let result_index = nextTxIndex;
    nextTxIndex += 1;
    
    #ok(result_index)
  };

  // MVT Specific Functions
  
  public shared(msg) func mint_tokens(to : Account, amount : Nat) : async Result.Result<TxIndex, Text> {
    let caller = msg.caller;
    
    // Phase 2: Security validations
    if (not check_rate_limit(caller)) {
      return #err("Rate limit exceeded");
    };
    
    let mentalverse_backend_principal = Principal.fromText("cytcv-raaaa-aaaac-a4aoa-cai");
    
    // Only mentalverse_backend canister can mint
    if (caller != mentalverse_backend_principal) {
      return #err("Unauthorized: Only mentalverse_backend canister can mint tokens");
    };
    
    // Check max supply
    switch (MVTToken.TOKEN_METADATA.max_supply) {
      case (?max_supply) {
        if (totalSupply + amount > max_supply) {
          return #err("Exceeds maximum supply");
        };
      };
      case null {};
    };
    
    let current_balance = Option.get(balances.get(to), 0);
    balances.put(to, current_balance + amount);
    totalSupply += amount;
    
    // Record transaction
    let tx : Transaction = {
      index = nextTxIndex;
      timestamp = Nat64.fromNat(Int.abs(Time.now()));
      operation = #mint({
        to = to;
        amount = amount;
      });
    };
    
    transactions.put(nextTxIndex, tx);
    let result_index = nextTxIndex;
    nextTxIndex += 1;
    
    #ok(result_index)
  };

  public shared(msg) func burn_tokens(from : Account, amount : Nat) : async Result.Result<TxIndex, Text> {
    let caller = msg.caller;
    
    // Phase 2: Security validations
    if (not check_rate_limit(caller)) {
      return #err("Rate limit exceeded");
    };
    
    // Only account owner can burn their tokens
    if (from.owner != caller) {
      return #err("Unauthorized: Can only burn own tokens");
    };
    
    let current_balance = Option.get(balances.get(from), 0);
    if (current_balance < amount) {
      return #err("Insufficient balance");
    };
    
    // Check minimum burn amount
    switch (MVTToken.TOKEN_METADATA.min_burn_amount) {
      case (?min_burn) {
        if (amount < min_burn) {
          return #err("Amount below minimum burn threshold");
        };
      };
      case null {};
    };
    
    balances.put(from, Nat.sub(current_balance, amount));
     totalSupply := Nat.sub(totalSupply, amount);
    
    // Record transaction
    let tx : Transaction = {
      index = nextTxIndex;
      timestamp = Nat64.fromNat(Int.abs(Time.now()));
      operation = #burn({
        from = from;
        amount = amount;
      });
    };
    
    transactions.put(nextTxIndex, tx);
    let result_index = nextTxIndex;
    nextTxIndex += 1;
    
    #ok(result_index)
  };

  // Earning System
  public shared(msg) func earn_tokens(user : Principal, earning_type : EarningType, custom_amount : ?Nat) : async Result.Result<TxIndex, Text> {
    let caller = msg.caller;
    
    // Phase 2: Security validations
    if (not check_rate_limit(caller)) {
      return #err("Rate limit exceeded");
    };
    
    let mentalverse_backend_principal = Principal.fromText("cytcv-raaaa-aaaac-a4aoa-cai");
    
    // Only mentalverse_backend canister can call this function
    if (caller != mentalverse_backend_principal) {
      return #err("Unauthorized: Only mentalverse_backend canister can earn tokens");
    };
    let amount = switch (custom_amount) {
      case (?amt) amt;
      case null {
        switch (earning_type) {
          case (#appointment_completion) MVTToken.EARNING_RATES.appointment_completion;
          case (#platform_usage) MVTToken.EARNING_RATES.platform_usage_daily;
          case (#referral_bonus) MVTToken.EARNING_RATES.referral_bonus;
          case (#doctor_consultation) MVTToken.EARNING_RATES.doctor_consultation_fee;
          case (#patient_feedback) MVTToken.EARNING_RATES.patient_feedback;
          case (#system_participation) MVTToken.EARNING_RATES.system_participation;
          case (_) MVTToken.EARNING_RATES.system_participation;
        }
      };
    };
    
    let to_account = MVTToken.default_account(user);
    
    // Mint tokens to user
    switch (await mint_tokens(to_account, amount)) {
      case (#err(error)) { return #err(error) };
      case (#ok(tx_index)) {
        // Record earning
        let earning_id = Principal.toText(user) # "_" # Int.toText(Time.now());
        let earning_record : EarningRecord = {
          user_id = user;
          earning_type = earning_type;
          amount = amount;
          timestamp = Time.now();
          description = "Tokens earned for " # debug_show(earning_type);
        };
        
        earningRecords.put(earning_id, earning_record);
        
        // Record as earning transaction
        let tx : Transaction = {
          index = nextTxIndex;
          timestamp = Nat64.fromNat(Int.abs(Time.now()));
          operation = #earn({
            to = to_account;
            amount = amount;
            earning_type = earning_type;
          });
        };
        
        transactions.put(nextTxIndex, tx);
        nextTxIndex += 1;
        
        #ok(tx_index)
      };
    }
  };

  // Spending System
  public shared(msg) func spend_tokens(user : Principal, spending_type : SpendingType, custom_amount : ?Nat) : async Result.Result<TxIndex, Text> {
    let caller = msg.caller;
    
    // Phase 2: Security validations
    if (not check_rate_limit(caller)) {
      return #err("Rate limit exceeded");
    };
    
    let mentalverse_backend_principal = Principal.fromText("cytcv-raaaa-aaaac-a4aoa-cai");
    
    // Only mentalverse_backend canister can call this function
    if (caller != mentalverse_backend_principal) {
      return #err("Unauthorized: Only mentalverse_backend canister can spend tokens");
    };
    let amount = switch (custom_amount) {
      case (?amt) amt;
      case null {
        switch (spending_type) {
          case (#premium_consultation) MVTToken.SPENDING_COSTS.premium_consultation;
          case (#advanced_features) MVTToken.SPENDING_COSTS.advanced_features_monthly;
          case (#priority_booking) MVTToken.SPENDING_COSTS.priority_booking;
          case (#extended_storage) MVTToken.SPENDING_COSTS.extended_storage_monthly;
          case (#ai_insights) MVTToken.SPENDING_COSTS.ai_insights;
          case (#telemedicine) MVTToken.SPENDING_COSTS.telemedicine_session;
        }
      };
    };
    
    let from_account = MVTToken.default_account(user);
    
    // Burn tokens from user
    switch (await burn_tokens(from_account, amount)) {
      case (#err(error)) { return #err(error) };
      case (#ok(tx_index)) {
        // Record spending
        let spending_id = Principal.toText(user) # "_" # Int.toText(Time.now());
        let spending_record : SpendingRecord = {
          user_id = user;
          spending_type = spending_type;
          amount = amount;
          timestamp = Time.now();
          description = "Tokens spent on " # debug_show(spending_type);
        };
        
        spendingRecords.put(spending_id, spending_record);
        
        // Record as spending transaction
        let tx : Transaction = {
          index = nextTxIndex;
          timestamp = Nat64.fromNat(Int.abs(Time.now()));
          operation = #spend({
            from = from_account;
            amount = amount;
            spending_type = spending_type;
          });
        };
        
        transactions.put(nextTxIndex, tx);
        nextTxIndex += 1;
        
        #ok(tx_index)
      };
    }
  };

  // Staking System
  public shared(msg) func stake_tokens(user : Principal, amount : Nat, lock_period : Duration) : async Result.Result<(), Text> {
    let caller = msg.caller;
    
    // Phase 2: Security validations
    if (not check_rate_limit(caller)) {
      return #err("Rate limit exceeded");
    };
    
    let mentalverse_backend_principal = Principal.fromText("cytcv-raaaa-aaaac-a4aoa-cai");
    
    // Only mentalverse_backend canister can call this function
    if (caller != mentalverse_backend_principal) {
      return #err("Unauthorized: Only mentalverse_backend canister can stake tokens");
    };
    if (amount < MVTToken.STAKING_CONFIG.min_stake_amount) {
      return #err("Amount below minimum stake requirement");
    };
    
    let reward_rate = switch (MVTToken.get_lock_period_rate(lock_period)) {
      case (?rate) rate;
      case null { return #err("Invalid lock period") };
    };
    
    let from_account = MVTToken.default_account(user);
    let current_balance = Option.get(balances.get(from_account), 0);
    
    if (current_balance < amount) {
      return #err("Insufficient balance for staking");
    };
    
    // Check if user already has an active stake
    switch (stakes.get(user)) {
      case (?_existing_stake) {
        return #err("User already has an active stake");
      };
      case null {};
    };
    
    // Deduct tokens from balance
     balances.put(from_account, Nat.sub(current_balance, amount));
    
    // Create stake record
    let stake_info : StakeInfo = {
      amount = amount;
      staked_at = Time.now();
      lock_period = lock_period;
      reward_rate = reward_rate;
      last_reward_claim = Time.now();
    };
    
    stakes.put(user, stake_info);
    
    // Record transaction
    let tx : Transaction = {
      index = nextTxIndex;
      timestamp = Nat64.fromNat(Int.abs(Time.now()));
      operation = #stake({
        from = from_account;
        amount = amount;
        lock_period = lock_period;
      });
    };
    
    transactions.put(nextTxIndex, tx);
    nextTxIndex += 1;
    
    #ok(())
  };

  public shared(msg) func unstake_tokens(user : Principal) : async Result.Result<Nat, Text> {
    let caller = msg.caller;
    
    // Phase 2: Security validations
    if (not check_rate_limit(caller)) {
      return #err("Rate limit exceeded");
    };
    
    let mentalverse_backend_principal = Principal.fromText("cytcv-raaaa-aaaac-a4aoa-cai");
    
    // Only mentalverse_backend canister can call this function
    if (caller != mentalverse_backend_principal) {
      return #err("Unauthorized: Only mentalverse_backend canister can unstake tokens");
    };
    
    let stake_info = switch (stakes.get(user)) {
      case (?stake) stake;
      case null { return #err("No active stake found") };
    };
    
    let current_time = Time.now();
    let lock_end_time = stake_info.staked_at + Int.abs(Nat64.toNat(stake_info.lock_period));
    
    if (current_time < lock_end_time) {
      return #err("Stake is still locked");
    };
    
    // Calculate final rewards
    let reward = MVTToken.calculate_staking_reward(stake_info, current_time);
    let total_return = stake_info.amount + reward;
    
    let to_account = MVTToken.default_account(user);
    let current_balance = Option.get(balances.get(to_account), 0);
    
    // Return staked tokens plus rewards
    balances.put(to_account, current_balance + total_return);
    totalSupply += reward; // Only add reward to total supply
    
    // Remove stake
    stakes.delete(user);
    
    // Record transaction
    let tx : Transaction = {
      index = nextTxIndex;
      timestamp = Nat64.fromNat(Int.abs(Time.now()));
      operation = #unstake({
        to = to_account;
        amount = stake_info.amount;
        reward = reward;
      });
    };
    
    transactions.put(nextTxIndex, tx);
    nextTxIndex += 1;
    
    #ok(total_return)
  };

  public shared(msg) func claim_staking_rewards(user : Principal) : async Result.Result<Nat, Text> {
    let caller = msg.caller;
    
    // Phase 2: Security validations
    if (not check_rate_limit(caller)) {
      return #err("Rate limit exceeded");
    };
    
    let mentalverse_backend_principal = Principal.fromText("cytcv-raaaa-aaaac-a4aoa-cai");
    
    // Only mentalverse_backend canister can call this function
    if (caller != mentalverse_backend_principal) {
      return #err("Unauthorized: Only mentalverse_backend canister can claim rewards");
    };
    let stake_info = switch (stakes.get(user)) {
      case (?stake) stake;
      case null { return #err("No active stake found") };
    };
    
    let current_time = Time.now();
    let reward = MVTToken.calculate_staking_reward(stake_info, current_time);
    
    if (reward == 0) {
      return #err("No rewards available to claim");
    };
    
    let to_account = MVTToken.default_account(user);
    let current_balance = Option.get(balances.get(to_account), 0);
    
    // Add rewards to balance
    balances.put(to_account, current_balance + reward);
    totalSupply += reward;
    
    // Update stake info
    let updated_stake : StakeInfo = {
      amount = stake_info.amount;
      staked_at = stake_info.staked_at;
      lock_period = stake_info.lock_period;
      reward_rate = stake_info.reward_rate;
      last_reward_claim = current_time;
    };
    
    stakes.put(user, updated_stake);
    
    #ok(reward)
  };

  // Query Functions
  public query func get_user_stake(user : Principal) : async ?StakeInfo {
    stakes.get(user)
  };

  public query func get_user_earning_history(user : Principal) : async [EarningRecord] {
    let _user_text = Principal.toText(user);
    Array.filter<EarningRecord>(
      Iter.toArray(earningRecords.vals()),
      func(record) = record.user_id == user
    )
  };

  public query func get_user_spending_history(user : Principal) : async [SpendingRecord] {
    let _user_text = Principal.toText(user);
    Array.filter<SpendingRecord>(
      Iter.toArray(spendingRecords.vals()),
      func(record) = record.user_id == user
    )
  };

  public query func get_transaction_history(start : ?TxIndex, limit : ?Nat) : async [Transaction] {
    let start_index = Option.get(start, 0);
    let max_limit = Option.get(limit, 100);
    let all_transactions = Iter.toArray(transactions.vals());
    
    if (start_index >= all_transactions.size()) {
      return [];
    };
    
    let remaining = switch (all_transactions.size() >= start_index) {
      case (true) Nat.sub(all_transactions.size(), start_index);
      case (false) 0;
    };
    Array.subArray<Transaction>(all_transactions, start_index, Nat.min(max_limit, remaining))
  };

  // ===== AUTOMATED REWARDS SYSTEM =====
  

  
  // Inter-canister security guard
  private func check_canister_authorization(caller: Principal) : Bool {
    switch (authorizedCanisters.get(caller)) {
      case (?authorized) authorized;
      case null false;
    }
  };
  
  // Track canister call frequency for additional security
  private func increment_canister_calls(caller: Principal) {
    let current_count = Option.get(canisterCallCounts.get(caller), 0);
    canisterCallCounts.put(caller, current_count + 1);
  };
  
  // Mark user as active for reward eligibility
  public shared(msg) func mark_user_active(user: Principal) : async Result.Result<(), Text> {
    let caller = msg.caller;
    
    if (not check_canister_authorization(caller)) {
      return #err("Unauthorized canister");
    };
    
    increment_canister_calls(caller);
    
    let current_time = Time.now();
    activeUsers.put(user, current_time);
    rewardEligibleUsers.put(user, true);
    
    #ok(())
  };
  
  // Distribute daily rewards to active users
  public shared(msg) func distribute_daily_rewards() : async Result.Result<Nat, Text> {
    let caller = msg.caller;
    
    if (not check_canister_authorization(caller)) {
      return #err("Unauthorized canister");
    };
    
    let current_time = Time.now();
    let one_day_ns = 24 * 60 * 60 * 1_000_000_000; // 24 hours in nanoseconds
    
    // Check if 24 hours have passed since last reward distribution
    if (current_time - lastDailyRewardTime < one_day_ns) {
      return #err("Daily rewards already distributed today");
    };
    
    let daily_reward_amount = MVTToken.EARNING_RATES.platform_usage_daily;
    var rewards_distributed = 0;
    
    // Distribute rewards to eligible active users
    for ((user, is_eligible) in rewardEligibleUsers.entries()) {
      if (is_eligible) {
        switch (activeUsers.get(user)) {
          case (?last_active_time) {
            // User must have been active within the last 7 days
            let seven_days_ns = 7 * 24 * 60 * 60 * 1_000_000_000;
            if (current_time - last_active_time <= seven_days_ns) {
              let user_account = MVTToken.default_account(user);
              let current_balance = Option.get(balances.get(user_account), 0);
              balances.put(user_account, current_balance + daily_reward_amount);
              totalSupply += daily_reward_amount;
              
              // Record earning
              let earning_id = Principal.toText(user) # "_daily_" # Int.toText(current_time);
              let earning_record : EarningRecord = {
                user_id = user;
                earning_type = #platform_usage;
                amount = daily_reward_amount;
                timestamp = current_time;
                description = "Daily activity reward";
              };
              earningRecords.put(earning_id, earning_record);
              
              rewards_distributed += 1;
            };
          };
          case null {};
        };
      };
    };
    
    lastDailyRewardTime := current_time;
    increment_canister_calls(caller);
    
    #ok(rewards_distributed)
  };
  
  // Enhanced burn mechanism with validation and logging
  public shared(msg) func enhanced_burn_tokens(from : Account, amount : Nat, reason: Text) : async Result.Result<TxIndex, Text> {
    let caller = msg.caller;
    
    // Enhanced security validations
    if (not check_rate_limit(caller)) {
      return #err("Rate limit exceeded");
    };
    
    if (not check_canister_authorization(caller)) {
      return #err("Unauthorized canister");
    };
    
    // Validate burn reason
    let sanitized_reason = sanitize_text(reason);
    if (Text.size(sanitized_reason) == 0) {
      return #err("Burn reason required");
    };
    
    let current_balance = Option.get(balances.get(from), 0);
    if (current_balance < amount) {
      return #err("Insufficient balance");
    };
    
    // Enhanced minimum burn validation
    let min_burn = switch (MVTToken.TOKEN_METADATA.min_burn_amount) {
      case (?min_burn) min_burn;
      case null 1; // Default minimum
    };
    
    if (amount < min_burn) {
      return #err("Amount below minimum burn threshold: " # Nat.toText(min_burn));
    };
    
    // Maximum burn per transaction (safety measure)
    let max_burn_per_tx = 1_000_000; // 1M tokens max per burn
    if (amount > max_burn_per_tx) {
      return #err("Amount exceeds maximum burn limit: " # Nat.toText(max_burn_per_tx));
    };
    
    balances.put(from, Nat.sub(current_balance, amount));
    totalSupply := Nat.sub(totalSupply, amount);
    
    // Record enhanced transaction with reason
    let tx : Transaction = {
      index = nextTxIndex;
      timestamp = Nat64.fromNat(Int.abs(Time.now()));
      operation = #burn({
        from = from;
        amount = amount;
      });
    };
    
    transactions.put(nextTxIndex, tx);
    let result_index = nextTxIndex;
    nextTxIndex += 1;
    
    increment_canister_calls(caller);
    
    #ok(result_index)
  };
  
  // Get reward eligibility status
  public query func get_reward_eligibility(user: Principal) : async Bool {
    Option.get(rewardEligibleUsers.get(user), false)
  };
  
  // Get user activity status
  public query func get_user_activity_status(user: Principal) : async ?Int {
    activeUsers.get(user)
  };
  
  // Admin function to manage authorized canisters
  public shared(msg) func add_authorized_canister(canister_id: Principal) : async Result.Result<(), Text> {
    let caller = msg.caller;
    
    // Only the canister itself can add authorized canisters (admin function)
    if (caller != Principal.fromActor(MVTTokenCanister)) {
      return #err("Unauthorized: Only canister admin can add authorized canisters");
    };
    
    authorizedCanisters.put(canister_id, true);
    #ok(())
  };
  
  // Get canister call statistics
  public query func get_canister_call_stats() : async [(Principal, Nat)] {
    Iter.toArray(canisterCallCounts.entries())
  };

  public query func get_staking_info() : async {
    min_stake_amount : Nat;
    lock_periods : [(Duration, Float)];
  } {
    {
      min_stake_amount = MVTToken.STAKING_CONFIG.min_stake_amount;
      lock_periods = MVTToken.STAKING_CONFIG.lock_periods;
    }
  };

  public query func get_earning_rates() : async {
    appointment_completion : Nat;
    platform_usage_daily : Nat;
    referral_bonus : Nat;
    doctor_consultation_fee : Nat;
    patient_feedback : Nat;
    system_participation : Nat;
  } {
    MVTToken.EARNING_RATES
  };

  public query func get_spending_costs() : async {
    premium_consultation : Nat;
    advanced_features_monthly : Nat;
    priority_booking : Nat;
    extended_storage_monthly : Nat;
    ai_insights : Nat;
    telemedicine_session : Nat;
  } {
    MVTToken.SPENDING_COSTS
  };

  // Health check
  public query func health_check() : async { status : Text; total_supply : Nat; total_accounts : Nat } {
    {
      status = "healthy";
      total_supply = totalSupply;
      total_accounts = balances.size();
    }
  };

  // Initialize on first deployment
  init();
}