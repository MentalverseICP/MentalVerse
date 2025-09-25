import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Result = { 'ok' : string } |
  { 'err' : string };
export interface WaitlistEntry {
  'principal' : [] | [Principal],
  'email' : string,
  'timestamp' : bigint,
}
export interface _SERVICE {
  'addToWaitlist' : ActorMethod<[string], Result>,
  'exportWaitlistData' : ActorMethod<[], string>,
  'getWaitlistCount' : ActorMethod<[], bigint>,
  'getWaitlistEntries' : ActorMethod<[], Array<WaitlistEntry>>,
  'getWaitlistEntriesByDateRange' : ActorMethod<
    [bigint, bigint],
    Array<WaitlistEntry>
  >,
  'isEmailInWaitlist' : ActorMethod<[string], boolean>,
  'removeFromWaitlist' : ActorMethod<[string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
