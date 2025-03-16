import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Calendar } from "./calendar";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { CalendarRange, Download } from "lucide-react";
import { Separator } from "./separator";
import { format } from "date-fns";
import { useCalendarIntegration } from "@/hooks/use-calendar-integration";
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

const CalendarIntegration = ({ studyPlanId, onIntegrationComplete }: CalendarIntegrationProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [integrationMethod, setIntegrationMethod] = useState<'ics' | 'google'>('ics');
  const { integrateWithCalendar, hasGoogleAuth, isIntegrating } = useCalendarIntegration();

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

  const calendarMutation = useMutation({
    mutationFn: async (scheduleData?: CourseScheduleFormValues) => {
      return await integrateWithCalendar({
        provider: integrationMethod,
        events: [], // Events will be fetched on the server from the study plan ID
        studyPlanId,
        courseSchedule: scheduleData
          ? {
              firstDayOfClass: format(scheduleData.firstDayOfClass, 'yyyy-MM-dd'),
              lastDayOfClass: format(scheduleData.lastDayOfClass, 'yyyy-MM-dd'),
              meetingDays: scheduleData.meetingDays,
              meetingTimeStart: scheduleData.meetingTimeStart,
              meetingTimeEnd: scheduleData.meetingTimeEnd,
            }
          : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-plans'] });
      
      toast({
        title: 'Success!',
        description: `Your study plan events have been ${integrationMethod === 'google' ? 'added to Google Calendar' : 'downloaded as an ICS file'}.`,
        variant: 'default',
      });
      
      if (onIntegrationComplete) {
        onIntegrationComplete();
      }
    },
    onError: (error) => {
      console.error('Calendar integration error:', error);
      toast({
        title: 'Integration failed',
        description: 'Could not integrate with calendar. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CourseScheduleFormValues) => {
    calendarMutation.mutate(data);
  };

  const handleSimpleDownload = () => {
    calendarMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar Integration</CardTitle>
          <CardDescription>
            Add your study sessions to your calendar to stay organized
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <h3 className="font-medium">Select Integration Method</h3>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={integrationMethod === 'ics' ? 'default' : 'outline'}
                  className="flex items-center"
                  onClick={() => setIntegrationMethod('ics')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Calendar File
                </Button>
                <Button
                  type="button"
                  variant={integrationMethod === 'google' ? 'default' : 'outline'}
                  className="flex items-center"
                  onClick={() => setIntegrationMethod('google')}
                  disabled={!hasGoogleAuth}
                >
                  <CalendarRange className="mr-2 h-4 w-4" />
                  Google Calendar
                </Button>
              </div>
              {!hasGoogleAuth && integrationMethod === 'google' && (
                <p className="text-sm text-muted-foreground mt-1">
                  You need to sign in with Google to use Google Calendar integration. Please go to your profile to connect your Google account.
                </p>
              )}
            </div>

            <Separator />

            {integrationMethod === 'ics' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Download Options</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download an ICS file containing your study sessions. This file is compatible with 
                    Apple Calendar, Microsoft Outlook, Google Calendar, and most other calendar applications.
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium">Include Class Schedule</h4>
                      <p className="text-xs text-muted-foreground">
                        Set up your regular class meeting times
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => form.handleSubmit(onSubmit)()}
                    >
                      Include Class Schedule
                    </Button>
                  </div>
                  <div className="mt-4">
                    <Button 
                      disabled={isIntegrating}
                      onClick={handleSimpleDownload} 
                      className="w-full sm:w-auto"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {isIntegrating ? 'Downloading...' : 'Download Study Sessions Only'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-medium mb-2">Google Calendar Integration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sync your study sessions with Google Calendar to get notifications and manage your schedule.
                </p>
                <Button 
                  disabled={isIntegrating || !hasGoogleAuth}
                  onClick={handleSimpleDownload} 
                  className="w-full sm:w-auto"
                >
                  <CalendarRange className="mr-2 h-4 w-4" />
                  {isIntegrating ? 'Adding to Calendar...' : 'Add Study Sessions to Google Calendar'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Class Schedule</CardTitle>
          <CardDescription>
            Set up your regular class meeting times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstDayOfClass"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>First Day of Class</FormLabel>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastDayOfClass"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Last Day of Class</FormLabel>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="meetingDays"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Meeting Days</FormLabel>
                      <FormDescription>
                        Select the days when your class meets
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {WEEKDAYS.map((day) => (
                        <FormField
                          key={day.value}
                          control={form.control}
                          name="meetingDays"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={day.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(day.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, day.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== day.value
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {day.label}
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

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="meetingTimeStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="09:00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Use 24-hour format (e.g. 13:30 for 1:30 PM)
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
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="10:30" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Use 24-hour format (e.g. 14:45 for 2:45 PM)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <CardFooter className="px-0 pb-0">
                <Button type="submit" disabled={isIntegrating}>
                  {isIntegrating ? 'Processing...' : 'Add to Calendar with Class Schedule'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarIntegration;