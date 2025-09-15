// backend/src/ic-integration/userSession.js
import { icAgent } from './icAgent.js';

class UserSessionService {
  constructor() {
    this.sessions = new Map(); // In-memory session storage
    this.sessionTimeout = parseInt(process.env.SESSION_MAX_AGE) || 86400000; // 24 hours default
  }

  // Create or update user session
  async createSession(principal, additionalData = {}) {
    try {
      const sessionId = this.generateSessionId();
      const timestamp = Date.now();
      
      // Get user stats from IC if available
      let userStats = null;
      try {
        if (icAgent.isInitialized) {
          userStats = await icAgent.getUserStats(principal);
        }
      } catch (error) {
        console.warn('Could not fetch user stats from IC:', error.message);
      }

      const session = {
        sessionId,
        principal,
        createdAt: timestamp,
        lastActivity: timestamp,
        userStats,
        ...additionalData
      };

      this.sessions.set(sessionId, session);
      
      // Update user activity in IC
      try {
        if (icAgent.isInitialized) {
          await icAgent.updateUserActivity(principal);
        }
      } catch (error) {
        console.warn('Could not update user activity in IC:', error.message);
      }

      console.log(`Session created for principal: ${principal}`);
      return { sessionId, session };
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  // Get session by ID
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Check if session has expired
    if (Date.now() - session.lastActivity > this.sessionTimeout) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  // Update session activity
  updateSessionActivity(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      session.lastActivity = Date.now();
      this.sessions.set(sessionId, session);
      return true;
    }
    
    return false;
  }

  // Get session by principal
  getSessionByPrincipal(principal) {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.principal === principal) {
        // Check if session is still valid
        if (Date.now() - session.lastActivity <= this.sessionTimeout) {
          return { sessionId, session };
        } else {
          // Clean up expired session
          this.sessions.delete(sessionId);
        }
      }
    }
    return null;
  }

  // Update user stats in session
  async updateUserStats(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      if (icAgent.isInitialized) {
        const userStats = await icAgent.getUserStats(session.principal);
        session.userStats = userStats;
        session.lastStatsUpdate = Date.now();
        this.sessions.set(sessionId, session);
        return userStats;
      }
    } catch (error) {
      console.error('Failed to update user stats:', error);
      throw error;
    }
  }

  // Log user interaction
  async logInteraction(sessionId, interactionType, data = {}) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      // Update session activity
      this.updateSessionActivity(sessionId);
      
      // Add interaction to session history
      if (!session.interactions) {
        session.interactions = [];
      }
      
      const interaction = {
        type: interactionType,
        timestamp: Date.now(),
        data
      };
      
      session.interactions.push(interaction);
      
      // Keep only last 50 interactions to prevent memory bloat
      if (session.interactions.length > 50) {
        session.interactions = session.interactions.slice(-50);
      }
      
      this.sessions.set(sessionId, session);
      
      console.log(`Interaction logged for session ${sessionId}: ${interactionType}`);
      return interaction;
    } catch (error) {
      console.error('Failed to log interaction:', error);
      throw error;
    }
  }

  // Perform token operations through session
  async performTokenOperation(sessionId, operation, ...args) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      let result;
      
      switch (operation) {
        case 'getBalance':
          result = await icAgent.getTokenBalance(session.principal);
          break;
        case 'transfer':
          const [to, amount] = args;
          result = await icAgent.transferTokens(session.principal, to, amount);
          break;
        default:
          throw new Error(`Unknown token operation: ${operation}`);
      }
      
      // Log the operation
      await this.logInteraction(sessionId, 'token_operation', {
        operation,
        args,
        result
      });
      
      return result;
    } catch (error) {
      console.error(`Token operation failed for session ${sessionId}:`, error);
      throw error;
    }
  }

  // Send secure message through session
  async sendMessage(sessionId, recipient, message) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      const result = await icAgent.sendSecureMessage(session.principal, recipient, message);
      
      // Log the message
      await this.logInteraction(sessionId, 'message_sent', {
        recipient,
        messageLength: message.length
      });
      
      return result;
    } catch (error) {
      console.error(`Failed to send message for session ${sessionId}:`, error);
      throw error;
    }
  }

  // Get messages for session user
  async getMessages(sessionId, limit = 10) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      const messages = await icAgent.getMessages(session.principal, limit);
      
      // Log the retrieval
      await this.logInteraction(sessionId, 'messages_retrieved', {
        count: messages.length
      });
      
      return messages;
    } catch (error) {
      console.error(`Failed to get messages for session ${sessionId}:`, error);
      throw error;
    }
  }

  // Delete session
  deleteSession(sessionId) {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      console.log(`Session ${sessionId} deleted`);
    }
    return deleted;
  }

  // Clean up expired sessions
  cleanupExpiredSessions() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.sessionTimeout) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired sessions`);
    }
    
    return cleanedCount;
  }

  // Get session statistics
  getSessionStats() {
    const activeSessions = this.sessions.size;
    const now = Date.now();
    let recentActivity = 0;
    
    for (const session of this.sessions.values()) {
      if (now - session.lastActivity < 300000) { // 5 minutes
        recentActivity++;
      }
    }
    
    return {
      activeSessions,
      recentActivity,
      sessionTimeout: this.sessionTimeout
    };
  }

  // Generate unique session ID
  generateSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
const userSession = new UserSessionService();

// Set up periodic cleanup
setInterval(() => {
  userSession.cleanupExpiredSessions();
}, 300000); // Clean up every 5 minutes

export {
  userSession,
  UserSessionService
};

export default UserSessionService;