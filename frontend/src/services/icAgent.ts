// frontend/src/services/icAgent.ts
/// <reference types="vite/client" />
import type { ActorSubclass, Identity } from '@dfinity/agent';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// Import IDL factories and types from generated declarations
import { idlFactory as mentalverseIdl, type _SERVICE as MentalverseService } from '../declarations/mentalverse_backend';
import { idlFactory as tokenIdl, type _SERVICE as TokenService } from '../declarations/mvt_token_canister';
import { idlFactory as messagingIdl, type _SERVICE as MessagingService } from '../declarations/secure_messaging';

// Environment detection based on hostname - automatically detects local vs mainnet
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const IC_HOST = isLocal 
  ? import.meta.env.VITE_IC_HOST ?? 'http://127.0.0.1:4943'
  : 'https://ic0.app';

const NETWORK = isLocal ? 'local' : 'ic';

// Canister IDs with validation
const MENTALVERSE_CANISTER = import.meta.env.VITE_CANISTER_MENTALVERSE_BACKEND;
const MVT_TOKEN_CANISTER = import.meta.env.VITE_CANISTER_MVT_TOKEN;
const SECURE_MESSAGING_CANISTER = import.meta.env.VITE_CANISTER_SECURE_MESSAGING;

// Validate required canister IDs
if (!MENTALVERSE_CANISTER) {
  throw new Error('VITE_CANISTER_MENTALVERSE_BACKEND environment variable is required');
}
if (!MVT_TOKEN_CANISTER) {
  throw new Error('VITE_CANISTER_MVT_TOKEN environment variable is required');
}
if (!SECURE_MESSAGING_CANISTER) {
  throw new Error('VITE_CANISTER_SECURE_MESSAGING environment variable is required');
}

interface ICAgentState {
  agent: HttpAgent | null;
  mentalverseActor: ActorSubclass<MentalverseService> | null;
  tokenActor: ActorSubclass<TokenService> | null;
  messagingActor: ActorSubclass<MessagingService> | null;
  isInitialized: boolean;
}

class ICAgentService {
  private state: ICAgentState = {
    agent: null,
    mentalverseActor: null,
    tokenActor: null,
    messagingActor: null,
    isInitialized: false,
  };

  async initializeAgent(identity?: Identity): Promise<void> {
    try {
      console.log(`Initializing IC Agent for ${NETWORK} network...`);
      console.log('IC Host:', IC_HOST);
      console.log('Canister IDs:', {
        mentalverse: MENTALVERSE_CANISTER,
        token: MVT_TOKEN_CANISTER,
        messaging: SECURE_MESSAGING_CANISTER
      });
      console.log('Window hostname:', window.location.hostname);
      
      this.state.agent = new HttpAgent({ 
        host: IC_HOST,
        identity 
      });

      // Only fetch root key in local development
      if (NETWORK === 'local') {
        console.log('Fetching root key for local development...');
        await this.state.agent.fetchRootKey();
      } else {
        console.log('Mainnet detected, no root key fetch required');
      }

      await this.createActors();
      
      this.state.isInitialized = true;
      console.log(`IC Agent initialized successfully on ${NETWORK} network`);
    } catch (error) {
      console.error('Failed to initialize IC Agent:', error);
      this.reset();
      throw new Error(`IC Agent initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createActors(): Promise<void> {
    if (!this.state.agent) {
      throw new Error('Agent not initialized');
    }

    try {
      this.state.mentalverseActor = Actor.createActor(mentalverseIdl, {
        agent: this.state.agent,
        canisterId: MENTALVERSE_CANISTER,
      });
      console.log('MentalVerse backend actor created');

      this.state.tokenActor = Actor.createActor(tokenIdl, {
        agent: this.state.agent,
        canisterId: MVT_TOKEN_CANISTER,
      });
      console.log('MVT Token actor created');

      this.state.messagingActor = Actor.createActor(messagingIdl, {
        agent: this.state.agent,
        canisterId: SECURE_MESSAGING_CANISTER,
      });
      console.log('Secure Messaging actor created');

      console.log('All actors created successfully');
    } catch (error) {
      console.error('Failed to create actors:', error);
      throw new Error(`Actor creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async initializeWithAuth(): Promise<void> {
    try {
      const authClient = await AuthClient.create();
      
      if (await authClient.isAuthenticated()) {
        const identity = authClient.getIdentity();
        await this.initializeAgent(identity);
      } else {
        await this.initializeAgent();
      }
    } catch (error) {
      console.error('Failed to initialize with auth:', error);
      throw error;
    }
  }

  getMentalverseActor(): ActorSubclass<MentalverseService> {
    if (!this.state.isInitialized || !this.state.mentalverseActor) {
      throw new Error('MentalVerse actor not initialized. Call initializeAgent() first.');
    }
    return this.state.mentalverseActor;
  }

  getTokenActor(): ActorSubclass<TokenService> {
    if (!this.state.isInitialized || !this.state.tokenActor) {
      throw new Error('Token actor not initialized. Call initializeAgent() first.');
    }
    return this.state.tokenActor;
  }

  getMessagingActor(): ActorSubclass<MessagingService> {
    if (!this.state.isInitialized || !this.state.messagingActor) {
      throw new Error('Messaging actor not initialized. Call initializeAgent() first.');
    }
    return this.state.messagingActor;
  }

  getAgent(): HttpAgent {
    if (!this.state.isInitialized || !this.state.agent) {
      throw new Error('Agent not initialized. Call initializeAgent() first.');
    }
    return this.state.agent;
  }

  isInitialized(): boolean {
    return this.state.isInitialized && this.state.agent !== null;
  }

  async updateIdentity(identity: Identity): Promise<void> {
    if (!this.state.isInitialized || !this.state.agent) {
      throw new Error('Agent not initialized. Call initializeAgent() first.');
    }
    
    try {
      console.log('Updating identity...');
      this.state.agent.replaceIdentity(identity);
      await this.createActors();
      console.log('Identity updated successfully');
    } catch (error) {
      console.error('Failed to update identity:', error);
      throw new Error(`Identity update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  reset(): void {
    console.log('Resetting IC Agent state...');
    this.state = {
      agent: null,
      mentalverseActor: null,
      tokenActor: null,
      messagingActor: null,
      isInitialized: false,
    };
  }

  // New: Update user stats via MentalVerse backend
  async updateUserStats(stats: { chatInteractions: number; lastActivity: string }) {
    if (!this.state.mentalverseActor) {
      throw new Error('Mentalverse actor not initialized');
    }

    try {
      const statsWithBigInt = {
        chatInteractions: BigInt(stats.chatInteractions),
        lastActivity: stats.lastActivity
      };
      return await this.state.mentalverseActor.updateUserStats(statsWithBigInt);
    } catch (error) {
      console.error('Failed to update user stats:', error);
      throw error;
    }
  }

  async sendSecureMessage(conversationId: string, content: string, recipient: string): Promise<void> {
    if (!this.state.messagingActor) {
      throw new Error('Messaging actor not initialized');
    }
    
    try {
      const recipientPrincipal = Principal.fromText(recipient);
      const messageType = { Text: null };
      await this.state.messagingActor.send_message(
        conversationId,
        recipientPrincipal,
        content,
        messageType,
        [],
        []
      );
    } catch (error) {
      console.error('Failed to send secure message:', error);
      throw error;
    }
  }

  async getTokenBalance(): Promise<number> {
    if (!this.state.tokenActor) {
      throw new Error('Token actor not initialized');
    }

    try {
      const account = { owner: Principal.anonymous(), subaccount: [] as [] };
      const balance = await this.state.tokenActor.icrc1_balance_of(account);
      return Number(balance);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return 0;
    }
  }

  getNetworkInfo() {
    return {
      network: NETWORK,
      host: IC_HOST,
      canisterIds: {
        mentalverse: MENTALVERSE_CANISTER,
        token: MVT_TOKEN_CANISTER,
        messaging: SECURE_MESSAGING_CANISTER,
      },
    };
  }

  async healthCheck(): Promise<{ [key: string]: string }> {
    const results: { [key: string]: string } = {};
    
    if (!this.isInitialized()) {
      return { status: 'not_initialized' };
    }

    try {
      const mentalverseActor = this.getMentalverseActor();
      await mentalverseActor.healthCheck();
      results.mentalverse = 'healthy';
    } catch (error) {
      results.mentalverse = 'error';
    }

    try {
      const tokenActor = this.getTokenActor();
      await tokenActor.health_check();
      results.token = 'healthy';
    } catch (error) {
      results.token = 'error';
    }

    try {
      const messagingActor = this.getMessagingActor();
      await messagingActor.health_check();
      results.messaging = 'healthy';
    } catch (error) {
      results.messaging = 'error';
    }

    return results;
  }
}

// Export singleton instance
export const icAgent = new ICAgentService();

// Export types for external use
export type { MentalverseService, TokenService, MessagingService };

// Export class for custom instances
export { ICAgentService };

// Default export
export default icAgent;

// Export types
export type { ICAgentState };

// Convenience functions
export const initIcAgents = () => icAgent.initializeWithAuth();
export const getMentalverseActor = () => icAgent.getMentalverseActor();
export const getTokenActor = () => icAgent.getTokenActor();
export const getMessagingActor = () => icAgent.getMessagingActor();
export const getAgent = () => icAgent.getAgent();
