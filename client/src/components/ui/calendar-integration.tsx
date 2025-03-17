import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Calendar } from "./calendar";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Download, CalendarDays, FileText } from "lucide-react";
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
  const [downloadType, setDownloadType] = useState<'all' | 'course-only'>('all');
  const { integrateWithCalendar, isIntegrating } = useCalendarIntegration();

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
    mutationFn: async (options: {
      includeStudySessions: boolean;
      courseSchedule?: CourseScheduleFormValues;
    }) => {
      const { includeStudySessions, courseSchedule } = options;
      
      return await integrateWithCalendar({
        provider: 'ics',
        studyPlanId,
        includeStudySessions,
        courseSchedule: courseSchedule
          ? {
              firstDayOfClass: format(courseSchedule.firstDayOfClass, 'yyyy-MM-dd'),
              lastDayOfClass: format(courseSchedule.lastDayOfClass, 'yyyy-MM-dd'),
              meetingDays: courseSchedule.meetingDays,
              meetingTimeStart: courseSchedule.meetingTimeStart,
              meetingTimeEnd: courseSchedule.meetingTimeEnd,
            }
          : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-plans'] });
      
      toast({
        title: 'Success!',
        description: 'Your calendar file has been downloaded.',
        variant: 'default',
      });
      
      if (onIntegrationComplete) {
        onIntegrationComplete();
      }
    },
    onError: (error) => {
      console.error('Calendar download error:', error);
      toast({
        title: 'Download failed',
        description: 'Could not generate calendar file. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDownloadWithSchedule = (data: CourseScheduleFormValues) => {
    calendarMutation.mutate({
      includeStudySessions: downloadType === 'all',
      courseSchedule: data
    });
  };

  const handleDownload = () => {
    calendarMutation.mutate({
      includeStudySessions: downloadType === 'all'
    });
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
                  variant={downloadType === 'all' ? 'default' : 'outline'}
                  className="flex items-center justify-center"
                  onClick={() => setDownloadType('all')}
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
                  variant={downloadType === 'course-only' ? 'default' : 'outline'}
                  className="flex items-center justify-center"
                  onClick={() => setDownloadType('course-only')}
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
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="text-sm font-medium">Include Regular Class Schedule?</h4>
                  <p className="text-xs text-muted-foreground">
                    Add your regular class meeting times to the calendar
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => form.handleSubmit(handleDownloadWithSchedule)()}
                  >
                    Yes, Include Schedule
                  </Button>
                  <Button 
                    onClick={handleDownload} 
                    disabled={isIntegrating}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isIntegrating ? 'Downloading...' : 'Download Now'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Class Schedule Settings</CardTitle>
          <CardDescription>
            Define your regular class meeting times to add to the calendar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleDownloadWithSchedule)} className="space-y-6">
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
                  {isIntegrating ? 'Processing...' : 'Download with Class Schedule'}
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