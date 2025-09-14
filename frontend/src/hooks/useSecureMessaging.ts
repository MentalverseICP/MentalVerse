import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { authService, SecureConversation, SecureMessage } from '@/services/backend';
import { MessageType } from '@/services/secureMessaging';
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
  sendMessage: (
    conversationId: string,
    recipient: Principal,
    content: string,
    messageType?: MessageType
  ) => Promise<void>;
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

  /** Initialize secure messaging */
  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      setIsInitialized(true);
      void loadConversations();
    } else if (!isAuthenticated) {
      // Reset state when logged out
      setConversations([]);
      setSelectedConversation(null);
      setMessages([]);
      setIsInitialized(false);
      setError(null);
    }
  }, [isAuthenticated, isInitialized]);

  /** Auto-load messages when conversation changes */
  useEffect(() => {
    if (selectedConversation && isInitialized) {
      void loadMessages(selectedConversation.id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation, isInitialized]);

  /** Clear error state */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /** Load user conversations */
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.getUserSecureConversations();
      if (result.ok) {
        setConversations(result.ok);

        if (result.ok.length > 0 && !selectedConversation) {
          setSelectedConversation(result.ok[0]);
        }
      } else {
        throw new Error(result.err || 'Failed to load conversations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, selectedConversation]);

  /** Load conversation messages */
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.getSecureConversationMessages(conversationId);
      if (result.ok) {
        setMessages(result.ok);
      } else {
        throw new Error(result.err || 'Failed to load messages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /** Send a secure message */
  const sendMessage = useCallback(async (
    conversationId: string,
    recipient: Principal,
    content: string,
    messageType: MessageType = { text: null }
  ) => {
    if (!isAuthenticated || !userPrincipal) return;

    try {
      setIsLoading(true);
      setError(null);

      // Map MessageType to string
      let msgTypeStr: 'Text' | 'Image' | 'File' | 'Audio' | 'Video' | 'System' = 'Text';
      if ('image' in messageType) msgTypeStr = 'Image';
      else if ('file' in messageType) msgTypeStr = 'File';
      else if ('audio' in messageType) msgTypeStr = 'Audio';
      else if ('video' in messageType) msgTypeStr = 'Video';
      else if ('system' in messageType) msgTypeStr = 'System';

      const result = await authService.sendSecureMessage(
        conversationId,
        recipient,
        content,
        { [msgTypeStr]: null }
      ) as { ok?: string; err?: string }; // explicitly type the response

      if (result.err) throw new Error(result.err);

      await loadMessages(conversationId);
      await loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Error sending message:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userPrincipal, loadMessages, loadConversations]);

  /** Create a new conversation */
  const createConversation = useCallback(async (
    participants: Principal[]
  ): Promise<SecureConversation | null> => {
    if (!isAuthenticated) return null;

    try {
      setIsLoading(true);
      setError(null);

      if (participants.length === 1) {
        const therapistId = participants[0].toText();
        const sessionId = `session-${Date.now()}`;

        const result = await authService.createTherapyConversation(
          therapistId, // ✅ pass string
          sessionId
        ) as { ok?: SecureConversation; err?: string };

        if (result.err) throw new Error(result.err);

        await loadConversations();

        const conversationsResult = await authService.getUserSecureConversations() as { ok?: SecureConversation[]; err?: string };
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

      throw new Error('Only therapy conversations are currently supported');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      console.error('Error creating conversation:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadConversations]);

  /** Select an active conversation */
  const selectConversation = useCallback((conversation: SecureConversation | null) => {
    setSelectedConversation(conversation);
    setError(null);
  }, []);

  /** Mark message as read (local only for now) */
  const markMessageAsRead = useCallback(async (messageId: string) => {
    if (!isAuthenticated) return;

    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  }, [isAuthenticated]);

  /** Refresh all data */
  const refreshConversations = useCallback(async () => {
    await loadConversations();
    if (selectedConversation) {
      await loadMessages(selectedConversation.id);
    }
  }, [loadConversations, loadMessages, selectedConversation]);

  return {
    conversations,
    selectedConversation,
    messages,
    isLoading,
    error,
    isInitialized,
    loadConversations,
    loadMessages,
    sendMessage,
    createConversation,
    selectConversation,
    markMessageAsRead,
    clearError,
    refreshConversations,
  };
};

export default useSecureMessaging;
