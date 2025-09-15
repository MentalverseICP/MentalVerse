/// <reference types="vite/client" />
import { HttpAgent, Actor } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';



// Secure Messaging Service Types
export interface MessageType {
  text?: null;
  image?: null;
  file?: null;
  voice?: null;
  video?: null;
}

export interface ConversationType {
  direct?: null;
  group?: null;
  emergency?: null;
}

export interface KeyType {
  rsa?: null;
  ed25519?: null;
  secp256k1?: null;
}

export interface Attachment {
  id: string;
  filename: string;
  content_type: string;
  size: bigint;
  url: string;
}

export interface ConversationMetadata {
  title: string;
  description: string;
  is_encrypted: boolean;
  max_participants: bigint;
}

export interface Message {
  id: bigint;
  conversation_id: string;
  sender: Principal;
  recipient: Principal;
  content: string;
  message_type: MessageType;
  reply_to?: bigint;
  attachments: Attachment[];
  timestamp: bigint;
  is_read: boolean;
  is_encrypted: boolean;
  is_deleted: boolean;
}

export interface Conversation {
  id: string;
  participants: Principal[];
  conversation_type: ConversationType;
  metadata: ConversationMetadata;
  created_at: bigint;
  updated_at: bigint;
  last_message_id?: bigint;
  is_archived: boolean;
}

export interface UserKey {
  user_id: Principal;
  public_key: string;
  key_type: KeyType;
  created_at: bigint;
  is_active: boolean;
}

// Candid Interface Definition
const idlFactory = ({ IDL }: any) => {
  const KeyType = IDL.Variant({
    'rsa': IDL.Null,
    'ed25519': IDL.Null,
    'secp256k1': IDL.Null,
  });
  
  const UserKey = IDL.Record({
    'user_id': IDL.Principal,
    'public_key': IDL.Text,
    'key_type': KeyType,
    'created_at': IDL.Nat64,
    'is_active': IDL.Bool,
  });
  
  const ConversationType = IDL.Variant({
    'direct': IDL.Null,
    'group': IDL.Null,
    'emergency': IDL.Null,
  });
  
  const ConversationMetadata = IDL.Record({
    'title': IDL.Text,
    'description': IDL.Text,
    'is_encrypted': IDL.Bool,
    'max_participants': IDL.Nat64,
  });
  
  const Conversation = IDL.Record({
    'id': IDL.Text,
    'participants': IDL.Vec(IDL.Principal),
    'conversation_type': ConversationType,
    'metadata': ConversationMetadata,
    'created_at': IDL.Nat64,
    'updated_at': IDL.Nat64,
    'last_message_id': IDL.Opt(IDL.Nat64),
    'is_archived': IDL.Bool,
  });
  
  const MessageType = IDL.Variant({
    'text': IDL.Null,
    'image': IDL.Null,
    'file': IDL.Null,
    'voice': IDL.Null,
    'video': IDL.Null,
  });
  
  const Attachment = IDL.Record({
    'id': IDL.Text,
    'filename': IDL.Text,
    'content_type': IDL.Text,
    'size': IDL.Nat64,
    'url': IDL.Text,
  });
  
  const Message = IDL.Record({
    'id': IDL.Nat64,
    'conversation_id': IDL.Text,
    'sender': IDL.Principal,
    'recipient': IDL.Principal,
    'content': IDL.Text,
    'message_type': MessageType,
    'reply_to': IDL.Opt(IDL.Nat64),
    'attachments': IDL.Vec(Attachment),
    'timestamp': IDL.Nat64,
    'is_read': IDL.Bool,
    'is_encrypted': IDL.Bool,
    'is_deleted': IDL.Bool,
  });
  
  const ConversationResult = IDL.Variant({
    'Ok': Conversation,
    'Err': IDL.Text,
  });
  
  const MessageResult = IDL.Variant({
    'Ok': Message,
    'Err': IDL.Text,
  });
  
  const Stats = IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64));
  
  return IDL.Service({
    'register_user_key': IDL.Func([IDL.Text, KeyType], [IDL.Variant({ 'Ok': UserKey, 'Err': IDL.Text })], []),
    'get_user_key': IDL.Func([IDL.Principal], [IDL.Opt(UserKey)], ['query']),
    'create_conversation': IDL.Func([IDL.Vec(IDL.Principal), ConversationType, ConversationMetadata], [ConversationResult], []),
    'get_user_conversations': IDL.Func([], [IDL.Vec(Conversation)], ['query']),
    'archive_conversation': IDL.Func([IDL.Text], [IDL.Variant({ 'Ok': IDL.Null, 'Err': IDL.Text })], []),
    'send_message': IDL.Func([IDL.Text, IDL.Principal, IDL.Text, MessageType, IDL.Opt(IDL.Nat64), IDL.Vec(Attachment)], [MessageResult], []),
    'get_conversation_messages': IDL.Func([IDL.Text, IDL.Opt(IDL.Nat64), IDL.Opt(IDL.Nat64)], [IDL.Vec(Message)], ['query']),
    'mark_message_read': IDL.Func([IDL.Nat64], [IDL.Variant({ 'Ok': IDL.Null, 'Err': IDL.Text })], []),
    'delete_message': IDL.Func([IDL.Nat64], [IDL.Variant({ 'Ok': IDL.Null, 'Err': IDL.Text })], []),
    'health_check': IDL.Func([], [IDL.Text], ['query']),
    'get_stats': IDL.Func([], [Stats], ['query']),
  });
};

// Secure Messaging Service Interface
export interface SecureMessagingService {
  // User key management
  register_user_key: (publicKey: string, keyType: KeyType) => Promise<{ Ok?: UserKey; Err?: string }>;
  get_user_key: (userId: Principal) => Promise<UserKey | null>;
  
  // Conversation management
  create_conversation: (participants: Principal[], conversationType: ConversationType, metadata: ConversationMetadata) => Promise<{ Ok?: Conversation; Err?: string }>;
  get_user_conversations: () => Promise<Conversation[]>;
  archive_conversation: (conversationId: string) => Promise<{ Ok?: null; Err?: string }>;
  
  // Message management
  send_message: (conversationId: string, recipient: Principal, content: string, messageType: MessageType, replyTo?: bigint, attachments?: Attachment[]) => Promise<{ Ok?: Message; Err?: string }>;
  get_conversation_messages: (conversationId: string, offset?: bigint, limit?: bigint) => Promise<Message[]>;
  mark_message_read: (messageId: bigint) => Promise<{ Ok?: null; Err?: string }>;
  delete_message: (messageId: bigint) => Promise<{ Ok?: null; Err?: string }>;
  
  // Utility functions
  health_check: () => Promise<string>;
  get_stats: () => Promise<Array<[string, bigint]>>;
}

// Secure Messaging Service Class
export class SecureMessagingClient {
  private actor: SecureMessagingService | null = null;
  private canisterId: string;
  private agent: HttpAgent | null = null;

  constructor(canisterId?: string) {
    this.canisterId = canisterId || import.meta.env.VITE_CANISTER_SECURE_MESSAGING || 'jzwty-fqaaa-aaaac-a4goq-cai';
  }

  async init(authClient: AuthClient): Promise<void> {
    if (!authClient.isAuthenticated()) {
      throw new Error('User must be authenticated to use secure messaging');
    }

    const identity = authClient.getIdentity();
    this.agent = new HttpAgent({
      identity,
      host: import.meta.env.VITE_IC_HOST || 'http://localhost:4943',
    });

    // In development, fetch root key
    if (import.meta.env.DEV) {
      await this.agent.fetchRootKey();
    }

    // Create actor
    this.actor = Actor.createActor(idlFactory, {
      agent: this.agent,
      canisterId: this.canisterId,
    }) as SecureMessagingService;
  }

  getActor(): SecureMessagingService | null {
    return this.actor;
  }

  // Convenience methods for common operations
  async sendTextMessage(conversationId: string, recipient: Principal, content: string): Promise<{ Ok?: Message; Err?: string }> {
    if (!this.actor) throw new Error('Service not initialized');
    return this.actor.send_message(conversationId, recipient, content, { text: null }, undefined, []);
  }

  async createDirectConversation(participant: Principal, title: string = 'Direct Message'): Promise<{ Ok?: Conversation; Err?: string }> {
    if (!this.actor) throw new Error('Service not initialized');
    
    const metadata: ConversationMetadata = {
      title,
      description: 'Direct conversation between two users',
      is_encrypted: true,
      max_participants: BigInt(2),
    };
    
    return this.actor.create_conversation([participant], { direct: null }, metadata);
  }

  async getUnreadMessageCount(): Promise<number> {
    if (!this.actor) throw new Error('Service not initialized');
    
    try {
      const conversations = await this.actor.get_user_conversations();
      let unreadCount = 0;
      
      for (const conversation of conversations) {
        const messages = await this.actor.get_conversation_messages(conversation.id);
        unreadCount += messages.filter(msg => !msg.is_read).length;
      }
      
      return unreadCount;
    } catch (error) {
      console.error('Failed to get unread message count:', error);
      return 0;
    }
  }

  // Helper methods for message types
  createMessageType(type: 'text' | 'image' | 'file' | 'voice' | 'video'): MessageType {
    switch (type) {
      case 'text': return { text: null };
      case 'image': return { image: null };
      case 'file': return { file: null };
      case 'voice': return { voice: null };
      case 'video': return { video: null };
      default: return { text: null };
    }
  }

  createConversationType(type: 'direct' | 'group' | 'emergency'): ConversationType {
    switch (type) {
      case 'direct': return { direct: null };
      case 'group': return { group: null };
      case 'emergency': return { emergency: null };
      default: return { direct: null };
    }
  }

  createKeyType(type: 'rsa' | 'ed25519' | 'secp256k1'): KeyType {
    switch (type) {
      case 'rsa': return { rsa: null };
      case 'ed25519': return { ed25519: null };
      case 'secp256k1': return { secp256k1: null };
      default: return { ed25519: null };
    }
  }

  // Implement missing SecureMessagingService methods
  async register_user_key(publicKey: string, keyType: KeyType): Promise<{ Ok?: UserKey; Err?: string }> {
    if (!this.actor) throw new Error('SecureMessaging not initialized');
    return await this.actor.register_user_key(publicKey, keyType);
  }

  async get_user_key(userId: Principal): Promise<UserKey | null> {
    if (!this.actor) throw new Error('SecureMessaging not initialized');
    return await this.actor.get_user_key(userId);
  }

  async create_conversation(participants: Principal[], conversationType: ConversationType, metadata: ConversationMetadata): Promise<{ Ok?: Conversation; Err?: string }> {
    if (!this.actor) throw new Error('SecureMessaging not initialized');
    return await this.actor.create_conversation(participants, conversationType, metadata);
  }

  async get_user_conversations(): Promise<Conversation[]> {
    if (!this.actor) throw new Error('SecureMessaging not initialized');
    return await this.actor.get_user_conversations();
  }

  async archive_conversation(conversationId: string): Promise<{ Ok?: null; Err?: string }> {
    if (!this.actor) throw new Error('SecureMessaging not initialized');
    return await this.actor.archive_conversation(conversationId);
  }

  async send_message(conversationId: string, recipient: Principal, content: string, messageType: MessageType, replyTo?: bigint, attachments?: Attachment[]): Promise<{ Ok?: Message; Err?: string }> {
    if (!this.actor) throw new Error('SecureMessaging not initialized');
    return await this.actor.send_message(conversationId, recipient, content, messageType, replyTo, attachments);
  }

  async get_conversation_messages(conversationId: string, offset?: bigint, limit?: bigint): Promise<Message[]> {
    if (!this.actor) throw new Error('SecureMessaging not initialized');
    return await this.actor.get_conversation_messages(conversationId, offset, limit);
  }

  async mark_message_read(messageId: bigint): Promise<{ Ok?: null; Err?: string }> {
    if (!this.actor) throw new Error('SecureMessaging not initialized');
    return await this.actor.mark_message_read(messageId);
  }

  async delete_message(messageId: bigint): Promise<{ Ok?: null; Err?: string }> {
    if (!this.actor) throw new Error('SecureMessaging not initialized');
    return await this.actor.delete_message(messageId);
  }

  async health_check(): Promise<string> {
    if (!this.actor) throw new Error('SecureMessaging not initialized');
    return await this.actor.health_check();
  }

  async get_stats(): Promise<Array<[string, bigint]>> {
    if (!this.actor) throw new Error('SecureMessaging not initialized');
    return await this.actor.get_stats();
  }
}

// Export singleton instance
export const secureMessagingService = new SecureMessagingClient();