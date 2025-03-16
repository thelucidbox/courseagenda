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
      
      // Auto-trigger the extraction if the syllabus exists but there are no events yet
      if (syllabus.status === 'uploaded' && (!events || events.length === 0)) {
        extractMutation.mutate();
      }
    }
  }, [syllabus, events, form, extractMutation]);

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
                  Extract Information
                </Button>
              )}
              {isExtracting && (
                <Button disabled variant="outline" size="sm">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing PDF...
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
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-base">Extracted Events</h3>
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
