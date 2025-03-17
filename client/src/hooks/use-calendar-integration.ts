import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
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
  courseSchedule?: {
    firstDayOfClass: string;
    lastDayOfClass: string;
    meetingDays: string[];
    meetingTimeStart: string;
    meetingTimeEnd: string;
  };
}

export function useCalendarIntegration() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if user has Google OAuth connected (has googleId)
  const hasGoogleAuth = isAuthenticated && user?.googleId;

  // Mutation for integrating with Google Calendar
  const googleCalendarMutation = useMutation({
    mutationFn: async (options: Omit<IntegrationOptions, 'provider'>) => {
      return apiRequest(`/api/study-plans/${options.studyPlanId}/calendar-integration`, {
        method: 'POST',
        body: {
          provider: 'google',
          courseSchedule: options.courseSchedule
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-plans'] });
      toast({
        title: 'Success!',
        description: 'Your study sessions have been added to Google Calendar',
        variant: 'default',
      });
    },
    onError: (error) => {
      console.error('Google Calendar integration error:', error);
      toast({
        title: 'Integration failed',
        description: 'Could not add events to Google Calendar. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Mutation for downloading ICS file
  const icsDownloadMutation = useMutation({
    mutationFn: async (options: {
      studyPlanId: number;
      courseSchedule?: IntegrationOptions['courseSchedule'];
    }) => {
      // Fetch study sessions and other events from the server
      const response = await apiRequest(`/api/study-plans/${options.studyPlanId}/calendar-events`, {
        method: 'POST',
        body: {
          provider: 'ics',
          courseSchedule: options.courseSchedule
        }
      });
      
      return response;
    }
  });

  // Function to integrate with user's calendar based on provider
  const integrateWithCalendar = async (options: IntegrationOptions) => {
    const { provider, events = [], studyPlanId, courseSchedule } = options;
    
    // If downloading ICS file
    if (provider === 'ics' || provider === 'outlook' || provider === 'apple') {
      try {
        if (studyPlanId) {
          // First, fetch events from server if we have a study plan ID
          try {
            // Call the API to get the study sessions
            const response = await apiRequest(`/api/study-plans/${studyPlanId}/events`, {
              method: 'GET'
            });
            
            // Process events from the response
            const calendarEvents: CalendarEvent[] = response.map((event: any) => ({
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
            await apiRequest(`/api/study-plans/${studyPlanId}/calendar-integration`, {
              method: 'POST',
              body: {
                provider: 'ics',
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
    
    // For Google Calendar integration
    if (provider === 'google') {
      if (!hasGoogleAuth) {
        toast({
          title: 'Authentication required',
          description: 'Please log in with Google to use Google Calendar integration',
          variant: 'destructive',
        });
        return false;
      }
      
      try {
        await googleCalendarMutation.mutateAsync({ studyPlanId, courseSchedule });
        return true;
      } catch (error) {
        return false;
      }
    }
    
    return false;
  };
  
  return {
    integrateWithCalendar,
    hasGoogleAuth,
    isIntegrating: googleCalendarMutation.isPending || icsDownloadMutation.isPending
  };
}