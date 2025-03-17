import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { useAuth } from './use-auth';
import { downloadMultiEventICSFile } from '@/lib/calendar';
import { useToast } from './use-toast';

interface CalendarEvent {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  colorId?: string;
  reminderMinutes?: number;
}

interface IntegrationOptions {
  provider: 'google' | 'outlook' | 'apple' | 'ics';
  events?: CalendarEvent[];
  studyPlanId?: number;
  includeStudySessions?: boolean;
  courseSchedule?: {
    firstDayOfClass: string;
    lastDayOfClass: string;
    meetingDays: string[];
    meetingTimeStart: string;
    meetingTimeEnd: string;
  };
}

interface StudyPlanEvent {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  type: string;
}

export function useCalendarIntegration() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if user has Google OAuth connected (has googleId)
  const hasGoogleAuth = isAuthenticated && user?.googleId;

  // Function to integrate with user's calendar based on provider
  const integrateWithCalendar = async (options: IntegrationOptions) => {
    const { provider, events = [], studyPlanId, courseSchedule, includeStudySessions = true } = options;
    
    // Remove the Google Calendar option - we'll only support ICS downloads
    if (provider === 'ics' || provider === 'outlook' || provider === 'apple') {
      try {
        if (studyPlanId) {
          // First, fetch events from server if we have a study plan ID
          try {
            // Call the API to get all events
            const fetchEvents = getQueryFn<StudyPlanEvent[]>({ on401: "throw" });
            const response = await fetchEvents(`/api/study-plans/${studyPlanId}/events`);
            
            if (!response || !Array.isArray(response)) {
              throw new Error('Invalid response from API');
            }
            
            // Filter events based on user selection
            const filteredEvents = response.filter((event) => {
              // Always include course events (assignments, exams, etc.)
              if (event.type === 'assignment' || event.type === 'exam' || event.type === 'lab' || event.type === 'other') {
                return true;
              }
              
              // Only include study sessions if includeStudySessions is true
              if (event.type === 'study') {
                return includeStudySessions;
              }
              
              // Include all other event types by default
              return true;
            });
            
            // Process events from the response
            const calendarEvents: CalendarEvent[] = filteredEvents.map((event) => ({
              title: event.title,
              description: event.description || '',
              startTime: new Date(event.startTime),
              endTime: new Date(event.endTime),
              location: event.location || '',
              reminderMinutes: event.type === 'exam' ? 60 * 24 * 7 : // 1 week for exams
                             event.type === 'assignment' ? 60 * 24 : // 1 day for assignments
                             30 // 30 minutes for study sessions
            }));
            
            // Generate and download the ICS file
            downloadMultiEventICSFile(calendarEvents, `study_plan_${studyPlanId}`);
            
            // Mark as integrated in the database
            await apiRequest<{ message: string }>(`/api/study-plans/${studyPlanId}/calendar-integration`, {
              method: 'POST',
              body: {
                provider: 'ics',
                includeStudySessions,
                courseSchedule
              }
            });
            
            queryClient.invalidateQueries({ queryKey: ['/api/study-plans'] });
            
            toast({
              title: 'Success!',
              description: 'Your calendar file has been downloaded',
              variant: 'default',
            });
            
            return true;
          } catch (error) {
            console.error('Error fetching study plan events:', error);
            // If API fails, try to download with provided events only
            if (events.length > 0) {
              downloadMultiEventICSFile(events, `study_plan_${studyPlanId}`);
              toast({
                title: 'Success!',
                description: 'Your calendar file has been downloaded with limited events',
                variant: 'default',
              });
              return true;
            } else {
              throw new Error('No events to download');
            }
          }
        } else if (events.length > 0) {
          // If no study plan ID but we have events, download those
          downloadMultiEventICSFile(events, 'study_events');
          toast({
            title: 'Success!',
            description: 'Your calendar file has been downloaded',
            variant: 'default',
          });
          return true;
        } else {
          throw new Error('No events to download');
        }
      } catch (error) {
        console.error('ICS file generation error:', error);
        toast({
          title: 'Download failed',
          description: 'Could not generate calendar file. Please try again.',
          variant: 'destructive',
        });
        return false;
      }
    }
    
    return false;
  };
  
  return {
    integrateWithCalendar,
    hasGoogleAuth,
    isIntegrating: false
  };
}