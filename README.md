# EARLY App MCP Server

[![Documentation](https://img.shields.io/badge/docs-mkdocs-blue.svg)](https://janfincke.github.io/early-mcp-server/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)

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

-   `create_time_entry` - Create a new time entry with flexible time parameters
-   `edit_time_entry` - Edit an existing time entry
-   `get_time_entries` - Get time entries for a date range
-   `start_timer` - Start tracking time for a project
-   `stop_timer` - Stop the currently running timer

#### Activity Management

-   `list_activities` - Get all activities


### Resources (✅ = Implemented)

#### Time Entries

-   `early://time-entries/today` - Today's time entries with detailed JSON data
-   `early://time-entries/week` - Current week's time entries

#### Activities

-   `early://activities` - All activities (active + inactive + archived)
-   `early://activities/active` - Only active activities

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

## Documentation

**[Complete Documentation](https://janfincke.github.io/early-mcp-server/)**

Comprehensive documentation is available at **[janfincke.github.io/early-mcp-server](https://janfincke.github.io/early-mcp-server/)** including:

- **[Getting Started Guide](https://janfincke.github.io/early-mcp-server/getting-started/)** - Installation and setup
- **[Tools Reference](https://janfincke.github.io/early-mcp-server/tools/)** - Complete documentation for all 6 tools
- **[Integration Guide](https://janfincke.github.io/early-mcp-server/integration/)** - Claude Desktop and MCP client setup
- **[Troubleshooting](https://janfincke.github.io/early-mcp-server/troubleshooting/)** - Common issues and solutions

## Installation

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn package manager

### Setup
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

### Status: Production Ready MCP Server

The server is fully functional with:

-   MCP protocol implementation
-   **6 time tracking tools** (fully implemented)
    -   `create_time_entry` - **Complete with flexible time parameters**
    -   `edit_time_entry` - Full CRUD operations
    -   `get_time_entries` - Date range queries
    -   `list_activities` - Activity management
    -   `start_timer` - Timer start functionality
    -   `stop_timer` - Timer stop functionality
-   **4 data resources** - JSON formatted time data access
-   **Test suite** (24 tests passing - 1 test suite with API signature issues to be resolved)
-   **EARLY API v4 integration** with proper authentication
-   **Claude Desktop ready**
-   **Production tested** with real time entries

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

### Planned Tools
-   `delete_time_entry` - Delete a time entry
-   `get_active_timer` - Get currently running timer information
-   `create_activity` - Create a new activity
-   `update_activity` - Update activity details
-   `delete_activity` - Delete an activity

### Advanced Features
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
