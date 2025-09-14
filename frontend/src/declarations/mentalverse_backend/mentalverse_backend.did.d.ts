import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AccessControlRule {
  'id' : string,
  'accessLevel' : AccessLevel,
  'expiresAt' : [] | [bigint],
  'grantedAt' : bigint,
  'grantedBy' : UserId,
  'resourceId' : string,
  'userId' : UserId,
  'isActive' : boolean,
  'resourceType' : string,
  'conditions' : [] | [string],
}
export type AccessLevel = { 'admin' : null } |
  { 'owner' : null } |
  { 'read' : null } |
  { 'write' : null };
export interface Appointment {
  'id' : AppointmentId,
  'startTime' : string,
  'status' : AppointmentStatus,
  'doctorId' : DoctorId,
  'prescription' : string,
  'endTime' : string,
  'scheduledDate' : string,
  'patientId' : UserId,
  'createdAt' : bigint,
  'diagnosis' : string,
  'appointmentType' : AppointmentType,
  'updatedAt' : bigint,
  'followUpRequired' : boolean,
  'notes' : string,
  'symptoms' : Array<string>,
  'followUpDate' : [] | [string],
}
export type AppointmentId = string;
export type AppointmentStatus = { 'scheduled' : null } |
  { 'cancelled' : null } |
  { 'rescheduled' : null } |
  { 'completed' : null } |
  { 'confirmed' : null } |
  { 'inProgress' : null };
export type AppointmentType = { 'emergency' : null } |
  { 'examination' : null } |
  { 'followUp' : null } |
  { 'routine' : null } |
  { 'therapy' : null } |
  { 'consultation' : null };
export interface Attachment {
  'id' : string,
  'encrypted_data' : string,
  'size' : bigint,
  'content_type' : string,
  'filename' : string,
}
export interface AuditLog {
  'id' : string,
  'action' : AuditLogAction,
  'resourceId' : string,
  'userId' : UserId,
  'resourceType' : string,
  'timestamp' : bigint,
  'details' : [] | [string],
  'userAgent' : [] | [string],
  'ipAddress' : [] | [string],
}
export type AuditLogAction = { 'read' : null } |
  { 'delete' : null } |
  { 'create' : null } |
  { 'share' : null } |
  { 'access_revoked' : null } |
  { 'update' : null } |
  { 'export' : null } |
  { 'access_granted' : null };
export interface ChatInteraction {
  'id' : string,
  'userId' : Principal,
  'message' : string,
  'timestamp' : bigint,
  'sessionId' : string,
  'emotionalTone' : [] | [string],
}
export interface ConsentRecord {
  'id' : string,
  'status' : ConsentStatus,
  'expiresAt' : [] | [bigint],
  'grantedAt' : [] | [bigint],
  'patientId' : UserId,
  'createdAt' : bigint,
  'therapistId' : string,
  'updatedAt' : bigint,
  'purpose' : string,
  'revokedAt' : [] | [bigint],
  'consentType' : ConsentType,
}
export type ConsentStatus = { 'revoked' : null } |
  { 'expired' : null } |
  { 'pending' : null } |
  { 'granted' : null };
export type ConsentType = { 'sessionNotes' : null } |
  { 'medicalRecords' : null } |
  { 'diagnostics' : null } |
  { 'fullAccess' : null } |
  { 'prescriptions' : null };
export interface Conversation {
  'id' : string,
  'updated_at' : bigint,
  'participants' : Array<Principal>,
  'metadata' : ConversationMetadata,
  'conversation_type' : ConversationType,
  'last_message_id' : [] | [bigint],
  'created_at' : bigint,
  'is_archived' : boolean,
}
export interface ConversationMetadata {
  'title' : [] | [string],
  'session_id' : [] | [string],
  'encryption_key_id' : string,
  'description' : [] | [string],
}
export type ConversationType = { 'SessionChat' : null } |
  { 'GroupChat' : null } |
  { 'DirectMessage' : null };
export interface Doctor {
  'id' : DoctorId,
  'yearsOfExperience' : bigint,
  'userId' : UserId,
  'createdAt' : bigint,
  'availableHours' : string,
  'education' : Array<string>,
  'languages' : Array<string>,
  'isOnline' : boolean,
  'email' : string,
  'specialty' : Array<string>,
  'updatedAt' : bigint,
  'acceptsInsurance' : boolean,
  'isVerified' : boolean,
  'profileDescription' : string,
  'sessionTypes' : Array<string>,
  'licenseNumber' : string,
  'rating' : number,
  'insuranceProviders' : Array<string>,
  'certifications' : Array<string>,
  'totalAppointments' : bigint,
  'licenseExpiry' : string,
  'consultationFee' : bigint,
  'lastName' : string,
  'licenseState' : string,
  'approachMethods' : Array<string>,
  'firstName' : string,
}
export type DoctorId = string;
export type EncryptionLevel = { 'high' : null } |
  { 'none' : null } |
  { 'maximum' : null } |
  { 'standard' : null };
export interface EscrowContract {
  'id' : string,
  'releaseConditions' : Array<string>,
  'status' : PaymentStatus,
  'createdAt' : bigint,
  'autoReleaseTime' : bigint,
  'conditions' : string,
  'serviceId' : string,
  'amount' : bigint,
  'disputeResolution' : [] | [string],
  'payeeId' : Principal,
  'payerId' : Principal,
}
export interface FaucetClaim {
  'id' : string,
  'status' : string,
  'user_id' : Principal,
  'timestamp' : bigint,
  'amount' : bigint,
}
export interface FaucetStats {
  'totalClaimed' : bigint,
  'isEligible' : boolean,
  'dailyLimit' : bigint,
  'nextClaimTime' : bigint,
  'claimedToday' : bigint,
}
export type KeyType = { 'RSA2048' : null } |
  { 'Ed25519' : null } |
  { 'ECDSA' : null };
export interface MedicalRecord {
  'id' : RecordId,
  'doctorId' : DoctorId,
  'title' : string,
  'patientId' : UserId,
  'createdAt' : bigint,
  'description' : string,
  'recordType' : string,
  'updatedAt' : bigint,
  'isConfidential' : boolean,
  'accessPermissions' : Array<UserId>,
  'attachments' : Array<string>,
  'appointmentId' : [] | [AppointmentId],
}
export interface Message {
  'id' : bigint,
  'is_read' : boolean,
  'content' : string,
  'recipient_id' : Principal,
  'reply_to' : [] | [bigint],
  'conversation_id' : string,
  'sender_id' : Principal,
  'timestamp' : bigint,
  'message_type' : MessageType,
  'attachments' : Array<Attachment>,
  'is_deleted' : boolean,
}
export type MessageType = { 'System' : null } |
  { 'File' : null } |
  { 'Text' : null } |
  { 'Image' : null } |
  { 'Audio' : null } |
  { 'Video' : null };
export interface Message__1 {
  'id' : string,
  'content' : string,
  'isEncrypted' : boolean,
  'isRead' : boolean,
  'messageType' : string,
  'receiverId' : UserId,
  'timestamp' : bigint,
  'attachments' : Array<string>,
  'senderId' : UserId,
}
export interface Patient {
  'id' : UserId,
  'timezone' : [] | [string],
  'preferredLanguage' : [] | [string],
  'insuranceProvider' : [] | [string],
  'dateOfBirth' : string,
  'createdAt' : bigint,
  'emergencyContact' : string,
  'email' : string,
  'emergencyContactRelation' : [] | [string],
  'updatedAt' : bigint,
  'medicalHistory' : Array<string>,
  'gender' : string,
  'phoneNumber' : string,
  'lastName' : string,
  'allergies' : Array<string>,
  'currentMedications' : Array<string>,
  'firstName' : string,
}
export type PaymentMethod = { 'mvt_tokens' : null } |
  { 'cycles' : null } |
  { 'escrow' : null };
export interface PaymentPlan {
  'id' : string,
  'status' : PaymentStatus,
  'userId' : Principal,
  'remainingInstallments' : bigint,
  'installmentAmount' : bigint,
  'totalAmount' : bigint,
  'autoPayEnabled' : boolean,
  'installments' : bigint,
  'frequency' : string,
  'nextPaymentDate' : bigint,
  'startDate' : bigint,
}
export type PaymentStatus = { 'disputed' : null } |
  { 'pending' : null } |
  { 'completed' : null } |
  { 'refunded' : null } |
  { 'processing' : null } |
  { 'failed' : null };
export interface PaymentTransaction {
  'id' : string,
  'status' : PaymentStatus,
  'completedAt' : [] | [bigint],
  'serviceType' : string,
  'paymentMethod' : PaymentMethod,
  'refundReason' : [] | [RefundReason],
  'createdAt' : bigint,
  'autoRefundEnabled' : boolean,
  'escrowReleaseConditions' : [] | [string],
  'refundedAt' : [] | [bigint],
  'refundDeadline' : [] | [bigint],
  'serviceId' : string,
  'amount' : bigint,
  'payeeId' : Principal,
  'payerId' : Principal,
}
export interface Prescription {
  'id' : string,
  'duration' : string,
  'medicationName' : string,
  'endDate' : [] | [string],
  'dosage' : string,
  'patientId' : UserId,
  'createdAt' : bigint,
  'instructions' : string,
  'isActive' : boolean,
  'contraindications' : Array<string>,
  'therapistId' : string,
  'refillsRemaining' : bigint,
  'updatedAt' : bigint,
  'sideEffects' : Array<string>,
  'sessionId' : [] | [string],
  'frequency' : string,
  'encryptionLevel' : EncryptionLevel,
  'pharmacyNotes' : [] | [string],
  'accessPermissions' : Array<[UserId, AccessLevel]>,
  'startDate' : string,
}
export type RecordId = string;
export type RefundReason = { 'appointment_cancelled' : null } |
  { 'service_not_provided' : null } |
  { 'technical_error' : null } |
  { 'dispute_resolved' : null } |
  { 'quality_issue' : null };
export type Result = { 'ok' : string } |
  { 'err' : string };
export type Result_1 = { 'ok' : UserProfile } |
  { 'err' : string };
export type Result_10 = { 'ok' : AccessControlRule } |
  { 'err' : string };
export type Result_11 = { 'ok' : Array<Conversation> } |
  { 'err' : string };
export type Result_12 = { 'ok' : Array<PaymentTransaction> } |
  { 'err' : string };
export type Result_13 = { 'ok' : Array<PaymentPlan> } |
  { 'err' : string };
export type Result_14 = { 'ok' : Array<EscrowContract> } |
  { 'err' : string };
export type Result_15 = { 'ok' : Array<ChatInteraction> } |
  { 'err' : string };
export type Result_16 = { 'ok' : Array<AccessControlRule> } |
  { 'err' : string };
export type Result_17 = { 'ok' : Array<TreatmentSummary> } |
  { 'err' : string };
export type Result_18 = {
    'ok' : {
      'ai_insights_cost' : bigint,
      'premium_consultation_cost' : bigint,
      'priority_booking_cost' : bigint,
      'advanced_features_cost' : bigint,
    }
  } |
  { 'err' : string };
export type Result_19 = {
    'ok' : {
      'pending_feedback' : Array<AppointmentId>,
      'upcoming_appointments' : Array<AppointmentId>,
      'daily_platform_usage' : boolean,
    }
  } |
  { 'err' : string };
export type Result_2 = { 'ok' : SessionRequest } |
  { 'err' : string };
export type Result_20 = { 'ok' : Therapist } |
  { 'err' : string };
export type Result_21 = { 'ok' : Array<SessionNote> } |
  { 'err' : string };
export type Result_22 = { 'ok' : Array<Message> } |
  { 'err' : string };
export type Result_23 = { 'ok' : Array<Prescription> } |
  { 'err' : string };
export type Result_24 = {
    'ok' : {
      'refundedTransactions' : bigint,
      'activePaymentPlans' : bigint,
      'totalPaymentVolume' : bigint,
      'completedTransactions' : bigint,
      'totalEscrowContracts' : bigint,
      'totalTransactions' : bigint,
    }
  } |
  { 'err' : string };
export type Result_25 = { 'ok' : Patient } |
  { 'err' : string };
export type Result_26 = { 'ok' : MedicalRecord } |
  { 'err' : string };
export type Result_27 = { 'ok' : Doctor } |
  { 'err' : string };
export type Result_28 = { 'ok' : { 'id' : UserId, 'role' : string } } |
  { 'err' : string };
export type Result_29 = {
    'ok' : { 'totalInteractions' : bigint, 'uniqueUsers' : bigint }
  } |
  { 'err' : string };
export type Result_3 = { 'ok' : ConsentRecord } |
  { 'err' : string };
export type Result_30 = { 'ok' : Array<AuditLog> } |
  { 'err' : string };
export type Result_31 = { 'ok' : TreatmentSummary } |
  { 'err' : string };
export type Result_32 = { 'ok' : Conversation } |
  { 'err' : string };
export type Result_33 = { 'ok' : SessionNote } |
  { 'err' : string };
export type Result_34 = { 'ok' : Prescription } |
  { 'err' : string };
export type Result_35 = { 'ok' : AppointmentId } |
  { 'err' : string };
export type Result_4 = { 'ok' : Appointment } |
  { 'err' : string };
export type Result_5 = { 'ok' : TherapistAvailability } |
  { 'err' : string };
export type Result_6 = { 'ok' : SessionPricing } |
  { 'err' : string };
export type Result_7 = { 'ok' : Message } |
  { 'err' : string };
export type Result_8 = { 'ok' : Message__1 } |
  { 'err' : string };
export type Result_9 = { 'ok' : UserKey } |
  { 'err' : string };
export interface SessionNote {
  'id' : string,
  'content' : string,
  'patientId' : UserId,
  'createdAt' : bigint,
  'tags' : Array<string>,
  'therapistId' : string,
  'updatedAt' : bigint,
  'isConfidential' : boolean,
  'sessionId' : string,
  'encryptionLevel' : EncryptionLevel,
  'lastAccessedAt' : [] | [bigint],
  'lastAccessedBy' : [] | [UserId],
  'accessPermissions' : Array<[UserId, AccessLevel]>,
}
export interface SessionPricing {
  'duration' : bigint,
  'sessionType' : string,
  'createdAt' : bigint,
  'packageDeals' : [] | [string],
  'isActive' : boolean,
  'therapistId' : string,
  'updatedAt' : bigint,
  'currency' : string,
  'price' : bigint,
  'discountPercentage' : [] | [bigint],
}
export interface SessionRequest {
  'id' : string,
  'status' : SessionRequestStatus,
  'duration' : bigint,
  'urgencyLevel' : string,
  'sessionType' : string,
  'patientId' : UserId,
  'createdAt' : bigint,
  'therapistId' : string,
  'updatedAt' : bigint,
  'notes' : string,
  'requestedDate' : string,
  'requestedTime' : string,
}
export type SessionRequestStatus = { 'cancelled' : null } |
  { 'pending' : null } |
  { 'rescheduled' : null } |
  { 'accepted' : null } |
  { 'declined' : null };
export interface Therapist {
  'id' : DoctorId,
  'yearsOfExperience' : bigint,
  'userId' : UserId,
  'createdAt' : bigint,
  'availableHours' : string,
  'education' : Array<string>,
  'languages' : Array<string>,
  'isOnline' : boolean,
  'email' : string,
  'specialty' : Array<string>,
  'updatedAt' : bigint,
  'acceptsInsurance' : boolean,
  'isVerified' : boolean,
  'profileDescription' : string,
  'sessionTypes' : Array<string>,
  'licenseNumber' : string,
  'rating' : number,
  'insuranceProviders' : Array<string>,
  'certifications' : Array<string>,
  'totalAppointments' : bigint,
  'licenseExpiry' : string,
  'consultationFee' : bigint,
  'lastName' : string,
  'licenseState' : string,
  'approachMethods' : Array<string>,
  'firstName' : string,
}
export interface TherapistAvailability {
  'startTime' : string,
  'maxSessionsPerDay' : bigint,
  'endTime' : string,
  'dayOfWeek' : bigint,
  'isAvailable' : boolean,
  'sessionDuration' : bigint,
  'therapistId' : string,
  'updatedAt' : bigint,
  'breakBetweenSessions' : bigint,
}
export interface TreatmentSummary {
  'id' : string,
  'patientId' : UserId,
  'recommendations' : string,
  'createdAt' : bigint,
  'progressNotes' : string,
  'diagnosis' : Array<string>,
  'outcomes' : string,
  'therapistId' : string,
  'updatedAt' : bigint,
  'encryptionLevel' : EncryptionLevel,
  'riskAssessment' : [] | [string],
  'accessPermissions' : Array<[UserId, AccessLevel]>,
  'attachments' : Array<string>,
  'interventionsUsed' : Array<string>,
  'treatmentGoals' : Array<string>,
  'treatmentPeriod' : { 'endDate' : [] | [string], 'startDate' : string },
  'followUpPlan' : [] | [string],
}
export type UserId = Principal;
export interface UserKey {
  'public_key' : string,
  'created_at' : bigint,
  'user_id' : Principal,
  'key_type' : KeyType,
  'is_active' : boolean,
}
export interface UserProfile {
  'id' : UserId,
  'bio' : [] | [string],
  'userType' : UserType,
  'createdAt' : bigint,
  'email' : string,
  'updatedAt' : bigint,
  'onboardingCompleted' : boolean,
  'phoneNumber' : [] | [string],
  'profilePicture' : [] | [string],
  'lastName' : string,
  'verificationStatus' : VerificationStatus,
  'firstName' : string,
}
export type UserType = { 'patient' : null } |
  { 'admin' : null } |
  { 'therapist' : null };
export type VerificationStatus = { 'verified' : null } |
  { 'pending' : null } |
  { 'rejected' : null } |
  { 'suspended' : null };
export interface _SERVICE {
  'bookPremiumConsultation' : ActorMethod<
    [
      DoctorId,
      {
        'startTime' : string,
        'endTime' : string,
        'scheduledDate' : string,
        'appointmentType' : AppointmentType,
        'notes' : string,
      },
    ],
    Result_35
  >,
  'bookPriorityAppointment' : ActorMethod<
    [
      DoctorId,
      {
        'startTime' : string,
        'endTime' : string,
        'scheduledDate' : string,
        'appointmentType' : AppointmentType,
        'notes' : string,
      },
    ],
    Result_35
  >,
  'claimFaucetTokens' : ActorMethod<[], Result>,
  'completeAppointmentWithTokens' : ActorMethod<[AppointmentId], Result>,
  'completeDoctorConsultation' : ActorMethod<[AppointmentId, string], Result>,
  'completeOnboarding' : ActorMethod<
    [UserType, { 'bio' : [] | [string], 'profilePicture' : [] | [string] }],
    Result_1
  >,
  'createAppointment' : ActorMethod<
    [
      {
        'startTime' : string,
        'doctorId' : DoctorId,
        'endTime' : string,
        'scheduledDate' : string,
        'appointmentType' : AppointmentType,
        'notes' : string,
        'symptoms' : Array<string>,
      },
    ],
    Result_4
  >,
  'createConsentRecord' : ActorMethod<[ConsentType, string], Result_3>,
  'createDoctorProfile' : ActorMethod<
    [
      {
        'yearsOfExperience' : bigint,
        'education' : Array<string>,
        'email' : string,
        'specialty' : string,
        'licenseNumber' : string,
        'certifications' : Array<string>,
        'consultationFee' : bigint,
        'lastName' : string,
        'firstName' : string,
      },
    ],
    Result_27
  >,
  'createEscrowContract' : ActorMethod<
    [Principal, bigint, string, string, Array<string>, bigint],
    Result
  >,
  'createMedicalRecord' : ActorMethod<
    [
      {
        'title' : string,
        'patientId' : UserId,
        'description' : string,
        'recordType' : string,
        'isConfidential' : boolean,
        'attachments' : Array<string>,
        'appointmentId' : [] | [AppointmentId],
      },
    ],
    Result_26
  >,
  'createPatientProfile' : ActorMethod<
    [
      {
        'timezone' : [] | [string],
        'preferredLanguage' : [] | [string],
        'insuranceProvider' : [] | [string],
        'dateOfBirth' : string,
        'emergencyContact' : string,
        'emergencyContactRelation' : [] | [string],
        'gender' : string,
      },
    ],
    Result_25
  >,
  'createPaymentPlan' : ActorMethod<[bigint, bigint, string, boolean], Result>,
  'createPaymentTransaction' : ActorMethod<
    [Principal, bigint, PaymentMethod, string, string, boolean, [] | [bigint]],
    Result
  >,
  'createPrescription' : ActorMethod<
    [
      UserId,
      [] | [string],
      string,
      string,
      string,
      string,
      string,
      Array<string>,
      Array<string>,
    ],
    Result_34
  >,
  'createSession' : ActorMethod<
    [
      {
        'startTime' : string,
        'endTime' : string,
        'scheduledDate' : string,
        'appointmentType' : AppointmentType,
        'therapistId' : string,
        'notes' : string,
        'symptoms' : Array<string>,
      },
    ],
    Result_4
  >,
  'createSessionNote' : ActorMethod<
    [string, UserId, string, EncryptionLevel, Array<string>, boolean],
    Result_33
  >,
  'createSessionRequest' : ActorMethod<
    [UserId, string, string, string, [] | [string]],
    Result_2
  >,
  'createTherapistProfile' : ActorMethod<
    [
      {
        'bio' : [] | [string],
        'yearsOfExperience' : bigint,
        'availableHours' : [] | [string],
        'education' : Array<string>,
        'languages' : Array<string>,
        'specialty' : string,
        'sessionTypes' : Array<string>,
        'licenseNumber' : string,
        'certifications' : Array<string>,
        'consultationFee' : bigint,
      },
    ],
    Result_20
  >,
  'createTherapyConversation' : ActorMethod<[Principal, string], Result_32>,
  'createTreatmentSummary' : ActorMethod<
    [
      UserId,
      string,
      [] | [string],
      Array<string>,
      Array<string>,
      Array<string>,
      string,
      string,
      string,
      [] | [string],
      [] | [string],
    ],
    Result_31
  >,
  'getAllDoctors' : ActorMethod<[], Array<Doctor>>,
  'getAllTherapists' : ActorMethod<[], Array<Therapist>>,
  'getAuditLogs' : ActorMethod<
    [[] | [string], [] | [string], [] | [UserId], [] | [bigint]],
    Result_30
  >,
  'getChatAnalytics' : ActorMethod<[], Result_29>,
  'getChatEndpoint' : ActorMethod<[], string>,
  'getCurrentUser' : ActorMethod<[], Result_28>,
  'getCurrentUserProfile' : ActorMethod<[], Result_1>,
  'getDoctorAppointments' : ActorMethod<[], Array<Appointment>>,
  'getDoctorById' : ActorMethod<[DoctorId], Result_27>,
  'getFaucetClaimHistory' : ActorMethod<[], Array<FaucetClaim>>,
  'getFaucetStats' : ActorMethod<[], FaucetStats>,
  'getMedicalRecordById' : ActorMethod<[RecordId], Result_26>,
  'getMessages' : ActorMethod<[UserId], Array<Message__1>>,
  'getPatientAppointments' : ActorMethod<[], Array<Appointment>>,
  'getPatientMedicalRecords' : ActorMethod<[], Array<MedicalRecord>>,
  'getPatientProfile' : ActorMethod<[], Result_25>,
  'getPaymentStatistics' : ActorMethod<[], Result_24>,
  'getPrescriptions' : ActorMethod<[UserId], Result_23>,
  'getSecureConversationMessages' : ActorMethod<
    [string, [] | [bigint], [] | [bigint]],
    Result_22
  >,
  'getSecureMessagingHealth' : ActorMethod<[], Result>,
  'getSessionNotes' : ActorMethod<[UserId], Result_21>,
  'getSystemStats' : ActorMethod<
    [],
    {
      'totalPatients' : bigint,
      'totalMessages' : bigint,
      'totalDoctors' : bigint,
      'totalChatInteractions' : bigint,
      'totalAppointments' : bigint,
      'totalMedicalRecords' : bigint,
    }
  >,
  'getTherapistAvailability' : ActorMethod<
    [[] | [UserId]],
    Array<TherapistAvailability>
  >,
  'getTherapistById' : ActorMethod<[string], Result_20>,
  'getTherapistPricing' : ActorMethod<[[] | [UserId]], Array<SessionPricing>>,
  'getTherapistProfile' : ActorMethod<[], Result_20>,
  'getTokenEarningOpportunities' : ActorMethod<[], Result_19>,
  'getTokenSpendingOptions' : ActorMethod<[], Result_18>,
  'getTreatmentSummaries' : ActorMethod<[UserId], Result_17>,
  'getUserAccessPermissions' : ActorMethod<[], Result_16>,
  'getUserChatHistory' : ActorMethod<[[] | [string]], Result_15>,
  'getUserConsentRecords' : ActorMethod<[], Array<ConsentRecord>>,
  'getUserEscrowContracts' : ActorMethod<[], Result_14>,
  'getUserPaymentPlans' : ActorMethod<[], Result_13>,
  'getUserPaymentTransactions' : ActorMethod<[], Result_12>,
  'getUserSecureConversations' : ActorMethod<[], Result_11>,
  'getUserSessionRequests' : ActorMethod<[], Array<SessionRequest>>,
  'grantAccess' : ActorMethod<
    [string, string, UserId, AccessLevel, [] | [bigint]],
    Result_10
  >,
  'greet' : ActorMethod<[string], string>,
  'healthCheck' : ActorMethod<
    [],
    { 'status' : string, 'version' : string, 'timestamp' : bigint }
  >,
  'initializeUser' : ActorMethod<
    [
      {
        'email' : string,
        'phoneNumber' : [] | [string],
        'lastName' : string,
        'firstName' : string,
      },
    ],
    Result_1
  >,
  'logChatInteraction' : ActorMethod<[string, string, string], Result>,
  'markMessageAsRead' : ActorMethod<[string], Result>,
  'processAutomaticRefund' : ActorMethod<[string, RefundReason], Result>,
  'processPayment' : ActorMethod<[string], Result>,
  'processPaymentPlanInstallment' : ActorMethod<[string], Result>,
  'recordDailyPlatformUsage' : ActorMethod<[], Result>,
  'registerUserEncryptionKey' : ActorMethod<[string, KeyType], Result_9>,
  'releaseEscrowFunds' : ActorMethod<[string, string], Result>,
  'revokeAccess' : ActorMethod<[string, string, UserId], Result>,
  'sendMessage' : ActorMethod<[UserId, string, string], Result_8>,
  'sendSecureMessage' : ActorMethod<
    [string, Principal, string, MessageType],
    Result_7
  >,
  'setSessionPricing' : ActorMethod<
    [string, bigint, string, [] | [string]],
    Result_6
  >,
  'setTherapistAvailability' : ActorMethod<
    [bigint, string, string, boolean],
    Result_5
  >,
  'submitFeedbackWithTokens' : ActorMethod<
    [AppointmentId, bigint, string],
    Result
  >,
  'updateAppointmentStatus' : ActorMethod<
    [AppointmentId, AppointmentStatus],
    Result_4
  >,
  'updateConsentStatus' : ActorMethod<[string, ConsentStatus], Result_3>,
  'updateSessionRequestStatus' : ActorMethod<
    [string, SessionRequestStatus],
    Result_2
  >,
  'updateUserProfile' : ActorMethod<
    [
      {
        'bio' : [] | [string],
        'email' : [] | [string],
        'phoneNumber' : [] | [string],
        'profilePicture' : [] | [string],
        'lastName' : [] | [string],
        'firstName' : [] | [string],
      },
    ],
    Result_1
  >,
  'updateUserStats' : ActorMethod<
    [{ 'chatInteractions' : bigint, 'lastActivity' : string }],
    string
  >,
  'verifyDoctor' : ActorMethod<[DoctorId], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
