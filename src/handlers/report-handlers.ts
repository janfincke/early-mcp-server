/* eslint-disable @typescript-eslint/no-explicit-any */
import { EarlyApiClient } from '../early-api-client.js';
import { checkApiCredentials, createToolErrorResponse } from '../error-utils.js';
import { GenerateReportArgs, EarlyTimeEntry } from '../tool-types.js';

export async function handleGenerateReport(apiClient: EarlyApiClient, args: GenerateReportArgs) {
  try {
    checkApiCredentials();

    const { startDate, endDate, projectId } = args;

    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    const startDateTime = startDate + 'T00:00:00.000';
    const endDateTime = endDate + 'T23:59:59.999';

    const response = await apiClient.getTimeEntriesInRange(startDateTime, endDateTime);
    let entries: EarlyTimeEntry[] = response.timeEntries || [];

    if (projectId) {
      // Note: Early API might support filtering by activityId directly if passed as query param,
      // but here we filter client-side as we fetch by range.
      // Wait, getTimeEntriesInRange only takes date range.
      // So we must filter here.
      // However, EarlyTimeEntry structure in tool-types says activity?: EarlyActivity.
      // We need to check entry.activity.id.
      // But entries from API are "any".
      entries = entries.filter((entry: any) => entry.activityId === projectId || entry.activity?.id === projectId);
    }

    // Aggregate data
    let totalDurationMs = 0;
    const activityMap = new Map<string, { name: string; durationMs: number; count: number }>();

    for (const entry of entries) {
        if (!entry.duration || !entry.duration.startedAt || !entry.duration.stoppedAt) {
            continue; // Skip running or invalid entries
        }

        const start = new Date(entry.duration.startedAt).getTime();
        const end = new Date(entry.duration.stoppedAt).getTime();
        const duration = end - start;
        
        totalDurationMs += duration;

        const activityName = entry.activity?.name || 'Unknown Activity';
        const activityId = entry.activity?.id || 'unknown';
        const key = activityId; // Use ID as key

        if (!activityMap.has(key)) {
            activityMap.set(key, { name: activityName, durationMs: 0, count: 0 });
        }
        
        const stats = activityMap.get(key)!;
        stats.durationMs += duration;
        stats.count += 1;
    }

    const totalMinutes = Math.round(totalDurationMs / 1000 / 60);
    const byActivity = Array.from(activityMap.entries()).map(([id, stats]) => {
        const minutes = Math.round(stats.durationMs / 1000 / 60);
        const percentage = totalMinutes > 0 ? ((minutes / totalMinutes) * 100).toFixed(1) + '%' : '0%';
        return {
            activityName: stats.name,
            activityId: id !== 'unknown' ? id : undefined,
            durationMinutes: minutes,
            durationFormatted: formatMinutes(minutes),
            percentage,
        };
    }).sort((a, b) => b.durationMinutes - a.durationMinutes);

    return {
      content: [
        {
          type: 'text' as const,
          text: `📊 Time Report (${startDate} to ${endDate})\n\n` +
                `Total Duration: ${formatMinutes(totalMinutes)}\n` +
                `Entries: ${entries.length}\n\n` +
                `By Activity:\n` +
                byActivity.map(a => `- ${a.activityName}: ${a.durationFormatted} (${a.percentage})`).join('\n'),
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

function formatMinutes(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) {
        return `${h}h ${m}m`;
    }
    return `${m}m`;
}

