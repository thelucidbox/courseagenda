import { google } from 'googleapis';
import type { calendar_v3 } from 'googleapis';
import { oauthTokens } from '@shared/schema';
import type { OAuthToken } from '@shared/schema';

if (!process.env.GOOGLE_OAUTH_CLIENT_ID || !process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
  throw new Error('Google OAuth credentials not configured');
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  `${process.env.REPLIT_DOMAINS?.split(',')[0]}/api/auth/google/callback`
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Required scopes for calendar integration
export const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
];

// Get the authorization URL for Google Calendar
export function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_CALENDAR_SCOPES,
    prompt: 'consent',
  });
}

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expiry_date: number;
  scope: string;
}> {
  const { tokens } = await oauth2Client.getToken(code);
  return {
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date!,
    scope: tokens.scope!,
  };
}

// Create a calendar event
export async function createCalendarEvent(
  token: OAuthToken,
  event: {
    summary: string;
    description?: string;
    start: { dateTime: string };
    end: { dateTime: string };
    reminders?: calendar_v3.Schema$Event['reminders'];
  }
): Promise<string> {
  oauth2Client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken || undefined,
  });

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      ...event,
      reminders: event.reminders || {
        useDefault: true,
      },
    },
  });

  return response.data.id!;
}

// Helper function to refresh tokens if needed
export async function refreshTokenIfNeeded(token: OAuthToken): Promise<{
  accessToken: string;
  expiresAt: Date;
} | null> {
  if (!token.refreshToken || !token.expiresAt) {
    return null;
  }

  const expiresAt = new Date(token.expiresAt);
  if (expiresAt > new Date()) {
    return null;
  }

  oauth2Client.setCredentials({
    refresh_token: token.refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  return {
    accessToken: credentials.access_token!,
    expiresAt: new Date(credentials.expiry_date!),
  };
}