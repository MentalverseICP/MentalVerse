use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk::{init, post_upgrade, pre_upgrade, query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable, storable::Bound};
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::HashMap;
use hmac::{Hmac, Mac};
use ring::{rand::SystemRandom, signature::{Ed25519KeyPair, KeyPair}};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use base64::{Engine as _, engine::general_purpose};

type Memory = VirtualMemory<DefaultMemoryImpl>;
type IdStore = StableBTreeMap<u64, u64, Memory>;
type MessageStore = StableBTreeMap<u64, StorableMessage, Memory>;
type ConversationStore = StableBTreeMap<String, StorableConversation, Memory>;
type UserKeyStore = StableBTreeMap<Principal, StorableUserKey, Memory>;
type WebRTCSignalStore = StableBTreeMap<String, StorableWebRTCSignal, Memory>;
type SessionTokenStore = StableBTreeMap<String, StorableSessionToken, Memory>;
type KeyExchangeStore = StableBTreeMap<String, StorableKeyExchange, Memory>;
type RTCSessionStore = StableBTreeMap<String, StorableRTCSession, Memory>;

// === DATA STRUCTURES ===

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Message {
    pub id: u64,
    pub conversation_id: String,
    pub sender_id: Principal,
    pub recipient_id: Principal,
    pub content: String, // Encrypted content
    pub message_type: MessageType,
    pub timestamp: u64,
    pub is_read: bool,
    pub is_deleted: bool,
    pub reply_to: Option<u64>,
    pub attachments: Vec<Attachment>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum MessageType {
    Text,
    Image,
    File,
    Audio,
    Video,
    System,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Attachment {
    pub id: String,
    pub filename: String,
    pub content_type: String,
    pub size: u64,
    pub encrypted_data: String, // Base64 encoded encrypted data
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Conversation {
    pub id: String,
    pub participants: Vec<Principal>,
    pub conversation_type: ConversationType,
    pub created_at: u64,
    pub updated_at: u64,
    pub last_message_id: Option<u64>,
    pub is_archived: bool,
    pub metadata: ConversationMetadata,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum ConversationType {
    DirectMessage,
    GroupChat,
    SessionChat, // For therapy sessions
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ConversationMetadata {
    pub title: Option<String>,
    pub description: Option<String>,
    pub session_id: Option<String>, // Link to therapy session
    pub encryption_key_id: String,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct UserKey {
    pub user_id: Principal,
    pub public_key: String,
    pub key_type: KeyType,
    pub created_at: u64,
    pub is_active: bool,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum KeyType {
    RSA2048,
    ECDSA,
    Ed25519,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct MessageResult {
    pub success: bool,
    pub message: Option<Message>,
    pub error: Option<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct ConversationResult {
    pub success: bool,
    pub conversation: Option<Conversation>,
    pub error: Option<String>,
}

// === WEBRTC AND REAL-TIME COMMUNICATION STRUCTURES ===

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct WebRTCSignal {
    pub id: String,
    pub session_id: String,
    pub sender_id: Principal,
    pub recipient_id: Principal,
    pub signal_type: SignalType,
    pub payload: String, // JSON encoded SDP/ICE data
    pub timestamp: u64,
    pub expires_at: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum SignalType {
    Offer,
    Answer,
    IceCandidate,
    Hangup,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SessionToken {
    pub token_id: String,
    pub session_id: String,
    pub user_id: Principal,
    pub token_hash: String,
    pub permissions: Vec<SessionPermission>,
    pub created_at: u64,
    pub expires_at: u64,
    pub is_active: bool,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum SessionPermission {
    SendMessage,
    ReceiveMessage,
    InitiateCall,
    ReceiveCall,
    ShareScreen,
    RecordSession,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct KeyExchange {
    pub exchange_id: String,
    pub initiator_id: Principal,
    pub recipient_id: Principal,
    pub public_key: String,
    pub encrypted_shared_secret: String,
    pub status: KeyExchangeStatus,
    pub created_at: u64,
    pub completed_at: Option<u64>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum KeyExchangeStatus {
    Initiated,
    InProgress,
    Completed,
    Failed,
    Expired,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RTCSession {
    pub session_id: String,
    pub participants: Vec<Principal>,
    pub session_type: RTCSessionType,
    pub status: RTCSessionStatus,
    pub created_at: u64,
    pub started_at: Option<u64>,
    pub ended_at: Option<u64>,
    pub metadata: RTCSessionMetadata,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum RTCSessionType {
    AudioCall,
    VideoCall,
    ScreenShare,
    TherapySession,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum RTCSessionStatus {
    Pending,
    Active,
    Ended,
    Failed,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RTCSessionMetadata {
    pub therapy_session_id: Option<String>,
    pub recording_enabled: bool,
    pub encryption_key_id: String,
    pub quality_settings: QualitySettings,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct QualitySettings {
    pub video_resolution: String,
    pub audio_bitrate: u32,
    pub video_bitrate: u32,
}

// === STORABLE IMPLEMENTATIONS ===

#[derive(CandidType, Deserialize, Serialize, Clone)]
struct StorableMessage {
    pub id: u64,
    pub conversation_id: String,
    pub sender_id: Principal,
    pub recipient_id: Principal,
    pub content: String,
    pub message_type: MessageType,
    pub timestamp: u64,
    pub is_read: bool,
    pub is_deleted: bool,
    pub reply_to: Option<u64>,
    pub attachments: Vec<Attachment>,
}

impl From<Message> for StorableMessage {
    fn from(msg: Message) -> Self {
        StorableMessage {
            id: msg.id,
            conversation_id: msg.conversation_id,
            sender_id: msg.sender_id,
            recipient_id: msg.recipient_id,
            content: msg.content,
            message_type: msg.message_type,
            timestamp: msg.timestamp,
            is_read: msg.is_read,
            is_deleted: msg.is_deleted,
            reply_to: msg.reply_to,
            attachments: msg.attachments,
        }
    }
}

impl From<StorableMessage> for Message {
    fn from(storable: StorableMessage) -> Self {
        Message {
            id: storable.id,
            conversation_id: storable.conversation_id,
            sender_id: storable.sender_id,
            recipient_id: storable.recipient_id,
            content: storable.content,
            message_type: storable.message_type,
            timestamp: storable.timestamp,
            is_read: storable.is_read,
            is_deleted: storable.is_deleted,
            reply_to: storable.reply_to,
            attachments: storable.attachments,
        }
    }
}

impl Storable for StorableMessage {
    const BOUND: Bound = Bound::Bounded {
        max_size: 10240, // 10KB max per message
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
struct StorableConversation {
    pub id: String,
    pub participants: Vec<Principal>,
    pub conversation_type: ConversationType,
    pub created_at: u64,
    pub updated_at: u64,
    pub last_message_id: Option<u64>,
    pub is_archived: bool,
    pub metadata: ConversationMetadata,
}

impl From<Conversation> for StorableConversation {
    fn from(conv: Conversation) -> Self {
        StorableConversation {
            id: conv.id,
            participants: conv.participants,
            conversation_type: conv.conversation_type,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            last_message_id: conv.last_message_id,
            is_archived: conv.is_archived,
            metadata: conv.metadata,
        }
    }
}

impl From<StorableConversation> for Conversation {
    fn from(storable: StorableConversation) -> Self {
        Conversation {
            id: storable.id,
            participants: storable.participants,
            conversation_type: storable.conversation_type,
            created_at: storable.created_at,
            updated_at: storable.updated_at,
            last_message_id: storable.last_message_id,
            is_archived: storable.is_archived,
            metadata: storable.metadata,
        }
    }
}

impl Storable for StorableConversation {
    const BOUND: Bound = Bound::Bounded {
        max_size: 2048, // 2KB max per conversation
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
struct StorableUserKey {
    pub user_id: Principal,
    pub public_key: String,
    pub key_type: KeyType,
    pub created_at: u64,
    pub is_active: bool,
}

impl From<UserKey> for StorableUserKey {
    fn from(key: UserKey) -> Self {
        StorableUserKey {
            user_id: key.user_id,
            public_key: key.public_key,
            key_type: key.key_type,
            created_at: key.created_at,
            is_active: key.is_active,
        }
    }
}

impl From<StorableUserKey> for UserKey {
    fn from(storable: StorableUserKey) -> Self {
        UserKey {
            user_id: storable.user_id,
            public_key: storable.public_key,
            key_type: storable.key_type,
            created_at: storable.created_at,
            is_active: storable.is_active,
        }
    }
}

impl Storable for StorableUserKey {
    const BOUND: Bound = Bound::Bounded {
        max_size: 1024, // 1KB max per user key
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

// === GLOBAL STATE ===

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static ID_COUNTER: RefCell<IdStore> = RefCell::new(
        IdStore::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        )
    );

    static MESSAGES: RefCell<MessageStore> = RefCell::new(
        MessageStore::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        )
    );

    static CONVERSATIONS: RefCell<ConversationStore> = RefCell::new(
        ConversationStore::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))
        )
    );

    static USER_KEYS: RefCell<UserKeyStore> = RefCell::new(
        UserKeyStore::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3)))
        )
    );
}

// === HELPER FUNCTIONS ===

fn generate_next_id() -> u64 {
    ID_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        let current_id = counter.get(&0).unwrap_or(0);
        let next_id = current_id + 1;
        counter.insert(0, next_id);
        next_id
    })
}

fn generate_conversation_id(participants: &[Principal]) -> String {
    let mut sorted_participants = participants.to_vec();
    sorted_participants.sort();
    let participants_str = sorted_participants
        .iter()
        .map(|p| p.to_text())
        .collect::<Vec<_>>()
        .join("-");
    
    let mut hasher = Sha256::new();
    hasher.update(participants_str.as_bytes());
    let result = hasher.finalize();
    format!("{:x}", result)[..16].to_string()
}

fn is_participant(conversation: &Conversation, user_id: &Principal) -> bool {
    conversation.participants.contains(user_id)
}

fn get_caller() -> Principal {
    ic_cdk::caller()
}

fn get_time() -> u64 {
    time()
}

// === CANISTER LIFECYCLE ===

#[init]
fn init() {
    // Initialize the canister
    ic_cdk::println!("Secure Messaging Canister initialized");
}

#[pre_upgrade]
fn pre_upgrade() {
    // Stable memory is automatically preserved
}

#[post_upgrade]
fn post_upgrade() {
    // Stable memory is automatically restored
    ic_cdk::println!("Secure Messaging Canister upgraded");
}

// === PUBLIC API ===

// Register user's public key for encryption
#[update]
fn register_user_key(public_key: String, key_type: KeyType) -> Result<UserKey, String> {
    let caller = get_caller();
    let now = get_time();
    
    if public_key.is_empty() {
        return Err("Public key cannot be empty".to_string());
    }
    
    let user_key = UserKey {
        user_id: caller,
        public_key,
        key_type,
        created_at: now,
        is_active: true,
    };
    
    USER_KEYS.with(|keys| {
        keys.borrow_mut().insert(caller, StorableUserKey::from(user_key.clone()));
    });
    
    Ok(user_key)
}

// Get user's public key
#[query]
fn get_user_key(user_id: Principal) -> Option<UserKey> {
    USER_KEYS.with(|keys| {
        keys.borrow().get(&user_id).map(|storable| UserKey::from(storable))
    })
}

// Create a new conversation
#[update]
fn create_conversation(
    participants: Vec<Principal>,
    conversation_type: ConversationType,
    metadata: ConversationMetadata,
) -> ConversationResult {
    let caller = get_caller();
    let now = get_time();
    
    // Validate that caller is in participants
    if !participants.contains(&caller) {
        return ConversationResult {
            success: false,
            conversation: None,
            error: Some("Caller must be a participant".to_string()),
        };
    }
    
    // Validate participants count
    if participants.len() < 2 {
        return ConversationResult {
            success: false,
            conversation: None,
            error: Some("Conversation must have at least 2 participants".to_string()),
        };
    }
    
    let conversation_id = generate_conversation_id(&participants);
    
    // Check if conversation already exists
    let existing_conversation = CONVERSATIONS.with(|conversations| {
        conversations.borrow().get(&conversation_id)
    });
    
    if existing_conversation.is_some() {
        return ConversationResult {
            success: false,
            conversation: None,
            error: Some("Conversation already exists".to_string()),
        };
    }
    
    let conversation = Conversation {
        id: conversation_id.clone(),
        participants,
        conversation_type,
        created_at: now,
        updated_at: now,
        last_message_id: None,
        is_archived: false,
        metadata,
    };
    
    CONVERSATIONS.with(|conversations| {
        conversations.borrow_mut().insert(
            conversation_id,
            StorableConversation::from(conversation.clone()),
        );
    });
    
    ConversationResult {
        success: true,
        conversation: Some(conversation),
        error: None,
    }
}

// Send a message
#[update]
fn send_message(
    conversation_id: String,
    recipient_id: Principal,
    content: String,
    message_type: MessageType,
    reply_to: Option<u64>,
    attachments: Vec<Attachment>,
) -> MessageResult {
    let caller = get_caller();
    let now = get_time();
    
    // Validate conversation exists and caller is participant
    let conversation = CONVERSATIONS.with(|conversations| {
        conversations.borrow().get(&conversation_id)
    });
    
    let conversation = match conversation {
        Some(conv) => Conversation::from(conv),
        None => {
            return MessageResult {
                success: false,
                message: None,
                error: Some("Conversation not found".to_string()),
            };
        }
    };
    
    if !is_participant(&conversation, &caller) {
        return MessageResult {
            success: false,
            message: None,
            error: Some("Unauthorized: Not a participant in this conversation".to_string()),
        };
    }
    
    // Validate recipient is also a participant
    if !is_participant(&conversation, &recipient_id) {
        return MessageResult {
            success: false,
            message: None,
            error: Some("Recipient is not a participant in this conversation".to_string()),
        };
    }
    
    let message_id = generate_next_id();
    
    let message = Message {
        id: message_id,
        conversation_id: conversation_id.clone(),
        sender_id: caller,
        recipient_id,
        content,
        message_type,
        timestamp: now,
        is_read: false,
        is_deleted: false,
        reply_to,
        attachments,
    };
    
    // Store the message
    MESSAGES.with(|messages| {
        messages.borrow_mut().insert(message_id, StorableMessage::from(message.clone()));
    });
    
    // Update conversation's last message
    let updated_conversation = Conversation {
        last_message_id: Some(message_id),
        updated_at: now,
        ..conversation
    };
    
    CONVERSATIONS.with(|conversations| {
        conversations.borrow_mut().insert(
            conversation_id,
            StorableConversation::from(updated_conversation),
        );
    });
    
    MessageResult {
        success: true,
        message: Some(message),
        error: None,
    }
}

// Get messages for a conversation
#[query]
fn get_conversation_messages(
    conversation_id: String,
    limit: Option<u64>,
    offset: Option<u64>,
) -> Vec<Message> {
    let caller = get_caller();
    
    // Verify caller is participant in conversation
    let conversation = CONVERSATIONS.with(|conversations| {
        conversations.borrow().get(&conversation_id)
    });
    
    let conversation = match conversation {
        Some(conv) => Conversation::from(conv),
        None => return vec![],
    };
    
    if !is_participant(&conversation, &caller) {
        return vec![];
    }
    
    let limit = limit.unwrap_or(50).min(100); // Max 100 messages per query
    let offset = offset.unwrap_or(0);
    
    let mut messages = Vec::new();
    let mut count = 0;
    let mut skipped = 0;
    
    MESSAGES.with(|msg_store| {
        let messages_ref = msg_store.borrow();
        for (_, storable_message) in messages_ref.iter().rev() {
            let message = Message::from(storable_message);
            
            if message.conversation_id == conversation_id && !message.is_deleted {
                if skipped < offset {
                    skipped += 1;
                    continue;
                }
                
                messages.push(message);
                count += 1;
                
                if count >= limit {
                    break;
                }
            }
        }
    });
    
    messages
}

// Get user's conversations
#[query]
fn get_user_conversations() -> Vec<Conversation> {
    let caller = get_caller();
    let mut user_conversations = Vec::new();
    
    CONVERSATIONS.with(|conversations| {
        let conversations_ref = conversations.borrow();
        for (_, storable_conversation) in conversations_ref.iter() {
            let conversation = Conversation::from(storable_conversation);
            
            if is_participant(&conversation, &caller) && !conversation.is_archived {
                user_conversations.push(conversation);
            }
        }
    });
    
    // Sort by updated_at descending
    user_conversations.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
    
    user_conversations
}

// Mark message as read
#[update]
fn mark_message_read(message_id: u64) -> Result<(), String> {
    let caller = get_caller();
    
    MESSAGES.with(|messages| {
        let mut messages_ref = messages.borrow_mut();
        
        match messages_ref.get(&message_id) {
            Some(storable_message) => {
                let mut message = Message::from(storable_message);
                
                // Only recipient can mark message as read
                if message.recipient_id != caller {
                    return Err("Unauthorized: Only recipient can mark message as read".to_string());
                }
                
                message.is_read = true;
                messages_ref.insert(message_id, StorableMessage::from(message));
                Ok(())
            }
            None => Err("Message not found".to_string()),
        }
    })
}

// Delete message (soft delete)
#[update]
fn delete_message(message_id: u64) -> Result<(), String> {
    let caller = get_caller();
    
    MESSAGES.with(|messages| {
        let mut messages_ref = messages.borrow_mut();
        
        match messages_ref.get(&message_id) {
            Some(storable_message) => {
                let mut message = Message::from(storable_message);
                
                // Only sender can delete message
                if message.sender_id != caller {
                    return Err("Unauthorized: Only sender can delete message".to_string());
                }
                
                message.is_deleted = true;
                messages_ref.insert(message_id, StorableMessage::from(message));
                Ok(())
            }
            None => Err("Message not found".to_string()),
        }
    })
}

// Archive conversation
#[update]
fn archive_conversation(conversation_id: String) -> Result<(), String> {
    let caller = get_caller();
    
    CONVERSATIONS.with(|conversations| {
        let mut conversations_ref = conversations.borrow_mut();
        
        match conversations_ref.get(&conversation_id) {
            Some(storable_conversation) => {
                let mut conversation = Conversation::from(storable_conversation);
                
                if !is_participant(&conversation, &caller) {
                    return Err("Unauthorized: Not a participant in this conversation".to_string());
                }
                
                conversation.is_archived = true;
                conversation.updated_at = get_time();
                conversations_ref.insert(conversation_id, StorableConversation::from(conversation));
                Ok(())
            }
            None => Err("Conversation not found".to_string()),
        }
    })
}

// Health check
#[query]
fn health_check() -> String {
    "Secure Messaging Canister is healthy".to_string()
}

// Get canister stats
#[query]
fn get_stats() -> HashMap<String, u64> {
    let mut stats = HashMap::new();
    
    let message_count = MESSAGES.with(|messages| messages.borrow().len());
    let conversation_count = CONVERSATIONS.with(|conversations| conversations.borrow().len());
    let user_key_count = USER_KEYS.with(|keys| keys.borrow().len());
    
    stats.insert("total_messages".to_string(), message_count);
    stats.insert("total_conversations".to_string(), conversation_count);
    stats.insert("total_user_keys".to_string(), user_key_count);
    stats.insert("timestamp".to_string(), get_time());
    
    stats
}

// Export Candid interface
ic_cdk::export_candid!();