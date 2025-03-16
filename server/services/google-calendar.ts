import { google } from 'googleapis';
import { type OAuthToken } from '@shared/schema';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}/api/auth/google/callback`
);

export const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

export function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_CALENDAR_SCOPES,
    prompt: 'consent'
  });
}

export async function getTokensFromCode(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  scope: string;
  expiresAt: Date;
}> {
  const { tokens } = await oauth2Client.getToken(code);
  
  return {
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token,
    scope: tokens.scope!,
    expiresAt: new Date(Date.now() + (tokens.expiry_date! - Date.now()))
  };
}

export async function createCalendarEvent(
  token: OAuthToken,
  event: {
    summary: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    reminders?: { method: 'email' | 'popup'; minutes: number }[];
  }
) {
  oauth2Client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken ?? undefined,
    expiry_date: token.expiresAt?.getTime()
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const calendarEvent = {
    summary: event.summary,
    description: event.description,
    start: {
      dateTime: event.startTime.toISOString(),
      timeZone: 'UTC'
    },
    end: {
      dateTime: event.endTime.toISOString(),
      timeZone: 'UTC'
    },
    reminders: event.reminders ? {
      useDefault: false,
      overrides: event.reminders
    } : undefined
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: calendarEvent
  });

  return response.data;
}

export async function refreshTokenIfNeeded(token: OAuthToken): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
} | null> {
  if (!token.refreshToken) return null;
  
  oauth2Client.setCredentials({
    refresh_token: token.refreshToken
  });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    return {
      accessToken: credentials.access_token!,
      refreshToken: credentials.refresh_token ?? token.refreshToken,
      expiresAt: new Date(Date.now() + (credentials.expiry_date! - Date.now()))
    };
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
}