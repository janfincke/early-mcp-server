/* eslint-disable @typescript-eslint/no-explicit-any */
import { EarlyApiClient } from "../early-api-client.js";
import { formatLocalTime, formatDuration } from "../utils.js";
import { checkApiCredentials, createToolErrorResponse } from "../error-utils.js";
import {
  CreateTimeEntryArgs,
  GetTimeEntriesArgs,
  EditTimeEntryArgs,
  EarlyTimeEntry,
} from "../tool-types.js";
import { CreateTimeEntryRequest, UpdateTimeEntryRequest } from "../types.js";

export async function handleCreateTimeEntry(apiClient: EarlyApiClient, args: CreateTimeEntryArgs) {
  try {
    checkApiCredentials();

    const { projectId, description, startTime, endTime, duration } = args;
    
    if (!projectId) {
      throw new Error("Activity ID is required");
    }
    
    if (!description) {
      throw new Error("Description is required");
    }
    
    interface CreateTimeEntryApiRequest {
      activityId: string;
      note: {
        text: string;
      };
      startedAt?: string;
      stoppedAt?: string;
    }

    const createRequest: CreateTimeEntryApiRequest = {
      activityId: projectId,
      note: {
        text: description
      }
    };
    
    const formatTimestamp = (dateInput: string | Date): string => {
      const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
      return date.toISOString().replace("Z", "");
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
    
    const newEntry = await apiClient.createTimeEntry(createRequest as unknown as CreateTimeEntryRequest);
    
    // Format response
    const entry = newEntry as unknown as EarlyTimeEntry;
    const activityName = entry.activity?.name || "Unknown";
    const entryId = entry.id || "Unknown";
    const durationInfo = entry.duration;
    
    let startTimeFormatted = "Unknown";
    let endTimeFormatted = "Still running";
    let durationText = "In progress";
    
    if (durationInfo) {
      if (durationInfo.startedAt) {
        startTimeFormatted = formatLocalTime(durationInfo.startedAt);
      }
      if (durationInfo.stoppedAt) {
        endTimeFormatted = formatLocalTime(durationInfo.stoppedAt);
        durationText = formatDuration(durationInfo.startedAt, durationInfo.stoppedAt);
      }
    } else {
      startTimeFormatted = formatLocalTime(createRequest.startedAt as string);
      if (createRequest.stoppedAt) {
        endTimeFormatted = formatLocalTime(createRequest.stoppedAt);
        durationText = formatDuration(createRequest.startedAt as string, createRequest.stoppedAt);
      }
    }
    
    return {
      content: [
        {
          type: "text" as const,
          text: `✅ Time entry created successfully!\n\nDetails:\n- Activity: ${activityName}\n- Description: ${description}\n- Start: ${startTimeFormatted}\n- End: ${endTimeFormatted}\n- Duration: ${durationText}\n- ID: ${entryId}`,
        },
      ],
    };
  } catch (error) {
    return createToolErrorResponse(error, {
      hasApiKey: !!process.env["EARLY_API_KEY"],
      hasApiSecret: !!process.env["EARLY_API_SECRET"],
      args
    });
  }
}

export async function handleGetTimeEntries(apiClient: EarlyApiClient, args: GetTimeEntriesArgs) {
  try {
    checkApiCredentials();

    let entries;
    
    if (args?.startDate && args?.endDate) {
      const startDateTime = args.startDate + "T00:00:00.000";
      const endDateTime = args.endDate + "T23:59:59.999";
      const response = await apiClient.getTimeEntriesInRange(startDateTime, endDateTime);
      entries = response.timeEntries || [];
    } else {
      entries = await apiClient.getTodayTimeEntries();
    }
    
    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${entries.length} time entries:\n\n${entries.map((entry: EarlyTimeEntry, i: number) => {
            const activity = entry.activity?.name || "Unknown";
            const start = formatLocalTime(entry.duration.startedAt);
            const end = entry.duration.stoppedAt ? formatLocalTime(entry.duration.stoppedAt) : "Running";
            const duration = entry.duration.stoppedAt ? formatDuration(entry.duration.startedAt, entry.duration.stoppedAt) : "Running";
            return `${i + 1}. ${activity}: ${start} - ${end} (${duration})`;
          }).join("\n")}`,
        },
      ],
    };
  } catch (error) {
    return createToolErrorResponse(error, {
      hasApiKey: !!process.env["EARLY_API_KEY"],
      hasApiSecret: !!process.env["EARLY_API_SECRET"],
      args
    });
  }
}

export async function handleEditTimeEntry(apiClient: EarlyApiClient, args: EditTimeEntryArgs) {
  try {
    checkApiCredentials();

    const { timeEntryId, startTime, endTime, activityId, description } = args;
    
    if (!timeEntryId) {
      throw new Error("Time entry ID is required");
    }

    interface UpdateTimeEntryApiRequest {
      activityId?: string;
      note?: {
        text: string;
      };
      startedAt?: string;
      stoppedAt?: string;
    }

    const updateRequest: UpdateTimeEntryApiRequest = {};
    
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
      throw new Error("At least one field must be provided to update");
    }

    const updatedEntry = await apiClient.updateTimeEntry(timeEntryId, updateRequest as unknown as UpdateTimeEntryRequest);
    
    return {
      content: [
        {
          type: "text" as const,
          text: `✅ Time entry updated successfully:\n\nID: ${timeEntryId}\nUpdated fields: ${Object.keys(updateRequest).join(", ")}\n\nEntry details:\n${JSON.stringify(updatedEntry, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return createToolErrorResponse(error, {
      hasApiKey: !!process.env["EARLY_API_KEY"],
      hasApiSecret: !!process.env["EARLY_API_SECRET"],
      args
    });
  }
}

export async function handleDeleteTimeEntry(apiClient: EarlyApiClient, args: { timeEntryId: string }) {
  try {
    checkApiCredentials();

    const { timeEntryId } = args;
    
    if (!timeEntryId) {
      throw new Error("Time entry ID is required");
    }

    await apiClient.deleteTimeEntry(timeEntryId);
    
    return {
      content: [
        {
          type: "text" as const,
          text: `✅ Time entry deleted successfully (ID: ${timeEntryId})`,
        },
      ],
    };
  } catch (error) {
    return createToolErrorResponse(error, {
      hasApiKey: !!process.env["EARLY_API_KEY"],
      hasApiSecret: !!process.env["EARLY_API_SECRET"],
      args
    });
  }
}

