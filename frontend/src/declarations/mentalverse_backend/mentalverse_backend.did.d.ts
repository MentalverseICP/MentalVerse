import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type CanisterStatus = { 'active' : null } |
  { 'inactive' : null } |
  { 'error' : string };
export type Result = { 'ok' : UserProfile } |
  { 'err' : string };
export type Result_1 = { 'ok' : string } |
  { 'err' : string };
export type Result_2 = { 'ok' : { 'id' : UserId, 'role' : string } } |
  { 'err' : string };
export interface SystemHealth {
  'last_health_check' : bigint,
  'backend_status' : CanisterStatus,
  'mvt_token_status' : CanisterStatus,
}
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
  'getCanisterIds' : ActorMethod<[], Array<[string, Principal]>>,
  'getCurrentUser' : ActorMethod<[], Result_2>,
  'getPatientData' : ActorMethod<[Principal], Result_1>,
  'getSystemHealth' : ActorMethod<[], SystemHealth>,
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
