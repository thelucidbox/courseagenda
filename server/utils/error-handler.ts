import { Request, Response, NextFunction } from 'express';
import { log } from '../vite';

// Custom error classes
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, status: number = 500) {
    super(`Database error: ${message}`, status);
    this.name = 'DatabaseError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  errors?: Record<string, string>;
  
  constructor(message: string = 'Validation failed', errors?: Record<string, string>) {
    super(message, 400);
    this.name = 'ValidationError';
    this.errors = errors;
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
  
  log(`Error: ${err.message}`, 'error');
  
  if (err instanceof ApiError) {
    status = err.status;
    message = err.message;
    if (err instanceof ValidationError && err.errors) {
      errors = err.errors;
    }
  } else if (err.name === 'ZodError') {
    status = 400;
    message = 'Validation error';
    errors = JSON.parse(err.message);
  }
  
  // Hide detailed error information in production
  if (process.env.NODE_ENV === 'production' && status === 500) {
    message = 'Internal Server Error';
  }
  
  const response: any = { message };
  if (errors) response.errors = errors;
  
  res.status(status).json(response);
};

// Exponential backoff retry
export async function withRetry<T>(
  fn: () => Promise<T>, 
  options: { 
    retries?: number, 
    initialDelay?: number, 
    maxDelay?: number,
    factor?: number,
    onRetry?: (error: Error, attempt: number) => void 
  } = {}
): Promise<T> {
  const { 
    retries = 3, 
    initialDelay = 300, 
    maxDelay = 3000,
    factor = 2,
    onRetry = (err, attempt) => log(`Retry attempt ${attempt} after error: ${err.message}`, 'database')
  } = options;
  
  let attempt = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
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