export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const WaitlistEntry = IDL.Record({
    'principal' : IDL.Opt(IDL.Principal),
    'email' : IDL.Text,
    'timestamp' : IDL.Int,
  });
  return IDL.Service({
    'addToWaitlist' : IDL.Func([IDL.Text], [Result], []),
    'exportWaitlistData' : IDL.Func([], [IDL.Text], ['query']),
    'getWaitlistCount' : IDL.Func([], [IDL.Nat], ['query']),
    'getWaitlistEntries' : IDL.Func([], [IDL.Vec(WaitlistEntry)], ['query']),
    'getWaitlistEntriesByDateRange' : IDL.Func(
        [IDL.Int, IDL.Int],
        [IDL.Vec(WaitlistEntry)],
        ['query'],
      ),
    'isEmailInWaitlist' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'removeFromWaitlist' : IDL.Func([IDL.Text], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
