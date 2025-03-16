import { oauth2 } from 'googleapis/build/src/apis/oauth2';
import { google } from 'googleapis';
import { storage } from '../storage';
import {
  type InsertUser,
  type User,
  type InsertOAuthToken
} from '@shared/schema';

// Google OAuth configuration
const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

// OAuth scopes
const SCOPES = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/calendar'
];

// Create OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  REDIRECT_URI
);

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(): string {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force showing the consent screen to get refresh token
  });
}

/**
 * Exchange OAuth code for tokens and create/login user
 */
export async function handleGoogleCallback(code: string): Promise<{
  user: User;
  tokens: any;
}> {
  // Exchange authorization code for tokens
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  // Get user info from Google
  const oauth2Client = google.oauth2({
    auth: oAuth2Client,
    version: 'v2'
  });
  
  const userInfo = await oauth2Client.userinfo.get();
  
  if (!userInfo.data.id || !userInfo.data.email) {
    throw new Error('Could not retrieve user information from Google');
  }

  // Check if user already exists
  let user = await storage.getUserByGoogleId(userInfo.data.id);
  
  if (!user) {
    // If not, also check if user exists with this email
    user = await storage.getUserByEmail(userInfo.data.email);
    
    if (user) {
      // Update existing user with Google ID
      user = await storage.updateUser(user.id, {
        googleId: userInfo.data.id
      }) || user;
    } else {
      // Create new user
      const newUser: InsertUser = {
        username: userInfo.data.email.split('@')[0] || `user_${Date.now()}`,
        email: userInfo.data.email,
        googleId: userInfo.data.id,
        name: userInfo.data.name || '',
        profileImage: userInfo.data.picture || ''
      };
      
      user = await storage.createUser(newUser);
    }
  }

  // Store/update OAuth tokens
  const existingToken = await storage.getOAuthToken(user.id, 'google');
  
  // Calculate token expiration date
  const expiresAt = new Date();
  if (tokens.expiry_date) {
    expiresAt.setTime(tokens.expiry_date);
  } else if (tokens.expires_in) {
    expiresAt.setTime(Date.now() + tokens.expires_in * 1000);
  } else {
    // Default to 1 hour if no expiration info
    expiresAt.setTime(Date.now() + 3600 * 1000);
  }

  const tokenData: InsertOAuthToken = {
    userId: user.id,
    provider: 'google',
    accessToken: tokens.access_token || '',
    refreshToken: tokens.refresh_token || (existingToken?.refreshToken || ''),
    expiresAt
  };

  if (existingToken) {
    await storage.updateOAuthToken(existingToken.id, tokenData);
  } else {
    await storage.createOAuthToken(tokenData);
  }

  return { user, tokens };
}

/**
 * Create a session for the user
 */
export function createSession(req: any, user: User): void {
  req.session.userId = user.id;
  req.session.isAuthenticated = true;
}

/**
 * Get authenticated user
 */
export async function getAuthUser(req: any): Promise<User | null> {
  if (!req.session || !req.session.userId) {
    return null;
  }
  
  const user = await storage.getUser(req.session.userId);
  return user || null;
}

/**
 * Log out user
 */
export function logout(req: any): void {
  req.session.destroy();
}