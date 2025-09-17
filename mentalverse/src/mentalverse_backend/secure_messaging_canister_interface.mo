import Principal "mo:base/Principal";
import Result "mo:base/Result";

module {
    // Message and Conversation Types (matching secure_messaging.did)
    public type MessageType = {
        #Text;
        #Image;
        #File;
        #Audio;
        #Video;
        #System;
    };

    public type ConversationType = {
        #DirectMessage;
        #GroupChat;
        #SessionChat;
    };

    public type KeyType = {
        #RSA2048;
        #ECDSA;
        #Ed25519;
    };

    public type Attachment = {
        id: Text;
        filename: Text;
        content_type: Text;
        size: Nat64;
        encrypted_data: Text;
    };

    public type ConversationMetadata = {
        title: ?Text;
        description: ?Text;
        session_id: ?Text;
        encryption_key_id: Text;
    };

    public type Message = {
        id: Nat64;
        conversation_id: Text;
        sender_id: Principal;
        recipient_id: Principal;
        content: Text;
        message_type: MessageType;
        timestamp: Nat64;
        is_read: Bool;
        is_deleted: Bool;
        reply_to: ?Nat64;
        attachments: [Attachment];
    };

    public type Conversation = {
        id: Text;
        participants: [Principal];
        conversation_type: ConversationType;
        created_at: Nat64;
        updated_at: Nat64;
        last_message_id: ?Nat64;
        is_archived: Bool;
        metadata: ConversationMetadata;
    };

    public type UserKey = {
        user_id: Principal;
        public_key: Text;
        key_type: KeyType;
        created_at: Nat64;
        is_active: Bool;
    };

    public type MessageResult = {
        success: Bool;
        message: ?Message;
        error: ?Text;
    };

    public type ConversationResult = {
        success: Bool;
        conversation: ?Conversation;
        error: ?Text;
    };

    public type Stats = [(Text, Nat64)];

    // Inter-canister communication interface for Secure Messaging Canister
    public type SecureMessagingCanisterInterface = actor {
        // User key management
        register_user_key : (Text, KeyType) -> async Result.Result<UserKey, Text>;
        get_user_key : (Principal) -> async ?UserKey;
        
        // Conversation management
        create_conversation : ([Principal], ConversationType, ConversationMetadata) -> async ConversationResult;
        get_user_conversations : () -> async [Conversation];
        archive_conversation : (Text) -> async Result.Result<(), Text>;
        
        // Message management
        send_message : (Text, Principal, Text, MessageType, ?Nat64, [Attachment]) -> async MessageResult;
        get_conversation_messages : (Text, ?Nat64, ?Nat64) -> async [Message];
        mark_message_read : (Nat64) -> async Result.Result<(), Text>;
        delete_message : (Nat64) -> async Result.Result<(), Text>;
        
        // Utility functions
        health_check : () -> async Text;
        get_stats : () -> async Stats;
    };

    // Helper function to get Secure Messaging Canister actor reference
    public func getSecureMessagingCanister(canister_id: Principal) : SecureMessagingCanisterInterface {
        actor(Principal.toText(canister_id)) : SecureMessagingCanisterInterface
    };
}