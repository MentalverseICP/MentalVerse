// backend/src/ic-integration/index.js
import { icAgent, ICAgentService } from './icAgent.js';
import { userSession, UserSessionService } from './userSession.js';

// Initialize IC Agent on module load
let initializationPromise = null;

const initializeICIntegration = async () => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('Initializing IC Integration...');
      await icAgent.initialize();
      console.log('IC Integration initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize IC Integration:', error);
      // Don't throw here - allow the app to start even if IC is not available
      return false;
    }
  })();

  return initializationPromise;
};

// Middleware for IC integration
const icIntegrationMiddleware = (req, res, next) => {
  // Add IC services to request object for easy access
  req.icAgent = icAgent;
  req.userSession = userSession;
  
  // Add helper methods
  req.getOrCreateSession = async (principal, additionalData) => {
    try {
      // Check if session already exists
      const existingSession = userSession.getSessionByPrincipal(principal);
      if (existingSession) {
        userSession.updateSessionActivity(existingSession.sessionId);
        return existingSession;
      }
      
      // Create new session
      return await userSession.createSession(principal, additionalData);
    } catch (error) {
      console.error('Failed to get or create session:', error);
      throw error;
    }
  };
  
  req.requireSession = (sessionId) => {
    const session = userSession.getSession(sessionId);
    if (!session) {
      const error = new Error('Valid session required');
      error.status = 401;
      throw error;
    }
    return session;
  };
  
  next();
};

// Health check endpoint handler
const healthCheckHandler = async (req, res) => {
  try {
    const icHealth = await icAgent.healthCheck();
    const sessionStats = userSession.getSessionStats();
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      ic: icHealth,
      sessions: sessionStats
    };
    
    res.json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

// Session management endpoints
const sessionRoutes = {
  // Create session
  createSession: async (req, res) => {
    try {
      const { principal, ...additionalData } = req.body;
      
      if (!principal) {
        return res.status(400).json({ error: 'Principal is required' });
      }
      
      const result = await userSession.createSession(principal, additionalData);
      res.json(result);
    } catch (error) {
      console.error('Failed to create session:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get session
  getSession: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = userSession.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Failed to get session:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Update session activity
  updateActivity: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updated = userSession.updateSessionActivity(sessionId);
      
      if (!updated) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update session activity:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Delete session
  deleteSession: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const deleted = userSession.deleteSession(sessionId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete session:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

// Token operations are now handled directly by the smart contract

// Messaging endpoints
const messagingRoutes = {
  // Send message
  sendMessage: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { recipient, message } = req.body;
      
      if (!recipient || !message) {
        return res.status(400).json({ error: 'Recipient and message are required' });
      }
      
      const session = req.requireSession(sessionId);
      const result = await userSession.sendMessage(sessionId, recipient, message);
      
      res.json({ success: true, result });
    } catch (error) {
      console.error('Failed to send message:', error);
      const status = error.status || 500;
      res.status(status).json({ error: error.message });
    }
  },
  
  // Get messages
  getMessages: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { limit = 10 } = req.query;
      
      const session = req.requireSession(sessionId);
      const messages = await userSession.getMessages(sessionId, parseInt(limit));
      
      res.json({ messages });
    } catch (error) {
      console.error('Failed to get messages:', error);
      const status = error.status || 500;
      res.status(status).json({ error: error.message });
    }
  }
};

// Combined routes handler
const icRoutes = (app) => {
  // Health check
  app.get('/api/ic/health', healthCheckHandler);
  
  // Session routes
  app.post('/api/ic/session', sessionRoutes.createSession);
  app.get('/api/ic/session/:sessionId', sessionRoutes.getSession);
  app.delete('/api/ic/session/:sessionId', sessionRoutes.deleteSession);
  
  // Token operations are now handled directly by the smart contract
  
  // Messaging routes
  app.post('/api/ic/messages/:sessionId/send', messagingRoutes.sendMessage);
  app.get('/api/ic/messages/:sessionId', messagingRoutes.getMessages);
};

// Utility functions
const isICAvailable = () => icAgent.isInitialized;
const getSessionStats = () => userSession.getSessionStats();

export {
  // Services
  icAgent,
  userSession,
  ICAgentService,
  UserSessionService,
  
  // Initialization
  initializeICIntegration as initializeIC,
  
  // Middleware
  icIntegrationMiddleware as icMiddleware,
  
  // Route handlers
  healthCheckHandler,
  sessionRoutes,
  messagingRoutes,
  
  // Routes
  icRoutes,
  
  // Utility functions
  isICAvailable,
  getSessionStats
};