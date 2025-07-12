# MentalVerse Phase 1 Deployment Guide

This guide provides step-by-step instructions for deploying the MentalVerse healthcare platform with Phase 1 core infrastructure implemented.

## 🏗️ Phase 1 Implementation Overview

### ✅ Completed Features

1. **Expanded Motoko Backend** (`main.mo`)
   - Comprehensive data models for patients, doctors, appointments, and medical records
   - Role-based authentication and authorization
   - Secure storage with upgrade-safe state management
   - HIPAA-compliant security features

2. **Internet Identity Integration**
   - Passwordless authentication using ICP's Internet Identity
   - Session management with automatic expiration
   - Principal-based user identification
   - Security utilities and audit logging

3. **Core Data Models**
   - Patient profiles with medical history
   - Doctor profiles with credentials and verification
   - Appointment scheduling with status tracking
   - Medical records with access control
   - Secure messaging system

4. **Frontend Integration**
   - TypeScript service layer for backend communication
   - React hooks for authentication and data management
   - Internet Computer agent configuration
   - Type-safe interfaces matching Motoko backend

## 🚀 Deployment Prerequisites

### System Requirements
- Node.js 18+ and npm
- DFX SDK 0.15.0+
- Internet Computer local replica
- Git for version control

### Installation

```bash
# Install DFX SDK
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"

# Verify installation
dfx --version

# Install Node.js dependencies
cd frontend
npm install
```

## 🔧 Local Development Setup

### 1. Start Local Internet Computer Replica

```bash
# Navigate to the mentalverse directory
cd mentalverse

# Start clean local replica
dfx start --clean
```

### 2. Deploy Internet Identity

```bash
# Deploy Internet Identity canister
dfx deploy internet_identity

# Note the canister ID for frontend configuration
echo "Internet Identity Canister ID: $(dfx canister id internet_identity)"
```

### 3. Deploy Backend Canister

```bash
# Build and deploy the Motoko backend
dfx deploy mentalverse_backend

# Verify deployment
dfx canister call mentalverse_backend healthCheck
```

### 4. Build and Deploy Frontend

```bash
# Build the React frontend
cd ../frontend
npm run build

# Return to mentalverse directory and deploy
cd ../mentalverse
dfx deploy mentalverse_frontend
```

### 5. Access the Application

```bash
# Get the frontend URL
echo "Frontend URL: http://localhost:4943/?canisterId=$(dfx canister id mentalverse_frontend)"

# Get the Internet Identity URL
echo "Internet Identity URL: http://localhost:4943/?canisterId=$(dfx canister id internet_identity)"
```

## 🌐 Production Deployment (IC Mainnet)

### 1. Configure for Mainnet

```bash
# Add cycles to your account (required for mainnet deployment)
dfx ledger account-id

# Top up with cycles (visit https://faucet.dfinity.org for testnet cycles)
```

### 2. Deploy to Mainnet

```bash
# Deploy all canisters to IC mainnet
dfx deploy --network ic

# Verify deployment
dfx canister --network ic call mentalverse_backend healthCheck
```

### 3. Configure Frontend for Production

Update environment variables in `frontend/.env.production`:

```env
REACT_APP_IC_HOST=https://ic0.app
REACT_APP_INTERNET_IDENTITY_URL=https://identity.ic0.app
REACT_APP_BACKEND_CANISTER_ID=your_backend_canister_id
```

## 🧪 Testing the Deployment

### 1. Backend Health Check

```bash
# Test backend health
dfx canister call mentalverse_backend healthCheck

# Expected output:
# (record { status = "healthy"; timestamp = 1_234_567_890; version = "1.0.0" })
```

### 2. System Statistics

```bash
# Get system stats
dfx canister call mentalverse_backend getSystemStats

# Expected output:
# (record { totalPatients = 0; totalDoctors = 0; totalAppointments = 0; totalMedicalRecords = 0; totalMessages = 0 })
```

### 3. User Registration Test

```bash
# Test user registration (replace with your principal)
dfx canister call mentalverse_backend registerUser '("patient")'

# Expected output:
# (variant { Ok = "User registered successfully with role: patient" })
```

### 4. Frontend Integration Test

1. Open the frontend URL in your browser
2. Click "Login with Internet Identity"
3. Complete the Internet Identity authentication
4. Verify successful login and role assignment

## 🔒 Security Configuration

### 1. Internet Identity Setup

- Internet Identity provides passwordless authentication
- Users authenticate using biometrics, security keys, or device authentication
- No passwords or personal information stored

### 2. Access Control

- Role-based permissions (patient/doctor/admin)
- Function-level authorization checks
- Resource-level access control for medical records

### 3. Data Protection

- All messages encrypted by default
- Medical records with granular access permissions
- Audit trails for sensitive operations
- HIPAA-compliant data handling

## 📊 Monitoring and Maintenance

### 1. Canister Monitoring

```bash
# Check canister status
dfx canister status mentalverse_backend

# Monitor cycles balance
dfx canister status mentalverse_backend --network ic
```

### 2. Upgrade Procedures

```bash
# Upgrade backend canister (preserves state)
dfx deploy mentalverse_backend --mode upgrade

# Upgrade frontend
cd ../frontend
npm run build
cd ../mentalverse
dfx deploy mentalverse_frontend
```

### 3. Backup and Recovery

- State is automatically preserved during canister upgrades
- Stable variables ensure data persistence
- Regular monitoring of cycles balance required

## 🚨 Troubleshooting

### Common Issues

1. **"Cannot find module" errors in frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Internet Identity not working**
   - Ensure Internet Identity canister is deployed
   - Check the canister ID in frontend configuration
   - Verify local replica is running

3. **Backend deployment fails**
   ```bash
   # Check Motoko syntax
   dfx build mentalverse_backend
   
   # View detailed error logs
   dfx deploy mentalverse_backend --verbose
   ```

4. **Frontend not loading**
   - Ensure frontend is built before deployment
   - Check canister ID configuration
   - Verify assets are properly uploaded

### Debug Commands

```bash
# View canister logs
dfx canister logs mentalverse_backend

# Check canister info
dfx canister info mentalverse_backend

# Test specific functions
dfx canister call mentalverse_backend greet '("World")'
```

## 📈 Performance Optimization

### 1. Query vs Update Calls

- Use query calls for read-only operations (faster, no consensus)
- Use update calls for state-changing operations
- Properly marked functions in the backend

### 2. Data Structure Optimization

- HashMap-based storage for O(1) lookups
- Efficient filtering and pagination
- Minimal memory footprint with stable variables

### 3. Frontend Optimization

- Lazy loading of components
- Efficient state management
- Proper caching of backend responses

## 🔮 Next Steps (Phase 2+)

After successful Phase 1 deployment, consider implementing:

1. **Advanced Features**
   - Real-time notifications
   - File upload for medical documents
   - Video calling for telemedicine
   - AI-powered health insights

2. **Integration**
   - External medical systems
   - Insurance providers
   - Pharmacy networks
   - Laboratory services

3. **Mobile Support**
   - React Native mobile app
   - Push notifications
   - Offline capabilities

## 📞 Support

For technical support:
- Check the backend README: `mentalverse/src/mentalverse_backend/README.md`
- Review Internet Computer documentation: https://internetcomputer.org/docs
- Motoko language guide: https://internetcomputer.org/docs/current/motoko/intro

## 📄 License

This project is part of the MentalVerse healthcare platform. All rights reserved.