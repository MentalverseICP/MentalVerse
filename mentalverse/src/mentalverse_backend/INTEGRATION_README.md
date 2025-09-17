# MentalVerse Backend Integration Guide

## Overview

The `main.mo` file serves as the central integration hub for all MentalVerse backend modules, providing a unified interface for:

- **Authentication & Authorization** (`auth.mo`)
- **Data Storage** (`storage.mo`)
- **Security & Rate Limiting** (`security.mo`)
- **PHI Encryption** (`phi_encryption.mo`)
- **Payment Processing** (`payment.mo`)
- **Internet Identity Integration** (`internet_identity.mo`)
- **MVT Token Management** (`mvt_token.mo`)
- **Secure Messaging** (`secure_messaging_interface.mo`)
- **Utility Functions** (`utils.mo`)

## Architecture

### Module Instances

All modules are instantiated as private instances within the main actor:

```motoko
private let auth = Auth.AuthManager();
private let storage = Storage.Storage();
private let security = Security.Security();
private let phiEncryption = PHIEncryption.PHIEncryption();
private let paymentProcessor = Payment.PaymentProcessor();
private let identityManager = InternetIdentity.IdentityManager();
private let mvtToken = MVTToken.MVTToken();
private let messagingInterface = SecureMessagingInterface.MessagingInterface();
```

### Initialization & Upgrade Hooks

The system includes comprehensive initialization and upgrade management:

- **`init()`**: Initializes all modules in the correct order
- **`preupgrade()`**: Saves all module states before canister upgrade
- **`postupgrade()`**: Restores all module states after canister upgrade

## API Categories

### 1. Authentication & Authorization

- User registration and profile management
- Role-based access control
- Permission validation
- Internet Identity integration
- Session management
- Two-factor authentication

### 2. Data Management

- User profiles (patients, doctors, therapists)
- Medical records with encryption
- Appointment scheduling
- Audit logging
- System statistics

### 3. Security Features

- Rate limiting and DDoS protection
- Nonce validation
- Principal blocking
- Security event monitoring
- Emergency security functions

### 4. Payment & Token System

- Payment transaction processing
- Escrow contract management
- MVT token operations (transfer, stake, rewards)
- Token statistics and analytics
- ICRC-1 compliance

### 5. Secure Messaging

- End-to-end encrypted messaging
- Conversation management
- Message status tracking
- Inter-canister communication
- File attachment support

### 6. PHI Encryption

- HIPAA-compliant data encryption
- Key rotation management
- Secure data storage
- Access control integration

## Key Features

### Unified Error Handling

All functions return `Result<T, Text>` types for consistent error handling across the platform.

### Comprehensive Logging

All operations are logged through the audit system for compliance and monitoring.

### Inter-Canister Communication

Seamless integration with:
- MVT Token Canister
- Secure Messaging Canister
- Internet Identity Service

### Health Monitoring

Comprehensive health checks for all modules:

```motoko
public func healthCheck() : async Result.Result<{
    status: Text;
    modules: { /* all module statuses */ };
    timestamp: Int;
}, Text>
```

### Emergency Recovery

- Individual module restart capabilities
- Emergency security functions
- System-wide recovery procedures

## Usage Examples

### User Registration

```motoko
let result = await backend.registerUser({
    name = "Dr. Jane Smith";
    email = "jane@example.com";
    userType = #Doctor;
    specialization = ?"Psychiatry";
    licenseNumber = ?"MD123456";
    // ... other fields
});
```

### Token Operations

```motoko
// Check balance
let balance = await backend.getTokenBalance(null);

// Stake tokens
let stakeResult = await backend.stakeTokens(1000, 30); // 1000 tokens for 30 days

// Claim rewards
let rewards = await backend.claimRewards();
```

### Secure Messaging

```motoko
// Send encrypted message
let messageResult = await backend.sendSecureMessage(
    recipientPrincipal,
    "Hello, this is a secure message",
    #Text,
    #DirectMessage
);
```

### Payment Processing

```motoko
// Create payment transaction
let paymentResult = await backend.createPaymentTransaction(
    doctorPrincipal,
    100, // amount
    "Consultation",
    #CreditCard,
    true, // auto refund enabled
    ?24 // 24 hour refund deadline
);
```

## Security Considerations

1. **Authentication**: All functions use `shared(msg)` to authenticate callers
2. **Authorization**: Role-based access control for sensitive operations
3. **Encryption**: PHI data is automatically encrypted
4. **Rate Limiting**: Built-in protection against abuse
5. **Audit Trail**: All operations are logged for compliance

## Deployment

1. Ensure all module dependencies are available
2. Deploy the main canister
3. Call `init()` to initialize all modules
4. Configure inter-canister communication endpoints
5. Run health checks to verify system status

## Monitoring

- Use `healthCheck()` for overall system status
- Monitor individual module statistics
- Review audit logs regularly
- Track security events and metrics

## Error Handling

All functions return structured error messages. Common error patterns:

- Authentication failures: "Unauthorized access"
- Validation errors: "Invalid input: [details]"
- System errors: "Internal system error: [details]"
- Permission errors: "Insufficient permissions for [operation]"

## Future Enhancements

- Additional payment methods
- Enhanced analytics and reporting
- Mobile app integration
- Advanced AI features
- Compliance automation

This integration provides a robust, scalable, and secure foundation for the MentalVerse platform while maintaining modularity and extensibility for future development.