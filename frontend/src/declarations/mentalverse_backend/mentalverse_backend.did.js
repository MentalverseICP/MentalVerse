export const idlFactory = ({ IDL }) => {
  const UserId = IDL.Principal;
  const Result_2 = IDL.Variant({
    'ok' : IDL.Record({ 'id' : UserId, 'role' : IDL.Text }),
    'err' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
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
  const UserType = IDL.Variant({
    'patient' : IDL.Null,
    'admin' : IDL.Null,
    'therapist' : IDL.Null,
  });
  const UserProfileUpdates = IDL.Record({
    'isActive' : IDL.Opt(IDL.Bool),
    'email' : IDL.Opt(IDL.Text),
    'department' : IDL.Opt(IDL.Text),
    'lastName' : IDL.Opt(IDL.Text),
    'firstName' : IDL.Opt(IDL.Text),
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
  const ValidationResult = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  return IDL.Service({
    'getCanisterIds' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Principal))],
        [],
      ),
    'getCurrentUser' : IDL.Func([], [Result_2], []),
    'getPatientData' : IDL.Func([IDL.Principal], [Result_1], []),
    'getSystemHealth' : IDL.Func([], [SystemHealth], []),
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
