# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **Model Context Protocol (MCP) server** for the EARLY app time tracking API. The server provides AI assistants with structured access to time tracking operations, project management, and reporting through the MCP specification.

**Key Technology Stack:**
- TypeScript with ES modules (target: ES2022)
- MCP SDK (@modelcontextprotocol/sdk)
- Axios for HTTP client
- Zod for validation (dependency only, not yet implemented)

## Core Architecture

### MCP Server Structure (`src/index.ts`)
The main server class `EarlyMcpServer` implements the MCP protocol with:
- **Tools**: Interactive operations (create_time_entry, start_timer, stop_timer, list_activities, get_time_entries, edit_time_entry)
- **Resources**: Read-only data access (today's entries, week entries, projects)
- **Request Handlers**: MCP protocol compliance with proper error handling

### API Client (`src/early-api-client.ts`)
Complete HTTP client for EARLY API with:
- Full CRUD operations for time entries and projects  
- Timer management (start/stop/active status)
- User profile and settings management
- Report generation
- Proper error handling with axios interceptors
- Helper methods for common queries (today, this week, active projects)

### Type System (`src/types.ts`)
Comprehensive TypeScript definitions covering:
- API request/response models
- Time tracking entities (TimeEntry, Project, User, ActiveTimer)
- Query and pagination interfaces
- Configuration and error types

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
npm test             # Run Jest tests (currently no tests implemented)
```

## Configuration

The server requires environment variables:
```bash
EARLY_API_KEY=your-early-api-key-here
EARLY_API_SECRET=your-early-api-secret-here
EARLY_BASE_URL=https://api.early.app
```

**Note**: Both `EARLY_API_KEY` and `EARLY_API_SECRET` are now required for authentication.

Copy `.env.example` to `.env` and configure your API credentials.

## Current Implementation Status

**✅ Completed:**
- MCP server framework and protocol handling
- Complete TypeScript type system
- Full API client implementation with all EARLY API endpoints
- Error handling and logging infrastructure
- **Tools Implemented**: `list_activities`, `get_time_entries`, `edit_time_entry`
- **Resource Handlers**: All implemented with proper API client calls and error handling
- **Utility Functions**: Time formatting and date handling utilities (`src/utils.ts`)

**🚧 In Progress (TODO markers in code):**
- **Tools Still Placeholder**: `create_time_entry`, `start_timer`, `stop_timer`
- These handlers need actual API client calls to replace placeholder responses

**❌ Not Yet Started:**
- Test files (tests/ directory is empty)
- Jest configuration file
- ESLint configuration file

## Key Development Notes

### MCP Protocol Implementation
- Server communicates via stdio transport
- Tools provide interactive functionality, Resources provide read-only data
- All requests/responses must follow MCP specification
- Error handling uses McpError with proper error codes

### API Client Pattern
The `EarlyApiClient` class follows a consistent pattern:
- All methods are async and return typed responses
- Generic `ApiResponse<T>` wrapper for single entities
- `PaginatedResponse<T>` for lists
- Helper methods for common date-based queries (today, this week, active activities)
- Proper error transformation from axios to `ApiError` type
- Authentication via API key and secret in request headers

### TypeScript Configuration
- Strict mode enabled with comprehensive compiler options
- ES modules with `.js` imports (required for ES module resolution)
- Declaration files generated for potential library usage
- Source maps enabled for debugging

## Tool Implementation Status

### ✅ Fully Implemented Tools
- **`list_activities`**: Gets all or active activities with proper error handling and debug info
- **`get_time_entries`**: Supports date ranges or defaults to today's entries
- **`edit_time_entry`**: Updates existing time entries with flexible field updates

### 🚧 Placeholder Tools (Need Implementation)
- **`create_time_entry`**: Create new time entries
- **`start_timer`**: Start time tracking
- **`stop_timer`**: Stop active timer

## Integration Points

When connecting tool handlers to the API client:
1. Import and use `this.apiClient` methods in handler functions
2. Handle `ApiError` exceptions and convert to `McpError`
3. Transform API responses to MCP response format with proper content types
4. Validate input parameters against the input schemas defined in tool definitions
5. Include debug information in error responses for troubleshooting

## Testing Strategy

When implementing tests:
- Mock the `EarlyApiClient` for unit testing server handlers
- Test MCP protocol compliance with various inputs
- Integration tests should use test API keys/environment
- Validate error handling and edge cases