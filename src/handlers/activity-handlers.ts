/* eslint-disable @typescript-eslint/no-explicit-any */
import { EarlyApiClient } from '../early-api-client.js';
import { checkApiCredentials, createToolErrorResponse } from '../error-utils.js';
import { ListActivitiesArgs, CreateActivityArgs, UpdateActivityArgs, ArchiveActivityArgs } from '../tool-types.js';
import { CreateProjectRequest, UpdateProjectRequest } from '../types.js';

export async function handleListActivities(apiClient: EarlyApiClient, args?: ListActivitiesArgs) {
  try {
    checkApiCredentials();

    const activities = args?.active ? 
      await apiClient.getActiveActivities() : 
      await apiClient.getAllActivities();
    
    const activeActivities = activities.filter(a => a);
    const filter = args?.active ? 'active only' : 'all activities';
    
    return {
      content: [
        {
          type: 'text' as const,
          text: `Activities (${filter}): ${activeActivities.length} found\n\n${activeActivities.map((activity: { id: string; name: string }, i: number) => {
            return `${i + 1}. ${activity.name} (ID: ${activity.id})`;
          }).join('\n')}`,
        },
      ],
    };
  } catch (error) {
    return createToolErrorResponse(error, {
      hasApiKey: !!process.env['EARLY_API_KEY'],
      hasApiSecret: !!process.env['EARLY_API_SECRET'],
      args
    });
  }
}

export async function handleCreateActivity(apiClient: EarlyApiClient, args: CreateActivityArgs) {
  try {
    checkApiCredentials();

    const request: CreateProjectRequest = {
      name: args.name,
    };
    if (args.description) request.description = args.description;
    if (args.color) request.color = args.color;
    if (args.clientId) request.clientId = args.clientId;
    if (args.billable !== undefined) request.billable = args.billable;

    const newActivity = await apiClient.createActivity(request);

    return {
      content: [
        {
          type: 'text' as const,
          text: `✅ Activity created successfully!\n\nName: ${newActivity.name}\nID: ${newActivity.id}\nDescription: ${newActivity.description || 'None'}`,
        },
      ],
    };
  } catch (error) {
    return createToolErrorResponse(error, {
      hasApiKey: !!process.env['EARLY_API_KEY'],
      hasApiSecret: !!process.env['EARLY_API_SECRET'],
      args
    });
  }
}

export async function handleUpdateActivity(apiClient: EarlyApiClient, args: UpdateActivityArgs) {
  try {
    checkApiCredentials();

    const { activityId, ...rest } = args;
    
    if (!activityId) {
      throw new Error('Activity ID is required');
    }

    const request: UpdateProjectRequest = {
      ...rest
    };

    if (Object.keys(request).length === 0) {
      throw new Error('At least one field must be provided to update');
    }

    const updatedActivity = await apiClient.updateActivity(activityId, request);

    return {
      content: [
        {
          type: 'text' as const,
          text: `✅ Activity updated successfully!\n\nID: ${activityId}\nName: ${updatedActivity.name}\nUpdated fields: ${Object.keys(request).join(', ')}`,
        },
      ],
    };
  } catch (error) {
    return createToolErrorResponse(error, {
      hasApiKey: !!process.env['EARLY_API_KEY'],
      hasApiSecret: !!process.env['EARLY_API_SECRET'],
      args
    });
  }
}

export async function handleArchiveActivity(apiClient: EarlyApiClient, args: ArchiveActivityArgs) {
  try {
    checkApiCredentials();

    const { activityId } = args;
    
    if (!activityId) {
      throw new Error('Activity ID is required');
    }

    await apiClient.archiveActivity(activityId);

    return {
      content: [
        {
          type: 'text' as const,
          text: `✅ Activity archived/deleted successfully (ID: ${activityId})`,
        },
      ],
    };
  } catch (error) {
    return createToolErrorResponse(error, {
      hasApiKey: !!process.env['EARLY_API_KEY'],
      hasApiSecret: !!process.env['EARLY_API_SECRET'],
      args
    });
  }
}
