import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Time "mo:base/Time";

import TokenAPI "../mentalverse_backend/mvt_token_interface";

persistent actor PrometheusWrapper {
  // === Admin & Config ===
  stable var admin : ?Principal = null;
  stable var mvtTokenCanister : ?Principal = null;
  stable var backendCanister : ?Principal = null;

  // Optional APY registry (not authoritative; we query token canister for lock periods)
  stable var apyRegistry : [(Text, Nat)] = [
    ("30d", 500),
    ("90d", 800),
    ("180d", 1200),
    ("365d", 1500)
  ];

  // === Types ===
  public type WrapperError = { code : Text; message : Text };
  public type ToolDescriptor = {
    name : Text;
    description : Text;
    input_schema : Text;
    output_schema : Text;
  };
  public type StakingReceipt = {
    id : Text;
    user : Principal;
    amount : Nat;
    lock_period : Nat64;
    selected_apr : Float;
    created_at_time : Int;
  };
  public type PaymentReceipt = {
    id : Text;
    user : Principal;
    service_id : Text;
    provider_alias : Text;
    amount : Nat;
    created_at_time : Int;
  };

  // Stable logs and metadata
  stable var stakingReceipts : [StakingReceipt] = [];
  stable var paymentReceipts : [PaymentReceipt] = [];
  stable var version_tag : Text = "v0.1.0";
  stable var changelog : [Text] = ["Initial MCP-compliant wrapper"];

  // === Admin methods ===
  public shared(msg) func set_admin(new_admin : Principal) : async Result.Result<(), Text> {
    switch (admin) {
      case null {
        // First-time initialization: allow any caller to set admin
        admin := ?new_admin;
        return #ok(());
      };
      case (?current) {
        if (msg.caller != current) { return #err("Unauthorized: admin only"); };
        admin := ?new_admin;
        return #ok(());
      };
    };
  };

  public shared(msg) func set_mvt_token_canister(canister_id : Principal) : async Result.Result<(), Text> {
    switch (admin) { case (?a) { if (msg.caller != a) { return #err("Unauthorized: admin only"); } }; case null { return #err("Admin not set"); } };
    mvtTokenCanister := ?canister_id;
    #ok(())
  };

  public shared(msg) func set_backend_canister(canister_id : Principal) : async Result.Result<(), Text> {
    switch (admin) { case (?a) { if (msg.caller != a) { return #err("Unauthorized: admin only"); } }; case null { return #err("Admin not set"); } };
    backendCanister := ?canister_id;
    #ok(())
  };

  public shared(msg) func set_apy_registry(entries : [(Text, Nat)]) : async Result.Result<(), Text> {
    switch (admin) { case (?a) { if (msg.caller != a) { return #err("Unauthorized: admin only"); } }; case null { return #err("Admin not set"); } };
    apyRegistry := entries;
    #ok(())
  };

  // === Utility: get token actor ===
  private func tokenActor() : Result.Result<TokenAPI.MVTTokenCanisterInterface, WrapperError> {
    switch (mvtTokenCanister) {
      case null { #err({ code = "CONFIG_NOT_SET"; message = "MVT token canister not set" }) };
      case (?canister_id) { #ok(TokenAPI.getMVTTokenCanister(canister_id)) };
    };
  };

  // === MCP compliance queries ===
  public query func get_version_tag() : async Text { version_tag };

  public query func get_changelog() : async [Text] { changelog };

  public query func get_config() : async {
    admin_set : Bool;
    admin : ?Principal;
    mvt_token_canister : ?Principal;
    backend_canister : ?Principal;
    apy_registry : [(Text, Nat)];
  } {
    {
      admin_set = switch (admin) { case null false; case (?_) true };
      admin = admin;
      mvt_token_canister = mvtTokenCanister;
      backend_canister = backendCanister;
      apy_registry = apyRegistry;
    }
  };

  public query func list_staking_receipts(user : ?Principal) : async [StakingReceipt] {
    switch (user) {
      case null { stakingReceipts };
      case (?u) {
        Array.filter<StakingReceipt>(stakingReceipts, func (r : StakingReceipt) : Bool { r.user == u })
      };
    }
  };

  public query func list_payment_receipts(user : ?Principal) : async [PaymentReceipt] {
    switch (user) {
      case null { paymentReceipts };
      case (?u) {
        Array.filter<PaymentReceipt>(paymentReceipts, func (r : PaymentReceipt) : Bool { r.user == u })
      };
    }
  };

  public query func list_tools() : async [ToolDescriptor] {
    [
      {
        name = "manage_staking";
        description = "Stake tokens with an automatically-selected lock period based on best APR";
        input_schema = "{ \"amount\": \"Nat\", \"preference\": \"Text\" }";
        output_schema = "{ \"StakingReceipt\": { \"id\": \"Text\", \"user\": \"Principal\", \"amount\": \"Nat\", \"lock_period\": \"Nat64\", \"selected_apr\": \"Float\", \"created_at_time\": \"Int\" } }";
      },
      {
        name = "pay_for_service";
        description = "Spend tokens for a given service id and provider alias via backend relay";
        input_schema = "{ \"service_id\": \"Text\", \"price\": \"Nat\", \"provider_alias\": \"Text\" }";
        output_schema = "{ \"PaymentReceipt\": { \"id\": \"Text\", \"user\": \"Principal\", \"service_id\": \"Text\", \"provider_alias\": \"Text\", \"amount\": \"Nat\", \"created_at_time\": \"Int\" } }";
      },
      {
        name = "list_staking_receipts";
        description = "List staking receipts, optionally filtered by user";
        input_schema = "{ \"user\": \"?Principal\" }";
        output_schema = "[StakingReceipt]";
      },
      {
        name = "list_payment_receipts";
        description = "List payment receipts, optionally filtered by user";
        input_schema = "{ \"user\": \"?Principal\" }";
        output_schema = "[PaymentReceipt]";
      },
      {
        name = "get_config";
        description = "Get high-level configuration for admin and canister dependencies";
        input_schema = "{}";
        output_schema = "{ \"admin_set\": \"Bool\", \"admin\": \"?Principal\", \"mvt_token_canister\": \"?Principal\", \"backend_canister\": \"?Principal\", \"apy_registry\": \"[(Text, Nat)]\" }";
      }
    ]
  };
  // === Staking orchestration ===
  public shared(msg) func manage_staking(amount : Nat, preference : Text) : async Result.Result<StakingReceipt, WrapperError> {
    switch (tokenActor()) {
      case (#err(e)) { return #err(e) };
      case (#ok(token)) {
        // Optionally ping token canister for stats (not used for lock period selection)
        let _ = await token.get_staking_info();

        // Local lock periods configuration (mirrors token canister STAKING_CONFIG)
        let lock_periods : [(Nat64, Float)] = [
          (2592000000000000 : Nat64, 5.0),    // 30 days
          (7776000000000000 : Nat64, 8.0),    // 90 days
          (15552000000000000 : Nat64, 12.0),  // 180 days
          (31536000000000000 : Nat64, 18.0),  // 365 days
        ];

        if (lock_periods.size() == 0) {
          return #err({ code = "NO_LOCK_PERIODS"; message = "Token exposes no staking options" });
        };
        // Choose best APR for MVP
        var chosen : (Nat64, Float) = lock_periods[0];
        for ((period, rate) in lock_periods.vals()) {
          if (rate > chosen.1) { chosen := (period, rate); };
        };
        let chosen_period = chosen.0;
        let chosen_apr = chosen.1;

        // Route staking through backend relay so token canister sees authorized caller
        switch (backendCanister) {
          case null {
            return #err({ code = "CONFIG_NOT_SET"; message = "Backend canister not set" });
          };
          case (?backend_id) {
            let backend : actor { relayStakeTokens : (Nat, Nat64) -> async Result.Result<(), Text> } = actor (Principal.toText(backend_id));
            let stake_res = await backend.relayStakeTokens(amount, chosen_period);
            switch (stake_res) {
              case (#err(errText)) {
                return #err({ code = "STAKE_FAILED"; message = errText });
              };
              case (#ok(_)) {
                let ts = Int.abs(Time.now());
                let receipt : StakingReceipt = {
                  id = Principal.toText(msg.caller) # "_stake_" # Int.toText(ts);
                  user = msg.caller;
                  amount = amount;
                  lock_period = chosen_period;
                  selected_apr = chosen_apr;
                  created_at_time = ts;
                };
                stakingReceipts := Array.append<StakingReceipt>(stakingReceipts, [receipt]);
                return #ok(receipt);
              };
            };
          };
        };
      };
    };
  };

  // === Payment orchestration ===
  public shared(msg) func pay_for_service(service_id : Text, price : Nat, provider_alias : Text) : async Result.Result<PaymentReceipt, WrapperError> {
    // Ensure backend canister is configured
    switch (backendCanister) {
      case null { return #err({ code = "CONFIG_NOT_SET"; message = "Backend canister not set" }) };
      case (?backend_id) {
        // Map service_id to SpendingType (heuristic for MVP)
        let spending_type : TokenAPI.SpendingType = if (Text.contains(service_id, #text "therapy") or Text.contains(provider_alias, #text "therapy")) {
          #telemedicine
        } else if (Text.contains(service_id, #text "premium") or Text.contains(provider_alias, #text "premium")) {
          #advanced_features
        } else {
          #premium_consultation
        };

        let backend : actor { relaySpendTokens : (TokenAPI.SpendingType, ?Nat) -> async Result.Result<TokenAPI.TxIndex, Text> } = actor (Principal.toText(backend_id));
        let spend_res = await backend.relaySpendTokens(spending_type, ?price);
        switch (spend_res) {
          case (#err(errText)) { return #err({ code = "PAY_FAILED"; message = errText }) };
          case (#ok(_txIndex)) {
            let ts = Int.abs(Time.now());
            let receipt : PaymentReceipt = {
              id = Principal.toText(msg.caller) # "_pay_" # service_id # "_" # Int.toText(ts);
              user = msg.caller;
              service_id = service_id;
              provider_alias = provider_alias;
              amount = price;
              created_at_time = ts;
            };
            paymentReceipts := Array.append<PaymentReceipt>(paymentReceipts, [receipt]);
            return #ok(receipt);
          };
        };
      };
    };
  };
}