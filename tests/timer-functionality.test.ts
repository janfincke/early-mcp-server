import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import MockAdapter from 'axios-mock-adapter';
import { EarlyApiClient } from '../src/early-api-client.js';
import { EarlyConfig } from '../src/types.js';

// Mock the Early MCP Server class for testing timer methods
class MockEarlyMcpServer {
  private apiClient: EarlyApiClient;

  constructor() {
    const config: EarlyConfig = {
      apiKey: 'test-key',
      apiSecret: 'test-secret',
      baseUrl: 'https://api.early.app',
      timeout: 30000,
    };
    this.apiClient = new EarlyApiClient(config);
  }

  // Expose the API client for testing
  getApiClient(): EarlyApiClient {
    return this.apiClient;
  }

  // Mock timer handler methods for testing
  async handleStartTimer(args: any) {
    try {
      const { projectId, description } = args;
      
      if (!projectId) {
        throw new Error('Project ID is required to start timer');
      }
      
      const currentTracking = await this.apiClient.getCurrentTracking();
      
      if (currentTracking && currentTracking.id) {
        return {
          content: [{
            type: 'text',
            text: `⚠️ There's already an active timer running!`,
          }],
        };
      }
      
      await this.apiClient.startTracking(projectId, description);
      
      return {
        content: [{
          type: 'text',
          text: `⏱️ Timer started successfully!`,
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Failed to start timer: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }],
      };
    }
  }

  async handleStopTimer() {
    try {
      const currentTracking = await this.apiClient.getCurrentTracking();
      
      if (!currentTracking || !currentTracking.id) {
        return {
          content: [{
            type: 'text',
            text: '⚠️ No active timer found to stop.',
          }],
        };
      }
      
      const stoppedAt = new Date().toISOString().replace('Z', '');
      await this.apiClient.stopTracking(stoppedAt);
      
      return {
        content: [{
          type: 'text',
          text: `⏹️ Timer stopped successfully!`,
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Failed to stop timer: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }],
      };
    }
  }
}

describe('Timer Functionality', () => {
  let mockServer: MockEarlyMcpServer;
  let mockAxios: MockAdapter;
  let apiClient: EarlyApiClient;

  beforeEach(() => {
    mockServer = new MockEarlyMcpServer();
    apiClient = mockServer.getApiClient();
    
    // Mock axios instance used by the API client
    mockAxios = new MockAdapter((apiClient as any).client);
    
    // Mock authentication
    mockAxios.onPost('/api/v4/developer/sign-in').reply(200, {
      token: 'mock-access-token'
    });
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('start_timer', () => {
    it('should start a timer successfully when no timer is running', async () => {
      // Mock no current tracking (404 = no active timer)
      mockAxios.onGet('/api/v4/tracking').reply(404);
      
      // Mock successful timer start
      mockAxios.onPost('/api/v4/tracking/project-123/start').reply(200, {
        id: 'tracking-123',
        activity: { name: 'Test Project' },
        duration: { startedAt: '2024-01-10T10:00:00.000' },
        note: { text: 'Test description' }
      });

      const result = await mockServer.handleStartTimer({
        projectId: 'project-123',
        description: 'Test description'
      });

      expect(result.content?.[0]?.text).toContain('Timer started successfully!');
    });

    it('should prevent starting timer when one is already running', async () => {
      // Mock existing active tracking
      mockAxios.onGet('/api/v4/tracking').reply(200, {
        id: 'existing-tracking-123',
        activity: { name: 'Existing Project' },
        duration: { startedAt: '2024-01-10T09:00:00.000' }
      });

      const result = await mockServer.handleStartTimer({
        projectId: 'project-123',
        description: 'Test description'
      });

      expect(result.content?.[0]?.text).toContain('There\'s already an active timer running!');
    });

    it('should require projectId parameter', async () => {
      const result = await mockServer.handleStartTimer({
        description: 'Test description'
      });

      expect(result.content?.[0]?.text).toContain('Project ID is required to start timer');
    });

    it('should handle API errors gracefully', async () => {
      // Mock authentication failure
      mockAxios.onPost('/api/v4/developer/sign-in').reply(401, {
        message: 'Invalid credentials'
      });

      const result = await mockServer.handleStartTimer({
        projectId: 'project-123',
        description: 'Test description'
      });

      expect(result.content?.[0]?.text).toContain('Failed to start timer');
    });
  });

  describe('stop_timer', () => {
    it('should stop an active timer successfully', async () => {
      // Mock existing active tracking
      mockAxios.onGet('/api/v4/tracking').reply(200, {
        id: 'tracking-123',
        activity: { name: 'Test Project' },
        duration: { startedAt: '2024-01-10T10:00:00.000' },
        note: { text: 'Test description' }
      });

      // Mock successful timer stop
      mockAxios.onPost('/api/v4/tracking/stop').reply(200, {
        id: 'tracking-123',
        activity: { name: 'Test Project' },
        duration: { 
          startedAt: '2024-01-10T10:00:00.000',
          stoppedAt: '2024-01-10T11:00:00.000'
        },
        note: { text: 'Test description' }
      });

      const result = await mockServer.handleStopTimer();

      expect(result.content?.[0]?.text).toContain('Timer stopped successfully!');
    });

    it('should handle no active timer gracefully', async () => {
      // Mock no current tracking (404 = no active timer)
      mockAxios.onGet('/api/v4/tracking').reply(404);

      const result = await mockServer.handleStopTimer();

      expect(result.content?.[0]?.text).toContain('No active timer found to stop');
    });

    it('should handle API errors gracefully', async () => {
      // Mock authentication failure
      mockAxios.onPost('/api/v4/developer/sign-in').reply(401, {
        message: 'Invalid credentials'
      });

      const result = await mockServer.handleStopTimer();

      expect(result.content?.[0]?.text).toContain('Failed to stop timer');
    });
  });

  describe('API Client Tracking Methods', () => {
    it('should have startTracking method', () => {
      expect(typeof apiClient.startTracking).toBe('function');
    });

    it('should format tracking request correctly', async () => {
      let requestData: any;
      let requestUrl: string = '';
      
      mockAxios.onPost('/api/v4/tracking/activity-123/start').reply((config) => {
        requestData = JSON.parse(config.data);
        requestUrl = config.url || '';
        return [200, { id: 'new-tracking' }];
      });

      await apiClient.startTracking('activity-123', 'Test note');

      expect(requestUrl).toContain('/api/v4/tracking/activity-123/start');
      expect(requestData.note.text).toBe('Test note');
      expect(requestData.startedAt).toBeDefined();
      expect(requestData.activityId).toBeUndefined(); // activityId is now in URL, not body
    });

    it('should handle getCurrentTracking 404 correctly', async () => {
      mockAxios.onGet('/api/v4/tracking').reply(404);

      const result = await apiClient.getCurrentTracking();
      expect(result).toBeNull();
    });

    it('should stop tracking correctly', async () => {
      let requestData: any;
      
      mockAxios.onPost('/api/v4/tracking/stop').reply((config) => {
        requestData = JSON.parse(config.data);
        return [200, { id: 'track-123', stopped: true }];
      });

      const stoppedAt = '2024-01-10T12:00:00.000';
      await apiClient.stopTracking(stoppedAt);

      expect(requestData.stoppedAt).toBe(stoppedAt);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full start-stop cycle', async () => {
      // Step 1: Start timer (no current tracking)
      mockAxios.onGet('/api/v4/tracking').replyOnce(404);
      mockAxios.onPost('/api/v4/tracking/project-123/start').replyOnce(200, {
        id: 'tracking-123',
        activity: { name: 'Test Project' },
        duration: { startedAt: '2024-01-10T10:00:00.000' }
      });

      const startResult = await mockServer.handleStartTimer({
        projectId: 'project-123',
        description: 'Test task'
      });

      expect(startResult.content?.[0]?.text).toContain('Timer started successfully!');

      // Step 2: Stop timer (with active tracking)
      mockAxios.onGet('/api/v4/tracking').replyOnce(200, {
        id: 'tracking-123',
        activity: { name: 'Test Project' },
        duration: { startedAt: '2024-01-10T10:00:00.000' }
      });
      mockAxios.onPost('/api/v4/tracking/stop').replyOnce(200, {
        id: 'tracking-123',
        activity: { name: 'Test Project' },
        duration: { 
          startedAt: '2024-01-10T10:00:00.000',
          stoppedAt: '2024-01-10T11:00:00.000'
        }
      });

      const stopResult = await mockServer.handleStopTimer();

      expect(stopResult.content?.[0]?.text).toContain('Timer stopped successfully!');
    });

    it('should prevent starting multiple timers', async () => {
      // Step 1: Start first timer
      mockAxios.onGet('/api/v4/tracking').replyOnce(404);
      mockAxios.onPost('/api/v4/tracking/project-123/start').replyOnce(200, {
        id: 'tracking-123',
        activity: { name: 'First Project' },
        duration: { startedAt: '2024-01-10T10:00:00.000' }
      });

      const firstStart = await mockServer.handleStartTimer({
        projectId: 'project-123',
        description: 'First task'
      });

      expect(firstStart.content?.[0]?.text).toContain('Timer started successfully!');

      // Step 2: Try to start second timer (should be blocked)
      mockAxios.onGet('/api/v4/tracking').replyOnce(200, {
        id: 'tracking-123',
        activity: { name: 'First Project' },
        duration: { startedAt: '2024-01-10T10:00:00.000' }
      });

      const secondStart = await mockServer.handleStartTimer({
        projectId: 'project-456',
        description: 'Second task'
      });

      expect(secondStart.content?.[0]?.text).toContain('There\'s already an active timer running!');
    });
  });
});