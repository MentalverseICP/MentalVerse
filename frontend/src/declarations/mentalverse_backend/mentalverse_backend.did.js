export const idlFactory = ({ IDL }) => {
  const DoctorId = IDL.Text;
  const AppointmentType = IDL.Variant({
    'emergency' : IDL.Null,
    'examination' : IDL.Null,
    'followUp' : IDL.Null,
    'routine' : IDL.Null,
    'therapy' : IDL.Null,
    'consultation' : IDL.Null,
  });
  const AppointmentId = IDL.Text;
  const Result_35 = IDL.Variant({ 'ok' : AppointmentId, 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const UserType = IDL.Variant({
    'patient' : IDL.Null,
    'admin' : IDL.Null,
    'therapist' : IDL.Null,
  });
  const UserId = IDL.Principal;
  const VerificationStatus = IDL.Variant({
    'verified' : IDL.Null,
    'pending' : IDL.Null,
    'rejected' : IDL.Null,
    'suspended' : IDL.Null,
  });
  const UserProfile = IDL.Record({
    'id' : UserId,
    'bio' : IDL.Opt(IDL.Text),
    'userType' : UserType,
    'createdAt' : IDL.Int,
    'email' : IDL.Text,
    'updatedAt' : IDL.Int,
    'onboardingCompleted' : IDL.Bool,
    'phoneNumber' : IDL.Opt(IDL.Text),
    'profilePicture' : IDL.Opt(IDL.Text),
    'lastName' : IDL.Text,
    'verificationStatus' : VerificationStatus,
    'firstName' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'ok' : UserProfile, 'err' : IDL.Text });
  const AppointmentStatus = IDL.Variant({
    'scheduled' : IDL.Null,
    'cancelled' : IDL.Null,
    'rescheduled' : IDL.Null,
    'completed' : IDL.Null,
    'confirmed' : IDL.Null,
    'inProgress' : IDL.Null,
  });
  const Appointment = IDL.Record({
    'id' : AppointmentId,
    'startTime' : IDL.Text,
    'status' : AppointmentStatus,
    'doctorId' : DoctorId,
    'prescription' : IDL.Text,
    'endTime' : IDL.Text,
    'scheduledDate' : IDL.Text,
    'patientId' : UserId,
    'createdAt' : IDL.Int,
    'diagnosis' : IDL.Text,
    'appointmentType' : AppointmentType,
    'updatedAt' : IDL.Int,
    'followUpRequired' : IDL.Bool,
    'notes' : IDL.Text,
    'symptoms' : IDL.Vec(IDL.Text),
    'followUpDate' : IDL.Opt(IDL.Text),
  });
  const Result_4 = IDL.Variant({ 'ok' : Appointment, 'err' : IDL.Text });
  const ConsentType = IDL.Variant({
    'sessionNotes' : IDL.Null,
    'medicalRecords' : IDL.Null,
    'diagnostics' : IDL.Null,
    'fullAccess' : IDL.Null,
    'prescriptions' : IDL.Null,
  });
  const ConsentStatus = IDL.Variant({
    'revoked' : IDL.Null,
    'expired' : IDL.Null,
    'pending' : IDL.Null,
    'granted' : IDL.Null,
  });
  const ConsentRecord = IDL.Record({
    'id' : IDL.Text,
    'status' : ConsentStatus,
    'expiresAt' : IDL.Opt(IDL.Int),
    'grantedAt' : IDL.Opt(IDL.Int),
    'patientId' : UserId,
    'createdAt' : IDL.Int,
    'therapistId' : IDL.Text,
    'updatedAt' : IDL.Int,
    'purpose' : IDL.Text,
    'revokedAt' : IDL.Opt(IDL.Int),
    'consentType' : ConsentType,
  });
  const Result_3 = IDL.Variant({ 'ok' : ConsentRecord, 'err' : IDL.Text });
  const Doctor = IDL.Record({
    'id' : DoctorId,
    'yearsOfExperience' : IDL.Nat,
    'userId' : UserId,
    'createdAt' : IDL.Int,
    'availableHours' : IDL.Text,
    'education' : IDL.Vec(IDL.Text),
    'languages' : IDL.Vec(IDL.Text),
    'isOnline' : IDL.Bool,
    'email' : IDL.Text,
    'specialty' : IDL.Vec(IDL.Text),
    'updatedAt' : IDL.Int,
    'acceptsInsurance' : IDL.Bool,
    'isVerified' : IDL.Bool,
    'profileDescription' : IDL.Text,
    'sessionTypes' : IDL.Vec(IDL.Text),
    'licenseNumber' : IDL.Text,
    'rating' : IDL.Float64,
    'insuranceProviders' : IDL.Vec(IDL.Text),
    'certifications' : IDL.Vec(IDL.Text),
    'totalAppointments' : IDL.Nat,
    'licenseExpiry' : IDL.Text,
    'consultationFee' : IDL.Nat,
    'lastName' : IDL.Text,
    'licenseState' : IDL.Text,
    'approachMethods' : IDL.Vec(IDL.Text),
    'firstName' : IDL.Text,
  });
  const Result_27 = IDL.Variant({ 'ok' : Doctor, 'err' : IDL.Text });
  const RecordId = IDL.Text;
  const MedicalRecord = IDL.Record({
    'id' : RecordId,
    'doctorId' : DoctorId,
    'title' : IDL.Text,
    'patientId' : UserId,
    'createdAt' : IDL.Int,
    'description' : IDL.Text,
    'recordType' : IDL.Text,
    'updatedAt' : IDL.Int,
    'isConfidential' : IDL.Bool,
    'accessPermissions' : IDL.Vec(UserId),
    'attachments' : IDL.Vec(IDL.Text),
    'appointmentId' : IDL.Opt(AppointmentId),
  });
  const Result_26 = IDL.Variant({ 'ok' : MedicalRecord, 'err' : IDL.Text });
  const Patient = IDL.Record({
    'id' : UserId,
    'timezone' : IDL.Opt(IDL.Text),
    'preferredLanguage' : IDL.Opt(IDL.Text),
    'insuranceProvider' : IDL.Opt(IDL.Text),
    'dateOfBirth' : IDL.Text,
    'createdAt' : IDL.Int,
    'emergencyContact' : IDL.Text,
    'email' : IDL.Text,
    'emergencyContactRelation' : IDL.Opt(IDL.Text),
    'updatedAt' : IDL.Int,
    'medicalHistory' : IDL.Vec(IDL.Text),
    'gender' : IDL.Text,
    'phoneNumber' : IDL.Text,
    'lastName' : IDL.Text,
    'allergies' : IDL.Vec(IDL.Text),
    'currentMedications' : IDL.Vec(IDL.Text),
    'firstName' : IDL.Text,
  });
  const Result_25 = IDL.Variant({ 'ok' : Patient, 'err' : IDL.Text });
  const PaymentMethod = IDL.Variant({
    'mvt_tokens' : IDL.Null,
    'cycles' : IDL.Null,
    'escrow' : IDL.Null,
  });
  const EncryptionLevel = IDL.Variant({
    'high' : IDL.Null,
    'none' : IDL.Null,
    'maximum' : IDL.Null,
    'standard' : IDL.Null,
  });
  const AccessLevel = IDL.Variant({
    'admin' : IDL.Null,
    'owner' : IDL.Null,
    'read' : IDL.Null,
    'write' : IDL.Null,
  });
  const Prescription = IDL.Record({
    'id' : IDL.Text,
    'duration' : IDL.Text,
    'medicationName' : IDL.Text,
    'endDate' : IDL.Opt(IDL.Text),
    'dosage' : IDL.Text,
    'patientId' : UserId,
    'createdAt' : IDL.Int,
    'instructions' : IDL.Text,
    'isActive' : IDL.Bool,
    'contraindications' : IDL.Vec(IDL.Text),
    'therapistId' : IDL.Text,
    'refillsRemaining' : IDL.Nat,
    'updatedAt' : IDL.Int,
    'sideEffects' : IDL.Vec(IDL.Text),
    'sessionId' : IDL.Opt(IDL.Text),
    'frequency' : IDL.Text,
    'encryptionLevel' : EncryptionLevel,
    'pharmacyNotes' : IDL.Opt(IDL.Text),
    'accessPermissions' : IDL.Vec(IDL.Tuple(UserId, AccessLevel)),
    'startDate' : IDL.Text,
  });
  const Result_34 = IDL.Variant({ 'ok' : Prescription, 'err' : IDL.Text });
  const SessionNote = IDL.Record({
    'id' : IDL.Text,
    'content' : IDL.Text,
    'patientId' : UserId,
    'createdAt' : IDL.Int,
    'tags' : IDL.Vec(IDL.Text),
    'therapistId' : IDL.Text,
    'updatedAt' : IDL.Int,
    'isConfidential' : IDL.Bool,
    'sessionId' : IDL.Text,
    'encryptionLevel' : EncryptionLevel,
    'lastAccessedAt' : IDL.Opt(IDL.Int),
    'lastAccessedBy' : IDL.Opt(UserId),
    'accessPermissions' : IDL.Vec(IDL.Tuple(UserId, AccessLevel)),
  });
  const Result_33 = IDL.Variant({ 'ok' : SessionNote, 'err' : IDL.Text });
  const SessionRequestStatus = IDL.Variant({
    'cancelled' : IDL.Null,
    'pending' : IDL.Null,
    'rescheduled' : IDL.Null,
    'accepted' : IDL.Null,
    'declined' : IDL.Null,
  });
  const SessionRequest = IDL.Record({
    'id' : IDL.Text,
    'status' : SessionRequestStatus,
    'duration' : IDL.Nat,
    'urgencyLevel' : IDL.Text,
    'sessionType' : IDL.Text,
    'patientId' : UserId,
    'createdAt' : IDL.Int,
    'therapistId' : IDL.Text,
    'updatedAt' : IDL.Int,
    'notes' : IDL.Text,
    'requestedDate' : IDL.Text,
    'requestedTime' : IDL.Text,
  });
  const Result_2 = IDL.Variant({ 'ok' : SessionRequest, 'err' : IDL.Text });
  const Therapist = IDL.Record({
    'id' : DoctorId,
    'yearsOfExperience' : IDL.Nat,
    'userId' : UserId,
    'createdAt' : IDL.Int,
    'availableHours' : IDL.Text,
    'education' : IDL.Vec(IDL.Text),
    'languages' : IDL.Vec(IDL.Text),
    'isOnline' : IDL.Bool,
    'email' : IDL.Text,
    'specialty' : IDL.Vec(IDL.Text),
    'updatedAt' : IDL.Int,
    'acceptsInsurance' : IDL.Bool,
    'isVerified' : IDL.Bool,
    'profileDescription' : IDL.Text,
    'sessionTypes' : IDL.Vec(IDL.Text),
    'licenseNumber' : IDL.Text,
    'rating' : IDL.Float64,
    'insuranceProviders' : IDL.Vec(IDL.Text),
    'certifications' : IDL.Vec(IDL.Text),
    'totalAppointments' : IDL.Nat,
    'licenseExpiry' : IDL.Text,
    'consultationFee' : IDL.Nat,
    'lastName' : IDL.Text,
    'licenseState' : IDL.Text,
    'approachMethods' : IDL.Vec(IDL.Text),
    'firstName' : IDL.Text,
  });
  const Result_20 = IDL.Variant({ 'ok' : Therapist, 'err' : IDL.Text });
  const ConversationMetadata = IDL.Record({
    'title' : IDL.Opt(IDL.Text),
    'session_id' : IDL.Opt(IDL.Text),
    'encryption_key_id' : IDL.Text,
    'description' : IDL.Opt(IDL.Text),
  });
  const ConversationType = IDL.Variant({
    'SessionChat' : IDL.Null,
    'GroupChat' : IDL.Null,
    'DirectMessage' : IDL.Null,
  });
  const Conversation = IDL.Record({
    'id' : IDL.Text,
    'updated_at' : IDL.Nat64,
    'participants' : IDL.Vec(IDL.Principal),
    'metadata' : ConversationMetadata,
    'conversation_type' : ConversationType,
    'last_message_id' : IDL.Opt(IDL.Nat64),
    'created_at' : IDL.Nat64,
    'is_archived' : IDL.Bool,
  });
  const Result_32 = IDL.Variant({ 'ok' : Conversation, 'err' : IDL.Text });
  const TreatmentSummary = IDL.Record({
    'id' : IDL.Text,
    'patientId' : UserId,
    'recommendations' : IDL.Text,
    'createdAt' : IDL.Int,
    'progressNotes' : IDL.Text,
    'diagnosis' : IDL.Vec(IDL.Text),
    'outcomes' : IDL.Text,
    'therapistId' : IDL.Text,
    'updatedAt' : IDL.Int,
    'encryptionLevel' : EncryptionLevel,
    'riskAssessment' : IDL.Opt(IDL.Text),
    'accessPermissions' : IDL.Vec(IDL.Tuple(UserId, AccessLevel)),
    'attachments' : IDL.Vec(IDL.Text),
    'interventionsUsed' : IDL.Vec(IDL.Text),
    'treatmentGoals' : IDL.Vec(IDL.Text),
    'treatmentPeriod' : IDL.Record({
      'endDate' : IDL.Opt(IDL.Text),
      'startDate' : IDL.Text,
    }),
    'followUpPlan' : IDL.Opt(IDL.Text),
  });
  const Result_31 = IDL.Variant({ 'ok' : TreatmentSummary, 'err' : IDL.Text });
  const AuditLogAction = IDL.Variant({
    'read' : IDL.Null,
    'delete' : IDL.Null,
    'create' : IDL.Null,
    'share' : IDL.Null,
    'access_revoked' : IDL.Null,
    'update' : IDL.Null,
    'export' : IDL.Null,
    'access_granted' : IDL.Null,
  });
  const AuditLog = IDL.Record({
    'id' : IDL.Text,
    'action' : AuditLogAction,
    'resourceId' : IDL.Text,
    'userId' : UserId,
    'resourceType' : IDL.Text,
    'timestamp' : IDL.Int,
    'details' : IDL.Opt(IDL.Text),
    'userAgent' : IDL.Opt(IDL.Text),
    'ipAddress' : IDL.Opt(IDL.Text),
  });
  const Result_30 = IDL.Variant({ 'ok' : IDL.Vec(AuditLog), 'err' : IDL.Text });
  const Result_29 = IDL.Variant({
    'ok' : IDL.Record({
      'totalInteractions' : IDL.Nat,
      'uniqueUsers' : IDL.Nat,
    }),
    'err' : IDL.Text,
  });
  const Result_28 = IDL.Variant({
    'ok' : IDL.Record({ 'id' : UserId, 'role' : IDL.Text }),
    'err' : IDL.Text,
  });
  const FaucetClaim = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Text,
    'user_id' : IDL.Principal,
    'timestamp' : IDL.Int,
    'amount' : IDL.Nat,
  });
  const FaucetStats = IDL.Record({
    'totalClaimed' : IDL.Nat,
    'isEligible' : IDL.Bool,
    'dailyLimit' : IDL.Nat,
    'nextClaimTime' : IDL.Int,
    'claimedToday' : IDL.Nat,
  });
  const Message__1 = IDL.Record({
    'id' : IDL.Text,
    'content' : IDL.Text,
    'isEncrypted' : IDL.Bool,
    'isRead' : IDL.Bool,
    'messageType' : IDL.Text,
    'receiverId' : UserId,
    'timestamp' : IDL.Int,
    'attachments' : IDL.Vec(IDL.Text),
    'senderId' : UserId,
  });
  const Result_24 = IDL.Variant({
    'ok' : IDL.Record({
      'refundedTransactions' : IDL.Nat,
      'activePaymentPlans' : IDL.Nat,
      'totalPaymentVolume' : IDL.Nat,
      'completedTransactions' : IDL.Nat,
      'totalEscrowContracts' : IDL.Nat,
      'totalTransactions' : IDL.Nat,
    }),
    'err' : IDL.Text,
  });
  const Result_23 = IDL.Variant({
    'ok' : IDL.Vec(Prescription),
    'err' : IDL.Text,
  });
  const MessageType = IDL.Variant({
    'System' : IDL.Null,
    'File' : IDL.Null,
    'Text' : IDL.Null,
    'Image' : IDL.Null,
    'Audio' : IDL.Null,
    'Video' : IDL.Null,
  });
  const Attachment = IDL.Record({
    'id' : IDL.Text,
    'encrypted_data' : IDL.Text,
    'size' : IDL.Nat64,
    'content_type' : IDL.Text,
    'filename' : IDL.Text,
  });
  const Message = IDL.Record({
    'id' : IDL.Nat64,
    'is_read' : IDL.Bool,
    'content' : IDL.Text,
    'recipient_id' : IDL.Principal,
    'reply_to' : IDL.Opt(IDL.Nat64),
    'conversation_id' : IDL.Text,
    'sender_id' : IDL.Principal,
    'timestamp' : IDL.Nat64,
    'message_type' : MessageType,
    'attachments' : IDL.Vec(Attachment),
    'is_deleted' : IDL.Bool,
  });
  const Result_22 = IDL.Variant({ 'ok' : IDL.Vec(Message), 'err' : IDL.Text });
  const Result_21 = IDL.Variant({
    'ok' : IDL.Vec(SessionNote),
    'err' : IDL.Text,
  });
  const TherapistAvailability = IDL.Record({
    'startTime' : IDL.Text,
    'maxSessionsPerDay' : IDL.Nat,
    'endTime' : IDL.Text,
    'dayOfWeek' : IDL.Nat,
    'isAvailable' : IDL.Bool,
    'sessionDuration' : IDL.Nat,
    'therapistId' : IDL.Text,
    'updatedAt' : IDL.Int,
    'breakBetweenSessions' : IDL.Nat,
  });
  const SessionPricing = IDL.Record({
    'duration' : IDL.Nat,
    'sessionType' : IDL.Text,
    'createdAt' : IDL.Int,
    'packageDeals' : IDL.Opt(IDL.Text),
    'isActive' : IDL.Bool,
    'therapistId' : IDL.Text,
    'updatedAt' : IDL.Int,
    'currency' : IDL.Text,
    'price' : IDL.Nat,
    'discountPercentage' : IDL.Opt(IDL.Nat),
  });
  const Result_19 = IDL.Variant({
    'ok' : IDL.Record({
      'pending_feedback' : IDL.Vec(AppointmentId),
      'upcoming_appointments' : IDL.Vec(AppointmentId),
      'daily_platform_usage' : IDL.Bool,
    }),
    'err' : IDL.Text,
  });
  const Result_18 = IDL.Variant({
    'ok' : IDL.Record({
      'ai_insights_cost' : IDL.Nat,
      'premium_consultation_cost' : IDL.Nat,
      'priority_booking_cost' : IDL.Nat,
      'advanced_features_cost' : IDL.Nat,
    }),
    'err' : IDL.Text,
  });
  const Result_17 = IDL.Variant({
    'ok' : IDL.Vec(TreatmentSummary),
    'err' : IDL.Text,
  });
  const AccessControlRule = IDL.Record({
    'id' : IDL.Text,
    'accessLevel' : AccessLevel,
    'expiresAt' : IDL.Opt(IDL.Int),
    'grantedAt' : IDL.Int,
    'grantedBy' : UserId,
    'resourceId' : IDL.Text,
    'userId' : UserId,
    'isActive' : IDL.Bool,
    'resourceType' : IDL.Text,
    'conditions' : IDL.Opt(IDL.Text),
  });
  const Result_16 = IDL.Variant({
    'ok' : IDL.Vec(AccessControlRule),
    'err' : IDL.Text,
  });
  const ChatInteraction = IDL.Record({
    'id' : IDL.Text,
    'userId' : IDL.Principal,
    'message' : IDL.Text,
    'timestamp' : IDL.Int,
    'sessionId' : IDL.Text,
    'emotionalTone' : IDL.Opt(IDL.Text),
  });
  const Result_15 = IDL.Variant({
    'ok' : IDL.Vec(ChatInteraction),
    'err' : IDL.Text,
  });
  const PaymentStatus = IDL.Variant({
    'disputed' : IDL.Null,
    'pending' : IDL.Null,
    'completed' : IDL.Null,
    'refunded' : IDL.Null,
    'processing' : IDL.Null,
    'failed' : IDL.Null,
  });
  const EscrowContract = IDL.Record({
    'id' : IDL.Text,
    'releaseConditions' : IDL.Vec(IDL.Text),
    'status' : PaymentStatus,
    'createdAt' : IDL.Int,
    'autoReleaseTime' : IDL.Int,
    'conditions' : IDL.Text,
    'serviceId' : IDL.Text,
    'amount' : IDL.Nat,
    'disputeResolution' : IDL.Opt(IDL.Text),
    'payeeId' : IDL.Principal,
    'payerId' : IDL.Principal,
  });
  const Result_14 = IDL.Variant({
    'ok' : IDL.Vec(EscrowContract),
    'err' : IDL.Text,
  });
  const PaymentPlan = IDL.Record({
    'id' : IDL.Text,
    'status' : PaymentStatus,
    'userId' : IDL.Principal,
    'remainingInstallments' : IDL.Nat,
    'installmentAmount' : IDL.Nat,
    'totalAmount' : IDL.Nat,
    'autoPayEnabled' : IDL.Bool,
    'installments' : IDL.Nat,
    'frequency' : IDL.Text,
    'nextPaymentDate' : IDL.Int,
    'startDate' : IDL.Int,
  });
  const Result_13 = IDL.Variant({
    'ok' : IDL.Vec(PaymentPlan),
    'err' : IDL.Text,
  });
  const RefundReason = IDL.Variant({
    'appointment_cancelled' : IDL.Null,
    'service_not_provided' : IDL.Null,
    'technical_error' : IDL.Null,
    'dispute_resolved' : IDL.Null,
    'quality_issue' : IDL.Null,
  });
  const PaymentTransaction = IDL.Record({
    'id' : IDL.Text,
    'status' : PaymentStatus,
    'completedAt' : IDL.Opt(IDL.Int),
    'serviceType' : IDL.Text,
    'paymentMethod' : PaymentMethod,
    'refundReason' : IDL.Opt(RefundReason),
    'createdAt' : IDL.Int,
    'autoRefundEnabled' : IDL.Bool,
    'escrowReleaseConditions' : IDL.Opt(IDL.Text),
    'refundedAt' : IDL.Opt(IDL.Int),
    'refundDeadline' : IDL.Opt(IDL.Int),
    'serviceId' : IDL.Text,
    'amount' : IDL.Nat,
    'payeeId' : IDL.Principal,
    'payerId' : IDL.Principal,
  });
  const Result_12 = IDL.Variant({
    'ok' : IDL.Vec(PaymentTransaction),
    'err' : IDL.Text,
  });
  const Result_11 = IDL.Variant({
    'ok' : IDL.Vec(Conversation),
    'err' : IDL.Text,
  });
  const Result_10 = IDL.Variant({ 'ok' : AccessControlRule, 'err' : IDL.Text });
  const KeyType = IDL.Variant({
    'RSA2048' : IDL.Null,
    'Ed25519' : IDL.Null,
    'ECDSA' : IDL.Null,
  });
  const UserKey = IDL.Record({
    'public_key' : IDL.Text,
    'created_at' : IDL.Nat64,
    'user_id' : IDL.Principal,
    'key_type' : KeyType,
    'is_active' : IDL.Bool,
  });
  const Result_9 = IDL.Variant({ 'ok' : UserKey, 'err' : IDL.Text });
  const Result_8 = IDL.Variant({ 'ok' : Message__1, 'err' : IDL.Text });
  const Result_7 = IDL.Variant({ 'ok' : Message, 'err' : IDL.Text });
  const Result_6 = IDL.Variant({ 'ok' : SessionPricing, 'err' : IDL.Text });
  const Result_5 = IDL.Variant({
    'ok' : TherapistAvailability,
    'err' : IDL.Text,
  });
  return IDL.Service({
    'bookPremiumConsultation' : IDL.Func(
        [
          DoctorId,
          IDL.Record({
            'startTime' : IDL.Text,
            'endTime' : IDL.Text,
            'scheduledDate' : IDL.Text,
            'appointmentType' : AppointmentType,
            'notes' : IDL.Text,
          }),
        ],
        [Result_35],
        [],
      ),
    'bookPriorityAppointment' : IDL.Func(
        [
          DoctorId,
          IDL.Record({
            'startTime' : IDL.Text,
            'endTime' : IDL.Text,
            'scheduledDate' : IDL.Text,
            'appointmentType' : AppointmentType,
            'notes' : IDL.Text,
          }),
        ],
        [Result_35],
        [],
      ),
    'claimFaucetTokens' : IDL.Func([], [Result], []),
    'completeAppointmentWithTokens' : IDL.Func([AppointmentId], [Result], []),
    'completeDoctorConsultation' : IDL.Func(
        [AppointmentId, IDL.Text],
        [Result],
        [],
      ),
    'completeOnboarding' : IDL.Func(
        [
          UserType,
          IDL.Record({
            'bio' : IDL.Opt(IDL.Text),
            'profilePicture' : IDL.Opt(IDL.Text),
          }),
        ],
        [Result_1],
        [],
      ),
    'createAppointment' : IDL.Func(
        [
          IDL.Record({
            'startTime' : IDL.Text,
            'doctorId' : DoctorId,
            'endTime' : IDL.Text,
            'scheduledDate' : IDL.Text,
            'appointmentType' : AppointmentType,
            'notes' : IDL.Text,
            'symptoms' : IDL.Vec(IDL.Text),
          }),
        ],
        [Result_4],
        [],
      ),
    'createConsentRecord' : IDL.Func([ConsentType, IDL.Text], [Result_3], []),
    'createDoctorProfile' : IDL.Func(
        [
          IDL.Record({
            'yearsOfExperience' : IDL.Nat,
            'education' : IDL.Vec(IDL.Text),
            'email' : IDL.Text,
            'specialty' : IDL.Text,
            'licenseNumber' : IDL.Text,
            'certifications' : IDL.Vec(IDL.Text),
            'consultationFee' : IDL.Nat,
            'lastName' : IDL.Text,
            'firstName' : IDL.Text,
          }),
        ],
        [Result_27],
        [],
      ),
    'createEscrowContract' : IDL.Func(
        [
          IDL.Principal,
          IDL.Nat,
          IDL.Text,
          IDL.Text,
          IDL.Vec(IDL.Text),
          IDL.Nat,
        ],
        [Result],
        [],
      ),
    'createMedicalRecord' : IDL.Func(
        [
          IDL.Record({
            'title' : IDL.Text,
            'patientId' : UserId,
            'description' : IDL.Text,
            'recordType' : IDL.Text,
            'isConfidential' : IDL.Bool,
            'attachments' : IDL.Vec(IDL.Text),
            'appointmentId' : IDL.Opt(AppointmentId),
          }),
        ],
        [Result_26],
        [],
      ),
    'createPatientProfile' : IDL.Func(
        [
          IDL.Record({
            'timezone' : IDL.Opt(IDL.Text),
            'preferredLanguage' : IDL.Opt(IDL.Text),
            'insuranceProvider' : IDL.Opt(IDL.Text),
            'dateOfBirth' : IDL.Text,
            'emergencyContact' : IDL.Text,
            'emergencyContactRelation' : IDL.Opt(IDL.Text),
            'gender' : IDL.Text,
          }),
        ],
        [Result_25],
        [],
      ),
    'createPaymentPlan' : IDL.Func(
        [IDL.Nat, IDL.Nat, IDL.Text, IDL.Bool],
        [Result],
        [],
      ),
    'createPaymentTransaction' : IDL.Func(
        [
          IDL.Principal,
          IDL.Nat,
          PaymentMethod,
          IDL.Text,
          IDL.Text,
          IDL.Bool,
          IDL.Opt(IDL.Nat),
        ],
        [Result],
        [],
      ),
    'createPrescription' : IDL.Func(
        [
          UserId,
          IDL.Opt(IDL.Text),
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Vec(IDL.Text),
          IDL.Vec(IDL.Text),
        ],
        [Result_34],
        [],
      ),
    'createSession' : IDL.Func(
        [
          IDL.Record({
            'startTime' : IDL.Text,
            'endTime' : IDL.Text,
            'scheduledDate' : IDL.Text,
            'appointmentType' : AppointmentType,
            'therapistId' : IDL.Text,
            'notes' : IDL.Text,
            'symptoms' : IDL.Vec(IDL.Text),
          }),
        ],
        [Result_4],
        [],
      ),
    'createSessionNote' : IDL.Func(
        [
          IDL.Text,
          UserId,
          IDL.Text,
          EncryptionLevel,
          IDL.Vec(IDL.Text),
          IDL.Bool,
        ],
        [Result_33],
        [],
      ),
    'createSessionRequest' : IDL.Func(
        [UserId, IDL.Text, IDL.Text, IDL.Text, IDL.Opt(IDL.Text)],
        [Result_2],
        [],
      ),
    'createTherapistProfile' : IDL.Func(
        [
          IDL.Record({
            'bio' : IDL.Opt(IDL.Text),
            'yearsOfExperience' : IDL.Nat,
            'availableHours' : IDL.Opt(IDL.Text),
            'education' : IDL.Vec(IDL.Text),
            'languages' : IDL.Vec(IDL.Text),
            'specialty' : IDL.Text,
            'sessionTypes' : IDL.Vec(IDL.Text),
            'licenseNumber' : IDL.Text,
            'certifications' : IDL.Vec(IDL.Text),
            'consultationFee' : IDL.Nat,
          }),
        ],
        [Result_20],
        [],
      ),
    'createTherapyConversation' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [Result_32],
        [],
      ),
    'createTreatmentSummary' : IDL.Func(
        [
          UserId,
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Vec(IDL.Text),
          IDL.Vec(IDL.Text),
          IDL.Vec(IDL.Text),
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
        ],
        [Result_31],
        [],
      ),
    'getAllDoctors' : IDL.Func([], [IDL.Vec(Doctor)], ['query']),
    'getAllTherapists' : IDL.Func([], [IDL.Vec(Therapist)], ['query']),
    'getAuditLogs' : IDL.Func(
        [
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Opt(UserId),
          IDL.Opt(IDL.Nat),
        ],
        [Result_30],
        ['query'],
      ),
    'getChatAnalytics' : IDL.Func([], [Result_29], []),
    'getChatEndpoint' : IDL.Func([], [IDL.Text], []),
    'getCurrentUser' : IDL.Func([], [Result_28], ['query']),
    'getCurrentUserProfile' : IDL.Func([], [Result_1], ['query']),
    'getDoctorAppointments' : IDL.Func([], [IDL.Vec(Appointment)], ['query']),
    'getDoctorById' : IDL.Func([DoctorId], [Result_27], ['query']),
    'getFaucetClaimHistory' : IDL.Func([], [IDL.Vec(FaucetClaim)], ['query']),
    'getFaucetStats' : IDL.Func([], [FaucetStats], ['query']),
    'getMedicalRecordById' : IDL.Func([RecordId], [Result_26], ['query']),
    'getMessages' : IDL.Func([UserId], [IDL.Vec(Message__1)], ['query']),
    'getPatientAppointments' : IDL.Func([], [IDL.Vec(Appointment)], ['query']),
    'getPatientMedicalRecords' : IDL.Func(
        [],
        [IDL.Vec(MedicalRecord)],
        ['query'],
      ),
    'getPatientProfile' : IDL.Func([], [Result_25], ['query']),
    'getPaymentStatistics' : IDL.Func([], [Result_24], ['query']),
    'getPrescriptions' : IDL.Func([UserId], [Result_23], ['query']),
    'getSecureConversationMessages' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Nat64), IDL.Opt(IDL.Nat64)],
        [Result_22],
        [],
      ),
    'getSecureMessagingHealth' : IDL.Func([], [Result], []),
    'getSessionNotes' : IDL.Func([UserId], [Result_21], ['query']),
    'getSystemStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'totalPatients' : IDL.Nat,
            'totalMessages' : IDL.Nat,
            'totalDoctors' : IDL.Nat,
            'totalChatInteractions' : IDL.Nat,
            'totalAppointments' : IDL.Nat,
            'totalMedicalRecords' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getTherapistAvailability' : IDL.Func(
        [IDL.Opt(UserId)],
        [IDL.Vec(TherapistAvailability)],
        ['query'],
      ),
    'getTherapistById' : IDL.Func([IDL.Text], [Result_20], ['query']),
    'getTherapistPricing' : IDL.Func(
        [IDL.Opt(UserId)],
        [IDL.Vec(SessionPricing)],
        ['query'],
      ),
    'getTherapistProfile' : IDL.Func([], [Result_20], ['query']),
    'getTokenEarningOpportunities' : IDL.Func([], [Result_19], ['query']),
    'getTokenSpendingOptions' : IDL.Func([], [Result_18], ['query']),
    'getTreatmentSummaries' : IDL.Func([UserId], [Result_17], ['query']),
    'getUserAccessPermissions' : IDL.Func([], [Result_16], ['query']),
    'getUserChatHistory' : IDL.Func([IDL.Opt(IDL.Text)], [Result_15], []),
    'getUserConsentRecords' : IDL.Func([], [IDL.Vec(ConsentRecord)], ['query']),
    'getUserEscrowContracts' : IDL.Func([], [Result_14], ['query']),
    'getUserPaymentPlans' : IDL.Func([], [Result_13], ['query']),
    'getUserPaymentTransactions' : IDL.Func([], [Result_12], ['query']),
    'getUserSecureConversations' : IDL.Func([], [Result_11], []),
    'getUserSessionRequests' : IDL.Func(
        [],
        [IDL.Vec(SessionRequest)],
        ['query'],
      ),
    'grantAccess' : IDL.Func(
        [IDL.Text, IDL.Text, UserId, AccessLevel, IDL.Opt(IDL.Int)],
        [Result_10],
        [],
      ),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'healthCheck' : IDL.Func(
        [],
        [
          IDL.Record({
            'status' : IDL.Text,
            'version' : IDL.Text,
            'timestamp' : IDL.Int,
          }),
        ],
        ['query'],
      ),
    'initializeUser' : IDL.Func(
        [
          IDL.Record({
            'userType' : UserType,
            'email' : IDL.Text,
            'phoneNumber' : IDL.Opt(IDL.Text),
            'lastName' : IDL.Text,
            'firstName' : IDL.Text,
          }),
        ],
        [Result_1],
        [],
      ),
    'logChatInteraction' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
    'markMessageAsRead' : IDL.Func([IDL.Text], [Result], []),
    'processAutomaticRefund' : IDL.Func([IDL.Text, RefundReason], [Result], []),
    'processPayment' : IDL.Func([IDL.Text], [Result], []),
    'processPaymentPlanInstallment' : IDL.Func([IDL.Text], [Result], []),
    'recordDailyPlatformUsage' : IDL.Func([], [Result], []),
    'registerUserEncryptionKey' : IDL.Func([IDL.Text, KeyType], [Result_9], []),
    'releaseEscrowFunds' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'revokeAccess' : IDL.Func([IDL.Text, IDL.Text, UserId], [Result], []),
    'sendMessage' : IDL.Func([UserId, IDL.Text, IDL.Text], [Result_8], []),
    'sendSecureMessage' : IDL.Func(
        [IDL.Text, IDL.Principal, IDL.Text, MessageType],
        [Result_7],
        [],
      ),
    'setSessionPricing' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Text, IDL.Opt(IDL.Text)],
        [Result_6],
        [],
      ),
    'setTherapistAvailability' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, IDL.Bool],
        [Result_5],
        [],
      ),
    'submitFeedbackWithTokens' : IDL.Func(
        [AppointmentId, IDL.Nat, IDL.Text],
        [Result],
        [],
      ),
    'updateAppointmentStatus' : IDL.Func(
        [AppointmentId, AppointmentStatus],
        [Result_4],
        [],
      ),
    'updateConsentStatus' : IDL.Func([IDL.Text, ConsentStatus], [Result_3], []),
    'updateSessionRequestStatus' : IDL.Func(
        [IDL.Text, SessionRequestStatus],
        [Result_2],
        [],
      ),
    'updateUserProfile' : IDL.Func(
        [
          IDL.Record({
            'bio' : IDL.Opt(IDL.Text),
            'email' : IDL.Opt(IDL.Text),
            'phoneNumber' : IDL.Opt(IDL.Text),
            'profilePicture' : IDL.Opt(IDL.Text),
            'lastName' : IDL.Opt(IDL.Text),
            'firstName' : IDL.Opt(IDL.Text),
          }),
        ],
        [Result_1],
        [],
      ),
    'updateUserStats' : IDL.Func(
        [
          IDL.Record({
            'chatInteractions' : IDL.Nat,
            'lastActivity' : IDL.Text,
          }),
        ],
        [IDL.Text],
        [],
      ),
    'verifyDoctor' : IDL.Func([DoctorId], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
