# MentalVerse Backend - Phase 1: Core Infrastructure

This is the Motoko backend implementation for the MentalVerse healthcare platform, built on the Internet Computer Protocol (ICP). Phase 1 provides the core infrastructure including user authentication, data models, and secure storage for medical records.

## 🏗️ Architecture Overview

The backend is implemented as a Motoko canister that provides:

- **Internet Identity Integration**: Secure authentication using ICP's Internet Identity
- **Role-Based Access Control**: Patient, Doctor, and Admin roles with appropriate permissions
- **Comprehensive Data Models**: Patient profiles, doctor profiles, appointments, and medical records
- **Secure Storage**: Persistent storage with upgrade-safe state management
- **HIPAA-Compliant Security**: Encrypted messaging and access-controlled medical records

## 📊 Data Models

### Core Types
- `UserId`: Principal-based user identification
- `Patient`: Complete patient profile with medical history
- `Doctor`: Doctor profile with credentials and specializations
- `Appointment`: Appointment scheduling with status tracking
- `MedicalRecord`: Secure medical records with access permissions
- `Message`: Encrypted messaging between users

### Authentication & Authorization
- Internet Identity integration for secure login
- Role-based permissions (patient/doctor/admin)
- Session management with expiration
- Rate limiting for security

## 🔧 Core Functions

### User Management
```motoko
// Register a new user with role
registerUser(role: Text) : async Result.Result<Text, Text>

// Get current user information
getCurrentUser() : async Result.Result<{id: UserId; role: Text}, Text>
```

### Patient Management
```motoko
// Create patient profile
createPatientProfile(patientData: {...}) : async Result.Result<Patient, Text>

// Get patient profile
getPatientProfile() : async Result.Result<Patient, Text>
```

### Doctor Management
```motoko
// Create doctor profile
createDoctorProfile(doctorData: {...}) : async Result.Result<Doctor, Text>

// Get all doctors
getAllDoctors() : async [Doctor]

// Verify doctor (admin only)
verifyDoctor(doctorId: DoctorId) : async Result.Result<Text, Text>
```

### Appointment Management
```motoko
// Create new appointment
createAppointment(appointmentData: {...}) : async Result.Result<Appointment, Text>

// Update appointment status
updateAppointmentStatus(appointmentId: AppointmentId, status: AppointmentStatus) : async Result.Result<Appointment, Text>

// Get patient appointments
getPatientAppointments() : async [Appointment]

// Get doctor appointments
getDoctorAppointments() : async [Appointment]
```

### Medical Records
```motoko
// Create medical record (doctors only)
createMedicalRecord(recordData: {...}) : async Result.Result<MedicalRecord, Text>

// Get patient medical records
getPatientMedicalRecords() : async [MedicalRecord]

// Get specific medical record
getMedicalRecordById(recordId: RecordId) : async Result.Result<MedicalRecord, Text>
```

### Secure Messaging
```motoko
// Send message
sendMessage(receiverId: UserId, content: Text, messageType: Text) : async Result.Result<Message, Text>

// Get messages with another user
getMessages(otherUserId: UserId) : async [Message]

// Mark message as read
markMessageAsRead(messageId: Text) : async Result.Result<Text, Text>
```

## 🔒 Security Features

### Authentication
- Internet Identity integration for passwordless authentication
- Principal-based user identification
- Session management with automatic expiration
- Device tracking and audit logging

### Authorization
- Role-based access control (RBAC)
- Function-level permissions
- Resource-level access control for medical records
- Admin functions for system management

### Data Protection
- Encrypted messaging by default
- Access-controlled medical records
- HIPAA-compliant data handling
- Audit trails for all sensitive operations

### Rate Limiting
- Built-in rate limiting to prevent abuse
- Configurable limits per user and action
- Automatic window reset for fair usage

## 🚀 Deployment

### Prerequisites
- DFX SDK installed
- Internet Computer local replica running
- Node.js and npm for frontend integration

### Local Development
```bash
# Start local replica
dfx start --clean

# Deploy Internet Identity
dfx deploy internet_identity

# Deploy backend canister
dfx deploy mentalverse_backend

# Deploy frontend
dfx deploy mentalverse_frontend
```

### Production Deployment
```bash
# Deploy to IC mainnet
dfx deploy --network ic
```

## 📋 API Reference

### Health Check
```motoko
healthCheck() : async {status: Text; timestamp: Int; version: Text}
```

### System Statistics
```motoko
getSystemStats() : async {
  totalPatients: Nat;
  totalDoctors: Nat;
  totalAppointments: Nat;
  totalMedicalRecords: Nat;
  totalMessages: Nat;
}
```

### Legacy Support
```motoko
// Backward compatibility
greet(name: Text) : async Text
```

## 🔄 State Management

The backend uses stable variables for persistent storage across canister upgrades:

- `patientsEntries`: Patient profiles
- `doctorsEntries`: Doctor profiles
- `appointmentsEntries`: Appointment records
- `medicalRecordsEntries`: Medical records
- `messagesEntries`: Secure messages
- `userRolesEntries`: User role assignments

### Upgrade Safety
- `preupgrade()`: Saves state before upgrade
- `postupgrade()`: Clears temporary storage after upgrade
- HashMap initialization from stable storage

## 🧪 Testing

### Unit Testing
```bash
# Run Motoko tests
moc --check src/mentalverse_backend/main.mo
```

### Integration Testing
```bash
# Test with dfx
dfx canister call mentalverse_backend healthCheck
dfx canister call mentalverse_backend getSystemStats
```

## 📈 Performance Considerations

- HashMap-based storage for O(1) lookups
- Efficient filtering using Array.filter
- Minimal memory footprint with stable variables
- Query functions for read-only operations

## 🔮 Future Enhancements (Phase 2+)

- Advanced appointment scheduling algorithms
- Integration with external medical systems
- AI-powered health insights
- Telemedicine video calling
- Prescription management
- Insurance claim processing
- Multi-language support
- Mobile app integration

## 🤝 Contributing

1. Follow Motoko coding standards
2. Add comprehensive error handling
3. Include security considerations
4. Update documentation
5. Test thoroughly before deployment

## 📄 License

This project is part of the MentalVerse healthcare platform. All rights reserved.

## 🆘 Support

For technical support or questions about the backend implementation, please refer to the main project documentation or contact the development team.