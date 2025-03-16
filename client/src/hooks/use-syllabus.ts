import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { extractTextFromPDF, extractCourseInfo, extractDatesAndEvents } from '@/lib/pdf';
import { type Syllabus, type CourseEvent } from '@shared/schema';

export function useSyllabus(syllabusId?: string | number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [pdfText, setPdfText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);

  // Convert id to number if it's a string
  const id = typeof syllabusId === 'string' ? parseInt(syllabusId) : syllabusId;

  // Fetch syllabus data
  const {
    data: syllabus,
    isLoading: isLoadingSyllabus,
    error: syllabusError
  } = useQuery<Syllabus>({
    queryKey: id ? [`/api/syllabi/${id}`] : null,
    enabled: !!id
  });

  // Fetch course events
  const {
    data: events,
    isLoading: isLoadingEvents,
    error: eventsError
  } = useQuery<CourseEvent[]>({
    queryKey: id ? [`/api/syllabi/${id}/events`] : null,
    enabled: !!id
  });

  // Extract information mutation
  const extractMutation = useMutation({
    mutationFn: async () => {
      setIsExtracting(true);
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
      
      setIsExtracting(false);
      return data;
    },
    onError: (error) => {
      toast({
        title: 'Extraction Failed',
        description: error instanceof Error ? error.message : 'Failed to extract information',
        variant: 'destructive',
      });
      setIsExtracting(false);
    },
  });

  // Update syllabus info mutation
  const updateSyllabusMutation = useMutation({
    mutationFn: async (data: Partial<Syllabus>) => {
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

  // Process uploaded file
  const processPdfFile = async (file: File) => {
    try {
      const { text } = await extractTextFromPDF(file);
      setPdfText(text);
      
      // Extract initial information
      const courseInfo = extractCourseInfo(text);
      const events = extractDatesAndEvents(text);
      
      return {
        text,
        courseInfo,
        events
      };
    } catch (error) {
      console.error('Error processing PDF file:', error);
      toast({
        title: 'Processing Error',
        description: 'Failed to process the PDF file. Please make sure it is a valid PDF.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Group events by type
  const assignments = events?.filter(event => event.eventType === 'assignment') || [];
  const exams = events?.filter(event => event.eventType === 'exam') || [];
  const quizzes = events?.filter(event => event.eventType === 'quiz') || [];

  return {
    syllabus,
    events,
    assignments,
    exams,
    quizzes,
    isLoadingSyllabus,
    isLoadingEvents,
    isExtracting: isExtracting || extractMutation.isPending,
    isUpdating: updateSyllabusMutation.isPending,
    syllabusError,
    eventsError,
    pdfText,
    extractInformation: extractMutation.mutate,
    updateSyllabusInfo: updateSyllabusMutation.mutate,
    processPdfFile,
    hasExtractedInfo: syllabus?.status === 'processed',
    hasEvents: events && events.length > 0
  };
}
