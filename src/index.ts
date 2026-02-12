#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { EarlyApiClient } from "./early-api-client.js";
import { EarlyConfig } from "./types.js";
import {
  CreateTimeEntryInputSchema,
  GetTimeEntriesInputSchema,
  EditTimeEntryInputSchema,
  DeleteTimeEntryInputSchema,
  ListActivitiesInputSchema,
  StartTimerInputSchema,
  StopTimerInputSchema,
  GetActiveTimerInputSchema,
  TimeEntryOutputSchema,
  TimeEntriesOutputSchema,
  ActivitiesOutputSchema,
  TimerOutputSchema,
  UpdateActiveTimerInputSchema,
  CreateActivityInputSchema,
  UpdateActivityInputSchema,
  ArchiveActivityInputSchema,
} from "./schemas.js";
import {
  CreateTimeEntryArgs,
  GetTimeEntriesArgs,
  EditTimeEntryArgs,
  DeleteTimeEntryArgs,
  ListActivitiesArgs,
  StartTimerArgs,
  UpdateActiveTimerArgs,
  CreateActivityArgs,
  UpdateActivityArgs,
  ArchiveActivityArgs,
} from "./tool-types.js";
import {
  handleCreateTimeEntry,
  handleGetTimeEntries,
  handleEditTimeEntry,
  handleDeleteTimeEntry,
} from "./handlers/time-entry-handlers.js";
import {
  handleListActivities,
  handleCreateActivity,
  handleUpdateActivity,
  handleArchiveActivity,
} from "./handlers/activity-handlers.js";
import { 
  handleStartTimer, 
  handleStopTimer,
  handleGetActiveTimer,
  handleUpdateActiveTimer,
} from "./handlers/tracking-handlers.js";
import {
  getTimeEntriesToday,
  getTimeEntriesWeek,
  getActivities,
  getActiveActivities,
} from "./handlers/resource-handlers.js";

class EarlyMcpServer {
  private server: McpServer;
  private apiClient: EarlyApiClient;

  constructor() {
    this.server = new McpServer(
      {
        name: "early-app-mcp-server",
        version: "1.0.0",
      }
    );

    // Initialize API client with configuration
    const config: EarlyConfig = {
      apiKey: process.env["EARLY_API_KEY"] || "",
      apiSecret: process.env["EARLY_API_SECRET"] || "",
      baseUrl: "https://api.early.app",
      timeout: 30000,
    };

    this.apiClient = new EarlyApiClient(config);

    this.setupHandlers();
  }

  private setupHandlers() {
    // ============================================
    // Tools
    // ============================================

    // Create Time Entry
    this.server.registerTool(
      "create_time_entry",
      {
        title: "Create Time Entry",
        description: "Create a new time entry with flexible time parameters",
        inputSchema: CreateTimeEntryInputSchema as any,
        outputSchema: TimeEntryOutputSchema as any,
        annotations: {
          destructiveHint: false,
        },
      },
      async (args: any) => {
        return handleCreateTimeEntry(this.apiClient, args as CreateTimeEntryArgs);
      }
    );

    // Get Time Entries
    this.server.registerTool(
      "get_time_entries",
      {
        title: "Get Time Entries",
        description: "Get time entries for a date range",
        inputSchema: GetTimeEntriesInputSchema as any,
        outputSchema: TimeEntriesOutputSchema as any,
        annotations: {
          readOnlyHint: true,
        },
      },
      async (args: any) => {
        return handleGetTimeEntries(this.apiClient, args as GetTimeEntriesArgs);
      }
    );

    // Edit Time Entry
    this.server.registerTool(
      "edit_time_entry",
      {
        title: "Edit Time Entry",
        description: "Edit an existing time entry",
        inputSchema: EditTimeEntryInputSchema as any,
        outputSchema: TimeEntryOutputSchema as any,
        annotations: {
          destructiveHint: false,
        },
      },
      async (args: any) => {
        return handleEditTimeEntry(this.apiClient, args as EditTimeEntryArgs);
      }
    );

    // Delete Time Entry
    this.server.registerTool(
      "delete_time_entry",
      {
        title: "Delete Time Entry",
        description: "Delete a time entry by ID",
        inputSchema: DeleteTimeEntryInputSchema as any,
        outputSchema: TimeEntryOutputSchema as any, // Using generic output schema for simplicity
        annotations: {
          destructiveHint: true,
        },
      },
      async (args: any) => {
        return handleDeleteTimeEntry(this.apiClient, args as DeleteTimeEntryArgs);
      }
    );

    // List Activities
    this.server.registerTool(
      "list_activities",
      {
        title: "List Activities",
        description: "Get all activities",
        inputSchema: ListActivitiesInputSchema as any,
        outputSchema: ActivitiesOutputSchema as any,
        annotations: {
          readOnlyHint: true,
        },
      },
      async (args: any) => {
        return handleListActivities(this.apiClient, args as ListActivitiesArgs);
      }
    );

    // Create Activity
    this.server.registerTool(
      "create_activity",
      {
        title: "Create Activity",
        description: "Create a new activity (project)",
        inputSchema: CreateActivityInputSchema as any,
        outputSchema: ActivitiesOutputSchema as any, // Using generic output schema
        annotations: {
          destructiveHint: false,
        },
      },
      async (args: any) => {
        return handleCreateActivity(this.apiClient, args as CreateActivityArgs);
      }
    );

    // Update Activity
    this.server.registerTool(
      "update_activity",
      {
        title: "Update Activity",
        description: "Update an existing activity",
        inputSchema: UpdateActivityInputSchema as any,
        outputSchema: ActivitiesOutputSchema as any, // Using generic output schema
        annotations: {
          destructiveHint: false,
        },
      },
      async (args: any) => {
        return handleUpdateActivity(this.apiClient, args as UpdateActivityArgs);
      }
    );

    // Archive Activity
    this.server.registerTool(
      "archive_activity",
      {
        title: "Archive Activity",
        description: "Archive or delete an activity",
        inputSchema: ArchiveActivityInputSchema as any,
        outputSchema: ActivitiesOutputSchema as any, // Using generic output schema
        annotations: {
          destructiveHint: true,
        },
      },
      async (args: any) => {
        return handleArchiveActivity(this.apiClient, args as ArchiveActivityArgs);
      }
    );

    // Start Timer
    this.server.registerTool(
      "start_timer",
      {
        title: "Start Timer",
        description: "Start tracking time for an activity",
        inputSchema: StartTimerInputSchema as any,
        outputSchema: TimerOutputSchema as any,
        annotations: {
          destructiveHint: false,
        },
      },
      async (args: any) => {
        return handleStartTimer(this.apiClient, args as StartTimerArgs);
      }
    );

    // Stop Timer
    this.server.registerTool(
      "stop_timer",
      {
        title: "Stop Timer",
        description: "Stop the currently running timer",
        inputSchema: StopTimerInputSchema as any,
        outputSchema: TimerOutputSchema as any,
        annotations: {
          destructiveHint: false,
        },
      },
      async () => {
        return handleStopTimer(this.apiClient);
      }
    );

    // Get Active Timer
    this.server.registerTool(
      "get_active_timer",
      {
        title: "Get Active Timer",
        description: "Get information about the currently running timer",
        inputSchema: GetActiveTimerInputSchema as any,
        outputSchema: TimerOutputSchema as any,
        annotations: {
          readOnlyHint: true,
        },
      },
      async () => {
        return handleGetActiveTimer(this.apiClient);
      }
    );

    // Update Active Timer
    this.server.registerTool(
      "update_active_timer",
      {
        title: "Update Active Timer",
        description: "Update the description of the currently running timer",
        inputSchema: UpdateActiveTimerInputSchema as any,
        outputSchema: TimerOutputSchema as any,
        annotations: {
          destructiveHint: false,
        },
      },
      async (args: any) => {
        return handleUpdateActiveTimer(this.apiClient, args as UpdateActiveTimerArgs);
      }
    );

    // ============================================
    // Resources
    // ============================================

    this.server.registerResource(
      "today_time_entries",
      "early://time-entries/today",
      {
        title: "Today's Time Entries",
        description: "Time entries for today",
        mimeType: "application/json",
      },
      async () => {
        const result = await getTimeEntriesToday(this.apiClient);
        // McpServer resource callback expects ReadResourceResult which has 'contents' array
        return result;
      }
    );

    this.server.registerResource(
      "week_time_entries",
      "early://time-entries/week",
      {
        title: "This Week Time Entries",
        description: "Time entries for current week",
        mimeType: "application/json",
      },
      async () => {
        const result = await getTimeEntriesWeek(this.apiClient);
        return result;
      }
    );

    this.server.registerResource(
      "all_activities",
      "early://activities",
      {
        title: "All Activities",
        description: "List of all activities",
        mimeType: "application/json",
      },
      async () => {
        const result = await getActivities(this.apiClient);
        return result;
      }
    );

    this.server.registerResource(
      "active_activities",
      "early://activities/active",
      {
        title: "Active Activities",
        description: "List of active activities only",
        mimeType: "application/json",
      },
      async () => {
        const result = await getActiveActivities(this.apiClient);
        return result;
      }
    );
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



