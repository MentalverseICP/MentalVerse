// backend/src/ic-integration/icAgent.js
import { HttpAgent, Actor } from '@dfinity/agent';
import fetch from 'node-fetch';

// Error handling utilities
const logError = (error, context = {}) => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    message: error.message || error,
    stack: error.stack,
    context,
    severity: context.severity || 'error'
  };
  
  console.error(`[IC Agent Error ${timestamp}]:`, errorInfo);
  
  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service
  }
  
  return errorInfo;
};

// Mock IDL factories - replace with actual generated declarations
const mockIdlFactory = ({ IDL }) => {
  return IDL.Service({
    'greet': IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'getUserStats': IDL.Func([IDL.Principal], [IDL.Record({
      'tokenBalance': IDL.Nat,
      'interactions': IDL.Nat,
      'lastActive': IDL.Int
    })], ['query']),
    'updateUserActivity': IDL.Func([IDL.Principal], [IDL.Bool], []),
  });
};

class ICAgentService {
  constructor() {
    this.agent = null;
    this.actors = {
      mentalverse: null,
      token: null,
      messaging: null
    };
    this.isInitialized = false;
    
    // Default canister IDs for local development
    this.DEFAULT_CANISTER_IDS = {
      mentalverse: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
      token: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
      messaging: 'rdmx6-jaaaa-aaaaa-aaadq-cai'
    };

    // Configuration from environment with fallbacks
    this.config = {
      network: process.env.IC_NETWORK || 'local',
      host: process.env.IC_HOST || 'http://localhost:4943',
      canisters: {
        mentalverse: this.getCanisterId(process.env.MENTALVERSE_BACKEND_CANISTER, 'mentalverse', 'MentalVerse Backend'),
        token: this.getCanisterId(process.env.MVT_TOKEN_CANISTER, 'token', 'MVT Token'),
        messaging: this.getCanisterId(process.env.SECURE_MESSAGING_CANISTER, 'messaging', 'Secure Messaging')
      }
    };

    // Log configuration for debugging
    console.log('Backend IC Configuration:', {
      network: this.config.network,
      host: this.config.host,
      environment: process.env.NODE_ENV || 'development',
      canisters: this.config.canisters
    });
  }

  // Environment-aware canister ID resolution
  getCanisterId(envVar, canisterName, displayName) {
    // First priority: Environment variables from .env
    if (envVar) {
      console.log(`${displayName} Canister ID (from env): ${envVar}`);
      return envVar;
    }
    
    // Fallback to development IDs
    const fallbackId = this.DEFAULT_CANISTER_IDS[canisterName];
    if (!fallbackId) {
      throw new Error(`Missing canister ID for ${displayName}. Please set the appropriate environment variable.`);
    }
    
    console.log(`${displayName} Canister ID (fallback): ${fallbackId}`);
    return fallbackId;
  }

  async initialize() {
    try {
      console.log('Initializing IC Agent for backend...');
      
      // Create HTTP agent
      const host = this.config.network === 'ic' ? 'https://ic0.app' : this.config.host;
      this.agent = new HttpAgent({ 
        host,
        fetch // Ensure fetch is available in Node.js environment
      });

      // Fetch root key for local development
      if (this.config.network !== 'ic') {
        try {
          await this.agent.fetchRootKey();
        } catch (rootKeyError) {
          logError(rootKeyError, {
            operation: 'fetch_root_key',
            network: this.config.network,
            severity: 'warning'
          });
          console.warn('Failed to fetch root key (this is normal for mainnet):', rootKeyError.message);
        }
      }

      // Create actors for each canister
      await this.createActors();
      
      this.isInitialized = true;
      console.log('IC Agent initialized successfully');
      
      return true;
    } catch (error) {
      logError(error, {
        operation: 'initialize_agent',
        config: this.config
      });
      console.error('Failed to initialize IC Agent:', error);
      throw error;
    }
  }

  async createActors() {
    if (!this.agent) {
      throw new Error('Agent not initialized');
    }

    try {
      // Create MentalVerse backend actor
      if (this.config.canisters.mentalverse) {
        try {
          this.actors.mentalverse = Actor.createActor(mockIdlFactory, {
            agent: this.agent,
            canisterId: this.config.canisters.mentalverse,
          });
          console.log('MentalVerse actor created');
        } catch (actorError) {
          logError(actorError, {
            operation: 'create_actor',
            canisterName: 'mentalverse',
            canisterId: this.config.canisters.mentalverse
          });
          console.error('Failed to create MentalVerse actor:', actorError);
        }
      }

      // Create MVT Token actor
      if (this.config.canisters.token) {
        try {
          this.actors.token = Actor.createActor(mockIdlFactory, {
            agent: this.agent,
            canisterId: this.config.canisters.token,
          });
          console.log('Token actor created');
        } catch (actorError) {
          logError(actorError, {
            operation: 'create_actor',
            canisterName: 'token',
            canisterId: this.config.canisters.token
          });
          console.error('Failed to create Token actor:', actorError);
        }
      }

      // Create Secure Messaging actor
      if (this.config.canisters.messaging) {
        try {
          this.actors.messaging = Actor.createActor(mockIdlFactory, {
            agent: this.agent,
            canisterId: this.config.canisters.messaging,
          });
          console.log('Messaging actor created');
        } catch (actorError) {
          logError(actorError, {
            operation: 'create_actor',
            canisterName: 'messaging',
            canisterId: this.config.canisters.messaging
          });
          console.error('Failed to create Messaging actor:', actorError);
        }
      }

      console.log('All available actors created successfully');
    } catch (error) {
      logError(error, {
        operation: 'create_actors',
        config: this.config
      });
      console.error('Failed to create actors:', error);
      throw error;
    }
  }

  getActor(actorName) {
    if (!this.isInitialized) {
      throw new Error('IC Agent not initialized. Call initialize() first.');
    }
    
    const actor = this.actors[actorName];
    if (!actor) {
      throw new Error(`Actor '${actorName}' not available. Check canister configuration.`);
    }
    
    return actor;
  }

  async callCanisterMethod(actorName, methodName, ...args) {
    try {
      const actor = this.getActor(actorName);
      console.log(`Calling ${actorName}.${methodName} with args:`, args);
      
      const result = await actor[methodName](...args);
      console.log(`${actorName}.${methodName} result:`, result);
      
      return result;
    } catch (error) {
      logError(error, {
        operation: 'call_canister_method',
        actorName,
        methodName,
        argsCount: args.length
      });
      console.error(`Failed to call ${actorName}.${methodName}:`, error);
      throw error;
    }
  }

  // Convenience methods for common operations
  async getUserStats(principal) {
    return this.callCanisterMethod('mentalverse', 'getUserStats', principal);
  }

  async updateUserActivity(principal) {
    return this.callCanisterMethod('mentalverse', 'updateUserActivity', principal);
  }

  async getTokenBalance(principal) {
    return this.callCanisterMethod('token', 'balanceOf', principal);
  }

  async transferTokens(from, to, amount) {
    return this.callCanisterMethod('token', 'transfer', from, to, amount);
  }

  async sendSecureMessage(sender, recipient, message) {
    return this.callCanisterMethod('messaging', 'sendMessage', sender, recipient, message);
  }

  async getMessages(principal, limit = 10) {
    return this.callCanisterMethod('messaging', 'getMessages', principal, limit);
  }

  // Health check method
  async healthCheck() {
    const results = {};
    
    for (const [name, actor] of Object.entries(this.actors)) {
      if (actor) {
        try {
          // Try to call a simple method to check if canister is responsive
          await actor.greet('health-check');
          results[name] = 'healthy';
        } catch (error) {
          results[name] = 'error';
          console.error(`Health check failed for ${name}:`, error.message);
        }
      } else {
        results[name] = 'not_configured';
      }
    }
    
    return {
      agent: this.isInitialized ? 'initialized' : 'not_initialized',
      network: this.config.network,
      canisters: results
    };
  }

  // Reset the agent (useful for testing or reconnection)
  reset() {
    this.agent = null;
    this.actors = {
      mentalverse: null,
      token: null,
      messaging: null
    };
    this.isInitialized = false;
  }
}

// Export singleton instance
const icAgent = new ICAgentService();

export {
  icAgent,
  ICAgentService
};

export default ICAgentService;