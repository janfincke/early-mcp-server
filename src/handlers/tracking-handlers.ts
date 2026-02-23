import { EarlyApiClient } from "../early-api-client.js";
import { checkApiCredentials, createToolErrorResponse } from "../error-utils.js";
import { StartTimerArgs, UpdateActiveTimerArgs } from "../tool-types.js";

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
        const startedAt = newTracking?.duration?.startedAt || new Date().toISOString();
        const note = newTracking?.note?.text || description || "No description";

        return {
            content: [
                {
                    type: "resource" as const,
                    resource: {
                        uri: 'early://timer/started',
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            success: true,
                            isRunning: true,
                            id: trackingId,
                            activityName: activityName,
                            description: note,
                            startedAt: startedAt,
                            message: `Timer started successfully for ${activityName}`
                        }, null, 2)
                    }
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
                        type: "resource" as const,
                        resource: {
                            uri: 'early://timer/stopped',
                            mimeType: 'application/json',
                            text: JSON.stringify({
                                success: false,
                                isRunning: false,
                                message: "No active timer found to stop"
                            }, null, 2)
                        }
                    },
                ],
            };
        }

        if (!currentTracking || !currentTracking.id) {
            return {
                content: [
                    {
                        type: "resource" as const,
                        resource: {
                            uri: 'early://timer/stopped',
                            mimeType: 'application/json',
                            text: JSON.stringify({
                                success: false,
                                isRunning: false,
                                message: "No active timer found to stop"
                            }, null, 2)
                        }
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
                    type: "resource" as const,
                    resource: {
                        uri: 'early://timer/stopped',
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            success: true,
                            isRunning: false,
                            id: trackingId,
                            activityName: activityName,
                            description: note,
                            message: `Timer stopped successfully for ${activityName}`
                        }, null, 2)
                    }
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
                        type: "resource" as const,
                        resource: {
                            uri: 'early://timer/active',
                            mimeType: 'application/json',
                            text: JSON.stringify({
                                success: true,
                                isRunning: false,
                                message: "No active timer is currently running."
                            }, null, 2)
                        }
                    },
                ],
            };
        }

        const activityName = currentTracking.activity?.name || "Unknown";
        const trackingId = currentTracking.id;
        const note = currentTracking.note?.text || "No description";
        const startedAt = currentTracking.duration?.startedAt || null;

        return {
            content: [
                {
                    type: "resource" as const,
                    resource: {
                        uri: 'early://timer/active',
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            success: true,
                            isRunning: true,
                            id: trackingId,
                            activityName: activityName,
                            description: note,
                            startedAt: startedAt
                        }, null, 2)
                    }
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

export async function handleUpdateActiveTimer(apiClient: EarlyApiClient, args: UpdateActiveTimerArgs) {
    try {
        checkApiCredentials();

        const { description } = args;

        const currentTracking = await apiClient.getCurrentTracking();

        if (!currentTracking || !currentTracking.id) {
            return {
                content: [
                    {
                        type: "resource" as const,
                        resource: {
                            uri: 'early://timer/updated',
                            mimeType: 'application/json',
                            text: JSON.stringify({
                                success: false,
                                isRunning: false,
                                message: "No active timer found to update"
                            }, null, 2)
                        }
                    },
                ],
            };
        }

        const updatedTracking = await apiClient.editTracking(currentTracking.id, description);

        const activityName = updatedTracking?.activity?.name || "Unknown";
        const trackingId = updatedTracking?.id || "Unknown";
        const note = updatedTracking?.note?.text || description || "No description";
        const startedAt = updatedTracking?.duration?.startedAt || null;

        return {
            content: [
                {
                    type: "resource" as const,
                    resource: {
                        uri: 'early://timer/updated',
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            success: true,
                            isRunning: true,
                            id: trackingId,
                            activityName: activityName,
                            description: note,
                            startedAt: startedAt,
                            message: `Timer updated successfully for ${activityName}`
                        }, null, 2)
                    }
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
