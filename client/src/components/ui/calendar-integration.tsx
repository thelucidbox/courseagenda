import { useState, useEffect } from 'react';
import { CalendarConnectButton } from '@/components/ui/calendar-connect-button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, Info, Bell, Download, CheckCircle2 } from 'lucide-react';
import { CalendarEvent, downloadMultiEventICSFile } from '@/lib/calendar';
import { Syllabus, StudyPlan, StudySession, CourseEvent } from '@shared/schema';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

// Define the course schedule schema
const courseScheduleSchema = z.object({
  firstDayOfClass: z.date(),
  lastDayOfClass: z.date(),
  meetingDays: z.array(z.string()),
  meetingTimeStart: z.string(),
  meetingTimeEnd: z.string()
});

// Extend the course schedule schema for form validation
const courseScheduleFormSchema = courseScheduleSchema.extend({
  includeCourseSchedule: z.boolean().default(true)
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

// Reminder options for calendar events
const reminderOptions = [
  { value: "0", label: "No reminder" },
  { value: "5", label: "5 minutes before" },
  { value: "15", label: "15 minutes before" },
  { value: "30", label: "30 minutes before" },
  { value: "60", label: "1 hour before" },
  { value: "120", label: "2 hours before" },
  { value: "1440", label: "1 day before" },
  { value: "2880", label: "2 days before" },
  { value: "10080", label: "1 week before" },
  { value: "20160", label: "2 weeks before" },
];

const CalendarIntegration = ({ studyPlanId, onIntegrationComplete }: CalendarIntegrationProps) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('ics');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [icsDownloading, setIcsDownloading] = useState(false);
  const [reminderTime, setReminderTime] = useState<string>("60"); // Default: 1 hour before
  const [studySessionReminder, setStudySessionReminder] = useState<string>("30"); // Default: 30 minutes before
  const [assignmentReminder, setAssignmentReminder] = useState<string>("1440"); // Default: 1 day before
  const [examReminder, setExamReminder] = useState<string>("10080"); // Default: 1 week before
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch study plan and associated syllabus data
  const { data: studyPlan } = useQuery<StudyPlan>({
    queryKey: [`/api/study-plans/${studyPlanId}`],
    enabled: !!studyPlanId
  });

  const { data: syllabus } = useQuery<Syllabus>({
    queryKey: [`/api/syllabi/${studyPlan?.syllabusId}`],
    enabled: !!studyPlan?.syllabusId
  });
  
  // Fetch study sessions for this study plan
  const { data: studySessions } = useQuery<StudySession[]>({
    queryKey: [`/api/study-plans/${studyPlanId}/sessions`],
    enabled: !!studyPlanId
  });
  
  // Fetch course events from the syllabus
  const { data: courseEvents } = useQuery<CourseEvent[]>({
    queryKey: [`/api/syllabi/${studyPlan?.syllabusId}/events`],
    enabled: !!studyPlan?.syllabusId
  });

  // Default meeting days as fallback
  const defaultMeetingDays: WeekdayType[] = ['monday', 'wednesday', 'friday'];
  
  // Get form default values based on syllabus data or fallbacks
  const getFormDefaults = () => {
    return {
      firstDayOfClass: new Date(),
      lastDayOfClass: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      meetingDays: defaultMeetingDays,
      meetingTimeStart: '09:00',
      meetingTimeEnd: '10:30',
      includeCourseSchedule: true
    };
  };
  
  // Course schedule form
  const form = useForm<CourseScheduleFormValues>({
    resolver: zodResolver(courseScheduleFormSchema),
    defaultValues: getFormDefaults()
  });
  
  // Update form when syllabus data is available
  useEffect(() => {
    if (syllabus) {
      form.reset({
        ...form.getValues(),
        firstDayOfClass: syllabus.firstDayOfClass ? new Date(syllabus.firstDayOfClass) : form.getValues().firstDayOfClass,
        lastDayOfClass: syllabus.lastDayOfClass ? new Date(syllabus.lastDayOfClass) : form.getValues().lastDayOfClass,
        meetingDays: syllabus.meetingDays && syllabus.meetingDays.length > 0 
          ? syllabus.meetingDays as WeekdayType[]
          : form.getValues().meetingDays,
        meetingTimeStart: syllabus.meetingTimeStart || form.getValues().meetingTimeStart,
        meetingTimeEnd: syllabus.meetingTimeEnd || form.getValues().meetingTimeEnd
      });
    }
  }, [syllabus, form]);

  // Check if we need to show the schedule form
  useEffect(() => {
    if (syllabus) {
      const hasScheduleInfo = syllabus.meetingDays && 
                             syllabus.meetingDays.length > 0 &&
                             syllabus.meetingTimeStart && 
                             syllabus.meetingTimeEnd;
      setShowScheduleForm(!hasScheduleInfo);
    } else {
      setShowScheduleForm(true);
    }
  }, [syllabus]);

  const integrationMutation = useMutation({
    mutationFn: async (scheduleData?: CourseScheduleFormValues) => {
      const payload: any = { 
        provider: selectedProvider
      };
      
      // If we have schedule data and the user wants to include it, add it to the payload
      if (scheduleData && scheduleData.includeCourseSchedule) {
        Object.assign(payload, {
          courseSchedule: {
            firstDayOfClass: scheduleData.firstDayOfClass,
            lastDayOfClass: scheduleData.lastDayOfClass,
            meetingDays: scheduleData.meetingDays,
            meetingTimeStart: scheduleData.meetingTimeStart,
            meetingTimeEnd: scheduleData.meetingTimeEnd
          }
        });
      }
      
      return apiRequest('POST', `/api/study-plans/${studyPlanId}/calendar-integration`, payload);
    },
    onSuccess: async () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/study-plans/${studyPlanId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/study-plans'] });
      
      if (studyPlan?.syllabusId) {
        queryClient.invalidateQueries({ queryKey: [`/api/syllabi/${studyPlan.syllabusId}`] });
      }
      
      toast({
        title: "Calendar Integration Successful",
        description: "Your study plan has been added to your calendar",
        variant: "default"
      });
      
      if (onIntegrationComplete) {
        onIntegrationComplete();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Integration Failed",
        description: error.message || "Could not integrate with calendar. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: CourseScheduleFormValues) => {
    integrationMutation.mutate(data);
  };

  // Convert study sessions and course events to calendar events
  const convertToCalendarEvents = (): CalendarEvent[] => {
    const calendarEvents: CalendarEvent[] = [];
    
    // Add study sessions
    if (studySessions && studySessions.length > 0) {
      studySessions.forEach(session => {
        // Create a calendar event for each study session
        const startTime = new Date(session.startTime);
        const endTime = new Date(session.endTime);
        
        calendarEvents.push({
          title: `Study Session: ${session.title || 'Study Time'}`,
          description: session.description || `Study session for ${syllabus?.courseName || 'your course'}`,
          startTime,
          endTime,
          colorId: '7', // Green color for study sessions
          reminderMinutes: parseInt(studySessionReminder)
        });
      });
    }
    
    // Add course events (assignments, exams, etc.)
    if (courseEvents && courseEvents.length > 0) {
      courseEvents.forEach(event => {
        // Create calendar events for each course event
        const startTime = new Date(event.dueDate);
        startTime.setHours(23, 59, 0); // Set to end of day
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 30);
        
        let colorId = '1'; // Default blue
        let reminderSetting = parseInt(reminderTime); // Default reminder time
        
        // Assign different colors and reminder settings based on event type
        const eventTypeLower = event.eventType.toLowerCase();
        if (eventTypeLower.includes('exam') || eventTypeLower.includes('quiz') || eventTypeLower.includes('test')) {
          colorId = '11'; // Red for exams
          reminderSetting = parseInt(examReminder);
        } else if (eventTypeLower.includes('assignment') || eventTypeLower.includes('homework')) {
          colorId = '6'; // Orange for assignments
          reminderSetting = parseInt(assignmentReminder);
        } else if (eventTypeLower.includes('project')) {
          colorId = '9'; // Purple for projects
          reminderSetting = parseInt(assignmentReminder);
        }
        
        calendarEvents.push({
          title: `${event.eventType}: ${event.title}`,
          description: event.description || `${event.eventType} for ${syllabus?.courseName || 'your course'}`,
          startTime,
          endTime,
          colorId,
          reminderMinutes: reminderSetting
        });
      });
    }
    
    return calendarEvents;
  };
  
  // Handle ICS file download
  const handleDownloadICS = () => {
    try {
      setIcsDownloading(true);
      const events = convertToCalendarEvents();
      
      if (events.length === 0) {
        toast({
          title: "No Events Found",
          description: "There are no study sessions or course events to export.",
          variant: "destructive"
        });
        setIcsDownloading(false);
        return;
      }
      
      // Generate a filename based on the syllabus/course name
      const fileName = `${syllabus?.courseName || 'course'}_calendar`.replace(/\s+/g, '_').toLowerCase();
      
      // Download the ICS file
      downloadMultiEventICSFile(events, fileName);
      
      toast({
        title: "Calendar File Downloaded",
        description: "Your study plan has been exported as an ICS file.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not generate calendar file. Please try again.",
        variant: "destructive"
      });
      console.error("ICS download error:", error);
    } finally {
      setIcsDownloading(false);
    }
  };

  const handleIntegrate = async () => {
    // If the user selected the ICS file option, download it
    if (selectedProvider === 'ics') {
      handleDownloadICS();
      return;
    }
    
    // Handle Google Calendar integration
    if (selectedProvider === 'google') {
      try {
        // Fetch the OAuth URL from the server
        const response = await fetch('/api/calendar/google/auth-url');
        if (!response.ok) {
          throw new Error('Failed to get authorization URL');
        }
        
        const { url } = await response.json();
        
        // Redirect to Google's OAuth page
        window.location.href = url;
      } catch (error) {
        console.error('Failed to start OAuth flow:', error);
        toast({
          title: "Authentication Failed",
          description: "Could not connect to Google Calendar. Please try again.",
          variant: "destructive"
        });
      }
      return;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5" />
          Calendar Integration
        </CardTitle>
        <CardDescription>Add your study plan to your preferred calendar service</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-300">Calendar Options</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                You can either download your study schedule as an .ICS file which works with most calendar 
                applications, or integrate directly with your preferred calendar service.
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">1. Set Reminder Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Study Sessions</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="studySessionReminder">Remind me</Label>
                <Select
                  value={studySessionReminder}
                  onValueChange={setStudySessionReminder}
                >
                  <SelectTrigger id="studySessionReminder" className="w-full">
                    <SelectValue placeholder="Select when to be reminded" />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  When to send reminders for your study sessions
                </p>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                <h4 className="font-medium">Assignments</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignmentReminder">Remind me</Label>
                <Select
                  value={assignmentReminder}
                  onValueChange={setAssignmentReminder}
                >
                  <SelectTrigger id="assignmentReminder" className="w-full">
                    <SelectValue placeholder="Select when to be reminded" />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  When to send reminders for assignments and projects
                </p>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-500" />
                <h4 className="font-medium">Exams</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="examReminder">Remind me</Label>
                <Select
                  value={examReminder}
                  onValueChange={setExamReminder}
                >
                  <SelectTrigger id="examReminder" className="w-full">
                    <SelectValue placeholder="Select when to be reminded" />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  When to send reminders for exams and quizzes
                </p>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                <h4 className="font-medium">All Other Events</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherReminder">Remind me</Label>
                <Select
                  value={reminderTime}
                  onValueChange={setReminderTime}
                >
                  <SelectTrigger id="otherReminder" className="w-full">
                    <SelectValue placeholder="Select when to be reminded" />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  When to send reminders for other course events
                </p>
              </div>
            </div>
          </div>
        </div>
      
        <div>
          <h3 className="text-lg font-medium mb-4">2. Choose Export Option</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div 
              className={`border rounded-lg p-5 cursor-pointer hover:border-primary transition-colors ${selectedProvider === 'ics' ? 'bg-primary/5 border-primary' : ''}`}
              onClick={() => setSelectedProvider('ics')}
            >
              <div className="flex items-center gap-2 mb-3">
                <Download className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Download Calendar File</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Export your study plan as an ICS file that you can import into any calendar app 
                (Google Calendar, Apple Calendar, Outlook, etc.)
              </p>
            </div>
            
            <div 
              className={`border rounded-lg p-5 cursor-pointer hover:border-primary transition-colors ${selectedProvider === 'google' ? 'bg-primary/5 border-primary' : ''}`}
              onClick={() => setSelectedProvider('google')}
            >
              <div className="flex items-center gap-2 mb-3">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Connect to Google Calendar</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically sync your study plan with your Google Calendar account
                (requires permission to access your calendar)
              </p>
            </div>
          </div>
          
          {/* Calendar Integration Details section replaced by the card UI above */}
        </div>

        {showScheduleForm && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-medium">3. Course Schedule Information</h3>
              <div className="rounded-full bg-muted p-1">
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              We need some information about your course schedule to create calendar events properly.
            </p>
            
            <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="includeCourseSchedule"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Include course schedule in calendar</FormLabel>
                        <FormDescription>
                          When enabled, we'll create recurring events for your course meeting times.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("includeCourseSchedule") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="firstDayOfClass"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>First Day of Class</FormLabel>
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date("2020-01-01")}
                              initialFocus
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="lastDayOfClass"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Last Day of Class</FormLabel>
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < form.getValues("firstDayOfClass") ||
                                date < new Date("2020-01-01")
                              }
                              initialFocus
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {form.watch("includeCourseSchedule") && (
                  <>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="meetingDays"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">Meeting Days</FormLabel>
                              <FormDescription>
                                Select the days when your class meets.
                              </FormDescription>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {WEEKDAYS.map((item) => (
                                <FormField
                                  key={item.value}
                                  control={form.control}
                                  name="meetingDays"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={item.value}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(item.value)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, item.value])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== item.value
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="cursor-pointer font-normal">
                                          {item.label}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="meetingTimeStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter the time when class begins (24-hour format).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="meetingTimeEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter the time when class ends (24-hour format).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
              </form>
            </Form>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={onIntegrationComplete} 
          className="w-full sm:w-1/3"
          variant="outline"
        >
          <span className="flex items-center">
            Cancel
          </span>
        </Button>
        
        <Button 
          onClick={handleIntegrate} 
          className="w-full sm:w-2/3"
          disabled={selectedProvider === 'ics' ? icsDownloading : integrationMutation.isPending}
        >
          {selectedProvider === 'ics' ? (
            icsDownloading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⟳</span> Generating...
              </span>
            ) : (
              <span className="flex items-center">
                <Download className="mr-2 h-4 w-4" /> Download Calendar File
              </span>
            )
          ) : (
            integrationMutation.isPending ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⟳</span> Connecting...
              </span>
            ) : (
              <span className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" /> Sync with Google Calendar
              </span>
            )
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CalendarIntegration;
