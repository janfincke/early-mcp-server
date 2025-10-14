import { EarlyApiClient } from '../early-api-client.js';
import { formatLocalTime, formatDuration } from '../utils.js';
import { checkApiCredentials, createToolErrorResponse } from '../error-utils.js';
import {
  CreateTimeEntryArgs,
  GetTimeEntriesArgs,
  EditTimeEntryArgs,
} from '../tool-types.js';

export async function handleCreateTimeEntry(apiClient: EarlyApiClient, args: CreateTimeEntryArgs) {
  try {
    checkApiCredentials();

    const { projectId, description, startTime, endTime, duration } = args;
    
    if (!projectId) {
      throw new Error('Activity ID is required');
    }
    
    if (!description) {
      throw new Error('Description is required');
    }
    
    const createRequest: any = {
      activityId: projectId,
      note: {
        text: description
      }
    };
    
    const formatTimestamp = (dateInput: string | Date): string => {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      return date.toISOString().replace('Z', '');
    };
    
    // Handle time parameters
    if (startTime && endTime) {
      createRequest.startedAt = formatTimestamp(startTime);
      createRequest.stoppedAt = formatTimestamp(endTime);
    } else if (duration) {
      const now = new Date();
      const start = new Date(now.getTime() - (duration * 60 * 1000));
      createRequest.startedAt = formatTimestamp(start);
      createRequest.stoppedAt = formatTimestamp(now);
    } else if (startTime && !endTime) {
      createRequest.startedAt = formatTimestamp(startTime);
    } else {
      createRequest.startedAt = formatTimestamp(new Date());
    }
    
    const newEntry = await apiClient.createTimeEntry(createRequest);
    
    // Format response
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
          text: `✅ Time entry created successfully!\n\nDetails:\n- Activity: ${activityName}\n- Description: ${description}\n- Start: ${startTimeFormatted}\n- End: ${endTimeFormatted}\n- Duration: ${durationText}\n- ID: ${entryId}`,
        },
      ],
    };
  } catch (error) {
    return createToolErrorResponse(error, {
      hasApiKey: !!process.env['EARLY_API_KEY'],
      hasApiSecret: !!process.env['EARLY_API_SECRET'],
      baseUrl: process.env['EARLY_BASE_URL'],
      args
    });
  }
}

export async function handleGetTimeEntries(apiClient: EarlyApiClient, args: GetTimeEntriesArgs) {
  try {
    checkApiCredentials();

    let entries;
    
    if (args?.startDate && args?.endDate) {
      const startDateTime = args.startDate + 'T00:00:00.000';
      const endDateTime = args.endDate + 'T23:59:59.999';
      const response = await apiClient.getTimeEntriesInRange(startDateTime, endDateTime);
      entries = response.timeEntries || [];
    } else {
      entries = await apiClient.getTodayTimeEntries();
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
    return createToolErrorResponse(error, {
      hasApiKey: !!process.env['EARLY_API_KEY'],
      hasApiSecret: !!process.env['EARLY_API_SECRET'],
      baseUrl: process.env['EARLY_BASE_URL'],
      args
    });
  }
}

export async function handleEditTimeEntry(apiClient: EarlyApiClient, args: EditTimeEntryArgs) {
  try {
    checkApiCredentials();

    const { timeEntryId, startTime, endTime, activityId, description } = args;
    
    if (!timeEntryId) {
      throw new Error('Time entry ID is required');
    }

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

    const updatedEntry = await apiClient.updateTimeEntry(timeEntryId, updateRequest);
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Time entry updated successfully:\n\nID: ${timeEntryId}\nUpdated fields: ${Object.keys(updateRequest).join(', ')}\n\nEntry details:\n${JSON.stringify(updatedEntry, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return createToolErrorResponse(error, {
      hasApiKey: !!process.env['EARLY_API_KEY'],
      hasApiSecret: !!process.env['EARLY_API_SECRET'],
      baseUrl: process.env['EARLY_BASE_URL'],
      args
    });
  }
}