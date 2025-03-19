import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";
import { errorHandler } from "./utils/error-handler";
import rateLimit from "express-rate-limit";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add comprehensive security headers
app.use((req, res, next) => {
  // Help protect against XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Control iframe embedding
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Referrer Policy to control information sent in the Referer header
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (formerly Feature Policy) to control browser features
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    // Allow inline scripts and styles for development only
    process.env.NODE_ENV === 'production' 
      ? "script-src 'self'" 
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    process.env.NODE_ENV === 'production'
      ? "style-src 'self'" 
      : "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://generativelanguage.googleapis.com", // Allow Gemini API
    "frame-ancestors 'self'",
    "form-action 'self'",
    "base-uri 'none'",
    "object-src 'none'"
  ];
  
  // Only set CSP in production to avoid development issues
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  } else {
    // In development, use CSP Report-Only mode to see violations without blocking
    res.setHeader('Content-Security-Policy-Report-Only', cspDirectives.join('; '));
  }
  
  // Strict Transport Security (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  
  // Cache control - prevent caching of API responses
  if (req.path.startsWith('/api') || req.path === '/health') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  
  next();
});

// Rate limiting middleware for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to API routes only
app.use('/api', apiLimiter);

// Special middleware to handle service worker files with proper MIME types
app.get('/service-worker.js', (req, res) => {
  const filePath = path.resolve('./public/service-worker.js');
  res.set('Content-Type', 'application/javascript');
  res.sendFile(filePath);
});

app.get('/register-sw.js', (req, res) => {
  const filePath = path.resolve('./public/register-sw.js');
  res.set('Content-Type', 'application/javascript');
  res.sendFile(filePath);
});

app.get('/pdf-worker-loader.js', (req, res) => {
  const filePath = path.resolve('./public/pdf-worker-loader.js');
  res.set('Content-Type', 'application/javascript');
  res.sendFile(filePath);
});

app.get('/manifest.json', (req, res) => {
  const filePath = path.resolve('./public/manifest.json');
  res.set('Content-Type', 'application/json');
  res.sendFile(filePath);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Import database functions
import { runMigrations } from "./db";

// Function to validate required environment variables
function validateEnvironment(): boolean {
  const requiredVariables = [
    'DATABASE_URL', 
    'SESSION_SECRET',
    'GEMINI_API_KEY'
  ];
  
  const optionalVariables = [
    'GOOGLE_OAUTH_CLIENT_ID',
    'GOOGLE_OAUTH_CLIENT_SECRET',
    'REPLIT_DOMAINS',
    'REPL_ID'
  ];
  
  const missingVariables = requiredVariables.filter(varName => !process.env[varName]);
  
  if (missingVariables.length > 0) {
    console.error('ERROR: Missing required environment variables:', missingVariables);
    return false;
  }
  
  // Log optional variables that might be missing
  const missingOptionalVars = optionalVariables.filter(varName => !process.env[varName]);
  if (missingOptionalVars.length > 0) {
    console.warn('WARNING: Some optional environment variables are missing:', missingOptionalVars);
  }
  
  return true;
}

(async () => {
  // Validate environment configuration
  const envValid = validateEnvironment();
  if (!envValid) {
    console.error('Environment validation failed. Some features may not work correctly.');
  }

  // Run database migrations on startup
  try {
    await runMigrations();
    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Database migration error:", error);
  }

  const server = await registerRoutes(app);

  // Use our custom error handler middleware
  app.use(errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
console.log('Server starting with environment variables:', Object.keys(process.env));
