# EARLY App MCP Server

[![npm version](https://img.shields.io/npm/v/@janfincke/early-mcp-server.svg)](https://www.npmjs.com/package/@janfincke/early-mcp-server)
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

### Tools

#### Time Entry Management

-   `create_time_entry` - Create a new time entry with flexible time parameters
-   `edit_time_entry` - Edit an existing time entry
-   `get_time_entries` - Get time entries for a date range
-   `start_timer` - Start tracking time for a project
-   `stop_timer` - Stop the currently running timer

#### Activity Management

-   `list_activities` - Get all activities


### Resources

#### Time Entries

-   `early://time-entries/today` - Today's time entries with detailed JSON data
-   `early://time-entries/week` - Current week's time entries

#### Activities

-   `early://activities` - All activities (active + inactive + archived)
-   `early://activities/active` - Only active activities


## Quick Start

### Installation

No installation required! Use npx to run the server:

```bash
npx @janfincke/early-mcp-server
```

### Configuration (for Claude Desktop and others)


```json
{
  "mcpServers": {
    "early-time-tracker": {
      "command": "npx",
      "args": [
        "@janfincke/early-mcp-server"
      ],
      "env": {
        "EARLY_API_KEY": "your-early-api-key-here",
        "EARLY_API_SECRET": "your-early-api-secret-here"
      }
    }
  }
}
```

Get your API credentials from the EARLY desktop app: **Settings → Developer → API Keys**

## Documentation

**[Complete Documentation](https://janfincke.github.io/early-mcp-server/)**

Comprehensive documentation is available at **[janfincke.github.io/early-mcp-server](https://janfincke.github.io/early-mcp-server/)** including:

- **[Getting Started Guide](https://janfincke.github.io/early-mcp-server/getting-started/)** - Installation and setup
- **[Tools Reference](https://janfincke.github.io/early-mcp-server/tools/)** - Complete documentation for all 6 tools
- **[Integration Guide](https://janfincke.github.io/early-mcp-server/integration/)** - Claude Desktop and MCP client setup
- **[Troubleshooting](https://janfincke.github.io/early-mcp-server/troubleshooting/)** - Common issues and solutions


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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
