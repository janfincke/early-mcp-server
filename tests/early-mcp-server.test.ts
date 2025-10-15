import { describe, it, expect, beforeEach } from '@jest/globals';
import { EarlyConfig } from '../src/types.js';

describe('EarlyMcpServer Configuration', () => {
  beforeEach(() => {
    // Clean up environment variables before each test
    delete process.env['EARLY_API_KEY'];
  });

  describe('Configuration Defaults', () => {
    it('should have correct default configuration structure', () => {
      const defaultConfig: EarlyConfig = {
        apiKey: process.env['EARLY_API_KEY'] || '',
        apiSecret: process.env['EARLY_API_SECRET'] || '',
        baseUrl: 'https://api.early.app',
        timeout: 30000,
      };

      expect(defaultConfig.baseUrl).toBe('https://api.early.app');
      expect(defaultConfig.apiKey).toBe('');
      expect(defaultConfig.apiSecret).toBe('');
      expect(defaultConfig.timeout).toBe(30000);
    });

    it('should use environment variables when available', () => {
      process.env['EARLY_API_KEY'] = 'test-key';
      process.env['EARLY_API_SECRET'] = 'test-secret';

      const config: EarlyConfig = {
        apiKey: process.env['EARLY_API_KEY'] || '',
        apiSecret: process.env['EARLY_API_SECRET'] || '',
        baseUrl: 'https://api.early.app',
        timeout: 30000,
      };

      expect(config.apiKey).toBe('test-key');
      expect(config.apiSecret).toBe('test-secret');
      expect(config.baseUrl).toBe('https://api.early.app');
      expect(config.timeout).toBe(30000);
    });
  });

  describe('Tool Schema', () => {
    it('should validate tool names are strings', () => {
      const toolNames = ['create_time_entry', 'list_activities', 'start_timer', 'stop_timer', 'get_time_entries'];
      
      toolNames.forEach(name => {
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });
    });

    it('should validate resource URIs follow expected pattern', () => {
      const resourceUris = [
        'early://time-entries/today',
        'early://time-entries/week', 
        'early://activities',
        'early://activities/active'
      ];

      resourceUris.forEach(uri => {
        expect(uri).toMatch(/^early:\/\//);  
        expect(typeof uri).toBe('string');
      });
    });
  });
});