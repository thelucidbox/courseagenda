import { Calendar, AlertTriangle, CheckCircle } from "lucide-react";

// Calendar integration providers
export interface CalendarProvider {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  authUrl: string;
  color: string;
}

export const integrationProviders: CalendarProvider[] = [
  {
    id: 'google',
    name: 'Google Calendar',
    icon: (props: any) => <Calendar {...props} />,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    color: '#DB4437',
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    icon: (props: any) => <Calendar {...props} />,
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    color: '#0078D4',
  },
  {
    id: 'apple',
    name: 'Apple Calendar',
    icon: (props: any) => <Calendar {...props} />,
    authUrl: 'https://appleid.apple.com/auth/authorize',
    color: '#000000',
  }
];

// Event mapping functions
export interface CalendarEvent {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  colorId?: string;
}

// Format study session for Google Calendar
export const formatGoogleCalendarEvent = (event: CalendarEvent) => {
  return {
    summary: event.title,
    description: event.description || '',
    start: {
      dateTime: event.startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: event.endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    location: event.location || '',
    colorId: event.colorId || '1',
  };
};

// Format study session for Outlook Calendar
export const formatOutlookCalendarEvent = (event: CalendarEvent) => {
  return {
    subject: event.title,
    body: {
      content: event.description || '',
      contentType: 'text',
    },
    start: {
      dateTime: event.startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: event.endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    location: {
      displayName: event.location || '',
    },
  };
};

// Format study session for Apple Calendar (ICS format)
export const formatAppleCalendarEvent = (event: CalendarEvent) => {
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SyllabusSync//EN
BEGIN:VEVENT
UID:${Date.now()}@syllabussync.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(event.startTime)}
DTEND:${formatICSDate(event.endTime)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT
END:VCALENDAR`;
};

// Helper function to download ICS file
export const downloadICSFile = (event: CalendarEvent) => {
  const icsContent = formatAppleCalendarEvent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
