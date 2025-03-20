import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { storage } from "../storage";
import createMemoryStore from "memorystore";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

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
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };
  
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  const replId = process.env.REPL_ID!;
  const config = await client.discovery(
    new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
    replId,
  );

  const hostname = `${process.env.REPLIT_DOMAINS!.split(",")[0]}`;
  const callbackURL = `https://${hostname}/api/auth/replit/callback`;
  
  console.log('Replit Auth Setup - Callback URL:', callbackURL);
  
  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback) => {
    const claims = tokens.claims();
    if (!claims) {
      return
    }

    const userInfoResponse = await client.fetchUserInfo(config, tokens.access_token, claims.sub);
    
    console.log('User info from Replit Auth:', userInfoResponse);

    // Get or create user in our database
    let user = await storage.getUserByUsername(userInfoResponse.username as string);
    
    if (!user) {
      const newUser = {
        username: userInfoResponse.username as string,
        email: userInfoResponse.email || `${userInfoResponse.username}@replit.com`,
        name: userInfoResponse.first_name ? `${userInfoResponse.first_name} ${userInfoResponse.last_name || ''}` : userInfoResponse.username as string,
        profileImage: userInfoResponse.profile_image_url as string
      };
      
      user = await storage.createUser(newUser);
      console.log('Created new user from Replit Auth:', user);
    }

    verified(null, user);
  };

  const strategy = new Strategy(
    {
      config,
      scope: "openid email profile",
      callbackURL,
    },
    verify,
  );
  passport.use(strategy);

  passport.serializeUser((user: Express.User, cb) => {
    console.log('Serializing user:', user);
    cb(null, user);
  });
  passport.deserializeUser((user: Express.User, cb) => {
    console.log('Deserializing user:', user);
    cb(null, user);
  });

  app.get("/api/auth/replit", passport.authenticate(strategy.name));
  
  // Add a simpler login endpoint that redirects to the Replit auth
  app.get("/api/login", (req, res) => {
    res.redirect("/api/auth/replit");
  });

  app.get(
    "/api/auth/replit/callback",
    passport.authenticate(strategy.name, {
      successRedirect: "/home",
      failureRedirect: "/",
    }),
    (req, res) => {
      // Ensure we actually redirect to home
      res.redirect("/home");
    }
  );

  app.get("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: replId,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href,
      );
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}