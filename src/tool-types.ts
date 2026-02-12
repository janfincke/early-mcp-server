// Tool argument interfaces for better type safety

export interface CreateTimeEntryArgs {
  projectId: string;
  description: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
}

export interface GetTimeEntriesArgs {
  startDate?: string;
  endDate?: string;
  projectId?: string;
}

export interface EditTimeEntryArgs {
  timeEntryId: string;
  startTime?: string;
  endTime?: string;
  activityId?: string;
  description?: string;
}

export interface ListActivitiesArgs {
  active?: boolean;
}

export interface StartTimerArgs {
  projectId: string;
  description?: string;
}

export interface DeleteTimeEntryArgs {
  timeEntryId: string;
}

export interface GetActiveTimerArgs {}

export interface UpdateActiveTimerArgs {
  description: string;
}

export interface CreateActivityArgs {
  name: string;
  description?: string;
  color?: string;
  clientId?: string;
  billable?: boolean;
}

export interface UpdateActivityArgs {
  activityId: string;
  name?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  clientId?: string;
  billable?: boolean;
}

export interface ArchiveActivityArgs {
  activityId: string;
}

export interface GenerateReportArgs {
  startDate: string;
  endDate: string;
  projectId?: string;
}

export interface GetCurrentUserArgs {}

// Note: We'll use the MCP SDK's actual response types instead of custom ones

// API Response types from Early API
export interface EarlyActivity {
  id: string;
  name: string;
}

export interface EarlyTimeEntry {
  id: string;
  activity?: EarlyActivity;
  duration: {
    startedAt: string;
    stoppedAt?: string;
  };
  note?: {
    text: string;
  };
}

export interface EarlyTrackingSession {
  id: string;
  activity?: EarlyActivity;
  note?: {
    text: string;
  };
}