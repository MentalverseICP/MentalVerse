import Result "mo:base/Result";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Float "mo:base/Float";

import HttpTypes "mo:http-types";
import Map "mo:map/Map";
import Json "mo:json";

import AuthCleanup "mo:mcp-motoko-sdk/auth/Cleanup";
import AuthState "mo:mcp-motoko-sdk/auth/State";
import AuthTypes "mo:mcp-motoko-sdk/auth/Types";

import Mcp "mo:mcp-motoko-sdk/mcp/Mcp";
import McpTypes "mo:mcp-motoko-sdk/mcp/Types";
import HttpHandler "mo:mcp-motoko-sdk/mcp/HttpHandler";
import Cleanup "mo:mcp-motoko-sdk/mcp/Cleanup";
import State "mo:mcp-motoko-sdk/mcp/State";
import Payments "mo:mcp-motoko-sdk/mcp/Payments";
import HttpAssets "mo:mcp-motoko-sdk/mcp/HttpAssets";
import Beacon "mo:mcp-motoko-sdk/mcp/Beacon";
import ApiKey "mo:mcp-motoko-sdk/auth/ApiKey";

import SrvTypes "mo:mcp-motoko-sdk/server/Types";
import TokenAPI "../../src/mentalverse_backend/mvt_token_interface";

import IC "mo:ic";

shared ({ caller = deployer }) persistent actor class McpServer(
  args : ?{
    owner : ?Principal;
  }
) = self {

  // ALL STABLE VARIABLES MUST BE DECLARED FIRST
  var admin : ?Principal = null;
  var mvtTokenCanister : ?Principal = null;
  var backendCanister : ?Principal = null;
  var apyRegistry : [(Text, Nat)] = [
    ("30d", 500),
    ("90d", 800),
    ("180d", 1200),
    ("365d", 1500),
  ];
  var stakingReceipts : [StakingReceipt] = [];
  var paymentReceipts : [PaymentReceipt] = [];
  // State for certified HTTP assets (like /.well-known/...)
  var stable_http_assets : HttpAssets.StableEntries = [];

  // TYPE DECLARATIONS
  public type WrapperError = { code : Text; message : Text };
  public type StakingReceipt = { id : Text; user : Principal; amount : Nat; lock_period : Nat64; selected_apr : Float; created_at_time : Int };
  public type PaymentReceipt = { id : Text; user : Principal; service_id : Text; provider_alias : Text; amount : Nat; created_at_time : Int };

  // NON-STABLE VARIABLES
  // The canister owner, who can manage treasury funds.
  // Defaults to the deployer if not specified.
  transient var owner : Principal = Option.get(do ? { args!.owner! }, deployer);

  private func tokenActor() : Result.Result<TokenAPI.MVTTokenCanisterInterface, WrapperError> {
    switch (mvtTokenCanister) {
      case null { #err({ code = "CONFIG_NOT_SET"; message = "MVT token canister not set" }) };
      case (?canister_id) { #ok(TokenAPI.getMVTTokenCanister(canister_id)) };
    };
  };

  // REMOVED 'stable' keyword - http_assets contains non-stable types
  transient let http_assets = HttpAssets.init(stable_http_assets);

  // Resource contents stored in memory for simplicity.
  // In a real application these would probably be uploaded or user generated.
  transient var resourceContents = [
    ("file:///main.py", "print('Hello from main.py!')"),
    ("file:///README.md", "# MCP Motoko Server"),
  ];

  // The application context that holds our state.
  transient var appContext : McpTypes.AppContext = State.init(resourceContents);

  // =================================================================================
  // --- OPT-IN: MONETIZATION & AUTHENTICATION ---
  // To enable paid tools, uncomment the following `authContext` initialization.
  // By default, it is `null`, and all tools are public.
  // Set the payment details in each tool definition to require payment.
  // See the README for more details.
  // =================================================================================

  // --- UNCOMMENT THIS BLOCK TO ENABLE AUTHENTICATION ---
  // let issuerUrl = "https://bfggx-7yaaa-aaaai-q32gq-cai.icp0.io";
  // let requiredScopes = ["openid"];

  // public query func transformJwksResponse({
  //   context : Blob;
  //   response : IC.HttpRequestResult;
  // }) : async IC.HttpRequestResult {
  //   {
  //     response with headers = [];
  //   };
  // };

  transient let authContext : ?AuthTypes.AuthContext = null; // Disabled for testing
  // ?AuthState.init(
  //   Principal.fromActor(self),
  //   owner,
  //   issuerUrl,
  //   requiredScopes,
  //   transformJwksResponse,
  // );
  // --- END OF AUTHENTICATION BLOCK ---

  // =================================================================================
  // --- OPT-IN: USAGE ANALYTICS (BEACON) ---
  // To enable anonymous usage analytics, uncomment the `beaconContext` initialization.
  // This helps the Prometheus Protocol DAO understand ecosystem growth.
  // =================================================================================

  transient let beaconContext : ?Beacon.BeaconContext = null;

  // --- UNCOMMENT THIS BLOCK TO ENABLE THE BEACON ---
  /*
  let beaconCanisterId = Principal.fromText("m63pw-fqaaa-aaaai-q33pa-cai");
  let beaconContext : ?Beacon.BeaconContext = ?Beacon.init(
      beaconCanisterId, // Public beacon canister ID
      ?(15 * 60), // Send a beacon every 15 minutes
  );
  */
  // --- END OF BEACON BLOCK ---

  // --- Timers ---
  Cleanup.startCleanupTimer<system>(appContext);

  // The AuthCleanup timer only needs to run if authentication is enabled.
  switch (authContext) {
    case (?ctx) { AuthCleanup.startCleanupTimer<system>(ctx) };
    case (null) { Debug.print("Authentication is disabled.") };
  };

  // The Beacon timer only needs to run if the beacon is enabled.
  switch (beaconContext) {
    case (?ctx) { Beacon.startTimer<system>(ctx) };
    case (null) { Debug.print("Beacon is disabled.") };
  };

  // --- 1. DEFINE RESOURCES ---
  transient let resources : [McpTypes.Resource] = [
    {
      uri = "file:///main.py";
      name = "main.py";
      title = ?"Main Python Script";
      description = ?"A simple Python script";
      mimeType = ?"text/x-python";
    },
    {
      uri = "file:///README.md";
      name = "README.md";
      title = ?"Project README";
      description = ?"Project documentation";
      mimeType = ?"text/markdown";
    },
  ];

  // --- 2. DEFINE TOOLS ---
  transient let tools : [McpTypes.Tool] = [
    {
      name = "get_weather";
      title = ?"Get Weather";
      description = ?"Get the current weather for a location";
      inputSchema = Json.obj([
        ("type", Json.str("object")),
        ("properties", Json.obj([
          ("location", Json.obj([
            ("type", Json.str("string")),
            ("description", Json.str("The city and state, e.g. San Francisco, CA"))
          ]))
        ])),
        ("required", Json.arr([Json.str("location")]))
      ]);
      outputSchema = null;
      payment = null;
    },
  ];

  transient let extraTools : [McpTypes.Tool] = [
    {
      name = "get_config";
      title = ?"Get Configuration";
      description = ?"Get the current configuration of the MCP server";
      inputSchema = Json.obj([
        ("type", Json.str("object")),
        ("properties", Json.obj([])),
        ("required", Json.arr([]))
      ]);
      outputSchema = null;
      payment = null;
    },
    {
      name = "manage_staking";
      title = ?"Manage Staking";
      description = ?"Manage staking operations for MVT tokens";
      inputSchema = Json.obj([
        ("type", Json.str("object")),
        ("properties", Json.obj([
          ("action", Json.obj([
            ("type", Json.str("string")),
            ("description", Json.str("Action to perform: 'stake' or 'unstake'"))
          ])),
          ("amount", Json.obj([
            ("type", Json.str("number")),
            ("description", Json.str("Amount of MVT tokens to stake/unstake"))
          ])),
          ("lock_period", Json.obj([
            ("type", Json.str("number")),
            ("description", Json.str("Lock period in days (30, 90, 180, 365)"))
          ]))
        ])),
        ("required", Json.arr([Json.str("action")]))
      ]);
      outputSchema = null;
      payment = null;
    },
    {
      name = "pay_for_service";
      title = ?"Pay for Service";
      description = ?"Pay for a service using MVT tokens";
      inputSchema = Json.obj([
        ("type", Json.str("object")),
        ("properties", Json.obj([
          ("service_id", Json.obj([
            ("type", Json.str("string")),
            ("description", Json.str("ID of the service to pay for"))
          ])),
          ("provider_alias", Json.obj([
            ("type", Json.str("string")),
            ("description", Json.str("Alias of the service provider"))
          ])),
          ("amount", Json.obj([
            ("type", Json.str("number")),
            ("description", Json.str("Amount to pay in MVT tokens"))
          ]))
        ])),
        ("required", Json.arr([Json.str("service_id"), Json.str("provider_alias"), Json.str("amount")]))
      ]);
      outputSchema = null;
      payment = null;
    },
  ];

  transient let getConfigTool : McpTypes.ToolFn = func(args : Json.Json, auth : ?AuthTypes.AuthInfo, cb : (Result.Result<McpTypes.CallToolResult, McpTypes.HandlerError>) -> ()) : async () {
    let payload = Json.obj([
      ("admin", switch (admin) {
        case null { Json.nullable() };
        case (?p) { Json.str(Principal.toText(p)) };
      }),
      ("mvt_token_canister", switch (mvtTokenCanister) {
        case null { Json.nullable() };
        case (?p) { Json.str(Principal.toText(p)) };
      }),
      ("backend_canister", switch (backendCanister) {
        case null { Json.nullable() };
        case (?p) { Json.str(Principal.toText(p)) };
      }),
      ("apy_registry", Json.arr(Array.map<(Text, Nat), Json.Json>(apyRegistry, func(e : (Text, Nat)) : Json.Json {
        Json.obj([
          ("label", Json.str(e.0)),
          ("apr_bp", Json.int(e.1))
        ])
      })))
    ]);
    cb(#ok({ content = [#text({ text = Json.stringify(payload, null) })]; isError = false; structuredContent = ?payload }));
  };

  transient let getWeatherTool : McpTypes.ToolFn = func(args : Json.Json, auth : ?AuthTypes.AuthInfo, cb : (Result.Result<McpTypes.CallToolResult, McpTypes.HandlerError>) -> ()) : async () {
    let location = switch (Json.getAsText(args, "location")) {
      case (#ok(loc)) { loc };
      case (#err(_)) {
        return cb(#ok({ content = [#text({ text = "Missing 'location' arg." })]; isError = true; structuredContent = null }));
      };
    };

    let report = "The weather in " # location # " is sunny.";
    let structuredPayload = Json.obj([("report", Json.str(report))]);
    let stringified = Json.stringify(structuredPayload, null);

    cb(#ok({ content = [#text({ text = stringified })]; isError = false; structuredContent = ?structuredPayload }));
  };

  transient let manageStakingTool : McpTypes.ToolFn = func(args : Json.Json, auth : ?AuthTypes.AuthInfo, cb : (Result.Result<McpTypes.CallToolResult, McpTypes.HandlerError>) -> ()) : async () {
    let action = Json.getAsText(args, "action");
    let amount = Json.getAsNat(args, "amount");
    let lockPeriod = Json.getAsNat(args, "lock_period");
    
    switch (action, amount, lockPeriod) {
      case (#ok("stake"), #ok(amt), #ok(period)) {
            let ts = Int.abs(Time.now());
            let receipt : StakingReceipt = {
              id = Principal.toText(Principal.fromActor(self)) # "_stake_" # Int.toText(ts);
              user = Principal.fromActor(self);
              amount = amt;
              lock_period = Nat64.fromNat(period * 24 * 60 * 60 * 1000000000);
              selected_apr = 5.0;
              created_at_time = ts;
            };
            stakingReceipts := Array.append<StakingReceipt>(stakingReceipts, [receipt]);
            let payload = Json.obj([
              ("id", Json.str(receipt.id)),
              ("user", Json.str(Principal.toText(receipt.user))),
              ("amount", Json.int(receipt.amount)),
              ("lock_period", Json.int(Nat64.toNat(receipt.lock_period))),
              ("selected_apr", Json.float(receipt.selected_apr)),
              ("created_at_time", Json.int(receipt.created_at_time))
            ]);
            return cb(#ok({ content = [#text({ text = Json.stringify(payload, null) })]; isError = false; structuredContent = ?payload }));
        };
        case _ { return cb(#ok({ content = [#text({ text = "INVALID_PARAMS" })]; isError = true; structuredContent = null })) };
      };
  };

  transient let payForServiceTool : McpTypes.ToolFn = func(args : Json.Json, auth : ?AuthTypes.AuthInfo, cb : (Result.Result<McpTypes.CallToolResult, McpTypes.HandlerError>) -> ()) : async () {
    let serviceId = Json.getAsText(args, "service_id");
    let providerAlias = Json.getAsText(args, "provider_alias");
    let amount = Json.getAsNat(args, "amount");
    
    switch (serviceId, providerAlias, amount) {
      case (#ok(sId), #ok(pAlias), #ok(price)) {
            let ts = Int.abs(Time.now());
            let receipt : PaymentReceipt = {
              id = Principal.toText(Principal.fromActor(self)) # "_pay_" # sId # "_" # Int.toText(ts);
              user = Principal.fromActor(self);
              service_id = sId;
              provider_alias = pAlias;
              amount = price;
              created_at_time = ts;
            };
            paymentReceipts := Array.append<PaymentReceipt>(paymentReceipts, [receipt]);
            let payload = Json.obj([
              ("id", Json.str(receipt.id)),
              ("user", Json.str(Principal.toText(receipt.user))),
              ("service_id", Json.str(receipt.service_id)),
              ("provider_alias", Json.str(receipt.provider_alias)),
              ("amount", Json.int(receipt.amount)),
              ("created_at_time", Json.int(receipt.created_at_time))
            ]);
            return cb(#ok({ content = [#text({ text = Json.stringify(payload, null) })]; isError = false; structuredContent = ?payload }));
        };
        case _ { return cb(#ok({ content = [#text({ text = "INVALID_PARAMS" })]; isError = true; structuredContent = null })) };
      };
  };

  // --- 3. CONFIGURE THE SDK ---
  // REMOVED 'stable' keyword - mcpConfig contains functions (non-stable)
  transient let mcpConfig : McpTypes.McpConfig = {
    self = Principal.fromActor(self);

    serverInfo = {
      name = "full-onchain-mcp-server";
      title = "Full On-chain MCP Server";
      version = "0.1.0";
    };
    resources = resources;
    resourceReader = func(uri : Text) : ?Text {
      Map.get(appContext.resourceContents, Map.thash, uri);
    };
    tools = Array.append(tools, extraTools);
    toolImplementations = [
      ("get_weather", getWeatherTool),
      ("get_config", getConfigTool),
      ("manage_staking", manageStakingTool),
      ("pay_for_service", payForServiceTool),
    ];
    beacon = beaconContext;
    allowanceUrl = null;
  };

  // --- 4. CREATE THE SERVER LOGIC ---
  // REMOVED 'stable' keyword - mcpServer contains functions (non-stable)
  transient let mcpServer = Mcp.createServer(mcpConfig);

  // --- PUBLIC ENTRY POINTS ---

  public query func get_owner() : async Principal { return owner };

  public shared ({ caller }) func set_owner(new_owner : Principal) : async Result.Result<(), Payments.TreasuryError> {
    if (caller != owner) { return #err(#NotOwner) };
    owner := new_owner;
    return #ok(());
  };

  public shared ({ caller }) func set_admin(new_admin : Principal) : async Result.Result<(), Payments.TreasuryError> {
    if (caller != owner) { return #err(#NotOwner) };
    admin := ?new_admin;
    return #ok(());
  };

  public shared ({ caller }) func set_mvt_token_canister(canister_id : Principal) : async Result.Result<(), Payments.TreasuryError> {
    if (caller != owner) { return #err(#NotOwner) };
    mvtTokenCanister := ?canister_id;
    return #ok(());
  };

  public shared ({ caller }) func set_backend_canister(canister_id : Principal) : async Result.Result<(), Payments.TreasuryError> {
    if (caller != owner) { return #err(#NotOwner) };
    backendCanister := ?canister_id;
    return #ok(());
  };

  public query func get_config() : async {
    admin : ?Principal;
    mvt_token_canister : ?Principal;
    backend_canister : ?Principal;
    apy_registry : [(Text, Nat)];
  } {
    return {
      admin = admin;
      mvt_token_canister = mvtTokenCanister;
      backend_canister = backendCanister;
      apy_registry = apyRegistry;
    };
  };

  public shared func get_treasury_balance(ledger_id : Principal) : async Nat {
    return await Payments.get_treasury_balance(Principal.fromActor(self), ledger_id);
  };

  public shared ({ caller }) func withdraw(
    ledger_id : Principal,
    amount : Nat,
    destination : Payments.Destination,
  ) : async Result.Result<Nat, Payments.TreasuryError> {
    return await Payments.withdraw(
      caller,
      owner,
      ledger_id,
      amount,
      destination,
    );
  };

  private func _create_http_context() : HttpHandler.Context {
    return {
      self = Principal.fromActor(self);
      active_streams = appContext.activeStreams;
      mcp_server = mcpServer;
      streaming_callback = http_request_streaming_callback;
      auth = authContext;
      http_asset_cache = ?http_assets.cache;
      mcp_path = ?"/mcp";
    };
  };

  public query func http_request(req : SrvTypes.HttpRequest) : async SrvTypes.HttpResponse {
    let ctx : HttpHandler.Context = _create_http_context();
    switch (HttpHandler.http_request(ctx, req)) {
      case (?mcpResponse) {
        return mcpResponse;
      };
      case (null) {
        if (req.url == "/") {
          return {
            status_code = 200;
            headers = [("Content-Type", "text/html")];
            body = Text.encodeUtf8("<h1>My Canister Frontend</h1>");
            upgrade = null;
            streaming_strategy = null;
          };
        } else {
          return {
            status_code = 404;
            headers = [];
            body = Blob.fromArray([]);
            upgrade = null;
            streaming_strategy = null;
          };
        };
      };
    };
  };

  public shared func http_request_update(req : SrvTypes.HttpRequest) : async SrvTypes.HttpResponse {
    let ctx : HttpHandler.Context = _create_http_context();
    let mcpResponse = await HttpHandler.http_request_update(ctx, req);

    switch (mcpResponse) {
      case (?res) {
        return res;
      };
      case (null) {
        return {
          status_code = 404;
          headers = [];
          body = Blob.fromArray([]);
          upgrade = null;
          streaming_strategy = null;
        };
      };
    };
  };

  public query func http_request_streaming_callback(token : HttpTypes.StreamingToken) : async ?HttpTypes.StreamingCallbackResponse {
    let ctx : HttpHandler.Context = _create_http_context();
    return HttpHandler.http_request_streaming_callback(ctx, token);
  };

  // --- CANISTER LIFECYCLE MANAGEMENT ---

  system func preupgrade() {
    stable_http_assets := HttpAssets.preupgrade(http_assets);
  };

  system func postupgrade() {
    HttpAssets.postupgrade(http_assets);
  };

  system func inspect({
    arg : Blob;
    caller : Principal;
    msg : {
      #create_my_api_key : Any;
      #get_config : Any;
      #get_owner : Any;
      #get_treasury_balance : Any;
      #http_request : Any;
      #http_request_streaming_callback : Any;
      #http_request_update : Any;
      #icrc120_upgrade_finished : Any;
      #list_my_api_keys : Any;
      #revoke_my_api_key : Any;
      #set_admin : Any;
      #set_backend_canister : Any;
      #set_mvt_token_canister : Any;
      #set_owner : Any;
      #withdraw : Any;
    };
  }) : Bool {
    return true;
  };

  public shared (msg) func create_my_api_key(name : Text, scopes : [Text]) : async Text {
    switch (authContext) {
      case (null) {
        Debug.trap("Authentication is not enabled on this canister.");
      };
      case (?ctx) {
        return await ApiKey.create_my_api_key(
          ctx,
          msg.caller,
          name,
          scopes,
        );
      };
    };
  };

  public shared (msg) func revoke_my_api_key(key_id : Text) : async () {
    switch (authContext) {
      case (null) {
        Debug.trap("Authentication is not enabled on this canister.");
      };
      case (?ctx) {
        return ApiKey.revoke_my_api_key(ctx, msg.caller, key_id);
      };
    };
  };

  public query (msg) func list_my_api_keys() : async [AuthTypes.ApiKeyMetadata] {
    switch (authContext) {
      case (null) {
        Debug.trap("Authentication is not enabled on this canister.");
      };
      case (?ctx) {
        return ApiKey.list_my_api_keys(ctx, msg.caller);
      };
    };
  };

  public type UpgradeFinishedResult = {
    #InProgress : Nat;
    #Failed : (Nat, Text);
    #Success : Nat;
  };
  
  private func natNow() : Nat {
    return Int.abs(Time.now());
  };
  
  public func icrc120_upgrade_finished() : async UpgradeFinishedResult {
    #Success(natNow());
  };
};