# EARLY MCP Server

[![npm version](https://img.shields.io/npm/v/@janfincke/early-mcp-server.svg)](https://www.npmjs.com/package/@janfincke/early-mcp-server)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue.svg)](https://github.com/janfincke/early-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)

An unofficial **Model Context Protocol (MCP) server** that provides AI assistants with structured access to the [EARLY app](https://early.app/) time tracking API.

## Overview {#overview}

EARLY is a time tracking application with a comprehensive public API. This MCP server enables AI assistants to interact with time tracking data, manage activities, and generate reports through the EARLY API using the standardized MCP protocol.

**Key Features:**

- **6 Time Tracking Tools** - Complete CRUD operations for time entries and activities
- **4 Data Resources** - Structured access to time data via MCP resources  
- **Real-time Timer Management** - Start and stop timers with live API integration
- **Production Ready** - Full error handling, authentication, and testing
- **Claude Desktop Compatible** - Easy integration with Claude and other MCP clients

## Quick Start {#quick-start}

### Installation

No installation required! Use npx to run the server:

```bash
npx @janfincke/early-mcp-server
```

### Claude Desktop Configuration

Add this to your Claude Desktop config file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

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

!!! tip "Get API Credentials"
    Open the EARLY app → **Settings** → **Developer** → **API Keys**

That's it! Restart Claude Desktop and start tracking time with natural language.

## Quick Links {#quick-links}

<div class="grid cards" markdown>

-   :material-rocket-launch:{ .lg .middle } **Getting Started**

    ---

    Install, configure, and run the server in minutes

    [:octicons-arrow-right-24: Start here](getting-started.md)

-   :material-tools:{ .lg .middle } **Tools Reference**

    ---

    Complete documentation for all 6 time tracking tools

    [:octicons-arrow-right-24: Browse tools](tools/index.md)

-   :material-application-cog:{ .lg .middle } **Integration Guide**

    ---

    Connect with Claude Desktop and other MCP clients

    [:octicons-arrow-right-24: Integration](integration.md)

-   :material-help-circle:{ .lg .middle } **Troubleshooting**

    ---

    Common issues and solutions

    [:octicons-arrow-right-24: Get help](troubleshooting.md)

</div>

## Implementation Status {#status}

### Production Ready MCP Server

The server is fully functional with:

- **MCP Protocol Implementation** - Full compliance with MCP specification
- **EARLY API v4 Integration** - Proper authentication and error handling
- **Comprehensive Type System** - Full TypeScript implementation
- **Test Suite** - 24 tests passing across 4 test suites
- **Claude Desktop Ready** - Tested integration

### Available Tools

| Tool | Status | Description |
|------|--------|-------------|
| [`create_time_entry`](tools/create_time_entry.md) | <span class="tool-status-implemented">COMPLETE</span> | Create time entries with flexible time parameters |
| [`edit_time_entry`](tools/edit_time_entry.md) | <span class="tool-status-implemented">COMPLETE</span> | Edit existing time entries |
| [`get_time_entries`](tools/get_time_entries.md) | <span class="tool-status-implemented">COMPLETE</span> | Get time entries for date ranges |
| [`list_activities`](tools/list_activities.md) | <span class="tool-status-implemented">COMPLETE</span> | Get all activities with filtering |
| [`start_timer`](tools/start_timer.md) | <span class="tool-status-implemented">COMPLETE</span> | Start time tracking for activities |
| [`stop_timer`](tools/stop_timer.md) | <span class="tool-status-implemented">COMPLETE</span> | Stop currently running timer |

### Available Resources

| Resource | Description |
|----------|-------------|
| `early://time-entries/today` | Today's time entries with detailed JSON data |
| `early://time-entries/week` | Current week's time entries |
| `early://activities` | All activities (active + inactive + archived) |
| `early://activities/active` | Only active activities |

## EARLY API Integration {#api-integration}

- **Base URL**: `https://api.early.app`
- **API Version**: v4
- **Authentication**: API Key + Secret flow
- **Documentation**: [EARLY Developers](https://developers.early.app/)

## Next Steps {#next-steps}

1. **[Get Started](getting-started.md)** - Install and configure the server
2. **[Explore Tools](tools/index.md)** - Learn about available functionality  
3. **[Integration](integration.md)** - Connect with Claude Desktop or other clients
4. **[Architecture](architecture.md)** - Understand the technical design

## Contributing {#contributing}

Interested in contributing? Check out the [GitHub repository](https://github.com/janfincke/early-mcp-server) for development setup, testing, and contribution information.

## License {#license}

MIT License - see [LICENSE](https://github.com/janfincke/early-mcp-server/blob/main/LICENSE) file for details.