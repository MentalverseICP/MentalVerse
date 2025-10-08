# MentalVerse Prometheus Wrapper

A Model Context Protocol (MCP) server that provides secure token staking and payment orchestration for the MentalVerse mental health platform on the Internet Computer.

## Quick Start

### Prerequisites

- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (Internet Computer SDK)
- [Node.js](https://nodejs.org/) (for MCP Inspector)
- Git

### Installation & Setup

1. **Clone the repository:**
```bash
git clone https://github.com/MentalVerse/MentalVerse.git
cd MentalVerse/mentalverse
```

2. **Install dependencies:**
```bash
npm install
```

3. **Deploy locally (for testing):**
```bash
dfx start --background
dfx deploy prometheus_wrapper
```

4. **Configure the canister:**
```bash
# Set admin (replace with your principal)
dfx canister call prometheus_wrapper set_admin '(principal "your-principal-id")'

# Set MVT token canister
dfx canister call prometheus_wrapper set_mvt_token_canister '(principal "c7seb-4yaaa-aaaac-a4aoq-cai")'

# Set backend canister
dfx canister call prometheus_wrapper set_backend_canister '(principal "cytcv-raaaa-aaaac-a4aoa-cai")'
```

### MCP Inspector Testing

The MCP Inspector is the standard tool for testing MCP servers. Here's how to test this server:

1. **Install MCP Inspector:**
```bash
npm install -g @modelcontextprotocol/inspector
```

2. **Create a test configuration file** (`mcp-config.json`):
```json
{
  "mcpServers": {
    "mentalverse-prometheus": {
      "command": "dfx",
      "args": ["canister", "call", "prometheus_wrapper", "list_tools", "()"],
      "env": {}
    }
  }
}
```

3. **Run the Inspector:**
```bash
mcp-inspector --config mcp-config.json
```

4. **Test the tools in Inspector:**
   - Navigate to the "Tools" tab
   - You should see 5 available tools
   - Test each tool with the example calls below

## Available Tools

### 1. `manage_staking`
**Description:** Stake tokens with automatically-selected lock period based on best APR

**Input Schema:**
```json
{
  "amount": "Nat",
  "preference": "Text"
}
```

**Example Call:**
```bash
dfx canister call prometheus_wrapper manage_staking '(1000, "best_apr")'
```

**Expected Output:**
```json
{
  "StakingReceipt": {
    "id": "principal_stake_timestamp",
    "user": "principal-id",
    "amount": 1000,
    "lock_period": 31536000000000000,
    "selected_apr": 18.0,
    "created_at_time": 1703123456789
  }
}
```

### 2. `pay_for_service`
**Description:** Spend tokens for a given service ID and provider alias via backend relay

**Input Schema:**
```json
{
  "service_id": "Text",
  "price": "Nat",
  "provider_alias": "Text"
}
```

**Example Call:**
```bash
dfx canister call prometheus_wrapper pay_for_service '("therapy_session_001", 500, "dr_smith")'
```

**Expected Output:**
```json
{
  "PaymentReceipt": {
    "id": "principal_pay_therapy_session_001_timestamp",
    "user": "principal-id",
    "service_id": "therapy_session_001",
    "provider_alias": "dr_smith",
    "amount": 500,
    "created_at_time": 1703123456789
  }
}
```

### 3. `list_staking_receipts`
**Description:** List staking receipts, optionally filtered by user

**Input Schema:**
```json
{
  "user": "?Principal"
}
```

**Example Call:**
```bash
# List all receipts
dfx canister call prometheus_wrapper list_staking_receipts '(null)'

# List receipts for specific user
dfx canister call prometheus_wrapper list_staking_receipts '(opt principal "user-principal-id")'
```

### 4. `list_payment_receipts`
**Description:** List payment receipts, optionally filtered by user

**Input Schema:**
```json
{
  "user": "?Principal"
}
```

**Example Call:**
```bash
# List all payment receipts
dfx canister call prometheus_wrapper list_payment_receipts '(null)'
```

### 5. `get_config`
**Description:** Get high-level configuration for admin and canister dependencies

**Input Schema:**
```json
{}
```

**Example Call:**
```bash
dfx canister call prometheus_wrapper get_config '()'
```

**Expected Output:**
```json
{
  "admin_set": true,
  "admin": "principal-id",
  "mvt_token_canister": "c7seb-4yaaa-aaaac-a4aoq-cai",
  "backend_canister": "cytcv-raaaa-aaaac-a4aoa-cai",
  "apy_registry": [
    ["30d", 500],
    ["90d", 800],
    ["180d", 1200],
    ["365d", 1500]
  ]
}
```

## Architecture

The Prometheus Wrapper acts as an MCP-compliant interface layer that orchestrates interactions between:

- **MVT Token Canister** (`c7seb-4yaaa-aaaac-a4aoq-cai`): Handles token operations
- **Backend Canister** (`cytcv-raaaa-aaaac-a4aoa-cai`): Provides relay functionality for authorized operations
- **MCP Clients**: AI agents and applications that consume the MCP interface

### Security Model

1. **Admin Authorization**: Only the designated admin can configure canister dependencies
2. **Relay Pattern**: All token operations go through the backend canister to ensure proper authorization
3. **Structured Errors**: Clear error messages with codes for debugging
4. **Receipt Tracking**: All operations generate immutable receipts for audit trails

### Staking Logic

The wrapper automatically selects the best APR from available lock periods:
- 30 days: 5.0% APR
- 90 days: 8.0% APR  
- 180 days: 12.0% APR
- 365 days: 18.0% APR (automatically selected for best returns)

## 🔧 Development

### Local Development

1. **Start local replica:**
```bash
dfx start --clean
```

2. **Deploy all dependencies:**
```bash
dfx deploy internet_identity
dfx deploy mvt_token_canister
dfx deploy mentalverse_backend
dfx deploy prometheus_wrapper
```

3. **Run tests:**
```bash
# Test inter-canister communication
./test_inter_canister.sh
```

### Code Structure

```
src/prometheus_wrapper/
├── main.mo              # Main canister implementation
└── README.md           # This documentation
```

**Key Components:**
- `PrometheusWrapper` actor: Main persistent actor
- Admin methods: Configuration and setup
- MCP compliance methods: `list_tools()`, version tracking
- Orchestration methods: `manage_staking()`, `pay_for_service()`
- Query methods: Receipt listing and configuration retrieval

## Mainnet Deployment

**Canister ID:** `znjvm-maaaa-aaaac-a4ora-cai`

The canister is deployed on the Internet Computer mainnet and configured with:
- MVT Token Canister: `c7seb-4yaaa-aaaac-a4aoq-cai`
- Backend Canister: `cytcv-raaaa-aaaac-a4aoa-cai`

##  Monitoring & Maintenance

### Version Information
- **Current Version:** v0.1.0
- **Changelog:** Available via `get_version_tag()` and `get_changelog()` methods

### Health Checks
```bash
# Check canister status
dfx canister status prometheus_wrapper --network ic

# Verify configuration
dfx canister call prometheus_wrapper get_config --network ic
```

## Contributing

This project is part of the MentalVerse ecosystem and follows the Prometheus Protocol standards.

### Contact & Maintenance

- **Maintainer:** MentalVerse Team
- **Status:** Actively maintained
- **Repository:** [GitHub Repository URL]
- **Issues:** Please report issues through GitHub Issues
- **Discord:** Join our community Discord for support

### Development Guidelines

1. All changes must maintain MCP compliance
2. Security-sensitive operations require admin authorization
3. All public methods should include proper error handling
4. Receipt generation is mandatory for state-changing operations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Prometheus Protocol Compliance

This MCP server is designed to meet the Prometheus Protocol Gold Verified Server Program requirements:

✅ **MCP Compliance:** Inspector connects, tools list properly, schemas are correct  
✅ **Security:** Auth for spending tools, no unrestricted transfers, proper error handling  
✅ **Documentation:** Complete README with Quick Start and Inspector steps  
✅ **Quality:** Clear error messages, version tracking, maintenance information  
✅ **Maintenance:** Active maintenance with clear contact methods  

---

*Built with love for the decentralized mental health ecosystem*