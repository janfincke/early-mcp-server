# WARP.md

Guidance for AI assistants working with this MCP server codebase.

## Project Overview

**EARLY App MCP Server** - Model Context Protocol server for EARLY time tracking API

- **Package**: `@janfincke/early-mcp-server` (v1.0.3)
- **License**: MIT
- **Node**: >=18.0.0
- **Type**: ES Module

### Technology Stack
- TypeScript 5.x (strict mode, ES2022 target)
- MCP SDK (@modelcontextprotocol/sdk v1.24.0)
- Axios for HTTP client
- Zod for schema validation
- Jest + ts-jest for testing
- ESLint for code quality

## Architecture

### Project Structure
```
src/
├── index.ts                 # Main MCP server entry point
├── early-api-client.ts      # EARLY API HTTP client
├── types.ts                 # Core TypeScript type definitions
├── tool-types.ts            # Tool argument types
├── schemas.ts               # Zod input/output schemas
├── error-utils.ts           # Error handling utilities
├── utils.ts                 # Time/date formatting helpers
└── handlers/
    ├── time-entry-handlers.ts    # Time entry CRUD operations
    ├── activity-handlers.ts      # Activity management
    ├── tracking-handlers.ts      # Timer start/stop/active
    ├── resource-handlers.ts      # MCP resource providers
    ├── report-handlers.ts        # Report generation
    └── user-handlers.ts          # User profile operations
```

### MCP Server (`src/index.ts`)
Implements MCP protocol with:
- **15 Tools**: Time entries, activities, timers, reports, user management
- **4 Resources**: Today/week time entries, all/active activities
- **Transport**: StdioServerTransport for Claude Desktop integration

### API Client (`src/early-api-client.ts`)
HTTP client providing:
- Time entry CRUD (create, read, update, delete)
- Activity management (list, create, update, archive)
- Timer operations (start, stop, get active, update active)
- Report generation and user profile access
- Axios interceptors for error handling
- Helper methods: `getTimeEntriesToday()`, `getTimeEntriesThisWeek()`, `getActiveActivities()`

### Type System
**`src/types.ts`** - API models (TimeEntry, Activity, User, ActiveTimer, pagination)
**`src/tool-types.ts`** - Tool argument interfaces
**`src/schemas.ts`** - Zod validation schemas for MCP tools

## Development Commands

```bash
npm run dev          # TypeScript watch mode
npm run build        # Compile to dist/
npm run start        # Run compiled server
npm run start:env    # Run with dotenv (via start.js)
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix ESLint issues
npm test             # Run Jest test suite
```

## Configuration

Required environment variables:
```bash
EARLY_API_KEY=your-api-key
EARLY_API_SECRET=your-api-secret
```

Both credentials are required. Get them from EARLY app: Settings → Developer → API Keys.

## Implementation Status

### Completed Features ✅
**Tools (15 total)**:
- Time Entries: `create_time_entry`, `get_time_entries`, `edit_time_entry`, `delete_time_entry`
- Activities: `list_activities`, `create_activity`, `update_activity`, `archive_activity`
- Timers: `start_timer`, `stop_timer`, `get_active_timer`, `update_active_timer`
- Other: `generate_report`, `get_current_user`

**Resources (4 total)**:
- `early://time-entries/today` - Today's time entries
- `early://time-entries/week` - Current week's time entries
- `early://activities` - All activities
- `early://activities/active` - Active activities only

**Infrastructure**:
- Modular handler architecture (6 handler files)
- Complete error handling with McpError conversion
- Time/date utilities for EARLY API format
- Jest test suite (4 test files)
- ESLint configuration

### Known Issues ⚠️
- Jest worker warnings about circular JSON (tests pass, cosmetic issue)
- Timer test suite occasionally has worker exceptions

## Development Guidelines

### MCP Protocol
- Communication via stdio transport
- Tools = interactive operations
- Resources = read-only data
- All errors must be McpError instances
- Use Zod schemas for input validation

### API Client Patterns
- All methods are async
- Return `ApiResponse<T>` for single items
- Return `PaginatedResponse<T>` for lists
- Use axios interceptors for error transformation
- Authentication via headers: `x-early-api-key`, `x-early-api-secret`

### TypeScript Configuration
- Strict mode with all checks enabled
- ES modules with `.js` extensions in imports
- Target ES2022 with ESNext module resolution
- Generate declaration files and source maps

### Handler Architecture
When adding/modifying handlers:
1. Define Zod schema in `schemas.ts`
2. Add type interface in `tool-types.ts`
3. Implement handler in appropriate `handlers/*.ts` file
4. Register in `index.ts` with schema and annotations
5. Transform API errors to McpError
6. Add tests in `tests/` directory

### Testing Strategy
- Mock `EarlyApiClient` for unit tests
- Test MCP protocol compliance
- Validate error handling and edge cases
- Use `axios-mock-adapter` for API mocking
- Run tests with: `npm test`

## Common Tasks

### Adding a New Tool
1. Create input/output schemas in `schemas.ts`
2. Add tool args type in `tool-types.ts`
3. Implement handler function in relevant `handlers/*.ts`
4. Register tool in `index.ts` setupHandlers method
5. Add API client method if needed in `early-api-client.ts`
6. Write tests in `tests/` directory

### Adding a New Resource
1. Implement handler in `resource-handlers.ts`
2. Register in `index.ts` setupHandlers method
3. Follow URI pattern: `early://resource-type/identifier`
4. Return text content with proper MIME types

### Debugging
- Enable source maps (already configured)
- Check `dist/` output after build
- Use console.error for MCP-safe logging
- Test with Claude Desktop or MCP Inspector

## API Integration

**EARLY API**:
- Base URL: `https://api.early.app`
- Authentication: API key + secret headers
- Documentation: Available via Postman collection
- Timeout: 30 seconds (configurable)

**Key Endpoints**:
- `/time-entries` - CRUD operations
- `/activities` - Project management
- `/tracking/start`, `/tracking/stop` - Timer control
- `/reports` - Summary generation
- `/user/me` - User profile
