import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";
import { errorHandler } from "./utils/error-handler";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

(async () => {
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
