// Configuration types
export interface EarlyConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  timeout: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Time Entry types
export interface TimeEntry {
  id: string;
  projectId: string;
  userId: string;
  description: string;
  startTime: string; // ISO 8601
  endTime?: string; // ISO 8601
  duration?: number; // in minutes
  isRunning: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeEntryRequest {
  projectId: string;
  description: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  tags?: string[];
}

export interface UpdateTimeEntryRequest {
  description?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  tags?: string[];
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  clientId?: string;
  billable: boolean;
  hourlyRate?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string;
  clientId?: string;
  billable?: boolean;
  hourlyRate?: number;
  currency?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  clientId?: string;
  billable?: boolean;
  hourlyRate?: number;
  currency?: string;
}

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  weekStart: number; // 0-6, Sunday = 0
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  weekStart?: number;
}

// Client types
export interface Client {
  id: string;
  name: string;
  description?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Timer types
export interface ActiveTimer {
  id: string;
  projectId: string;
  description: string;
  startTime: string;
  duration: number; // current duration in minutes
  isRunning: true;
}

// Report types
export interface TimeReport {
  period: {
    startDate: string;
    endDate: string;
  };
  totalTime: number; // in minutes
  billableTime: number; // in minutes
  projects: ProjectSummary[];
  entries: TimeEntry[];
}

export interface ProjectSummary {
  projectId: string;
  projectName: string;
  totalTime: number;
  billableTime: number;
  entryCount: number;
}

// Query types
export interface TimeEntryQuery {
  startDate?: string;
  endDate?: string;
  projectId?: string;
  userId?: string;
  isRunning?: boolean;
  limit?: number;
  offset?: number;
}

export interface ProjectQuery {
  active?: boolean;
  clientId?: string;
  limit?: number;
  offset?: number;
}

// API Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Validation schemas (for use with zod)
export interface ValidationSchema {
  // These would be zod schemas in actual implementation
  createTimeEntry: unknown;
  updateTimeEntry: unknown;
  createProject: unknown;
  updateProject: unknown;
  timeEntryQuery: unknown;
  projectQuery: unknown;
}