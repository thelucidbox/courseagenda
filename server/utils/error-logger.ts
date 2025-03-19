import fs from 'fs';
import path from 'path';
import { ApiError } from './error-handler';

// Define severity levels
export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

// Define log entry interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  path?: string;
  method?: string;
  statusCode?: number;
  userId?: number;
  stack?: string;
  context?: Record<string, any>;
}

// Configuration with defaults
const config = {
  logToConsole: process.env.NODE_ENV !== 'production',
  logToFile: process.env.NODE_ENV === 'production',
  logDir: process.env.LOG_DIR || 'logs',
  errorLogFile: process.env.ERROR_LOG_FILE || 'error.log',
  maxLogSize: 10 * 1024 * 1024, // 10MB
  maxLogFiles: 5, // Keep 5 rotated log files
  logSampleRate: 1.0, // Percentage of errors to log (1.0 = 100%)
};

// Ensure log directory exists
if (config.logToFile) {
  const logDir = path.resolve(config.logDir);
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true });
    } catch (err) {
      console.error(`Failed to create log directory: ${err}`);
    }
  }
}

// Format the log entry as JSON string
function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

// Rotate log files if needed
function rotateLogFileIfNeeded(): void {
  if (!config.logToFile) return;

  const logFilePath = path.resolve(config.logDir, config.errorLogFile);
  
  try {
    // Check if log file exists and exceeds size limit
    if (fs.existsSync(logFilePath)) {
      const stats = fs.statSync(logFilePath);
      
      if (stats.size >= config.maxLogSize) {
        // Rotate logs
        for (let i = config.maxLogFiles - 1; i > 0; i--) {
          const oldFile = path.resolve(config.logDir, `${config.errorLogFile}.${i}`);
          const newFile = path.resolve(config.logDir, `${config.errorLogFile}.${i + 1}`);
          
          if (fs.existsSync(oldFile)) {
            fs.renameSync(oldFile, newFile);
          }
        }
        
        // Rename current log file
        fs.renameSync(
          logFilePath,
          path.resolve(config.logDir, `${config.errorLogFile}.1`)
        );
      }
    }
  } catch (err) {
    console.error(`Error rotating log files: ${err}`);
  }
}

// Write log entry to file
function writeLogToFile(entry: string): void {
  if (!config.logToFile) return;

  const logFilePath = path.resolve(config.logDir, config.errorLogFile);
  
  try {
    rotateLogFileIfNeeded();
    fs.appendFileSync(logFilePath, entry + '\n');
  } catch (err) {
    console.error(`Failed to write to log file: ${err}`);
  }
}

// Sample errors based on configured rate (to prevent log flooding in high-traffic environments)
function shouldLogError(): boolean {
  return Math.random() <= config.logSampleRate;
}

// Core logging function
export function log(
  level: LogLevel,
  message: string,
  req?: any,
  error?: Error | ApiError,
  context?: Record<string, any>
): void {
  // For non-error logs, always process them
  // For errors, apply sampling to prevent log flooding in production
  if (level !== LogLevel.ERROR && level !== LogLevel.FATAL || shouldLogError()) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...context },
    };

    // Add request details if available
    if (req) {
      entry.path = req.path || req.originalUrl;
      entry.method = req.method;
      entry.userId = req.userId;
    }

    // Add error details if available
    if (error) {
      entry.stack = error.stack;
      
      if (error instanceof ApiError) {
        entry.statusCode = error.status;
      }
      
      // Include error properties in context
      entry.context = {
        ...entry.context,
        errorName: error.name,
        errorMessage: error.message,
      };
    }

    const formattedEntry = formatLogEntry(entry);

    // Output to console in development
    if (config.logToConsole) {
      if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
        console.error(formattedEntry);
      } else if (level === LogLevel.WARN) {
        console.warn(formattedEntry);
      } else {
        console.log(formattedEntry);
      }
    }

    // Write to file in production
    if (config.logToFile) {
      writeLogToFile(formattedEntry);
    }
  }
}

// Convenience methods
export const logInfo = (message: string, req?: any, context?: Record<string, any>) => 
  log(LogLevel.INFO, message, req, undefined, context);

export const logWarning = (message: string, req?: any, context?: Record<string, any>) => 
  log(LogLevel.WARN, message, req, undefined, context);

export const logError = (message: string, req?: any, error?: Error | ApiError, context?: Record<string, any>) => 
  log(LogLevel.ERROR, message, req, error, context);

export const logFatal = (message: string, req?: any, error?: Error | ApiError, context?: Record<string, any>) => 
  log(LogLevel.FATAL, message, req, error, context);

// Export a default logger object
export default {
  info: logInfo,
  warn: logWarning,
  error: logError,
  fatal: logFatal,
};