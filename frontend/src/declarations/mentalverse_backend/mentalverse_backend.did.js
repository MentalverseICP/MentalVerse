export const idlFactory = ({ IDL }) => {
  const Result_1 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const UserType = IDL.Variant({
    'patient' : IDL.Null,
    'admin' : IDL.Null,
    'therapist' : IDL.Null,
  });
  const UserId = IDL.Principal;
  const Result_8 = IDL.Variant({
    'ok' : IDL.Record({ 'id' : UserId, 'role' : IDL.Text }),
    'err' : IDL.Text,
  });
  const FaucetClaim = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Variant({
      'pending' : IDL.Null,
      'completed' : IDL.Null,
      'failed' : IDL.Null,
    }),
    'timestamp' : IDL.Int,
    'amount' : IDL.Nat,
  });
  const Result_7 = IDL.Variant({
    'ok' : IDL.Vec(FaucetClaim),
    'err' : IDL.Text,
  });
  const FaucetStats = IDL.Record({
    'remaining_today' : IDL.Nat,
    'total_claims' : IDL.Nat,
    'last_reset' : IDL.Int,
    'total_distributed' : IDL.Nat,
    'daily_limit' : IDL.Nat,
  });
  const Result_6 = IDL.Variant({ 'ok' : FaucetStats, 'err' : IDL.Text });
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
  const Result_5 = IDL.Variant({ 'ok' : IDL.Vec(Message), 'err' : IDL.Text });
  const CanisterStatus = IDL.Variant({
    'active' : IDL.Null,
    'inactive' : IDL.Null,
    'error' : IDL.Text,
  });
  const SystemHealth = IDL.Record({
    'last_health_check' : IDL.Int,
    'backend_status' : CanisterStatus,
    'mvt_token_status' : CanisterStatus,
  });
  const Result_4 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const EarningType = IDL.Variant({
    'appointment_completion' : IDL.Null,
    'patient_feedback' : IDL.Null,
    'referral_bonus' : IDL.Null,
    'platform_usage' : IDL.Null,
    'system_participation' : IDL.Null,
    'staking_reward' : IDL.Null,
    'doctor_consultation' : IDL.Null,
  });
  const SpendingType = IDL.Variant({
    'ai_insights' : IDL.Null,
    'priority_booking' : IDL.Null,
    'telemedicine' : IDL.Null,
    'extended_storage' : IDL.Null,
    'premium_consultation' : IDL.Null,
    'advanced_features' : IDL.Null,
  });
  const Duration = IDL.Nat64;
  const Timestamp = IDL.Nat64;
  const TxIndex = IDL.Nat;
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
  const Result_3 = IDL.Variant({
    'ok' : IDL.Vec(Transaction),
    'err' : IDL.Text,
  });
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
  const Result_2 = IDL.Variant({
    'ok' : IDL.Vec(Conversation),
    'err' : IDL.Text,
  });
  const UserProfile = IDL.Record({
    'id' : UserId,
    'userType' : UserType,
    'createdAt' : IDL.Int,
    'isActive' : IDL.Bool,
    'email' : IDL.Text,
    'updatedAt' : IDL.Int,
    'department' : IDL.Opt(IDL.Text),
    'lastLogin' : IDL.Opt(IDL.Int),
    'lastName' : IDL.Text,
    'firstName' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : UserProfile, 'err' : IDL.Text });
  const UserProfileUpdates = IDL.Record({
    'isActive' : IDL.Opt(IDL.Bool),
    'email' : IDL.Opt(IDL.Text),
    'department' : IDL.Opt(IDL.Text),
    'lastName' : IDL.Opt(IDL.Text),
    'firstName' : IDL.Opt(IDL.Text),
  });
  const ValidationResult = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  return IDL.Service({
    'claimFaucetTokens' : IDL.Func([], [Result_1], []),
    'createTherapyConversation' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [Result_1],
        [],
      ),
    'create_user_profile' : IDL.Func(
        [
          IDL.Record({
            'userType' : UserType,
            'email' : IDL.Text,
            'lastName' : IDL.Text,
            'firstName' : IDL.Text,
          }),
        ],
        [Result_1],
        [],
      ),
    'getCanisterIds' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Principal))],
        [],
      ),
    'getCurrentUser' : IDL.Func([], [Result_8], []),
    'getFaucetClaimHistory' : IDL.Func([], [Result_7], []),
    'getFaucetStats' : IDL.Func([], [Result_6], []),
    'getPatientData' : IDL.Func([IDL.Principal], [Result_1], []),
    'getSecureConversationMessages' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Nat64), IDL.Opt(IDL.Nat64)],
        [Result_5],
        [],
      ),
    'getSystemHealth' : IDL.Func([], [SystemHealth], []),
    'getTokenBalance' : IDL.Func([], [Result_4], []),
    'getTransactionHistory' : IDL.Func(
        [IDL.Opt(IDL.Nat64), IDL.Opt(IDL.Nat64)],
        [Result_3],
        [],
      ),
    'getUserSecureConversations' : IDL.Func([], [Result_2], []),
    'get_user_profile' : IDL.Func([IDL.Principal], [Result], []),
    'initialize' : IDL.Func([], [Result_1], []),
    'isSystemInitialized' : IDL.Func([], [IDL.Bool], []),
    'processPayment' : IDL.Func([IDL.Nat, IDL.Text], [Result_1], []),
    'registerUser' : IDL.Func(
        [
          IDL.Record({
            'userType' : UserType,
            'email' : IDL.Text,
            'lastName' : IDL.Text,
            'firstName' : IDL.Text,
          }),
        ],
        [Result_1],
        [],
      ),
    'sanitizeText' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'sendSecureMessage' : IDL.Func([IDL.Principal, IDL.Text], [Result_1], []),
    'setMVTTokenCanister' : IDL.Func([IDL.Principal], [Result_1], []),
    'setSecureMessagingCanister' : IDL.Func([IDL.Principal], [Result_1], []),
    'storePatientData' : IDL.Func([UserId, IDL.Text], [Result_1], []),
    'updateUserProfile' : IDL.Func([UserProfileUpdates], [Result], []),
    'validateEmail' : IDL.Func([IDL.Text], [ValidationResult], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
