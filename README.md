# EARLY App MCP Server

An unofficial Model Context Protocol (MCP) server that provides access to the EARLY app time tracking public API.

## Overview

EARLY is a time tracking application with a comprehensive public API. This MCP server enables AI assistants to interact with time tracking data, manage projects, and generate reports through the EARLY API.

## API Documentation

-   **Base URL**: https://developers.early.app/
-   **Documentation**: Postman Collection
-   **Authentication**: API Key (assumed)

## MCP Implementation

### Tools (✅ = Implemented, 🚧 = Planned)

#### Time Entry Management

-   ✅ `create_time_entry` - Create a new time entry with flexible time parameters
-   ✅ `edit_time_entry` - Edit an existing time entry
-   ✅ `get_time_entries` - Get time entries for a date range
-   ✅ `start_timer` - Start tracking time for a project
-   ✅ `stop_timer` - Stop the currently running timer
-   🚧 `delete_time_entry` - Delete a time entry
-   🚧 `get_active_timer` - Get currently running timer information

#### Activity Management

-   ✅ `list_activities` - Get all activities
-   🚧 `create_activity` - Create a new activity
-   🚧 `update_activity` - Update activity details
-   🚧 `delete_activity` - Delete an activity
-   🚧 `get_activity` - Get specific activity details

#### Reporting and Analytics

-   🚧 `generate_time_report` - Generate time reports for specified periods
-   🚧 `get_productivity_stats` - Get productivity statistics
-   🚧 `export_timesheet` - Export timesheet data

#### User Management

-   🚧 `get_user_profile` - Get current user profile
-   🚧 `update_user_settings` - Update user preferences

### Resources (✅ = Implemented)

#### Time Entries

-   ✅ `early://time-entries/today` - Today's time entries with detailed JSON data
-   ✅ `early://time-entries/week` - Current week's time entries

#### Activities

-   ✅ `early://activities` - All activities (active + inactive + archived)
-   ✅ `early://activities/active` - Only active activities

## Configuration

The server requires the following environment variables:

```bash
# Required
EARLY_API_KEY=your-early-api-key
EARLY_API_SECRET=your-early-api-secret

# Optional (defaults provided)
EARLY_BASE_URL=https://api.early.app  # Default API base URL
```

**Authentication**: Uses Early API v4 with API Key + Secret authentication flow.

## Tool Documentation

### ✅ create_time_entry

Create time entries with flexible parameter combinations.

**Parameters:**

-   `projectId` (required) - Activity ID from `list_activities`
-   `description` (required) - Time entry description/note
-   `startTime` (optional) - ISO 8601 timestamp for start time
-   `endTime` (optional) - ISO 8601 timestamp for end time
-   `duration` (optional) - Duration in minutes

**Parameter Combinations:**

1. `startTime + endTime` - Creates completed time entry for specific period
2. `duration` - Creates entry ending now, starting X minutes ago
3. **Note**: Early API requires both start and end times (no running timers via this endpoint)

**Examples:**

```javascript
// Specific time range
{
  "projectId": "935607",
  "description": "Meeting with client",
  "startTime": "2025-10-14T08:00:00Z",
  "endTime": "2025-10-14T09:00:00Z"
}

// Duration-based (ends now)
{
  "projectId": "935607",
  "description": "Code review",
  "duration": 45
}
```

**API Behavior:**

-   Automatically replaces entries with identical time slots and activity
-   Timestamp format: Early API expects format without 'Z' suffix internally
-   Returns detailed entry info including formatted local times

## Installation

```bash
npm install
npm run build
```

## Development

```bash
npm run dev  # Watch mode
npm test     # Run tests
npm run lint # Lint code
```

## Usage

### Quick Start

1. **Configure environment variables:**
   Copy `.env.example` to `.env` and add your EARLY API key

2. **Test the server:**

    ```bash
    npm run start:env
    ```

3. **Run the test client:**

    ```bash
    node test-client.js
    ```

4. **Run unit tests:**
    ```bash
    npm test
    ```

### 📖 Complete Usage Guide

**See [USAGE.md](./USAGE.md) for detailed information on:**

-   Server setup and configuration
-   Available tools and resources
-   Claude Desktop integration
-   Troubleshooting and development

### Status: ✅ Working MCP Server

The server is fully functional with:

-   ✅ MCP protocol implementation
-   ✅ **6 time tracking tools** (5 fully implemented, 1 planned)
    -   ✅ `create_time_entry` - **Complete with flexible time parameters**
    -   ✅ `edit_time_entry` - Full CRUD operations
    -   ✅ `get_time_entries` - Date range queries
    -   ✅ `list_activities` - Activity management
    -   ✅ `start_timer` - Timer start functionality
    -   ✅ `stop_timer` - Timer stop functionality
-   ✅ **4 data resources** - JSON formatted time data access
-   ✅ **Full test suite** (24 tests passing with minor Jest worker issues)
-   ✅ **EARLY API v4 integration** with proper authentication
-   ✅ **Claude Desktop ready**
-   ✅ **Production tested** with real time entries

## Error Handling

-   API rate limiting compliance
-   Proper error messages for failed operations
-   Graceful handling of network issues
-   Validation of time entry data

## Security Considerations

-   Secure API key storage
-   Input validation and sanitization
-   Proper error messages without exposing sensitive data
-   Rate limiting to prevent abuse

## Future Enhancements

-   Real-time timer synchronization
-   Webhook support for live updates
-   Advanced filtering and search capabilities
-   Integration with calendar applications
-   Bulk operations support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
