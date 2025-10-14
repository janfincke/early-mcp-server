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
import { formatLocalTime, formatDuration, getCurrentDateLocal } from './utils.js';

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
            return await this.handleCreateTimeEntry(request.params.arguments);
          
          case 'list_activities':
            return await this.handleListActivities(request.params.arguments as { active?: boolean } | undefined);
          
          case 'start_timer':
            return await this.handleStartTimer(request.params.arguments);
          
          case 'stop_timer':
            return await this.handleStopTimer();
          
          case 'get_time_entries':
            return await this.handleGetTimeEntries(request.params.arguments);
          
          case 'edit_time_entry':
            return await this.handleEditTimeEntry(request.params.arguments);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Tool not found: ${request.params.name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
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
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Resource not found: ${uri}`
            );
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
  private async handleCreateTimeEntry(args: any) {
    try {
      // Check if API client is configured
      if (!process.env['EARLY_API_KEY'] || !process.env['EARLY_API_SECRET']) {
        throw new Error('API credentials not found in environment variables');
      }

      const { projectId, description, startTime, endTime, duration } = args;
      
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      if (!description) {
        throw new Error('Description is required');
      }
      
      // Build the request object based on the Early API v4 structure
      const createRequest: any = {
        activityId: projectId, // Early API uses 'activityId' not 'projectId'
        note: {
          text: description
        }
      };
      
      // Helper function to format timestamps for Early API (without Z suffix)
      const formatTimestamp = (dateInput: string | Date): string => {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        return date.toISOString().replace('Z', '');
      };
      
      // Handle time parameters - prioritize startTime/endTime over duration
      if (startTime && endTime) {
        createRequest.startedAt = formatTimestamp(startTime);
        createRequest.stoppedAt = formatTimestamp(endTime);
      } else if (duration) {
        // If only duration is provided, create entry for current time minus duration
        const now = new Date();
        const start = new Date(now.getTime() - (duration * 60 * 1000));
        createRequest.startedAt = formatTimestamp(start);
        createRequest.stoppedAt = formatTimestamp(now);
      } else if (startTime && !endTime) {
        // If only start time is provided, assume it's still running (no stoppedAt)
        createRequest.startedAt = formatTimestamp(startTime);
      } else {
        // Default to current time if no time parameters provided
        createRequest.startedAt = formatTimestamp(new Date());
      }
      
      // Create the time entry
      const newEntry = await this.apiClient.createTimeEntry(createRequest);
      
      // Format response for user - handle the API response structure
      // The API response structure varies, so we need to be flexible
      const activityName = (newEntry as any).activity?.name || 'Unknown';
      const entryId = (newEntry as any).id || 'Unknown';
      const durationInfo = (newEntry as any).duration;
      
      let startTimeFormatted = 'Unknown';
      let endTimeFormatted = 'Still running';
      let durationText = 'In progress';
      
      if (durationInfo) {
        if (durationInfo.startedAt) {
          startTimeFormatted = formatLocalTime(durationInfo.startedAt);
        }
        if (durationInfo.stoppedAt) {
          endTimeFormatted = formatLocalTime(durationInfo.stoppedAt);
          durationText = formatDuration(durationInfo.startedAt, durationInfo.stoppedAt);
        }
      } else {
        // Fallback to using the request data if response doesn't have duration info
        startTimeFormatted = formatLocalTime(createRequest.startedAt);
        if (createRequest.stoppedAt) {
          endTimeFormatted = formatLocalTime(createRequest.stoppedAt);
          durationText = formatDuration(createRequest.startedAt, createRequest.stoppedAt);
        }
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Time entry created successfully!\n\nDetails:\n- Activity: ${activityName}\n- Description: ${description}\n- Start: ${startTimeFormatted}\n- End: ${endTimeFormatted}\n- Duration: ${durationText}\n- ID: ${entryId}\n\nRaw response: ${JSON.stringify(newEntry, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      const hasApiKey = !!process.env['EARLY_API_KEY'];
      const hasApiSecret = !!process.env['EARLY_API_SECRET'];
      
      // Enhanced error reporting
      let errorMsg = 'Unknown error';
      let errorDetails = '';
      
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      // Check if it's an API error with more details
      if (error && typeof error === 'object') {
        const apiError = error as any;
        if (apiError.code) {
          errorMsg = `API Error ${apiError.code}: ${apiError.message || errorMsg}`;
        }
        if (apiError.details) {
          errorDetails = `\n\nAPI Error Details: ${JSON.stringify(apiError.details, null, 2)}`;
        }
        // Also show the full error object for debugging
        errorDetails += `\n\nFull error object: ${JSON.stringify(error, null, 2)}`;
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to create time entry: ${errorMsg}\n\nDebug info:\n- API Key: ${hasApiKey ? 'Present' : 'Missing'}\n- API Secret: ${hasApiSecret ? 'Present' : 'Missing'}\n- Base URL: ${process.env['EARLY_BASE_URL'] || 'not set'}\n\nProvided arguments: ${JSON.stringify(args, null, 2)}${errorDetails}`,
          },
        ],
      };
    }
  }

  private async handleListActivities(args: { active?: boolean } | undefined) {
    try {
      // Check if API client is configured
      if (!process.env['EARLY_API_KEY'] || !process.env['EARLY_API_SECRET']) {
        throw new Error('API credentials not found in environment variables');
      }

      const activities = args?.active ? 
        await this.apiClient.getActiveActivities() : 
        await this.apiClient.getAllActivities();
      const activeActivities = activities.filter(a => a); // Filter out any null/undefined
      const filter = args?.active ? 'active only' : 'all activities';
      
      return {
        content: [
          {
            type: 'text',
            text: `Activities (${filter}): ${activeActivities.length} found\n\n${activeActivities.map((activity: any, i: number) => {
              return `${i + 1}. ${activity.name} (ID: ${activity.id})`;
            }).join('\n')}`,
          },
        ],
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const hasApiKey = !!process.env['EARLY_API_KEY'];
      const hasApiSecret = !!process.env['EARLY_API_SECRET'];
      
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to get activities: ${errorMsg}\n\nDebug info:\n- API Key: ${hasApiKey ? 'Present' : 'Missing'}\n- API Secret: ${hasApiSecret ? 'Present' : 'Missing'}\n- Base URL: ${process.env['EARLY_BASE_URL'] || 'not set'}`,
          },
        ],
      };
    }
  }

  private async handleStartTimer(args: any) {
    // TODO: Implement with actual API call
    return {
      content: [
        {
          type: 'text',
          text: `Timer started (placeholder): ${JSON.stringify(args)}`,
        },
      ],
    };
  }

  private async handleStopTimer() {
    // TODO: Implement with actual API call
    return {
      content: [
        {
          type: 'text',
          text: 'Timer stopped (placeholder)',
        },
      ],
    };
  }

  private async handleGetTimeEntries(args: any) {
    try {
      // Check if API client is configured
      if (!process.env['EARLY_API_KEY'] || !process.env['EARLY_API_SECRET']) {
        throw new Error('API credentials not found in environment variables');
      }

      let entries;
      
      if (args && args.startDate && args.endDate) {
        // Get entries for specific date range
        const startDateTime = args.startDate + 'T00:00:00.000';
        const endDateTime = args.endDate + 'T23:59:59.999';
        const response = await this.apiClient.getTimeEntriesInRange(startDateTime, endDateTime);
        entries = response.timeEntries || [];
      } else {
        // Default to today's entries
        entries = await this.apiClient.getTodayTimeEntries();
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `Found ${entries.length} time entries:\n\n${entries.map((entry: any, i: number) => {
              const activity = entry.activity?.name || 'Unknown';
              const start = formatLocalTime(entry.duration.startedAt);
              const end = formatLocalTime(entry.duration.stoppedAt);
              const duration = formatDuration(entry.duration.startedAt, entry.duration.stoppedAt);
              return `${i + 1}. ${activity}: ${start} - ${end} (${duration})`;
            }).join('\n')}`,
          },
        ],
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const hasApiKey = !!process.env['EARLY_API_KEY'];
      const hasApiSecret = !!process.env['EARLY_API_SECRET'];
      
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to get time entries: ${errorMsg}\n\nDebug info:\n- API Key: ${hasApiKey ? 'Present' : 'Missing'}\n- API Secret: ${hasApiSecret ? 'Present' : 'Missing'}\n- Base URL: ${process.env['EARLY_BASE_URL'] || 'not set'}`,
          },
        ],
      };
    }
  }

  private async handleEditTimeEntry(args: any) {
    try {
      // Check if API client is configured
      if (!process.env['EARLY_API_KEY'] || !process.env['EARLY_API_SECRET']) {
        throw new Error('API credentials not found in environment variables');
      }

      const { timeEntryId, startTime, endTime, activityId, description } = args;
      
      if (!timeEntryId) {
        throw new Error('Time entry ID is required');
      }

      // Build update request object
      const updateRequest: any = {};
      
      if (startTime) {
        updateRequest.startedAt = startTime;
      }
      
      if (endTime) {
        updateRequest.stoppedAt = endTime;
      }
      
      if (activityId) {
        updateRequest.activityId = activityId;
      }
      
      if (description !== undefined) {
        updateRequest.note = { text: description };
      }
      
      if (Object.keys(updateRequest).length === 0) {
        throw new Error('At least one field must be provided to update');
      }

      // Update the time entry
      const updatedEntry = await this.apiClient.updateTimeEntry(timeEntryId, updateRequest);
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Time entry updated successfully:\n\nID: ${timeEntryId}\nUpdated fields: ${Object.keys(updateRequest).join(', ')}\n\nEntry details:\n${JSON.stringify(updatedEntry, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const hasApiKey = !!process.env['EARLY_API_KEY'];
      const hasApiSecret = !!process.env['EARLY_API_SECRET'];
      
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to edit time entry: ${errorMsg}\n\nDebug info:\n- API Key: ${hasApiKey ? 'Present' : 'Missing'}\n- API Secret: ${hasApiSecret ? 'Present' : 'Missing'}\n- Base URL: ${process.env['EARLY_BASE_URL'] || 'not set'}`,
          },
        ],
      };
    }
  }

  // Resource handlers
  private async getTimeEntriesToday() {
    try {
      // Check if API client is configured
      if (!process.env['EARLY_API_KEY'] || !process.env['EARLY_API_SECRET']) {
        throw new Error('API credentials not found in environment variables');
      }
      
      const entries = await this.apiClient.getTodayTimeEntries();
      return {
        contents: [
          {
            uri: 'early://time-entries/today',
            mimeType: 'application/json',
            text: JSON.stringify({
              date: getCurrentDateLocal(),
              entries: entries,
              success: true,
              count: entries.length,
            }),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: 'early://time-entries/today',
            mimeType: 'application/json',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
              entries: [],
              success: false,
              debug: {
                hasApiKey: !!process.env['EARLY_API_KEY'],
                hasApiSecret: !!process.env['EARLY_API_SECRET'],
                baseUrl: process.env['EARLY_BASE_URL'] || 'not set',
              },
            }),
          },
        ],
      };
    }
  }

  private async getTimeEntriesWeek() {
    try {
      const entries = await this.apiClient.getThisWeekTimeEntries();
      return {
        contents: [
          {
            uri: 'early://time-entries/week',
            mimeType: 'application/json',
            text: JSON.stringify({
              week: 'current',
              entries: entries,
            }),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: 'early://time-entries/week',
            mimeType: 'application/json',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
              entries: [],
            }),
          },
        ],
      };
    }
  }

  private async getActivities() {
    try {
      const activities = await this.apiClient.getAllActivities();
      return {
        contents: [
          {
            uri: 'early://activities',
            mimeType: 'application/json',
            text: JSON.stringify({
              activities: activities,
            }),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: 'early://activities',
            mimeType: 'application/json',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
              activities: [],
            }),
          },
        ],
      };
    }
  }

  private async getActiveActivities() {
    try {
      const activities = await this.apiClient.getActiveActivities();
      return {
        contents: [
          {
            uri: 'early://activities/active',
            mimeType: 'application/json',
            text: JSON.stringify({
              activities: activities,
            }),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: 'early://activities/active',
            mimeType: 'application/json',
            text: JSON.stringify({
              error: error instanceof Error ? error.message : 'Unknown error',
              activities: [],
            }),
          },
        ],
      };
    }
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
