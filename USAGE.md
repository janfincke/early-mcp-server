# Early App MCP Server - Usage Guide

## 🚀 Quick Start

### Prerequisites

-   Node.js 18+
-   Valid EARLY API key and secret (get from your EARLY app account)

### Installation & Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and update with your credentials:

```bash
EARLY_API_KEY=your-actual-api-key-here
EARLY_API_SECRET=your-actual-api-secret-here
EARLY_BASE_URL=https://api.early.app
```

3. **Build the project:**

```bash
npm run build
```

4. **Test the server:**

```bash
npm run start:env
```

## 🧪 Testing the Server

### Method 1: Using the Test Client

Run our built-in test client:

```bash
node test-client.js
```

This will test:

-   MCP protocol initialization
-   Tool listing
-   Resource listing
-   Basic tool execution

### Method 2: Manual Testing

You can manually test using stdio:

```bash
npm run start:env
```

Then send JSON-RPC messages:

```json
{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": { "name": "test", "version": "1.0.0" }
    }
}
```

### Method 3: Run Unit Tests

```bash
npm test
```

## 🛠️ Available Tools

The server provides these tools for time tracking:

### 1. `list_activities`

Get all activities from EARLY

```json
{
    "name": "list_activities",
    "arguments": {
        "active": true // optional: filter active activities only
    }
}
```

### 2. `create_time_entry`

Create a new time entry (placeholder implementation)

```json
{
    "name": "create_time_entry",
    "arguments": {
        "projectId": "proj_123",
        "description": "Working on feature X",
        "startTime": "2024-01-01T10:00:00Z", // optional
        "endTime": "2024-01-01T11:00:00Z", // optional
        "duration": 60 // optional (minutes)
    }
}
```

### 3. `start_timer`

Start tracking time (placeholder implementation)

```json
{
    "name": "start_timer",
    "arguments": {
        "projectId": "proj_123",
        "description": "Working on something" // optional
    }
}
```

### 4. `stop_timer`

Stop the current timer (placeholder implementation)

```json
{
    "name": "stop_timer",
    "arguments": {}
}
```

### 5. `get_time_entries`

Get time entries for a date range (placeholder implementation)

```json
{
    "name": "get_time_entries",
    "arguments": {
        "startDate": "2024-01-01", // optional (YYYY-MM-DD)
        "endDate": "2024-01-31", // optional (YYYY-MM-DD)
        "projectId": "proj_123" // optional
    }
}
```

## 📋 Available Resources

### 1. `early://time-entries/today`

Today's time entries (placeholder data)

### 2. `early://time-entries/week`

This week's time entries (placeholder data)

### 3. `early://projects`

All projects (placeholder data)

### 4. `early://projects/active`

Active projects only (placeholder data)

## 🔗 Integration with MCP Clients

### Claude Desktop Integration

1. **Open Claude Desktop configuration:**

    - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
    - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. **Add your server configuration:**

```json
{
    "mcpServers": {
        "early-time-tracker": {
            "command": "node",
            "args": ["E:\\early-app-mcp-server\\start.js"],
            "env": {
                "EARLY_API_KEY": "your-api-key-here",
                "EARLY_API_SECRET": "your-api-secret-here",
                "EARLY_BASE_URL": "https://api.early.app"
            }
        }
    }
}
```

3. **Restart Claude Desktop**

4. **Test in Claude:**
    - Ask Claude to "list my activities"
    - Ask Claude to "show me today's time entries"
    - Ask Claude to "start a timer for activity X"

### Other MCP Clients

For other MCP clients, use:

-   **Command:** `node`
-   **Args:** `["path/to/your/start.js"]`
-   **Working Directory:** `E:\early-app-mcp-server`
-   **Environment Variables:** Set `EARLY_API_KEY`, `EARLY_API_SECRET`, and `EARLY_BASE_URL`

## 🔍 Troubleshooting

### Server Won't Start

-   Check Node.js version: `node --version` (should be 18+)
-   Verify build: `npm run build`
-   Check environment variables in `.env`

### API Calls Failing

-   Verify your EARLY_API_KEY and EARLY_API_SECRET are correct
-   Check if the API endpoint is accessible
-   Review server logs for detailed error messages
-   Ensure both API key and secret are from the same EARLY account

**Authentication Method**: The server uses Basic Auth with `key:secret` by default. If EARLY API uses a different method, edit the authentication section in `src/early-api-client.ts` and uncomment the appropriate method.

### Claude Desktop Not Recognizing Server

-   Verify the path in `claude_desktop_config.json` is absolute
-   Check that environment variables are set in the config
-   Restart Claude Desktop completely
-   Check Claude's developer tools/logs for errors

### Testing Connection Issues

```bash
# Test if server starts
npm run start:env

# Test with our test client
node test-client.js

# Check if port/stdio communication works
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{}}}' | npm run start:env
```

## 📝 Development

### Project Structure

```
early-app-mcp-server/
├── src/                    # TypeScript source
│   ├── index.ts           # Main server
│   ├── early-api-client.ts # EARLY API client
│   └── types.ts           # Type definitions
├── dist/                   # Compiled JavaScript
├── tests/                  # Jest unit tests
├── start.js               # Entry point with env loading
├── test-client.js         # MCP test client
└── .env                   # Environment variables
```

### Available Scripts

```bash
npm run build      # Compile TypeScript
npm run dev        # Watch mode compilation
npm run start      # Run compiled server
npm run start:env  # Run with environment variables
npm run test       # Run unit tests
npm run lint       # Lint TypeScript code
npm run lint:fix   # Fix linting issues
```

### Adding New Tools

1. Add tool definition in `setupHandlers()` method
2. Implement handler method (e.g., `handleNewTool()`)
3. Add route in the `CallToolRequestSchema` handler
4. Update types if needed
5. Add tests

## 🚨 Security Notes

-   Never commit `.env` files to version control
-   Use environment variables for all sensitive data
-   Validate all input parameters in tool handlers
-   Consider rate limiting for production use
-   Regularly rotate API keys

## 📚 Resources

-   [MCP Protocol Documentation](https://modelcontextprotocol.io/)
-   [EARLY API Documentation](https://early.app/api-docs)
-   [Claude Desktop MCP Guide](https://docs.anthropic.com/mcp)
-   [Node.js MCP SDK](https://github.com/modelcontextprotocol/servers)
