import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import CalendarIntegrationComponent from '@/components/ui/calendar-integration';
import { type StudyPlan } from '@shared/schema';

const CalendarIntegrationPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [integrationComplete, setIntegrationComplete] = useState(false);
  
  // Fetch study plan data
  const { data: studyPlan, isLoading } = useQuery<StudyPlan>({
    queryKey: [`/api/study-plans/${id}`],
  });
  
  const handleIntegrationComplete = () => {
    setIntegrationComplete(true);
    toast({
      title: 'Calendar Integration Complete',
      description: 'Your study plan has been successfully added to your calendar.',
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/courses" className="flex items-center text-muted-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to My Courses
          </Link>
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Calendar Integration</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : studyPlan ? (
            integrationComplete ? (
              <div className="text-center py-8">
                <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Calendar Integration Complete!</h3>
                <p className="text-muted-foreground mb-4">
                  Your study sessions have been successfully added to your calendar.
                </p>
                <Button asChild>
                  <Link href="/courses">
                    Go to My Courses
                  </Link>
                </Button>
              </div>
            ) : (
              <CalendarIntegrationComponent
                studyPlanId={parseInt(id)}
                onIntegrationComplete={handleIntegrationComplete}
              />
            )
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">Study Plan Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The study plan you're looking for does not exist or has been deleted.
              </p>
              <Button asChild>
                <Link href="/courses">
                  Go to My Courses
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarIntegrationPage;