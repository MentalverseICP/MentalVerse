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

  // Stable storage for upgrades
  private var balancesEntries : [(Account, Balance)] = [];
  private var stakesEntries : [(Principal, StakeInfo)] = [];
  private var transactionsEntries : [(TxIndex, Transaction)] = [];
  private var earningRecordsEntries : [(Text, EarningRecord)] = [];
  private var spendingRecordsEntries : [(Text, SpendingRecord)] = [];
  private var totalSupply : Nat = 0;
  private var nextTxIndex : TxIndex = 0;
  private var minting_account : Account = { owner = Principal.fromText("2vxsx-fae"); subaccount = null };

  // Runtime storage
  private transient var balances = HashMap.HashMap<Account, Balance>(100, MVTToken.account_eq, MVTToken.account_hash);
  private transient var stakes = HashMap.HashMap<Principal, StakeInfo>(50, Principal.equal, Principal.hash);
  private transient var transactions = HashMap.HashMap<TxIndex, Transaction>(1000, Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n % (2**32)) });
  private transient var earningRecords = HashMap.HashMap<Text, EarningRecord>(500, Text.equal, Text.hash);
  private transient var spendingRecords = HashMap.HashMap<Text, SpendingRecord>(500, Text.equal, Text.hash);

  // Initialize minting account to canister principal
  private func init() {
    // Use a placeholder principal for now - will be set properly in postupgrade
    minting_account := { owner = Principal.fromText("2vxsx-fae"); subaccount = null };
  };

  // System upgrade hooks
  system func preupgrade() {
    balancesEntries := Iter.toArray(balances.entries());
    stakesEntries := Iter.toArray(stakes.entries());
    transactionsEntries := Iter.toArray(transactions.entries());
    earningRecordsEntries := Iter.toArray(earningRecords.entries());
    spendingRecordsEntries := Iter.toArray(spendingRecords.entries());
  };

  system func postupgrade() {
    balances := HashMap.fromIter<Account, Balance>(balancesEntries.vals(), balancesEntries.size(), MVTToken.account_eq, MVTToken.account_hash);
    stakes := HashMap.fromIter<Principal, StakeInfo>(stakesEntries.vals(), stakesEntries.size(), Principal.equal, Principal.hash);
    transactions := HashMap.fromIter<TxIndex, Transaction>(transactionsEntries.vals(), transactionsEntries.size(), Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n % (2**32)) });
    earningRecords := HashMap.fromIter<Text, EarningRecord>(earningRecordsEntries.vals(), earningRecordsEntries.size(), Text.equal, Text.hash);
    spendingRecords := HashMap.fromIter<Text, SpendingRecord>(spendingRecordsEntries.vals(), spendingRecordsEntries.size(), Text.equal, Text.hash);
    
    balancesEntries := [];
    stakesEntries := [];
    transactionsEntries := [];
    earningRecordsEntries := [];
    spendingRecordsEntries := [];
    
    init();
  };

  // Initialize on first deployment
  init();

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
    
    // Only minting account can mint
    if (not MVTToken.account_eq({ owner = caller; subaccount = null }, minting_account)) {
      return #err("Unauthorized: Only minting account can mint tokens");
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
    // Only authorized canisters can call this function
    let _caller = msg.caller;
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
    // Only authorized canisters can call this function
    let _caller = msg.caller;
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
    // Only authorized canisters can call this function
    let _caller = msg.caller;
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
    // Only authorized canisters can call this function
    let _caller = msg.caller;
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
    // Only authorized canisters can call this function
    let _caller = msg.caller;
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
}