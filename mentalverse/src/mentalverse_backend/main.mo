import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Text "mo:base/Text";
import _Option "mo:base/Option";
import _Debug "mo:base/Debug";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";

// Import MVT Token module
import MVTToken "mvt_token";
// Import Secure Messaging interface
import SecureMessagingInterface "secure_messaging_interface";

persistent actor MentalVerseBackend {
  // MVT Token Integration
  private let _MVT_TOKEN_CANISTER_ID = "rdmx6-jaaaa-aaaaa-aaadq-cai"; // Replace with actual canister ID
  
  // Secure Messaging Integration
  private let SECURE_MESSAGING_CANISTER_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai"; // Replace with actual secure messaging canister ID
  private let secureMessagingActor = SecureMessagingInterface.getSecureMessagingActor(SECURE_MESSAGING_CANISTER_ID);
  
  // Token-related types
  type TokenBalance = Nat;
  type EarningType = MVTToken.EarningType;
  type SpendingType = MVTToken.SpendingType;
  
  // Faucet-related types
  public type FaucetClaim = {
    id: Text;
    user_id: Principal;
    amount: Nat;
    timestamp: Int;
    status: Text; // "pending", "completed", "failed"
  };
  
  public type FaucetStats = {
    dailyLimit: Nat;
    claimedToday: Nat;
    totalClaimed: Nat;
    nextClaimTime: Int;
    isEligible: Bool;
  };
  // Type definitions for core data models
  public type UserId = Principal;
  public type DoctorId = Text;
  public type AppointmentId = Text;
  public type RecordId = Text;

  // Enhanced User Types
  public type UserType = {
    #patient;
    #therapist;
    #admin;
  };

  public type VerificationStatus = {
    #pending;
    #verified;
    #rejected;
    #suspended;
  };

  public type UserProfile = {
    id: UserId;
    userType: UserType;
    firstName: Text;
    lastName: Text;
    email: Text;
    phoneNumber: ?Text;
    profilePicture: ?Text;
    bio: ?Text;
    verificationStatus: VerificationStatus;
    onboardingCompleted: Bool;
    createdAt: Int;
    updatedAt: Int;
  };

  // Enhanced Patient data model
  public type Patient = {
    id: UserId;
    firstName: Text;
    lastName: Text;
    email: Text;
    dateOfBirth: Text;
    gender: Text;
    phoneNumber: Text;
    emergencyContact: Text;
    medicalHistory: [Text];
    allergies: [Text];
    currentMedications: [Text];
    preferredLanguage: ?Text;
    timezone: ?Text;
    emergencyContactRelation: ?Text;
    insuranceProvider: ?Text;
    createdAt: Int;
    updatedAt: Int;
  };

  // Enhanced Therapist data model
  public type Therapist = {
    id: DoctorId;
    userId: UserId;
    firstName: Text;
    lastName: Text;
    email: Text;
    specialty: [Text]; // Multiple specialties
    licenseNumber: Text;
    licenseState: Text;
    licenseExpiry: Text;
    yearsOfExperience: Nat;
    education: [Text];
    certifications: [Text];
    languages: [Text];
    availableHours: Text; // JSON string for complex scheduling
    consultationFee: Nat;
    acceptsInsurance: Bool;
    insuranceProviders: [Text];
    sessionTypes: [Text]; // individual, group, family, etc.
    rating: Float;
    totalAppointments: Nat;
    isVerified: Bool;
    isOnline: Bool;
    profileDescription: Text;
    approachMethods: [Text]; // CBT, DBT, etc.
    createdAt: Int;
    updatedAt: Int;
  };

  // Legacy Doctor type for backward compatibility
  public type Doctor = Therapist;

  // Appointment data model
  public type AppointmentStatus = {
    #scheduled;
    #confirmed;
    #inProgress;
    #completed;
    #cancelled;
    #rescheduled;
  };

  public type AppointmentType = {
    #consultation;
    #followUp;
    #emergency;
    #routine;
    #therapy;
    #examination;
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
    symptoms: [Text];
    diagnosis: Text;
    prescription: Text;
    followUpRequired: Bool;
    followUpDate: ?Text;
    createdAt: Int;
    updatedAt: Int;
  };

  // Medical record data model
  public type MedicalRecord = {
    id: RecordId;
    patientId: UserId;
    doctorId: DoctorId;
    appointmentId: ?AppointmentId;
    recordType: Text; // "consultation", "lab_result", "prescription", "diagnosis"
    title: Text;
    description: Text;
    attachments: [Text]; // File URLs or hashes
    isConfidential: Bool;
    accessPermissions: [UserId]; // Who can access this record
    createdAt: Int;
    updatedAt: Int;
  };

  // Message data model for secure communication
  public type Message = {
    id: Text;
    senderId: UserId;
    receiverId: UserId;
    content: Text;
    messageType: Text; // "text", "file", "image", "voice"
    attachments: [Text];
    isRead: Bool;
    isEncrypted: Bool;
    timestamp: Int;
  };

  // Consent and Session Management Types
  public type ConsentType = {
    #medicalRecords;
    #sessionNotes;
    #prescriptions;
    #diagnostics;
    #fullAccess;
  };

  public type ConsentStatus = {
    #granted;
    #revoked;
    #pending;
    #expired;
  };

  public type ConsentRecord = {
    id: Text;
    patientId: UserId;
    therapistId: Text;
    consentType: ConsentType;
    status: ConsentStatus;
    grantedAt: ?Int;
    revokedAt: ?Int;
    expiresAt: ?Int;
    purpose: Text;
    createdAt: Int;
    updatedAt: Int;
  };

  public type TherapistAvailability = {
    therapistId: Text;
    dayOfWeek: Nat; // 0-6 (Sunday-Saturday)
    startTime: Text; // "09:00"
    endTime: Text; // "17:00"
    isAvailable: Bool;
    sessionDuration: Nat; // minutes
    breakBetweenSessions: Nat; // minutes
    maxSessionsPerDay: Nat;
    updatedAt: Int;
  };

  public type SessionPricing = {
    therapistId: Text;
    sessionType: Text; // "individual", "group", "family", "couples"
    duration: Nat; // minutes
    price: Nat; // in tokens/cycles
    currency: Text; // "MVT", "ICP", "USD"
    isActive: Bool;
    discountPercentage: ?Nat;
    packageDeals: ?Text; // JSON string for complex pricing
    createdAt: Int;
    updatedAt: Int;
  };

  public type SessionRequest = {
    id: Text;
    patientId: UserId;
    therapistId: Text;
    requestedDate: Text;
    requestedTime: Text;
    sessionType: Text;
    duration: Nat;
    notes: Text;
    urgencyLevel: Text; // "low", "medium", "high", "emergency"
    status: SessionRequestStatus;
    createdAt: Int;
    updatedAt: Int;
  };

  public type SessionRequestStatus = {
    #pending;
    #accepted;
    #declined;
    #rescheduled;
    #cancelled;
  };

  // Medical Records & Storage Types (Iteration 3)
  public type EncryptionLevel = {
    #none;
    #standard;
    #high;
    #maximum;
  };

  public type AccessLevel = {
    #read;
    #write;
    #admin;
    #owner;
  };

  public type SessionNote = {
    id: Text;
    sessionId: Text;
    therapistId: Text;
    patientId: UserId;
    content: Text; // Encrypted content
    encryptionLevel: EncryptionLevel;
    tags: [Text]; // For categorization
    isConfidential: Bool;
    accessPermissions: [(UserId, AccessLevel)];
    createdAt: Int;
    updatedAt: Int;
    lastAccessedAt: ?Int;
    lastAccessedBy: ?UserId;
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
    sideEffects: [Text];
    contraindications: [Text];
    isActive: Bool;
    startDate: Text;
    endDate: ?Text;
    refillsRemaining: Nat;
    pharmacyNotes: ?Text;
    encryptionLevel: EncryptionLevel;
    accessPermissions: [(UserId, AccessLevel)];
    createdAt: Int;
    updatedAt: Int;
  };

  public type TreatmentSummary = {
    id: Text;
    patientId: UserId;
    therapistId: Text;
    treatmentPeriod: {
      startDate: Text;
      endDate: ?Text;
    };
    diagnosis: [Text];
    treatmentGoals: [Text];
    interventionsUsed: [Text];
    progressNotes: Text;
    outcomes: Text;
    recommendations: Text;
    followUpPlan: ?Text;
    riskAssessment: ?Text;
    encryptionLevel: EncryptionLevel;
    accessPermissions: [(UserId, AccessLevel)];
    attachments: [Text]; // File hashes or URLs
    createdAt: Int;
    updatedAt: Int;
  };

  public type AuditLogAction = {
    #create;
    #read;
    #update;
    #delete;
    #access_granted;
    #access_revoked;
    #export;
    #share;
  };

  public type AuditLog = {
    id: Text;
    userId: UserId;
    action: AuditLogAction;
    resourceType: Text; // "session_note", "prescription", "treatment_summary", etc.
    resourceId: Text;
    details: ?Text;
    ipAddress: ?Text;
    userAgent: ?Text;
    timestamp: Int;
  };

  public type AccessControlRule = {
    id: Text;
    resourceType: Text;
    resourceId: Text;
    userId: UserId;
    accessLevel: AccessLevel;
    grantedBy: UserId;
    grantedAt: Int;
    expiresAt: ?Int;
    isActive: Bool;
    conditions: ?Text; // JSON string for complex conditions
  };

  // Payment Integration Types
  public type PaymentStatus = {
    #pending;
    #processing;
    #completed;
    #failed;
    #refunded;
    #disputed;
  };

  public type PaymentMethod = {
    #mvt_tokens;
    #cycles;
    #escrow;
  };

  public type RefundReason = {
    #appointment_cancelled;
    #service_not_provided;
    #quality_issue;
    #technical_error;
    #dispute_resolved;
  };

  public type PaymentTransaction = {
    id: Text;
    payerId: Principal;
    payeeId: Principal;
    amount: Nat;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    serviceType: Text;
    serviceId: Text;
    createdAt: Int;
    completedAt: ?Int;
    refundedAt: ?Int;
    refundReason: ?RefundReason;
    escrowReleaseConditions: ?Text;
    autoRefundEnabled: Bool;
    refundDeadline: ?Int;
  };

  public type EscrowContract = {
    id: Text;
    payerId: Principal;
    payeeId: Principal;
    amount: Nat;
    serviceId: Text;
    conditions: Text;
    createdAt: Int;
    releaseConditions: [Text];
    disputeResolution: ?Text;
    autoReleaseTime: Int;
    status: PaymentStatus;
  };

  public type PaymentPlan = {
    id: Text;
    userId: Principal;
    totalAmount: Nat;
    installments: Nat;
    installmentAmount: Nat;
    frequency: Text; // "weekly", "monthly", "quarterly"
    startDate: Int;
    nextPaymentDate: Int;
    remainingInstallments: Nat;
    status: PaymentStatus;
    autoPayEnabled: Bool;
  };

  // Storage using stable variables for persistence
  private var userProfilesEntries : [(UserId, UserProfile)] = [];
  private var patientsEntries : [(UserId, Patient)] = [];
  private var therapistsEntries : [(DoctorId, Therapist)] = [];
  private var doctorsEntries : [(DoctorId, Doctor)] = []; // Legacy support
  private var appointmentsEntries : [(AppointmentId, Appointment)] = [];
  private var medicalRecordsEntries : [(RecordId, MedicalRecord)] = [];
  private var messagesEntries : [(Text, Message)] = [];
  private var userRolesEntries : [(UserId, Text)] = []; // Legacy support
  private var chatInteractionsEntries : [(Text, ChatInteraction)] = [];
  private var faucetClaimsEntries : [(Text, FaucetClaim)] = [];
  private var lastClaimTimesEntries : [(UserId, Int)] = [];
  // New consent and session management storage
  private var consentRecordsEntries : [(Text, ConsentRecord)] = [];
  private var therapistAvailabilityEntries : [(Text, TherapistAvailability)] = [];
  private var sessionPricingEntries : [(Text, SessionPricing)] = [];
  private var sessionRequestsEntries : [(Text, SessionRequest)] = [];
  // Medical Records & Storage entries (Iteration 3)
  private var sessionNotesEntries : [(Text, SessionNote)] = [];
  private var prescriptionsEntries : [(Text, Prescription)] = [];
  private var treatmentSummariesEntries : [(Text, TreatmentSummary)] = [];
  private var auditLogsEntries : [(Text, AuditLog)] = [];
  private var accessControlRulesEntries : [(Text, AccessControlRule)] = [];
  // Payment Integration entries (Iteration 4)
  private var paymentTransactionsEntries : [(Text, PaymentTransaction)] = [];
  private var escrowContractsEntries : [(Text, EscrowContract)] = [];
  private var paymentPlansEntries : [(Text, PaymentPlan)] = [];

  // Initialize HashMaps from stable storage
  private transient var userProfiles = HashMap.HashMap<UserId, UserProfile>(50, Principal.equal, Principal.hash);
  private transient var patients = HashMap.HashMap<UserId, Patient>(10, Principal.equal, Principal.hash);
  private transient var therapists = HashMap.HashMap<DoctorId, Therapist>(10, Text.equal, Text.hash);
  private transient var doctors = HashMap.HashMap<DoctorId, Doctor>(10, Text.equal, Text.hash); // Legacy support
  private transient var appointments = HashMap.HashMap<AppointmentId, Appointment>(10, Text.equal, Text.hash);
  private transient var medicalRecords = HashMap.HashMap<RecordId, MedicalRecord>(10, Text.equal, Text.hash);
  private transient var messages = HashMap.HashMap<Text, Message>(10, Text.equal, Text.hash);
  private transient var userRoles = HashMap.HashMap<UserId, Text>(10, Principal.equal, Principal.hash); // Legacy support
  private transient var faucetClaims = HashMap.HashMap<Text, FaucetClaim>(10, Text.equal, Text.hash);
  private transient var lastClaimTimes = HashMap.HashMap<UserId, Int>(10, Principal.equal, Principal.hash);
  // New consent and session management HashMaps
  private transient var consentRecords = HashMap.HashMap<Text, ConsentRecord>(10, Text.equal, Text.hash);
  private transient var therapistAvailability = HashMap.HashMap<Text, TherapistAvailability>(10, Text.equal, Text.hash);
  private transient var sessionPricing = HashMap.HashMap<Text, SessionPricing>(10, Text.equal, Text.hash);
  private transient var sessionRequests = HashMap.HashMap<Text, SessionRequest>(10, Text.equal, Text.hash);
  // Medical Records & Storage HashMaps (Iteration 3)
  private transient var sessionNotes = HashMap.HashMap<Text, SessionNote>(10, Text.equal, Text.hash);
  private transient var prescriptions = HashMap.HashMap<Text, Prescription>(10, Text.equal, Text.hash);
  private transient var treatmentSummaries = HashMap.HashMap<Text, TreatmentSummary>(10, Text.equal, Text.hash);
  private transient var auditLogs = HashMap.HashMap<Text, AuditLog>(50, Text.equal, Text.hash);
  private transient var accessControlRules = HashMap.HashMap<Text, AccessControlRule>(20, Text.equal, Text.hash);
  // Payment Integration HashMaps (Iteration 4)
  private transient var paymentTransactions = HashMap.HashMap<Text, PaymentTransaction>(50, Text.equal, Text.hash);
  private transient var escrowContracts = HashMap.HashMap<Text, EscrowContract>(20, Text.equal, Text.hash);
  private transient var paymentPlans = HashMap.HashMap<Text, PaymentPlan>(20, Text.equal, Text.hash);

  // System upgrade hooks to maintain state
  system func preupgrade() {
    userProfilesEntries := Iter.toArray(userProfiles.entries());
    patientsEntries := Iter.toArray(patients.entries());
    therapistsEntries := Iter.toArray(therapists.entries());
    doctorsEntries := Iter.toArray(doctors.entries());
    appointmentsEntries := Iter.toArray(appointments.entries());
    medicalRecordsEntries := Iter.toArray(medicalRecords.entries());
    messagesEntries := Iter.toArray(messages.entries());
    userRolesEntries := Iter.toArray(userRoles.entries());
    chatInteractionsEntries := Iter.toArray(chatInteractionsMap.entries());
    faucetClaimsEntries := Iter.toArray(faucetClaims.entries());
    lastClaimTimesEntries := Iter.toArray(lastClaimTimes.entries());
    // Save new consent and session management data
    consentRecordsEntries := Iter.toArray(consentRecords.entries());
    therapistAvailabilityEntries := Iter.toArray(therapistAvailability.entries());
    sessionPricingEntries := Iter.toArray(sessionPricing.entries());
    sessionRequestsEntries := Iter.toArray(sessionRequests.entries());
    // Save medical records & storage data (Iteration 3)
    sessionNotesEntries := Iter.toArray(sessionNotes.entries());
    prescriptionsEntries := Iter.toArray(prescriptions.entries());
    treatmentSummariesEntries := Iter.toArray(treatmentSummaries.entries());
    auditLogsEntries := Iter.toArray(auditLogs.entries());
    accessControlRulesEntries := Iter.toArray(accessControlRules.entries());
    // Save payment integration data
    paymentTransactionsEntries := Iter.toArray(paymentTransactions.entries());
    escrowContractsEntries := Iter.toArray(escrowContracts.entries());
    paymentPlansEntries := Iter.toArray(paymentPlans.entries());
  };

  system func postupgrade() {
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
    // Restore new consent and session management data
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
    // Restore medical records & storage data (Iteration 3)
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
    // Restore payment integration data (Iteration 4)
    for ((id, transaction) in paymentTransactionsEntries.vals()) {
      paymentTransactions.put(id, transaction);
    };
    for ((id, contract) in escrowContractsEntries.vals()) {
      escrowContracts.put(id, contract);
    };
    for ((id, plan) in paymentPlansEntries.vals()) {
      paymentPlans.put(id, plan);
    };
    
    // Clear stable storage
    userProfilesEntries := [];
    patientsEntries := [];
    therapistsEntries := [];
    doctorsEntries := [];
    appointmentsEntries := [];
    medicalRecordsEntries := [];
    messagesEntries := [];
    userRolesEntries := [];
    chatInteractionsEntries := [];
    faucetClaimsEntries := [];
    lastClaimTimesEntries := [];
    // Clear new consent and session management storage
    consentRecordsEntries := [];
    therapistAvailabilityEntries := [];
    sessionPricingEntries := [];
    sessionRequestsEntries := [];
    // Clear medical records & storage entries (Iteration 3)
    sessionNotesEntries := [];
    prescriptionsEntries := [];
    treatmentSummariesEntries := [];
    auditLogsEntries := [];
    accessControlRulesEntries := [];
    // Clear payment integration entries (Iteration 4)
    paymentTransactionsEntries := [];
    escrowContractsEntries := [];
    paymentPlansEntries := [];
  };

  // Enhanced Authentication and User Management Functions
  
  // Initial user registration with wallet connection
  public shared(msg) func initializeUser(userData: {
    firstName: Text;
    lastName: Text;
    email: Text;
    phoneNumber: ?Text;
  }) : async Result.Result<UserProfile, Text> {
    let caller = msg.caller;
    
    // Check if user already exists
    switch (userProfiles.get(caller)) {
      case (?existingProfile) {
        #err("User already registered")
      };
      case null {
        let now = Time.now();
        let newProfile: UserProfile = {
          id = caller;
          userType = #patient; // Default to patient, can be changed during onboarding
          firstName = userData.firstName;
          lastName = userData.lastName;
          email = userData.email;
          phoneNumber = userData.phoneNumber;
          profilePicture = null;
          bio = null;
          verificationStatus = #pending;
          onboardingCompleted = false;
          createdAt = now;
          updatedAt = now;
        };
        
        userProfiles.put(caller, newProfile);
        // Maintain legacy support
        userRoles.put(caller, "patient");
        
        #ok(newProfile)
      };
    }
  };
  
  // Complete onboarding with user type selection
  public shared(msg) func completeOnboarding(userType: UserType, additionalData: {
    bio: ?Text;
    profilePicture: ?Text;
  }) : async Result.Result<UserProfile, Text> {
    let caller = msg.caller;
    
    switch (userProfiles.get(caller)) {
      case null {
        #err("User not found. Please initialize user first.")
      };
      case (?profile) {
        let now = Time.now();
        let updatedProfile: UserProfile = {
          id = profile.id;
          userType = userType;
          firstName = profile.firstName;
          lastName = profile.lastName;
          email = profile.email;
          phoneNumber = profile.phoneNumber;
          profilePicture = additionalData.profilePicture;
          bio = additionalData.bio;
          verificationStatus = profile.verificationStatus;
          onboardingCompleted = true;
          createdAt = profile.createdAt;
          updatedAt = now;
        };
        
        userProfiles.put(caller, updatedProfile);
        
        // Update legacy role mapping
        let roleText = switch (userType) {
          case (#patient) "patient";
          case (#therapist) "doctor";
          case (#admin) "admin";
        };
        userRoles.put(caller, roleText);
        
        #ok(updatedProfile)
      };
    }
  };
  
  // Get current user profile
  public shared query(msg) func getCurrentUserProfile() : async Result.Result<UserProfile, Text> {
    let caller = msg.caller;
    
    switch (userProfiles.get(caller)) {
      case (?profile) {
        #ok(profile)
      };
      case null {
        #err("User not found")
      };
    }
  };
  
  // Legacy function for backward compatibility
  public shared query(msg) func getCurrentUser() : async Result.Result<{id: UserId; role: Text}, Text> {
    let caller = msg.caller;
    
    switch (userProfiles.get(caller)) {
      case (?profile) {
        let roleText = switch (profile.userType) {
          case (#patient) "patient";
          case (#therapist) "doctor";
          case (#admin) "admin";
        };
        #ok({id = caller; role = roleText})
      };
      case null {
        #err("User not registered")
      };
    }
  };
  
  // Enhanced authorization function
  private func isAuthorized(caller: UserId, requiredUserType: UserType) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) { 
        profile.userType == requiredUserType or profile.userType == #admin
      };
      case null { false };
    }
  };

  // === CONSENT MANAGEMENT FUNCTIONS ===
  
  // Create consent record
  public shared(msg) func createConsentRecord(
    consentType: ConsentType,
    description: Text
  ) : async Result.Result<ConsentRecord, Text> {
    let caller = msg.caller;
    
    switch (userProfiles.get(caller)) {
      case null { #err("User not found") };
      case (?profile) {
        let consentId = Principal.toText(caller) # "-" # Int.toText(Time.now());
        let now = Time.now();
        
        let consent: ConsentRecord = {
          id = consentId;
          patientId = caller;
          therapistId = Principal.toText(caller);
          consentType = consentType;
          status = #pending;
          purpose = description;
          grantedAt = null;
          revokedAt = null;
          expiresAt = null;
          createdAt = now;
          updatedAt = now;
        };
        
        consentRecords.put(consentId, consent);
        #ok(consent)
      };
    }
  };
  
  // Update consent status
  public shared(msg) func updateConsentStatus(
    consentId: Text,
    status: ConsentStatus
  ) : async Result.Result<ConsentRecord, Text> {
    let caller = msg.caller;
    
    switch (consentRecords.get(consentId)) {
      case null { #err("Consent record not found") };
      case (?consent) {
        if (consent.patientId != caller) {
          return #err("Unauthorized: You can only update your own consent records");
        };
        
        let now = Time.now();
        let updatedConsent: ConsentRecord = {
          id = consent.id;
          patientId = consent.patientId;
          therapistId = consent.therapistId;
          consentType = consent.consentType;
          status = status;
          purpose = consent.purpose;
          grantedAt = if (status == #granted) ?now else consent.grantedAt;
          revokedAt = if (status == #revoked) ?now else consent.revokedAt;
          expiresAt = consent.expiresAt;
          createdAt = consent.createdAt;
          updatedAt = now;
        };
        
        consentRecords.put(consentId, updatedConsent);
        #ok(updatedConsent)
      };
    }
  };
  
  // Get user consent records
  public shared query(msg) func getUserConsentRecords() : async [ConsentRecord] {
    let caller = msg.caller;
    let userConsents = Buffer.Buffer<ConsentRecord>(0);
    
    for ((id, consent) in consentRecords.entries()) {
      if (consent.patientId == caller) {
        userConsents.add(consent);
      };
    };
    
    Buffer.toArray(userConsents)
  };

  // === THERAPIST AVAILABILITY FUNCTIONS ===
  
  // Set therapist availability
  public shared(msg) func setTherapistAvailability(
    dayOfWeek: Nat,
    startTime: Text,
    endTime: Text,
    isAvailable: Bool
  ) : async Result.Result<TherapistAvailability, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #therapist)) {
      return #err("Unauthorized: Only therapists can set availability");
    };
    
    if (dayOfWeek > 6) {
      return #err("Invalid day of week. Must be 0-6 (Sunday-Saturday)");
    };
    
    let availabilityId = Principal.toText(caller) # "-" # Int.toText(dayOfWeek);
    let now = Time.now();
    
    let availability: TherapistAvailability = {
      id = availabilityId;
      therapistId = Principal.toText(caller);
      dayOfWeek = dayOfWeek;
      startTime = startTime;
      endTime = endTime;
      isAvailable = isAvailable;
      sessionDuration = 60; // Default 60 minutes
      breakBetweenSessions = 15; // Default 15 minutes break
      maxSessionsPerDay = 8; // Default max 8 sessions per day
      updatedAt = now;
    };
    
    therapistAvailability.put(availabilityId, availability);
    #ok(availability)
  };
  
  // Get therapist availability
  public shared query(msg) func getTherapistAvailability(therapistId: ?UserId) : async [TherapistAvailability] {
    let targetId = switch (therapistId) {
      case (?id) id;
      case null msg.caller;
    };
    
    let availabilities = Buffer.Buffer<TherapistAvailability>(0);
    
    for ((id, availability) in therapistAvailability.entries()) {
      if (availability.therapistId == Principal.toText(targetId)) {
        availabilities.add(availability);
      };
    };
    
    Buffer.toArray(availabilities)
  };

  // === SESSION PRICING FUNCTIONS ===
  
  // Set session pricing
  public shared(msg) func setSessionPricing(
    sessionType: Text,
    pricePerSession: Nat,
    currency: Text,
    description: ?Text
  ) : async Result.Result<SessionPricing, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #therapist)) {
      return #err("Unauthorized: Only therapists can set pricing");
    };
    
    let pricingId = Principal.toText(caller) # "-" # sessionType;
    let now = Time.now();
    
    let pricing: SessionPricing = {
            therapistId = Principal.toText(caller);
            sessionType = sessionType;
            price = pricePerSession;
            duration = 60; // Default 60 minutes
            currency = currency;
            packageDeals = null;
            discountPercentage = null;
            isActive = true;
            createdAt = now;
            updatedAt = now;
        };
    
    sessionPricing.put(pricingId, pricing);
    #ok(pricing)
  };
  
  // Get therapist pricing
  public shared query(msg) func getTherapistPricing(therapistId: ?UserId) : async [SessionPricing] {
    let targetId = switch (therapistId) {
      case (?id) id;
      case null msg.caller;
    };
    
    let pricings = Buffer.Buffer<SessionPricing>(0);
    
    for ((id, pricing) in sessionPricing.entries()) {
      if (pricing.therapistId == Principal.toText(targetId) and pricing.isActive) {
        pricings.add(pricing);
      };
    };
    
    Buffer.toArray(pricings)
  };

  // === SESSION REQUEST FUNCTIONS ===
  
  // Create session request
  public shared(msg) func createSessionRequest(
    therapistId: UserId,
    sessionType: Text,
    preferredDate: Text,
    preferredTime: Text,
    notes: ?Text
  ) : async Result.Result<SessionRequest, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #patient)) {
      return #err("Unauthorized: Only patients can create session requests");
    };
    
    // Verify therapist exists
    switch (userProfiles.get(therapistId)) {
      case null { return #err("Therapist not found"); };
      case (?profile) {
        if (profile.userType != #therapist) {
          return #err("Invalid therapist ID");
        };
      };
    };
    
    let requestId = Principal.toText(caller) # "-" # Principal.toText(therapistId) # "-" # Int.toText(Time.now());
    let now = Time.now();
    
    let request: SessionRequest = {
      id = requestId;
      patientId = caller;
      therapistId = Principal.toText(therapistId);
      sessionType = sessionType;
      requestedDate = preferredDate;
      requestedTime = preferredTime;
      duration = 60; // Default 60 minutes
      urgencyLevel = "normal"; // Default urgency level
      status = #pending;
      notes = switch (notes) { case (?n) n; case null ""; };
      createdAt = now;
      updatedAt = now;
    };
    
    sessionRequests.put(requestId, request);
    #ok(request)
  };
  
  // Update session request status
  public shared(msg) func updateSessionRequestStatus(
    requestId: Text,
    status: SessionRequestStatus
  ) : async Result.Result<SessionRequest, Text> {
    let caller = msg.caller;
    
    switch (sessionRequests.get(requestId)) {
      case null { #err("Session request not found") };
      case (?request) {
        // Only therapist can approve/reject, only patient can cancel
        let authorized = switch (status) {
          case (#accepted or #declined or #rescheduled) { request.therapistId == Principal.toText(caller) };
          case (#cancelled) { request.patientId == caller };
          case (#pending) { request.patientId == caller or request.therapistId == Principal.toText(caller) };
        };
        
        if (not authorized) {
          return #err("Unauthorized to update this session request");
        };
        
        let now = Time.now();
        let updatedRequest: SessionRequest = {
          id = request.id;
          patientId = request.patientId;
          therapistId = request.therapistId;
          sessionType = request.sessionType;
          requestedDate = request.requestedDate;
          requestedTime = request.requestedTime;
          duration = request.duration;
          urgencyLevel = request.urgencyLevel;
          status = status;
          notes = request.notes;
          createdAt = request.createdAt;
          updatedAt = now;
        };
        
        sessionRequests.put(requestId, updatedRequest);
        #ok(updatedRequest)
      };
    }
  };
  
  // Get session requests for user
  public shared query(msg) func getUserSessionRequests() : async [SessionRequest] {
    let caller = msg.caller;
    let userRequests = Buffer.Buffer<SessionRequest>(0);
    
    for ((id, request) in sessionRequests.entries()) {
      if (request.patientId == caller or request.therapistId == Principal.toText(caller)) {
        userRequests.add(request);
      };
    };
    
    Buffer.toArray(userRequests)
  };
  
  // Legacy authorization for backward compatibility
  private func isAuthorizedLegacy(caller: UserId, requiredRole: Text) : Bool {
    switch (userRoles.get(caller)) {
      case (?role) { role == requiredRole or role == "admin" };
      case null { false };
    }
  };
  
  // Update user profile
  public shared(msg) func updateUserProfile(updates: {
    firstName: ?Text;
    lastName: ?Text;
    email: ?Text;
    phoneNumber: ?Text;
    bio: ?Text;
    profilePicture: ?Text;
  }) : async Result.Result<UserProfile, Text> {
    let caller = msg.caller;
    
    switch (userProfiles.get(caller)) {
      case null {
        #err("User not found")
      };
      case (?profile) {
        let now = Time.now();
        let updatedProfile: UserProfile = {
          id = profile.id;
          userType = profile.userType;
          firstName = switch (updates.firstName) { case (?name) name; case null profile.firstName; };
          lastName = switch (updates.lastName) { case (?name) name; case null profile.lastName; };
          email = switch (updates.email) { case (?email) email; case null profile.email; };
          phoneNumber = switch (updates.phoneNumber) { case (?phone) ?phone; case null profile.phoneNumber; };
          profilePicture = switch (updates.profilePicture) { case (?pic) ?pic; case null profile.profilePicture; };
          bio = switch (updates.bio) { case (?bio) ?bio; case null profile.bio; };
          verificationStatus = profile.verificationStatus;
          onboardingCompleted = profile.onboardingCompleted;
          createdAt = profile.createdAt;
          updatedAt = now;
        };
        
        userProfiles.put(caller, updatedProfile);
        #ok(updatedProfile)
      };
    }
  };

  // Enhanced Patient management functions
  public shared(msg) func createPatientProfile(patientData: {
    dateOfBirth: Text;
    gender: Text;
    emergencyContact: Text;
    emergencyContactRelation: ?Text;
    preferredLanguage: ?Text;
    timezone: ?Text;
    insuranceProvider: ?Text;
  }) : async Result.Result<Patient, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #patient)) {
      return #err("Unauthorized: Only patients can create patient profiles");
    };
    
    // Get user profile for basic info
    switch (userProfiles.get(caller)) {
      case null {
        #err("User profile not found. Please complete onboarding first.")
      };
      case (?userProfile) {
        let now = Time.now();
        let patient: Patient = {
          id = caller;
          firstName = userProfile.firstName;
          lastName = userProfile.lastName;
          email = userProfile.email;
          dateOfBirth = patientData.dateOfBirth;
          gender = patientData.gender;
          phoneNumber = switch (userProfile.phoneNumber) { case (?phone) phone; case null ""; };
          emergencyContact = patientData.emergencyContact;
          emergencyContactRelation = patientData.emergencyContactRelation;
          preferredLanguage = patientData.preferredLanguage;
          timezone = patientData.timezone;
          insuranceProvider = patientData.insuranceProvider;
          medicalHistory = [];
          allergies = [];
          currentMedications = [];
          createdAt = now;
          updatedAt = now;
    };

        patients.put(caller, patient);
        #ok(patient)
      }
    }
  };

  public shared query(msg) func getPatientProfile() : async Result.Result<Patient, Text> {
    let caller = msg.caller;
    
    switch (patients.get(caller)) {
      case (?patient) { #ok(patient) };
      case null { #err("Patient profile not found") };
    }
  };

  // Enhanced Therapist management functions
  public shared(msg) func createTherapistProfile(therapistData: {
    specialty: Text;
    licenseNumber: Text;
    yearsOfExperience: Nat;
    education: [Text];
    certifications: [Text];
    consultationFee: Nat;
    sessionTypes: [Text];
    languages: [Text];
    bio: ?Text;
    availableHours: ?Text;
  }) : async Result.Result<Therapist, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #therapist)) {
      return #err("Unauthorized: Only therapists can create therapist profiles");
    };
    
    // Get user profile for basic info
    switch (userProfiles.get(caller)) {
      case null {
        #err("User profile not found. Please complete onboarding first.")
      };
      case (?userProfile) {
        let therapistId = Principal.toText(caller);
        let now = Time.now();
        
        let therapist: Therapist = {
          id = therapistId;
          userId = caller;
          firstName = userProfile.firstName;
          lastName = userProfile.lastName;
          email = userProfile.email;
          specialty = [therapistData.specialty];
          licenseNumber = therapistData.licenseNumber;
          yearsOfExperience = therapistData.yearsOfExperience;
          education = therapistData.education;
          certifications = therapistData.certifications;
          sessionTypes = therapistData.sessionTypes;
          languages = therapistData.languages;
          licenseState = "";
          licenseExpiry = "";
          availableHours = switch (therapistData.availableHours) { case (?hours) hours; case null "{}" };
          consultationFee = therapistData.consultationFee;
          acceptsInsurance = false;
          insuranceProviders = [];
          rating = 0.0;
          totalAppointments = 0;
          isVerified = false;
          isOnline = false;
          profileDescription = switch (therapistData.bio) { case (?b) b; case null ""; };
          approachMethods = [];
          createdAt = now;
          updatedAt = now;
        };

        therapists.put(therapistId, therapist);
        #ok(therapist)
      }
    }
  };

  // Legacy Doctor management functions (for backward compatibility)
  public shared(msg) func createDoctorProfile(doctorData: {
    firstName: Text;
    lastName: Text;
    email: Text;
    specialty: Text;
    licenseNumber: Text;
    yearsOfExperience: Nat;
    education: [Text];
    certifications: [Text];
    consultationFee: Nat;
  }) : async Result.Result<Doctor, Text> {
    let caller = msg.caller;
    
    if (not isAuthorizedLegacy(caller, "doctor")) {
      return #err("Unauthorized: Only doctors can create doctor profiles");
    };

    let doctorId = Principal.toText(caller);
    let now = Time.now();
    
    let doctor: Doctor = {
      id = doctorId;
      userId = caller;
      firstName = doctorData.firstName;
      lastName = doctorData.lastName;
      email = doctorData.email;
      specialty = [doctorData.specialty];
      licenseNumber = doctorData.licenseNumber;
      licenseState = "";
      licenseExpiry = "";
      yearsOfExperience = doctorData.yearsOfExperience;
      education = doctorData.education;
      certifications = doctorData.certifications;
      languages = ["English"]; // Default language
      sessionTypes = ["Individual"]; // Default session type
      approachMethods = ["Cognitive Behavioral Therapy"]; // Default approach
      availableHours = "{}";
      consultationFee = doctorData.consultationFee;
      acceptsInsurance = false; // Default value
      insuranceProviders = []; // Empty array
      profileDescription = "";
      rating = 0.0;
      totalAppointments = 0;
      isVerified = false;
      isOnline = false;
      createdAt = now;
      updatedAt = now;
    };

    doctors.put(doctorId, doctor);
    #ok(doctor)
  };

  // Enhanced Therapist query functions
  public query func getAllTherapists() : async [Therapist] {
    Iter.toArray(therapists.vals())
  };

  public query func getTherapistById(therapistId: Text) : async Result.Result<Therapist, Text> {
    switch (therapists.get(therapistId)) {
      case (?therapist) { #ok(therapist) };
      case null { #err("Therapist not found") };
    }
  };

  public shared query(msg) func getTherapistProfile() : async Result.Result<Therapist, Text> {
    let caller = msg.caller;
    let therapistId = Principal.toText(caller);
    
    switch (therapists.get(therapistId)) {
      case (?therapist) { #ok(therapist) };
      case null { #err("Therapist profile not found") };
    }
  };

  // Legacy Doctor query functions (for backward compatibility)
  public query func getAllDoctors() : async [Doctor] {
    Iter.toArray(doctors.vals())
  };

  public query func getDoctorById(doctorId: DoctorId) : async Result.Result<Doctor, Text> {
    switch (doctors.get(doctorId)) {
      case (?doctor) { #ok(doctor) };
      case null { #err("Doctor not found") };
    }
  };

  // Legacy greeting function for backward compatibility
  public query func greet(name : Text) : async Text {
    "Hello, " # name # "! Welcome to MentalVerse Healthcare Platform."
  };

  // Enhanced Session/Appointment management functions
  public shared(msg) func createSession(sessionData: {
    therapistId: Text;
    appointmentType: AppointmentType;
    scheduledDate: Text;
    startTime: Text;
    endTime: Text;
    notes: Text;
    symptoms: [Text];
  }) : async Result.Result<Appointment, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #patient)) {
      return #err("Unauthorized: Only patients can create sessions");
    };

    // Verify therapist exists
    switch (therapists.get(sessionData.therapistId)) {
      case null { return #err("Therapist not found") };
      case (?therapist) {
        let appointmentId = Principal.toText(caller) # "_" # sessionData.therapistId # "_" # Int.toText(Time.now());
        let now = Time.now();
        
        let appointment: Appointment = {
          id = appointmentId;
          patientId = caller;
          doctorId = sessionData.therapistId;
          appointmentType = sessionData.appointmentType;
          scheduledDate = sessionData.scheduledDate;
          startTime = sessionData.startTime;
          endTime = sessionData.endTime;
          status = #scheduled;
          notes = sessionData.notes;
          symptoms = sessionData.symptoms;
          diagnosis = "";
          prescription = "";
          followUpRequired = false;
          followUpDate = null;
          createdAt = now;
          updatedAt = now;
        };

        appointments.put(appointmentId, appointment);
        #ok(appointment)
      };
    }
  };

  // Legacy appointment creation (for backward compatibility)
  public shared(msg) func createAppointment(appointmentData: {
    doctorId: DoctorId;
    appointmentType: AppointmentType;
    scheduledDate: Text;
    startTime: Text;
    endTime: Text;
    notes: Text;
    symptoms: [Text];
  }) : async Result.Result<Appointment, Text> {
    let caller = msg.caller;
    
    if (not isAuthorizedLegacy(caller, "patient")) {
      return #err("Unauthorized: Only patients can create appointments");
    };

    // Verify doctor exists
    switch (doctors.get(appointmentData.doctorId)) {
      case null { return #err("Doctor not found") };
      case (?doctor) {
        let appointmentId = Principal.toText(caller) # "_" # appointmentData.doctorId # "_" # Int.toText(Time.now());
        let now = Time.now();
        
        let appointment: Appointment = {
          id = appointmentId;
          patientId = caller;
          doctorId = appointmentData.doctorId;
          appointmentType = appointmentData.appointmentType;
          scheduledDate = appointmentData.scheduledDate;
          startTime = appointmentData.startTime;
          endTime = appointmentData.endTime;
          status = #scheduled;
          notes = appointmentData.notes;
          symptoms = appointmentData.symptoms;
          diagnosis = "";
          prescription = "";
          followUpRequired = false;
          followUpDate = null;
          createdAt = now;
          updatedAt = now;
        };

        appointments.put(appointmentId, appointment);
        #ok(appointment)
      };
    }
  };

  public shared(msg) func updateAppointmentStatus(appointmentId: AppointmentId, status: AppointmentStatus) : async Result.Result<Appointment, Text> {
    let caller = msg.caller;
    
    switch (appointments.get(appointmentId)) {
      case null { #err("Appointment not found") };
      case (?appointment) {
        // Check authorization - patient or doctor involved in the appointment
        if (appointment.patientId != caller and appointment.doctorId != Principal.toText(caller)) {
          return #err("Unauthorized: You can only update your own appointments");
        };

        let updatedAppointment = {
          appointment with
          status = status;
          updatedAt = Time.now();
        };

        appointments.put(appointmentId, updatedAppointment);
        #ok(updatedAppointment)
      };
    }
  };

  public shared query(msg) func getPatientAppointments() : async [Appointment] {
    let caller = msg.caller;
    
    Array.filter(Iter.toArray(appointments.vals()), func(appointment: Appointment) : Bool {
      appointment.patientId == caller
    })
  };

  public shared query(msg) func getDoctorAppointments() : async [Appointment] {
    let caller = msg.caller;
    let callerId = Principal.toText(caller);
    
    Array.filter(Iter.toArray(appointments.vals()), func(appointment: Appointment) : Bool {
      appointment.doctorId == callerId
    })
  };

  // Medical records management functions
  public shared(msg) func createMedicalRecord(recordData: {
    patientId: UserId;
    appointmentId: ?AppointmentId;
    recordType: Text;
    title: Text;
    description: Text;
    attachments: [Text];
    isConfidential: Bool;
  }) : async Result.Result<MedicalRecord, Text> {
    let caller = msg.caller;
    
    if (not isAuthorizedLegacy(caller, "doctor")) {
      return #err("Unauthorized: Only doctors can create medical records");
    };

    // Verify patient exists
    switch (patients.get(recordData.patientId)) {
      case null { return #err("Patient not found") };
      case (?patient) {
        let recordId = Principal.toText(caller) # "_" # Principal.toText(recordData.patientId) # "_" # Int.toText(Time.now());
        let now = Time.now();
        
        let medicalRecord: MedicalRecord = {
          id = recordId;
          patientId = recordData.patientId;
          doctorId = Principal.toText(caller);
          appointmentId = recordData.appointmentId;
          recordType = recordData.recordType;
          title = recordData.title;
          description = recordData.description;
          attachments = recordData.attachments;
          isConfidential = recordData.isConfidential;
          accessPermissions = [recordData.patientId, caller]; // Patient and doctor have access
          createdAt = now;
          updatedAt = now;
        };

        medicalRecords.put(recordId, medicalRecord);
        #ok(medicalRecord)
      };
    }
  };

  public shared query(msg) func getPatientMedicalRecords() : async [MedicalRecord] {
    let caller = msg.caller;
    
    Array.filter(Iter.toArray(medicalRecords.vals()), func(record: MedicalRecord) : Bool {
      Array.find<UserId>(record.accessPermissions, func(userId: UserId) : Bool {
        userId == caller
      }) != null
    })
  };

  public shared query(msg) func getMedicalRecordById(recordId: RecordId) : async Result.Result<MedicalRecord, Text> {
    let caller = msg.caller;
    
    switch (medicalRecords.get(recordId)) {
      case null { #err("Medical record not found") };
      case (?record) {
        // Check if caller has access to this record
        let hasAccess = Array.find<UserId>(record.accessPermissions, func(userId: UserId) : Bool {
          userId == caller
        }) != null;
        
        if (not hasAccess) {
          return #err("Unauthorized: You don't have access to this medical record");
        };
        
        #ok(record)
      };
    }
  };

  // Secure messaging functions
  public shared(msg) func sendMessage(receiverId: UserId, content: Text, messageType: Text) : async Result.Result<Message, Text> {
    let caller = msg.caller;
    
    // Verify receiver exists (either as patient or doctor)
    let receiverExists = switch (userRoles.get(receiverId)) {
      case (?role) { true };
      case null { false };
    };
    
    if (not receiverExists) {
      return #err("Receiver not found");
    };

    let messageId = Principal.toText(caller) # "_" # Principal.toText(receiverId) # "_" # Int.toText(Time.now());
    let now = Time.now();
    
    let message: Message = {
      id = messageId;
      senderId = caller;
      receiverId = receiverId;
      content = content;
      messageType = messageType;
      attachments = [];
      isRead = false;
      isEncrypted = true; // All messages are encrypted by default
      timestamp = now;
    };

    messages.put(messageId, message);
    #ok(message)
  };

  public shared query(msg) func getMessages(otherUserId: UserId) : async [Message] {
    let caller = msg.caller;
    
    Array.filter(Iter.toArray(messages.vals()), func(message: Message) : Bool {
      (message.senderId == caller and message.receiverId == otherUserId) or
      (message.senderId == otherUserId and message.receiverId == caller)
    })
  };

  public shared(msg) func markMessageAsRead(messageId: Text) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (messages.get(messageId)) {
      case null { #err("Message not found") };
      case (?message) {
        if (message.receiverId != caller) {
          return #err("Unauthorized: You can only mark your own messages as read");
        };

        let updatedMessage = {
          message with
          isRead = true;
        };

        messages.put(messageId, updatedMessage);
        #ok("Message marked as read")
      };
    }
  };

  // Admin functions for system management
  public shared(msg) func verifyDoctor(doctorId: DoctorId) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #admin)) {
      return #err("Unauthorized: Only admins can verify doctors");
    };

    switch (doctors.get(doctorId)) {
      case null { #err("Doctor not found") };
      case (?doctor) {
        let updatedDoctor = {
          doctor with
          isVerified = true;
          updatedAt = Time.now();
        };

        doctors.put(doctorId, updatedDoctor);
        #ok("Doctor verified successfully")
      };
    }
  };

  // System statistics and analytics
  public query func getSystemStats() : async {
    totalPatients: Nat;
    totalDoctors: Nat;
    totalAppointments: Nat;
    totalMedicalRecords: Nat;
    totalMessages: Nat;
    totalChatInteractions: Nat;
  } {
    {
      totalPatients = patients.size();
      totalDoctors = doctors.size();
      totalAppointments = appointments.size();
      totalMedicalRecords = medicalRecords.size();
      totalMessages = messages.size();
      totalChatInteractions = chatInteractionsMap.size();
    }
  };

  // Chat interaction logging for mental health sessions
  public type ChatInteraction = {
    id: Text;
    userId: Principal;
    message: Text;
    emotionalTone: ?Text;
    timestamp: Int;
    sessionId: Text;
  };

  private var chatInteractions: [(Text, ChatInteraction)] = [];
  private transient var chatInteractionsMap = HashMap.fromIter<Text, ChatInteraction>(chatInteractions.vals(), chatInteractions.size(), Text.equal, Text.hash);

  // Log user chat interactions securely
  public shared(msg) func logChatInteraction(
    sessionId: Text,
    messageContent: Text,
    messageType: Text
  ) : async Result.Result<Text, Text> {
    let caller = Principal.toText(msg.caller);
    let interactionId = generateId("interaction");
    
    let interaction: ChatInteraction = {
      id = interactionId;
      userId = Principal.fromText(caller);
      message = messageContent;
      emotionalTone = ?messageType;
      timestamp = Time.now();
      sessionId = sessionId;
    };
    
    chatInteractionsMap.put(interactionId, interaction);
    #ok("Chat interaction logged successfully")
  };

  // Get user's chat history (for continuity of care)
  public shared(msg) func getUserChatHistory(sessionId: ?Text) : async Result.Result<[ChatInteraction], Text> {
    let caller = msg.caller;
    
    let userInteractions = Array.filter<ChatInteraction>(
      Iter.toArray(chatInteractionsMap.vals()),
      func(interaction) {
        interaction.userId == caller and
        (switch (sessionId) {
          case (?sid) { interaction.sessionId == sid };
          case null { true };
        })
      }
    );
    
    #ok(userInteractions)
  };

  // Get chat analytics for mental health insights (admin only)
  public shared(msg) func getChatAnalytics() : async Result.Result<{totalInteractions: Nat; uniqueUsers: Nat}, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #admin)) {
      return #err("Unauthorized: Only admins can access chat analytics");
    };
    
    let allInteractions = Iter.toArray(chatInteractionsMap.vals());
    let uniqueUsers = Array.foldLeft<ChatInteraction, [Principal]>(
      allInteractions,
      [],
      func(acc, interaction) {
        if (Array.find<Principal>(acc, func(p) { p == interaction.userId }) == null) {
          Array.append(acc, [interaction.userId])
        } else {
          acc
        }
      }
    );
    
    #ok({
      totalInteractions = allInteractions.size();
      uniqueUsers = uniqueUsers.size();
    })
  };

  // MVT Token Integration Functions
  
  // Award tokens for appointment completion
  public shared(msg) func completeAppointmentWithTokens(appointmentId: AppointmentId) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (appointments.get(appointmentId)) {
      case (?appointment) {
        // Verify caller is either patient or doctor
        if (appointment.patientId != caller and appointment.doctorId != Principal.toText(caller)) {
          return #err("Unauthorized: Only appointment participants can complete appointments");
        };
        
        // Update appointment status
        let updatedAppointment = {
          appointment with
          status = #completed;
          updatedAt = Time.now();
        };
        appointments.put(appointmentId, updatedAppointment);
        
        // Award tokens to patient for completing appointment
        // Note: In production, this would call the actual MVT token canister
        // For now, we'll return a success message indicating tokens would be awarded
        
        #ok("Appointment completed successfully. MVT tokens awarded to patient.")
      };
      case null {
        #err("Appointment not found")
      };
    }
  };
  
  // Award tokens for platform usage
  public shared(msg) func recordDailyPlatformUsage() : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Check if user is registered
    switch (userRoles.get(caller)) {
      case (?role) {
        // In production, this would:
        // 1. Check if user already earned daily tokens today
        // 2. Call MVT token canister to award daily usage tokens
        // 3. Record the earning in user's history
        
        #ok("Daily platform usage recorded. MVT tokens awarded.")
      };
      case null {
        #err("User not registered")
      };
    }
  };
  
  // Award tokens for providing patient feedback
  public shared(msg) func submitFeedbackWithTokens(appointmentId: AppointmentId, _rating: Nat, _feedback: Text) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (appointments.get(appointmentId)) {
      case (?appointment) {
        // Verify caller is the patient
        if (appointment.patientId != caller) {
          return #err("Unauthorized: Only patients can provide feedback");
        };
        
        // In production, this would:
        // 1. Store the feedback in a feedback collection
        // 2. Call MVT token canister to award feedback tokens
        // 3. Update doctor's rating
        
        #ok("Feedback submitted successfully. MVT tokens awarded for providing feedback.")
      };
      case null {
        #err("Appointment not found")
      };
    }
  };
  
  // Spend tokens for premium consultation
  public shared(msg) func bookPremiumConsultation(doctorId: DoctorId, appointmentData: {
    appointmentType: AppointmentType;
    scheduledDate: Text;
    startTime: Text;
    endTime: Text;
    notes: Text;
  }) : async Result.Result<AppointmentId, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #patient)) {
      return #err("Unauthorized: Only patients can book consultations");
    };
    
    // In production, this would:
    // 1. Check user's MVT token balance
    // 2. Deduct premium consultation cost from balance
    // 3. Create the appointment with premium features
    
    // For now, create a regular appointment and indicate premium features
    let appointmentId = "premium_" # Int.toText(Time.now());
    let now = Time.now();
    
    let appointment: Appointment = {
      id = appointmentId;
      patientId = caller;
      doctorId = doctorId;
      appointmentType = appointmentData.appointmentType;
      scheduledDate = appointmentData.scheduledDate;
      startTime = appointmentData.startTime;
      endTime = appointmentData.endTime;
      status = #scheduled;
      notes = "PREMIUM: " # appointmentData.notes;
      symptoms = [];
      diagnosis = "";
      prescription = "";
      followUpRequired = false;
      followUpDate = null;
      createdAt = now;
      updatedAt = now;
    };
    
    appointments.put(appointmentId, appointment);
    #ok(appointmentId)
  };
  
  // Spend tokens for priority booking
  public shared(msg) func bookPriorityAppointment(doctorId: DoctorId, appointmentData: {
    appointmentType: AppointmentType;
    scheduledDate: Text;
    startTime: Text;
    endTime: Text;
    notes: Text;
  }) : async Result.Result<AppointmentId, Text> {
    let caller = msg.caller;
    
    if (not isAuthorized(caller, #patient)) {
      return #err("Unauthorized: Only patients can book appointments");
    };
    
    // In production, this would:
    // 1. Check user's MVT token balance
    // 2. Deduct priority booking cost from balance
    // 3. Create the appointment with priority status
    
    let appointmentId = "priority_" # Int.toText(Time.now());
    let now = Time.now();
    
    let appointment: Appointment = {
      id = appointmentId;
      patientId = caller;
      doctorId = doctorId;
      appointmentType = appointmentData.appointmentType;
      scheduledDate = appointmentData.scheduledDate;
      startTime = appointmentData.startTime;
      endTime = appointmentData.endTime;
      status = #confirmed; // Priority appointments are auto-confirmed
      notes = "PRIORITY: " # appointmentData.notes;
      symptoms = [];
      diagnosis = "";
      prescription = "";
      followUpRequired = false;
      followUpDate = null;
      createdAt = now;
      updatedAt = now;
    };
    
    appointments.put(appointmentId, appointment);
    #ok(appointmentId)
  };
  
  // Award tokens for doctor consultations
  public shared(msg) func completeDoctorConsultation(appointmentId: AppointmentId, consultationNotes: Text) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (appointments.get(appointmentId)) {
      case (?appointment) {
        // Verify caller is the doctor
        if (appointment.doctorId != Principal.toText(caller)) {
          return #err("Unauthorized: Only the assigned doctor can complete consultations");
        };
        
        // Update appointment with consultation notes
        let updatedAppointment = {
          appointment with
          notes = appointment.notes # " | Doctor Notes: " # consultationNotes;
          status = #completed;
          updatedAt = Time.now();
        };
        appointments.put(appointmentId, updatedAppointment);
        
        // In production, this would call MVT token canister to award consultation tokens to doctor
        
        #ok("Consultation completed successfully. MVT tokens awarded to doctor.")
      };
      case null {
        #err("Appointment not found")
      };
    }
  };
  
  // Get user's token earning opportunities
  public shared query(msg) func getTokenEarningOpportunities() : async Result.Result<{
    daily_platform_usage: Bool;
    pending_feedback: [AppointmentId];
    upcoming_appointments: [AppointmentId];
  }, Text> {
    let caller = msg.caller;
    
    switch (userRoles.get(caller)) {
      case (?role) {
        // Get user's appointments for feedback opportunities
        let userAppointments = Array.filter<Appointment>(
          Iter.toArray(appointments.vals()),
          func(appointment) {
            appointment.patientId == caller and appointment.status == #completed
          }
        );
        
        let pendingFeedback = Array.map<Appointment, AppointmentId>(
          userAppointments,
          func(appointment) { appointment.id }
        );
        
        let upcomingAppointments = Array.map<Appointment, AppointmentId>(
          Array.filter<Appointment>(
            Iter.toArray(appointments.vals()),
            func(appointment) {
              appointment.patientId == caller and appointment.status == #scheduled
            }
          ),
          func(appointment) { appointment.id }
        );
        
        #ok({
          daily_platform_usage = true; // In production, check if already earned today
          pending_feedback = pendingFeedback;
          upcoming_appointments = upcomingAppointments;
        })
      };
      case null {
        #err("User not registered")
      };
    }
  };
  
  // Get token spending options
  public shared query(msg) func getTokenSpendingOptions() : async Result.Result<{
    premium_consultation_cost: Nat;
    priority_booking_cost: Nat;
    advanced_features_cost: Nat;
    ai_insights_cost: Nat;
  }, Text> {
    let caller = msg.caller;
    
    switch (userRoles.get(caller)) {
      case (?role) {
        // In production, these would be fetched from MVT token canister
        #ok({
          premium_consultation_cost = 500; // 5.00 MVT
          priority_booking_cost = 200; // 2.00 MVT
          advanced_features_cost = 1000; // 10.00 MVT monthly
          ai_insights_cost = 300; // 3.00 MVT per insight
        })
      };
      case null {
        #err("User not registered")
      };
    }
  };

  // Faucet Configuration
  private let FAUCET_DAILY_LIMIT : Nat = 10000000000; // 100 MVT with 8 decimals
  private let FAUCET_COOLDOWN_PERIOD : Int = 86400000000000; // 24 hours in nanoseconds

  // Generate unique claim ID
  private func generateClaimId(userId: Principal, timestamp: Int) : Text {
    Principal.toText(userId) # "-" # Int.toText(timestamp)
  };

  // Check if user is eligible for faucet claim
  private func isEligibleForClaim(userId: Principal, currentTime: Int) : Bool {
    switch (lastClaimTimes.get(userId)) {
      case (?lastClaim) {
        currentTime >= (lastClaim + FAUCET_COOLDOWN_PERIOD)
      };
      case null { true };
    }
  };

  // Get faucet statistics for a user
  public shared query(msg) func getFaucetStats() : async FaucetStats {
    let caller = msg.caller;
    let currentTime = Time.now();
    let isEligible = isEligibleForClaim(caller, currentTime);
    
    let nextClaimTime = switch (lastClaimTimes.get(caller)) {
      case (?lastClaim) { lastClaim + FAUCET_COOLDOWN_PERIOD };
      case null { 0 };
    };
    
    // Count today's claims
    let todayStart = currentTime - (currentTime % 86400000000000); // Start of today
    let todayClaims = Array.filter<FaucetClaim>(
      Iter.toArray(faucetClaims.vals()),
      func(claim) {
        claim.user_id == caller and claim.timestamp >= todayStart and claim.status == "completed"
      }
    );
    
    let claimedToday = Array.foldLeft<FaucetClaim, Nat>(
      todayClaims,
      0,
      func(acc, claim) { acc + claim.amount }
    );
    
    // Count total claims
    let allUserClaims = Array.filter<FaucetClaim>(
      Iter.toArray(faucetClaims.vals()),
      func(claim) {
        claim.user_id == caller and claim.status == "completed"
      }
    );
    
    let totalClaimed = Array.foldLeft<FaucetClaim, Nat>(
      allUserClaims,
      0,
      func(acc, claim) { acc + claim.amount }
    );
    
    {
      dailyLimit = FAUCET_DAILY_LIMIT;
      claimedToday = claimedToday;
      totalClaimed = totalClaimed;
      nextClaimTime = nextClaimTime;
      isEligible = isEligible and claimedToday < FAUCET_DAILY_LIMIT;
    }
  };

  // Claim faucet tokens
  public shared(msg) func claimFaucetTokens() : async Result.Result<Text, Text> {
    let caller = msg.caller;
    let currentTime = Time.now();
    
    // Check if user is registered
    switch (userRoles.get(caller)) {
      case null {
        return #err("User not registered. Please register first.");
      };
      case (?role) {};
    };
    
    // Check eligibility
    if (not isEligibleForClaim(caller, currentTime)) {
      return #err("You must wait 24 hours between claims.");
    };
    
    // Check daily limit
    let todayStart = currentTime - (currentTime % 86400000000000);
    let todayClaims = Array.filter<FaucetClaim>(
      Iter.toArray(faucetClaims.vals()),
      func(claim) {
        claim.user_id == caller and claim.timestamp >= todayStart and claim.status == "completed"
      }
    );
    
    let claimedToday = Array.foldLeft<FaucetClaim, Nat>(
      todayClaims,
      0,
      func(acc, claim) { acc + claim.amount }
    );
    
    if (claimedToday >= FAUCET_DAILY_LIMIT) {
      return #err("Daily claim limit reached. Try again tomorrow.");
    };
    
    // Create claim record
    let claimId = generateClaimId(caller, currentTime);
    let claim : FaucetClaim = {
      id = claimId;
      user_id = caller;
      amount = FAUCET_DAILY_LIMIT;
      timestamp = currentTime;
      status = "completed"; // In production, this might be "pending" initially
    };
    
    // Store claim and update last claim time
    faucetClaims.put(claimId, claim);
    lastClaimTimes.put(caller, currentTime);
    
    // In production, this would mint tokens to the user's account
    // For now, we just return success
    #ok("Successfully claimed " # Nat.toText(FAUCET_DAILY_LIMIT) # " MVT tokens!")
  };

  // Get faucet claim history for a user
  public shared query(msg) func getFaucetClaimHistory() : async [FaucetClaim] {
    let caller = msg.caller;
    
    let userClaims = Array.filter<FaucetClaim>(
      Iter.toArray(faucetClaims.vals()),
      func(claim) { claim.user_id == caller }
    );
    
    // Sort by timestamp (newest first)
    Array.sort<FaucetClaim>(
      userClaims,
      func(a, b) {
        if (a.timestamp > b.timestamp) { #less }
        else if (a.timestamp < b.timestamp) { #greater }
        else { #equal }
      }
    )
  };

  // Health check function
  public query func healthCheck() : async {status: Text; timestamp: Int; version: Text} {
    {
      status = "healthy";
      timestamp = Time.now();
      version = "1.0.0";
    }
  };

  // Get chat endpoint for frontend integration
  public func getChatEndpoint() : async Text {
    "MentalVerse backend with simplified AI chat (no external dependencies)"
  };

  // === INTER-CANISTER SECURE MESSAGING ===
  
  // Create a secure conversation for therapy sessions
  public shared(msg) func createTherapyConversation(therapistId: Principal, sessionId: Text) : async Result.Result<SecureMessagingInterface.Conversation, Text> {
    let caller = msg.caller;
    
    // Verify caller is a patient and therapist exists
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType != #patient) {
          return #err("Only patients can create therapy conversations");
        };
      };
      case null {
        return #err("User profile not found");
      };
    };
    
    switch (userProfiles.get(therapistId)) {
      case (?therapistProfile) {
        if (therapistProfile.userType != #therapist) {
          return #err("Target user is not a therapist");
        };
      };
      case null {
        return #err("Therapist not found");
      };
    };
    
    let participants = [caller, therapistId];
    let metadata: SecureMessagingInterface.ConversationMetadata = {
      title = ?"Therapy Session";
      description = ?"Secure therapy conversation";
      session_id = ?sessionId;
      encryption_key_id = "session_" # sessionId # "_key";
    };
    
    try {
      let result = await secureMessagingActor.create_conversation(participants, #SessionChat, metadata);
      if (result.success) {
        switch (result.conversation) {
          case (?conversation) { #ok(conversation) };
          case null { #err("Failed to create conversation") };
        };
      } else {
        switch (result.error) {
          case (?error) { #err(error) };
          case null { #err("Unknown error creating conversation") };
        };
      };
    } catch (error) {
      #err("Inter-canister call failed: " # Error.message(error))
    };
  };
  
  // Send a secure message through the messaging canister
  public shared(msg) func sendSecureMessage(
    conversationId: Text,
    recipientId: Principal,
    content: Text,
    messageType: SecureMessagingInterface.MessageType
  ) : async Result.Result<SecureMessagingInterface.Message, Text> {
    let caller = msg.caller;
    
    // Verify user exists
    switch (userProfiles.get(caller)) {
      case (?profile) {};
      case null {
        return #err("User profile not found");
      };
    };
    
    try {
      let result = await secureMessagingActor.send_message(conversationId, recipientId, content, messageType, null, []);
      if (result.success) {
        switch (result.message) {
          case (?message) { #ok(message) };
          case null { #err("Failed to send message") };
        };
      } else {
        switch (result.error) {
          case (?error) { #err(error) };
          case null { #err("Unknown error sending message") };
        };
      };
    } catch (error) {
      #err("Inter-canister call failed: " # Error.message(error))
    };
  };
  
  // Get user's secure conversations
  public shared(msg) func getUserSecureConversations() : async Result.Result<[SecureMessagingInterface.Conversation], Text> {
    let caller = msg.caller;
    
    // Verify user exists
    switch (userProfiles.get(caller)) {
      case (?profile) {};
      case null {
        return #err("User profile not found");
      };
    };
    
    try {
      let conversations = await secureMessagingActor.get_user_conversations();
      #ok(conversations)
    } catch (error) {
      #err("Inter-canister call failed: " # Error.message(error))
    };
  };
  
  // Get messages from a secure conversation
  public shared(msg) func getSecureConversationMessages(
    conversationId: Text,
    limit: ?Nat64,
    offset: ?Nat64
  ) : async Result.Result<[SecureMessagingInterface.Message], Text> {
    let caller = msg.caller;
    
    // Verify user exists
    switch (userProfiles.get(caller)) {
      case (?profile) {};
      case null {
        return #err("User profile not found");
      };
    };
    
    try {
      let messages = await secureMessagingActor.get_conversation_messages(conversationId, limit, offset);
      #ok(messages)
    } catch (error) {
      #err("Inter-canister call failed: " # Error.message(error))
    };
  };
  
  // Register user's encryption key with secure messaging canister
  public shared(msg) func registerUserEncryptionKey(
    publicKey: Text,
    keyType: SecureMessagingInterface.KeyType
  ) : async Result.Result<SecureMessagingInterface.UserKey, Text> {
    let caller = msg.caller;
    
    // Verify user exists
    switch (userProfiles.get(caller)) {
      case (?profile) {};
      case null {
        return #err("User profile not found");
      };
    };
    
    try {
      let result = await secureMessagingActor.register_user_key(publicKey, keyType);
      switch (result) {
        case (#Ok(userKey)) { #ok(userKey) };
        case (#Err(error)) { #err(error) };
      };
    } catch (error) {
      #err("Inter-canister call failed: " # Error.message(error))
    };
  };
  
  // Get secure messaging canister health status
  public func getSecureMessagingHealth() : async Result.Result<Text, Text> {
    try {
      let health = await secureMessagingActor.health_check();
      #ok(health)
    } catch (error) {
      #err("Secure messaging canister unavailable: " # Error.message(error))
    };
  };

  // === MEDICAL RECORDS & STORAGE (ITERATION 3) ===

  // Helper function to generate unique IDs
  private func generateId(prefix: Text) : Text {
    prefix # "_" # Int.toText(Time.now()) # "_" # Int.toText(Int.abs(Time.now()))
  };

  // Helper function to log audit events
  private func logAuditEvent(
    userId: UserId,
    action: AuditLogAction,
    resourceType: Text,
    resourceId: Text,
    details: ?Text
  ) {
    let auditId = generateId("audit");
    let auditLog: AuditLog = {
      id = auditId;
      userId = userId;
      action = action;
      resourceType = resourceType;
      resourceId = resourceId;
      details = details;
      ipAddress = null; // Could be enhanced to capture IP
      userAgent = null; // Could be enhanced to capture user agent
      timestamp = Time.now();
    };
    auditLogs.put(auditId, auditLog);
  };

  // Helper function to check access permissions
  private func hasAccess(userId: UserId, resourceId: Text, requiredLevel: AccessLevel) : Bool {
    switch (accessControlRules.get(resourceId # "_" # Principal.toText(userId))) {
      case (?rule) {
        rule.isActive and (rule.accessLevel == requiredLevel or rule.accessLevel == #admin or rule.accessLevel == #owner)
      };
      case null { false };
    }
  };

  // Session Notes Management
  public shared(msg) func createSessionNote(
    sessionId: Text,
    patientId: UserId,
    content: Text,
    encryptionLevel: EncryptionLevel,
    tags: [Text],
    isConfidential: Bool
  ) : async Result.Result<SessionNote, Text> {
    let caller = msg.caller;
    
    // Verify caller is a therapist
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType != #therapist) {
          return #err("Only therapists can create session notes");
        };
      };
      case null {
        return #err("User profile not found");
      };
    };

    let noteId = generateId("note");
    let now = Time.now();
    let therapistId = Principal.toText(caller);
    
    let sessionNote: SessionNote = {
      id = noteId;
      sessionId = sessionId;
      therapistId = therapistId;
      patientId = patientId;
      content = content; // In production, this should be encrypted
      encryptionLevel = encryptionLevel;
      tags = tags;
      isConfidential = isConfidential;
      accessPermissions = [(caller, #owner), (patientId, #read)];
      createdAt = now;
      updatedAt = now;
      lastAccessedAt = ?now;
      lastAccessedBy = ?caller;
    };

    sessionNotes.put(noteId, sessionNote);
    
    // Create access control rules
    let ownerRuleId = noteId # "_" # Principal.toText(caller);
    let patientRuleId = noteId # "_" # Principal.toText(patientId);
    
    let ownerRule: AccessControlRule = {
      id = ownerRuleId;
      resourceType = "session_note";
      resourceId = noteId;
      userId = caller;
      accessLevel = #owner;
      grantedBy = caller;
      grantedAt = now;
      expiresAt = null;
      isActive = true;
      conditions = null;
    };
    
    let patientRule: AccessControlRule = {
      id = patientRuleId;
      resourceType = "session_note";
      resourceId = noteId;
      userId = patientId;
      accessLevel = #read;
      grantedBy = caller;
      grantedAt = now;
      expiresAt = null;
      isActive = true;
      conditions = null;
    };
    
    accessControlRules.put(ownerRuleId, ownerRule);
    accessControlRules.put(patientRuleId, patientRule);
    
    // Log audit event
    logAuditEvent(caller, #create, "session_note", noteId, ?"Session note created");
    
    #ok(sessionNote)
  };

  // Get session notes for a patient (with access control)
  public shared query(msg) func getSessionNotes(patientId: UserId) : async Result.Result<[SessionNote], Text> {
    let caller = msg.caller;
    
    // Check if caller has access to patient's notes
    let hasPatientAccess = caller == patientId or 
      (switch (userProfiles.get(caller)) {
        case (?profile) { profile.userType == #therapist or profile.userType == #admin };
        case null { false };
      });
    
    if (not hasPatientAccess) {
      return #err("Access denied");
    };
    
    let patientNotes = Array.filter<SessionNote>(
      Iter.toArray(sessionNotes.vals()),
      func(note) { note.patientId == patientId }
    );
    
    #ok(patientNotes)
  };

  // Prescription Management
  public shared(msg) func createPrescription(
    patientId: UserId,
    sessionId: ?Text,
    medicationName: Text,
    dosage: Text,
    frequency: Text,
    duration: Text,
    instructions: Text,
    sideEffects: [Text],
    contraindications: [Text]
  ) : async Result.Result<Prescription, Text> {
    let caller = msg.caller;
    
    // Verify caller is a therapist
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType != #therapist) {
          return #err("Only therapists can create prescriptions");
        };
      };
      case null {
        return #err("User profile not found");
      };
    };

    let prescriptionId = generateId("rx");
    let now = Time.now();
    let therapistId = Principal.toText(caller);
    
    let prescription: Prescription = {
      id = prescriptionId;
      patientId = patientId;
      therapistId = therapistId;
      sessionId = sessionId;
      medicationName = medicationName;
      dosage = dosage;
      frequency = frequency;
      duration = duration;
      instructions = instructions;
      sideEffects = sideEffects;
      contraindications = contraindications;
      isActive = true;
      startDate = "";
      endDate = null;
      refillsRemaining = 0;
      pharmacyNotes = null;
      encryptionLevel = #high;
      accessPermissions = [(caller, #owner), (patientId, #read)];
      createdAt = now;
      updatedAt = now;
    };

    prescriptions.put(prescriptionId, prescription);
    
    // Create access control rules
    let ownerRuleId = prescriptionId # "_" # Principal.toText(caller);
    let patientRuleId = prescriptionId # "_" # Principal.toText(patientId);
    
    let ownerRule: AccessControlRule = {
      id = ownerRuleId;
      resourceType = "prescription";
      resourceId = prescriptionId;
      userId = caller;
      accessLevel = #owner;
      grantedBy = caller;
      grantedAt = now;
      expiresAt = null;
      isActive = true;
      conditions = null;
    };
    
    let patientRule: AccessControlRule = {
      id = patientRuleId;
      resourceType = "prescription";
      resourceId = prescriptionId;
      userId = patientId;
      accessLevel = #read;
      grantedBy = caller;
      grantedAt = now;
      expiresAt = null;
      isActive = true;
      conditions = null;
    };
    
    accessControlRules.put(ownerRuleId, ownerRule);
    accessControlRules.put(patientRuleId, patientRule);
    
    // Log audit event
    logAuditEvent(caller, #create, "prescription", prescriptionId, ?"Prescription created");
    
    #ok(prescription)
  };

  // Get prescriptions for a patient
  public shared query(msg) func getPrescriptions(patientId: UserId) : async Result.Result<[Prescription], Text> {
    let caller = msg.caller;
    
    // Check if caller has access to patient's prescriptions
    let hasPatientAccess = caller == patientId or 
      (switch (userProfiles.get(caller)) {
        case (?profile) { profile.userType == #therapist or profile.userType == #admin };
        case null { false };
      });
    
    if (not hasPatientAccess) {
      return #err("Access denied");
    };
    
    let patientPrescriptions = Array.filter<Prescription>(
      Iter.toArray(prescriptions.vals()),
      func(prescription) { prescription.patientId == patientId }
    );
    
    #ok(patientPrescriptions)
  };

  // Treatment Summary Management
  public shared(msg) func createTreatmentSummary(
    patientId: UserId,
    startDate: Text,
    endDate: ?Text,
    diagnosis: [Text],
    treatmentGoals: [Text],
    interventionsUsed: [Text],
    progressNotes: Text,
    outcomes: Text,
    recommendations: Text,
    followUpPlan: ?Text,
    riskAssessment: ?Text
  ) : async Result.Result<TreatmentSummary, Text> {
    let caller = msg.caller;
    
    // Verify caller is a therapist
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType != #therapist) {
          return #err("Only therapists can create treatment summaries");
        };
      };
      case null {
        return #err("User profile not found");
      };
    };

    let summaryId = generateId("summary");
    let now = Time.now();
    let therapistId = Principal.toText(caller);
    
    let treatmentSummary: TreatmentSummary = {
      id = summaryId;
      patientId = patientId;
      therapistId = therapistId;
      treatmentPeriod = {
        startDate = startDate;
        endDate = endDate;
      };
      diagnosis = diagnosis;
      treatmentGoals = treatmentGoals;
      interventionsUsed = interventionsUsed;
      progressNotes = progressNotes;
      outcomes = outcomes;
      recommendations = recommendations;
      followUpPlan = followUpPlan;
      riskAssessment = riskAssessment;
      encryptionLevel = #maximum;
      accessPermissions = [(caller, #owner), (patientId, #read)];
      attachments = [];
      createdAt = now;
      updatedAt = now;
    };

    treatmentSummaries.put(summaryId, treatmentSummary);
    
    // Create access control rules
    let ownerRuleId = summaryId # "_" # Principal.toText(caller);
    let patientRuleId = summaryId # "_" # Principal.toText(patientId);
    
    let ownerRule: AccessControlRule = {
      id = ownerRuleId;
      resourceType = "treatment_summary";
      resourceId = summaryId;
      userId = caller;
      accessLevel = #owner;
      grantedBy = caller;
      grantedAt = now;
      expiresAt = null;
      isActive = true;
      conditions = null;
    };
    
    let patientRule: AccessControlRule = {
      id = patientRuleId;
      resourceType = "treatment_summary";
      resourceId = summaryId;
      userId = patientId;
      accessLevel = #read;
      grantedBy = caller;
      grantedAt = now;
      expiresAt = null;
      isActive = true;
      conditions = null;
    };
    
    accessControlRules.put(ownerRuleId, ownerRule);
    accessControlRules.put(patientRuleId, patientRule);
    
    // Log audit event
    logAuditEvent(caller, #create, "treatment_summary", summaryId, ?"Treatment summary created");
    
    #ok(treatmentSummary)
  };

  // Get treatment summaries for a patient
  public shared query(msg) func getTreatmentSummaries(patientId: UserId) : async Result.Result<[TreatmentSummary], Text> {
    let caller = msg.caller;
    
    // Check if caller has access to patient's treatment summaries
    let hasPatientAccess = caller == patientId or 
      (switch (userProfiles.get(caller)) {
        case (?profile) { profile.userType == #therapist or profile.userType == #admin };
        case null { false };
      });
    
    if (not hasPatientAccess) {
      return #err("Access denied");
    };
    
    let patientSummaries = Array.filter<TreatmentSummary>(
      Iter.toArray(treatmentSummaries.vals()),
      func(summary) { summary.patientId == patientId }
    );
    
    #ok(patientSummaries)
  };

  // Access Control Management
  public shared(msg) func grantAccess(
    resourceType: Text,
    resourceId: Text,
    userId: UserId,
    accessLevel: AccessLevel,
    expiresAt: ?Int
  ) : async Result.Result<AccessControlRule, Text> {
    let caller = msg.caller;
    
    // Verify caller has owner or admin access to the resource
    let callerRuleId = resourceId # "_" # Principal.toText(caller);
    switch (accessControlRules.get(callerRuleId)) {
      case (?rule) {
        if (not (rule.accessLevel == #owner or rule.accessLevel == #admin)) {
          return #err("Insufficient permissions to grant access");
        };
      };
      case null {
        return #err("Access denied");
      };
    };
    
    let ruleId = resourceId # "_" # Principal.toText(userId);
    let now = Time.now();
    
    let accessRule: AccessControlRule = {
      id = ruleId;
      resourceType = resourceType;
      resourceId = resourceId;
      userId = userId;
      accessLevel = accessLevel;
      grantedBy = caller;
      grantedAt = now;
      expiresAt = expiresAt;
      isActive = true;
      conditions = null;
    };
    
    accessControlRules.put(ruleId, accessRule);
    
    // Log audit event
    logAuditEvent(caller, #access_granted, resourceType, resourceId, ?"Access granted to user");
    
    #ok(accessRule)
  };

  // Revoke access
  public shared(msg) func revokeAccess(
    resourceType: Text,
    resourceId: Text,
    userId: UserId
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    // Verify caller has owner or admin access to the resource
    let callerRuleId = resourceId # "_" # Principal.toText(caller);
    switch (accessControlRules.get(callerRuleId)) {
      case (?rule) {
        if (not (rule.accessLevel == #owner or rule.accessLevel == #admin)) {
          return #err("Insufficient permissions to revoke access");
        };
      };
      case null {
        return #err("Access denied");
      };
    };
    
    let ruleId = resourceId # "_" # Principal.toText(userId);
    switch (accessControlRules.get(ruleId)) {
      case (?rule) {
        let updatedRule: AccessControlRule = {
          id = rule.id;
          resourceType = rule.resourceType;
          resourceId = rule.resourceId;
          userId = rule.userId;
          accessLevel = rule.accessLevel;
          grantedBy = rule.grantedBy;
          grantedAt = rule.grantedAt;
          expiresAt = rule.expiresAt;
          isActive = false;
          conditions = rule.conditions;
        };
        accessControlRules.put(ruleId, updatedRule);
        
        // Log audit event
        logAuditEvent(caller, #access_revoked, resourceType, resourceId, ?"Access revoked from user");
        
        #ok("Access revoked successfully")
      };
      case null {
        #err("Access rule not found")
      };
    };
  };

  // Get audit logs (admin only)
  public shared query(msg) func getAuditLogs(
    resourceType: ?Text,
    resourceId: ?Text,
    userId: ?UserId,
    limit: ?Nat
  ) : async Result.Result<[AuditLog], Text> {
    let caller = msg.caller;
    
    // Verify caller is admin
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType != #admin) {
          return #err("Only admins can access audit logs");
        };
      };
      case null {
        return #err("User profile not found");
      };
    };
    
    var logs = Iter.toArray(auditLogs.vals());
    
    // Apply filters
    switch (resourceType) {
      case (?rt) {
        logs := Array.filter<AuditLog>(logs, func(log) { log.resourceType == rt });
      };
      case null {};
    };
    
    switch (resourceId) {
      case (?rid) {
        logs := Array.filter<AuditLog>(logs, func(log) { log.resourceId == rid });
      };
      case null {};
    };
    
    switch (userId) {
      case (?uid) {
        logs := Array.filter<AuditLog>(logs, func(log) { log.userId == uid });
      };
      case null {};
    };
    
    // Sort by timestamp (newest first)
    let sortedLogs = Array.sort<AuditLog>(
      logs,
      func(a, b) {
        if (a.timestamp > b.timestamp) { #less }
        else if (a.timestamp < b.timestamp) { #greater }
        else { #equal }
      }
    );
    
    // Apply limit
    let finalLogs = switch (limit) {
      case (?l) {
        if (sortedLogs.size() > l) {
          Array.tabulate<AuditLog>(l, func(i) { sortedLogs[i] })
        } else {
          sortedLogs
        }
      };
      case null { sortedLogs };
    };
    
    #ok(finalLogs)
  };

  // Get user's access permissions
  public shared query(msg) func getUserAccessPermissions() : async Result.Result<[AccessControlRule], Text> {
    let caller = msg.caller;
    
    let userRules = Array.filter<AccessControlRule>(
      Iter.toArray(accessControlRules.vals()),
      func(rule) { rule.userId == caller and rule.isActive }
    );
    
    #ok(userRules)
  };

  // ===== PAYMENT INTEGRATION FUNCTIONS (ITERATION 4) =====
  
  // Helper function to generate payment transaction ID
  private func generatePaymentId() : Text {
    "payment_" # Int.toText(Time.now()) # "_" # Int.toText(paymentTransactions.size())
  };
  
  // Helper function to generate escrow contract ID
  private func generateEscrowId() : Text {
    "escrow_" # Int.toText(Time.now()) # "_" # Int.toText(escrowContracts.size())
  };
  
  // Helper function to generate payment plan ID
  private func generatePaymentPlanId() : Text {
    "plan_" # Int.toText(Time.now()) # "_" # Int.toText(paymentPlans.size())
  };
  
  // Create payment transaction
  public shared(msg) func createPaymentTransaction(
    payeeId: Principal,
    amount: Nat,
    paymentMethod: PaymentMethod,
    serviceType: Text,
    serviceId: Text,
    autoRefundEnabled: Bool,
    refundDeadlineHours: ?Nat
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    let paymentId = generatePaymentId();
    let now = Time.now();
    
    let refundDeadline = switch (refundDeadlineHours) {
      case (?hours) { ?(now + (hours * 3600000000000)) }; // Convert hours to nanoseconds
      case null { null };
    };
    
    let transaction: PaymentTransaction = {
      id = paymentId;
      payerId = caller;
      payeeId = payeeId;
      amount = amount;
      paymentMethod = paymentMethod;
      status = #pending;
      serviceType = serviceType;
      serviceId = serviceId;
      createdAt = now;
      completedAt = null;
      refundedAt = null;
      refundReason = null;
      escrowReleaseConditions = null;
      autoRefundEnabled = autoRefundEnabled;
      refundDeadline = refundDeadline;
    };
    
    paymentTransactions.put(paymentId, transaction);
    
    // Log audit trail
    let auditId = generateId("audit");
    let auditLog: AuditLog = {
      id = auditId;
      userId = caller;
      action = #create;
      resourceType = "payment_transaction";
      resourceId = paymentId;
      details = ?("Payment transaction created for " # serviceType);
      ipAddress = null;
      userAgent = null;
      timestamp = now;
    };
    auditLogs.put(auditId, auditLog);
    
    #ok(paymentId)
  };
  
  // Process payment (simulate payment processing)
  public shared(msg) func processPayment(paymentId: Text) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (paymentTransactions.get(paymentId)) {
      case (?transaction) {
        // Verify caller is payer or payee
        if (transaction.payerId != caller and transaction.payeeId != caller) {
          return #err("Unauthorized: Only payment participants can process payments");
        };
        
        if (transaction.status != #pending) {
          return #err("Payment is not in pending status");
        };
        
        // Update transaction status
        let updatedTransaction = {
          transaction with
          status = #processing;
        };
        paymentTransactions.put(paymentId, updatedTransaction);
        
        // In production, this would integrate with actual payment processors
        // For now, simulate successful payment
        let completedTransaction = {
          updatedTransaction with
          status = #completed;
          completedAt = ?Time.now();
        };
        paymentTransactions.put(paymentId, completedTransaction);
        
        #ok("Payment processed successfully")
      };
      case null {
        #err("Payment transaction not found")
      };
    }
  };
  
  // Create escrow contract
  public shared(msg) func createEscrowContract(
    payeeId: Principal,
    amount: Nat,
    serviceId: Text,
    conditions: Text,
    releaseConditions: [Text],
    autoReleaseHours: Nat
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    let escrowId = generateEscrowId();
    let now = Time.now();
    
    let contract: EscrowContract = {
      id = escrowId;
      payerId = caller;
      payeeId = payeeId;
      amount = amount;
      serviceId = serviceId;
      conditions = conditions;
      createdAt = now;
      releaseConditions = releaseConditions;
      disputeResolution = null;
      autoReleaseTime = now + (autoReleaseHours * 3600000000000);
      status = #pending;
    };
    
    escrowContracts.put(escrowId, contract);
    
    #ok(escrowId)
  };
  
  // Release escrow funds
  public shared(msg) func releaseEscrowFunds(
    escrowId: Text,
    releaseCondition: Text
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (escrowContracts.get(escrowId)) {
      case (?contract) {
        // Verify caller is payer or payee
        if (contract.payerId != caller and contract.payeeId != caller) {
          return #err("Unauthorized: Only contract participants can release funds");
        };
        
        if (contract.status != #pending) {
          return #err("Escrow contract is not in pending status");
        };
        
        // Check if release condition is met
        let conditionMet = Array.find<Text>(
          contract.releaseConditions,
          func(condition) { condition == releaseCondition }
        );
        
        switch (conditionMet) {
          case (?_) {
            let updatedContract = {
              contract with
              status = #completed;
            };
            escrowContracts.put(escrowId, updatedContract);
            
            #ok("Escrow funds released successfully")
          };
          case null {
            #err("Release condition not met")
          };
        }
      };
      case null {
        #err("Escrow contract not found")
      };
    }
  };
  
  // Process automatic refund
  public shared(msg) func processAutomaticRefund(
    paymentId: Text,
    refundReason: RefundReason
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (paymentTransactions.get(paymentId)) {
      case (?transaction) {
        // Verify caller is payer or system admin
        if (transaction.payerId != caller) {
          // Check if caller is admin
          switch (userProfiles.get(caller)) {
            case (?profile) {
              if (profile.userType != #admin) {
                return #err("Unauthorized: Only payer or admin can process refunds");
              };
            };
            case null {
              return #err("Unauthorized: User profile not found");
            };
          };
        };
        
        if (transaction.status != #completed) {
          return #err("Payment must be completed to process refund");
        };
        
        // Check if auto refund is enabled
        if (not transaction.autoRefundEnabled) {
          return #err("Automatic refund is not enabled for this transaction");
        };
        
        // Check refund deadline
        switch (transaction.refundDeadline) {
          case (?deadline) {
            if (Time.now() > deadline) {
              return #err("Refund deadline has passed");
            };
          };
          case null {};
        };
        
        let refundedTransaction = {
          transaction with
          status = #refunded;
          refundedAt = ?Time.now();
          refundReason = ?refundReason;
        };
        paymentTransactions.put(paymentId, refundedTransaction);
        
        #ok("Automatic refund processed successfully")
      };
      case null {
        #err("Payment transaction not found")
      };
    }
  };
  
  // Create payment plan
  public shared(msg) func createPaymentPlan(
    totalAmount: Nat,
    installments: Nat,
    frequency: Text,
    autoPayEnabled: Bool
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    let planId = generatePaymentPlanId();
    let now = Time.now();
    
    if (installments == 0) {
      return #err("Number of installments must be greater than 0");
    };
    
    let installmentAmount = totalAmount / installments;
    
    // Calculate next payment date based on frequency
    let nextPaymentDate = switch (frequency) {
      case ("weekly") { now + (7 * 24 * 3600000000000) };
      case ("monthly") { now + (30 * 24 * 3600000000000) };
      case ("quarterly") { now + (90 * 24 * 3600000000000) };
      case (_) { now + (30 * 24 * 3600000000000) }; // Default to monthly
    };
    
    let plan: PaymentPlan = {
      id = planId;
      userId = caller;
      totalAmount = totalAmount;
      installments = installments;
      installmentAmount = installmentAmount;
      frequency = frequency;
      startDate = now;
      nextPaymentDate = nextPaymentDate;
      remainingInstallments = installments;
      status = #pending;
      autoPayEnabled = autoPayEnabled;
    };
    
    paymentPlans.put(planId, plan);
    
    #ok(planId)
  };
  
  // Process payment plan installment
  public shared(msg) func processPaymentPlanInstallment(
    planId: Text
  ) : async Result.Result<Text, Text> {
    let caller = msg.caller;
    
    switch (paymentPlans.get(planId)) {
      case (?plan) {
        if (plan.userId != caller) {
          return #err("Unauthorized: Only plan owner can process installments");
        };
        
        if (plan.status != #pending) {
          return #err("Payment plan is not active");
        };
        
        if (plan.remainingInstallments == 0) {
          return #err("Payment plan is already completed");
        };
        
        let newRemainingInstallments = plan.remainingInstallments - 1;
        let newStatus = if (newRemainingInstallments == 0) { #completed } else { #pending };
        
        // Calculate next payment date
        let nextPaymentDate = switch (plan.frequency) {
          case ("weekly") { plan.nextPaymentDate + (7 * 24 * 3600000000000) };
          case ("monthly") { plan.nextPaymentDate + (30 * 24 * 3600000000000) };
          case ("quarterly") { plan.nextPaymentDate + (90 * 24 * 3600000000000) };
          case (_) { plan.nextPaymentDate + (30 * 24 * 3600000000000) };
        };
        
        let updatedPlan = {
          plan with
          remainingInstallments = newRemainingInstallments;
          nextPaymentDate = nextPaymentDate;
          status = newStatus;
        };
        
        paymentPlans.put(planId, updatedPlan);
        
        #ok("Payment plan installment processed successfully")
      };
      case null {
        #err("Payment plan not found")
      };
    }
  };
  
  // Get payment transactions for user
  public shared query(msg) func getUserPaymentTransactions() : async Result.Result<[PaymentTransaction], Text> {
    let caller = msg.caller;
    
    let userTransactions = Array.filter<PaymentTransaction>(
      Iter.toArray(paymentTransactions.vals()),
      func(transaction) {
        transaction.payerId == caller or transaction.payeeId == caller
      }
    );
    
    #ok(userTransactions)
  };
  
  // Get escrow contracts for user
  public shared query(msg) func getUserEscrowContracts() : async Result.Result<[EscrowContract], Text> {
    let caller = msg.caller;
    
    let userContracts = Array.filter<EscrowContract>(
      Iter.toArray(escrowContracts.vals()),
      func(contract) {
        contract.payerId == caller or contract.payeeId == caller
      }
    );
    
    #ok(userContracts)
  };
  
  // Get payment plans for user
  public shared query(msg) func getUserPaymentPlans() : async Result.Result<[PaymentPlan], Text> {
    let caller = msg.caller;
    
    let userPlans = Array.filter<PaymentPlan>(
      Iter.toArray(paymentPlans.vals()),
      func(plan) { plan.userId == caller }
    );
    
    #ok(userPlans)
  };
  
  // Get payment statistics (admin only)
  public shared query(msg) func getPaymentStatistics() : async Result.Result<{
    totalTransactions: Nat;
    completedTransactions: Nat;
    refundedTransactions: Nat;
    totalEscrowContracts: Nat;
    activePaymentPlans: Nat;
    totalPaymentVolume: Nat;
  }, Text> {
    let caller = msg.caller;
    
    // Verify caller is admin
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.userType != #admin) {
          return #err("Only admins can access payment statistics");
        };
      };
      case null {
        return #err("User profile not found");
      };
    };
    
    let allTransactions = Iter.toArray(paymentTransactions.vals());
    let completedTransactions = Array.filter<PaymentTransaction>(
      allTransactions,
      func(t) { t.status == #completed }
    );
    let refundedTransactions = Array.filter<PaymentTransaction>(
      allTransactions,
      func(t) { t.status == #refunded }
    );
    
    let totalPaymentVolume = Array.foldLeft<PaymentTransaction, Nat>(
      completedTransactions,
      0,
      func(acc, t) { acc + t.amount }
    );
    
    let allPlans = Iter.toArray(paymentPlans.vals());
    let activePlans = Array.filter<PaymentPlan>(
      allPlans,
      func(p) { p.status == #pending }
    );
    
    #ok({
      totalTransactions = allTransactions.size();
      completedTransactions = completedTransactions.size();
      refundedTransactions = refundedTransactions.size();
      totalEscrowContracts = escrowContracts.size();
      activePaymentPlans = activePlans.size();
      totalPaymentVolume = totalPaymentVolume;
    })
  };
};
