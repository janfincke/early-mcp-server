import { EarlyApiClient } from '../early-api-client.js';
import { getCurrentDateLocal } from '../utils.js';
import { checkApiCredentials, createResourceErrorResponse } from '../error-utils.js';

export async function getTimeEntriesToday(apiClient: EarlyApiClient) {
  try {
    checkApiCredentials();
    
    const entries = await apiClient.getTodayTimeEntries();
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
    return createResourceErrorResponse(error, 'early://time-entries/today');
  }
}

export async function getTimeEntriesWeek(apiClient: EarlyApiClient) {
  try {
    const entries = await apiClient.getThisWeekTimeEntries();
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
    return createResourceErrorResponse(error, 'early://time-entries/week');
  }
}

export async function getActivities(apiClient: EarlyApiClient) {
  try {
    const activities = await apiClient.getAllActivities();
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
    return createResourceErrorResponse(error, 'early://activities');
  }
}

export async function getActiveActivities(apiClient: EarlyApiClient) {
  try {
    const activities = await apiClient.getActiveActivities();
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
    return createResourceErrorResponse(error, 'early://activities/active');
  }
}