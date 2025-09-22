import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export interface Attachment {
  'id' : string,
  'encrypted_data' : string,
  'size' : bigint,
  'content_type' : string,
  'filename' : string,
}
export type CanisterStatus = { 'active' : null } |
  { 'inactive' : null } |
  { 'error' : string };
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
export type Duration = bigint;
export type EarningType = { 'appointment_completion' : null } |
  { 'patient_feedback' : null } |
  { 'referral_bonus' : null } |
  { 'platform_usage' : null } |
  { 'system_participation' : null } |
  { 'staking_reward' : null } |
  { 'doctor_consultation' : null };
export interface FaucetClaim {
  'id' : string,
  'status' : { 'pending' : null } |
    { 'completed' : null } |
    { 'failed' : null },
  'timestamp' : bigint,
  'amount' : bigint,
}
export interface FaucetStats {
  'remaining_today' : bigint,
  'total_claims' : bigint,
  'last_reset' : bigint,
  'total_distributed' : bigint,
  'daily_limit' : bigint,
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
export type Result = { 'ok' : UserProfile } |
  { 'err' : string };
export type Result_1 = { 'ok' : string } |
  { 'err' : string };
export type Result_2 = { 'ok' : Array<Conversation> } |
  { 'err' : string };
export type Result_3 = { 'ok' : Array<Transaction> } |
  { 'err' : string };
export type Result_4 = { 'ok' : bigint } |
  { 'err' : string };
export type Result_5 = { 'ok' : Array<Message> } |
  { 'err' : string };
export type Result_6 = { 'ok' : FaucetStats } |
  { 'err' : string };
export type Result_7 = { 'ok' : Array<FaucetClaim> } |
  { 'err' : string };
export type Result_8 = { 'ok' : { 'id' : UserId, 'role' : string } } |
  { 'err' : string };
export type SpendingType = { 'ai_insights' : null } |
  { 'priority_booking' : null } |
  { 'telemedicine' : null } |
  { 'extended_storage' : null } |
  { 'premium_consultation' : null } |
  { 'advanced_features' : null };
export interface SystemHealth {
  'last_health_check' : bigint,
  'backend_status' : CanisterStatus,
  'mvt_token_status' : CanisterStatus,
}
export type Timestamp = bigint;
export interface Transaction {
  'operation' : { 'burn' : { 'from' : Account, 'amount' : bigint } } |
    {
      'earn' : {
        'to' : Account,
        'earning_type' : EarningType,
        'amount' : bigint,
      }
    } |
    { 'mint' : { 'to' : Account, 'amount' : bigint } } |
    { 'unstake' : { 'to' : Account, 'reward' : bigint, 'amount' : bigint } } |
    {
      'spend' : {
        'from' : Account,
        'spending_type' : SpendingType,
        'amount' : bigint,
      }
    } |
    {
      'stake' : {
        'from' : Account,
        'amount' : bigint,
        'lock_period' : Duration,
      }
    } |
    {
      'transfer' : {
        'to' : Account,
        'fee' : bigint,
        'from' : Account,
        'amount' : bigint,
      }
    },
  'timestamp' : Timestamp,
  'index' : TxIndex,
}
export type TxIndex = bigint;
export type UserId = Principal;
export interface UserProfile {
  'id' : UserId,
  'userType' : UserType,
  'createdAt' : bigint,
  'isActive' : boolean,
  'email' : string,
  'updatedAt' : bigint,
  'department' : [] | [string],
  'lastLogin' : [] | [bigint],
  'lastName' : string,
  'firstName' : string,
}
export interface UserProfileUpdates {
  'isActive' : [] | [boolean],
  'email' : [] | [string],
  'department' : [] | [string],
  'lastName' : [] | [string],
  'firstName' : [] | [string],
}
export type UserType = { 'patient' : null } |
  { 'admin' : null } |
  { 'therapist' : null };
export type ValidationResult = { 'ok' : null } |
  { 'err' : string };
export interface _SERVICE {
  'authenticateAdmin' : ActorMethod<[], Result_1>,
  'claimFaucetTokens' : ActorMethod<[], Result_1>,
  'createTherapyConversation' : ActorMethod<[Principal, string], Result_1>,
  'create_user_profile' : ActorMethod<
    [
      {
        'userType' : UserType,
        'email' : string,
        'lastName' : string,
        'firstName' : string,
      },
    ],
    Result_1
  >,
  'getCanisterIds' : ActorMethod<[], Array<[string, Principal]>>,
  'getCurrentUser' : ActorMethod<[], Result_8>,
  'getFaucetClaimHistory' : ActorMethod<[], Result_7>,
  'getFaucetStats' : ActorMethod<[], Result_6>,
  'getPatientData' : ActorMethod<[Principal], Result_1>,
  'getSecureConversationMessages' : ActorMethod<
    [string, [] | [bigint], [] | [bigint]],
    Result_5
  >,
  'getSystemHealth' : ActorMethod<[], SystemHealth>,
  'getTokenBalance' : ActorMethod<[], Result_4>,
  'getTransactionHistory' : ActorMethod<
    [[] | [bigint], [] | [bigint]],
    Result_3
  >,
  'getUserSecureConversations' : ActorMethod<[], Result_2>,
  'get_user_profile' : ActorMethod<[Principal], Result>,
  'initialize' : ActorMethod<[], Result_1>,
  'isSystemInitialized' : ActorMethod<[], boolean>,
  'processPayment' : ActorMethod<[bigint, string], Result_1>,
  'registerUser' : ActorMethod<
    [
      {
        'userType' : UserType,
        'email' : string,
        'lastName' : string,
        'firstName' : string,
      },
    ],
    Result_1
  >,
  'sanitizeText' : ActorMethod<[string], string>,
  'sendSecureMessage' : ActorMethod<[Principal, string], Result_1>,
  'setMVTTokenCanister' : ActorMethod<[Principal], Result_1>,
  'setSecureMessagingCanister' : ActorMethod<[Principal], Result_1>,
  'storePatientData' : ActorMethod<[UserId, string], Result_1>,
  'updateUserProfile' : ActorMethod<[UserProfileUpdates], Result>,
  'validateEmail' : ActorMethod<[string], ValidationResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
