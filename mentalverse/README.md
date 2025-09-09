# MentalVerse - Web3 Mental Health Platform

MentalVerse is the world's first Web3-powered mental health platform built on the Internet Computer Protocol (ICP) using both Motoko and Rust for smart contracts and React/TypeScript for the frontend. The platform combines blockchain technology, AI assistance, and community-driven care to provide secure, decentralized mental health services including peer support, professional therapy, token-based incentives, and comprehensive medical record management.

## 🪙 MVT Token Integration

The **MentalVerse Token (MVT)** is the native utility token that powers the entire ecosystem, enabling:

### Token Utilities
- **Service Payments**: Pay for therapy sessions, premium AI features, and specialized consultations
- **Rewards System**: Earn tokens for peer support participation, mentorship, and community contributions
- **Governance Rights**: Vote on platform improvements and community guidelines
- **Staking Rewards**: Stake MVT tokens to earn passive income and access premium features
- **Referral Bonuses**: Receive token rewards for successful platform referrals

### Token Economics
- **Total Supply**: 1,000,000,000 MVT
- **Blockchain**: Internet Computer Protocol (ICP)
- **Token Standard**: ICRC-1 compatible
- **Smart Contract**: Implemented in Motoko with secure transfer mechanisms

### Staking System
- **Lock Periods**: 30, 90, 180, or 365 days
- **APY Rewards**: 5% to 15% based on lock duration
- **Enhanced Governance**: Increased voting power for staked tokens
- **Premium Access**: Exclusive features for staking participants

## 🏗️ Architecture

### Backend Smart Contracts

#### Motoko Canisters
- **Main Canister**: `mentalverse_backend` - Core business logic and data management
- **MVT Token Canister**: `mvt_token_canister` - ICRC-1 compatible token implementation
- **Authentication**: Internet Identity integration for secure, privacy-preserving authentication
- **Data Storage**: Stable memory for persistent data storage across canister upgrades

#### Rust Canister - Secure Messaging
- **Package**: `secure_messaging` - End-to-end encrypted messaging system
- **IC-CDK Version**: v0.13 (Rust Canister Development Kit)
- **Candid Version**: v0.10 (Interface Definition Language)
- **Cryptography**: Ed25519 key pairs, HMAC, SHA-256 hashing
- **Storage**: IC Stable Structures for persistent data
- **Features**: WebRTC signaling, key exchange, session management

### Frontend (React/TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS for modern, responsive UI
- **Build Tool**: Vite for fast development and optimized builds
- **ICP SDK**: @dfinity packages v0.15.7
- **Authentication**: Internet Identity client integration

## 🦀 Rust Smart Contract - Secure Messaging

The secure messaging canister is implemented in Rust and provides enterprise-grade encrypted communication capabilities:

### Core Functionality

#### 🔐 Cryptographic Security
- **Ed25519 Digital Signatures**: Asymmetric cryptography for message authentication
- **HMAC Authentication**: Message integrity verification using SHA-256
- **AES Encryption**: Symmetric encryption for message content
- **Secure Key Generation**: Ring cryptography library for random key generation
- **Key Exchange Protocol**: Secure establishment of shared encryption keys

#### 💬 Messaging Features
- **End-to-End Encryption**: All messages encrypted before storage
- **Message Types**: Support for text, images, files, audio, and video
- **Conversation Management**: Organized message threads between users
- **Read Receipts**: Message delivery and read status tracking
- **Message Attachments**: Secure file sharing capabilities
- **Reply Threading**: Contextual message replies

#### 🌐 WebRTC Integration
- **Signaling Server**: Facilitates peer-to-peer connection establishment
- **ICE Candidate Exchange**: Network traversal for direct connections
- **Session Description Protocol (SDP)**: Media session negotiation
- **Real-time Communication**: Voice and video call capabilities

#### 🗄️ Data Persistence
- **IC Stable Structures**: Persistent storage across canister upgrades
- **Memory Management**: Efficient virtual memory allocation
- **Stable BTreeMaps**: Optimized data structures for key-value storage
- **Serialization**: Candid and Serde for data encoding/decoding

### Technical Implementation

#### Dependencies
```toml
[dependencies]
ic-cdk = "0.13"                    # Internet Computer CDK
candid = "0.10"                     # Interface definition language
ic-stable-structures = "0.6"       # Persistent storage
ring = "0.17"                       # Cryptographic operations
hmac = "0.12"                       # Message authentication
sha2 = "0.10"                       # Cryptographic hashing
uuid = "1.0"                        # Unique identifier generation
chrono = "0.4"                      # Date and time handling
base64 = "0.21"                     # Base64 encoding/decoding
```

#### Storage Architecture
- **MessageStore**: Encrypted messages with metadata
- **ConversationStore**: Conversation threads and participants
- **UserKeyStore**: User cryptographic key pairs
- **SessionTokenStore**: Authenticated session management
- **WebRTCSignalStore**: Real-time communication signaling
- **KeyExchangeStore**: Secure key exchange protocols

#### API Endpoints
- `send_message()`: Send encrypted messages between users
- `get_messages()`: Retrieve conversation history
- `create_conversation()`: Initialize new conversation threads
- `exchange_keys()`: Establish secure communication channels
- `webrtc_signal()`: Handle real-time communication setup
- `get_user_conversations()`: List user's active conversations

### Why Rust for Secure Messaging?

1. **Memory Safety**: Rust's ownership system prevents common security vulnerabilities
2. **Performance**: Zero-cost abstractions and efficient compiled code
3. **Cryptography**: Excellent ecosystem for cryptographic libraries
4. **Concurrency**: Safe concurrent programming for handling multiple connections
5. **WebAssembly**: Compiles efficiently to WASM for Internet Computer deployment
6. **Type Safety**: Strong type system prevents runtime errors in critical security code

## 📋 Current Implementation

### ✅ Completed Features

#### Backend (Motoko)
1. **User Management**
   - User registration and profile management
   - Role-based access control (Patient/Doctor)
   - Internet Identity integration

2. **Patient Management**
   - Patient profile creation and updates
   - Medical history tracking
   - Allergy and medication management

3. **Doctor Management**
   - Doctor profile management
   - Specialization and availability tracking
   - License verification system

4. **Appointment System**
   - Appointment scheduling and management
   - Status tracking (scheduled, confirmed, completed, etc.)
   - Multiple appointment types support

5. **Medical Records**
   - Secure medical record creation and storage
   - Patient-doctor record sharing
   - Diagnosis and treatment tracking

6. **Messaging System**
   - Secure patient-doctor communication
   - Message encryption and privacy
   - Read status tracking

7. **System Monitoring**
   - Health check endpoints
   - System statistics and metrics
   - Performance monitoring

#### Frontend (TypeScript/React)
1. **Authentication Service**
   - Internet Identity integration
   - Session management
   - Role-based UI rendering

2. **Backend Integration**
   - Type-safe API interfaces
   - Error handling and validation
   - Mock services for development

3. **UI Components**
   - Modern, responsive design
   - Accessibility compliance
   - Cross-browser compatibility

4. **MVT Token Features**
   - Token transfer and transaction history
   - Staking interface with lock period selection
   - Real-time balance tracking
   - Reward distribution dashboard
   - Governance voting interface

#### Smart Contract (Motoko)
1. **MVT Token Contract**
   - ICRC-1 compliant token implementation
   - Secure transfer mechanisms with fee calculation
   - Multi-signature support for large transactions
   - Burn and mint functionality for supply management

2. **Staking Contract**
   - Time-locked staking with variable APY
   - Automatic reward distribution
   - Early withdrawal penalties
   - Compound staking options

3. **Governance Contract**
   - Proposal creation and voting
   - Weighted voting based on staked tokens
   - Execution of approved proposals
   - Transparent decision tracking

## 🚀 Deployment Information

### Deployed Canisters

#### Local Development
- **Backend Canister ID**: `u6s2n-gx777-77774-qaaba-cai`
- **Internet Identity**: `uxrrr-q7777-77774-qaaaq-cai`
- **Local Network**: `http://localhost:4943`

#### Canister Status
- ✅ **mentalverse_backend**: Successfully deployed and running
- ✅ **internet_identity**: Configured and operational
- ⚠️ **mentalverse_frontend**: Pending frontend build

### Environment Configuration

#### Backend Environment Variables
```bash
# Set in dfx.json or deployment scripts
REACT_APP_BACKEND_CANISTER_ID=u6s2n-gx777-77774-qaaba-cai
REACT_APP_INTERNET_IDENTITY_URL=http://localhost:4943/?canisterId=uxrrr-q7777-77774-qaaaq-cai
REACT_APP_IC_HOST=http://localhost:4943
```

#### Development vs Production
- **Development**: Uses local replica with fetchRootKey enabled
- **Production**: Connects to IC mainnet with proper security settings

## 🛠️ Development Setup

### Prerequisites
- [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install) (latest version)
- [Node.js](https://nodejs.org/) (v16 or higher)
- [WSL](https://docs.microsoft.com/en-us/windows/wsl/) (for Windows users)

### Quick Start

1. **Clone and Setup**
   ```bash
   cd mentalverse/
   dfx help
   dfx canister --help
   ```

2. **Start Local Development**
   ```bash
   # Start the local replica
   dfx start --background
   
   # Deploy all canisters
   dfx deploy
   
   # Check canister status
   dfx canister status mentalverse_backend
   ```

3. **Frontend Development**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

### 🔧 Development Commands

#### Backend (Motoko)
```bash
# Build backend canister
dfx build mentalverse_backend

# Deploy backend only
dfx deploy mentalverse_backend

# Reinstall with code updates
dfx canister install --mode reinstall mentalverse_backend

# Check backend health
dfx canister call mentalverse_backend healthCheck

# Get system statistics
dfx canister call mentalverse_backend getSystemStats
```

#### Frontend (React/TypeScript)
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

### 🧪 Testing

#### Backend Testing
```bash
# Test user registration
dfx canister call mentalverse_backend registerUser '("patient")'

# Test health check
dfx canister call mentalverse_backend healthCheck

# Get current user
dfx canister call mentalverse_backend getCurrentUser
```

#### Frontend Testing
```bash
# Run TypeScript checks
npx tsc --noEmit --skipLibCheck

# Run ESLint
npx eslint src/ --fix
```

## 📚 API Documentation

### Backend Endpoints

#### User Management
- `registerUser(role: Text)` - Register new user
- `getCurrentUser()` - Get current user profile
- `updateUserProfile(data)` - Update user information

#### Patient Services
- `createPatientProfile(data: PatientData)` - Create patient profile
- `getPatientProfile()` - Get patient information
- `updatePatientProfile(data)` - Update patient data

#### Doctor Services
- `createDoctorProfile(data: DoctorData)` - Create doctor profile
- `getAllDoctors()` - List all doctors
- `getDoctorById(id: Text)` - Get specific doctor

#### Appointments
- `createAppointment(data: AppointmentData)` - Schedule appointment
- `getPatientAppointments()` - Get patient's appointments
- `getDoctorAppointments()` - Get doctor's appointments
- `updateAppointmentStatus(id, status)` - Update appointment

#### Medical Records
- `createMedicalRecord(data)` - Create medical record
- `getPatientMedicalRecords()` - Get patient records
- `getMedicalRecordById(id)` - Get specific record

#### Messaging
- `sendMessage(receiverId, content, type)` - Send message
- `getMessages(otherUserId)` - Get conversation
- `markMessageAsRead(messageId)` - Mark as read

#### System
- `healthCheck()` - System health status
- `getSystemStats()` - Platform statistics

## 🔒 Security Features

- **Internet Identity**: Secure, privacy-preserving authentication
- **Role-based Access**: Patient/Doctor permission system
- **Data Encryption**: Secure message and record storage
- **Audit Logging**: Comprehensive activity tracking
- **Rate Limiting**: API abuse prevention

## 🚀 Deployment

### Local Deployment
The application is currently deployed locally with the following configuration:

- **Backend**: `http://localhost:4943/?canisterId=u6s2n-gx777-77774-qaaba-cai`
- **Internet Identity**: `http://localhost:4943/?canisterId=uxrrr-q7777-77774-qaaaq-cai`
- **Frontend**: Available after build at `http://localhost:4943/?canisterId={frontend_canister_id}`

### Production Deployment
For IC mainnet deployment:

1. **Configure Network**
   ```bash
   dfx deploy --network ic
   ```

2. **Update Environment Variables**
   ```bash
   REACT_APP_IC_HOST=https://ic0.app
   DFX_NETWORK=ic
   ```

## 📖 Additional Resources

- [Internet Computer Documentation](https://internetcomputer.org/docs/)
- [Motoko Programming Language](https://internetcomputer.org/docs/current/motoko/main/motoko)
- [Internet Identity Integration](https://internetcomputer.org/docs/current/developer-docs/integrations/internet-identity/)
- [DFX SDK Reference](https://internetcomputer.org/docs/current/developer-docs/setup/install)

## 🚀 Live Deployment

MentalVerse is successfully deployed on the Internet Computer mainnet:

### Live URLs
- **Frontend Application**: [https://cnuty-qiaaa-aaaac-a4anq-cai.icp0.io/](https://cnuty-qiaaa-aaaac-a4anq-cai.icp0.io/)
- **Backend Canister (Candid UI)**: [https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=cytcv-raaaa-aaaac-a4aoa-cai](https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=cytcv-raaaa-aaaac-a4aoa-cai)
- **MVT Token Canister (Candid UI)**: [https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=c7seb-4yaaa-aaaac-a4aoq-cai](https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=c7seb-4yaaa-aaaac-a4aoq-cai)

### Canister Information
| Component | Canister ID | Status |
|-----------|-------------|--------|
| Frontend | `cnuty-qiaaa-aaaac-a4anq-cai` | ✅ Running |
| Backend | `cytcv-raaaa-aaaac-a4aoa-cai` | ✅ Running |
| MVT Token | `c7seb-4yaaa-aaaac-a4aoq-cai` | ✅ Running |
| Internet Identity | Remote IC Service | ✅ Active |

### Deployment Commands
```bash
# Deploy to IC mainnet
dfx deploy --network ic --identity secure_identity

# Check canister status
dfx canister status --network ic --identity secure_identity --all
```

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure TypeScript compliance
5. Test both backend and frontend integration

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
