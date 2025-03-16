import { google } from 'googleapis';
import { type InsertUser, type User, type InsertOAuthToken } from '@shared/schema';
import { storage } from '../storage';
import { getInitials } from '@/lib/utils';

// Set up Google OAuth client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}/api/auth/google/callback`
);

// Define scopes - include calendar for integration
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Always ask for consent to get refresh token
  });
}

/**
 * Exchange OAuth code for tokens and create/login user
 */
export async function handleGoogleCallback(code: string): Promise<{
  user: User;
  isNewUser: boolean;
}> {
  try {
    // Exchange auth code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Set credentials to get user info
    oauth2Client.setCredentials(tokens);
    
    // Get user profile
    const people = google.people({ version: 'v1', auth: oauth2Client });
    const { data } = await people.people.get({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses,photos'
    });
    
    // Extract user information
    const email = data.emailAddresses?.[0]?.value;
    const name = data.names?.[0]?.displayName || email?.split('@')[0] || 'User';
    const googleId = data.resourceName?.replace('people/', '') || '';
    const profileImageUrl = data.photos?.[0]?.url;
    
    if (!email) {
      throw new Error('No email provided by Google');
    }
    
    // Check if user exists by Google ID
    let existingUser = await storage.getUserByGoogleId(googleId);
    
    // If not found by Google ID, try by email
    if (!existingUser) {
      existingUser = await storage.getUserByEmail(email);
    }
    
    let user: User;
    let isNewUser = false;
    
    if (existingUser) {
      // Update existing user if needed
      if (!existingUser.googleId) {
        // Link Google to existing email account
        existingUser = await storage.updateUser(existingUser.id, {
          googleId,
          authProvider: 'google',
          profileImageUrl: profileImageUrl || existingUser.profileImageUrl
        });
      }
      user = existingUser;
    } else {
      // Create new user
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      
      const newUser: InsertUser = {
        username,
        email,
        googleId,
        displayName: name,
        initials: getInitials(name),
        profileImageUrl,
        authProvider: 'google'
      };
      
      user = await storage.createUser(newUser);
      isNewUser = true;
    }
    
    // Store tokens in the database
    const tokenData: InsertOAuthToken = {
      userId: user.id,
      provider: 'google',
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      scope: SCOPES.join(' ')
    };
    
    // Check if user already has tokens, update if exists
    const existingToken = await storage.getOAuthToken(user.id, 'google');
    if (existingToken) {
      await storage.updateOAuthToken(existingToken.id, tokenData);
    } else {
      await storage.createOAuthToken(tokenData);
    }
    
    return { user, isNewUser };
  } catch (error) {
    console.error('Google auth error:', error);
    throw new Error('Authentication failed');
  }
}

/**
 * Create a session for the user
 */
export function createSession(req: any, user: User): void {
  req.session.userId = user.id;
}

/**
 * Get authenticated user
 */
export async function getAuthUser(req: any): Promise<User | null> {
  if (!req.session?.userId) {
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