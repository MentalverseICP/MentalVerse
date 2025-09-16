/// <reference types="vite/client" />
import { HttpAgent, Actor } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { handleMessagingError } from '../utils/errorHandler';



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

// Principal validation utility functions
const validatePrincipal = (principalStr: string | Principal): Principal | null => {
  try {
    if (typeof principalStr === 'string') {
      // Validate string format before creating Principal
      if (!principalStr || principalStr.trim().length === 0) {
        console.warn('Empty principal string provided');
        return null;
      }
      
      // Check for basic format (alphanumeric with dashes)
      const principalRegex = /^[a-z0-9-]+$/;
      if (!principalRegex.test(principalStr)) {
        console.warn('Invalid principal format:', principalStr);
        return null;
      }
      
      return Principal.fromText(principalStr);
    } else if (principalStr instanceof Principal) {
      // Validate existing Principal object
      if (principalStr.isAnonymous()) {
        console.warn('Anonymous principal provided');
        return null;
      }
      return principalStr;
    } else {
      console.warn('Invalid principal type provided:', typeof principalStr);
      return null;
    }
  } catch (error) {
    console.error('Principal validation failed:', error);
    return null;
  }
};



// Secure Messaging Service Class
export class SecureMessagingClient {
  private actor: SecureMessagingService | null = null;
  private canisterId: string;
  private agent: HttpAgent | null = null;
  private initializationAttempts: number = 0;
  private maxInitializationAttempts: number = 3;

  constructor(canisterId?: string) {
    // Validate canister ID format
    const defaultCanisterId = 'jzwty-fqaaa-aaaac-a4goq-cai';
    const providedCanisterId = canisterId || import.meta.env.VITE_CANISTER_SECURE_MESSAGING || defaultCanisterId;
    
    // Basic canister ID validation
    if (this.isValidCanisterId(providedCanisterId)) {
      this.canisterId = providedCanisterId;
    } else {
      console.warn('Invalid canister ID provided, using default:', providedCanisterId);
      this.canisterId = defaultCanisterId;
    }
  }
  
  private isValidCanisterId(canisterId: string): boolean {
    try {
      // Basic format check for canister IDs
      const canisterRegex = /^[a-z0-9-]+$/;
      return canisterRegex.test(canisterId) && canisterId.length > 10;
    } catch {
      return false;
    }
  }

  async init(authClient: AuthClient): Promise<void> {
    this.initializationAttempts++;
    
    try {
      if (!authClient.isAuthenticated()) {
        throw new Error('User must be authenticated to use secure messaging');
      }

      const identity = authClient.getIdentity();
      
      // Validate identity before proceeding
      if (!identity || identity.getPrincipal().isAnonymous()) {
        throw new Error('Invalid or anonymous identity provided');
      }
      
      // Validate the principal
      const principal = identity.getPrincipal();
      const validatedPrincipal = validatePrincipal(principal);
      if (!validatedPrincipal) {
        throw new Error('Failed to validate user principal');
      }
      
      console.log('Initializing secure messaging for principal:', validatedPrincipal.toText());
      
      this.agent = new HttpAgent({
        identity,
        host: import.meta.env.VITE_IC_HOST || 'http://localhost:4943',
      });

      // In development, fetch root key with retry logic
      if (import.meta.env.DEV) {
        let rootKeyFetched = false;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (!rootKeyFetched && retryCount < maxRetries) {
          try {
            await this.agent.fetchRootKey();
            rootKeyFetched = true;
          } catch (error) {
            retryCount++;
            console.warn(`Root key fetch attempt ${retryCount} failed:`, error);
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }
        }
        
        if (!rootKeyFetched) {
          console.error('Failed to fetch root key after retries');
          throw new Error('Failed to fetch root key for development environment');
        }
      }

      // Create actor with error handling
      try {
        this.actor = Actor.createActor(idlFactory, {
          agent: this.agent,
          canisterId: this.canisterId,
        }) as SecureMessagingService;
        
        // Test the actor with a health check
        await this.testActorConnection();
        
        console.log('Secure messaging service initialized successfully');
      } catch (actorError) {
        console.error('Failed to create secure messaging actor:', actorError);
        throw new Error(`Failed to initialize secure messaging actor: ${actorError}`);
      }
      
    } catch (error) {
      console.error(`Secure messaging initialization attempt ${this.initializationAttempts} failed:`, error);
      
      // Reset actor on failure
      this.actor = null;
      this.agent = null;
      
      // Retry logic for initialization
      if (this.initializationAttempts < this.maxInitializationAttempts) {
        console.log(`Retrying secure messaging initialization (${this.initializationAttempts}/${this.maxInitializationAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 2000 * this.initializationAttempts));
        return this.init(authClient);
      }
      
      throw error;
    }
  }
  
  private async testActorConnection(): Promise<void> {
    if (!this.actor) {
      throw new Error('Actor not initialized');
    }
    
    try {
      // Test with health check
      await this.actor.health_check();
    } catch (error) {
      console.error('Actor connection test failed:', error);
      throw new Error('Secure messaging service is not responding');
    }
  }

  getActor(): SecureMessagingService | null {
    return this.actor;
  }

  // Convenience methods for common operations with enhanced validation
  async sendTextMessage(conversationId: string, recipient: Principal | string, content: string): Promise<{ Ok?: Message; Err?: string }> {
    if (!this.actor) {
      const error = handleMessagingError('Service not initialized', 'service_unavailable', {
        operation: 'send_text_message',
        conversationId
      });
      throw new Error(error.userMessage || 'Service not initialized');
    }
    
    // Validate recipient principal
    const validatedRecipient = validatePrincipal(recipient);
    if (!validatedRecipient) {
      const error = handleMessagingError('Invalid recipient principal provided', 'validation_error', {
        operation: 'send_text_message',
        conversationId,
        additionalData: { recipient: typeof recipient === 'string' ? recipient : recipient.toString() }
      });
      return { Err: error.userMessage || 'Invalid recipient principal provided' };
    }
    
    // Validate conversation ID
    if (!conversationId || conversationId.trim().length === 0) {
      const error = handleMessagingError('Invalid conversation ID provided', 'validation_error', {
        operation: 'send_text_message',
        additionalData: { conversationId }
      });
      return { Err: error.userMessage || 'Invalid conversation ID provided' };
    }
    
    // Validate content
    if (!content || content.trim().length === 0) {
      const error = handleMessagingError('Message content cannot be empty', 'validation_error', {
        operation: 'send_text_message',
        conversationId,
        additionalData: { contentLength: content?.length || 0 }
      });
      return { Err: error.userMessage || 'Message content cannot be empty' };
    }
    
    try {
      return await this.actor.send_message(conversationId, validatedRecipient, content, { text: null }, undefined, []);
    } catch (error) {
      const msgError = handleMessagingError(error as Error, 'send_message_failed', {
        operation: 'send_text_message',
        conversationId,
        additionalData: { recipient: validatedRecipient.toString() }
      });
      console.error('Failed to send text message:', error);
      return { Err: msgError.userMessage || `Failed to send message: ${error}` };
    }
  }

  async createDirectConversation(participant: Principal | string, title: string = 'Direct Message'): Promise<{ Ok?: Conversation; Err?: string }> {
    if (!this.actor) {
      const error = handleMessagingError('Service not initialized', 'service_unavailable', {
        operation: 'create_direct_conversation'
      });
      throw new Error(error.userMessage || 'Service not initialized');
    }
    
    // Validate participant principal
    const validatedParticipant = validatePrincipal(participant);
    if (!validatedParticipant) {
      const error = handleMessagingError('Invalid participant principal provided', 'validation_error', {
        operation: 'create_direct_conversation',
        additionalData: { participant: typeof participant === 'string' ? participant : participant.toString() }
      });
      return { Err: error.userMessage || 'Invalid participant principal provided' };
    }
    
    // Validate title
    if (!title || title.trim().length === 0) {
      title = 'Direct Message';
    }
    
    const metadata: ConversationMetadata = {
      title: title.trim(),
      description: 'Direct conversation between two users',
      is_encrypted: true,
      max_participants: BigInt(2),
    };
    
    try {
      return await this.actor.create_conversation([validatedParticipant], { direct: null }, metadata);
    } catch (error) {
      const msgError = handleMessagingError(error as Error, 'create_conversation_failed', {
        operation: 'create_direct_conversation',
        additionalData: { participant: validatedParticipant.toString(), title }
      });
      console.error('Failed to create direct conversation:', error);
      return { Err: msgError.userMessage || `Failed to create conversation: ${error}` };
    }
  }

  async getUnreadMessageCount(): Promise<number> {
    if (!this.actor) {
      const error = handleMessagingError('Service not initialized', 'service_unavailable', {
        operation: 'get_unread_count'
      });
      console.error(error.userMessage);
      return 0;
    }
    
    try {
      const conversations = await this.actor.get_user_conversations();
      let unreadCount = 0;
      
      for (const conversation of conversations) {
        const messages = await this.actor.get_conversation_messages(conversation.id);
        unreadCount += messages.filter(msg => !msg.is_read).length;
      }
      
      return unreadCount;
    } catch (error) {
      const msgError = handleMessagingError(error as Error, 'get_unread_count_failed', {
        operation: 'get_unread_count'
      });
      console.error('Failed to get unread message count:', msgError.userMessage);
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