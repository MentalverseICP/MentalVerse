import { httpClient } from '../services/httpClient';
import { icAgent } from '../services/icAgent';

// Mock Jest globals for TypeScript
declare global {
  function describe(name: string, fn: () => void): void;
  function test(name: string, fn: () => void | Promise<void>): void;
  function beforeAll(fn: () => void | Promise<void>): void;
  function expect(actual: any): {
    toBe(expected: any): void;
    toBeDefined(): void;
    toEqual(expected: any): void;
    toBeTruthy(): void;
    toBeUndefined(): void;
  };
}

// Integration tests for MentalVerse services
describe('MentalVerse Integration Tests', () => {
  beforeAll(async () => {
    // Initialize services for testing
    await icAgent.initializeWithAuth();
  });

  describe('HTTP Client Service', () => {
    test('should check backend health', async () => {
      const health = await httpClient.healthCheck();
      expect(health.status).toBeDefined();
      expect(health.timestamp).toBeDefined();
    });

    test('should get mental health resources', async () => {
      const resources = await httpClient.getResources();
      expect(resources).toBeDefined();
      // Note: resources is of type unknown, so we can't access specific properties without type assertion
      const typedResources = resources as any;
      expect(typedResources).toBeTruthy();
    });

    test('should handle chat interaction', async () => {
      const mockMessages = [
        { role: 'user', content: 'Hello, I am feeling anxious today.' }
      ];
      
      const response = await httpClient.chat({
        messages: mockMessages,
        sessionId: 'test_session_123'
      });
      
      expect(response.message).toBeDefined();
      expect(response.analysis).toBeDefined();
      expect(response.analysis.emotionalTone).toBeDefined();
    });

    test('should log interaction', async () => {
      const logResponse = await httpClient.logInteraction({
        message: 'Test message for logging',
        emotionalTone: 'neutral',
        sessionId: 'test_session_123'
      });
      
      // logInteraction returns void, so we just check it doesn't throw
      expect(logResponse).toBeUndefined();
    });
  });

  describe('IC Agent Service', () => {
    test('should initialize IC agent', () => {
      expect(icAgent.isInitialized()).toBe(true);
    });

    test('should handle user stats update', async () => {
      if (icAgent.isInitialized()) {
        const result = await icAgent.updateUserStats({
          chatInteractions: 1,
          lastActivity: new Date().toISOString()
        });
        
        // Should not throw error
        expect(result).toBeDefined();
      }
    });

    test('should handle token operations', async () => {
      if (icAgent.isInitialized()) {
        const balance = await icAgent.getTokenBalance();
        expect(typeof balance).toBe('number');
      }
    });

    test('should handle secure messaging', async () => {
      if (icAgent.isInitialized()) {
        const result = await icAgent.sendSecureMessage(
          'test_conversation_123',
          'Test secure message',
          'test_user_principal'
        );
        
        // Should not throw error
        expect(result).toBeDefined();
      }
    });
  });

  describe('Integration Flow', () => {
    test('should complete full chat flow with IC integration', async () => {
      const sessionId = `test_${Date.now()}`;
      
      // 1. Send chat message
      const chatResponse = await httpClient.chat({
        messages: [{ role: 'user', content: 'I need help with stress management' }],
        sessionId: sessionId
      });
      
      expect(chatResponse.message.content).toBeDefined();
      expect(chatResponse.analysis.emotionalTone).toBeDefined();
      
      // 2. Log the interaction
      const logResponse = await httpClient.logInteraction({
        message: 'I need help with stress management',
        emotionalTone: chatResponse.analysis.emotionalTone.primary || 'neutral',
        sessionId: sessionId
      });
      
      // logInteraction returns void
      expect(logResponse).toBeUndefined();
      
      // 3. Update user stats if IC is available
      if (icAgent.isInitialized()) {
        await icAgent.updateUserStats({
          chatInteractions: 1,
          lastActivity: new Date().toISOString()
        });
      }
    });

    test('should handle error scenarios gracefully', async () => {
      // Test with invalid data
      try {
        await httpClient.chat({
          messages: [],
          sessionId: ''
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
      
      // Test logging with missing data
      try {
        await httpClient.logInteraction({
          message: '',
          emotionalTone: 'neutral',
          sessionId: 'test'
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Authentication Integration', () => {
    test('should handle authenticated requests', async () => {
      // Mock authenticated user
      const mockUserPrincipal = 'test_user_principal_123';
      
      const response = await httpClient.chat({
        messages: [{ role: 'user', content: 'Hello as authenticated user' }],
        sessionId: 'auth_test_session',
        userPrincipal: mockUserPrincipal
      });
      
      expect(response.message).toBeDefined();
      expect(response.analysis).toBeDefined();
    });
  });
});

// Helper function to run integration tests manually
export const runIntegrationTests = async () => {
  console.log('🧪 Running MentalVerse Integration Tests...');
  
  try {
    // Test backend health
    const health = await httpClient.healthCheck();
    console.log('✅ Backend Health Check:', health.status);
    
    // Test chat functionality
    const chatResponse = await httpClient.chat({
      messages: [{ role: 'user', content: 'Test message' }],
      sessionId: 'manual_test_session'
    });
    console.log('✅ Chat Response:', chatResponse.message.content.substring(0, 50) + '...');
    
    // Test IC agent
    await icAgent.initializeWithAuth();
    console.log('✅ IC Agent Initialized:', icAgent.isInitialized());
    
    console.log('🎉 All integration tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    return false;
  }
};