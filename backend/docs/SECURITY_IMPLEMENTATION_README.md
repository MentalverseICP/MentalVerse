# MentalVerse Security Implementation

## Overview

This document provides a comprehensive guide to the security implementation in MentalVerse, including HIPAA and GDPR compliance features, security testing procedures, and operational guidelines.

## 🏗️ Architecture Overview

### Security Components

```
┌─────────────────────────────────────────────────────────────┐
│                    MentalVerse Security Stack               │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React)                                           │
│  ├── Authentication UI                                      │
│  ├── Consent Management UI                                  │
│  └── Data Export/Deletion UI                               │
├─────────────────────────────────────────────────────────────┤
│  API Gateway & Middleware                                   │
│  ├── Rate Limiting                                          │
│  ├── Input Validation                                       │
│  ├── Consent Validation                                     │
│  └── Audit Logging                                          │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                       │
│  ├── Authentication Service                                 │
│  ├── PHI Encryption Service                                 │
│  ├── Consent Management Service                             │
│  ├── Data Erasure Service                                   │
│  └── Audit Service                                          │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ├── Encrypted Database (PHI)                               │
│  ├── Audit Log Storage                                      │
│  └── Consent Records                                        │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure                                             │
│  ├── TLS 1.3 Encryption                                     │
│  ├── Network Security                                       │
│  └── Monitoring & Alerting                                  │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Security Features Implemented

### 1. PHI Encryption Service
**Location**: `src/services/phiEncryption.js`

**Features**:
- AES-256-GCM encryption for all PHI data
- Secure key management with rotation
- Field-level encryption for sensitive data
- Cryptographic integrity verification

**Usage**:
```javascript
const phiService = new PHIEncryptionService();

// Encrypt sensitive data
const encryptedData = await phiService.encryptPHI({
  patientId: 'patient123',
  diagnosis: 'Anxiety disorder',
  notes: 'Patient shows improvement'
});

// Decrypt for authorized access
const decryptedData = await phiService.decryptPHI(encryptedData, userId);
```

### 2. Consent Management System
**Location**: `src/services/consentService.js`

**Features**:
- GDPR-compliant consent collection
- Granular consent options
- Consent withdrawal mechanisms
- Audit trail for all consent actions

**API Endpoints**:
- `GET /api/consent/forms` - Get available consent forms
- `POST /api/consent/submit` - Submit consent
- `PUT /api/consent/update` - Update consent preferences
- `DELETE /api/consent/withdraw` - Withdraw consent
- `GET /api/consent/status` - Check consent status

### 3. Audit Logging System
**Location**: `src/services/auditService.js`

**Features**:
- Comprehensive event logging
- Tamper-resistant log entries
- Real-time security monitoring
- Compliance reporting

**Log Types**:
- Authentication events
- PHI access events
- Consent actions
- Data operations
- Security events
- System events

### 4. Data Erasure Service (Right to be Forgotten)
**Location**: `src/services/dataErasureService.js`

**Features**:
- GDPR Article 17 compliance
- Secure data deletion
- Verification and audit trails
- Backup system integration

**Process Flow**:
1. User requests data deletion
2. Identity verification
3. Legal basis validation
4. Secure data erasure
5. Verification and confirmation

## 🛡️ Middleware Components

### 1. Consent Validation Middleware
**Location**: `src/middleware/consentValidation.js`

**Functions**:
- `validateOperationConsent()` - Validates consent for specific operations
- `checkConsentExpiration()` - Checks if consent has expired
- `addConsentHeaders()` - Adds consent status to response headers

### 2. Audit Middleware
**Location**: `src/middleware/auditMiddleware.js`

**Functions**:
- `auditAllEvents()` - Logs all API requests
- `auditAuthEvents()` - Logs authentication events
- `auditPHIAccess()` - Logs PHI access events
- `auditSecurityEvents()` - Logs security-related events

## 🚀 Getting Started

### Prerequisites

```bash
# Node.js version 18 or higher
node --version

# npm version 8 or higher
npm --version
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd MentalVerse/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Configuration

```env
# Database Configuration
DATABASE_URL=mongodb://localhost:27017/mentalverse
DATABASE_ENCRYPTION_KEY=your-32-byte-encryption-key

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption Configuration
PHI_ENCRYPTION_KEY=your-phi-encryption-key
AUDIT_ENCRYPTION_KEY=your-audit-encryption-key

# Email Configuration (for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_TIMEOUT_MS=900000

# Compliance Configuration
CONSENT_EXPIRY_DAYS=365
AUDIT_RETENTION_DAYS=2190
DATA_RETENTION_DAYS=2555
```

### Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm start

# Run with specific environment
NODE_ENV=production npm start
```

## 🧪 Security Testing

### Running Security Tests

```bash
# Run all tests
npm test

# Run security-specific tests
npm run test:security

# Run compliance tests
npm run test:compliance

# Run with coverage
npm run test:coverage
```

### Test Categories

#### 1. Authentication Tests
```bash
# Test authentication flows
npm run test:auth

# Test MFA implementation
npm run test:mfa

# Test session management
npm run test:sessions
```

#### 2. Encryption Tests
```bash
# Test PHI encryption
npm run test:encryption

# Test key management
npm run test:keys

# Test data integrity
npm run test:integrity
```

#### 3. Consent Management Tests
```bash
# Test consent collection
npm run test:consent

# Test consent validation
npm run test:consent-validation

# Test consent withdrawal
npm run test:consent-withdrawal
```

#### 4. Audit System Tests
```bash
# Test audit logging
npm run test:audit

# Test log integrity
npm run test:audit-integrity

# Test compliance reporting
npm run test:compliance-reports
```

### Manual Security Testing

#### 1. Penetration Testing Checklist
Refer to `docs/SECURITY_TEST_CHECKLIST.md` for comprehensive testing procedures.

#### 2. Vulnerability Scanning
```bash
# Run dependency vulnerability scan
npm audit

# Fix vulnerabilities
npm audit fix

# Run OWASP dependency check
npm run security:dependency-check
```

#### 3. Code Security Analysis
```bash
# Run static code analysis
npm run security:sast

# Run linting with security rules
npm run lint:security

# Check for secrets in code
npm run security:secrets-scan
```

## 📊 Monitoring and Alerting

### Health Checks

```bash
# Check application health
curl http://localhost:3000/health

# Check security status
curl http://localhost:3000/security/status

# Check compliance status
curl http://localhost:3000/compliance/status
```

### Monitoring Endpoints

- `/health` - Application health status
- `/metrics` - Application metrics
- `/security/status` - Security system status
- `/compliance/status` - Compliance status
- `/audit/summary` - Audit log summary

### Log Monitoring

```bash
# View application logs
tail -f logs/application.log

# View security logs
tail -f logs/security.log

# View audit logs
tail -f logs/audit.log

# View error logs
tail -f logs/error.log
```

## 🔧 Configuration Management

### Security Configuration

#### Rate Limiting
```javascript
// Configure rate limiting
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
};
```

#### Session Configuration
```javascript
// Configure session management
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true, // Prevent XSS
    maxAge: 15 * 60 * 1000 // 15 minutes
  }
};
```

#### CORS Configuration
```javascript
// Configure CORS
const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### Database Security

#### Connection Security
```javascript
// Secure database connection
const dbConfig = {
  uri: process.env.DATABASE_URL,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    sslValidate: true,
    authSource: 'admin'
  }
};
```

#### Encryption at Rest
```javascript
// Database encryption configuration
const encryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyDerivation: 'pbkdf2',
  iterations: 100000,
  keyLength: 32,
  ivLength: 16
};
```

## 📋 Compliance Procedures

### HIPAA Compliance Checklist

#### Administrative Safeguards
- [ ] Security Officer designated
- [ ] Workforce training completed
- [ ] Access management procedures implemented
- [ ] Contingency plan documented and tested

#### Physical Safeguards
- [ ] Facility access controls implemented
- [ ] Workstation security measures in place
- [ ] Media controls established
- [ ] Device and media disposal procedures documented

#### Technical Safeguards
- [ ] Access control systems implemented
- [ ] Audit controls operational
- [ ] Integrity controls in place
- [ ] Transmission security measures active

### GDPR Compliance Checklist

#### Data Protection Principles
- [ ] Lawfulness, fairness, and transparency
- [ ] Purpose limitation
- [ ] Data minimization
- [ ] Accuracy
- [ ] Storage limitation
- [ ] Integrity and confidentiality
- [ ] Accountability

#### Individual Rights
- [ ] Right to information
- [ ] Right of access
- [ ] Right to rectification
- [ ] Right to erasure
- [ ] Right to restrict processing
- [ ] Right to data portability
- [ ] Right to object
- [ ] Rights related to automated decision making

## 🚨 Incident Response

### Security Incident Procedures

#### 1. Detection and Analysis
```bash
# Check for security incidents
npm run security:incident-check

# Analyze security logs
npm run security:log-analysis

# Generate incident report
npm run security:incident-report
```

#### 2. Containment and Eradication
```bash
# Isolate affected systems
npm run security:isolate

# Apply security patches
npm run security:patch

# Update security configurations
npm run security:update-config
```

#### 3. Recovery and Post-Incident
```bash
# Restore from secure backup
npm run security:restore

# Verify system integrity
npm run security:verify

# Update incident documentation
npm run security:document-incident
```

### Data Breach Response

#### Immediate Actions (0-24 hours)
1. Identify and contain the breach
2. Assess the scope and impact
3. Notify the incident response team
4. Preserve evidence
5. Begin investigation

#### Short-term Actions (1-7 days)
1. Complete detailed investigation
2. Assess regulatory notification requirements
3. Prepare notifications
4. Implement remediation measures
5. Enhance monitoring

#### Long-term Actions (7+ days)
1. Submit regulatory notifications
2. Notify affected individuals
3. Implement process improvements
4. Update policies and procedures
5. Conduct lessons learned review

## 📚 Documentation

### Available Documentation

- `SECURITY_TEST_CHECKLIST.md` - Comprehensive security testing checklist
- `COMPLIANCE_DOCUMENTATION.md` - HIPAA/GDPR compliance documentation
- `API_SECURITY_GUIDE.md` - API security implementation guide
- `DEPLOYMENT_SECURITY.md` - Secure deployment procedures
- `INCIDENT_RESPONSE_PLAN.md` - Detailed incident response procedures

### Code Documentation

```bash
# Generate API documentation
npm run docs:api

# Generate security documentation
npm run docs:security

# Generate compliance documentation
npm run docs:compliance
```

## 🔍 Troubleshooting

### Common Issues

#### Authentication Issues
```bash
# Check JWT configuration
npm run debug:jwt

# Verify user credentials
npm run debug:auth

# Check session status
npm run debug:sessions
```

#### Encryption Issues
```bash
# Verify encryption keys
npm run debug:encryption

# Check key rotation status
npm run debug:key-rotation

# Test encryption/decryption
npm run debug:crypto-test
```

#### Consent Issues
```bash
# Check consent status
npm run debug:consent

# Verify consent validation
npm run debug:consent-validation

# Check consent expiration
npm run debug:consent-expiry
```

### Debug Commands

```bash
# Enable debug logging
DEBUG=mentalverse:* npm start

# Debug specific modules
DEBUG=mentalverse:security npm start
DEBUG=mentalverse:audit npm start
DEBUG=mentalverse:consent npm start
```

## 🤝 Contributing

### Security Contribution Guidelines

1. **Security Review**: All security-related changes require security team review
2. **Testing**: Comprehensive security testing required for all changes
3. **Documentation**: Update security documentation for any changes
4. **Compliance**: Ensure changes maintain HIPAA/GDPR compliance

### Code Review Process

1. Create feature branch
2. Implement changes with tests
3. Run security test suite
4. Submit pull request
5. Security team review
6. Compliance verification
7. Merge after approval

## 📞 Support

### Security Team Contacts

- **Security Officer**: security@mentalverse.com
- **Compliance Officer**: compliance@mentalverse.com
- **Incident Response**: incident@mentalverse.com
- **Emergency Hotline**: +1-XXX-XXX-XXXX

### Reporting Security Issues

1. **Email**: security@mentalverse.com
2. **Encrypted Email**: Use PGP key available at security page
3. **Bug Bounty**: Submit through responsible disclosure program
4. **Emergency**: Call emergency hotline for critical issues

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Next Review**: [Quarterly Review Date]  
**Maintained By**: Security Team

---

*This document contains sensitive security information. Distribution should be limited to authorized personnel only.*