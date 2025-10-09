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

import IC "mo:ic";

shared ({ caller = deployer }) persistent actor class McpServer(
  args : ?{
    owner : ?Principal;
  }
) = self {

  // The canister owner, who can manage treasury funds.
  // Defaults to the deployer if not specified.
  var owner : Principal = Option.get(do ? { args!.owner! }, deployer);
  stable var wrapperCanister : ?Principal = null;

  // State for certified HTTP assets (like /.well-known/...)
  stable var stable_http_assets : HttpAssets.StableEntries = [];
  // REMOVED 'stable' keyword - http_assets contains non-stable types
  transient let http_assets = HttpAssets.init(stable_http_assets);

  // Resource contents stored in memory for simplicity.
  // In a real application these would probably be uploaded or user generated.
  var resourceContents = [
    ("file:///main.py", "print('Hello from main.py!')"),
    ("file:///README.md", "# MCP Motoko Server"),
  ];

  // The application context that holds our state.
  var appContext : McpTypes.AppContext = State.init(resourceContents);

  // =================================================================================
  // --- OPT-IN: MONETIZATION & AUTHENTICATION ---
  // To enable paid tools, uncomment the following `authContext` initialization.
  // By default, it is `null`, and all tools are public.
  // Set the payment details in each tool definition to require payment.
  // See the README for more details.
  // =================================================================================

  // --- UNCOMMENT THIS BLOCK TO ENABLE AUTHENTICATION ---
  let issuerUrl = "https://bfggx-7yaaa-aaaai-q32gq-cai.icp0.io";
  let requiredScopes = ["openid"];

  public query func transformJwksResponse({
    context : Blob;
    response : IC.HttpRequestResult;
  }) : async IC.HttpRequestResult {
    {
      response with headers = [];
    };
  };

  let authContext : ?AuthTypes.AuthContext = ?AuthState.init(
    Principal.fromActor(self),
    owner,
    issuerUrl,
    requiredScopes,
    transformJwksResponse,
  );
  // --- END OF AUTHENTICATION BLOCK ---

  // =================================================================================
  // --- OPT-IN: USAGE ANALYTICS (BEACON) ---
  // To enable anonymous usage analytics, uncomment the `beaconContext` initialization.
  // This helps the Prometheus Protocol DAO understand ecosystem growth.
  // =================================================================================

  let beaconContext : ?Beacon.BeaconContext = null;

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

  // --- 1. DEFINE YOUR RESOURCES & TOOLS ---
  let resources : [McpTypes.Resource] = [
    {
      uri = "file:///main.py";
      name = "main.py";
      title = ?"Main Python Script";
      description = ?"Contains the main logic of the application.";
      mimeType = ?"text/x-python";
    },
    {
      uri = "file:///README.md";
      name = "README.md";
      title = ?"Project Documentation";
      description = null;
      mimeType = ?"text/markdown";
    },
  ];

  let tools : [McpTypes.Tool] = [{
    name = "get_weather";
    title = ?"Weather Provider";
    description = ?"Get current weather information for a location";
    inputSchema = Json.obj([
      ("type", Json.str("object")),
      ("properties", Json.obj([("location", Json.obj([("type", Json.str("string")), ("description", Json.str("City name or zip code"))]))])),
      ("required", Json.arr([Json.str("location")])),
    ]);
    outputSchema = ?Json.obj([
      ("type", Json.str("object")),
      ("properties", Json.obj([("report", Json.obj([("type", Json.str("string")), ("description", Json.str("The textual weather report."))]))])),
      ("required", Json.arr([Json.str("report")])),
    ]);

    payment = null; // No payment required, this tool is free to use.
  }];

  // Additional MCP tools that proxy to PrometheusWrapper
  let extraTools : [McpTypes.Tool] = [
    {
      name = "get_config";
      title = ?"Get Wrapper Config";
      description = ?"Fetch configuration from the PrometheusWrapper.";
      inputSchema = Json.obj([("type", Json.str("object")), ("properties", Json.obj([]))]);
      outputSchema = ?Json.obj([("type", Json.str("object"))]);
      payment = null;
    },
    {
      name = "manage_staking";
      title = ?"Manage Staking";
      description = ?"Stake tokens via backend relay using best APR.";
      inputSchema = Json.obj([
        ("type", Json.str("object")),
        ("properties", Json.obj([
          ("amount", Json.obj([("type", Json.str("string")), ("description", Json.str("Amount as Nat"))])),
          ("preference", Json.obj([("type", Json.str("string")), ("description", Json.str("Preference text"))]))
        ])),
        ("required", Json.arr([Json.str("amount")]))
      ]);
      outputSchema = ?Json.obj([("type", Json.str("object"))]);
      payment = null;
    },
    {
      name = "pay_for_service";
      title = ?"Pay For Service";
      description = ?"Spend tokens for a given service id and provider alias.";
      inputSchema = Json.obj([
        ("type", Json.str("object")),
        ("properties", Json.obj([
          ("service_id", Json.obj([("type", Json.str("string"))])),
          ("price", Json.obj([("type", Json.str("string"))])),
          ("provider_alias", Json.obj([("type", Json.str("string"))]))
        ])),
        ("required", Json.arr([Json.str("service_id"), Json.str("price")]))
      ]);
      outputSchema = ?Json.obj([("type", Json.str("object"))]);
      payment = null;
    }
  ];

  // --- 2. DEFINE YOUR TOOL LOGIC ---
  func getWeatherTool(args : McpTypes.JsonValue, auth : ?AuthTypes.AuthInfo, cb : (Result.Result<McpTypes.CallToolResult, McpTypes.HandlerError>) -> ()) : async () {
    let location = switch (Result.toOption(Json.getAsText(args, "location"))) {
      case (?loc) { loc };
      case (null) {
        return cb(#ok({ content = [#text({ text = "Missing 'location' arg." })]; isError = true; structuredContent = null }));
      };
    };

    let report = "The weather in " # location # " is sunny.";
    let structuredPayload = Json.obj([("report", Json.str(report))]);
    let stringified = Json.stringify(structuredPayload, null);

    cb(#ok({ content = [#text({ text = stringified })]; isError = false; structuredContent = ?structuredPayload }));
  };

  transient let getConfigTool = func(args : McpTypes.JsonValue, auth : ?AuthTypes.AuthInfo, cb : (Result.Result<McpTypes.CallToolResult, McpTypes.HandlerError>) -> ()) : async () {
      switch (wrapperCanister) {
      case (null) { return cb(#ok({ content = [#text({ text = "Wrapper canister not set" })]; isError = true; structuredContent = null })) };
      case (?wid) {
        let wrapper : actor { get_config : () -> async { admin_set : Bool; admin : ?Principal; mvt_token_canister : ?Principal; backend_canister : ?Principal; apy_registry : [(Text, Nat)] } } = actor (Principal.toText(wid));
        let cfg = await wrapper.get_config();
        let payload = Json.obj([
          ("admin_set", Json.bool(cfg.admin_set)),
          ("admin", switch (cfg.admin) { case (null) { Json.nullable() }; case (?p) { Json.str(Principal.toText(p)) } }),
          ("mvt_token_canister", switch (cfg.mvt_token_canister) { case (null) { Json.nullable() }; case (?p) { Json.str(Principal.toText(p)) } }),
          ("backend_canister", switch (cfg.backend_canister) { case (null) { Json.nullable() }; case (?p) { Json.str(Principal.toText(p)) } }),
          ("apy_registry", Json.arr(Array.map<(Text, Nat), Json.Json>(cfg.apy_registry, func (e : (Text, Nat)) : Json.Json { Json.obj([("label", Json.str(e.0)), ("apr_bp", Json.int(e.1))]) })))
        ]);
        cb(#ok({ content = [#text({ text = Json.stringify(payload, null) })]; isError = false; structuredContent = ?payload }));
      };
    };
  };

  transient let manageStakingTool = func(args : McpTypes.JsonValue, auth : ?AuthTypes.AuthInfo, cb : (Result.Result<McpTypes.CallToolResult, McpTypes.HandlerError>) -> ()) : async () {
    let amountText = Result.toOption(Json.getAsText(args, "amount"));
    let preference = Option.get(Result.toOption(Json.getAsText(args, "preference")), "");
    let amount : Nat = switch (amountText) { case (?t) { switch (Nat.fromText(t)) { case (?n) { n }; case (null) { 0 } } }; case (null) { 0 } };
    switch (wrapperCanister) {
      case (null) { return cb(#ok({ content = [#text({ text = "Wrapper canister not set" })]; isError = true; structuredContent = null })) };
      case (?wid) {
        let wrapper : actor { manage_staking : (Nat, Text) -> async Result.Result<{ id : Text; user : Principal; amount : Nat; lock_period : Nat64; selected_apr : Float; created_at_time : Int }, { code : Text; message : Text }> } = actor (Principal.toText(wid));
        let res = await wrapper.manage_staking(amount, preference);
        switch (res) {
          case (#ok(receipt)) {
            let payload = Json.obj([
              ("id", Json.str(receipt.id)),
              ("user", Json.str(Principal.toText(receipt.user))),
              ("amount", Json.int(receipt.amount)),
              ("lock_period", Json.int(Nat64.toNat(receipt.lock_period))),
              ("selected_apr", Json.float(receipt.selected_apr)),
              ("created_at_time", Json.int(receipt.created_at_time)),
            ]);
            cb(#ok({ content = [#text({ text = Json.stringify(payload, null) })]; isError = false; structuredContent = ?payload }));
          };
          case (#err(e)) {
            cb(#ok({ content = [#text({ text = e.code # ": " # e.message })]; isError = true; structuredContent = null }));
          };
        };
      };
    };
  };

  transient let payForServiceTool = func(args : McpTypes.JsonValue, auth : ?AuthTypes.AuthInfo, cb : (Result.Result<McpTypes.CallToolResult, McpTypes.HandlerError>) -> ()) : async () {
    let serviceId = Option.get(Result.toOption(Json.getAsText(args, "service_id")), "");
    let priceText = Option.get(Result.toOption(Json.getAsText(args, "price")), "0");
    let providerAlias = Option.get(Result.toOption(Json.getAsText(args, "provider_alias")), "");
    let price : Nat = switch (Nat.fromText(priceText)) { case (?n) { n }; case (null) { 0 } };
    switch (wrapperCanister) {
      case (null) { return cb(#ok({ content = [#text({ text = "Wrapper canister not set" })]; isError = true; structuredContent = null })) };
      case (?wid) {
        let wrapper : actor { pay_for_service : (Text, Nat, Text) -> async Result.Result<{ id : Text; user : Principal; service_id : Text; provider_alias : Text; amount : Nat; created_at_time : Int }, { code : Text; message : Text }> } = actor (Principal.toText(wid));
        let res = await wrapper.pay_for_service(serviceId, price, providerAlias);
        switch (res) {
          case (#ok(receipt)) {
            let payload = Json.obj([
              ("id", Json.str(receipt.id)),
              ("user", Json.str(Principal.toText(receipt.user))),
              ("service_id", Json.str(receipt.service_id)),
              ("provider_alias", Json.str(receipt.provider_alias)),
              ("amount", Json.int(receipt.amount)),
              ("created_at_time", Json.int(receipt.created_at_time)),
            ]);
            cb(#ok({ content = [#text({ text = Json.stringify(payload, null) })]; isError = false; structuredContent = ?payload }));
          };
          case (#err(e)) {
            cb(#ok({ content = [#text({ text = e.code # ": " # e.message })]; isError = true; structuredContent = null }));
          };
        };
      };
    };
  };

  // --- 3. CONFIGURE THE SDK ---
  // REMOVED 'stable' keyword - mcpConfig contains functions (non-stable)
  transient let mcpConfig : McpTypes.McpConfig = {
    self = Principal.fromActor(self);
    allowanceUrl = null;
    serverInfo = {
      name = "full-onchain-mcp-server";
      title = "Full On-chain MCP Server";
      version = "0.1.0";
    };
    resources = resources;
    resourceReader = func(uri) {
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

  public shared ({ caller }) func set_wrapper_canister(canister_id : Principal) : async Result.Result<(), Payments.TreasuryError> {
    if (caller != owner) { return #err(#NotOwner) };
    wrapperCanister := ?canister_id;
    return #ok(());
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