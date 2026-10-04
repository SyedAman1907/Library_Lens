type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

function sanitize(message: string): string {
  // Never expose API keys or credentials
  return message
    .replace(/(AIza[0-9A-Za-z-_]{35})/g, '[REDACTED_GEMINI_KEY]')
    .replace(/([a-f0-9]{64})/gi, (match) => match.length === 64 ? '[REDACTED_API_KEY]' : match)
    .replace(/(mongodb(\+srv)?:\/\/[^:]+:)[^@]+(@)/g, '$1***$3');
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    console.log(`[${new Date().toISOString()}] [INFO] ${sanitize(message)}`, context ? JSON.stringify(context) : '');
  },
  warn(message: string, context?: Record<string, unknown>) {
    console.warn(`[${new Date().toISOString()}] [WARN] ${sanitize(message)}`, context ? JSON.stringify(context) : '');
  },
  error(message: string, error?: unknown) {
    const errorDetails = error instanceof Error ? error.stack || error.message : String(error);
    console.error(`[${new Date().toISOString()}] [ERROR] ${sanitize(message)}`, error ? sanitize(errorDetails) : '');
  },
  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') {
      console.log(`[${new Date().toISOString()}] [DEBUG] ${sanitize(message)}`, context ? JSON.stringify(context) : '');
    }
  }
};
