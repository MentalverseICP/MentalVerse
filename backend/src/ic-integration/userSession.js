// backend/src/ic-integration/userSession.js
import { icAgent } from './icAgent.js';

/**
 * User Session Service - Simplified proxy to smart contract
 * All session management is now handled by the smart contract
 */
class UserSessionService {
  constructor() {
    // Sessions now managed by smart contract
    console.log('✅ User Session Service initialized (delegating to smart contract)');
  }

  // Session creation now handled by smart contract
  async createSession(principal, userData = {}) {
    try {
      // Delegate to smart contract for session management
      const result = await icAgent.callCanisterMethod('mentalverse', 'createUserSession', principal, userData);
      
      if (result.Err) {
        throw new Error(result.Err);
      }
      
      return {
        sessionId: result.Ok.sessionId,
        session: result.Ok,
        isNew: true
      };
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }

  // Get session from smart contract
  async getSession(sessionId) {
    try {
      const result = await icAgent.callCanisterMethod('mentalverse', 'getSession', sessionId);
      return result.Ok || null;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  // Update session activity via smart contract
  async updateSessionActivity(sessionId) {
    try {
      const result = await icAgent.callCanisterMethod('mentalverse', 'updateSessionActivity', sessionId);
      return result.Ok || false;
    } catch (error) {
      console.error('Failed to update session activity:', error);
      return false;
    }
  }

  // Get session by principal - now handled by smart contract
  async getSessionByPrincipal(principal) {
    try {
      const result = await icAgent.callCanisterMethod('mentalverse', 'getSessionByPrincipal', principal);
      return result.Ok || null;
    } catch (error) {
      console.error('Failed to get session by principal:', error);
      return null;
    }
  }

  // Token operations now handled directly by smart contract
  async performTokenOperation(principal, operation, ...args) {
    try {
      let result;
      
      switch (operation) {
        case 'getBalance':
          result = await icAgent.getTokenBalance(principal);
          break;
        case 'transfer':
          const [to, amount] = args;
          result = await icAgent.transferTokens(principal, to, amount);
          break;
        default:
          throw new Error(`Unknown token operation: ${operation}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Token operation failed for principal ${principal}:`, error);
      throw error;
    }
  }

  // Session deletion now handled by smart contract
  async deleteSession(sessionId) {
    try {
      const result = await icAgent.callCanisterMethod('mentalverse', 'deleteSession', sessionId);
      return result.Ok || false;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }
}

// Export singleton instance
const userSession = new UserSessionService();

// Export both the class and instance for ES modules
export { UserSessionService, userSession };
export default UserSessionService;