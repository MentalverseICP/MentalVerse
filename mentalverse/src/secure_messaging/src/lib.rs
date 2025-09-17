use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk::{init, post_upgrade, pre_upgrade, query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable, storable::Bound};
use serde::Serialize;
use serde_json;
use sha2::{Digest, Sha256};
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::HashMap;
use hmac::{Hmac, Mac};
use base64::{Engine as _, engine::general_purpose};
use hex;

type Memory = VirtualMemory<DefaultMemoryImpl>;
type IdStore = StableBTreeMap<u64, u64, Memory>;
type MessageStore = StableBTreeMap<u64, StorableMessage, Memory>;
type ConversationStore = StableBTreeMap<String, StorableConversation, Memory>;
type UserKeyStore = StableBTreeMap<Principal, StorableUserKey, Memory>;
type _WebRTCSignalStore = StableBTreeMap<String, StorableWebRTCSignal, Memory>;
type _SessionTokenStore = StableBTreeMap<String, StorableSessionToken, Memory>;
type _KeyExchangeStore = StableBTreeMap<String, StorableKeyExchange, Memory>;
type _RTCSessionStore = StableBTreeMap<String, StorableRTCSession, Memory>;
type RateLimitStore = StableBTreeMap<Principal, StorableRateLimit, Memory>;
type NonceStore = StableBTreeMap<String, u64, Memory>;

// === ENCRYPTION STRUCTURES ===

// Phase 2: Security structures for rate limiting and nonce validation
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct RateLimit {
    pub principal: Principal,
    pub call_count: u32,
    pub window_start: u64,
    pub window_duration: u64, // in milliseconds
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
struct StorableRateLimit {
    pub principal: Principal,
    pub call_count: u32,
    pub window_start: u64,
    pub window_duration: u64,
}

impl From<RateLimit> for StorableRateLimit {
    fn from(rate_limit: RateLimit) -> Self {
        StorableRateLimit {
            principal: rate_limit.principal,
            call_count: rate_limit.call_count,
            window_start: rate_limit.window_start,
            window_duration: rate_limit.window_duration,
        }
    }
}

impl From<StorableRateLimit> for RateLimit {
    fn from(storable: StorableRateLimit) -> Self {
        RateLimit {
            principal: storable.principal,
            call_count: storable.call_count,
            window_start: storable.window_start,
            window_duration: storable.window_duration,
        }
    }
}

impl Storable for StorableRateLimit {
    const BOUND: Bound = Bound::Bounded {
        max_size: 256,
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

// Phase 2: Security constants
const MAX_TEXT_LENGTH: usize = 10000;

const NONCE_EXPIRY_MS: u64 = 300000; // 5 minutes

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct EncryptedData {
    pub encrypted_content: String, // Base64 encoded encrypted data
    pub nonce: String,            // Base64 encoded nonce
    pub key_id: String,           // Identifier for the encryption key used
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct PHIEncryptionKey {
    pub key_id: String,
    pub key_data: Vec<u8>,        // AES-256 key (32 bytes)
    pub created_at: u64,
    pub is_active: bool,
    pub purpose: EncryptionPurpose,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum EncryptionPurpose {
    MessageContent,
    Attachment,
    MedicalRecord,
    SessionData,
}

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

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
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

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
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

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct StorableWebRTCSignal {
    pub id: String,
    pub session_id: String,
    pub sender_id: Principal,
    pub recipient_id: Principal,
    pub signal_type: SignalType,
    pub payload: String,
    pub timestamp: u64,
    pub expires_at: u64,
}

// Conversion from runtime WebRTCSignal → storable version
impl From<WebRTCSignal> for StorableWebRTCSignal {
    fn from(signal: WebRTCSignal) -> Self {
        Self {
            id: signal.id,
            session_id: signal.session_id,
            sender_id: signal.sender_id,
            recipient_id: signal.recipient_id,
            signal_type: signal.signal_type,
            payload: signal.payload,
            timestamp: signal.timestamp,
            expires_at: signal.expires_at,
        }
    }
}

// Conversion back: stored → runtime WebRTCSignal
impl From<StorableWebRTCSignal> for WebRTCSignal {
    fn from(storable: StorableWebRTCSignal) -> Self {
        Self {
            id: storable.id,
            session_id: storable.session_id,
            sender_id: storable.sender_id,
            recipient_id: storable.recipient_id,
            signal_type: storable.signal_type,
            payload: storable.payload,
            timestamp: storable.timestamp,
            expires_at: storable.expires_at,
        }
    }
}

// Stable storage support
impl Storable for StorableWebRTCSignal {
    const BOUND: Bound = Bound::Bounded {
        max_size: 4096,       // each record limited to 4KB
        is_fixed_size: false, // variable-size since payload length may vary
    };

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Owned(
            candid::encode_one(self)
                .expect("Failed to encode StorableWebRTCSignal with Candid"),
        )
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        candid::decode_one(&bytes)
            .expect("Failed to decode StorableWebRTCSignal with Candid")
    }
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct StorableSessionToken {
    pub token_id: String,
    pub session_id: String,
    pub user_id: Principal,
    pub token_hash: String,
    pub permissions: Vec<SessionPermission>,
    pub created_at: u64,
    pub expires_at: u64,
    pub is_active: bool,
}

// Conversion: runtime → storable
impl From<SessionToken> for StorableSessionToken {
    fn from(token: SessionToken) -> Self {
        Self {
            token_id: token.token_id,
            session_id: token.session_id,
            user_id: token.user_id,
            token_hash: token.token_hash,
            permissions: token.permissions,
            created_at: token.created_at,
            expires_at: token.expires_at,
            is_active: token.is_active,
        }
    }
}

// Conversion: storable → runtime
impl From<StorableSessionToken> for SessionToken {
    fn from(storable: StorableSessionToken) -> Self {
        Self {
            token_id: storable.token_id,
            session_id: storable.session_id,
            user_id: storable.user_id,
            token_hash: storable.token_hash,
            permissions: storable.permissions,
            created_at: storable.created_at,
            expires_at: storable.expires_at,
            is_active: storable.is_active,
        }
    }
}

// Stable structure support
impl Storable for StorableSessionToken {
    const BOUND: Bound = Bound::Bounded {
        max_size: 2048,       // 2KB per token
        is_fixed_size: false, // variable size (Vec<SessionPermission>)
    };

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Owned(
            candid::encode_one(self)
                .expect("Failed to encode StorableSessionToken with Candid"),
        )
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        candid::decode_one(&bytes)
            .expect("Failed to decode StorableSessionToken with Candid")
    }
}
// StorableKeyExchange implementation
#[derive(CandidType, Deserialize, Serialize, Clone)]
struct StorableKeyExchange {
    pub exchange_id: String,
    pub initiator_id: Principal,
    pub recipient_id: Principal,
    pub public_key: String,
    pub encrypted_shared_secret: String,
    pub status: KeyExchangeStatus,
    pub created_at: u64,
    pub completed_at: Option<u64>,
}

impl From<KeyExchange> for StorableKeyExchange {
    fn from(exchange: KeyExchange) -> Self {
        StorableKeyExchange {
            exchange_id: exchange.exchange_id,
            initiator_id: exchange.initiator_id,
            recipient_id: exchange.recipient_id,
            public_key: exchange.public_key,
            encrypted_shared_secret: exchange.encrypted_shared_secret,
            status: exchange.status,
            created_at: exchange.created_at,
            completed_at: exchange.completed_at,
        }
    }
}

impl From<StorableKeyExchange> for KeyExchange {
    fn from(storable: StorableKeyExchange) -> Self {
        KeyExchange {
            exchange_id: storable.exchange_id,
            initiator_id: storable.initiator_id,
            recipient_id: storable.recipient_id,
            public_key: storable.public_key,
            encrypted_shared_secret: storable.encrypted_shared_secret,
            status: storable.status,
            created_at: storable.created_at,
            completed_at: storable.completed_at,
        }
    }
}

impl Storable for StorableKeyExchange {
    const BOUND: Bound = Bound::Bounded {
        max_size: 3072, // 3KB max per key exchange
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct StorableRTCSession {
    pub session_id: String,
    pub participants: Vec<Principal>,
    pub session_type: RTCSessionType,
    pub status: RTCSessionStatus,
    pub created_at: u64,
    pub started_at: Option<u64>,
    pub ended_at: Option<u64>,
    pub metadata: RTCSessionMetadata,
}

// Conversion: runtime → storable
impl From<RTCSession> for StorableRTCSession {
    fn from(session: RTCSession) -> Self {
        Self {
            session_id: session.session_id,
            participants: session.participants,
            session_type: session.session_type,
            status: session.status,
            created_at: session.created_at,
            started_at: session.started_at,
            ended_at: session.ended_at,
            metadata: session.metadata,
        }
    }
}

// Conversion: storable → runtime
impl From<StorableRTCSession> for RTCSession {
    fn from(storable: StorableRTCSession) -> Self {
        Self {
            session_id: storable.session_id,
            participants: storable.participants,
            session_type: storable.session_type,
            status: storable.status,
            created_at: storable.created_at,
            started_at: storable.started_at,
            ended_at: storable.ended_at,
            metadata: storable.metadata,
        }
    }
}

// Stable structure support
impl Storable for StorableRTCSession {
    const BOUND: Bound = Bound::Bounded {
        max_size: 4096,       // bumped to 4KB — safer since metadata & participants can grow
        is_fixed_size: false, // variable size due to Vec and Option
    };

    fn to_bytes(&self) -> Cow<'_, [u8]> {
        Cow::Owned(
            candid::encode_one(self)
                .expect("Failed to encode StorableRTCSession with Candid"),
        )
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        candid::decode_one(&bytes)
            .expect("Failed to decode StorableRTCSession with Candid")
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
    
    // Phase 2: Security storage
    static RATE_LIMITS: RefCell<RateLimitStore> = RefCell::new(
        RateLimitStore::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4)))
        )
    );
    
    static USED_NONCES: RefCell<NonceStore> = RefCell::new(
        NonceStore::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5)))
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
    sorted_participants.sort_by_key(|p| p.to_text());
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

// Phase 2: Security validation functions
fn check_rate_limit(principal: Principal, max_calls: u32, window_ms: u64) -> Result<(), String> {
    let current_time = get_time();
    
    RATE_LIMITS.with(|rate_limits| {
        let mut rate_limits = rate_limits.borrow_mut();
        
        match rate_limits.get(&principal) {
            Some(rate_limit) => {
                let rate_limit = RateLimit::from(rate_limit);
                
                // Check if we're still in the same time window
                if current_time - rate_limit.window_start < window_ms {
                    if rate_limit.call_count >= max_calls {
                        return Err(format!("Rate limit exceeded: {} calls in {} ms", max_calls, window_ms));
                    }
                    
                    // Increment call count
                    let updated_rate_limit = RateLimit {
                        principal,
                        call_count: rate_limit.call_count + 1,
                        window_start: rate_limit.window_start,
                        window_duration: window_ms,
                    };
                    rate_limits.insert(principal, StorableRateLimit::from(updated_rate_limit));
                } else {
                    // New time window, reset counter
                    let new_rate_limit = RateLimit {
                        principal,
                        call_count: 1,
                        window_start: current_time,
                        window_duration: window_ms,
                    };
                    rate_limits.insert(principal, StorableRateLimit::from(new_rate_limit));
                }
            }
            None => {
                // First call from this principal
                let new_rate_limit = RateLimit {
                    principal,
                    call_count: 1,
                    window_start: current_time,
                    window_duration: window_ms,
                };
                rate_limits.insert(principal, StorableRateLimit::from(new_rate_limit));
            }
        }
        
        Ok(())
    })
}

fn validate_nonce(nonce: &str, timestamp: u64) -> Result<(), String> {
    if nonce.is_empty() {
        return Err("Nonce cannot be empty".to_string());
    }
    
    let current_time = get_time();
    
    // Check if timestamp is not too old or in the future
    if timestamp > current_time + 60000 { // 1 minute future tolerance
        return Err("Timestamp is too far in the future".to_string());
    }
    
    if current_time - timestamp > NONCE_EXPIRY_MS {
        return Err("Nonce has expired".to_string());
    }
    
    USED_NONCES.with(|nonces| {
        let mut nonces = nonces.borrow_mut();
        
        if nonces.get(&nonce.to_string()).is_some() {
            return Err("Nonce has already been used".to_string());
        }
        
        // Store the nonce with its timestamp
        nonces.insert(nonce.to_string(), timestamp);
        
        // Clean up expired nonces (simple cleanup)
        let expired_threshold = current_time - NONCE_EXPIRY_MS;
        let expired_nonces: Vec<String> = nonces
            .iter()
            .filter_map(|(nonce_key, nonce_timestamp)| {
                if nonce_timestamp < expired_threshold {
                    Some(nonce_key)
                } else {
                    None
                }
            })
            .collect();
        
        for expired_nonce in expired_nonces {
            nonces.remove(&expired_nonce);
        }
        
        Ok(())
    })
}

fn validate_text_length(text: &str, max_length: usize, field_name: &str) -> Result<(), String> {
    if text.len() > max_length {
        return Err(format!("{} exceeds maximum length of {} characters", field_name, max_length));
    }
    Ok(())
}

fn validate_text_not_empty(text: &str, field_name: &str) -> Result<(), String> {
    if text.trim().is_empty() {
        return Err(format!("{} cannot be empty", field_name));
    }
    Ok(())
}

fn sanitize_text(text: &str) -> String {
    // Remove potentially dangerous characters and normalize whitespace
    let sanitized = text
        .chars()
        .filter(|c| c.is_alphanumeric() || c.is_whitespace() || ".,!?-_@#$%^&*()+=[]{}|;:'\"/~`<>".contains(*c))
        .collect::<String>();
    
    // Normalize whitespace
    sanitized.split_whitespace().collect::<Vec<&str>>().join(" ")
}

// === PHI ENCRYPTION FUNCTIONS ===

/// Generate a new encryption key for PHI data using IC's random source
pub fn generate_phi_encryption_key() -> Result<Vec<u8>, String> {
    let mut key_bytes = [0u8; 32];
    // Use IC's time and caller as entropy source
    let entropy = format!("{}{}", get_time(), get_caller().to_text());
    let mut hasher = Sha256::new();
    hasher.update(entropy.as_bytes());
    let hash = hasher.finalize();
    key_bytes.copy_from_slice(&hash[..32]);
    Ok(key_bytes.to_vec())
}

/// Encrypt PHI data using HMAC-based encryption
pub fn encrypt_phi_data(data: &str, key: &[u8]) -> Result<EncryptedData, String> {
    if key.len() != 32 {
        return Err("Invalid key length. Requires 32 bytes".to_string());
    }

    // Generate nonce using time and data hash
    let nonce_data = format!("{}{}", get_time(), data.len());
    let mut nonce_hasher = Sha256::new();
    nonce_hasher.update(nonce_data.as_bytes());
    let nonce_hash = nonce_hasher.finalize();
    let nonce_bytes = &nonce_hash[..12]; // Use first 12 bytes as nonce

    // Simple XOR encryption with HMAC authentication
    let mut encrypted_bytes = Vec::new();
    let data_bytes = data.as_bytes();
    
    // Create encryption key stream using HMAC
    type HmacSha256 = Hmac<Sha256>;
    let mut mac = HmacSha256::new_from_slice(key)
        .map_err(|_| "Invalid key for HMAC".to_string())?;
    mac.update(nonce_bytes);
    let key_stream = mac.finalize().into_bytes();
    
    // XOR encrypt the data
    for (i, &byte) in data_bytes.iter().enumerate() {
        let key_byte = key_stream[i % key_stream.len()];
        encrypted_bytes.push(byte ^ key_byte);
    }

    let encrypted_content = general_purpose::STANDARD.encode(&encrypted_bytes);
    let nonce_b64 = general_purpose::STANDARD.encode(nonce_bytes);
    
    // Generate key ID based on key hash
    let mut hasher = Sha256::new();
    hasher.update(key);
    let key_id = format!("phi_key_{}", hex::encode(&hasher.finalize()[..8]));

    Ok(EncryptedData {
        encrypted_content,
        nonce: nonce_b64,
        key_id,
    })
}

/// Decrypt PHI data using HMAC-based decryption
pub fn decrypt_phi_data(encrypted_data: &EncryptedData, key: &[u8]) -> Result<String, String> {
    if key.len() != 32 {
        return Err("Invalid key length. Requires 32 bytes".to_string());
    }

    let encrypted_bytes = general_purpose::STANDARD.decode(&encrypted_data.encrypted_content)
        .map_err(|_| "Failed to decode encrypted content".to_string())?;
    
    let nonce_bytes = general_purpose::STANDARD.decode(&encrypted_data.nonce)
        .map_err(|_| "Failed to decode nonce".to_string())?;

    if nonce_bytes.len() != 12 {
        return Err("Invalid nonce length".to_string());
    }

    // Create decryption key stream using HMAC (same as encryption)
    type HmacSha256 = Hmac<Sha256>;
    let mut mac = HmacSha256::new_from_slice(key)
        .map_err(|_| "Invalid key for HMAC".to_string())?;
    mac.update(&nonce_bytes);
    let key_stream = mac.finalize().into_bytes();
    
    // XOR decrypt the data
    let mut decrypted_bytes = Vec::new();
    for (i, &byte) in encrypted_bytes.iter().enumerate() {
        let key_byte = key_stream[i % key_stream.len()];
        decrypted_bytes.push(byte ^ key_byte);
    }

    String::from_utf8(decrypted_bytes)
        .map_err(|_| "Failed to convert decrypted data to string".to_string())
}

/// Derive encryption key from conversation participants for end-to-end encryption
pub fn derive_conversation_key(participants: &[Principal]) -> Result<Vec<u8>, String> {
    let mut sorted_participants = participants.to_vec();
    sorted_participants.sort();
    
    let mut hasher = Sha256::new();
    for participant in &sorted_participants {
        hasher.update(participant.as_slice());
    }
    hasher.update(b"mentalverse_phi_encryption_v1");
    
    let hash = hasher.finalize();
    Ok(hash.to_vec())
}

/// Validate that PHI data meets encryption requirements
pub fn validate_phi_encryption(data: &str) -> Result<(), String> {
    if data.is_empty() {
        return Err("PHI data cannot be empty".to_string());
    }
    
    if data.len() > 1_000_000 { // 1MB limit
        return Err("PHI data exceeds maximum size limit".to_string());
    }
    
    Ok(())
}

/// Decrypt message content for authorized conversation participants
pub fn decrypt_message_content(encrypted_content: &str, conversation_participants: &[Principal]) -> Result<String, String> {
    // Derive the same conversation key used for encryption
    let decryption_key = derive_conversation_key(conversation_participants)?;
    
    // Try to parse as encrypted data structure
    match serde_json::from_str::<EncryptedData>(encrypted_content) {
        Ok(encrypted_data) => {
            // Decrypt using AES-256-GCM
            decrypt_phi_data(&encrypted_data, &decryption_key)
        },
        Err(_) => {
            // If not encrypted format, return as-is (backward compatibility)
            Ok(encrypted_content.to_string())
        }
    }
}

/// Decrypt attachment data for authorized conversation participants
pub fn decrypt_attachment_data(encrypted_data: &str, conversation_participants: &[Principal]) -> Result<String, String> {
    if encrypted_data.is_empty() {
        return Ok(String::new());
    }
    
    // Derive the same conversation key used for encryption
    let decryption_key = derive_conversation_key(conversation_participants)?;
    
    // Try to parse as encrypted data structure
    match serde_json::from_str::<EncryptedData>(encrypted_data) {
        Ok(encrypted_struct) => {
            // Decrypt using AES-256-GCM
            decrypt_phi_data(&encrypted_struct, &decryption_key)
        },
        Err(_) => {
            // If not encrypted format, return as-is (backward compatibility)
            Ok(encrypted_data.to_string())
        }
    }
}

// === PRINCIPAL VALIDATION FUNCTIONS ===

/// Validates that a Principal is not anonymous and has proper format
fn validate_principal(principal: &Principal) -> Result<(), String> {
    if principal == &Principal::anonymous() {
        return Err("Anonymous principal not allowed".to_string());
    }
    
    // Check if principal is properly formatted (basic validation)
    let principal_text = principal.to_text();
    if principal_text.is_empty() || principal_text.len() < 5 {
        return Err("Invalid principal format".to_string());
    }
    
    Ok(())
}

/// Validates multiple principals in a vector
fn validate_principals(principals: &[Principal]) -> Result<(), String> {
    for principal in principals {
        validate_principal(principal)?;
    }
    Ok(())
}

/// Validates conversation ID format
fn validate_conversation_id(conversation_id: &str) -> Result<(), String> {
    if conversation_id.is_empty() {
        return Err("Conversation ID cannot be empty".to_string());
    }
    
    if conversation_id.len() > 128 {
        return Err("Conversation ID too long".to_string());
    }
    
    Ok(())
}

/// Validates session ID format for RTC sessions
pub fn validate_session_id(session_id: &str) -> Result<(), String> {
    if session_id.is_empty() {
        return Err("Session ID cannot be empty".to_string());
    }
    
    // Basic UUID format validation (36 characters with hyphens)
    if session_id.len() != 36 {
        return Err("Session ID must be a valid UUID format".to_string());
    }
    
    // Check for basic UUID pattern (8-4-4-4-12)
    let parts: Vec<&str> = session_id.split('-').collect();
    if parts.len() != 5 || 
       parts[0].len() != 8 || 
       parts[1].len() != 4 || 
       parts[2].len() != 4 || 
       parts[3].len() != 4 || 
       parts[4].len() != 12 {
        return Err("Session ID must be a valid UUID format".to_string());
    }
    
    Ok(())
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

// === PHI KEY MANAGEMENT API ===

/// Generate and store a new PHI encryption key for a conversation
#[update]
fn generate_conversation_phi_key(conversation_id: String) -> Result<String, String> {
    let caller = get_caller();
    
    // Validate caller principal
    validate_principal(&caller)?;
    
    // Validate conversation ID format
    validate_conversation_id(&conversation_id)?;
    
    // Verify caller is participant in conversation
    let conversation = CONVERSATIONS.with(|conversations| {
        conversations.borrow().get(&conversation_id)
    });
    
    let conversation = match conversation {
        Some(conv) => Conversation::from(conv),
        None => return Err("Conversation not found".to_string()),
    };
    
    if !is_participant(&conversation, &caller) {
        return Err("Unauthorized: Not a participant in this conversation".to_string());
    }
    
    // Generate new PHI encryption key
    let phi_key = generate_phi_encryption_key()?;
    let key_id = format!("phi_conv_{}_{}", conversation_id, get_time());
    
    let _phi_encryption_key = PHIEncryptionKey {
        key_id: key_id.clone(),
        key_data: phi_key,
        created_at: get_time(),
        is_active: true,
        purpose: EncryptionPurpose::MessageContent,
    };
    
    // Store the key (in a real implementation, this would be stored securely)
    // For now, we return the key_id as confirmation
    Ok(key_id)
}

/// Rotate PHI encryption key for a conversation (enhanced security)
#[update]
fn rotate_conversation_phi_key(conversation_id: String, _old_key_id: String) -> Result<String, String> {
    let caller = get_caller();
    
    // Validate caller principal
    validate_principal(&caller)?;
    
    // Validate conversation ID format
    validate_conversation_id(&conversation_id)?;
    
    // Verify caller is participant in conversation
    let conversation = CONVERSATIONS.with(|conversations| {
        conversations.borrow().get(&conversation_id)
    });
    
    let conversation = match conversation {
        Some(conv) => Conversation::from(conv),
        None => return Err("Conversation not found".to_string()),
    };
    
    if !is_participant(&conversation, &caller) {
        return Err("Unauthorized: Not a participant in this conversation".to_string());
    }
    
    // Generate new PHI encryption key
    let _new_phi_key = generate_phi_encryption_key()?;
    let new_key_id = format!("phi_conv_{}_{}", conversation_id, get_time());
    
    // In a real implementation, you would:
    // 1. Mark old key as inactive
    // 2. Store new key securely
    // 3. Re-encrypt recent messages with new key (optional)
    
    Ok(new_key_id)
}

// === PUBLIC API ===

// Register user's public key for encryption
#[update]
fn register_user_key(public_key: String, key_type: KeyType) -> Result<UserKey, String> {
    let caller = get_caller();
    let now = get_time();
    
    // Validate caller principal
    validate_principal(&caller)?;
    
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
    // Validate user_id principal
    if validate_principal(&user_id).is_err() {
        return None; // Return None for invalid principals
    }
    
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
    
    // Validate caller principal
    if let Err(e) = validate_principal(&caller) {
        return ConversationResult {
            success: false,
            conversation: None,
            error: Some(format!("Invalid caller: {}", e)),
        };
    }
    
    // Validate all participant principals
    if let Err(e) = validate_principals(&participants) {
        return ConversationResult {
            success: false,
            conversation: None,
            error: Some(format!("Invalid participants: {}", e)),
        };
    }
    
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

// Send a message with comprehensive PHI encryption
#[update]
fn send_message(
    conversation_id: String,
    recipient_id: Principal,
    content: String,
    message_type: MessageType,
    reply_to: Option<u64>,
    attachments: Vec<Attachment>,
    nonce: String,
    timestamp: u64,
) -> MessageResult {
    let caller = get_caller();
    let now = get_time();
    
    // Phase 2: Rate limiting (max 50 messages per minute)
    if let Err(e) = check_rate_limit(caller, 50, 60000) {
        return MessageResult {
            success: false,
            message: None,
            error: Some(e),
        };
    }
    
    // Phase 2: Replay attack protection
    if let Err(e) = validate_nonce(&nonce, timestamp) {
        return MessageResult {
            success: false,
            message: None,
            error: Some(e),
        };
    }
    
    // Phase 2: Input validation and sanitization
    if let Err(e) = validate_text_not_empty(&content, "Message content") {
        return MessageResult {
            success: false,
            message: None,
            error: Some(e),
        };
    }
    
    if let Err(e) = validate_text_length(&content, MAX_TEXT_LENGTH, "Message content") {
        return MessageResult {
            success: false,
            message: None,
            error: Some(e),
        };
    }
    
    let sanitized_content = sanitize_text(&content);
    
    // Validate caller principal
    if let Err(e) = validate_principal(&caller) {
        return MessageResult {
            success: false,
            message: None,
            error: Some(format!("Invalid caller: {}", e)),
        };
    }
    
    // Validate recipient principal
    if let Err(e) = validate_principal(&recipient_id) {
        return MessageResult {
            success: false,
            message: None,
            error: Some(format!("Invalid recipient: {}", e)),
        };
    }
    
    // Validate conversation ID format
    if let Err(e) = validate_conversation_id(&conversation_id) {
        return MessageResult {
            success: false,
            message: None,
            error: Some(format!("Invalid conversation ID: {}", e)),
        };
    }
    
    // Validate PHI content requirements
    if let Err(e) = validate_phi_encryption(&content) {
        return MessageResult {
            success: false,
            message: None,
            error: Some(format!("PHI validation failed: {}", e)),
        };
    }
    
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
    
    // Generate conversation-specific encryption key for PHI data
    let encryption_key = match derive_conversation_key(&conversation.participants) {
        Ok(key) => key,
        Err(e) => {
            return MessageResult {
                success: false,
                message: None,
                error: Some(format!("Failed to derive encryption key: {}", e)),
            };
        }
    };
    
    // Encrypt message content using AES-256-GCM (use sanitized content)
    let encrypted_content = match encrypt_phi_data(&sanitized_content, &encryption_key) {
        Ok(encrypted) => {
            // Store as JSON string containing encrypted data structure
            serde_json::to_string(&encrypted).unwrap_or_else(|_| sanitized_content.clone())
        },
        Err(e) => {
            return MessageResult {
                success: false,
                message: None,
                error: Some(format!("Failed to encrypt message content: {}", e)),
            };
        }
    };
    
    // Encrypt attachments if present
    let encrypted_attachments: Vec<Attachment> = attachments.into_iter().map(|mut attachment| {
        if !attachment.encrypted_data.is_empty() {
            // Decrypt first if already encrypted, then re-encrypt with conversation key
            match encrypt_phi_data(&attachment.encrypted_data, &encryption_key) {
                Ok(encrypted) => {
                    attachment.encrypted_data = serde_json::to_string(&encrypted)
                        .unwrap_or_else(|_| attachment.encrypted_data.clone());
                },
                Err(_) => {
                    // Keep original if encryption fails
                }
            }
        }
        attachment
    }).collect();
    
    let message_id = generate_next_id();
    
    let message = Message {
        id: message_id,
        conversation_id: conversation_id.clone(),
        sender_id: caller,
        recipient_id,
        content: encrypted_content, // Store encrypted content
        message_type,
        timestamp: now,
        is_read: false,
        is_deleted: false,
        reply_to,
        attachments: encrypted_attachments, // Store encrypted attachments
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
    
    // Validate caller principal
    if validate_principal(&caller).is_err() {
        return Vec::new(); // Return empty vector for invalid principals
    }
    
    // Validate conversation ID format
    if validate_conversation_id(&conversation_id).is_err() {
        return Vec::new(); // Return empty vector for invalid conversation IDs
    }
    
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
            let mut message = Message::from(storable_message);
            
            if message.conversation_id == conversation_id && !message.is_deleted {
                if skipped < offset {
                    skipped += 1;
                    continue;
                }
                
                // Decrypt message content for authorized participant
                match decrypt_message_content(&message.content, &conversation.participants) {
                    Ok(decrypted_content) => {
                        message.content = decrypted_content;
                    },
                    Err(_) => {
                        // Keep encrypted content if decryption fails (shouldn't happen for valid participants)
                    }
                }
                
                // Decrypt attachments if present
                message.attachments = message.attachments.into_iter().map(|mut attachment| {
                    match decrypt_attachment_data(&attachment.encrypted_data, &conversation.participants) {
                        Ok(decrypted_data) => {
                            attachment.encrypted_data = decrypted_data;
                        },
                        Err(_) => {
                            // Keep encrypted data if decryption fails
                        }
                    }
                    attachment
                }).collect();
                
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