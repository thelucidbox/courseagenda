import passport from "passport";
import session from "express-session";
import { Strategy as LocalStrategy } from "passport-local";
import type { Express, RequestHandler } from "express";
import { storage } from "../storage";
import createMemoryStore from "memorystore";

// Mock user for development
const DEV_USER = {
  id: 999,
  username: "test_user",
  email: "test@example.com",
  name: "Test User",
  profileImage: "https://placehold.co/400",
  role: "user",
  createdAt: new Date().toISOString()
};

export async function setupAuth(app: Express) {
  console.log("Setting up authentication system...");
  
  // Create memory store for sessions
  const MemoryStore = createMemoryStore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  });
  
  // Session configuration
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
  
  // Set up session middleware
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  
  // Set up Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure local strategy for username/password login
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        // In a real app, we would check the password
        // For our test user, accept any password
        if (username === "test") {
          return done(null, DEV_USER);
        }
        
        // For real users, fetch from database
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        
        // In a real app, we would verify the password here
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
  
  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    console.log("Serializing user:", user);
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    console.log("Deserializing user ID:", id);
    try {
      // Special case for our dev user
      if (id === 999) {
        return done(null, DEV_USER);
      }
      
      // For regular users, fetch from database
      const user = await storage.getUser(id);
      done(null, user || null);
    } catch (err) {
      done(err, null);
    }
  });
  
  // Login route - for actual username/password login
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });
  
  // Test login endpoint - auto-login with test user
  app.get("/api/auth/test", (req, res) => {
    console.log("Test login requested");
    
    // Set the user directly in the session
    (req.session as any).passport = { user: DEV_USER.id };
    
    // Force session save
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Error saving session" });
      }
      
      console.log("Test user logged in successfully");
      return res.redirect("/");
    });
  });
  
  // Alternative test login that uses the login function
  app.get("/api/auth/test2", (req, res) => {
    if (req.isAuthenticated?.()) {
      console.log("User already authenticated:", req.user);
      return res.redirect("/");
    }
    
    req.login(DEV_USER, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Error logging in" });
      }
      
      console.log("Login successful, redirecting to home");
      return res.redirect("/");
    });
  });
  
  // Simplified login for development
  app.get("/api/login", (req, res) => {
    console.log("Redirecting to test login");
    res.redirect("/api/auth/test");
  });
  
  // Logout route
  app.get("/api/auth/logout", (req, res) => {
    console.log("Logout requested, user:", req.user);
    
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error during logout" });
      }
      
      console.log("Logout successful");
      res.redirect("/");
    });
  });
  
  // Check authentication status
  app.get("/api/auth/check", (req, res) => {
    console.log("Auth check:", {
      isAuthenticated: req.isAuthenticated?.(),
      user: req.user,
      session: req.session
    });
    
    res.json({
      isAuthenticated: !!req.isAuthenticated?.(),
      user: req.user || null
    });
  });
  
  // User info endpoint
  app.get('/api/auth/user', (req, res) => {
    console.log('User info requested:', {
      isAuthenticated: req.isAuthenticated?.(),
      user: req.user,
      session: req.session
    });
    
    if (req.isAuthenticated?.()) {
      return res.json(req.user);
    }
    
    return res.status(401).json({ message: 'Not authenticated' });
  });
  
  console.log("Authentication system setup complete");
}

// Middleware to enforce authentication
export const isAuthenticated: RequestHandler = (req, res, next) => {
  console.log("Checking authentication:", req.isAuthenticated?.());
  if (req.isAuthenticated?.()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}