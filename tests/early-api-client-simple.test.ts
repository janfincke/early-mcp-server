import { describe, it, expect } from '@jest/globals';
import { EarlyApiClient } from '../src/early-api-client.js';
import { EarlyConfig } from '../src/types.js';

describe('EarlyApiClient', () => {
  const config: EarlyConfig = {
    apiKey: 'test-api-key',
    apiSecret: 'test-api-secret',
    baseUrl: 'https://api.test.com',
    timeout: 5000,
  };

  describe('constructor', () => {
    it('should create client instance', () => {
      const client = new EarlyApiClient(config);
      expect(client).toBeInstanceOf(EarlyApiClient);
    });
  });

  describe('testConnection', () => {
    it('should return false for invalid connection', async () => {
      // This will fail because it's hitting a real (non-existent) endpoint
      const client = new EarlyApiClient(config);
      const result = await client.testConnection();
      expect(result).toBe(false);
    }, 10000); // 10 second timeout
  });

  describe('helper methods', () => {
    it('should have getTodayTimeEntries method', () => {
      const client = new EarlyApiClient(config);
      expect(typeof client.getTodayTimeEntries).toBe('function');
    });

    it('should have getActiveActivities method', () => {
      const client = new EarlyApiClient(config);
      expect(typeof client.getActiveActivities).toBe('function');
    });
  });
});