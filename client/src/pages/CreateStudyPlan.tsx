import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ProgressSteps from '@/components/ui/progress-steps';
import CalendarIntegration from '@/components/ui/calendar-integration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDays, format, differenceInDays, addHours } from 'date-fns';
import { Loader2, Calendar, Book, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { type Syllabus, type CourseEvent, type StudyPlan, type StudySession } from '@shared/schema';

const steps = [
  { label: 'Upload Syllabus', status: 'completed' as const },
  { label: 'Extract Information', status: 'completed' as const },
  { label: 'Create Study Plan', status: 'current' as const }
];

// Form validation schema
const studyPlanSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  sessionsPerWeek: z.number().min(1).max(7),
  hoursPerSession: z.number().min(1).max(8),
});

type StudyPlanValues = z.infer<typeof studyPlanSchema>;

const CreateStudyPlan = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('plan-details');
  const [createdPlan, setCreatedPlan] = useState<StudyPlan | null>(null);
  const [generatedSessions, setGeneratedSessions] = useState<StudySession[]>([]);
  
  // Fetch syllabus data
  const { data: syllabus, isLoading: isLoadingSyllabus } = useQuery<Syllabus>({
    queryKey: [`/api/syllabi/${id}`],
  });
  
  // Fetch events
  const { data: events, isLoading: isLoadingEvents } = useQuery<CourseEvent[]>({
    queryKey: [`/api/syllabi/${id}/events`],
  });
  
  // Create study plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (data: StudyPlanValues) => {
      const response = await apiRequest('POST', '/api/study-plans', {
        syllabusId: parseInt(id),
        userId: 1, // Hardcoded to match the server middleware which sets userId to 1
        title: data.title,
        description: data.description || '',
        calendarIntegrated: false,
      });
      
      return response.json() as Promise<StudyPlan>;
    },
    onSuccess: (data) => {
      setCreatedPlan(data);
      queryClient.invalidateQueries({ queryKey: ['/api/study-plans'] });
      
      // Generate and create study sessions
      const sessions = generateStudySessions(data.id, form.getValues());
      
      // Create sessions in sequence
      createSessionsSequentially(sessions).then(() => {
        toast({
          title: 'Study Plan Created',
          description: 'Your study plan has been created successfully.',
        });
        
        // Switch to the sessions tab
        setActiveTab('study-sessions');
      });
    },
    onError: (error) => {
      toast({
        title: 'Plan Creation Failed',
        description: error instanceof Error ? error.message : 'Failed to create study plan',
        variant: 'destructive',
      });
    },
  });
  
  // Setup form
  const form = useForm<StudyPlanValues>({
    resolver: zodResolver(studyPlanSchema),
    defaultValues: {
      title: syllabus ? `Study Plan for ${syllabus.courseCode || 'Course'}` : '',
      description: '',
      dateRange: {
        from: new Date(),
        to: addDays(new Date(), 60),
      },
      sessionsPerWeek: 3,
      hoursPerSession: 2,
    },
  });
  
  // Update form values when syllabus data is loaded
  useEffect(() => {
    if (syllabus) {
      form.setValue('title', `Study Plan for ${syllabus.courseCode || syllabus.courseName || 'Course'}`);
    }
  }, [syllabus, form]);

  const onSubmit = (data: StudyPlanValues) => {
    createPlanMutation.mutate(data);
  };

  // Generate study sessions based on form data
  const generateStudySessions = (studyPlanId: number, formData: StudyPlanValues): Partial<StudySession>[] => {
    const { dateRange, sessionsPerWeek, hoursPerSession } = formData;
    const { from, to } = dateRange;
    
    const totalDays = differenceInDays(to, from);
    const sessionsCount = Math.floor((totalDays / 7) * sessionsPerWeek);
    
    // Space sessions evenly
    const daysBetweenSessions = Math.floor(totalDays / sessionsCount);
    
    const sessions: Partial<StudySession>[] = [];
    
    for (let i = 0; i < sessionsCount; i++) {
      const sessionDate = addDays(from, i * daysBetweenSessions);
      
      // Adjust for events (in a real app, this would be more sophisticated)
      const nearbyEvents = events?.filter(event => {
        const eventDate = new Date(event.dueDate);
        return Math.abs(differenceInDays(eventDate, sessionDate)) <= 3;
      });
      
      let sessionTitle = `Study Session ${i + 1}`;
      let sessionDescription = `Regular study session for ${syllabus?.courseCode || 'your course'}`;
      
      if (nearbyEvents && nearbyEvents.length > 0) {
        sessionTitle = `Prepare for ${nearbyEvents[0].title}`;
        sessionDescription = `Study session to prepare for upcoming ${nearbyEvents[0].eventType}: ${nearbyEvents[0].title}`;
      }
      
      sessions.push({
        studyPlanId,
        title: sessionTitle,
        description: sessionDescription,
        startTime: sessionDate,
        endTime: addHours(sessionDate, hoursPerSession),
      });
    }
    
    setGeneratedSessions(sessions as StudySession[]);
    return sessions;
  };

  // Create sessions one by one
  const createSessionsSequentially = async (sessions: Partial<StudySession>[]) => {
    if (!createdPlan) return;
    
    for (const session of sessions) {
      try {
        await apiRequest('POST', `/api/study-plans/${createdPlan.id}/sessions`, session);
      } catch (error) {
        console.error('Error creating session:', error);
      }
    }
    
    // Fetch created sessions
    const response = await apiRequest('GET', `/api/study-plans/${createdPlan.id}/sessions`);
    const data = await response.json();
    setGeneratedSessions(data);
  };

  const handleIntegrationComplete = () => {
    toast({
      title: 'Success',
      description: 'Your study plan has been successfully added to your calendar.',
    });
    
    // Navigate to courses page
    navigate('/courses');
  };

  const isLoading = isLoadingSyllabus || isLoadingEvents;
  const isCreating = createPlanMutation.isPending;

  return (
    <div>
      <ProgressSteps steps={steps} currentStep={3} />
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Your Study Plan</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="plan-details" disabled={createdPlan !== null}>
                  Plan Details
                </TabsTrigger>
                <TabsTrigger value="study-sessions" disabled={createdPlan === null}>
                  Study Sessions
                </TabsTrigger>
                <TabsTrigger value="calendar-integration" disabled={createdPlan === null}>
                  Calendar Integration
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="plan-details">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Study Plan Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Study Plan for CS101" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Add details about your study goals" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dateRange"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Study Period</FormLabel>
                          <DatePickerWithRange 
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                          <FormDescription>
                            Select the start and end dates for your study plan
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sessionsPerWeek"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sessions Per Week</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" max="7" {...field} />
                            </FormControl>
                            <FormDescription>
                              Recommended: 2-3 sessions per week
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="hoursPerSession"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hours Per Session</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" max="8" {...field} />
                            </FormControl>
                            <FormDescription>
                              Recommended: 1-2 hours per session
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit"
                        disabled={isCreating}
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Plan...
                          </>
                        ) : (
                          <>
                            <Book className="mr-2 h-4 w-4" />
                            Create Study Plan
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="study-sessions">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-lg">Generated Study Sessions</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{generatedSessions.length} sessions planned</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {generatedSessions.map((session, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{session.title}</h4>
                              <p className="text-sm text-gray-500">{session.description}</p>
                            </div>
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-1 text-primary" />
                              <span>{format(new Date(session.startTime), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => setActiveTab('calendar-integration')}>
                      Continue to Calendar Integration <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="calendar-integration">
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-medium text-xl mb-2">Study Plan Created Successfully!</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Your study plan has been created with {generatedSessions.length} study sessions. 
                      Would you like to add these sessions to your calendar?
                    </p>
                  </div>
                  
                  {createdPlan && (
                    <CalendarIntegration 
                      studyPlanId={createdPlan.id} 
                      onIntegrationComplete={handleIntegrationComplete}
                    />
                  )}
                  
                  <div className="text-center">
                    <Button variant="link" asChild>
                      <Link href="/courses">
                        Skip calendar integration and go to My Courses
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateStudyPlan;
