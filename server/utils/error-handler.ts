import { Request, Response, NextFunction } from 'express';
import { log } from '../vite';
import logger from './error-logger';
import { LogLevel } from './log-types';

// Custom error classes
export class ApiError extends Error {
  status: number;
  code?: string;
  context?: Record<string, any>;
  
  constructor(message: string, status: number = 500, code?: string, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.context = context;
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, status: number = 500, code?: string, context?: Record<string, any>) {
    super(`Database error: ${message}`, status, code || 'DB_ERROR', context);
    this.name = 'DatabaseError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required', code?: string, context?: Record<string, any>) {
    super(message, 401, code || 'AUTH_ERROR', context);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource', code?: string, context?: Record<string, any>) {
    super(`${resource} not found`, 404, code || 'NOT_FOUND', context);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  errors?: Record<string, string>;
  
  constructor(message: string = 'Validation failed', errors?: Record<string, string>, code?: string, context?: Record<string, any>) {
    super(message, 400, code || 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded', code?: string, context?: Record<string, any>) {
    super(message, 429, code || 'RATE_LIMIT', context);
    this.name = 'RateLimitError';
  }
}

// Async route handler to catch errors and pass them to the error middleware
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handler middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let status = 500;
  let message = 'Internal Server Error';
  let errors: any = undefined;
  let errorCode: string | undefined;
  let context: Record<string, any> = {};
  
  // Basic logging for backward compatibility
  log(`Error: ${err.message}`, 'error');
  
  // Handle different error types
  if (err instanceof ApiError) {
    status = err.status;
    message = err.message;
    errorCode = err.code;
    context = err.context || {};
    
    if (err instanceof ValidationError && err.errors) {
      errors = err.errors;
      context.validationErrors = err.errors;
    }
  } else if (err.name === 'ZodError') {
    status = 400;
    message = 'Validation error';
    errorCode = 'VALIDATION_ERROR';
    
    try {
      errors = JSON.parse(err.message);
      context.validationErrors = errors;
    } catch {
      errors = { general: err.message };
      context.validationErrors = { general: err.message };
    }
  }
  
  // Enhanced error logging
  if (status >= 500) {
    logger.error(message, req, err, context);
  } else if (status >= 400) {
    logger.warn(message, req, context);
  }
  
  // Hide detailed error information in production
  if (process.env.NODE_ENV === 'production' && status === 500) {
    message = 'Internal Server Error';
    
    // In production, don't expose error details to client
    // but keep them in the logs
    res.status(status).json({ 
      message, 
      code: errorCode || 'SERVER_ERROR' 
    });
  } else {
    // In development, or for non-500 errors, provide more details
    const response: any = { 
      message,
      code: errorCode
    };
    
    if (errors) response.errors = errors;
    
    // In development, include stack trace for debugging
    if (process.env.NODE_ENV !== 'production' && err.stack) {
      response.stack = err.stack;
    }
    
    res.status(status).json(response);
  }
};

// Exponential backoff retry
export async function withRetry<T>(
  fn: () => Promise<T>, 
  options: { 
    retries?: number, 
    initialDelay?: number, 
    maxDelay?: number,
    factor?: number,
    onRetry?: (error: any, attempt: number) => void 
  } = {}
): Promise<T> {
  const { 
    retries = 3, 
    initialDelay = 300, 
    maxDelay = 3000,
    factor = 2,
    onRetry = (err, attempt) => {
      // Log both to the original log function for backward compatibility
      log(`Retry attempt ${attempt} after error: ${err.message}`, 'database');
      
      // And to our new structured logger
      logger.warn(`Operation retry attempt ${attempt}/${retries}`, null, {
        error: err.message,
        errorName: err.name,
        attempt,
        retries,
        nextDelay: Math.min(initialDelay * Math.pow(factor, attempt - 1), maxDelay)
      });
    }
  } = options;
  
  let attempt = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      attempt++;
      
      if (attempt > retries) {
        throw error;
      }
      
      if (onRetry) {
        onRetry(error, attempt);
      }
      
      const delay = Math.min(initialDelay * Math.pow(factor, attempt - 1), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}