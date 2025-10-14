# EARLY App MCP Server

A Model Context Protocol (MCP) server that provides access to the EARLY app time tracking API.

## Overview

EARLY is a time tracking application with a comprehensive public API. This MCP server enables AI assistants to interact with time tracking data, manage projects, and generate reports through the EARLY API.

## API Documentation

- **Base URL**: https://developers.early.app/
- **Documentation**: Postman Collection
- **Authentication**: API Key (assumed)

## Planned MCP Implementation

### Tools

#### Time Entry Management
- `create_time_entry` - Create a new time entry
- `update_time_entry` - Update an existing time entry
- `delete_time_entry` - Delete a time entry
- `start_timer` - Start tracking time for a project
- `stop_timer` - Stop the currently running timer
- `get_active_timer` - Get currently running timer information

#### Project Management
- `create_project` - Create a new project
- `update_project` - Update project details
- `delete_project` - Delete a project
- `list_activities` - Get all activities
- `get_project` - Get specific project details

#### Reporting and Analytics
- `generate_time_report` - Generate time reports for specified periods
- `get_productivity_stats` - Get productivity statistics
- `export_timesheet` - Export timesheet data

#### User Management
- `get_user_profile` - Get current user profile
- `update_user_settings` - Update user preferences

### Resources

#### Time Entries
- `resource://time-entries` - Access to time entry data
- `resource://time-entries/today` - Today's time entries
- `resource://time-entries/week` - Current week's entries
- `resource://time-entries/month` - Current month's entries

#### Projects
- `resource://projects` - Access to all projects
- `resource://projects/active` - Only active projects
- `resource://projects/{id}` - Specific project data

#### Reports
- `resource://reports/summary` - Summary reports
- `resource://reports/detailed` - Detailed time tracking reports

## Configuration

The server will require the following configuration:

```json
{
  "apiKey": "your-early-api-key",
  "baseUrl": "https://api.early.app", // Inferred API base URL
  "timeout": 30000,
  "rateLimiting": {
    "enabled": true,
    "requestsPerMinute": 100
  }
}
```

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
- Server setup and configuration
- Available tools and resources  
- Claude Desktop integration
- Troubleshooting and development

### Status: ✅ Working MCP Server

The server is fully functional with:
- ✅ MCP protocol implementation
- ✅ 5 time tracking tools
- ✅ 4 data resources
- ✅ Full test suite (24 tests passing)
- ✅ EARLY API integration
- ✅ Claude Desktop ready

## Error Handling

- API rate limiting compliance
- Proper error messages for failed operations
- Graceful handling of network issues
- Validation of time entry data

## Security Considerations

- Secure API key storage
- Input validation and sanitization
- Proper error messages without exposing sensitive data
- Rate limiting to prevent abuse

## Future Enhancements

- Real-time timer synchronization
- Webhook support for live updates
- Advanced filtering and search capabilities
- Integration with calendar applications
- Bulk operations support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.