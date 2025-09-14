export const idlFactory = ({ IDL }) => {
  const ConversationType = IDL.Variant({
    'SessionChat' : IDL.Null,
    'GroupChat' : IDL.Null,
    'DirectMessage' : IDL.Null,
  });
  const ConversationMetadata = IDL.Record({
    'title' : IDL.Opt(IDL.Text),
    'session_id' : IDL.Opt(IDL.Text),
    'encryption_key_id' : IDL.Text,
    'description' : IDL.Opt(IDL.Text),
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
  const ConversationResult = IDL.Record({
    'conversation' : IDL.Opt(Conversation),
    'error' : IDL.Opt(IDL.Text),
    'success' : IDL.Bool,
  });
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
  const Stats = IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64));
  const KeyType = IDL.Variant({
    'RSA2048' : IDL.Null,
    'Ed25519' : IDL.Null,
    'ECDSA' : IDL.Null,
  });
  const UserKey = IDL.Record({
    'public_key' : IDL.Text,
    'created_at' : IDL.Nat64,
    'user_id' : IDL.Principal,
    'key_type' : KeyType,
    'is_active' : IDL.Bool,
  });
  const MessageResult = IDL.Record({
    'error' : IDL.Opt(IDL.Text),
    'message' : IDL.Opt(Message),
    'success' : IDL.Bool,
  });
  return IDL.Service({
    'archive_conversation' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'create_conversation' : IDL.Func(
        [IDL.Vec(IDL.Principal), ConversationType, ConversationMetadata],
        [ConversationResult],
        [],
      ),
    'delete_message' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'get_conversation_messages' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Nat64), IDL.Opt(IDL.Nat64)],
        [IDL.Vec(Message)],
        ['query'],
      ),
    'get_stats' : IDL.Func([], [Stats], ['query']),
    'get_user_conversations' : IDL.Func([], [IDL.Vec(Conversation)], ['query']),
    'get_user_key' : IDL.Func([IDL.Principal], [IDL.Opt(UserKey)], ['query']),
    'health_check' : IDL.Func([], [IDL.Text], ['query']),
    'mark_message_read' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'register_user_key' : IDL.Func(
        [IDL.Text, KeyType],
        [IDL.Variant({ 'Ok' : UserKey, 'Err' : IDL.Text })],
        [],
      ),
    'send_message' : IDL.Func(
        [
          IDL.Text,
          IDL.Principal,
          IDL.Text,
          MessageType,
          IDL.Opt(IDL.Nat64),
          IDL.Vec(Attachment),
        ],
        [MessageResult],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
