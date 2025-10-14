import { describe, it, expect } from '@jest/globals';
import { 
  EarlyConfig,
  TimeEntry,
  Project,
  CreateTimeEntryRequest,
  ActiveTimer,
  TimeReport,
  User,
  UserSettings,
  ApiResponse,
  PaginatedResponse,
  ApiError,
} from '../src/types.js';

describe('Type Definitions', () => {
  describe('EarlyConfig', () => {
    it('should define the correct shape for EarlyConfig', () => {
      const config: EarlyConfig = {
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        baseUrl: 'https://api.test.com',
        timeout: 5000,
      };

      expect(config.apiKey).toBe('test-key');
      expect(config.apiSecret).toBe('test-secret');
      expect(config.baseUrl).toBe('https://api.test.com');
      expect(config.timeout).toBe(5000);
    });
  });

  describe('TimeEntry', () => {
    it('should define the correct shape for TimeEntry', () => {
      const timeEntry: TimeEntry = {
        id: 'entry-1',
        projectId: 'project-1',
        userId: 'user-1',
        description: 'Test task',
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
        duration: 60,
        isRunning: false,
        tags: ['work', 'development'],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T11:00:00Z',
      };

      expect(timeEntry.id).toBe('entry-1');
      expect(timeEntry.projectId).toBe('project-1');
      expect(timeEntry.userId).toBe('user-1');
      expect(timeEntry.description).toBe('Test task');
      expect(timeEntry.isRunning).toBe(false);
      expect(timeEntry.tags).toEqual(['work', 'development']);
    });

    it('should allow optional fields to be undefined', () => {
      const timeEntry: TimeEntry = {
        id: 'entry-1',
        projectId: 'project-1',
        userId: 'user-1',
        description: 'Test task',
        startTime: '2024-01-01T10:00:00Z',
        isRunning: true,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      };

      expect(timeEntry.endTime).toBeUndefined();
      expect(timeEntry.duration).toBeUndefined();
      expect(timeEntry.tags).toBeUndefined();
    });
  });

  describe('Project', () => {
    it('should define the correct shape for Project', () => {
      const project: Project = {
        id: 'project-1',
        name: 'Test Project',
        description: 'A test project',
        color: '#FF0000',
        isActive: true,
        clientId: 'client-1',
        billable: true,
        hourlyRate: 100,
        currency: 'USD',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(project.id).toBe('project-1');
      expect(project.name).toBe('Test Project');
      expect(project.isActive).toBe(true);
      expect(project.billable).toBe(true);
      expect(project.hourlyRate).toBe(100);
    });

    it('should allow optional fields to be undefined', () => {
      const project: Project = {
        id: 'project-1',
        name: 'Minimal Project',
        isActive: true,
        billable: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(project.description).toBeUndefined();
      expect(project.color).toBeUndefined();
      expect(project.clientId).toBeUndefined();
      expect(project.hourlyRate).toBeUndefined();
      expect(project.currency).toBeUndefined();
    });
  });

  describe('CreateTimeEntryRequest', () => {
    it('should define the correct shape', () => {
      const request: CreateTimeEntryRequest = {
        projectId: 'project-1',
        description: 'New task',
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
        duration: 60,
        tags: ['work'],
      };

      expect(request.projectId).toBe('project-1');
      expect(request.description).toBe('New task');
      expect(request.duration).toBe(60);
    });
  });

  describe('ActiveTimer', () => {
    it('should define the correct shape', () => {
      const timer: ActiveTimer = {
        id: 'timer-1',
        projectId: 'project-1',
        description: 'Active task',
        startTime: '2024-01-01T10:00:00Z',
        duration: 30,
        isRunning: true,
      };

      expect(timer.id).toBe('timer-1');
      expect(timer.projectId).toBe('project-1');
      expect(timer.isRunning).toBe(true);
      expect(timer.duration).toBe(30);
    });
  });

  describe('ApiResponse', () => {
    it('should define the correct shape for successful response', () => {
      const response: ApiResponse<Project> = {
        success: true,
        data: {
          id: '1',
          name: 'Test Project',
          isActive: true,
          billable: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        message: 'Success',
      };

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.name).toBe('Test Project');
    });

    it('should define the correct shape for error response', () => {
      const response: ApiResponse<Project> = {
        success: false,
        error: 'Not found',
        message: 'Project not found',
      };

      expect(response.success).toBe(false);
      expect(response.error).toBe('Not found');
      expect(response.data).toBeUndefined();
    });
  });

  describe('PaginatedResponse', () => {
    it('should define the correct shape', () => {
      const response: PaginatedResponse<Project> = {
        data: [
          {
            id: '1',
            name: 'Project 1',
            isActive: true,
            billable: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          limit: 10,
          offset: 0,
          total: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      expect(response.data).toHaveLength(1);
      expect(response.pagination.limit).toBe(10);
      expect(response.pagination.total).toBe(1);
      expect(response.pagination.hasNext).toBe(false);
    });
  });

  describe('ApiError', () => {
    it('should define the correct shape', () => {
      const error: ApiError = {
        code: '404',
        message: 'Not found',
        details: {
          resource: 'project',
          id: 'nonexistent',
        },
      };

      expect(error.code).toBe('404');
      expect(error.message).toBe('Not found');
      expect(error.details?.['resource']).toBe('project');
    });

    it('should allow optional details', () => {
      const error: ApiError = {
        code: '500',
        message: 'Internal server error',
      };

      expect(error.code).toBe('500');
      expect(error.details).toBeUndefined();
    });
  });

  describe('User', () => {
    it('should define the correct shape', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24',
        weekStart: 1, // Monday
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(user.id).toBe('user-1');
      expect(user.email).toBe('test@example.com');
      expect(user.weekStart).toBe(1);
    });
  });

  describe('UserSettings', () => {
    it('should define the correct shape with all optional fields', () => {
      const settings: UserSettings = {
        timezone: 'Europe/London',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12',
        weekStart: 0, // Sunday
      };

      expect(settings.timezone).toBe('Europe/London');
      expect(settings.dateFormat).toBe('DD/MM/YYYY');
      expect(settings.weekStart).toBe(0);
    });

    it('should allow empty settings object', () => {
      const settings: UserSettings = {};

      expect(settings.timezone).toBeUndefined();
      expect(settings.dateFormat).toBeUndefined();
      expect(settings.timeFormat).toBeUndefined();
      expect(settings.weekStart).toBeUndefined();
    });
  });

  describe('TimeReport', () => {
    it('should define the correct shape', () => {
      const report: TimeReport = {
        period: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
        totalTime: 160 * 60, // 160 hours in minutes
        billableTime: 120 * 60, // 120 hours in minutes
        projects: [
          {
            projectId: 'project-1',
            projectName: 'Test Project',
            totalTime: 160 * 60,
            billableTime: 120 * 60,
            entryCount: 20,
          },
        ],
        entries: [],
      };

      expect(report.period.startDate).toBe('2024-01-01');
      expect(report.totalTime).toBe(160 * 60);
      expect(report.projects).toHaveLength(1);
      expect(report.projects[0]?.projectName).toBe('Test Project');
    });
  });
});