import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export interface ErrorContext {
  hasApiKey: boolean;
  hasApiSecret: boolean;
  baseUrl?: string | undefined;
  args?: any;
}

export function createToolErrorResponse(error: unknown, context: ErrorContext) {
  let errorMsg = 'Unknown error';
  let errorDetails = '';

  if (error instanceof Error) {
    errorMsg = error.message;
  }

  // Check if it's an API error with more details
  if (error && typeof error === 'object') {
    const apiError = error as any;
    
    // Handle specific API errors
    if (apiError.response?.status === 404) {
      return {
        content: [
          {
            type: 'text',
            text: `⚠️ Resource not found. The requested item may have been deleted or doesn't exist.`,
          },
        ],
      };
    }
    
    if (apiError.response?.status === 409) {
      return {
        content: [
          {
            type: 'text',
            text: `⚠️ Conflict: The operation cannot be completed due to a conflict with the current state.`,
          },
        ],
      };
    }
    
    if (apiError.response?.status === 400 && apiError.response?.data?.error?.message?.includes('1 minute')) {
      return {
        content: [
          {
            type: 'text',
            text: `⏰ Timer must run for at least 1 minute before it can be stopped.\n\nPlease wait a bit longer before stopping the timer.`,
          },
        ],
      };
    }

    if (apiError.response?.status) {
      errorMsg = `API Error ${apiError.response.status}: ${apiError.message || errorMsg}`;
    }
    
    if (apiError.code) {
      errorMsg = `API Error ${apiError.code}: ${apiError.message || errorMsg}`;
    }
    
    if (apiError.details) {
      errorDetails = `\n\nAPI Error Details: ${JSON.stringify(apiError.details, null, 2)}`;
    } else if (apiError.response?.data) {
      errorDetails = `\n\nAPI Error Details: ${JSON.stringify(apiError.response.data, null, 2)}`;
    }
  }

  const debugInfo = [
    `- API Key: ${context.hasApiKey ? 'Present' : 'Missing'}`,
    `- API Secret: ${context.hasApiSecret ? 'Present' : 'Missing'}`,
    `- Base URL: ${context.baseUrl || 'not set'}`,
  ];

  if (context.args) {
    debugInfo.push(`\nProvided arguments: ${JSON.stringify(context.args, null, 2)}`);
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: `❌ Operation failed: ${errorMsg}\n\nDebug info:\n${debugInfo.join('\n')}${errorDetails}`,
      },
    ],
  };
}

export function createResourceErrorResponse(error: unknown, uri: string) {
  const errorMsg = error instanceof Error ? error.message : 'Unknown error';
  const hasApiKey = !!process.env['EARLY_API_KEY'];
  const hasApiSecret = !!process.env['EARLY_API_SECRET'];
  
  return {
    contents: [
      {
        uri: uri,
        mimeType: 'application/json',
        text: JSON.stringify({
          error: errorMsg,
          success: false,
          debug: {
            hasApiKey,
            hasApiSecret,
            baseUrl: process.env['EARLY_BASE_URL'] || 'not set',
          },
        }),
      },
    ],
  };
}

export function throwToolError(toolName: string, message: string): never {
  throw new McpError(
    ErrorCode.InternalError,
    `${toolName} failed: ${message}`
  );
}

export function throwResourceError(uri: string): never {
  throw new McpError(
    ErrorCode.InvalidRequest,
    `Resource not found: ${uri}`
  );
}

export function checkApiCredentials(): void {
  if (!process.env['EARLY_API_KEY'] || !process.env['EARLY_API_SECRET']) {
    throw new Error('API credentials not found in environment variables');
  }
}