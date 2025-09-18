import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Blob "mo:base/Blob";

module {
    // === TYPE DEFINITIONS ===
    
    public type UserId = Principal;
    public type DoctorId = Text;
    public type AppointmentId = Text;
    public type RecordId = Text;
    
    // User types
    public type UserType = {
        #patient;
        #therapist;
        #doctor;
        #admin;
    };
    
    // PHI Data Types
    public type PHIDataType = {
        #medicalHistory;
        #allergies;
        #medications;
        #personalInfo;
        #labResults;
        #sessionNotes;
        #prescriptions;
        #treatmentPlans;
    };
    
    // Encrypted PHI data structure
    public type EncryptedPHI = {
        encryptedData: Blob;        // AES-256-GCM encrypted data
        iv: Blob;                   // Initialization vector
        keyId: Text;               // Reference to encryption key
        dataType: PHIDataType;     // Type of PHI data encrypted
        timestamp: Int;            // When encrypted
    };
    
    // PHI encryption key management
    public type PHIEncryptionKey = {
        keyId: Text;
        keyHash: Blob;             // Hash of the actual key (not the key itself)
        createdAt: Int;
        expiresAt: ?Int;
        isActive: Bool;
        userId: UserId;
    };
    
    // Encrypted patient data with PHI protection
    public type EncryptedPatientPHI = {
        patientId: UserId;
        encryptedMedicalHistory: ?EncryptedPHI;
        encryptedAllergies: ?EncryptedPHI;
        encryptedCurrentMedications: ?EncryptedPHI;
        encryptedPersonalInfo: ?EncryptedPHI;  // DOB, SSN, etc.
        lastUpdated: Int;
    };
    
    // User Profile
    public type UserProfile = {
        id: UserId;
        firstName: Text;
        lastName: Text;
        email: Text;
        phone: Text;
        userType: UserType;
        isActive: Bool;
        createdAt: Int;
        lastLogin: ?Int;
    };
    
    // Enhanced Patient data model with PHI encryption
    public type Patient = {
        id: UserId;
        firstName: Text;                    // Non-PHI: can remain unencrypted
        lastName: Text;                     // Non-PHI: can remain unencrypted
        email: Text;                        // Non-PHI: can remain unencrypted
        encryptedDateOfBirth: ?EncryptedPHI; // PHI: encrypted
        gender: Text;                       // Non-PHI: can remain unencrypted
        encryptedPhoneNumber: ?EncryptedPHI; // PHI: encrypted
        encryptedEmergencyContact: ?EncryptedPHI; // PHI: encrypted
        isActive: Bool;
        // Deprecated fields (for backward compatibility)
        dateOfBirth: Text;                  // Deprecated: use encryptedDateOfBirth
        phoneNumber: Text;                  // Deprecated: use encryptedPhoneNumber
        emergencyContact: Text;             // Deprecated: use encryptedEmergencyContact
        medicalHistory: [Text];             // Deprecated: use EncryptedPatientPHI
        allergies: [Text];                  // Deprecated: use EncryptedPatientPHI
        currentMedications: [Text];         // Deprecated: use EncryptedPatientPHI
        createdAt: Int;
        lastUpdated: Int;
    };
    
    // Enhanced Therapist data model
    public type Therapist = {
        id: DoctorId;
        firstName: Text;
        lastName: Text;
        email: Text;
        phone: Text;
        specialization: Text;
        licenseNumber: Text;
        yearsOfExperience: Nat;
        education: [Text];
        certifications: [Text];
        isVerified: Bool;
        isActive: Bool;
        consultationFee: Nat; // in MVT tokens
        availableSlots: [Text]; // Time slots
        rating: Float;
        totalAppointments: Nat;
        createdAt: Int;
        lastUpdated: Int;
    };
    
    // Legacy Doctor type for backward compatibility
    public type Doctor = Therapist;
    
    // Appointment data model
    public type AppointmentStatus = {
        #scheduled;
        #confirmed;
        #in_progress;
        #completed;
        #cancelled;
        #no_show;
    };
    
    public type AppointmentType = {
        #consultation;
        #follow_up;
        #therapy_session;
        #group_therapy;
        #emergency;
    };
    
    public type Appointment = {
        id: AppointmentId;
        patientId: UserId;
        doctorId: DoctorId;
        appointmentType: AppointmentType;
        scheduledDate: Text;
        startTime: Text;
        endTime: Text;
        status: AppointmentStatus;
        notes: Text;
        symptoms: Text;
        diagnosis: Text;
        prescription: Text;
        isConfidential: Bool;
        createdAt: Int;
        lastUpdated: Int;
    };
    
    // Medical record data model with PHI encryption
    public type MedicalRecord = {
        id: RecordId;
        patientId: UserId;
        doctorId: DoctorId;
        appointmentId: ?AppointmentId;
        recordType: Text; // "consultation", "lab_result", "prescription", "diagnosis"
        title: Text;                        // Non-PHI: can remain unencrypted
        encryptedDescription: ?EncryptedPHI; // PHI: encrypted medical content
        encryptedAttachments: ?EncryptedPHI; // PHI: encrypted file references
        isConfidential: Bool;
        // Deprecated fields
        description: Text;                  // Deprecated: use encryptedDescription
        attachments: [Text];                // Deprecated: use encryptedAttachments
        createdAt: Int;
        lastUpdated: Int;
    };
    
    // Message data model for secure communication
    public type Message = {
        id: Text;
        senderId: UserId;
        receiverId: UserId;
        content: Text;
        messageType: Text; // "text", "file", "image", "voice"
        timestamp: Int;
        isRead: Bool;
        isEncrypted: Bool;
        encryptionLevel: EncryptionLevel;
    };
    
    public type EncryptionLevel = {
        #none;
        #basic;
        #advanced;
        #phi_compliant;
    };
    
    // Consent and session management types
    public type ConsentType = {
        #medicalRecords;
        #sessionNotes;
        #prescriptions;
        #dataSharing;
        #research;
        #marketing;
    };
    
    public type ConsentRecord = {
        id: Text;
        patientId: UserId;
        therapistId: Text;
        consentType: ConsentType;
        isGranted: Bool;
        grantedAt: ?Int;
        revokedAt: ?Int;
        expiresAt: ?Int;
        notes: Text;
    };
    
    public type TherapistAvailability = {
        therapistId: Text;
        dayOfWeek: Text; // "monday", "tuesday", etc.
        startTime: Text; // "09:00"
        endTime: Text;   // "17:00"
        isAvailable: Bool;
        maxAppointments: Nat;
        currentAppointments: Nat;
    };
    
    public type SessionPricing = {
        therapistId: Text;
        sessionType: Text; // "individual", "group", "family"
        duration: Nat; // in minutes
        priceInMVT: Nat;
        currency: Text;
        isActive: Bool;
    };
    
    public type SessionRequest = {
        id: Text;
        patientId: UserId;
        therapistId: Text;
        requestedDate: Text;
        requestedTime: Text;
        sessionType: Text;
        urgencyLevel: Text; // "low", "medium", "high", "emergency"
        notes: Text;
        status: Text; // "pending", "approved", "rejected"
        createdAt: Int;
        respondedAt: ?Int;
    };
    
    // Medical Records & Storage types
    public type SessionNote = {
        id: Text;
        sessionId: Text;
        therapistId: Text;
        patientId: UserId;
        sessionDate: Text;
        duration: Nat; // in minutes
        notes: Text;
        mood: Text;
        progress: Text;
        nextSteps: Text;
        isConfidential: Bool;
        encryptionLevel: EncryptionLevel;
        createdAt: Int;
    };
    
    public type Prescription = {
        id: Text;
        patientId: UserId;
        therapistId: Text;
        sessionId: ?Text;
        medicationName: Text;
        dosage: Text;
        frequency: Text;
        duration: Text;
        instructions: Text;
        sideEffects: Text;
        isActive: Bool;
        prescribedAt: Int;
        expiresAt: ?Int;
        encryptionLevel: EncryptionLevel;
    };
    
    public type TreatmentSummary = {
        id: Text;
        patientId: UserId;
        therapistId: Text;
        treatmentPeriod: Text; // "2024-01 to 2024-06"
        diagnosis: Text;
        treatmentGoals: [Text];
        interventions: [Text];
        outcomes: Text;
        recommendations: Text;
        attachments: [Text]; // File hashes or URLs
        isCompleted: Bool;
        createdAt: Int;
        completedAt: ?Int;
        encryptionLevel: EncryptionLevel;
    };
    
    // Audit logging types
    public type AuditLogAction = {
        #create;
        #read;
        #update;
        #delete;
        #login;
        #logout;
        #access_denied;
        #data_export;
        #data_import;
    };
    
    public type AuditLog = {
        id: Text;
        userId: UserId;
        action: AuditLogAction;
        resourceType: Text; // "session_note", "prescription", "treatment_summary", etc.
        resourceId: ?Text;
        timestamp: Int;
        ipAddress: ?Text;
        userAgent: ?Text;
        success: Bool;
        errorMessage: ?Text;
        additionalData: ?Text;
        // Hash-chaining for integrity
        previousHash: ?Text;
        currentHash: Text;
    };
    
    public type AuditLogPage = {
        logs: [AuditLog];
        totalCount: Nat;
        hasMore: Bool;
        nextCursor: ?Text;
    };
    
    public type AuditLogFilter = {
        userId: ?UserId;
        action: ?AuditLogAction;
        resourceType: ?Text;
        startTime: ?Int;
        endTime: ?Int;
    };
    
    // Access control types
    public type AccessControlRule = {
        id: Text;
        resourceType: Text;
        resourceId: ?Text;
        principalId: UserId;
        permissions: [Text]; // ["read", "write", "delete"]
        conditions: ?Text; // JSON string for complex conditions
        isActive: Bool;
        createdAt: Int;
        expiresAt: ?Int;
    };
    
    // Payment integration types
    public type PaymentStatus = {
        #pending;
        #processing;
        #completed;
        #failed;
        #refunded;
        #disputed;
    };
    
    public type PaymentTransaction = {
        id: Text;
        payerId: UserId;
        payeeId: UserId;
        amount: Nat; // in MVT tokens
        currency: Text;
        transactionType: Text; // "appointment_fee", "subscription", "penalty"
        status: PaymentStatus;
        sessionId: ?Text;
        appointmentId: ?AppointmentId;
        createdAt: Int;
        completedAt: ?Int;
        failureReason: ?Text;
    };
    
    public type EscrowStatus = {
        #created;
        #funded;
        #released;
        #refunded;
        #disputed;
        #resolved;
    };
    
    public type EscrowContract = {
        id: Text;
        payerId: UserId;
        payeeId: UserId;
        amount: Nat;
        currency: Text;
        serviceDescription: Text;
        status: EscrowStatus;
        createdAt: Int;
        fundedAt: ?Int;
        releasedAt: ?Int;
        disputeReason: ?Text;
        disputeResolution: ?Text;
    };
    
    public type PaymentPlan = {
        id: Text;
        userId: UserId;
        totalAmount: Nat;
        paidAmount: Nat;
        installments: Nat;
        installmentAmount: Nat;
        frequency: Text; // "weekly", "monthly"
        startDate: Int;
        nextPaymentDate: Int;
        isActive: Bool;
        completedAt: ?Int;
    };
    
    // Chat interaction types
    public type ChatInteraction = {
        id: Text;
        userId: UserId;
        message: Text;
        response: Text;
        timestamp: Int;
        sessionId: ?Text;
        rating: ?Nat; // 1-5 scale
        feedback: ?Text;
    };
    
    // Faucet claim types
    public type FaucetClaim = {
        id: Text;
        userId: UserId;
        amount: Nat;
        claimType: Text;
        timestamp: Int;
        transactionId: ?Text;
    };
    
    // === STORAGE CLASS ===
    
    public class Storage() {
        // === NON-STABLE HASHMAPS (initialized with empty state) ===
        
        // Core data HashMaps
        private var userProfiles = HashMap.HashMap<UserId, UserProfile>(50, Principal.equal, Principal.hash);
        private var patients = HashMap.HashMap<UserId, Patient>(10, Principal.equal, Principal.hash);
        private var therapists = HashMap.HashMap<DoctorId, Therapist>(10, Text.equal, Text.hash);
        private var doctors = HashMap.HashMap<DoctorId, Doctor>(10, Text.equal, Text.hash); // Legacy support
        private var appointments = HashMap.HashMap<AppointmentId, Appointment>(10, Text.equal, Text.hash);
        private var medicalRecords = HashMap.HashMap<RecordId, MedicalRecord>(10, Text.equal, Text.hash);
        private var messages = HashMap.HashMap<Text, Message>(10, Text.equal, Text.hash);
        private var userRoles = HashMap.HashMap<UserId, Text>(10, Principal.equal, Principal.hash); // Legacy support
        private var chatInteractionsMap = HashMap.HashMap<Text, ChatInteraction>(10, Text.equal, Text.hash);
        private var faucetClaims = HashMap.HashMap<Text, FaucetClaim>(10, Text.equal, Text.hash);
        private var lastClaimTimes = HashMap.HashMap<UserId, Int>(10, Principal.equal, Principal.hash);
        
        // User management HashMaps
        private var onboardingStates = HashMap.HashMap<Principal, Bool>(100, Principal.equal, Principal.hash);
        private var userRoleAssignments = HashMap.HashMap<Principal, UserType>(100, Principal.equal, Principal.hash);
        private var adminUsers = HashMap.HashMap<Principal, Bool>(20, Principal.equal, Principal.hash);
        
        // Session and consent management HashMaps
        private var consentRecords = HashMap.HashMap<Text, ConsentRecord>(10, Text.equal, Text.hash);
        private var therapistAvailability = HashMap.HashMap<Text, TherapistAvailability>(10, Text.equal, Text.hash);
        private var sessionPricing = HashMap.HashMap<Text, SessionPricing>(10, Text.equal, Text.hash);
        private var sessionRequests = HashMap.HashMap<Text, SessionRequest>(10, Text.equal, Text.hash);
        
        // Medical Records & Storage HashMaps
        private var sessionNotes = HashMap.HashMap<Text, SessionNote>(10, Text.equal, Text.hash);
        private var prescriptions = HashMap.HashMap<Text, Prescription>(10, Text.equal, Text.hash);
        private var treatmentSummaries = HashMap.HashMap<Text, TreatmentSummary>(10, Text.equal, Text.hash);
        private var auditLogs = HashMap.HashMap<Text, AuditLog>(50, Text.equal, Text.hash);
        private var accessControlRules = HashMap.HashMap<Text, AccessControlRule>(20, Text.equal, Text.hash);
        
        // Payment Integration HashMaps
        private var paymentTransactions = HashMap.HashMap<Text, PaymentTransaction>(50, Text.equal, Text.hash);
        private var escrowContracts = HashMap.HashMap<Text, EscrowContract>(20, Text.equal, Text.hash);
        private var paymentPlans = HashMap.HashMap<Text, PaymentPlan>(20, Text.equal, Text.hash);
        
        // PHI Encryption Storage
        private var encryptedPatientPHI = HashMap.HashMap<UserId, EncryptedPatientPHI>(10, Principal.equal, Principal.hash);
        private var phiEncryptionKeys = HashMap.HashMap<Text, PHIEncryptionKey>(50, Text.equal, Text.hash);
        private var userPHIKeys = HashMap.HashMap<UserId, Text>(10, Principal.equal, Principal.hash); // Maps user to their PHI key ID
        
        // Audit state
        private var lastAuditHash : ?Text = null;
        private var auditSequenceNumber : Nat = 0;
        
        // === INITIALIZATION FROM EXTERNAL STABLE STORAGE ===
        
        public func initializeFromStableStorage(
            userProfilesEntries: [(UserId, UserProfile)],
            patientsEntries: [(UserId, Patient)],
            therapistsEntries: [(DoctorId, Therapist)],
            doctorsEntries: [(DoctorId, Doctor)],
            appointmentsEntries: [(AppointmentId, Appointment)],
            medicalRecordsEntries: [(RecordId, MedicalRecord)],
            messagesEntries: [(Text, Message)],
            userRolesEntries: [(UserId, Text)],
            chatInteractionsEntries: [(Text, ChatInteraction)],
            faucetClaimsEntries: [(Text, FaucetClaim)],
            lastClaimTimesEntries: [(UserId, Int)],
            consentRecordsEntries: [(Text, ConsentRecord)],
            therapistAvailabilityEntries: [(Text, TherapistAvailability)],
            sessionPricingEntries: [(Text, SessionPricing)],
            sessionRequestsEntries: [(Text, SessionRequest)],
            sessionNotesEntries: [(Text, SessionNote)],
            prescriptionsEntries: [(Text, Prescription)],
            treatmentSummariesEntries: [(Text, TreatmentSummary)],
            auditLogsEntries: [(Text, AuditLog)],
            accessControlRulesEntries: [(Text, AccessControlRule)],
            paymentTransactionsEntries: [(Text, PaymentTransaction)],
            escrowContractsEntries: [(Text, EscrowContract)],
            paymentPlansEntries: [(Text, PaymentPlan)],
            encryptedPatientPHIEntries: [(UserId, EncryptedPatientPHI)],
            phiEncryptionKeysEntries: [(Text, PHIEncryptionKey)],
            userPHIKeysEntries: [(UserId, Text)],
            onboardingStatesEntries: [(Principal, Bool)],
            userRoleAssignmentsEntries: [(Principal, UserType)],
            adminUsersEntries: [(Principal, Bool)],
            savedLastAuditHash: ?Text,
            savedAuditSequenceNumber: Nat
        ) {
            // Restore data from stable storage
            for ((id, profile) in userProfilesEntries.vals()) {
                userProfiles.put(id, profile);
            };
            for ((id, patient) in patientsEntries.vals()) {
                patients.put(id, patient);
            };
            for ((id, therapist) in therapistsEntries.vals()) {
                therapists.put(id, therapist);
            };
            for ((id, doctor) in doctorsEntries.vals()) {
                doctors.put(id, doctor);
            };
            for ((id, appointment) in appointmentsEntries.vals()) {
                appointments.put(id, appointment);
            };
            for ((id, record) in medicalRecordsEntries.vals()) {
                medicalRecords.put(id, record);
            };
            for ((id, message) in messagesEntries.vals()) {
                messages.put(id, message);
            };
            for ((id, role) in userRolesEntries.vals()) {
                userRoles.put(id, role);
            };
            for ((id, interaction) in chatInteractionsEntries.vals()) {
                chatInteractionsMap.put(id, interaction);
            };
            for ((id, claim) in faucetClaimsEntries.vals()) {
                faucetClaims.put(id, claim);
            };
            for ((id, time) in lastClaimTimesEntries.vals()) {
                lastClaimTimes.put(id, time);
            };
            
            // Restore session and consent management data
            for ((id, consent) in consentRecordsEntries.vals()) {
                consentRecords.put(id, consent);
            };
            for ((id, availability) in therapistAvailabilityEntries.vals()) {
                therapistAvailability.put(id, availability);
            };
            for ((id, pricing) in sessionPricingEntries.vals()) {
                sessionPricing.put(id, pricing);
            };
            for ((id, request) in sessionRequestsEntries.vals()) {
                sessionRequests.put(id, request);
            };
            
            // Restore medical records and storage data
            for ((id, note) in sessionNotesEntries.vals()) {
                sessionNotes.put(id, note);
            };
            for ((id, prescription) in prescriptionsEntries.vals()) {
                prescriptions.put(id, prescription);
            };
            for ((id, summary) in treatmentSummariesEntries.vals()) {
                treatmentSummaries.put(id, summary);
            };
            for ((id, log) in auditLogsEntries.vals()) {
                auditLogs.put(id, log);
            };
            for ((id, rule) in accessControlRulesEntries.vals()) {
                accessControlRules.put(id, rule);
            };
            
            // Restore payment integration data
            for ((id, transaction) in paymentTransactionsEntries.vals()) {
                paymentTransactions.put(id, transaction);
            };
            for ((id, contract) in escrowContractsEntries.vals()) {
                escrowContracts.put(id, contract);
            };
            for ((id, plan) in paymentPlansEntries.vals()) {
                paymentPlans.put(id, plan);
            };
            
            // Restore PHI encryption data
            for ((userId, phi) in encryptedPatientPHIEntries.vals()) {
                encryptedPatientPHI.put(userId, phi);
            };
            for ((keyId, key) in phiEncryptionKeysEntries.vals()) {
                phiEncryptionKeys.put(keyId, key);
            };
            for ((userId, keyId) in userPHIKeysEntries.vals()) {
                userPHIKeys.put(userId, keyId);
            };
            
            // Restore user management data
            for ((userId, completed) in onboardingStatesEntries.vals()) {
                onboardingStates.put(userId, completed);
            };
            for ((userId, role) in userRoleAssignmentsEntries.vals()) {
                userRoleAssignments.put(userId, role);
            };
            for ((userId, isAdmin) in adminUsersEntries.vals()) {
                adminUsers.put(userId, isAdmin);
            };
            
            // Restore audit state
            lastAuditHash := savedLastAuditHash;
            auditSequenceNumber := savedAuditSequenceNumber;
        };
        
        public func exportStableStorage() : {
            userProfilesEntries: [(UserId, UserProfile)];
            patientsEntries: [(UserId, Patient)];
            therapistsEntries: [(DoctorId, Therapist)];
            doctorsEntries: [(DoctorId, Doctor)];
            appointmentsEntries: [(AppointmentId, Appointment)];
            medicalRecordsEntries: [(RecordId, MedicalRecord)];
            messagesEntries: [(Text, Message)];
            userRolesEntries: [(UserId, Text)];
            chatInteractionsEntries: [(Text, ChatInteraction)];
            faucetClaimsEntries: [(Text, FaucetClaim)];
            lastClaimTimesEntries: [(UserId, Int)];
            consentRecordsEntries: [(Text, ConsentRecord)];
            therapistAvailabilityEntries: [(Text, TherapistAvailability)];
            sessionPricingEntries: [(Text, SessionPricing)];
            sessionRequestsEntries: [(Text, SessionRequest)];
            sessionNotesEntries: [(Text, SessionNote)];
            prescriptionsEntries: [(Text, Prescription)];
            treatmentSummariesEntries: [(Text, TreatmentSummary)];
            auditLogsEntries: [(Text, AuditLog)];
            accessControlRulesEntries: [(Text, AccessControlRule)];
            paymentTransactionsEntries: [(Text, PaymentTransaction)];
            escrowContractsEntries: [(Text, EscrowContract)];
            paymentPlansEntries: [(Text, PaymentPlan)];
            encryptedPatientPHIEntries: [(UserId, EncryptedPatientPHI)];
            phiEncryptionKeysEntries: [(Text, PHIEncryptionKey)];
            userPHIKeysEntries: [(UserId, Text)];
            onboardingStatesEntries: [(Principal, Bool)];
            userRoleAssignmentsEntries: [(Principal, UserType)];
            adminUsersEntries: [(Principal, Bool)];
            lastAuditHash: ?Text;
            auditSequenceNumber: Nat;
        } {
            {
                userProfilesEntries = Iter.toArray(userProfiles.entries());
                patientsEntries = Iter.toArray(patients.entries());
                therapistsEntries = Iter.toArray(therapists.entries());
                doctorsEntries = Iter.toArray(doctors.entries());
                appointmentsEntries = Iter.toArray(appointments.entries());
                medicalRecordsEntries = Iter.toArray(medicalRecords.entries());
                messagesEntries = Iter.toArray(messages.entries());
                userRolesEntries = Iter.toArray(userRoles.entries());
                chatInteractionsEntries = Iter.toArray(chatInteractionsMap.entries());
                faucetClaimsEntries = Iter.toArray(faucetClaims.entries());
                lastClaimTimesEntries = Iter.toArray(lastClaimTimes.entries());
                consentRecordsEntries = Iter.toArray(consentRecords.entries());
                therapistAvailabilityEntries = Iter.toArray(therapistAvailability.entries());
                sessionPricingEntries = Iter.toArray(sessionPricing.entries());
                sessionRequestsEntries = Iter.toArray(sessionRequests.entries());
                sessionNotesEntries = Iter.toArray(sessionNotes.entries());
                prescriptionsEntries = Iter.toArray(prescriptions.entries());
                treatmentSummariesEntries = Iter.toArray(treatmentSummaries.entries());
                auditLogsEntries = Iter.toArray(auditLogs.entries());
                accessControlRulesEntries = Iter.toArray(accessControlRules.entries());
                paymentTransactionsEntries = Iter.toArray(paymentTransactions.entries());
                escrowContractsEntries = Iter.toArray(escrowContracts.entries());
                paymentPlansEntries = Iter.toArray(paymentPlans.entries());
                encryptedPatientPHIEntries = Iter.toArray(encryptedPatientPHI.entries());
                phiEncryptionKeysEntries = Iter.toArray(phiEncryptionKeys.entries());
                userPHIKeysEntries = Iter.toArray(userPHIKeys.entries());
                onboardingStatesEntries = Iter.toArray(onboardingStates.entries());
                userRoleAssignmentsEntries = Iter.toArray(userRoleAssignments.entries());
                adminUsersEntries = Iter.toArray(adminUsers.entries());
                lastAuditHash = lastAuditHash;
                auditSequenceNumber = auditSequenceNumber;
            }
        };
        
        // === USER PROFILE OPERATIONS ===
        
        public func putUserProfile(id: UserId, profile: UserProfile) {
            userProfiles.put(id, profile);
        };
        
        public func getUserProfile(id: UserId) : ?UserProfile {
            userProfiles.get(id)
        };
        
        public func deleteUserProfile(id: UserId) {
            userProfiles.delete(id);
        };
        
        public func getAllUserProfiles() : [(UserId, UserProfile)] {
            Iter.toArray(userProfiles.entries())
        };
        
        // === PATIENT OPERATIONS ===
        
        public func putPatient(id: UserId, patient: Patient) {
            patients.put(id, patient);
        };
        
        public func getPatient(id: UserId) : ?Patient {
            patients.get(id)
        };
        
        public func deletePatient(id: UserId) {
            patients.delete(id);
        };
        
        public func getAllPatients() : [(UserId, Patient)] {
            Iter.toArray(patients.entries())
        };
        
        // === THERAPIST OPERATIONS ===
        
        public func putTherapist(id: DoctorId, therapist: Therapist) {
            therapists.put(id, therapist);
        };
        
        public func getTherapist(id: DoctorId) : ?Therapist {
            therapists.get(id)
        };
        
        public func deleteTherapist(id: DoctorId) {
            therapists.delete(id);
        };
        
        public func getAllTherapists() : [(DoctorId, Therapist)] {
            Iter.toArray(therapists.entries())
        };
        
        // === DOCTOR OPERATIONS (Legacy) ===
        
        public func putDoctor(id: DoctorId, doctor: Doctor) {
            doctors.put(id, doctor);
        };
        
        public func getDoctor(id: DoctorId) : ?Doctor {
            doctors.get(id)
        };
        
        public func deleteDoctor(id: DoctorId) {
            doctors.delete(id);
        };
        
        public func getAllDoctors() : [(DoctorId, Doctor)] {
            Iter.toArray(doctors.entries())
        };
        
        // === APPOINTMENT OPERATIONS ===
        
        public func putAppointment(id: AppointmentId, appointment: Appointment) {
            appointments.put(id, appointment);
        };
        
        public func getAppointment(id: AppointmentId) : ?Appointment {
            appointments.get(id)
        };
        
        public func deleteAppointment(id: AppointmentId) {
            appointments.delete(id);
        };
        
        public func getAllAppointments() : [(AppointmentId, Appointment)] {
            Iter.toArray(appointments.entries())
        };
        
        // === MEDICAL RECORD OPERATIONS ===
        
        public func putMedicalRecord(id: RecordId, record: MedicalRecord) {
            medicalRecords.put(id, record);
        };
        
        public func getMedicalRecord(id: RecordId) : ?MedicalRecord {
            medicalRecords.get(id)
        };
        
        public func deleteMedicalRecord(id: RecordId) {
            medicalRecords.delete(id);
        };
        
        public func getAllMedicalRecords() : [(RecordId, MedicalRecord)] {
            Iter.toArray(medicalRecords.entries())
        };
        
        // === MESSAGE OPERATIONS ===
        
        public func putMessage(id: Text, message: Message) {
            messages.put(id, message);
        };
        
        public func getMessage(id: Text) : ?Message {
            messages.get(id)
        };
        
        public func deleteMessage(id: Text) {
            messages.delete(id);
        };
        
        public func getAllMessages() : [(Text, Message)] {
            Iter.toArray(messages.entries())
        };
        
        // === CONSENT RECORD OPERATIONS ===
        
        public func putConsentRecord(id: Text, consent: ConsentRecord) {
            consentRecords.put(id, consent);
        };
        
        public func getConsentRecord(id: Text) : ?ConsentRecord {
            consentRecords.get(id)
        };
        
        public func deleteConsentRecord(id: Text) {
            consentRecords.delete(id);
        };
        
        public func getAllConsentRecords() : [(Text, ConsentRecord)] {
            Iter.toArray(consentRecords.entries())
        };
        
        // === THERAPIST AVAILABILITY OPERATIONS ===
        
        public func putTherapistAvailability(id: Text, availability: TherapistAvailability) {
            therapistAvailability.put(id, availability);
        };
        
        public func getTherapistAvailability(id: Text) : ?TherapistAvailability {
            therapistAvailability.get(id)
        };
        
        public func deleteTherapistAvailability(id: Text) {
            therapistAvailability.delete(id);
        };
        
        public func getAllTherapistAvailability() : [(Text, TherapistAvailability)] {
            Iter.toArray(therapistAvailability.entries())
        };
        
        // === SESSION PRICING OPERATIONS ===
        
        public func putSessionPricing(id: Text, pricing: SessionPricing) {
            sessionPricing.put(id, pricing);
        };
        
        public func getSessionPricing(id: Text) : ?SessionPricing {
            sessionPricing.get(id)
        };
        
        public func deleteSessionPricing(id: Text) {
            sessionPricing.delete(id);
        };
        
        public func getAllSessionPricing() : [(Text, SessionPricing)] {
            Iter.toArray(sessionPricing.entries())
        };
        
        // === SESSION REQUEST OPERATIONS ===
        
        public func putSessionRequest(id: Text, request: SessionRequest) {
            sessionRequests.put(id, request);
        };
        
        public func getSessionRequest(id: Text) : ?SessionRequest {
            sessionRequests.get(id)
        };
        
        public func deleteSessionRequest(id: Text) {
            sessionRequests.delete(id);
        };
        
        public func getAllSessionRequests() : [(Text, SessionRequest)] {
            Iter.toArray(sessionRequests.entries())
        };
        
        // === SESSION NOTE OPERATIONS ===
        
        public func putSessionNote(id: Text, note: SessionNote) {
            sessionNotes.put(id, note);
        };
        
        public func getSessionNote(id: Text) : ?SessionNote {
            sessionNotes.get(id)
        };
        
        public func deleteSessionNote(id: Text) {
            sessionNotes.delete(id);
        };
        
        public func getAllSessionNotes() : [(Text, SessionNote)] {
            Iter.toArray(sessionNotes.entries())
        };
        
        // === PRESCRIPTION OPERATIONS ===
        
        public func putPrescription(id: Text, prescription: Prescription) {
            prescriptions.put(id, prescription);
        };
        
        public func getPrescription(id: Text) : ?Prescription {
            prescriptions.get(id)
        };
        
        public func deletePrescription(id: Text) {
            prescriptions.delete(id);
        };
        
        public func getAllPrescriptions() : [(Text, Prescription)] {
            Iter.toArray(prescriptions.entries())
        };
        
        // === TREATMENT SUMMARY OPERATIONS ===
        
        public func putTreatmentSummary(id: Text, summary: TreatmentSummary) {
            treatmentSummaries.put(id, summary);
        };
        
        public func getTreatmentSummary(id: Text) : ?TreatmentSummary {
            treatmentSummaries.get(id)
        };
        
        public func deleteTreatmentSummary(id: Text) {
            treatmentSummaries.delete(id);
        };
        
        public func getAllTreatmentSummaries() : [(Text, TreatmentSummary)] {
            Iter.toArray(treatmentSummaries.entries())
        };
        
        // === AUDIT LOG OPERATIONS ===
        
        public func putAuditLog(id: Text, log: AuditLog) {
            auditLogs.put(id, log);
        };
        
        public func getAuditLog(id: Text) : ?AuditLog {
            auditLogs.get(id)
        };
        
        public func getAllAuditLogs() : [(Text, AuditLog)] {
            Iter.toArray(auditLogs.entries())
        };
        
        public func getLastAuditHash() : ?Text {
            lastAuditHash
        };
        
        public func setLastAuditHash(hash: ?Text) {
            lastAuditHash := hash;
        };
        
        public func getAuditSequenceNumber() : Nat {
            auditSequenceNumber
        };
        
        public func incrementAuditSequenceNumber() {
            auditSequenceNumber += 1;
        };
        
        // === ACCESS CONTROL RULE OPERATIONS ===
        
        public func putAccessControlRule(id: Text, rule: AccessControlRule) {
            accessControlRules.put(id, rule);
        };
        
        public func getAccessControlRule(id: Text) : ?AccessControlRule {
            accessControlRules.get(id)
        };
        
        public func deleteAccessControlRule(id: Text) {
            accessControlRules.delete(id);
        };
        
        public func getAllAccessControlRules() : [(Text, AccessControlRule)] {
            Iter.toArray(accessControlRules.entries())
        };
        
        // === PAYMENT TRANSACTION OPERATIONS ===
        
        public func putPaymentTransaction(id: Text, transaction: PaymentTransaction) {
            paymentTransactions.put(id, transaction);
        };
        
        public func getPaymentTransaction(id: Text) : ?PaymentTransaction {
            paymentTransactions.get(id)
        };
        
        public func deletePaymentTransaction(id: Text) {
            paymentTransactions.delete(id);
        };
        
        public func getAllPaymentTransactions() : [(Text, PaymentTransaction)] {
            Iter.toArray(paymentTransactions.entries())
        };
        
        // === ESCROW CONTRACT OPERATIONS ===
        
        public func putEscrowContract(id: Text, contract: EscrowContract) {
            escrowContracts.put(id, contract);
        };
        
        public func getEscrowContract(id: Text) : ?EscrowContract {
            escrowContracts.get(id)
        };
        
        public func deleteEscrowContract(id: Text) {
            escrowContracts.delete(id);
        };
        
        public func getAllEscrowContracts() : [(Text, EscrowContract)] {
            Iter.toArray(escrowContracts.entries())
        };
        
        // === PAYMENT PLAN OPERATIONS ===
        
        public func putPaymentPlan(id: Text, plan: PaymentPlan) {
            paymentPlans.put(id, plan);
        };
        
        public func getPaymentPlan(id: Text) : ?PaymentPlan {
            paymentPlans.get(id)
        };
        
        public func deletePaymentPlan(id: Text) {
            paymentPlans.delete(id);
        };
        
        public func getAllPaymentPlans() : [(Text, PaymentPlan)] {
            Iter.toArray(paymentPlans.entries())
        };
        
        // === PHI ENCRYPTION OPERATIONS ===
        
        public func putEncryptedPatientPHI(id: UserId, phi: EncryptedPatientPHI) {
            encryptedPatientPHI.put(id, phi);
        };
        
        public func getEncryptedPatientPHI(id: UserId) : ?EncryptedPatientPHI {
            encryptedPatientPHI.get(id)
        };
        
        public func deleteEncryptedPatientPHI(id: UserId) {
            encryptedPatientPHI.delete(id);
        };
        
        public func getAllEncryptedPatientPHI() : [(UserId, EncryptedPatientPHI)] {
            Iter.toArray(encryptedPatientPHI.entries())
        };
        
        public func putPHIEncryptionKey(id: Text, key: PHIEncryptionKey) {
            phiEncryptionKeys.put(id, key);
        };
        
        public func getPHIEncryptionKey(id: Text) : ?PHIEncryptionKey {
            phiEncryptionKeys.get(id)
        };
        
        public func deletePHIEncryptionKey(id: Text) {
            phiEncryptionKeys.delete(id);
        };
        
        public func getAllPHIEncryptionKeys() : [(Text, PHIEncryptionKey)] {
            Iter.toArray(phiEncryptionKeys.entries())
        };
        
        public func putUserPHIKey(userId: UserId, keyId: Text) {
            userPHIKeys.put(userId, keyId);
        };
        
        public func getUserPHIKey(userId: UserId) : ?Text {
            userPHIKeys.get(userId)
        };
        
        public func deleteUserPHIKey(userId: UserId) {
            userPHIKeys.delete(userId);
        };
        
        public func getAllUserPHIKeys() : [(UserId, Text)] {
            Iter.toArray(userPHIKeys.entries())
        };
        
        // === USER ROLE OPERATIONS ===
        
        public func putUserRoleAssignment(userId: Principal, role: UserType) {
            userRoleAssignments.put(userId, role);
        };
        
        public func getUserRoleAssignment(userId: Principal) : ?UserType {
            userRoleAssignments.get(userId)
        };
        
        public func deleteUserRoleAssignment(userId: Principal) {
            userRoleAssignments.delete(userId);
        };
        
        public func getAllUserRoleAssignments() : [(Principal, UserType)] {
            Iter.toArray(userRoleAssignments.entries())
        };
        
        public func putAdminUser(userId: Principal, isAdmin: Bool) {
            adminUsers.put(userId, isAdmin);
        };
        
        public func getAdminUser(userId: Principal) : ?Bool {
            adminUsers.get(userId)
        };
        
        public func deleteAdminUser(userId: Principal) {
            adminUsers.delete(userId);
        };
        
        public func getAllAdminUsers() : [(Principal, Bool)] {
            Iter.toArray(adminUsers.entries())
        };
        
        public func putOnboardingState(userId: Principal, completed: Bool) {
            onboardingStates.put(userId, completed);
        };
        
        public func getOnboardingState(userId: Principal) : ?Bool {
            onboardingStates.get(userId)
        };
        
        public func deleteOnboardingState(userId: Principal) {
            onboardingStates.delete(userId);
        };
        
        public func getAllOnboardingStates() : [(Principal, Bool)] {
            Iter.toArray(onboardingStates.entries())
        };
        
        // === LEGACY USER ROLE OPERATIONS ===
        
        public func putUserRole(userId: UserId, role: Text) {
            userRoles.put(userId, role);
        };
        
        public func getUserRole(userId: UserId) : ?Text {
            userRoles.get(userId)
        };
        
        public func deleteUserRole(userId: UserId) {
            userRoles.delete(userId);
        };
        
        public func getAllUserRoles() : [(UserId, Text)] {
            Iter.toArray(userRoles.entries())
        };
        
        // === CHAT INTERACTION OPERATIONS ===
        
        public func putChatInteraction(id: Text, interaction: ChatInteraction) {
            chatInteractionsMap.put(id, interaction);
        };
        
        public func getChatInteraction(id: Text) : ?ChatInteraction {
            chatInteractionsMap.get(id)
        };
        
        public func deleteChatInteraction(id: Text) {
            chatInteractionsMap.delete(id);
        };
        
        public func getAllChatInteractions() : [(Text, ChatInteraction)] {
            Iter.toArray(chatInteractionsMap.entries())
        };
        
        // === FAUCET CLAIM OPERATIONS ===
        
        public func putFaucetClaim(id: Text, claim: FaucetClaim) {
            faucetClaims.put(id, claim);
        };
        
        public func getFaucetClaim(id: Text) : ?FaucetClaim {
            faucetClaims.get(id)
        };
        
        public func deleteFaucetClaim(id: Text) {
            faucetClaims.delete(id);
        };
        
        public func getAllFaucetClaims() : [(Text, FaucetClaim)] {
            Iter.toArray(faucetClaims.entries())
        };
        
        public func putLastClaimTime(userId: UserId, time: Int) {
            lastClaimTimes.put(userId, time);
        };
        
        public func getLastClaimTime(userId: UserId) : ?Int {
            lastClaimTimes.get(userId)
        };
        
        public func deleteLastClaimTime(userId: UserId) {
            lastClaimTimes.delete(userId);
        };
        
        public func getAllLastClaimTimes() : [(UserId, Int)] {
            Iter.toArray(lastClaimTimes.entries())
        };
        
        // === STATISTICS ===
        
        public func getSystemStats() : {
            totalUserProfiles: Nat;
            totalPatients: Nat;
            totalTherapists: Nat;
            totalDoctors: Nat;
            totalAppointments: Nat;
            totalMedicalRecords: Nat;
            totalMessages: Nat;
            totalAuditLogs: Nat;
            totalConsentRecords: Nat;
            totalSessionNotes: Nat;
            totalPrescriptions: Nat;
            totalTreatmentSummaries: Nat;
            totalPaymentTransactions: Nat;
            totalEscrowContracts: Nat;
            totalPaymentPlans: Nat;
            totalEncryptedPatientPHI: Nat;
            totalPHIEncryptionKeys: Nat;
            totalChatInteractions: Nat;
            totalFaucetClaims: Nat;
        } {
            {
                totalUserProfiles = userProfiles.size();
                totalPatients = patients.size();
                totalTherapists = therapists.size();
                totalDoctors = doctors.size();
                totalAppointments = appointments.size();
                totalMedicalRecords = medicalRecords.size();
                totalMessages = messages.size();
                totalAuditLogs = auditLogs.size();
                totalConsentRecords = consentRecords.size();
                totalSessionNotes = sessionNotes.size();
                totalPrescriptions = prescriptions.size();
                totalTreatmentSummaries = treatmentSummaries.size();
                totalPaymentTransactions = paymentTransactions.size();
                totalEscrowContracts = escrowContracts.size();
                totalPaymentPlans = paymentPlans.size();
                totalEncryptedPatientPHI = encryptedPatientPHI.size();
                totalPHIEncryptionKeys = phiEncryptionKeys.size();
                totalChatInteractions = chatInteractionsMap.size();
                totalFaucetClaims = faucetClaims.size();
            }
        };
    };
}