import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Attachment {
  'id' : string,
  'encrypted_data' : string,
  'size' : bigint,
  'content_type' : string,
  'filename' : string,
}
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
export interface ConversationResult {
  'conversation' : [] | [Conversation],
  'error' : [] | [string],
  'success' : boolean,
}
export type ConversationType = { 'SessionChat' : null } |
  { 'GroupChat' : null } |
  { 'DirectMessage' : null };
export type KeyType = { 'RSA2048' : null } |
  { 'Ed25519' : null } |
  { 'ECDSA' : null };
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
export interface MessageResult {
  'error' : [] | [string],
  'message' : [] | [Message],
  'success' : boolean,
}
export type MessageType = { 'System' : null } |
  { 'File' : null } |
  { 'Text' : null } |
  { 'Image' : null } |
  { 'Audio' : null } |
  { 'Video' : null };
export type Stats = Array<[string, bigint]>;
export interface UserKey {
  'public_key' : string,
  'created_at' : bigint,
  'user_id' : Principal,
  'key_type' : KeyType,
  'is_active' : boolean,
}
export interface _SERVICE {
  'archive_conversation' : ActorMethod<
    [string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'create_conversation' : ActorMethod<
    [Array<Principal>, ConversationType, ConversationMetadata],
    ConversationResult
  >,
  'delete_message' : ActorMethod<
    [bigint],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'get_conversation_messages' : ActorMethod<
    [string, [] | [bigint], [] | [bigint]],
    Array<Message>
  >,
  'get_stats' : ActorMethod<[], Stats>,
  'get_user_conversations' : ActorMethod<[], Array<Conversation>>,
  'get_user_key' : ActorMethod<[Principal], [] | [UserKey]>,
  'health_check' : ActorMethod<[], string>,
  'mark_message_read' : ActorMethod<
    [bigint],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'register_user_key' : ActorMethod<
    [string, KeyType],
    { 'Ok' : UserKey } |
      { 'Err' : string }
  >,
  'send_message' : ActorMethod<
    [string, Principal, string, MessageType, [] | [bigint], Array<Attachment>],
    MessageResult
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
