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

// Helper function to generate ICS content for multiple events
export const generateMultiEventICS = (events: CalendarEvent[]) => {
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Start the calendar
  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SyllabusSync//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Study Plan Events
`;

  // Add each event
  events.forEach(event => {
    // Escape special characters
    const sanitizeICS = (text: string = '') => {
      return text
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;')
        .replace(/\\n/g, '\\n')
        .replace(/\n/g, '\\n');
    };

    const summary = sanitizeICS(event.title);
    const description = sanitizeICS(event.description);
    const location = sanitizeICS(event.location);

    icsContent += `BEGIN:VEVENT
UID:${Date.now() + Math.random().toString(36).substring(2, 10)}@syllabussync.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(event.startTime)}
DTEND:${formatICSDate(event.endTime)}
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
`;
  });

  // End the calendar
  icsContent += 'END:VCALENDAR';
  
  return icsContent;
};

// Helper function to download ICS file for a single event
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

// Helper function to download ICS file for multiple events
export const downloadMultiEventICSFile = (events: CalendarEvent[], filename: string = 'study_plan_events') => {
  if (events.length === 0) {
    console.warn('No events to download');
    return;
  }

  const icsContent = generateMultiEventICS(events);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
