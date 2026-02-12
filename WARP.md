# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **Model Context Protocol (MCP) server** for the EARLY app time tracking API. The server provides AI assistants with structured access to time tracking operations, activity management, and reporting through the MCP specification.

**Key Technology Stack:**
- TypeScript with ES modules (target: ES2022)
- MCP SDK (@modelcontextprotocol/sdk)
- Axios for HTTP client
- Zod for validation (fully implemented for tool schemas)

## Core Architecture

### MCP Server Structure (`src/index.ts`)
The main server class `EarlyMcpServer` implements the MCP protocol using the high-level `McpServer` class:
- **Tools**: Interactive operations (12 tools for time entries, activities, timers, reports, and user info)
- **Resources**: Read-only data access (today's entries, week entries, activities)
- **Tool Registration**: Uses `server.registerTool` with Zod schemas for validation
- **Request Handlers**: Separate handler files in `src/handlers/`

### API Client (`src/early-api-client.ts`)
Complete HTTP client for EARLY API with:
- Full CRUD operations for time entries and activities (using v2/v4 endpoints)
- Timer management (start/stop/update/active status)
- User profile access
- Helper methods for common queries (today, this week, active activities)
- Proper error handling with axios interceptors

### Type System (`src/types.ts` & `src/tool-types.ts`)
Comprehensive TypeScript definitions covering:
- API request/response models
- Time tracking entities (TimeEntry, Activity, User, ActiveTimer)
- Tool argument interfaces (in `tool-types.ts`)
- Validation schemas (in `src/schemas.ts`)

## Common Development Commands

```bash
# Development workflow
npm run dev          # Watch mode TypeScript compilation
npm run build        # Production build
npm run start        # Run the compiled server
npm run start:env    # Run with environment setup (via start.js)

# Code quality
npm run lint         # Run ESLint on src/**/*.ts
npm run lint:fix     # Fix ESLint issues automatically
npm test             # Run Jest tests (39 tests passing)
```

## Configuration

The server requires environment variables:
```bash
EARLY_API_KEY=your-early-api-key-here
EARLY_API_SECRET=your-early-api-secret-here
```

**Note**: Both `EARLY_API_KEY` and `EARLY_API_SECRET` are now required for authentication.

Copy `.env.example` to `.env` and configure your API credentials.

## Current Implementation Status

**✅ Completed:**
- **Modernized Architecture**: Switched to `McpServer` class and `registerTool` pattern
- **Validation**: Zod schemas implemented for all tools (`src/schemas.ts`)
- **Complete Toolset (12 Tools)**:
    - Time Entries: `create_time_entry`, `edit_time_entry`, `get_time_entries`, `delete_time_entry`
    - Timers: `start_timer`, `stop_timer`, `get_active_timer`, `update_active_timer`
    - Activities: `list_activities`, `create_activity`, `update_activity`, `archive_activity`
    - User & Reports: `generate_report`, `get_current_user`
- **Resource Handlers**: All implemented
- **Testing**: Test suite expanded to 39 tests, fixed circular JSON issues
- **Linting**: Enhanced ESLint configuration with strict TypeScript rules

**⚠️ Known Issues:**
- `npm run build` requires higher memory (use `NODE_OPTIONS="--max-old-space-size=4096"` in constrained environments) due to complex type inference, though `as any` casting has been applied to mitigate this.

## Key Development Notes

### MCP Protocol Implementation
- Server communicates via stdio transport
- Tools use `Zod` schemas for input validation
- Error handling uses McpError with proper error codes and detailed messages

### API Client Pattern
The `EarlyApiClient` class follows a consistent pattern:
- All methods are async and return typed responses
- Uses v4 endpoints for all operations (time tracking, activities, user)
- Helper methods for common date-based queries
- Authentication via API key and secret in request headers

### Handler Pattern
Handlers in `src/handlers/` follow a uniform structure:
1.  **Input**: Receive typed arguments (from `tool-types.ts`)
2.  **Validation**: Perform business logic validation (e.g., required IDs)
3.  **Operation**: Call `EarlyApiClient` methods
4.  **Response**: Return formatted `CallToolResult` with explicit `type: "text"`
5.  **Error Handling**: Wrap execution in `try/catch` using `createToolErrorResponse`

## Tool Implementation Status

### ✅ Fully Implemented Tools
- **`list_activities`**: Get all or active activities
- **`get_time_entries`**: Get entries by date range
- **`create_time_entry`**: Create new entries
- **`edit_time_entry`**: Update existing entries
- **`delete_time_entry`**: Delete entries
- **`start_timer`**: Start tracking
- **`stop_timer`**: Stop tracking
- **`get_active_timer`**: Check running timer
- **`update_active_timer`**: Update running timer note
- **`create_activity`**: Create new project
- **`update_activity`**: Update project details
- **`archive_activity`**: Archive/delete project
- **`generate_report`**: Summary report of time usage
- **`get_current_user`**: User profile info

## Integration Points

When connecting tool handlers to the API client:
1.  Import and use `this.apiClient` methods in handler functions
2.  Handle `ApiError` exceptions and convert to `McpError`
3.  Transform API responses to MCP response format
4.  Ensure `content` array elements have `type: "text" as const` to satisfy SDK types

## Testing Strategy

- Mock the `EarlyApiClient` for unit testing server handlers
- Use `axios-mock-adapter` for testing API client logic
- Ensure tests cover success paths, error handling, and edge cases

