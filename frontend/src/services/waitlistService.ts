import { Actor, HttpAgent } from '@dfinity/agent';
import { createActor } from '../declarations/waitlist_canister';
import type { _SERVICE as WaitlistCanister, WaitlistEntry as GeneratedWaitlistEntry } from '../declarations/waitlist_canister/waitlist_canister.did.d.ts';

// Convert generated types to more convenient types
export interface WaitlistEntry {
  email: string;
  timestamp: bigint;
}

export type { WaitlistCanister };

class WaitlistService {
  private actor: WaitlistCanister | null = null;

  async initialize(canisterId?: string) {
    try {
      // Get canister ID from environment or use provided one
      const waitlistCanisterId = canisterId || process.env.VITE_WAITLIST_CANISTER_ID || 'mooh3-raaaa-aaaac-a4k4q-cai';

      // Create actor using the generated createActor function
      this.actor = createActor(waitlistCanisterId, {
        agentOptions: {
          host: process.env.NODE_ENV === 'development' ? 'http://localhost:4943' : 'https://ic0.app',
        }
      });

      console.log('Waitlist service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize waitlist service:', error);
      throw error;
    }
  }

  async addToWaitlist(email: string): Promise<{ success: boolean; message: string }> {
    if (!this.actor) {
      throw new Error('Waitlist service not initialized');
    }

    try {
      const result = await this.actor.addToWaitlist(email);
      
      if ('ok' in result) {
        return { success: true, message: result.ok };
      } else {
        return { success: false, message: result.err };
      }
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      return { success: false, message: 'Failed to add to waitlist' };
    }
  }

  async getWaitlistCount(): Promise<number> {
    if (!this.actor) {
      throw new Error('Waitlist service not initialized');
    }

    try {
      const count = await this.actor.getWaitlistCount();
      return Number(count);
    } catch (error) {
      console.error('Error getting waitlist count:', error);
      return 0;
    }
  }

  async isEmailInWaitlist(email: string): Promise<boolean> {
    if (!this.actor) {
      throw new Error('Waitlist service not initialized');
    }

    try {
      return await this.actor.isEmailInWaitlist(email);
    } catch (error) {
      console.error('Error checking email in waitlist:', error);
      return false;
    }
  }

  // Helper function to convert generated WaitlistEntry to our interface
  private convertWaitlistEntry(entry: GeneratedWaitlistEntry): WaitlistEntry {
    return {
      email: entry.email,
      timestamp: entry.timestamp
    };
  }

  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    if (!this.actor) {
      throw new Error('Waitlist service not initialized');
    }

    try {
      const entries = await this.actor.getWaitlistEntries();
      return entries.map(entry => this.convertWaitlistEntry(entry));
    } catch (error) {
      console.error('Error getting waitlist entries:', error);
      return [];
    }
  }

  async exportWaitlistData(): Promise<string> {
    if (!this.actor) {
      throw new Error('Waitlist service not initialized');
    }

    try {
      return await this.actor.exportWaitlistData();
    } catch (error) {
      console.error('Error exporting waitlist data:', error);
      return '';
    }
  }
}

export const waitlistService = new WaitlistService();