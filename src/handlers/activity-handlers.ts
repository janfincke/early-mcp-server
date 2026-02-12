/* eslint-disable @typescript-eslint/no-explicit-any */
import { EarlyApiClient } from '../early-api-client.js';
import { checkApiCredentials, createToolErrorResponse } from '../error-utils.js';
import { ListActivitiesArgs } from '../tool-types.js';

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
