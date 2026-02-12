# Tools Reference

The EARLY MCP Server provides **12 time tracking and management tools** that enable comprehensive time management through the MCP protocol. All tools are fully implemented and production-ready.

## Quick Reference {#quick-reference}

| Tool | Purpose | Key Parameters | Documentation |
|------|---------|----------------|---------------|
| [`create_time_entry`](create_time_entry.md) | Create new time entries | `projectId`, `description` | [📖 Details](create_time_entry.md) |
| [`edit_time_entry`](edit_time_entry.md) | Modify existing entries | `timeEntryId` | [📖 Details](edit_time_entry.md) |
| [`get_time_entries`](get_time_entries.md) | Query time entries | Date ranges, filters | [📖 Details](get_time_entries.md) |
| [`delete_time_entry`](delete_time_entry.md) | Delete time entries | `timeEntryId` | [📖 Details](delete_time_entry.md) |
| [`list_activities`](list_activities.md) | Get available activities | Optional filtering | [📖 Details](list_activities.md) |
| [`create_activity`](create_activity.md) | Create new activity | `name` | [📖 Details](create_activity.md) |
| [`update_activity`](update_activity.md) | Update existing activity | `activityId` | [📖 Details](update_activity.md) |
| [`archive_activity`](archive_activity.md) | Archive/delete activity | `activityId` | [📖 Details](archive_activity.md) |
| [`start_timer`](start_timer.md) | Begin time tracking | `projectId` | [📖 Details](start_timer.md) |
| [`stop_timer`](stop_timer.md) | End time tracking | None | [📖 Details](stop_timer.md) |
| [`get_active_timer`](get_active_timer.md) | Check running timer | None | [📖 Details](get_active_timer.md) |
| [`update_active_timer`](update_active_timer.md) | Update running timer | `description` | [📖 Details](update_active_timer.md) |
| [`generate_report`](generate_report.md) | Generate summary report | `startDate`, `endDate` | [📖 Details](generate_report.md) |
| [`get_current_user`](get_current_user.md) | Get user info | None | [📖 Details](get_current_user.md) |

## Tool Categories {#categories}

### Time Entry Management {#time-entries}

Core CRUD operations for time entries:

- **[`create_time_entry`](create_time_entry.md)** - Create time entries with flexible parameters (duration, time ranges)
- **[`edit_time_entry`](edit_time_entry.md)** - Update existing time entries (time, activity, description)  
- **[`get_time_entries`](get_time_entries.md)** - Query time entries with date ranges and filtering
- **[`delete_time_entry`](delete_time_entry.md)** - Delete a time entry by ID

### Timer Operations {#timers}

Real-time time tracking:

- **[`start_timer`](start_timer.md)** - Start tracking time for an activity
- **[`stop_timer`](stop_timer.md)** - Stop the currently running timer
- **[`get_active_timer`](get_active_timer.md)** - Get information about the currently running timer
- **[`update_active_timer`](update_active_timer.md)** - Update the description of the currently running timer

### Activity Management {#activities}

Work with EARLY activities/projects:

- **[`list_activities`](list_activities.md)** - Get all activities with optional filtering
- **[`create_activity`](create_activity.md)** - Create a new activity (project)
- **[`update_activity`](update_activity.md)** - Update an existing activity
- **[`archive_activity`](archive_activity.md)** - Archive or delete an activity

### User & Reports

- **[`generate_report`](generate_report.md)** - Generate a summary report of time entries
- **[`get_current_user`](get_current_user.md)** - Get information about the currently authenticated user

## Common Usage Patterns {#patterns}

### Daily Time Tracking Workflow

1. **Start your day**: `list_activities` → `start_timer`
2. **Track work**: `stop_timer` → `start_timer` (new activity)
   - Or use `update_active_timer` to change the note while working
3. **Review**: `get_time_entries` for today
4. **Adjust**: `edit_time_entry` or `delete_time_entry` for corrections

### Retrospective Time Entry

1. **Get activities**: `list_activities`
2. **Create entries**: `create_time_entry` with specific time ranges
3. **Review and adjust**: `get_time_entries` → `edit_time_entry`

### Project Management

1. **Setup**: `create_activity` for new projects
2. **Maintenance**: `update_activity` to rename or change settings
3. **Cleanup**: `archive_activity` for completed projects

## Parameter Types {#parameter-types}

### Common Parameter Patterns

- **Activity IDs**: Get from `list_activities` tool first
- **Time Formats**: ISO 8601 timestamps (`2025-10-14T08:00:00Z`)
- **Date Formats**: Simple dates for ranges (`2025-10-14`)
- **Durations**: Minutes as numbers (`45`)

### Required vs Optional

!!! info "Parameter Requirements"
    - <span class="param-required">Red parameters</span> are **required**
    - <span class="param-optional">Gray parameters</span> are **optional**
    - See individual tool docs for detailed parameter information

## Error Handling {#errors}

All tools provide consistent error handling:

- **Authentication Errors** - Check your API credentials
- **Validation Errors** - Review required parameters  
- **API Errors** - Network or EARLY API issues
- **Resource Not Found** - Invalid IDs or deleted items

Common error resolution steps:
1. Verify API credentials in environment variables
2. Check parameter types and requirements
3. Ensure resource IDs exist (use `list_activities` to verify)
4. Review network connectivity

## Integration Examples {#integration}

### Claude Desktop

Ask Claude naturally:

```
"Start a timer for my development work"
"Show me today's time entries" 
"Create a 2-hour time entry for the client meeting this morning"
"Delete that last time entry"
"Create a new project called 'Website Redesign'"
```

### Direct MCP Calls

```json title="Example Tool Call"
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call", 
  "params": {
    "name": "create_time_entry",
    "arguments": {
      "projectId": "12345",
      "description": "Code review",
      "duration": 30
    }
  }
}
```

## Next Steps {#next-steps}

- **New to MCP?** Start with [`list_activities`](list_activities.md) to get familiar
- **Want to track time?** Try [`start_timer`](start_timer.md) and [`stop_timer`](stop_timer.md)
- **Need to log past work?** Use [`create_time_entry`](create_time_entry.md)  
- **Ready for integration?** See the [Integration Guide](../integration.md) for setup details

---

!!! tip "Tool Documentation Format"
    Each tool page includes:
    
    - **Summary** - What the tool does
    - **Parameters** - Complete parameter reference
    - **Examples** - Real usage scenarios
    - **Behavior** - Detailed operation explanation
    - **Related Tools** - Complementary functionality

