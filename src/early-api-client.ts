/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance } from "axios";
import {
    EarlyConfig,
    ApiResponse,
    TimeEntry,
    CreateTimeEntryRequest,
    UpdateTimeEntryRequest,
    User,
    UserSettings,
    TimeReport,
    ApiError,
} from "./types.js";
import { getCurrentDateLocal } from "./utils.js";

interface SignInResponse {
    token: string;
}

interface ApiKeyResponse {
    apiKey: string;
}

export class EarlyApiClient {
    private client: AxiosInstance;
    private accessToken: string | null = null;
    private config: EarlyConfig;

    constructor(config: EarlyConfig) {
        this.config = config;

        // Initialize client with base configuration
        this.client = axios.create({
            baseURL: config.baseUrl,
            timeout: config.timeout,
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "early-mcp-server/1.0.0",
            },
        });

        this.setupInterceptors();
    }

    /**
     * Authenticate with Early API using API Key and Secret
     * This follows the Early Public API v4 authentication flow
     */
    async authenticate(): Promise<void> {
        if (!this.config.apiKey || !this.config.apiSecret) {
            throw new Error("API Key and API Secret are required for authentication");
        }

        try {
            const response = await this.client.post<SignInResponse>("/api/v4/developer/sign-in", {
                apiKey: this.config.apiKey,
                apiSecret: this.config.apiSecret,
            });

            this.accessToken = response.data.token;

            // Update default headers with Bearer token
            this.client.defaults.headers.common["Authorization"] = `Bearer ${this.accessToken}`;

            // Authentication successful - logging removed to prevent stdio interference
        } catch (error: any) {
            // Authentication failed - logging removed to prevent stdio interference
            throw new Error(`Authentication failed: ${error?.response?.data?.message || error.message}`);
        }
    }

    /**
     * Fetch the current API Key (for reference)
     */
    async fetchApiKey(): Promise<string | null> {
        if (!this.accessToken) {
            await this.authenticate();
        }

        try {
            const response = await this.client.get<ApiKeyResponse>("/api/v4/developer/api-access");
            return response.data.apiKey;
        } catch (error: any) {
            // Failed to fetch API key - logging removed to prevent stdio interference
            return null;
        }
    }

    /**
     * Logout and invalidate the current access token
     */
    async logout(): Promise<void> {
        if (!this.accessToken) {
            return;
        }

        try {
            await this.client.post("/api/v4/developer/logout");
            this.accessToken = null;
            delete this.client.defaults.headers.common["Authorization"];
            // Logout successful - logging removed to prevent stdio interference
        } catch (error: any) {
            // Logout failed - logging removed to prevent stdio interference
            // Still clear local token even if server request fails
            this.accessToken = null;
            delete this.client.defaults.headers.common["Authorization"];
        }
    }

    /**
     * Check if client is authenticated
     */
    isAuthenticated(): boolean {
        return this.accessToken !== null;
    }

    /**
     * Get current access token (for debugging)
     */
    getCurrentToken(): string | null {
        return this.accessToken;
    }

    /**
     * Ensure client is authenticated before making API calls
     */
    private async ensureAuthenticated(): Promise<void> {
        if (!this.accessToken) {
            await this.authenticate();
        }
    }

    private setupInterceptors() {
        // Request interceptor (logging removed to prevent stdio interference)
        this.client.interceptors.request.use(
            (config) => {
                // Request logging removed to prevent stdio interference with MCP
                return config;
            },
            (error) => {
                // Request error logging removed to prevent stdio interference
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                // Response error logging removed to prevent stdio interference

                // Transform axios errors to our ApiError format
                const apiError: ApiError = {
                    code: error?.response?.status?.toString() || "UNKNOWN",
                    message: error?.response?.data?.message || error.message,
                    details: error?.response?.data,
                };

                return Promise.reject(apiError);
            }
        );
    }

    // Time Entry methods (Early API v4)
    async getTimeEntriesInRange(startDate: string, endDate: string): Promise<any> {
        await this.ensureAuthenticated();
        const response = await this.client.get(`/api/v4/time-entries/${startDate}/${endDate}`);
        return response.data;
    }

    async getTimeEntry(id: string): Promise<TimeEntry> {
        await this.ensureAuthenticated();
        const response = await this.client.get<ApiResponse<TimeEntry>>(`/api/v4/time-entries/${id}`);
        if (!response.data.data) {
            throw new Error(`Time entry not found: ${id}`);
        }
        return response.data.data;
    }

    async createTimeEntry(request: CreateTimeEntryRequest): Promise<TimeEntry> {
        await this.ensureAuthenticated();
        const response = await this.client.post<any>("/api/v4/time-entries", request);
        return response.data;
    }

    async updateTimeEntry(id: string, request: UpdateTimeEntryRequest): Promise<TimeEntry> {
        await this.ensureAuthenticated();
        const response = await this.client.patch<any>(`/api/v4/time-entries/${id}`, request);
        return response.data;
    }

    async deleteTimeEntry(id: string): Promise<void> {
        await this.ensureAuthenticated();
        await this.client.delete(`/api/v4/time-entries/${id}`);
    }

    // Tracking methods (Early API v4)
    async getCurrentTracking(): Promise<any | null> {
        await this.ensureAuthenticated();
        try {
            const response = await this.client.get("/api/v4/tracking");
            return response.data;
        } catch (error) {
            // Return null if no active tracking (404 is expected)
            if ((error as any).response?.status === 404 || (error as ApiError).code === "404") {
                return null;
            }
            throw error;
        }
    }

    async editTracking(id: string, note: any): Promise<any> {
        await this.ensureAuthenticated();
        const response = await this.client.patch(`/api/v4/tracking/${id}`, { note });
        return response.data;
    }

    async startTracking(activityId: string, note?: any, startedAt?: string): Promise<any> {
        await this.ensureAuthenticated();

        // Always include startedAt parameter as it's required
        const startTime = startedAt || new Date().toISOString().replace("Z", "");
        const trackingRequest: any = {
            startedAt: startTime,
        };

        // Add note if provided
        if (note) {
            trackingRequest.note = typeof note === "string" ? { text: note } : note;
        }

        const response = await this.client.post(
            `/api/v4/tracking/${activityId}/start`,
            trackingRequest
        );
        return response.data;
    }

    async stopTracking(stoppedAt: string): Promise<any> {
        await this.ensureAuthenticated();

        const response = await this.client.post(
            "/api/v4/tracking/stop",
            { stoppedAt }
        );
        return response.data;
    }

    // Activity methods (Early API v4 calls them "activities" not "projects")
    async getActivities(): Promise<any> {
        await this.ensureAuthenticated();
        const response = await this.client.get("/api/v4/activities");
        return response.data;
    }

    async getActivity(_id: string): Promise<any> {
        await this.ensureAuthenticated();
        // Note: Early API v4 doesn't have individual activity endpoint in docs
        // This would need to be implemented if the API supports it
        throw new Error("Individual activity retrieval not supported by Early API v4");
    }

    async createActivity(request: any): Promise<any> {
        await this.ensureAuthenticated();
        // Trying v2 endpoint based on archiveActivity pattern
        const response = await this.client.post("/api/v2/activities", request);
        return response.data;
    }

    async updateActivity(id: string, request: any): Promise<any> {
        await this.ensureAuthenticated();
        // Trying v2 endpoint based on archiveActivity pattern
        const response = await this.client.put(`/api/v2/activities/${id}`, request);
        return response.data;
    }

    async archiveActivity(id: string): Promise<void> {
        await this.ensureAuthenticated();
        // Using v2 endpoint as documented in Early API
        await this.client.delete(`/api/v2/activities/${id}`);
    }

    async assignActivityToDeviceSide(activityId: string, deviceSide: string): Promise<any> {
        await this.ensureAuthenticated();
        // Using v2 endpoint as documented in Early API
        const response = await this.client.post(`/api/v2/activities/${activityId}/device-side/${deviceSide}`);
        return response.data;
    }

    // User methods (Note: Early API v4 documentation doesn't show user endpoints)
    async getCurrentUser(): Promise<User> {
        await this.ensureAuthenticated();
        // Note: User endpoints not documented in Early API v4
        // This would need to be confirmed with the actual API
        throw new Error("User endpoints not documented in Early API v4");
    }

    async updateUserSettings(_settings: UserSettings): Promise<User> {
        await this.ensureAuthenticated();
        // Note: User endpoints not documented in Early API v4
        // This would need to be confirmed with the actual API
        throw new Error("User endpoints not documented in Early API v4");
    }

    // Report methods (Note: Early API v4 documentation doesn't show report endpoints)
    async generateTimeReport(_startDate: string, _endDate: string, _activityId?: string): Promise<TimeReport> {
        await this.ensureAuthenticated();
        // Note: Report endpoints not documented in Early API v4
        // This could be implemented using time entries data instead
        throw new Error("Report endpoints not documented in Early API v4. Use getTimeEntriesInRange instead.");
    }

    // Utility methods
    async testConnection(): Promise<boolean> {
        try {
            // Test authentication instead of health endpoint
            await this.authenticate();
            return true;
        } catch {
            return false;
        }
    }

    // Helper methods for common queries
    async getTodayTimeEntries(): Promise<any[]> {
        const today = getCurrentDateLocal();
        const response = await this.getTimeEntriesInRange(`${today}T00:00:00.000`, `${today}T23:59:59.999`);
        return response.timeEntries || [];
    }

    async getThisWeekTimeEntries(): Promise<any[]> {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const response = await this.getTimeEntriesInRange(
            `${startOfWeek.toISOString().split("T")[0]}T00:00:00.000`,
            `${endOfWeek.toISOString().split("T")[0]}T23:59:59.999`
        );
        return response.timeEntries || [];
    }

    async getActiveActivities(): Promise<any[]> {
        const response = await this.getActivities();
        return response.activities || [];
    }

    async getAllActivities(): Promise<any[]> {
        const response = await this.getActivities();
        const allActivities = [
            ...(response.activities || []),
            ...(response.inactiveActivities || []),
            ...(response.archivedActivities || []),
        ];
        return allActivities;
    }
}

