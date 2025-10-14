# Troubleshooting Guide

This guide covers common issues you might encounter with the EARLY MCP Server and provides step-by-step solutions.

## Quick Diagnostic Checklist {#quick-diagnosis}

Before diving into specific issues, run through this quick checklist:

- [ ] **Node.js Version**: `node --version` shows 18.0.0 or higher
- [ ] **Dependencies Installed**: `npm install` completed successfully
- [ ] **Project Built**: `npm run build` completed without errors
- [ ] **API Credentials**: `.env` file exists with valid `EARLY_API_KEY` and `EARLY_API_SECRET`
- [ ] **Server Starts**: `npm run start:env` runs without immediate errors
- [ ] **Test Client Works**: `node test-client.js` shows successful tool execution

If any of these fail, start with the corresponding section below.

## Installation and Setup Issues {#installation}

### Node.js Version Problems

#### Issue: "Node.js version too old"
**Symptoms:**
- Build fails with syntax errors
- Server crashes on startup
- Dependencies fail to install

**Solution:**
1. **Check current version:**
   ```bash
   node --version
   ```

2. **Install Node.js 18 or higher:**
   - **Windows/Mac**: Download from [nodejs.org](https://nodejs.org/)
   - **Using NVM**: `nvm install 18 && nvm use 18`

3. **Verify installation:**
   ```bash
   node --version  # Should show v18.x.x or higher
   npm --version   # Should work without errors
   ```

### Dependency Installation Failures

#### Issue: "npm install fails"
**Common Error Messages:**
- `EACCES: permission denied`
- `gyp ERR! stack Error: not found: make`
- `ERR! code ERESOLVE`

**Solutions:**

**For Permission Errors:**
```bash
# Option 1: Use npx to avoid global installations
npx create-react-app --version

# Option 2: Fix npm permissions (Linux/Mac)
sudo chown -R $(whoami) ~/.npm
```

**For Build Tool Errors (Windows):**
```bash
# Install Windows build tools
npm install --global windows-build-tools

# Or use Visual Studio installer
# Install "Desktop development with C++" workload
```

**For Dependency Resolution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Build Failures

#### Issue: "TypeScript compilation fails"
**Common Symptoms:**
- `npm run build` shows type errors
- Import/export errors
- Module resolution failures

**Solutions:**

1. **Clean build:**
   ```bash
   # Remove build directory
   rm -rf dist/
   
   # Rebuild
   npm run build
   ```

2. **Check TypeScript configuration:**
   ```bash
   # Verify tsconfig.json exists and is valid
   cat tsconfig.json
   ```

3. **Update dependencies:**
   ```bash
   npm update
   npm audit fix
   ```

## API Authentication Issues {#authentication}

### Invalid API Credentials

#### Issue: "Authentication failed"
**Error Messages:**
- `Authentication failed: Invalid API key`
- `API Error 401: Unauthorized`
- `API credentials not found in environment variables`

**Solutions:**

1. **Verify credentials exist:**
   ```bash
   # Check .env file exists
   ls -la .env
   
   # Check contents (without exposing values)
   node -e "
   require('dotenv').config();
   console.log('API Key:', process.env.EARLY_API_KEY ? 'Present' : 'Missing');
   console.log('API Secret:', process.env.EARLY_API_SECRET ? 'Present' : 'Missing');
   "
   ```

2. **Get fresh credentials:**
   - Open EARLY app
   - Go to Settings → Developer → API Keys
   - Generate new API key and secret pair
   - Update `.env` file with new values

3. **Test credentials directly:**
   ```bash
   # Use curl to test API access
   curl -u "your-api-key:your-api-secret" https://api.early.app/api/v4/activities
   ```

### Environment Variable Loading

#### Issue: "Environment variables not loaded"
**Symptoms:**
- Credentials are in `.env` but still get "missing" errors
- Works with direct environment variables but not `.env` file

**Solutions:**

1. **Verify .env format:**
   ```bash title=".env"
   # Correct format (no quotes, no spaces around =)
   EARLY_API_KEY=your-key-here
   EARLY_API_SECRET=your-secret-here
   
   # Incorrect formats:
   # EARLY_API_KEY = your-key-here  ❌ (spaces)
   # EARLY_API_KEY="your-key-here"  ❌ (quotes)
   ```

2. **Check .env location:**
   ```bash
   # Must be in project root, same directory as package.json
   ls -la | grep -E "(package.json|\.env)"
   ```

3. **Test environment loading:**
   ```bash
   # Should show your credentials
   npm run start:env
   ```

## Server Runtime Issues {#runtime}

### Server Crashes or Hangs

#### Issue: "Server stops responding"
**Symptoms:**
- Server starts but then becomes unresponsive
- Long delays before responses
- Process exits unexpectedly

**Solutions:**

1. **Check for unhandled errors:**
   ```bash
   # Run with more verbose logging
   NODE_ENV=development npm run start:env
   ```

2. **Monitor resource usage:**
   ```bash
   # On Windows
   Get-Process node
   
   # On Unix systems
   ps aux | grep node
   top -p $(pgrep node)
   ```

3. **Test API connectivity:**
   ```bash
   # Test network connectivity to EARLY API
   curl -I https://api.early.app
   
   # Test with timeout
   curl --connect-timeout 10 https://api.early.app/api/v4/activities
   ```

### Memory or Performance Issues

#### Issue: "Server uses too much memory/CPU"
**Solutions:**

1. **Monitor performance:**
   ```bash
   # Run performance profiling
   node --inspect start.js
   ```

2. **Check for memory leaks:**
   ```bash
   # Use heap snapshots
   node --heap-prof start.js
   ```

3. **Optimize configuration:**
   ```bash
   # Reduce timeout values if needed
   echo "EARLY_REQUEST_TIMEOUT=15000" >> .env
   ```

## MCP Client Integration Issues {#mcp-integration}

### Claude Desktop Integration Problems

#### Issue: "Claude doesn't recognize the server"
**Symptoms:**
- Claude says it doesn't have time tracking capabilities
- No response to time-related requests
- Server appears to start but Claude can't access it

**Solutions:**

1. **Verify configuration file location:**
   ```bash
   # Windows
   echo %APPDATA%\Claude\claude_desktop_config.json
   
   # Mac
   echo ~/Library/Application\ Support/Claude/claude_desktop_config.json
   
   # Linux  
   echo ~/.config/Claude/claude_desktop_config.json
   ```

2. **Validate JSON syntax:**
   ```bash
   # Use JSON validator
   python -m json.tool claude_desktop_config.json
   
   # Or online validator: https://jsonlint.com/
   ```

3. **Check absolute paths:**
   ```json
   {
     "mcpServers": {
       "early-time-tracker": {
         "command": "node",
         "args": [
           "/absolute/path/to/early-mcp-server/start.js"
         ]
       }
     }
   }
   ```

4. **Restart Claude completely:**
   - File → Exit (don't just close window)
   - Wait 10 seconds
   - Restart Claude Desktop

#### Issue: "Server starts but tools don't work"
**Symptoms:**
- Claude acknowledges the server exists
- Tool calls return errors or timeouts
- Authentication errors in responses

**Solutions:**

1. **Test server independently:**
   ```bash
   # Should list tools successfully
   node test-client.js
   ```

2. **Check Claude Desktop logs:**
   - Windows: `%APPDATA%\Claude\logs\`
   - Mac: `~/Library/Logs/Claude/`
   - Look for MCP server errors

3. **Verify environment variables in Claude config:**
   ```json
   {
     "mcpServers": {
       "early-time-tracker": {
         "command": "node",
         "args": ["/path/to/start.js"],
         "env": {
           "EARLY_API_KEY": "your-actual-key",
           "EARLY_API_SECRET": "your-actual-secret"
         }
       }
     }
   }
   ```

### Custom MCP Client Issues

#### Issue: "Custom client can't connect"
**Common Problems:**
- Protocol version mismatch
- Incorrect JSON-RPC format
- stdio communication problems

**Solutions:**

1. **Verify protocol version:**
   ```json
   {
     "jsonrpc": "2.0",
     "id": 1,
     "method": "initialize",
     "params": {
       "protocolVersion": "2024-11-05",
       "capabilities": {},
       "clientInfo": {
         "name": "your-client",
         "version": "1.0.0"
       }
     }
   }
   ```

2. **Test stdio communication:**
   ```bash
   # Manual test
   echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node start.js
   ```

3. **Debug message format:**
   - Each message must be a single line
   - Must end with newline character
   - Must be valid JSON-RPC 2.0

## API Integration Issues {#api-issues}

### EARLY API Connectivity

#### Issue: "Cannot connect to EARLY API"
**Error Messages:**
- `ENOTFOUND api.early.app`
- `connect ETIMEDOUT`
- `API Error 503: Service Unavailable`

**Solutions:**

1. **Test network connectivity:**
   ```bash
   # Test basic connectivity
   ping api.early.app
   
   # Test HTTPS access
   curl -I https://api.early.app
   ```

2. **Check firewall/proxy:**
   ```bash
   # Test with proxy if behind corporate firewall
   export HTTPS_PROXY=http://proxy.company.com:8080
   curl https://api.early.app
   ```

3. **Verify DNS resolution:**
   ```bash
   # Check DNS
   nslookup api.early.app
   
   # Try alternative DNS
   nslookup api.early.app 8.8.8.8
   ```

### Rate Limiting

#### Issue: "Too many requests"
**Error Messages:**
- `API Error 429: Too Many Requests`
- `Rate limit exceeded`

**Solutions:**

1. **Implement backoff:**
   ```javascript
   // Add delays between requests
   await new Promise(resolve => setTimeout(resolve, 1000));
   ```

2. **Reduce request frequency:**
   - Use caching for frequently accessed data
   - Batch operations when possible
   - Avoid rapid-fire requests

3. **Check account limits:**
   - Verify EARLY account status
   - Contact EARLY support if limits seem incorrect

## Tool-Specific Issues {#tool-issues}

### Timer Tools Not Working

#### Issue: "start_timer/stop_timer fail"
**Solutions:**

1. **Check timer state:**
   ```bash
   # Test timer functionality
   node -e "
   const client = require('./dist/early-api-client.js');
   // Test timer operations
   "
   ```

2. **Verify activity IDs:**
   ```bash
   # Ensure activities exist
   node test-client.js
   # Look for valid activity IDs in the response
   ```

### Time Entry Creation Fails

#### Issue: "create_time_entry returns errors"
**Common Issues:**
- Invalid time formats
- Missing required fields
- Conflicting time ranges

**Solutions:**

1. **Validate time formats:**
   ```javascript
   // Correct format
   "startTime": "2024-01-15T09:00:00Z"
   
   // Incorrect formats
   "startTime": "2024-01-15 09:00:00"  // ❌
   "startTime": "09:00:00"             // ❌
   ```

2. **Check required fields:**
   ```json
   {
     "projectId": "required-activity-id",
     "description": "required-description"
   }
   ```

3. **Test minimal entry:**
   ```json
   {
     "projectId": "valid-activity-id",
     "description": "Test entry"
   }
   ```

## Development and Testing Issues {#development}

### Test Failures

#### Issue: "npm test fails"
**Common Causes:**
- API credentials not configured for testing
- Network connectivity issues
- Outdated dependencies

**Solutions:**

1. **Configure test environment:**
   ```bash
   # Create test .env file
   cp .env .env.test
   # Edit .env.test with test credentials
   ```

2. **Run tests in isolation:**
   ```bash
   # Run specific test file
   npm test -- tests/specific-test.test.js
   
   # Run with verbose output
   npm test -- --verbose
   ```

3. **Mock API calls:**
   ```javascript
   // Use test doubles for API calls
   jest.mock('./early-api-client.js');
   ```

### Development Server Issues

#### Issue: "Development server won't start"
**Solutions:**

1. **Check port availability:**
   ```bash
   # Windows
   netstat -an | findstr :3000
   
   # Unix
   lsof -i :3000
   ```

2. **Clear development cache:**
   ```bash
   # Clear various caches
   npm cache clean --force
   rm -rf node_modules/.cache
   rm -rf dist/
   ```

## Getting More Help {#getting-help}

### Diagnostic Information

When reporting issues, include:

1. **System Information:**
   ```bash
   node --version
   npm --version
   echo $OS || echo $OSTYPE
   ```

2. **Server Status:**
   ```bash
   npm run start:env 2>&1 | head -20
   ```

3. **Test Client Output:**
   ```bash
   node test-client.js 2>&1
   ```

### Where to Get Help

1. **GitHub Issues**: [Create an issue](https://github.com/janfincke/early-mcp-server/issues)
2. **Documentation**: Review all documentation pages
3. **Test Client**: Use included test client to isolate issues
4. **EARLY Support**: For API-specific issues

### Useful Commands for Debugging

```bash
# Complete diagnostic script
echo "=== EARLY MCP Server Diagnostics ==="
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "Project directory: $(pwd)"
echo "Environment file exists: $(test -f .env && echo 'Yes' || echo 'No')"
echo "Package.json exists: $(test -f package.json && echo 'Yes' || echo 'No')"
echo "Dist directory exists: $(test -d dist && echo 'Yes' || echo 'No')"
echo
echo "=== Testing server startup ==="
timeout 10s npm run start:env 2>&1 || echo "Server startup test completed"
echo
echo "=== Testing API connectivity ==="
curl -I https://api.early.app 2>&1 | head -5
```

---

**Still having issues?** Check the [Integration Guide](integration.md) for setup-specific problems, or [create an issue](https://github.com/janfincke/early-mcp-server/issues) with your diagnostic information.