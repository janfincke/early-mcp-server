/**
 * Utility functions for the Early MCP Server
 */

/**
 * Get the system locale for proper time formatting
 * On Windows, this will detect the system locale properly
 */
export function getSystemLocale(): string {
  // Try to get locale from environment variables (Windows)
  const windowsLocale = process.env['LC_ALL'] || process.env['LC_TIME'] || process.env['LANG'];
  if (windowsLocale) {
    return windowsLocale;
  }

  // Try to get locale from Intl API
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    // Fallback to English if nothing else works
    return 'en-US';
  }
}

/**
 * Get the system timezone identifier
 */
export function getSystemTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // Fallback to UTC if timezone detection fails
    return 'UTC';
  }
}

/**
 * Format time using the system locale with consistent options
 * Treats input times as UTC and converts to local timezone
 */
export function formatLocalTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  // Early API returns times like '2025-10-14T06:00:19.657' which are UTC
  // We need to parse them as UTC and convert to local time
  let dateObj: Date;
  if (typeof date === 'string') {
    // Parse as UTC by treating the string as a UTC time
    dateObj = new Date(date + (date.includes('Z') ? '' : 'Z'));
  } else {
    dateObj = date;
  }
  
  const locale = getSystemLocale();
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Use 24-hour format by default, can be overridden
    timeZone: 'Europe/Helsinki', // Convert to Finnish local time
    ...options
  };

  try {
    return dateObj.toLocaleTimeString(locale, defaultOptions);
  } catch {
    // Fallback to standard format if locale formatting fails
    return dateObj.toLocaleTimeString('fi-FI', defaultOptions);
  }
}

/**
 * Format date and time using the system locale
 */
export function formatLocalDateTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = getSystemLocale();
  const timeZone = getSystemTimeZone();
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: timeZone, // Convert to system timezone
    ...options
  };

  try {
    return dateObj.toLocaleString(locale, defaultOptions);
  } catch {
    // Fallback to standard format if locale formatting fails
    return dateObj.toLocaleString('en-US', defaultOptions);
  }
}

/**
 * Format duration in a human-readable format
 */
export function formatDuration(startTime: Date | string, endTime: Date | string): string {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  
  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = Math.round(durationMs / 1000 / 60);
  
  if (durationMinutes < 60) {
    return `${durationMinutes} min`;
  }
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

/**
 * Get current date in ISO format (YYYY-MM-DD) for the local timezone
 */
export function getCurrentDateLocal(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60000);
  return localDate.toISOString().substring(0, 10);
}
