import { EarlyApiClient } from "../early-api-client.js";
import { checkApiCredentials, createToolErrorResponse } from "../error-utils.js";
import { StartTimerArgs } from "../tool-types.js";

export async function handleStartTimer(apiClient: EarlyApiClient, args: StartTimerArgs) {
    try {
        checkApiCredentials();

        const { projectId, description } = args;

        if (!projectId) {
            throw new Error("Activity ID is required to start timer");
        }

        const newTracking = await apiClient.startTracking(projectId, description);

        const activityName = newTracking?.activity?.name || "Unknown";
        const trackingId = newTracking?.id || "Unknown";
        const startedAt = "Now";
        const note = newTracking?.note?.text || description || "No description";

        return {
            content: [
                {
                    type: "text" as const,
                    text: `⏱️ Timer started successfully!\n\nDetails:\n- Activity: ${activityName}\n- Description: ${note}\n- Started: ${startedAt}\n- ID: ${trackingId}\n\nTimer is now running...`,
                },
            ],
        };
    } catch (error) {
        return createToolErrorResponse(error, {
            hasApiKey: !!process.env["EARLY_API_KEY"],
            hasApiSecret: !!process.env["EARLY_API_SECRET"],
            args,
        });
    }
}

export async function handleStopTimer(apiClient: EarlyApiClient) {
    try {
        checkApiCredentials();

        // Get current tracking session
        let currentTracking = null;
        try {
            currentTracking = await apiClient.getCurrentTracking();
        } catch (trackingError) {
            return {
                content: [
                    {
                        type: "text" as const,
                        text: `⚠️ No active timer found to stop.\n\nThere is currently no timer running. Use \`start_timer\` to begin tracking time for an activity.`,
                    },
                ],
            };
        }

        if (!currentTracking || !currentTracking.id) {
            return {
                content: [
                    {
                        type: "text" as const,
                        text: `⚠️ No active timer found to stop.\n\nThere is currently no timer running. Use \`start_timer\` to begin tracking time for an activity.`,
                    },
                ],
            };
        }

        const stoppedAt = new Date().toISOString().replace("Z", "");
        const stoppedTracking = await apiClient.stopTracking(stoppedAt);

        const activityName = stoppedTracking?.activity?.name || "Unknown";
        const trackingId = stoppedTracking?.id || "Unknown";
        const note = stoppedTracking?.note?.text || "No description";

        return {
            content: [
                {
                    type: "text" as const,
                    text: `⏹️ Timer stopped successfully!\n\nFinal Summary:\n- Activity: ${activityName}\n- Description: ${note}\n- ID: ${trackingId}\n\nTime entry has been saved.`,
                },
            ],
        };
    } catch (error) {
        return createToolErrorResponse(error, {
            hasApiKey: !!process.env["EARLY_API_KEY"],
            hasApiSecret: !!process.env["EARLY_API_SECRET"],
        });
    }
}

export async function handleGetActiveTimer(apiClient: EarlyApiClient) {
    try {
        checkApiCredentials();

        const currentTracking = await apiClient.getCurrentTracking();

        if (!currentTracking || !currentTracking.id) {
            return {
                content: [
                    {
                        type: "text" as const,
                        text: "No active timer is currently running.",
                    },
                ],
            };
        }

        const activityName = currentTracking.activity?.name || "Unknown";
        const trackingId = currentTracking.id;
        const note = currentTracking.note?.text || "No description";
        const startedAt = currentTracking.duration?.startedAt 
            ? new Date(currentTracking.duration.startedAt).toLocaleTimeString() 
            : "Unknown";

        return {
            content: [
                {
                    type: "text" as const,
                    text: `⏱️ Active Timer Running\n\n- Activity: ${activityName}\n- Description: ${note}\n- Started: ${startedAt}\n- ID: ${trackingId}`,
                },
            ],
        };
    } catch (error) {
        return createToolErrorResponse(error, {
            hasApiKey: !!process.env["EARLY_API_KEY"],
            hasApiSecret: !!process.env["EARLY_API_SECRET"],
        });
    }
}
