# Integration Guide

This guide covers integrating the EARLY MCP Server with various MCP clients, with detailed focus on Claude Desktop and other popular implementations.

## Overview {#overview}

The EARLY MCP Server works with any MCP-compatible client. The most common integration is with Claude Desktop, but it also works with other MCP clients and custom implementations.

**Supported Clients:**
- **Claude Desktop** - Most popular and well-tested
- **Custom MCP Clients** - Any client implementing MCP protocol
- **Development Clients** - Testing and debugging tools

## Claude Desktop Integration {#claude-desktop}

Claude Desktop is the most popular MCP client and provides an excellent experience with the EARLY MCP Server.

### Prerequisites

Before starting, ensure you have:
- [Claude Desktop installed](https://claude.ai/download)
- EARLY MCP Server [installed and configured](getting-started.md)
- API credentials configured in `.env` file
- Server successfully tested with `npm run start:env`

### Configuration Steps

#### 1. Locate Claude Desktop Configuration

Find your Claude Desktop configuration file:

=== "Windows"
    ```
    %APPDATA%\Claude\claude_desktop_config.json
    ```
    **Full path example:**
    ```
    C:\Users\YourName\AppData\Roaming\Claude\claude_desktop_config.json
    ```

=== "macOS"
    ```
    ~/Library/Application Support/Claude/claude_desktop_config.json
    ```

=== "Linux"
    ```
    ~/.config/Claude/claude_desktop_config.json
    ```

#### 2. Create Configuration File

If the file doesn't exist, create it with this basic structure:

```json title="claude_desktop_config.json"
{
  "mcpServers": {
  }
}
```

#### 3. Add EARLY MCP Server

Add your server configuration to the `mcpServers` section:

```json title="claude_desktop_config.json"
{
  "mcpServers": {
    "early-time-tracker": {
      "command": "node",
      "args": [
        "G:\\path\\to\\your\\early-mcp-server\\start.js"
      ],
      "env": {
        "EARLY_API_KEY": "your-early-api-key-here",
        "EARLY_API_SECRET": "your-early-api-secret-here",
        "EARLY_BASE_URL": "https://api.early.app"
      }
    }
  }
}
```

!!! warning "Use Absolute Paths"
    Always use absolute paths in Claude Desktop configuration. Relative paths will not work correctly.

!!! tip "Windows Path Format"
    On Windows, use forward slashes (`/`) or escaped backslashes (`\\\\`) in the JSON configuration.

#### 4. Configure Environment Variables

**Option A: Direct in Configuration (Recommended for testing)**
```json
"env": {
  "EARLY_API_KEY": "your-actual-api-key",
  "EARLY_API_SECRET": "your-actual-secret",
  "EARLY_BASE_URL": "https://api.early.app"
}
```

**Option B: Use .env File (Recommended for production)**
```json
"args": [
  "G:\\path\\to\\your\\early-mcp-server\\start.js"
]
```

The `start.js` file automatically loads from `.env`, so you don't need to expose credentials in the configuration.

#### 5. Restart Claude Desktop

After saving the configuration:
1. **Completely quit** Claude Desktop (File → Exit)
2. **Restart** Claude Desktop
3. **Wait** for the server to initialize (usually 5-10 seconds)

### Verification {#verification}

#### Test Basic Functionality

Ask Claude to test the integration:

```
Can you show me my available activities from EARLY?
```

Expected response should list your EARLY activities.

#### Test Time Tracking

```
Start a timer for my development work
```

```
Show me today's time entries
```

```
Stop the current timer
```

#### Check Server Status

If something isn't working, ask Claude:

```
Are there any issues with the EARLY time tracking server?
```

### Common Claude Desktop Issues {#claude-issues}

#### Server Not Found
**Symptoms:** Claude says it doesn't know about time tracking
**Solutions:**
- Verify absolute path in configuration
- Check that `start.js` exists at the specified location
- Ensure Claude Desktop was completely restarted

#### Authentication Errors
**Symptoms:** Tools work but return authentication failures
**Solutions:**
- Verify API credentials in `.env` file
- Test credentials with `npm run start:env`
- Check that both API key AND secret are provided

#### Server Crashes
**Symptoms:** Tools work initially but then stop responding
**Solutions:**
- Check Node.js version (must be 18+)
- Run `npm test` to verify server stability
- Check for network connectivity issues

## Custom MCP Client Integration {#custom-clients}

For developers building custom MCP clients or integrating with other tools:

### MCP Protocol Requirements

Your client must support:
- **MCP Protocol Version**: 2024-11-05 or later
- **Transport**: stdio (standard input/output)
- **Message Format**: JSON-RPC 2.0

### Basic Connection Example

```python title="Python MCP Client Example"
import json
import subprocess
import sys

# Start the MCP server
server_process = subprocess.Popen([
    'node', 
    '/path/to/early-mcp-server/start.js'
], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

# Initialize MCP connection
init_message = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {
            "name": "custom-client",
            "version": "1.0.0"
        }
    }
}

# Send initialization
server_process.stdin.write(json.dumps(init_message) + '\n')
server_process.stdin.flush()

# Read response
response = server_process.stdout.readline()
print(json.loads(response))
```

### Available Tools and Resources

Once connected, your client can access:

#### Tools
- `list_activities` - Get available projects
- `create_time_entry` - Log time entries  
- `start_timer` - Begin time tracking
- `stop_timer` - End time tracking
- `get_time_entries` - Query time data
- `edit_time_entry` - Modify existing entries

#### Resources  
- `early://time-entries/today` - Today's time data
- `early://time-entries/week` - Weekly time data
- `early://activities` - All activities
- `early://activities/active` - Active activities only

### Tool Call Example

```json title="List Activities Tool Call"
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "list_activities",
    "arguments": {
      "active": true
    }
  }
}
```

### Resource Access Example

```json title="Resource Read Request"
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "resources/read",
  "params": {
    "uri": "early://time-entries/today"
  }
}
```

## Development and Testing {#development}

### Test Client

The EARLY MCP Server includes a test client for development:

```bash
node test-client.js
```

This validates:
- MCP protocol initialization
- Tool listing and execution
- Resource access
- Error handling

### Manual Testing

For manual protocol testing:

```bash
# Start server in one terminal
npm run start:env

# In another terminal, send JSON-RPC messages
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | npm run start:env
```

### Debugging Connection Issues

#### Server-Side Debugging

1. **Check server startup:**
   ```bash
   npm run start:env
   ```

2. **Run unit tests:**
   ```bash
   npm test
   ```

3. **Validate API credentials:**
   ```bash
   # Should list your activities
   node -e "
   require('dotenv').config();
   console.log('API Key:', process.env.EARLY_API_KEY ? 'Present' : 'Missing');
   console.log('API Secret:', process.env.EARLY_API_SECRET ? 'Present' : 'Missing');
   "
   ```

#### Client-Side Debugging

1. **Verify MCP client configuration**
2. **Check stdout/stderr for server errors** 
3. **Validate JSON-RPC message format**
4. **Test with basic tools first** (`list_activities`)

## Advanced Configuration {#advanced}

### Environment Variables

All environment variables that can be configured:

```bash title=".env"
# Required
EARLY_API_KEY=your-api-key-here
EARLY_API_SECRET=your-api-secret-here

# Optional
EARLY_BASE_URL=https://api.early.app    # Default API endpoint
```

### Multiple MCP Servers

You can run multiple MCP servers in Claude Desktop:

```json title="Multiple Servers Configuration"
{
  "mcpServers": {
    "early-time-tracker": {
      "command": "node",
      "args": ["/path/to/early-mcp-server/start.js"],
      "env": { /* EARLY credentials */ }
    },
    "other-server": {
      "command": "python",
      "args": ["/path/to/other-server/main.py"],
      "env": { /* Other server config */ }
    }
  }
}
```

### Performance Optimization

For better performance:

#### Server-Side
- Use SSD storage for faster Node.js startup
- Ensure stable internet connection for EARLY API calls
- Consider caching frequently accessed data

#### Client-Side  
- Use connection pooling for multiple requests
- Implement request timeouts (default: 30 seconds)
- Handle rate limiting gracefully

## Security Considerations {#security}

### Credential Management

**Recommended:**
- Store credentials in `.env` file (not tracked by git)
- Use environment variables in production
- Rotate API keys regularly

**Avoid:**
- Hard-coding credentials in configuration files
- Committing credentials to version control
- Sharing configuration files with credentials

### Network Security

- EARLY API uses HTTPS (secure by default)
- MCP communication is local (stdio transport)
- No network ports exposed by the server

### Access Control

The MCP server inherits the permissions of the user running it:
- Only accesses EARLY data associated with provided API credentials
- Cannot access other user accounts or data
- Respects EARLY's API rate limits and access controls

## Troubleshooting {#troubleshooting}

### Quick Diagnosis

Run through this checklist when integration isn't working:

1. **Server starts successfully:**
   ```bash
   npm run start:env
   # Should not show errors
   ```

2. **API credentials work:**
   ```bash
   node test-client.js
   # Should show activities list
   ```

3. **Client configuration is correct:**
   - Absolute paths used
   - JSON syntax is valid
   - Environment variables are set

4. **Client was restarted:**
   - Completely quit and restart MCP client
   - Wait for server initialization

### Getting Help

If you're still having issues:

1. **Check the [GitHub issues](https://github.com/janfincke/early-mcp-server/issues)**
2. **Review server logs** for error messages  
3. **Test with the included test client** to isolate issues
4. **Verify EARLY API access** independently

---

**Next Steps:** Once integration is working, explore the [Tools Reference](tools/index.md) to learn about all available time tracking functionality!