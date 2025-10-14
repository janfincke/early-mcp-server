#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { EarlyApiClient } from './early-api-client.js';
import { EarlyConfig } from './types.js';
import { throwToolError, throwResourceError } from './error-utils.js';
import {
  CreateTimeEntryArgs,
  GetTimeEntriesArgs,
  EditTimeEntryArgs,
  ListActivitiesArgs,
  StartTimerArgs,
} from './tool-types.js';
import {
  handleCreateTimeEntry,
  handleGetTimeEntries,
  handleEditTimeEntry,
} from './handlers/time-entry-handlers.js';
import { handleListActivities } from './handlers/activity-handlers.js';
import { handleStartTimer, handleStopTimer } from './handlers/tracking-handlers.js';
import {
  getTimeEntriesToday,
  getTimeEntriesWeek,
  getActivities,
  getActiveActivities,
} from './handlers/resource-handlers.js';

class EarlyMcpServer {
  private server: Server;
  private apiClient: EarlyApiClient;

  constructor() {
    this.server = new Server(
      {
        name: 'early-app-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // Initialize API client with configuration
    const config: EarlyConfig = {
      apiKey: process.env['EARLY_API_KEY'] || '',
      apiSecret: process.env['EARLY_API_SECRET'] || '',
      baseUrl: process.env['EARLY_BASE_URL'] || 'https://api.early.app',
      timeout: 30000,
    };

    this.apiClient = new EarlyApiClient(config);

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_time_entry',
            description: 'Create a new time entry',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'Project ID' },
                description: { type: 'string', description: 'Time entry description' },
                startTime: { type: 'string', description: 'Start time (ISO 8601)' },
                endTime: { type: 'string', description: 'End time (ISO 8601)' },
                duration: { type: 'number', description: 'Duration in minutes' },
              },
              required: ['projectId', 'description'],
            },
          },
          {
            name: 'list_activities',
            description: 'Get all activities',
            inputSchema: {
              type: 'object',
              properties: {
                active: { type: 'boolean', description: 'Filter active projects only' },
              },
            },
          },
          {
            name: 'start_timer',
            description: 'Start tracking time for a project',
            inputSchema: {
              type: 'object',
              properties: {
                projectId: { type: 'string', description: 'Project ID' },
                description: { type: 'string', description: 'Task description' },
              },
              required: ['projectId'],
            },
          },
          {
            name: 'stop_timer',
            description: 'Stop the currently running timer',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_time_entries',
            description: 'Get time entries for a date range',
            inputSchema: {
              type: 'object',
              properties: {
                startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
                endDate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
                projectId: { type: 'string', description: 'Filter by project ID' },
              },
            },
          },
          {
            name: 'edit_time_entry',
            description: 'Edit an existing time entry',
            inputSchema: {
              type: 'object',
              properties: {
                timeEntryId: { type: 'string', description: 'ID of the time entry to edit' },
                startTime: { type: 'string', description: 'New start time (ISO 8601)' },
                endTime: { type: 'string', description: 'New end time (ISO 8601)' },
                activityId: { type: 'string', description: 'New activity ID' },
                description: { type: 'string', description: 'New description/note' },
              },
              required: ['timeEntryId'],
            },
          },
        ],
      };
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'early://time-entries/today',
            name: "Today's Time Entries",
            description: 'Time entries for today',
            mimeType: 'application/json',
          },
          {
            uri: 'early://time-entries/week',
            name: 'This Week Time Entries',
            description: 'Time entries for current week',
            mimeType: 'application/json',
          },
          {
            uri: 'early://activities',
            name: 'All Activities',
            description: 'List of all activities',
            mimeType: 'application/json',
          },
          {
            uri: 'early://activities/active',
            name: 'Active Activities',
            description: 'List of active activities only',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'create_time_entry':
            return await this.handleCreateTimeEntry(request.params.arguments as unknown as CreateTimeEntryArgs);
          
          case 'list_activities':
            return await this.handleListActivities(request.params.arguments as unknown as ListActivitiesArgs);
          
          case 'start_timer':
            return await this.handleStartTimer(request.params.arguments as unknown as StartTimerArgs);
          
          case 'stop_timer':
            return await this.handleStopTimer();
          
          case 'get_time_entries':
            return await this.handleGetTimeEntries(request.params.arguments as unknown as GetTimeEntriesArgs);
          
          case 'edit_time_entry':
            return await this.handleEditTimeEntry(request.params.arguments as unknown as EditTimeEntryArgs);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Tool not found: ${request.params.name}`
            );
        }
      } catch (error) {
        throwToolError(request.params.name, error instanceof Error ? error.message : String(error));
      }
    });

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      try {
        switch (uri) {
          case 'early://time-entries/today':
            return await this.getTimeEntriesToday();
          
          case 'early://time-entries/week':
            return await this.getTimeEntriesWeek();
          
          case 'early://activities':
            return await this.getActivities();
          
          case 'early://activities/active':
            return await this.getActiveActivities();
          
          default:
            throwResourceError(uri);
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Resource read failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  // Tool handlers
  private async handleCreateTimeEntry(args: CreateTimeEntryArgs) {
    return handleCreateTimeEntry(this.apiClient, args);
  }

  private async handleListActivities(args?: ListActivitiesArgs) {
    return handleListActivities(this.apiClient, args);
  }

  private async handleStartTimer(args: StartTimerArgs) {
    return handleStartTimer(this.apiClient, args);
  }

  private async handleStopTimer() {
    return handleStopTimer(this.apiClient);
  }

  private async handleGetTimeEntries(args: GetTimeEntriesArgs) {
    return handleGetTimeEntries(this.apiClient, args);
  }

  private async handleEditTimeEntry(args: EditTimeEntryArgs) {
    return handleEditTimeEntry(this.apiClient, args);
  }

  // Resource handlers
  private async getTimeEntriesToday() {
    return getTimeEntriesToday(this.apiClient);
  }

  private async getTimeEntriesWeek() {
    return getTimeEntriesWeek(this.apiClient);
  }

  private async getActivities() {
    return getActivities(this.apiClient);
  }

  private async getActiveActivities() {
    return getActiveActivities(this.apiClient);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    // Server status logging removed to prevent stdio interference
  }
}

const server = new EarlyMcpServer();
server.run().catch(() => {
  // Error handling removed to prevent stdio interference
  process.exit(1);
});
