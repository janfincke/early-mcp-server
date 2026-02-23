/* eslint-disable @typescript-eslint/no-explicit-any */
import { EarlyApiClient } from '../early-api-client.js';
import { checkApiCredentials, createToolErrorResponse } from '../error-utils.js';
import { ListActivitiesArgs, CreateActivityArgs, UpdateActivityArgs, ArchiveActivityArgs } from '../tool-types.js';
import { CreateProjectRequest, UpdateProjectRequest } from '../types.js';

export async function handleListActivities(apiClient: EarlyApiClient, args?: ListActivitiesArgs) {
  try {
    checkApiCredentials();

    if (args?.active) {
      const activities = await apiClient.getActiveActivities();
      const activeActivities = activities.filter(a => a);
      
      return {
        content: [
          {
            type: 'resource' as const,
            resource: {
              uri: 'early://activities/active',
              mimeType: 'application/json',
              text: JSON.stringify({
                success: true,
                count: activeActivities.length,
                activities: activeActivities.map((activity: any) => ({
                  id: activity.id,
                  name: activity.name,
                  status: 'active'
                }))
              }, null, 2)
            }
          },
        ],
      };
    }

    // Get full response with all activity types
    const response = await apiClient.getActivities();
    
    const allActivities = [
      ...((response.activities || []).map((a: any) => ({ ...a, status: 'active' }))),
      ...((response.inactiveActivities || []).map((a: any) => ({ ...a, status: 'inactive' }))),
      ...((response.archivedActivities || []).map((a: any) => ({ ...a, status: 'archived' }))),
    ].filter(a => a);
    
    return {
      content: [
        {
          type: 'resource' as const,
          resource: {
            uri: 'early://activities/all',
            mimeType: 'application/json',
            text: JSON.stringify({
              success: true,
              count: allActivities.length,
              activities: allActivities.map((activity: any) => ({
                id: activity.id,
                name: activity.name,
                status: activity.status
              }))
            }, null, 2)
          }
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
