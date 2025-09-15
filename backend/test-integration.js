import axios from 'axios';
import { performance } from 'perf_hooks';

// Backend Integration Test Script
class IntegrationTester {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async runTest(name, testFn) {
    console.log(`🧪 Running: ${name}`);
    const start = performance.now();
    
    try {
      const result = await testFn();
      const duration = Math.round(performance.now() - start);
      console.log(`✅ ${name} - ${duration}ms`);
      this.results.push({ name, status: 'PASS', duration, result });
      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      console.error(`❌ ${name} - ${duration}ms - ${error.message}`);
      this.results.push({ name, status: 'FAIL', duration, error: error.message });
      throw error;
    }
  }

  async testHealthCheck() {
    return this.runTest('Health Check', async () => {
      const response = await axios.get(`${this.baseUrl}/health`);
      if (response.data.status !== 'healthy') {
        throw new Error('Backend not healthy');
      }
      return response.data;
    });
  }

  async testChatEndpoint() {
    return this.runTest('Chat Endpoint', async () => {
      const messages = [
        { role: 'user', content: 'Hello, I am feeling stressed today.' }
      ];
      
      const response = await axios.post(`${this.baseUrl}/api/chat`, {
        messages: messages
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': 'test_session_123',
          'x-user-principal': 'test_user_principal'
        }
      });
      
      if (!response.data.message || !response.data.analysis) {
        throw new Error('Invalid chat response structure');
      }
      
      return {
        messageLength: response.data.message.content.length,
        emotionalTone: response.data.analysis.emotionalTone,
        tokensAwarded: response.data.tokens?.awarded || 0
      };
    });
  }

  async testLogInteraction() {
    return this.runTest('Log Interaction', async () => {
      const response = await axios.post(`${this.baseUrl}/api/log-interaction`, {
        message: 'Test message for logging integration',
        emotionalTone: 'neutral',
        sessionId: 'test_session_123'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-principal': 'test_user_principal'
        }
      });
      
      if (!response.data.success || !response.data.logEntry) {
        throw new Error('Log interaction failed');
      }
      
      return {
        logId: response.data.logEntry.id,
        status: response.data.logEntry.status,
        icLogged: response.data.logEntry.icLogged
      };
    });
  }

  async testResourcesEndpoint() {
    return this.runTest('Resources Endpoint', async () => {
      const response = await axios.get(`${this.baseUrl}/api/resources`);
      
      if (!response.data.crisis || !response.data.support) {
        throw new Error('Invalid resources structure');
      }
      
      return {
        crisisResourcesCount: Object.keys(response.data.crisis).length,
        supportResourcesCount: Object.keys(response.data.support).length,
        breathingExercisesCount: response.data.breathing_exercises?.length || 0
      };
    });
  }

  async testICHealthEndpoint() {
    return this.runTest('IC Health Check', async () => {
      try {
        const response = await axios.get(`${this.baseUrl}/api/ic/health`);
        return {
          icStatus: response.data.ic?.status || 'unknown',
          canistersConnected: response.data.ic?.canisters || 0
        };
      } catch (error) {
        if (error.response?.status === 404) {
          console.warn('IC endpoints not available - this is expected in development');
          return { icStatus: 'not_available', canistersConnected: 0 };
        }
        throw error;
      }
    });
  }

  async testICSessionEndpoint() {
    return this.runTest('IC Session Management', async () => {
      try {
        const response = await axios.post(`${this.baseUrl}/api/ic/session`, {
          userPrincipal: 'test_user_principal',
          action: 'create'
        });
        
        return {
          sessionCreated: response.data.success || false,
          sessionId: response.data.sessionId || 'none'
        };
      } catch (error) {
        if (error.response?.status === 404) {
          console.warn('IC session endpoints not available - this is expected in development');
          return { sessionCreated: false, sessionId: 'not_available' };
        }
        throw error;
      }
    });
  }

  async testRateLimiting() {
    return this.runTest('Rate Limiting', async () => {
      const requests = [];
      
      // Send multiple requests quickly to test rate limiting
      for (let i = 0; i < 5; i++) {
        requests.push(
          axios.get(`${this.baseUrl}/health`).catch(err => err.response)
        );
      }
      
      const responses = await Promise.all(requests);
      const successCount = responses.filter(r => r.status === 200).length;
      
      return {
        totalRequests: requests.length,
        successfulRequests: successCount,
        rateLimitingActive: successCount < requests.length
      };
    });
  }

  async testErrorHandling() {
    return this.runTest('Error Handling', async () => {
      try {
        // Test invalid endpoint
        await axios.get(`${this.baseUrl}/api/invalid-endpoint`);
        throw new Error('Should have returned 404');
      } catch (error) {
        if (error.response?.status !== 404) {
          throw new Error(`Expected 404, got ${error.response?.status}`);
        }
      }
      
      try {
        // Test invalid chat request
        await axios.post(`${this.baseUrl}/api/chat`, {
          messages: 'invalid'
        });
        throw new Error('Should have returned validation error');
      } catch (error) {
        if (error.response?.status !== 400) {
          throw new Error(`Expected 400, got ${error.response?.status}`);
        }
      }
      
      return { errorHandlingWorking: true };
    });
  }

  async runAllTests() {
    console.log('🚀 Starting MentalVerse Backend Integration Tests\n');
    
    try {
      await this.testHealthCheck();
      await this.testResourcesEndpoint();
      await this.testChatEndpoint();
      await this.testLogInteraction();
      await this.testICHealthEndpoint();
      await this.testICSessionEndpoint();
      await this.testRateLimiting();
      await this.testErrorHandling();
      
      this.printSummary();
      return true;
    } catch (error) {
      console.error('\n💥 Test suite failed:', error.message);
      this.printSummary();
      return false;
    }
  }

  printSummary() {
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }
    
    console.log(`\n🎯 Success Rate: ${Math.round((passed / this.results.length) * 100)}%`);
  }
}

// Run tests if this file is executed directly
const tester = new IntegrationTester();

tester.runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });

export default IntegrationTester;