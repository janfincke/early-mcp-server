# Getting Started

This guide will help you install, configure, and run the EARLY MCP Server in just a few minutes.

## Prerequisites {#prerequisites}

Before you begin, ensure you have:

- **Node.js** >= 18.0.0 ([Download here](https://nodejs.org/))
- **npm** or yarn package manager  
- **EARLY Account** with API access ([Sign up](https://early.app/))
- **Git** for cloning the repository

!!! tip "Node.js Version Check"
    Verify your Node.js version with: `node --version`

## Installation {#installation}

### 1. Clone the Repository

```bash
git clone https://github.com/janfincke/early-mcp-server.git
cd early-mcp-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Project

```bash
npm run build
```

## Configuration {#configuration}

### 1. Get Your EARLY API Credentials

1. Open the EARLY app on your device
2. Go to **Settings** → **Developer** → **API Keys**  
3. Generate a new API key and secret pair
4. Copy both the **API Key** and **API Secret**

!!! warning "Keep Credentials Secure"
    Never commit your API credentials to version control. Store them securely in environment variables.

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```bash title=".env"
# Required - Get these from EARLY app settings
EARLY_API_KEY=your-early-api-key-here
EARLY_API_SECRET=your-early-api-secret-here
```

!!! info "Authentication Method"
    The server uses EARLY API v4 with API Key + Secret authentication flow.

## Testing the Installation {#testing}

### Method 1: Quick Test

Test that the server starts and responds:

```bash
npm run start:env
```

This should start the server without errors. Use `Ctrl+C` to stop it.

### Method 2: Run Unit Tests

Use the built-in test suite to verify MCP functionality:

```bash
npm test
```

Expected output:
```
MCP protocol initialization
Tool listing  
Resource listing
Basic tool execution
```

### Method 3: Run Unit Tests

Execute the full test suite:

```bash
npm test
```

You should see **24 tests passing** across 4 test files.

!!! note "Test Suite Status"
    Some Jest worker process warnings may appear, but they don't affect functionality.

## Verify API Connection {#verify-connection}

Test your EARLY API credentials by listing activities:

1. Start the server: `npm run start:env`
2. In another terminal, use the test client to call `list_activities`
3. You should see your EARLY activities listed

If you get authentication errors:
- Verify your API credentials are correct
- Ensure both API key AND secret are provided  
- Check that credentials are from the same EARLY account

## Development Commands {#development-commands}

Once installed, you can use these commands:

```bash title="Development Workflow"
npm run dev        # Watch mode TypeScript compilation
npm run build      # Production build
npm run start      # Run the compiled server
npm run start:env  # Run with environment setup
```

```bash title="Code Quality"
npm test           # Run Jest tests
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues automatically
```

## Project Structure {#structure}

Understanding the project layout:

```
early-mcp-server/
├── src/                    # TypeScript source
│   ├── index.ts           # Main MCP server
│   ├── early-api-client.ts # EARLY API client
│   ├── types.ts           # Type definitions
│   ├── tool-types.ts      # Tool argument types  
│   ├── error-utils.ts     # Error handling utilities
│   ├── utils.ts           # Helper functions
│   └── handlers/          # Tool handler implementations
├── dist/                   # Compiled JavaScript
├── tests/                  # Jest unit tests  
├── docs/                   # Documentation (this site)
├── start.js               # Entry point with env loading
└── .env                   # Environment variables (create this)
```

## Next Steps {#next-steps}

Now that you have the server running:

1. **[Learn the Tools](tools/index.md)** - Explore all 6 time tracking tools
2. **[Claude Desktop Integration](integration.md)** - Set up integration with detailed guide  
3. **[Advanced Usage](usage.md)** - Real-world patterns and best practices
4. **[Troubleshooting](troubleshooting.md)** - Common issues and solutions

## Quick Start Checklist {#checklist}

- [ ] Node.js >= 18.0.0 installed
- [ ] Repository cloned and dependencies installed
- [ ] Project built successfully (`npm run build`)
- [ ] EARLY API credentials obtained
- [ ] `.env` file configured with credentials
- [ ] Server starts without errors (`npm run start:env`)
- [ ] Unit tests pass (`npm test`)

**You're ready to start using the EARLY MCP Server!**
