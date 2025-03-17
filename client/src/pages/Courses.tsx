import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Book, 
  ArrowRight, 
  Calendar, 
  PlusCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type Syllabus, type StudyPlan, type CourseEvent } from '@shared/schema';

const Courses = () => {
  // Fetch user's syllabi
  const { data: syllabi, isLoading: isLoadingSyllabi } = useQuery<Syllabus[]>({
    queryKey: ['/api/syllabi']
  });

  // Fetch study plans
  const { data: studyPlans, isLoading: isLoadingPlans } = useQuery<StudyPlan[]>({
    queryKey: ['/api/study-plans']
  });

  // Create a map of syllabi to study plans
  const syllabiWithPlans = syllabi?.map(syllabus => {
    const relatedPlans = studyPlans?.filter(plan => plan.syllabusId === syllabus.id) || [];
    return {
      syllabus,
      plans: relatedPlans
    };
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/upload">
            <PlusCircle className="mr-2 h-4 w-4" />
            Upload New Syllabus
          </Link>
        </Button>
      </div>

      {isLoadingSyllabi || isLoadingPlans ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-7 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-2 w-full mb-4" />
                <div className="border-t border-gray-100 pt-3">
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : syllabiWithPlans && syllabiWithPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {syllabiWithPlans.map(({ syllabus, plans }) => (
            <CourseCard 
              key={syllabus.id} 
              syllabus={syllabus} 
              studyPlans={plans} 
            />
          ))}
        </div>
      ) : (
        <Card className="shadow-md">
          <CardContent className="p-10 text-center">
            <div className="bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Book className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-3">No Courses Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't uploaded any syllabi yet. Upload your first syllabus to get started with your personalized study plan.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/upload">
                <PlusCircle className="mr-2 h-4 w-4" /> Upload Your First Syllabus
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {syllabi && syllabi.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Recent Uploads</h2>
          <Card className="overflow-hidden">
            <div className="space-y-1">
              {syllabi.slice(0, 5).map(syllabus => (
                <div 
                  key={syllabus.id} 
                  className="flex items-center justify-between p-4 hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <FileText className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{syllabus.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {formatDistanceToNow(new Date(syllabus.uploadedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {syllabus.status === 'uploaded' ? (
                      <Button size="sm" variant="outline" asChild className="border-primary/20 hover:border-primary/50">
                        <Link href={`/extract/${syllabus.id}`}>
                          <Clock className="mr-1 h-4 w-4" /> Process
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/extract/${syllabus.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Helper component for the course cards
const CourseCard = ({ 
  syllabus, 
  studyPlans 
}: { 
  syllabus: Syllabus, 
  studyPlans: StudyPlan[] 
}) => {
  // Calculate progress based on the current date relative to course events
  const progress = studyPlans.length > 0 ? 45 : 0; // In a real app, this would be calculated based on event dates

  // Pick border color based on course code or syllabus id for variety
  const borderColors = ['border-primary', 'border-secondary-400', 'border-accent-500'];
  const colorIndex = syllabus.id % borderColors.length;
  const borderColor = borderColors[colorIndex];

  return (
    <div className={`bg-card rounded-lg shadow-sm p-5 border-l-4 ${borderColor} hover:shadow-md transition`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">
          {syllabus.courseName || syllabus.courseCode || 'Untitled Course'}
        </h3>
        <span className="text-xs bg-green-500/20 text-green-600 dark:bg-green-950 dark:text-green-400 px-2 py-1 rounded-full font-medium">Active</span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        {syllabus.courseCode} {syllabus.instructor ? `- ${syllabus.instructor}` : ''}
      </p>
      {syllabus.term && (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-4">
          <Calendar className="h-3 w-3" />
          <span>{syllabus.term}</span>
        </div>
      )}
      
      <div className="mb-5">
        <div className="flex justify-between text-xs mb-2">
          <span className="font-medium">Course Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="border-t border-border pt-4">
        {studyPlans.length > 0 ? (
          <>
            <h4 className="text-xs font-medium mb-2">Study Plan Status</h4>
            <div className="text-sm">
              {studyPlans[0].calendarIntegrated ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Synced with calendar</span>
                </div>
              ) : studyPlans.length > 0 ? (
                <Button size="sm" variant="outline" asChild className="w-full">
                  <Link href={`/calendar-integration/${studyPlans[0].id}`}>
                    <Calendar className="mr-1 h-4 w-4" /> Add to Calendar
                  </Link>
                </Button>
              ) : (
                <Button size="sm" variant="outline" asChild className="w-full">
                  <Link href={`/create-plan/${syllabus.id}`}>
                    <Calendar className="mr-1 h-4 w-4" /> Create Study Plan
                  </Link>
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <h4 className="text-xs font-medium mb-2">
              {syllabus.status === 'processed' ? 'Ready for Planning' : 'Processing Required'}
            </h4>
            <Button 
              size="sm" 
              variant="outline" 
              asChild 
              className="w-full"
            >
              <Link href={syllabus.status === 'processed' ? `/create-plan/${syllabus.id}` : `/extract/${syllabus.id}`}>
                {syllabus.status === 'processed' ? (
                  <>
                    <Calendar className="mr-1 h-4 w-4" /> Create Study Plan
                  </>
                ) : (
                  <>
                    <FileText className="mr-1 h-4 w-4" /> Process Syllabus
                  </>
                )}
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Courses;
