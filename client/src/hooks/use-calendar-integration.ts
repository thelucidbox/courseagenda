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
  events: CalendarEvent[];
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

  // Function to integrate with user's calendar based on provider
  const integrateWithCalendar = async (options: IntegrationOptions) => {
    const { provider, events, studyPlanId, courseSchedule } = options;
    
    // If downloading ICS file, use the downloadMultiEventICSFile function
    if (provider === 'ics' || provider === 'outlook' || provider === 'apple') {
      try {
        downloadMultiEventICSFile(events, `study_plan_${studyPlanId || 'events'}`);
        toast({
          title: 'Success!',
          description: 'Your calendar file has been downloaded',
          variant: 'default',
        });
        
        // Also update the database to mark this as integrated
        if (studyPlanId) {
          await apiRequest(`/api/study-plans/${studyPlanId}/calendar-integration`, {
            method: 'POST',
            body: {
              provider: 'ics',
              courseSchedule
            }
          });
          queryClient.invalidateQueries({ queryKey: ['/api/study-plans'] });
        }
        
        return true;
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
    
    // For Google Calendar integration, use the mutation if authenticated
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
        await googleCalendarMutation.mutateAsync({ events, studyPlanId, courseSchedule });
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
    isIntegrating: googleCalendarMutation.isPending
  };
}