/**
 * Centralized Logger Utility
 * Provides structured logging with environment-based filtering
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private log(level: LogLevel, message: string, data?: any): void {
    // Skip debug logs in production
    if (this.isProduction && level === 'debug') {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      ...(data && { data }),
    };

    // Format log entry
    const prefix = `[${level.toUpperCase()}] [${timestamp}]`;
    
    if (level === 'error') {
      console.error(prefix, message, data || '');
    } else if (level === 'warn') {
      console.warn(prefix, message, data || '');
    } else {
      console.log(prefix, message, data || '');
    }
  }

  /**
   * Debug logs - only in development
   */
  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  /**
   * Info logs - general information
   */
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  /**
   * Warning logs - potential issues
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  /**
   * Error logs - errors and exceptions
   */
  error(message: string, error: Error | any, data?: any): void {
    let errorMessage: string;
    let errorStack: string | undefined;

    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
    } else if (error && typeof error === 'object') {
      // Handle error objects that aren't Error instances
      errorMessage = error.message || error.error || JSON.stringify(error);
      errorStack = error.stack;
    } else {
      errorMessage = String(error);
      errorStack = undefined;
    }

    const errorData = {
      error: errorMessage,
      ...(errorStack && { stack: errorStack }),
      ...(data && { ...data }),
    };
    
    this.log('error', message, errorData);
  }
}

export const logger = new Logger();

