import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { authService, SecureConversation, SecureMessage } from '@/services/backend';
import { 
  ConversationType, 
  MessageType,
  ConversationMetadata
} from '@/services/secureMessaging';
import { Principal } from '@dfinity/principal';

interface UseSecureMessagingReturn {
  // State
  conversations: SecureConversation[];
  selectedConversation: SecureConversation | null;
  messages: SecureMessage[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, recipient: Principal, content: string, messageType?: MessageType) => Promise<void>;
  createConversation: (participants: Principal[]) => Promise<SecureConversation | null>;
  selectConversation: (conversation: SecureConversation | null) => void;
  markMessageAsRead: (messageId: string) => Promise<void>;
  clearError: () => void;
  refreshConversations: () => Promise<void>;
}

export const useSecureMessaging = (): UseSecureMessagingReturn => {
  const { isAuthenticated, userPrincipal } = useAuth();
  const [conversations, setConversations] = useState<SecureConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<SecureConversation | null>(null);
  const [messages, setMessages] = useState<SecureMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize secure messaging through backend
  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      setIsInitialized(true);
      loadConversations();
    } else if (!isAuthenticated) {
      // Reset state when user logs out
      setConversations([]);
      setSelectedConversation(null);
      setMessages([]);
      setIsInitialized(false);
      setError(null);
    }
  }, [isAuthenticated, isInitialized]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation && isInitialized) {
      loadMessages(selectedConversation.id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation, isInitialized]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated || !isInitialized) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Use backend's inter-canister communication
      const result = await authService.getUserSecureConversations();
      if (result.ok) {
        setConversations(result.ok);
        
        // Auto-select first conversation if none selected
        if (result.ok.length > 0 && !selectedConversation) {
          setSelectedConversation(result.ok[0]);
        }
      } else {
        throw new Error(result.err || 'Failed to load conversations');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(errorMessage);
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isInitialized, selectedConversation]);

  const loadMessages = useCallback(async (conversationId: string) => {
    if (!isAuthenticated || !isInitialized) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Use backend's inter-canister communication
      const result = await authService.getSecureConversationMessages(conversationId);
      if (result.ok) {
        setMessages(result.ok);
      } else {
        throw new Error(result.err || 'Failed to load messages');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isInitialized]);

  const sendMessage = useCallback(async (
    conversationId: string, 
    recipient: Principal, 
    content: string, 
    messageType: MessageType = { text: null }
  ) => {
    if (!isAuthenticated || !isInitialized || !userPrincipal) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Convert MessageType to string for backend
      let msgTypeStr: 'Text' | 'Image' | 'File' | 'Audio' | 'Video' | 'System' = 'Text';
      if ('image' in messageType) msgTypeStr = 'Image';
      else if ('file' in messageType) msgTypeStr = 'File';
      else if ('audio' in messageType) msgTypeStr = 'Audio';
      else if ('video' in messageType) msgTypeStr = 'Video';
      else if ('system' in messageType) msgTypeStr = 'System';

      // Use backend's inter-canister communication
      const result = await authService.sendSecureMessage(
        conversationId,
        recipient,
        content,
        { [msgTypeStr]: null }
      );
      
      if (result.err) {
        throw new Error(result.err);
      }

      // Refresh messages to get the latest state
      await loadMessages(conversationId);
      
      // Refresh conversations to update timestamps
      await loadConversations();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', err);
      throw err; // Re-throw to allow component to handle
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isInitialized, userPrincipal, loadMessages, loadConversations]);

  const createConversation = useCallback(async (
    participants: Principal[]
  ): Promise<SecureConversation | null> => {
    if (!isAuthenticated || !isInitialized) return null;

    try {
      setIsLoading(true);
      setError(null);
      
      // For therapy conversations, use the backend's createTherapyConversation method
      if (participants.length === 1) {
        const therapistId = participants[0].toString();
        const sessionId = `session-${Date.now()}`; // Generate a session ID
        
        const result = await authService.createTherapyConversation(participants[0], sessionId);
        
        if (result.err) {
          throw new Error(result.err);
        }
        
        // Refresh conversations to get the new one
        await loadConversations();
        
        // Find and select the newly created conversation
        const conversationsResult = await authService.getUserSecureConversations();
        if (conversationsResult.ok) {
          const newConversation = conversationsResult.ok.find(conv => 
            conv.participants.some(p => p.toString() === therapistId)
          );
          
          if (newConversation) {
            setSelectedConversation(newConversation);
            return newConversation;
          }
        }

      }
      
      // For other conversation types, we'd need additional backend methods
      throw new Error('Only therapy conversations are currently supported');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create conversation';
      setError(errorMessage);
      console.error('Error creating conversation:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isInitialized, loadConversations]);

  const selectConversation = useCallback((conversation: SecureConversation | null) => {
    setSelectedConversation(conversation);
    setError(null); // Clear any previous errors when switching conversations
  }, []);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    if (!isAuthenticated || !isInitialized) return;

    try {
      // Note: Backend doesn't currently have a markMessageAsRead method
      // For now, just update the local state
      // TODO: Add markMessageAsRead method to backend when needed
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isRead: true }
            : msg
        )
      );
      
    } catch (err) {
      console.error('Error marking message as read:', err);
      // Don't set error state for this operation as it's not critical
    }
  }, [isAuthenticated, isInitialized]);

  const refreshConversations = useCallback(async () => {
    await loadConversations();
    if (selectedConversation) {
      await loadMessages(selectedConversation.id);
    }
  }, [loadConversations, loadMessages, selectedConversation]);

  return {
    // State
    conversations,
    selectedConversation,
    messages,
    isLoading,
    error,
    isInitialized,

    // Actions
    loadConversations,
    loadMessages,
    sendMessage,
    createConversation,
    selectConversation,
    markMessageAsRead,
    clearError,
    refreshConversations
  };
};

export default useSecureMessaging;