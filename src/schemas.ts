/**
 * Zod schemas for MCP tool input/output validation
 */
import { z } from 'zod';

// ============================================
// Input Schemas for Tools
// ============================================

/**
 * Schema for create_time_entry tool
 */
export const CreateTimeEntryInputSchema = {
  projectId: z.string().describe('The ID of the activity to track time for'),
  description: z.string().describe('Description of the work being done'),
  startTime: z.string().optional().describe('Start time in ISO 8601 format (e.g., 2024-01-10T09:00:00)'),
  endTime: z.string().optional().describe('End time in ISO 8601 format (e.g., 2024-01-10T17:00:00)'),
  duration: z.number().optional().describe('Duration in minutes (alternative to specifying start/end times)'),
};

/**
 * Schema for get_time_entries tool
 */
export const GetTimeEntriesInputSchema = {
  startDate: z.string().optional().describe('Start date in YYYY-MM-DD format. Defaults to today if not specified.'),
  endDate: z.string().optional().describe('End date in YYYY-MM-DD format. Defaults to today if not specified.'),
  projectId: z.string().optional().describe('Filter entries by activity ID'),
};

/**
 * Schema for edit_time_entry tool
 */
export const EditTimeEntryInputSchema = {
  timeEntryId: z.string().describe('The ID of the time entry to edit'),
  startTime: z.string().optional().describe('New start time in ISO 8601 format'),
  endTime: z.string().optional().describe('New end time in ISO 8601 format'),
  activityId: z.string().optional().describe('New activity ID to assign this entry to'),
  description: z.string().optional().describe('New description/note for the entry'),
};

/**
 * Schema for delete_time_entry tool
 */
export const DeleteTimeEntryInputSchema = {
  timeEntryId: z.string().describe('The ID of the time entry to delete'),
};

/**
 * Schema for list_activities tool
 */
export const ListActivitiesInputSchema = {
  activeOnly: z.boolean().optional().default(false).describe('If true, only return active activities. Defaults to false (returns all activities).'),
};

/**
 * Schema for start_timer tool
 */
export const StartTimerInputSchema = {
  projectId: z.string().describe('The ID of the activity to start tracking'),
  description: z.string().optional().describe('Optional description of the task you are working on'),
};

/**
 * Schema for stop_timer tool (no input required)
 */
export const StopTimerInputSchema = {};

/**
 * Schema for get_active_timer tool (no input required)
 */
export const GetActiveTimerInputSchema = {};

// ============================================
// Output Schemas for Tools
// ============================================

/**
 * Output schema for time entry operations
 */
export const TimeEntryOutputSchema = {
  success: z.boolean(),
  id: z.string().optional(),
  activityName: z.string().optional(),
  description: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.string().optional(),
  message: z.string().optional(),
};

/**
 * Output schema for list activities
 */
export const ActivitiesOutputSchema = {
  success: z.boolean(),
  count: z.number(),
  activities: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
};

/**
 * Output schema for timer operations
 */
export const TimerOutputSchema = {
  success: z.boolean(),
  isRunning: z.boolean().optional(),
  id: z.string().optional(),
  activityName: z.string().optional(),
  description: z.string().optional(),
  startedAt: z.string().optional(),
  message: z.string().optional(),
};

/**
 * Output schema for get time entries
 */
export const TimeEntriesOutputSchema = {
  success: z.boolean(),
  count: z.number(),
  entries: z.array(z.object({
    id: z.string(),
    activityName: z.string(),
    startTime: z.string(),
    endTime: z.string().optional(),
    duration: z.string().optional(),
    description: z.string().optional(),
  })),
};
