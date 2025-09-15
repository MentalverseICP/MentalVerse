import React, { useState, useRef, useEffect } from "react";
import { X, Send, MessageCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '@/contexts/AuthContext';
import { httpClient } from '@/services/httpClient';
import { icAgent } from '@/services/icAgent';

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatbotProps {
  className?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi there! I'm MindMate, your compassionate AI mental health companion. I'm here to listen and support you. How are you feeling today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Prepare messages for API call to our backend
      const apiMessages = [
        ...messages.slice(-5).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user",
          content: inputMessage,
        },
      ];

      // Use HTTP client service with authentication
      const data = await httpClient.chat({
        messages: apiMessages,
        sessionId: sessionId,
        userPrincipal: user?.toString()
      });

      // Log interaction if user is authenticated
      if (isAuthenticated && user) {
        try {
          await httpClient.logInteraction({
            message: inputMessage,
            emotionalTone: data.analysis?.emotionalTone?.primary || 'neutral',
            sessionId: sessionId
          });
          
          // Update user stats on IC if available
          if (icAgent.isInitialized()) {
            await icAgent.updateUserStats({
              chatInteractions: 1,
              lastActivity: new Date().toISOString()
            });
          }
        } catch (logError) {
          console.warn('Failed to log interaction:', logError);
        }
      }
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message.content,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      let errorContent =
        "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. If you're in crisis, please reach out to a mental health professional or emergency services.";

      // Handle specific error types
      const errorText = error instanceof Error ? error.message : String(error);
      if (errorText.includes("rate limit") || errorText.includes("429")) {
        errorContent =
          "I'm receiving a lot of requests right now. Please wait a moment and try again.";
      } else if (errorText.includes("quota") || errorText.includes("503")) {
        errorContent =
          "The service is temporarily unavailable. Please try again later or contact support if this persists.";
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorContent,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50  ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.2 }}
              className="max-h-[85vh] h-full max-w-[90vw] w-full relative mb-100 w-80 h-96 bg-black/50 backdrop-blur-2xl border border-green-500/30 rounded-xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[#18E614] text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle size={16} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">MindMate</h3>
                    <p className="text-xs opacity-90">
                      Your mental health companion
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-custom">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        message.role === "user"
                          ? "bg-green-500 text-white rounded-br-sm"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs mt-1 opacity-70 ${
                          message.role === "user"
                            ? "text-green-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg rounded-bl-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share what's on your mind..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:bg-gray-800 dark:text-white text-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-3 py-2 bg-[#18E614] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-[#18E614]/50  text-md font-semibold hover:bg-[#18E614]/80 transform hover:scale-105"
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-[#18E614] text-white p-4 rounded-full shadow-lg hover:bg-[#18E614] transition-all duration-300 z-50"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </motion.button>
    </div>
  );
};

export default Chatbot;
