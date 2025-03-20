import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { storage } from "../storage";
import createMemoryStore from "memorystore";

// In development, allow the auth to work without Replit domains
const DEFAULT_DOMAIN = process.env.NODE_ENV === 'development' 
  ? 'localhost:5000' 
  : null;

export async function setupAuth(app: Express) {
  // Create memory store for sessions
  const MemoryStore = createMemoryStore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  });
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: false, // Allow non-secure cookies for development
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };
  
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Use Repl ID from environment or a default value for development
  const replId = process.env.REPL_ID || 'development-repl-id'; 
  
  // Set up OpenID Connect client with Replit
  try {
    const config = await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      replId,
    );

    // Get the hostname preferring Replit domains if available
    const hostname = process.env.REPLIT_DOMAINS 
      ? process.env.REPLIT_DOMAINS.split(",")[0]
      : DEFAULT_DOMAIN;
    
    if (!hostname) {
      throw new Error("Could not determine hostname - REPLIT_DOMAINS environment variable is missing");
    }

    // Build the callback URL - use HTTP for localhost, HTTPS otherwise
    const protocol = hostname.includes('localhost') ? 'http' : 'https';
    const callbackURL = `${protocol}://${hostname}/api/auth/replit/callback`;
    
    console.log('Replit Auth Setup - Callback URL:', callbackURL);
    
    // This function runs after a successful login
    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback) => {
      try {
        const claims = tokens.claims();
        if (!claims) {
          console.error('No claims found in token');
          return verified(new Error('No claims found in token'));
        }

        // Get user info from Replit
        const userInfoResponse = await client.fetchUserInfo(config, tokens.access_token, claims.sub);
        console.log('User info from Replit Auth:', userInfoResponse);

        // Default values for required fields
        const username = userInfoResponse.username as string || 'user_' + Date.now();
        const email = userInfoResponse.email || `${username}@example.com`;
        
        // Get or create user in our database
        let user = await storage.getUserByUsername(username);
        
        if (!user) {
          const newUser = {
            username,
            email,
            name: userInfoResponse.first_name 
              ? `${userInfoResponse.first_name} ${userInfoResponse.last_name || ''}` 
              : username,
            profileImage: userInfoResponse.profile_image_url as string || ''
          };
          
          user = await storage.createUser(newUser);
          console.log('Created new user from Replit Auth:', user);
        }

        verified(null, user);
      } catch (error) {
        console.error('Error in verify function:', error);
        verified(error as Error);
      }
    };

    // Create and configure the strategy
    const strategy = new Strategy(
      {
        config,
        scope: "openid email profile",
        callbackURL,
      },
      verify,
    );
    
    // Register the strategy with passport
    passport.use('replit', strategy);

    // Serialize the entire user object to the session
    passport.serializeUser((user: Express.User, cb) => {
      console.log('Serializing user:', user);
      cb(null, user);
    });
    
    // Deserialize the user from the session
    passport.deserializeUser((user: Express.User, cb) => {
      console.log('Deserializing user:', user);
      cb(null, user);
    });

    // Authentication routes
    app.get("/api/auth/replit", (req, res, next) => {
      console.log("Starting Replit auth process");
      passport.authenticate('replit')(req, res, next);
    });
    
    // Simpler login route
    app.get("/api/login", (req, res) => {
      console.log("Redirecting to Replit auth");
      res.redirect("/api/auth/replit");
    });

    // Callback route after successful authentication
    app.get(
      "/api/auth/replit/callback",
      (req, res, next) => {
        console.log("Received callback from Replit auth");
        passport.authenticate('replit', {
          successRedirect: "/home",
          failureRedirect: "/",
        })(req, res, next);
      }
    );

    // Add a test auth endpoint for debugging
    app.get("/api/auth/test", (req, res) => {
      // Create a fake test user
      const testUser = {
        id: 999,
        username: "test_user",
        email: "test@example.com",
        name: "Test User",
        profileImage: "https://placehold.co/400",
        role: "user",
        createdAt: new Date().toISOString()
      };
      
      // Login the test user
      req.login(testUser, (err) => {
        if (err) {
          console.error("Error logging in test user:", err);
          return res.status(500).json({ message: "Error logging in test user" });
        }
        
        console.log("Test user logged in successfully");
        return res.redirect("/home");
      });
    });

    // Logout route
    app.get("/api/auth/logout", (req, res) => {
      console.log("Logging out user:", req.user);
      req.logout(() => {
        try {
          // Build the logout URL
          const logoutUrl = client.buildEndSessionUrl(config, {
            client_id: replId,
            post_logout_redirect_uri: `${protocol}://${hostname}`,
          }).href;
          
          console.log("Redirecting to logout URL:", logoutUrl);
          res.redirect(logoutUrl);
        } catch (error) {
          console.error("Error building logout URL:", error);
          res.redirect("/");
        }
      });
    });

    // Debug endpoint to check if user is authenticated
    app.get("/api/auth/check", (req, res) => {
      console.log("Auth check:", {
        isAuthenticated: req.isAuthenticated?.(),
        session: req.session,
        user: req.user
      });
      
      res.json({
        isAuthenticated: !!req.isAuthenticated?.(),
        user: req.user || null
      });
    });
    
  } catch (error) {
    console.error("Error setting up Replit auth:", error);
    
    // Set up a minimal auth system for development/testing
    console.log("Setting up minimal auth system for development/testing");
    
    // Serialize/deserialize user for session
    passport.serializeUser((user: Express.User, cb) => {
      console.log('Serializing user (minimal):', user);
      cb(null, user);
    });
    
    passport.deserializeUser((user: Express.User, cb) => {
      console.log('Deserializing user (minimal):', user);
      cb(null, user);
    });
    
    // Test login endpoint for development
    app.get("/api/auth/test", (req, res) => {
      const testUser = {
        id: 999,
        username: "test_user",
        email: "test@example.com",
        name: "Test User",
        profileImage: "https://placehold.co/400",
        role: "user",
        createdAt: new Date().toISOString()
      };
      
      req.login(testUser, (err) => {
        if (err) {
          console.error("Error logging in test user:", err);
          return res.status(500).json({ message: "Error logging in test user" });
        }
        
        console.log("Test user logged in successfully");
        return res.redirect("/home");
      });
    });
    
    // Redirect login to test
    app.get("/api/login", (req, res) => {
      res.redirect("/api/auth/test");
    });
    
    app.get("/api/auth/replit", (req, res) => {
      res.redirect("/api/auth/test");
    });
    
    // Simple logout
    app.get("/api/auth/logout", (req, res) => {
      req.logout(() => {
        res.redirect("/");
      });
    });
    
    // Debug endpoint
    app.get("/api/auth/check", (req, res) => {
      res.json({
        isAuthenticated: !!req.isAuthenticated?.(),
        user: req.user || null
      });
    });
  }
  
  // Add a direct endpoint to check if the user is authenticated
  app.get('/api/auth/user', (req, res) => {
    console.log('AUTH USER CHECK:', {
      isAuthenticated: req.isAuthenticated?.(),
      user: req.user
    });
    
    if (req.isAuthenticated && req.isAuthenticated()) {
      return res.json(req.user);
    }
    
    return res.status(401).json({ message: 'Not authenticated' });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}