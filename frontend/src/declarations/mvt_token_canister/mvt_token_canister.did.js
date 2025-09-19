export const idlFactory = ({ IDL }) => {
  const Result_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const TxIndex = IDL.Nat;
  const Result_2 = IDL.Variant({ 'ok' : TxIndex, 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const EarningType = IDL.Variant({
    'appointment_completion' : IDL.Null,
    'patient_feedback' : IDL.Null,
    'referral_bonus' : IDL.Null,
    'platform_usage' : IDL.Null,
    'system_participation' : IDL.Null,
    'staking_reward' : IDL.Null,
    'doctor_consultation' : IDL.Null,
  });
  const Duration = IDL.Nat64;
  const SpendingType = IDL.Variant({
    'ai_insights' : IDL.Null,
    'priority_booking' : IDL.Null,
    'telemedicine' : IDL.Null,
    'extended_storage' : IDL.Null,
    'premium_consultation' : IDL.Null,
    'advanced_features' : IDL.Null,
  });
  const Timestamp = IDL.Nat64;
  const Transaction = IDL.Record({
    'operation' : IDL.Variant({
      'burn' : IDL.Record({ 'from' : Account, 'amount' : IDL.Nat }),
      'earn' : IDL.Record({
        'to' : Account,
        'earning_type' : EarningType,
        'amount' : IDL.Nat,
      }),
      'mint' : IDL.Record({ 'to' : Account, 'amount' : IDL.Nat }),
      'unstake' : IDL.Record({
        'to' : Account,
        'reward' : IDL.Nat,
        'amount' : IDL.Nat,
      }),
      'spend' : IDL.Record({
        'from' : Account,
        'spending_type' : SpendingType,
        'amount' : IDL.Nat,
      }),
      'stake' : IDL.Record({
        'from' : Account,
        'amount' : IDL.Nat,
        'lock_period' : Duration,
      }),
      'transfer' : IDL.Record({
        'to' : Account,
        'fee' : IDL.Nat,
        'from' : Account,
        'amount' : IDL.Nat,
      }),
    }),
    'timestamp' : Timestamp,
    'index' : TxIndex,
  });
  const EarningRecord = IDL.Record({
    'description' : IDL.Text,
    'user_id' : IDL.Principal,
    'earning_type' : EarningType,
    'timestamp' : IDL.Int,
    'amount' : IDL.Nat,
  });
  const SpendingRecord = IDL.Record({
    'description' : IDL.Text,
    'user_id' : IDL.Principal,
    'spending_type' : SpendingType,
    'timestamp' : IDL.Int,
    'amount' : IDL.Nat,
  });
  const StakeInfo = IDL.Record({
    'last_reward_claim' : IDL.Int,
    'reward_rate' : IDL.Float64,
    'staked_at' : IDL.Int,
    'amount' : IDL.Nat,
    'lock_period' : Duration,
  });
  const TransferArgs = IDL.Record({
    'to' : Account,
    'fee' : IDL.Opt(IDL.Nat),
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from_subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(Timestamp),
    'amount' : IDL.Nat,
  });
  const TransferError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : TxIndex }),
    'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : Timestamp }),
    'TooOld' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
  });
  const TransferResult = IDL.Variant({ 'ok' : TxIndex, 'err' : TransferError });
  return IDL.Service({
    'add_authorized_canister' : IDL.Func([IDL.Principal], [Result_1], []),
    'burn_tokens' : IDL.Func([Account, IDL.Nat], [Result_2], []),
    'claim_staking_rewards' : IDL.Func([IDL.Principal], [Result], []),
    'distribute_daily_rewards' : IDL.Func([], [Result], []),
    'earn_tokens' : IDL.Func(
        [IDL.Principal, EarningType, IDL.Opt(IDL.Nat)],
        [Result_2],
        [],
      ),
    'enhanced_burn_tokens' : IDL.Func(
        [Account, IDL.Nat, IDL.Text],
        [Result_2],
        [],
      ),
    'get_canister_call_stats' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat))],
        ['query'],
      ),
    'get_earning_rates' : IDL.Func(
        [],
        [
          IDL.Record({
            'doctor_consultation_fee' : IDL.Nat,
            'platform_usage_daily' : IDL.Nat,
            'appointment_completion' : IDL.Nat,
            'patient_feedback' : IDL.Nat,
            'referral_bonus' : IDL.Nat,
            'system_participation' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'get_reward_eligibility' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'get_spending_costs' : IDL.Func(
        [],
        [
          IDL.Record({
            'ai_insights' : IDL.Nat,
            'priority_booking' : IDL.Nat,
            'premium_consultation' : IDL.Nat,
            'advanced_features_monthly' : IDL.Nat,
            'extended_storage_monthly' : IDL.Nat,
            'telemedicine_session' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'get_staking_info' : IDL.Func(
        [],
        [
          IDL.Record({
            'min_stake_amount' : IDL.Nat,
            'lock_periods' : IDL.Vec(IDL.Tuple(Duration, IDL.Float64)),
          }),
        ],
        ['query'],
      ),
    'get_transaction_history' : IDL.Func(
        [IDL.Opt(TxIndex), IDL.Opt(IDL.Nat)],
        [IDL.Vec(Transaction)],
        ['query'],
      ),
    'get_user_activity_status' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(IDL.Int)],
        ['query'],
      ),
    'get_user_earning_history' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(EarningRecord)],
        ['query'],
      ),
    'get_user_spending_history' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(SpendingRecord)],
        ['query'],
      ),
    'get_user_stake' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(StakeInfo)],
        ['query'],
      ),
    'health_check' : IDL.Func(
        [],
        [
          IDL.Record({
            'status' : IDL.Text,
            'total_accounts' : IDL.Nat,
            'total_supply' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'icrc1_balance_of' : IDL.Func([Account], [IDL.Nat], ['query']),
    'icrc1_decimals' : IDL.Func([], [IDL.Nat8], ['query']),
    'icrc1_fee' : IDL.Func([], [IDL.Nat], ['query']),
    'icrc1_metadata' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Tuple(
              IDL.Text,
              IDL.Variant({ 'Nat' : IDL.Nat, 'Text' : IDL.Text }),
            )
          ),
        ],
        ['query'],
      ),
    'icrc1_minting_account' : IDL.Func([], [IDL.Opt(Account)], ['query']),
    'icrc1_name' : IDL.Func([], [IDL.Text], ['query']),
    'icrc1_symbol' : IDL.Func([], [IDL.Text], ['query']),
    'icrc1_total_supply' : IDL.Func([], [IDL.Nat], ['query']),
    'icrc1_transfer' : IDL.Func([TransferArgs], [TransferResult], []),
    'mark_user_active' : IDL.Func([IDL.Principal], [Result_1], []),
    'mint_tokens' : IDL.Func([Account, IDL.Nat], [Result_2], []),
    'spend_tokens' : IDL.Func(
        [IDL.Principal, SpendingType, IDL.Opt(IDL.Nat)],
        [Result_2],
        [],
      ),
    'stake_tokens' : IDL.Func(
        [IDL.Principal, IDL.Nat, Duration],
        [Result_1],
        [],
      ),
    'unstake_tokens' : IDL.Func([IDL.Principal], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
