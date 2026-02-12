# get_active_timer

Get information about the currently running timer.

## Summary {#summary}

The `get_active_timer` tool allows you to check if there is an active timer running and retrieve its details (activity, start time, description).

## Parameters {#parameters}

This tool takes no parameters.

## Behavior {#behavior}

1. **Authentication**: Verifies API credentials.
2. **API Call**: Checks for currently active tracking session.
3. **Response**: Returns timer details or indicates no timer is running.

## Examples {#examples}

### Check Active Timer

```json title="Get Active Timer"
{}
```

**Response (Timer Running):**
```
⏱️ Active Timer Running

- Activity: Development
- Description: Working on API integration
- Started: 10:30:00 AM
- ID: te_789012
```

**Response (No Timer):**
```
No active timer is currently running.
```
