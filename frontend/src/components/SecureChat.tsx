import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/Separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical, 
  Search,
  ArrowLeft,
  Shield,
  Lock,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSecureMessaging } from '@/hooks/useSecureMessaging';
import { SecureMessage } from '@/services/backend';
import { Principal } from '@dfinity/principal';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

interface SecureChatProps {
  className?: string;
}

interface ChatUser {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isOnline: boolean;
}

const SecureChat: React.FC<SecureChatProps> = ({ className }) => {
  const { isAuthenticated, userPrincipal } = useAuth();
  const { theme } = useTheme();
  const {
    conversations,
    selectedConversation,
    messages,
    isLoading,
    error,
    sendMessage: sendSecureMessage,
    createConversation,
    selectConversation,
    clearError
  } = useSecureMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock users data - in real app, this would come from backend
  const [users] = useState<ChatUser[]>([
    {
      id: 'dr-ibrahim',
      name: 'Dr. Ibrahim Yekeni',
      role: 'Family Doctor',
      avatar: 'IY',
      isOnline: true
    },
    {
      id: 'dr-sarah',
      name: 'Dr. Sarah Johnson',
      role: 'Pediatrician',
      avatar: 'SJ',
      isOnline: false
    },
    {
      id: 'dr-michael',
      name: 'Dr. Michael Chen',
      role: 'Dermatologist',
      avatar: 'MC',
      isOnline: true
    }
  ]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !userPrincipal) return;

    try {
      // Find recipient (other participant in conversation)
      const recipient = selectedConversation.participants.find(
        p => p.toString() !== userPrincipal.toString()
      );
      
      if (!recipient) {
        throw new Error('No recipient found');
      }

      // Send through backend's inter-canister communication
      await sendSecureMessage(
        selectedConversation.id,
        recipient,
        newMessage,
        { text: null }
      );
      
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      // Error is already handled by the hook
    }
  };

  const createNewConversation = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const participant = Principal.fromText(userId); // In real app, convert user ID to Principal
      await createConversation([participant]);
    } catch (err) {
      console.error('Error creating conversation:', err);
      // Error is already handled by the hook
    }
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessageStatus = (message: SecureMessage) => {
    // For now, show all messages as delivered since we don't have read status
    return <CheckCircle className="w-3 h-3 text-blue-500" />;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <Card className={cn('w-full h-full', className)}>
        <CardContent className="flex items-center justify-center h-full">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to access secure messaging.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('flex h-full bg-background', className)}>
      {/* Conversations Sidebar */}
      <div className={cn(
        'w-80 border-r border-border flex flex-col',
        isMobileView && selectedConversation ? 'hidden' : 'flex'
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Secure Messages
            </h2>
            <Badge variant="secondary" className="text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Encrypted
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {error && (
            <Alert className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearError}
                  className="ml-2 h-auto p-1"
                >
                  ×
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {filteredConversations.map((conversation) => {
            const lastMessage = messages.find(m => m.conversationId === conversation.id);
            const unreadCount = messages.filter(
              m => m.conversationId === conversation.id && 
              m.senderId.toString() !== userPrincipal?.toString()
            ).length;

            return (
              <div
                key={conversation.id}
                onClick={() => selectConversation(conversation)}
                className={cn(
                  'p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors',
                  selectedConversation?.id === conversation.id && 'bg-muted'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {conversation.id.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">Conversation {conversation.id.slice(0, 8)}</h3>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMessage?.content || 'No messages yet'}
                    </p>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="mt-1 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredConversations.length === 0 && !isLoading && (
            <div className="p-8 text-center text-muted-foreground">
              <p>No conversations found.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => createNewConversation(users[0]?.id)}
              >
                Start New Chat
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectConversation(null)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {selectedConversation.id.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium">Conversation {selectedConversation.id.slice(0, 8)}</h3>
                  <p className="text-sm text-muted-foreground">
                    End-to-end encrypted
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isOwnMessage = message.senderId.toString() === userPrincipal?.toString();
                  const showDate = index === 0 || 
                    formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

                  return (
                    <div key={message.id.toString()}>
                      {showDate && (
                        <div className="text-center text-xs text-muted-foreground my-4">
                          {formatDate(message.timestamp)}
                        </div>
                      )}
                      <div className={cn(
                        'flex gap-3',
                        isOwnMessage ? 'justify-end' : 'justify-start'
                      )}>
                        {!isOwnMessage && (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            {selectedConversation.id.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className={cn(
                          'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                          isOwnMessage 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        )}>
                          <p className="text-sm">{message.content}</p>
                          <div className={cn(
                            'flex items-center justify-between mt-1 gap-2',
                            isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}>
                            <span className="text-xs">
                              {formatTime(message.timestamp)}
                            </span>
                            {isOwnMessage && getMessageStatus(message)}
                          </div>
                        </div>
                        {isOwnMessage && (
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                            You
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim() || isLoading}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={(e) => {
                  // Handle file upload
                  console.log('Files selected:', e.target.files);
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">Secure Messaging</h3>
              <p className="text-sm mb-4">Select a conversation to start chatting securely</p>
              <Button 
                variant="outline"
                onClick={() => createNewConversation(users[0]?.id)}
              >
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecureChat;