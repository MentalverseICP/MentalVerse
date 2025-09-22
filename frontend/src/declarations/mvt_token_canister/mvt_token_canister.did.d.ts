import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export type Duration = bigint;
export interface EarningRecord {
  'description' : string,
  'user_id' : Principal,
  'earning_type' : EarningType,
  'timestamp' : bigint,
  'amount' : bigint,
}
export type EarningType = { 'appointment_completion' : null } |
  { 'patient_feedback' : null } |
  { 'referral_bonus' : null } |
  { 'platform_usage' : null } |
  { 'system_participation' : null } |
  { 'staking_reward' : null } |
  { 'doctor_consultation' : null };
export type Result = { 'ok' : bigint } |
  { 'err' : string };
export type Result_1 = { 'ok' : null } |
  { 'err' : string };
export type Result_2 = { 'ok' : TxIndex } |
  { 'err' : string };
export interface SpendingRecord {
  'description' : string,
  'user_id' : Principal,
  'spending_type' : SpendingType,
  'timestamp' : bigint,
  'amount' : bigint,
}
export type SpendingType = { 'ai_insights' : null } |
  { 'priority_booking' : null } |
  { 'telemedicine' : null } |
  { 'extended_storage' : null } |
  { 'premium_consultation' : null } |
  { 'advanced_features' : null };
export interface StakeInfo {
  'last_reward_claim' : bigint,
  'reward_rate' : number,
  'staked_at' : bigint,
  'amount' : bigint,
  'lock_period' : Duration,
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
export interface TransferArgs {
  'to' : Account,
  'fee' : [] | [bigint],
  'memo' : [] | [Uint8Array | number[]],
  'from_subaccount' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [Timestamp],
  'amount' : bigint,
}
export type TransferError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'BadBurn' : { 'min_burn_amount' : bigint } } |
  { 'Duplicate' : { 'duplicate_of' : TxIndex } } |
  { 'BadFee' : { 'expected_fee' : bigint } } |
  { 'CreatedInFuture' : { 'ledger_time' : Timestamp } } |
  { 'TooOld' : null } |
  { 'InsufficientFunds' : { 'balance' : bigint } };
export type TransferResult = { 'ok' : TxIndex } |
  { 'err' : TransferError };
export type TxIndex = bigint;
export interface _SERVICE {
  'add_authorized_canister' : ActorMethod<[Principal], Result_1>,
  'burn_tokens' : ActorMethod<[Account, bigint], Result_2>,
  'claim_staking_rewards' : ActorMethod<[Principal], Result>,
  'distribute_daily_rewards' : ActorMethod<[], Result>,
  'earn_tokens' : ActorMethod<
    [Principal, EarningType, [] | [bigint]],
    Result_2
  >,
  'enhanced_burn_tokens' : ActorMethod<[Account, bigint, string], Result_2>,
  'get_canister_call_stats' : ActorMethod<[], Array<[Principal, bigint]>>,
  'get_earning_rates' : ActorMethod<
    [],
    {
      'doctor_consultation_fee' : bigint,
      'platform_usage_daily' : bigint,
      'appointment_completion' : bigint,
      'patient_feedback' : bigint,
      'referral_bonus' : bigint,
      'system_participation' : bigint,
    }
  >,
  'get_faucet_stats' : ActorMethod<
    [],
    {
      'remaining_today' : bigint,
      'total_claims' : bigint,
      'last_reset' : bigint,
      'total_distributed' : bigint,
      'daily_limit' : bigint,
    }
  >,
  'get_reward_eligibility' : ActorMethod<[Principal], boolean>,
  'get_spending_costs' : ActorMethod<
    [],
    {
      'ai_insights' : bigint,
      'priority_booking' : bigint,
      'premium_consultation' : bigint,
      'advanced_features_monthly' : bigint,
      'extended_storage_monthly' : bigint,
      'telemedicine_session' : bigint,
    }
  >,
  'get_staking_info' : ActorMethod<
    [],
    { 'min_stake_amount' : bigint, 'lock_periods' : Array<[Duration, number]> }
  >,
  'get_transaction_history' : ActorMethod<
    [[] | [TxIndex], [] | [bigint]],
    Array<Transaction>
  >,
  'get_user_activity_status' : ActorMethod<[Principal], [] | [bigint]>,
  'get_user_earning_history' : ActorMethod<[Principal], Array<EarningRecord>>,
  'get_user_spending_history' : ActorMethod<[Principal], Array<SpendingRecord>>,
  'get_user_stake' : ActorMethod<[Principal], [] | [StakeInfo]>,
  'health_check' : ActorMethod<
    [],
    { 'status' : string, 'total_accounts' : bigint, 'total_supply' : bigint }
  >,
  'icrc1_balance_of' : ActorMethod<[Account], bigint>,
  'icrc1_decimals' : ActorMethod<[], number>,
  'icrc1_fee' : ActorMethod<[], bigint>,
  'icrc1_metadata' : ActorMethod<
    [],
    Array<[string, { 'Nat' : bigint } | { 'Text' : string }]>
  >,
  'icrc1_minting_account' : ActorMethod<[], [] | [Account]>,
  'icrc1_name' : ActorMethod<[], string>,
  'icrc1_symbol' : ActorMethod<[], string>,
  'icrc1_total_supply' : ActorMethod<[], bigint>,
  'icrc1_transfer' : ActorMethod<[TransferArgs], TransferResult>,
  'mark_user_active' : ActorMethod<[Principal], Result_1>,
  'mint_tokens' : ActorMethod<[Account, bigint], Result_2>,
  'spend_tokens' : ActorMethod<
    [Principal, SpendingType, [] | [bigint]],
    Result_2
  >,
  'stake_tokens' : ActorMethod<[Principal, bigint, Duration], Result_1>,
  'unstake_tokens' : ActorMethod<[Principal], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
