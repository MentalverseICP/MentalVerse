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
// Canister ID validation utility
const validateCanisterId = (canisterId: string, name: string): string => {
  if (!canisterId || canisterId.trim().length === 0) {
    throw new Error(`${name} canister ID is required but not provided`);
  }
  
  // Basic format validation for canister IDs
  const canisterRegex = /^[a-z0-9-]+$/;
  if (!canisterRegex.test(canisterId) || canisterId.length < 10) {
    throw new Error(`Invalid ${name} canister ID format: ${canisterId}`);
  }
  
  return canisterId.trim();
};



// Production canister IDs from canister_ids.json (IC mainnet)
const PRODUCTION_CANISTER_IDS = {
  mentalverse: 'cytcv-raaaa-aaaac-a4aoa-cai',
  token: 'c7seb-4yaaa-aaaac-a4aoq-cai',
  messaging: 'jzwty-fqaaa-aaaac-a4goq-cai'
};

// Default canister IDs for fallback (local development)
const DEFAULT_CANISTER_IDS = {
  mentalverse: 'rdmx6-jaaaa-aaaah-qdrqq-cai',
  token: 'rrkah-fqaaa-aaaah-qcuqq-cai', 
  messaging: 'jzwty-fqaaa-aaaac-a4goq-cai'
};

// Environment-aware canister ID resolution with production fallbacks
const getCanisterId = (envVar: string | undefined, canisterName: keyof typeof PRODUCTION_CANISTER_IDS, displayName: string): string => {
  // Priority: 1. Environment variable from .env, 2. Production ID (if ic network), 3. Development fallback
  let canisterId = envVar;
  
  if (!canisterId) {
    const isProduction = NETWORK === 'ic' || import.meta.env.VITE_IC_NETWORK === 'ic';
    canisterId = isProduction 
      ? PRODUCTION_CANISTER_IDS[canisterName]
      : DEFAULT_CANISTER_IDS[canisterName];
  }
  
  return validateCanisterId(canisterId, displayName);
};

// Resolve canister IDs with validation and production fallbacks
const MENTALVERSE_CANISTER = getCanisterId(
  import.meta.env.VITE_CANISTER_MENTALVERSE_BACKEND,
  'mentalverse',
  'MentalVerse Backend'
);

const MVT_TOKEN_CANISTER = getCanisterId(
  import.meta.env.VITE_CANISTER_MVT_TOKEN,
  'token',
  'MVT Token'
);

const SECURE_MESSAGING_CANISTER = getCanisterId(
  import.meta.env.VITE_CANISTER_SECURE_MESSAGING,
  'messaging',
  'Secure Messaging'
);

// Log canister configuration for debugging
console.log('Canister Configuration:', {
  network: NETWORK,
  host: IC_HOST,
  canisters: {
    mentalverse: MENTALVERSE_CANISTER,
    token: MVT_TOKEN_CANISTER,
    messaging: SECURE_MESSAGING_CANISTER
  },
  environment: {
    mentalverse_env: import.meta.env.VITE_CANISTER_MENTALVERSE_BACKEND,
    token_env: import.meta.env.VITE_CANISTER_MVT_TOKEN,
    messaging_env: import.meta.env.VITE_CANISTER_SECURE_MESSAGING
  }
});

interface ICAgentState {
  agent: HttpAgent | null;
  mentalverseActor: ActorSubclass<MentalverseService> | null;
  tokenActor: ActorSubclass<TokenService> | null;
  messagingActor: ActorSubclass<MessagingService> | null;
  isInitialized: boolean;
  lastInitializationAttempt: number;
  initializationAttempts: number;
}

interface ActorCreationResult {
  success: boolean;
  actor?: any;
  error?: string;
}

class ICAgentService {
  private state: ICAgentState = {
    agent: null,
    mentalverseActor: null,
    tokenActor: null,
    messagingActor: null,
    isInitialized: false,
    lastInitializationAttempt: 0,
    initializationAttempts: 0,
  };
  
  private readonly maxInitializationAttempts = 3;
  private readonly initializationRetryDelay = 2000;

  async initializeAgent(identity?: Identity): Promise<void> {
    this.state.initializationAttempts++;
    this.state.lastInitializationAttempt = Date.now();
    
    try {
      console.log(`Initializing IC Agent for ${NETWORK} network (attempt ${this.state.initializationAttempts})...`);
      console.log('IC Host:', IC_HOST);
      console.log('Canister IDs:', {
        mentalverse: MENTALVERSE_CANISTER,
        token: MVT_TOKEN_CANISTER,
        messaging: SECURE_MESSAGING_CANISTER
      });
      console.log('Window hostname:', window.location.hostname);
      console.log('Identity provided:', !!identity);
      
      // Validate identity if provided
      if (identity) {
        const principal = identity.getPrincipal();
        if (principal.isAnonymous()) {
          console.warn('Anonymous identity provided, proceeding without authentication');
        } else {
          console.log('Authenticated identity principal:', principal.toText());
        }
      }
      
      this.state.agent = new HttpAgent({ 
        host: IC_HOST,
        identity 
      });

      // Only fetch root key in local development with retry logic
      if (NETWORK === 'local') {
        console.log('Fetching root key for local development...');
        let rootKeyFetched = false;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (!rootKeyFetched && retryCount < maxRetries) {
          try {
            await this.state.agent.fetchRootKey();
            rootKeyFetched = true;
            console.log('✓ Root key fetched successfully');
          } catch (error) {
            retryCount++;
            console.warn(`Root key fetch attempt ${retryCount} failed:`, error);
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }
        }
        
        if (!rootKeyFetched) {
          throw new Error('Failed to fetch root key after multiple attempts');
        }
      } else {
        console.log('Mainnet detected, no root key fetch required');
      }

      await this.createActors();
      
      this.state.isInitialized = true;
      console.log(`✓ IC Agent initialized successfully on ${NETWORK} network`);
      
    } catch (error) {
      console.error(`IC Agent initialization attempt ${this.state.initializationAttempts} failed:`, error);
      
      // Reset state on failure
      this.resetActors();
      this.state.agent = null;
      this.state.isInitialized = false;
      
      // Retry logic for initialization
      if (this.state.initializationAttempts < this.maxInitializationAttempts) {
        console.log(`Retrying IC Agent initialization (${this.state.initializationAttempts}/${this.maxInitializationAttempts})`);
        await new Promise(resolve => setTimeout(resolve, this.initializationRetryDelay * this.state.initializationAttempts));
        return this.initializeAgent(identity);
      }
      
      throw new Error(`IC Agent initialization failed after ${this.maxInitializationAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createActors(): Promise<void> {
    if (!this.state.agent) {
      throw new Error('Agent not initialized');
    }

    const actorCreationResults: { [key: string]: ActorCreationResult } = {};
    
    try {
      // Create MentalVerse actor with validation
      console.log('Creating MentalVerse backend actor...');
      const mentalverseResult = await this.createSingleActor(
        'mentalverse',
        mentalverseIdl,
        MENTALVERSE_CANISTER
      );
      actorCreationResults.mentalverse = mentalverseResult;
      
      if (mentalverseResult.success) {
        this.state.mentalverseActor = mentalverseResult.actor;
        console.log('✓ MentalVerse backend actor created successfully');
      } else {
        console.error('✗ MentalVerse backend actor creation failed:', mentalverseResult.error);
      }

      // Create Token actor with validation
      console.log('Creating MVT Token actor...');
      const tokenResult = await this.createSingleActor(
        'token',
        tokenIdl,
        MVT_TOKEN_CANISTER
      );
      actorCreationResults.token = tokenResult;
      
      if (tokenResult.success) {
        this.state.tokenActor = tokenResult.actor;
        console.log('✓ MVT Token actor created successfully');
      } else {
        console.error('✗ MVT Token actor creation failed:', tokenResult.error);
      }

      // Create Messaging actor with validation
      console.log('Creating Secure Messaging actor...');
      const messagingResult = await this.createSingleActor(
        'messaging',
        messagingIdl,
        SECURE_MESSAGING_CANISTER
      );
      actorCreationResults.messaging = messagingResult;
      
      if (messagingResult.success) {
        this.state.messagingActor = messagingResult.actor;
        console.log('✓ Secure Messaging actor created successfully');
      } else {
        console.error('✗ Secure Messaging actor creation failed:', messagingResult.error);
      }

      // Validate that at least critical actors were created
      const criticalActorsCreated = mentalverseResult.success && tokenResult.success;
      if (!criticalActorsCreated) {
        const failedActors = Object.entries(actorCreationResults)
          .filter(([_, result]) => !result.success)
          .map(([name, result]) => `${name}: ${result.error}`)
          .join(', ');
        
        throw new Error(`Critical actor creation failed: ${failedActors}`);
      }

      console.log('All critical actors created successfully');
      
      // Test actor connectivity
      await this.validateActorConnectivity();
      
    } catch (error) {
      console.error('Failed to create actors:', error);
      // Reset failed actors
      this.resetActors();
      throw new Error(`Actor creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async createSingleActor(
    actorName: string,
    idlFactory: any,
    canisterId: string
  ): Promise<ActorCreationResult> {
    try {
      // Validate canister ID format before creating actor
      validateCanisterId(canisterId, actorName);
      
      // Validate IDL factory
      if (!idlFactory || typeof idlFactory !== 'function') {
        throw new Error(`Invalid IDL factory for ${actorName} actor`);
      }
      
      const actor = Actor.createActor(idlFactory, {
        agent: this.state.agent!,
        canisterId: canisterId,
      });
      
      // Basic actor validation
      if (!actor) {
        throw new Error(`Actor creation returned null for ${actorName}`);
      }
      
      return {
        success: true,
        actor: actor
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to create ${actorName} actor:`, error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  private async validateActorConnectivity(): Promise<void> {
    const connectivityTests: Promise<void>[] = [];
    
    // Test MentalVerse actor
    if (this.state.mentalverseActor) {
      connectivityTests.push(
        this.testActorHealth('mentalverse', async () => {
          await this.state.mentalverseActor!.healthCheck();
        })
      );
    }
    
    // Test Token actor
    if (this.state.tokenActor) {
      connectivityTests.push(
        this.testActorHealth('token', async () => {
          await this.state.tokenActor!.health_check();
        })
      );
    }
    
    // Test Messaging actor
    if (this.state.messagingActor) {
      connectivityTests.push(
        this.testActorHealth('messaging', async () => {
          await this.state.messagingActor!.health_check();
        })
      );
    }
    
    // Wait for all connectivity tests with timeout
    try {
      await Promise.allSettled(connectivityTests);
      console.log('Actor connectivity validation completed');
    } catch (error) {
      console.warn('Some actor connectivity tests failed:', error);
      // Don't throw here as this is just validation
    }
  }
  
  private async testActorHealth(actorName: string, healthCheck: () => Promise<void>): Promise<void> {
    try {
      await Promise.race([
        healthCheck(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), 5000)
        )
      ]);
      console.log(`✓ ${actorName} actor connectivity verified`);
    } catch (error) {
      console.warn(`⚠ ${actorName} actor connectivity test failed:`, error);
      // Don't throw - this is just a warning
    }
  }
  
  private resetActors(): void {
    this.state.mentalverseActor = null;
    this.state.tokenActor = null;
    this.state.messagingActor = null;
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
      lastInitializationAttempt: 0,
      initializationAttempts: 0,
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
