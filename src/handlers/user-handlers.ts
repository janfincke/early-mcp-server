import { EarlyApiClient } from '../early-api-client.js';
import { checkApiCredentials, createToolErrorResponse } from '../error-utils.js';
import { GetCurrentUserArgs } from '../tool-types.js';

export async function handleGetCurrentUser(apiClient: EarlyApiClient, _args: GetCurrentUserArgs) {
  try {
    checkApiCredentials();

    const user = await apiClient.getCurrentUser();

    return {
      content: [
        {
          type: 'text' as const,
          text: `👤 Current User\n\n` +
                `Name: ${user.firstName} ${user.lastName}\n` +
                `Email: ${user.email}\n` +
                `ID: ${user.id}\n` +
                `Timezone: ${user.timezone}\n`,
        },
      ],
    };
  } catch (error) {
    return createToolErrorResponse(error, {
      hasApiKey: !!process.env['EARLY_API_KEY'],
      hasApiSecret: !!process.env['EARLY_API_SECRET'],
    });
  }
}
