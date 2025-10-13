/**
 * Log levels enum
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * Interface for log entry
 */
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
}

/**
 * Class for handling logging
 */
export class Logger {
  private readonly context: string;
  private static logEntries: LogEntry[] = [];
  private static maxEntries: number = 1000;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Log debug message
   */
  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log info message
   */
  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log warning message
   */
  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log error message
   */
  public error(message: string, error?: any): void {
    this.log(LogLevel.ERROR, message, error);
  }

  /**
   * Get all log entries
   */
  public static getLogEntries(): LogEntry[] {
    return [...Logger.logEntries];
  }

  /**
   * Clear all log entries
   */
  public static clearLogEntries(): void {
    Logger.logEntries = [];
  }

  /**
   * Set maximum number of log entries to keep
   */
  public static setMaxEntries(max: number): void {
    Logger.maxEntries = max;
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      context: this.context,
      message,
      data
    };

    // Add entry to the log
    Logger.logEntries.push(entry);

    // Trim old entries if needed
    if (Logger.logEntries.length > Logger.maxEntries) {
      Logger.logEntries = Logger.logEntries.slice(-Logger.maxEntries);
    }

    // Console output
    this.consoleOutput(entry);
  }

  /**
   * Output to console with formatting
   */
  private consoleOutput(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${entry.level}] [${entry.context}]`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${entry.message}`, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(`${prefix} ${entry.message}`, entry.data || '');
        break;
    }
  }
}