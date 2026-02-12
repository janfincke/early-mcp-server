# get_current_user

Get information about the currently authenticated user.

## Summary {#summary}

The `get_current_user` tool allows you to retrieve profile information for the API key being used.

## Parameters {#parameters}

This tool takes no parameters.

## Behavior {#behavior}

1. **Authentication**: Verifies API credentials.
2. **API Call**: Sends a request to `/api/v4/users/me`.
3. **Response**: Returns user profile details (Name, Email, ID, Timezone).

## Examples {#examples}

### Get User Info

```json title="Get Current User"
{}
```

**Response:**
```
👤 Current User

Name: John Doe
Email: john.doe@example.com
ID: usr_123456
Timezone: Europe/Helsinki
```
