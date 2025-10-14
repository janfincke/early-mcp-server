# Usage Guide

Advanced usage patterns, real-world examples, and best practices for the EARLY MCP Server.

## Overview {#overview}

This guide covers practical usage scenarios, advanced configurations, and tips for getting the most out of the EARLY MCP Server. For basic setup, see [Getting Started](getting-started.md).

## Real-World Usage Patterns {#patterns}

### Daily Time Tracking Workflow {#daily-workflow}

The most common pattern for professional time tracking:

#### Morning Setup
```
"List my active projects and start a timer for today's first task"
```

**Claude will:**
1. Call `list_activities` to show your projects
2. Let you choose which project to work on
3. Call `start_timer` to begin tracking

#### During Work Day
```
"Switch my timer to client work"
```

**Claude will:**
1. Stop the current timer automatically
2. Start a new timer for the specified project
3. Confirm the switch

#### End of Day Review
```
"Show me today's time breakdown and total hours"
```

**Claude will:**
1. Call `get_time_entries` for today
2. Calculate totals by project
3. Present a summary report

### Project Time Analysis {#project-analysis}

For managers and consultants tracking billable hours:

#### Weekly Project Review
```
"Show me all time spent on the Johnson project this week"
```

**Example workflow:**
1. Get project ID: `list_activities` → find "Johnson Project"
2. Get week's entries: `get_time_entries` with date range + project filter
3. Calculate totals and present breakdown

#### Monthly Billing Preparation
```
"Generate a report for all billable projects in October 2024"
```

**Process:**
1. Query all time entries for October
2. Filter by billable projects
3. Group by client/project
4. Calculate totals and rates

### Team Time Management {#team-management}

For teams using shared EARLY accounts:

#### Project Coordination
```
"Check if anyone else is working on the website project right now"
```

**Note:** This requires multiple team members to have MCP servers configured with their own API credentials.

#### Resource Planning
```
"How much time did we spend on development tasks this month?"
```

## Advanced Tool Combinations {#advanced-combinations}

### Retroactive Time Logging {#retroactive-logging}

When you forget to track time in real-time:

#### Log Yesterday's Work
```
"I worked on three things yesterday: client meeting 2-3pm, development 3:30-6pm, and admin tasks 6-6:30pm"
```

**Claude will create multiple time entries:**
```json
[
  {
    "tool": "create_time_entry",
    "args": {
      "projectId": "client_project_id",
      "description": "Client meeting",
      "startTime": "2024-01-15T14:00:00Z",
      "endTime": "2024-01-15T15:00:00Z"
    }
  },
  {
    "tool": "create_time_entry", 
    "args": {
      "projectId": "development_project_id",
      "description": "Development work",
      "startTime": "2024-01-15T15:30:00Z",
      "endTime": "2024-01-15T18:00:00Z"
    }
  }
]
```

#### Bulk Time Entry Creation
For logging an entire week retroactively, you can ask Claude to create multiple entries in sequence.

### Time Entry Corrections {#corrections}

#### Fix Incorrect Times
```
"I need to change yesterday's client meeting from 2-3pm to 1:30-2:30pm"
```

**Process:**
1. `get_time_entries` to find the entry
2. `edit_time_entry` to update the times
3. Confirm the change

#### Move Time Between Projects
```
"Move the last 30 minutes of my development time to the testing project"
```

**Complex workflow:**
1. Find the development time entry
2. Edit it to reduce duration by 30 minutes
3. Create new testing entry for those 30 minutes

### Advanced Reporting {#advanced-reporting}

#### Custom Time Ranges
```
"Show me my time tracking from December 15th to January 5th"
```

#### Project Comparisons
```
"Compare my time spent on Project A vs Project B this quarter"
```

#### Productivity Analysis
```
"What are my most and least productive days based on tracked time?"
```

## MCP Resources Usage {#resources-usage}

The server provides 4 MCP resources that give direct access to data:

### Today's Time Data
Access: `early://time-entries/today`

**Use case:** Dashboard displays, quick status checks
```javascript
// Example: Custom dashboard showing today's total
const todayData = await readResource("early://time-entries/today");
const entries = JSON.parse(todayData).entries;
const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0);
```

### Weekly Time Summary  
Access: `early://time-entries/week`

**Use case:** Weekly reports, team coordination
```javascript
// Example: Weekly summary for status meetings
const weekData = await readResource("early://time-entries/week");
const weekSummary = processWeeklyData(JSON.parse(weekData));
```

### Activities Management
Access: `early://activities` or `early://activities/active`

**Use case:** Project selection UIs, activity management
```javascript
// Example: Populate project dropdown
const activities = await readResource("early://activities/active");
const activeProjects = JSON.parse(activities).activities;
```

## Integration Patterns {#integration-patterns}

### Claude Desktop Natural Language

Claude Desktop provides the most natural experience. You can use conversational language:

#### Time Tracking Commands
```
"Start timing my work on the mobile app"
"I've been working for 2 hours, create a time entry for API development"
"Stop my timer and show me today's summary"
"Change yesterday's 3pm meeting to start at 2:30pm instead"
```

#### Questions and Analysis
```
"How productive was I last week?"
"Which project am I spending the most time on?"
"Did I forget to track any time today?"
"What's my average daily work time this month?"
```

### Custom MCP Client Integration

For developers building custom integrations:

#### Time Tracking Widget
```javascript
// Example: Simple time tracking widget
class EarlyTimeWidget {
  async startTimer(projectName) {
    const activities = await this.mcpClient.callTool('list_activities');
    const project = activities.find(a => a.name.includes(projectName));
    
    if (project) {
      await this.mcpClient.callTool('start_timer', {
        projectId: project.id,
        description: `Working on ${projectName}`
      });
    }
  }
  
  async stopTimer() {
    return await this.mcpClient.callTool('stop_timer');
  }
}
```

#### Automated Reporting
```javascript
// Example: Generate weekly report
async function generateWeeklyReport() {
  const entries = await mcpClient.callTool('get_time_entries', {
    startDate: getWeekStart(),
    endDate: getWeekEnd()
  });
  
  return processTimeEntries(entries);
}
```

## Performance and Optimization {#optimization}

### Efficient API Usage

#### Batch Operations
Instead of multiple individual calls, batch related operations:

```javascript
// Efficient: Get all needed data first
const [activities, todayEntries] = await Promise.all([
  mcpClient.callTool('list_activities'),
  mcpClient.callTool('get_time_entries')
]);

// Then use the data for multiple operations
```

#### Caching Strategies
For applications making frequent calls:

```javascript
// Cache activities list (changes infrequently)
class EarlyCache {
  constructor(mcpClient) {
    this.mcpClient = mcpClient;
    this.activitiesCache = null;
    this.cacheExpiry = null;
  }
  
  async getActivities() {
    if (!this.activitiesCache || Date.now() > this.cacheExpiry) {
      this.activitiesCache = await this.mcpClient.callTool('list_activities');
      this.cacheExpiry = Date.now() + (5 * 60 * 1000); // 5 minutes
    }
    return this.activitiesCache;
  }
}
```

### Error Handling Best Practices

#### Retry Logic
```javascript
async function callWithRetry(toolName, args, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await mcpClient.callTool(toolName, args);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      await sleep(1000 * Math.pow(2, i));
    }
  }
}
```

#### Graceful Degradation
```javascript
async function getTimeEntries(fallbackToCache = true) {
  try {
    return await mcpClient.callTool('get_time_entries');
  } catch (error) {
    if (fallbackToCache && cachedEntries) {
      console.warn('Using cached time entries due to API error');
      return cachedEntries;
    }
    throw error;
  }
}
```

## Security Best Practices {#security}

### Credential Management

#### Environment Variables
```bash
# Production .env
EARLY_API_KEY=prod_key_here
EARLY_API_SECRET=prod_secret_here

# Development .env  
EARLY_API_KEY=dev_key_here
EARLY_API_SECRET=dev_secret_here
```

#### Rotation Strategy
```bash
# Monthly API key rotation script
#!/bin/bash
echo "Rotating EARLY API keys..."

# Get new credentials from EARLY
# Update .env file
# Restart MCP server
# Verify connectivity

echo "API key rotation completed"
```

### Access Control

#### User Permissions
- Each user should have their own API credentials
- Don't share API keys between team members
- Use EARLY's built-in access controls

#### Network Security
```javascript
// Optional: Restrict network access
const allowedHosts = ['api.early.app'];

if (!allowedHosts.includes(new URL(apiUrl).hostname)) {
  throw new Error('Unauthorized API endpoint');
}
```

## Monitoring and Debugging {#monitoring}

### Health Checks

#### Server Status Monitoring
```javascript
// Example: Health check endpoint
async function healthCheck() {
  try {
    const activities = await mcpClient.callTool('list_activities');
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      activitiesCount: activities.length
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

#### Automated Testing
```bash
# Daily automated test
#!/bin/bash
echo "Testing EARLY MCP Server..."

node test-client.js > test_results.log 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Tests passed"
else
  echo "❌ Tests failed - check test_results.log"
  # Send alert notification
fi
```

### Usage Analytics

#### Track API Usage
```javascript
class UsageTracker {
  constructor() {
    this.callCounts = {};
    this.errorCounts = {};
  }
  
  recordCall(toolName) {
    this.callCounts[toolName] = (this.callCounts[toolName] || 0) + 1;
  }
  
  recordError(toolName, error) {
    this.errorCounts[toolName] = (this.errorCounts[toolName] || 0) + 1;
  }
  
  generateReport() {
    return {
      totalCalls: Object.values(this.callCounts).reduce((a, b) => a + b, 0),
      mostUsedTool: Object.keys(this.callCounts).sort((a, b) => 
        this.callCounts[b] - this.callCounts[a])[0],
      errorRate: Object.values(this.errorCounts).reduce((a, b) => a + b, 0) /
                 Object.values(this.callCounts).reduce((a, b) => a + b, 0)
    };
  }
}
```

## Development and Extension {#development}

### Adding Custom Tools

When you need functionality not provided by the standard tools:

#### Custom Tool Template
```typescript
// src/handlers/custom-handlers.ts
export async function handleCustomTool(apiClient: EarlyApiClient, args: CustomArgs) {
  try {
    checkApiCredentials();
    
    // Your custom logic here
    const result = await apiClient.customOperation(args);
    
    return {
      content: [{
        type: 'text',
        text: `✅ Custom operation completed: ${JSON.stringify(result)}`
      }]
    };
  } catch (error) {
    return createToolErrorResponse(error, {
      hasApiKey: !!process.env.EARLY_API_KEY,
      hasApiSecret: !!process.env.EARLY_API_SECRET,
      baseUrl: process.env.EARLY_BASE_URL,
      args
    });
  }
}
```

#### Register Custom Tool
```typescript
// In src/index.ts setupHandlers method
case 'custom_tool':
  return await this.handleCustomTool(request.params.arguments as CustomArgs);
```

### Testing Custom Integrations

#### Unit Tests
```javascript
// tests/custom-integration.test.ts
describe('Custom Integration', () => {
  it('should handle custom workflow', async () => {
    const mockClient = new MockEarlyApiClient();
    const result = await handleCustomWorkflow(mockClient, testArgs);
    
    expect(result).toBeDefined();
    expect(mockClient.callCount).toBe(3);
  });
});
```

#### Integration Tests
```javascript
// tests/integration.test.ts
describe('End-to-End Integration', () => {
  it('should complete full workflow', async () => {
    // Test complete user workflow
    const activities = await mcpServer.callTool('list_activities');
    const timer = await mcpServer.callTool('start_timer', {
      projectId: activities[0].id
    });
    // ... continue workflow
  });
});
```

---

For more specific integration help, see the [Integration Guide](integration.md) or [Troubleshooting Guide](troubleshooting.md).