import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Calendar } from "./calendar";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Download, CalendarDays, FileText } from "lucide-react";
import { Separator } from "./separator";
import { format } from "date-fns";
import { downloadMultiEventICSFile } from "@/lib/calendar";
import { getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const courseScheduleFormSchema = z.object({
  firstDayOfClass: z.date({
    required_error: "First day of class is required",
  }),
  lastDayOfClass: z.date({
    required_error: "Last day of class is required",
  }).refine(date => date > new Date(), {
    message: "Last day of class must be in the future",
  }),
  meetingDays: z.array(z.string()).nonempty({
    message: "Select at least one meeting day",
  }),
  meetingTimeStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid time format. Use HH:MM (24-hour format)",
  }),
  meetingTimeEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid time format. Use HH:MM (24-hour format)",
  }),
});

type CourseScheduleFormValues = z.infer<typeof courseScheduleFormSchema>;

interface CalendarIntegrationProps {
  studyPlanId: number;
  onIntegrationComplete?: () => void;
}

type WeekdayType = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const WEEKDAYS: { value: WeekdayType; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

interface StudyPlanEvent {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  type: string;
}

const CalendarIntegration = ({ studyPlanId, onIntegrationComplete }: CalendarIntegrationProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [includeStudySessions, setIncludeStudySessions] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch events for this study plan
  const { data: events } = useQuery({
    queryKey: [`/api/study-plans/${studyPlanId}/events`],
    queryFn: getQueryFn<StudyPlanEvent[]>({ on401: "returnNull" }),
  });

  const form = useForm<CourseScheduleFormValues>({
    resolver: zodResolver(courseScheduleFormSchema),
    defaultValues: {
      firstDayOfClass: new Date(),
      lastDayOfClass: new Date(new Date().setMonth(new Date().getMonth() + 3)), // Default to 3 months duration
      meetingDays: ['monday', 'wednesday', 'friday'],
      meetingTimeStart: '09:00',
      meetingTimeEnd: '10:30',
    },
  });

  const handleDownload = async () => {
    if (!events || events.length === 0) {
      toast({
        title: 'No events available',
        description: 'There are no events to download for this study plan.',
        variant: 'destructive',
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      // Filter events based on selection
      const filteredEvents = events.filter(event => {
        if (event.type === 'study') {
          return includeStudySessions;
        }
        return true; // Always include course events
      });
      
      // Convert events to calendar format
      const calendarEvents = filteredEvents.map(event => ({
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
      
      toast({
        title: 'Success!',
        description: 'Your calendar file has been downloaded.',
        variant: 'default',
      });
      
      if (onIntegrationComplete) {
        onIntegrationComplete();
      }
    } catch (error) {
      console.error('Calendar download error:', error);
      toast({
        title: 'Download failed',
        description: 'Could not generate calendar file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadWithSchedule = async (data: CourseScheduleFormValues) => {
    // In a real implementation, this would combine regular class schedule with events
    // For now, just download the events
    handleDownload();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar Download</CardTitle>
          <CardDescription>
            Download your course events and study sessions to your calendar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Download Options</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download an ICS file compatible with Apple Calendar, Microsoft Outlook, Google Calendar, and most other calendar applications.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Button
                  type="button"
                  variant={includeStudySessions ? 'default' : 'outline'}
                  className="flex items-center justify-center"
                  onClick={() => setIncludeStudySessions(true)}
                  size="lg"
                >
                  <CalendarDays className="mr-2 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">All Events</div>
                    <div className="text-xs opacity-90">Course events + study sessions</div>
                  </div>
                </Button>
                
                <Button
                  type="button"
                  variant={!includeStudySessions ? 'default' : 'outline'}
                  className="flex items-center justify-center"
                  onClick={() => setIncludeStudySessions(false)}
                  size="lg"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Course Events Only</div>
                    <div className="text-xs opacity-90">Assignments, exams, etc.</div>
                  </div>
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <Button 
                onClick={handleDownload} 
                disabled={isDownloading}
                className="w-full"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                {isDownloading ? 'Downloading...' : 'Download Calendar File'}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-2">
                This file can be imported into Google Calendar, Apple Calendar, Microsoft Outlook, and other calendar applications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* You can add other cards for class schedule settings here */}
    </div>
  );
};

export default CalendarIntegration;