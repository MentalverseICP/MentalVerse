// backend/src/ic-integration/icAgent.js
import { HttpAgent, Actor } from '@dfinity/agent';
import fetch from 'node-fetch';

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
    
    // Configuration from environment
    this.config = {
      network: process.env.IC_NETWORK || 'local',
      host: process.env.IC_HOST || 'http://localhost:4943',
      canisters: {
        mentalverse: process.env.MENTALVERSE_BACKEND_CANISTER,
        token: process.env.MVT_TOKEN_CANISTER,
        messaging: process.env.SECURE_MESSAGING_CANISTER
      }
    };
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
        await this.agent.fetchRootKey();
      }

      // Create actors for each canister
      await this.createActors();
      
      this.isInitialized = true;
      console.log('IC Agent initialized successfully');
      
      return true;
    } catch (error) {
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
        this.actors.mentalverse = Actor.createActor(mockIdlFactory, {
          agent: this.agent,
          canisterId: this.config.canisters.mentalverse,
        });
        console.log('MentalVerse actor created');
      }

      // Create MVT Token actor
      if (this.config.canisters.token) {
        this.actors.token = Actor.createActor(mockIdlFactory, {
          agent: this.agent,
          canisterId: this.config.canisters.token,
        });
        console.log('Token actor created');
      }

      // Create Secure Messaging actor
      if (this.config.canisters.messaging) {
        this.actors.messaging = Actor.createActor(mockIdlFactory, {
          agent: this.agent,
          canisterId: this.config.canisters.messaging,
        });
        console.log('Messaging actor created');
      }

      console.log('All available actors created successfully');
    } catch (error) {
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