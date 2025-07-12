# MentalVerse - Mental Health Platform

MentalVerse is a comprehensive mental health platform built on the Internet Computer Protocol (ICP) using Motoko for the backend and React/TypeScript for the frontend. The platform provides secure, decentralized mental health services including patient management, doctor consultations, appointment scheduling, and medical record management.

## 🏗️ Architecture

### Backend (Motoko)
- **Main Canister**: `mentalverse_backend` - Core business logic and data management
- **Authentication**: Internet Identity integration for secure, privacy-preserving authentication
- **Data Storage**: Stable memory for persistent data storage across canister upgrades

### Frontend (React/TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS for modern, responsive UI
- **Build Tool**: Vite for fast development and optimized builds
- **Authentication**: Internet Identity client integration

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

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure TypeScript compliance
5. Test both backend and frontend integration

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
