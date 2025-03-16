import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ProgressSteps from '@/components/ui/progress-steps';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowRight, Edit2, Calendar, ClipboardList, AlertTriangle, FileText, FolderOpen, ClipboardCheck, CheckSquare } from 'lucide-react';
import { type Syllabus, type CourseEvent } from '@shared/schema';
import { format } from 'date-fns';

const steps = [
  { label: 'Upload Syllabus', status: 'completed' as const },
  { label: 'Extract Information', status: 'current' as const },
  { label: 'Create Study Plan', status: 'upcoming' as const }
];

// Form validation schema
const syllabusInfoSchema = z.object({
  courseCode: z.string().min(1, 'Course code is required'),
  courseName: z.string().min(1, 'Course name is required'),
  instructor: z.string().optional(),
  term: z.string().optional(),
});

type SyllabusInfoValues = z.infer<typeof syllabusInfoSchema>;

const ExtractInfo = () => {
  const [, params] = useRoute<{ id: string }>('/extract/:id');
  const id = params?.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('course-info');
  
  // Fetch syllabus data
  const { data: syllabus, isLoading: isLoadingSyllabus } = useQuery<Syllabus>({
    queryKey: [`/api/syllabi/${id}`],
  });
  
  // Fetch extracted events
  const { data: events, isLoading: isLoadingEvents } = useQuery<CourseEvent[]>({
    queryKey: [`/api/syllabi/${id}/events`],
  });
  
  // Extract information mutation
  const extractMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/syllabi/${id}/extract`);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/syllabi/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/syllabi/${id}/events`] });
      
      toast({
        title: 'Information Extracted',
        description: 'Course information has been extracted from your syllabus.',
      });
      
      // Update form with extracted data
      form.reset({
        courseCode: data.syllabus.courseCode || '',
        courseName: data.syllabus.courseName || '',
        instructor: data.syllabus.instructor || '',
        term: data.syllabus.term || '',
      });
    },
    onError: (error) => {
      toast({
        title: 'Extraction Failed',
        description: error instanceof Error ? error.message : 'Failed to extract information',
        variant: 'destructive',
      });
    },
  });
  
  // Update syllabus info mutation
  const updateSyllabusMutation = useMutation({
    mutationFn: async (data: SyllabusInfoValues) => {
      return await apiRequest('POST', `/api/syllabi/${id}/extract`, data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [`/api/syllabi/${id}`] });
      
      toast({
        title: 'Information Updated',
        description: 'Course information has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update information',
        variant: 'destructive',
      });
    },
  });

  // Setup form
  const form = useForm<SyllabusInfoValues>({
    resolver: zodResolver(syllabusInfoSchema),
    defaultValues: {
      courseCode: syllabus?.courseCode || '',
      courseName: syllabus?.courseName || '',
      instructor: syllabus?.instructor || '',
      term: syllabus?.term || '',
    },
  });
  
  // Update form values when syllabus data is loaded
  useEffect(() => {
    if (syllabus) {
      form.reset({
        courseCode: syllabus.courseCode || '',
        courseName: syllabus.courseName || '',
        instructor: syllabus.instructor || '',
        term: syllabus.term || '',
      });
    }
  }, [syllabus, form]);

  const onSubmit = (data: SyllabusInfoValues) => {
    updateSyllabusMutation.mutate(data);
  };

  const handleExtract = () => {
    extractMutation.mutate();
  };

  const handleContinue = () => {
    navigate(`/create-plan/${id}`);
  };

  // Group events by type
  const assignments = events?.filter(event => 
    event.eventType === 'assignment' || event.eventType === 'project' || event.eventType === 'paper'
  ) || [];
  const exams = events?.filter(event => event.eventType === 'exam') || [];
  const quizzes = events?.filter(event => event.eventType === 'quiz') || [];
  const otherEvents = events?.filter(event => 
    event.eventType !== 'assignment' && 
    event.eventType !== 'project' && 
    event.eventType !== 'paper' && 
    event.eventType !== 'exam' && 
    event.eventType !== 'quiz'
  ) || [];

  const isLoading = isLoadingSyllabus || isLoadingEvents;
  const isExtracting = extractMutation.isPending;
  const isUpdating = updateSyllabusMutation.isPending;
  const hasExtractedInfo = syllabus?.status === 'processed';
  const hasEvents = events && events.length > 0;

  return (
    <div>
      <ProgressSteps steps={steps} currentStep={2} />
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Syllabus Information</span>
              {!hasExtractedInfo && !isExtracting && (
                <Button onClick={handleExtract} variant="outline" size="sm">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Extract with Gemini AI
                </Button>
              )}
              {isExtracting && (
                <Button disabled variant="outline" size="sm">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gemini AI Processing...
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="course-info">Course Information</TabsTrigger>
                  <TabsTrigger value="course-schedule">Course Schedule</TabsTrigger>
                </TabsList>
                
                <TabsContent value="course-info">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="courseCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course Code</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. CS101" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="courseName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Introduction to Computer Science" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="instructor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instructor</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Prof. Johnson" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="term"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Term</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Fall 2023" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit"
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Update Information
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="course-schedule">
                  {hasEvents ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-base">Events extracted by Gemini AI</h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>Powered by</span>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 312 100" className="ml-2 h-4">
                            <path d="M60.4 50c0-8.4-4.6-15.9-11.5-19.9L30.2 77.8c7 3.9 15.5 3.8 22.3-.3 4.8-2.9 7.9-8.3 7.9-14.3V50z" fill="#FF4A4A"/>
                            <path d="M18.7 50v13.2c0 6 3.1 11.4 7.9 14.3l18.7-47.6C38.1 26 30.3 26 23.4 29.8c-3 1.9-4.7 5.3-4.7 8.7V50z" fill="#FFAD47"/>
                            <path d="M18.7 38.5c0-3.4 1.8-6.8 4.7-8.7l18.7 47.6c7.1-4.2 11.6-11.7 11.6-20.1v-7.5L30.2 22.1c-7-3.9-15.5-3.8-22.3.3-4.8 2.9-7.9 8.3-7.9 14.3V50h18.7V38.5z" fill="#0066D9"/>
                            <path d="M11.5 50H0v11.5c0 6 3.1 11.4 7.9 14.3 4.7 2.8 10.3 3.1 15.1.9l-11.5-26.7z" fill="#00ACF5"/>
                            <path d="M82.52 54.53c0-11.7 8.6-20.2 19.2-20.2 5.8 0 10.3 2.1 13.4 5.8l-4.7 4.8c-2.1-2.5-5.1-4-8.6-4-6.7 0-11.7 5.7-11.7 13.4v.3c0 7.8 5 13.5 11.7 13.5 3.8 0 6.8-1.5 9-4.2l4.5 4.5c-3.3 4-7.7 6.2-13.7 6.2-10.5 0-19.1-8.6-19.1-20zm52.64-.09c0-11.6 8.2-20.2 19.7-20.2 11.5 0 19.7 8.5 19.7 20v.2c0 11.6-8.2 20.1-19.8 20.1-11.5 0-19.6-8.5-19.6-20v-.1zm31.9 0c0-7.8-5.1-13.5-12.2-13.5-7.2 0-12.1 5.7-12.1 13.4v.1c0 7.7 5 13.5 12.2 13.5 7.1 0 12.1-5.7 12.1-13.5zm18.25.1c0-11.7 8.2-20.2 19.4-20.2 7 0 11.2 2.4 14.7 5.8l-4.8 5.2c-2.9-2.7-5.8-4.4-10-4.4-6.6 0-11.6 5.7-11.6 13.4v.2c0 7.7 5 13.6 12.1 13.6 3.1 0 6-1 8-2.8v-5.5H204v-6.3h14.9v15c-3.5 3-8.5 5.4-15.2 5.4-11.7 0-19.4-8.3-19.4-20.3v-.1zm36.31-19.7h7.5v39.4h-7.5zm11.85 0h25.9v6.7h-18.5v9.6h16.6v6.7h-16.6v16.4h-7.4zm45.27-.5c7.3 0 11.8 3.5 11.8 9.8v.1c0 5.2-3.1 8-7.8 9.2l8.9 20.8h-8.3l-8-19.1h-6.9v19.1h-7.5V34.33h17.8zm-.6 14.3c4 0 6.6-1.9 6.6-5.3v-.1c0-3.5-2.5-5.3-6.6-5.3h-9.7v10.7h9.7z" fill="#000"/>
                          </svg>
                        </div>
                      </div>
                      
                      {assignments.length > 0 && (
                        <div>
                          <h3 className="font-medium text-lg mb-2">Assignments</h3>
                          <div className="space-y-2">
                            {assignments.map(event => (
                              <EventCard key={event.id} event={event} />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {exams.length > 0 && (
                        <div>
                          <h3 className="font-medium text-lg mb-2">Exams</h3>
                          <div className="space-y-2">
                            {exams.map(event => (
                              <EventCard key={event.id} event={event} />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {quizzes.length > 0 && (
                        <div>
                          <h3 className="font-medium text-lg mb-2">Quizzes</h3>
                          <div className="space-y-2">
                            {quizzes.map(event => (
                              <EventCard key={event.id} event={event} />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {otherEvents.length > 0 && (
                        <div>
                          <h3 className="font-medium text-lg mb-2">Other Events</h3>
                          <div className="space-y-2">
                            {otherEvents.map(event => (
                              <EventCard key={event.id} event={event} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                      <h3 className="font-medium text-lg mb-2">No Events Found</h3>
                      <p className="text-gray-500 max-w-md">
                        We couldn't extract any events from your syllabus. This might happen if the syllabus doesn't contain clear dates or is in a format that's difficult to parse.
                      </p>
                      <Button onClick={handleExtract} variant="outline" className="mt-4">
                        Try Extracting Again
                      </Button>
                      <div className="mt-6 flex items-center text-xs text-gray-500">
                        <span>Powered by</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 312 100" className="ml-2 h-4">
                          <path d="M60.4 50c0-8.4-4.6-15.9-11.5-19.9L30.2 77.8c7 3.9 15.5 3.8 22.3-.3 4.8-2.9 7.9-8.3 7.9-14.3V50z" fill="#FF4A4A"/>
                          <path d="M18.7 50v13.2c0 6 3.1 11.4 7.9 14.3l18.7-47.6C38.1 26 30.3 26 23.4 29.8c-3 1.9-4.7 5.3-4.7 8.7V50z" fill="#FFAD47"/>
                          <path d="M18.7 38.5c0-3.4 1.8-6.8 4.7-8.7l18.7 47.6c7.1-4.2 11.6-11.7 11.6-20.1v-7.5L30.2 22.1c-7-3.9-15.5-3.8-22.3.3-4.8 2.9-7.9 8.3-7.9 14.3V50h18.7V38.5z" fill="#0066D9"/>
                          <path d="M11.5 50H0v11.5c0 6 3.1 11.4 7.9 14.3 4.7 2.8 10.3 3.1 15.1.9l-11.5-26.7z" fill="#00ACF5"/>
                          <path d="M82.52 54.53c0-11.7 8.6-20.2 19.2-20.2 5.8 0 10.3 2.1 13.4 5.8l-4.7 4.8c-2.1-2.5-5.1-4-8.6-4-6.7 0-11.7 5.7-11.7 13.4v.3c0 7.8 5 13.5 11.7 13.5 3.8 0 6.8-1.5 9-4.2l4.5 4.5c-3.3 4-7.7 6.2-13.7 6.2-10.5 0-19.1-8.6-19.1-20zm52.64-.09c0-11.6 8.2-20.2 19.7-20.2 11.5 0 19.7 8.5 19.7 20v.2c0 11.6-8.2 20.1-19.8 20.1-11.5 0-19.6-8.5-19.6-20v-.1zm31.9 0c0-7.8-5.1-13.5-12.2-13.5-7.2 0-12.1 5.7-12.1 13.4v.1c0 7.7 5 13.5 12.2 13.5 7.1 0 12.1-5.7 12.1-13.5zm18.25.1c0-11.7 8.2-20.2 19.4-20.2 7 0 11.2 2.4 14.7 5.8l-4.8 5.2c-2.9-2.7-5.8-4.4-10-4.4-6.6 0-11.6 5.7-11.6 13.4v.2c0 7.7 5 13.6 12.1 13.6 3.1 0 6-1 8-2.8v-5.5H204v-6.3h14.9v15c-3.5 3-8.5 5.4-15.2 5.4-11.7 0-19.4-8.3-19.4-20.3v-.1zm36.31-19.7h7.5v39.4h-7.5zm11.85 0h25.9v6.7h-18.5v9.6h16.6v6.7h-16.6v16.4h-7.4zm45.27-.5c7.3 0 11.8 3.5 11.8 9.8v.1c0 5.2-3.1 8-7.8 9.2l8.9 20.8h-8.3l-8-19.1h-6.9v19.1h-7.5V34.33h17.8zm-.6 14.3c4 0 6.6-1.9 6.6-5.3v-.1c0-3.5-2.5-5.3-6.6-5.3h-9.7v10.7h9.7z" fill="#000"/>
                        </svg>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end mt-6">
        <Button
          onClick={handleContinue}
          disabled={isLoading || !hasExtractedInfo}
          className="ml-2"
        >
          Continue to Create Study Plan <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Helper component for displaying course events
const EventCard = ({ event }: { event: CourseEvent }) => {
  // Get the appropriate icon and color based on event type
  const getEventTypeInfo = (type: string) => {
    switch (type.toLowerCase()) {
      case 'assignment':
        return { icon: <FileText className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' };
      case 'project':
        return { icon: <FolderOpen className="h-4 w-4" />, color: 'bg-indigo-100 text-indigo-800' };
      case 'paper':
        return { icon: <FileText className="h-4 w-4" />, color: 'bg-cyan-100 text-cyan-800' };
      case 'exam':
        return { icon: <ClipboardCheck className="h-4 w-4" />, color: 'bg-red-100 text-red-800' };
      case 'quiz':
        return { icon: <CheckSquare className="h-4 w-4" />, color: 'bg-amber-100 text-amber-800' };
      default:
        return { icon: <Calendar className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const { icon, color } = getEventTypeInfo(event.eventType);
  const formattedEventType = event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{event.title}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center ${color}`}>
                {icon}
                <span className="ml-1">{formattedEventType}</span>
              </span>
            </div>
            {event.description && (
              <p className="text-sm text-gray-500">{event.description}</p>
            )}
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-1 text-primary" />
            <span>{format(new Date(event.dueDate), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtractInfo;
