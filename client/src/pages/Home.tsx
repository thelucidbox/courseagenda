import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FileText, Book, Calendar as CalendarIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type Syllabus, type StudyPlan } from '@shared/schema';

const Home = () => {
  // Fetch user's syllabi
  const { data: syllabi, isLoading: isLoadingSyllabi } = useQuery<Syllabus[]>({
    queryKey: ['/api/syllabi']
  });

  // Fetch study plans
  const { data: studyPlans, isLoading: isLoadingPlans } = useQuery<StudyPlan[]>({
    queryKey: ['/api/study-plans']
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-6 mb-12">
        <div className="bg-card rounded-lg shadow-sm p-6 md:w-2/3">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Welcome to CourseAgenda</h1>
            <Button asChild>
              <Link href="/upload">
                Get Started
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">Upload Syllabus</h3>
                <p className="text-sm text-muted-foreground mt-1">Upload your course syllabus in PDF format</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">Create Study Plan</h3>
                <p className="text-sm text-muted-foreground mt-1">Generate a personalized study schedule</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">Sync Calendar</h3>
                <p className="text-sm text-muted-foreground mt-1">Add study sessions to your calendar</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-accent/10 p-4 rounded-lg border">
            <h3 className="font-medium mb-2">Recent Uploads</h3>
            
            {isLoadingSyllabi ? (
              <p className="text-sm text-muted-foreground">Loading recent uploads...</p>
            ) : syllabi && syllabi.length > 0 ? (
              <div className="space-y-2">
                {syllabi.slice(0, 3).map((syllabus) => (
                  <div key={syllabus.id} className="flex items-center justify-between p-3 bg-card rounded-md border">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-primary" />
                      <div>
                        <p className="text-sm font-medium">{syllabus.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {formatDistanceToNow(new Date(syllabus.uploadedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/extract/${syllabus.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No syllabi uploaded yet. Get started by uploading your first syllabus!</p>
            )}
            
            {syllabi && syllabi.length > 0 && (
              <div className="mt-4 text-center">
                <Button variant="link" size="sm" asChild>
                  <Link href="/courses">
                    View All Uploads <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6 md:w-1/3">
          <h3 className="text-lg font-semibold mb-4">How It Works</h3>
          
          <div className="space-y-4">
            <div className="flex space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-medium text-sm">Upload your syllabus</h4>
                <p className="text-sm text-muted-foreground">Upload your course syllabus in PDF format.</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-medium text-sm">Review extracted information</h4>
                <p className="text-sm text-muted-foreground">We'll extract key dates, assignments, and exams from your syllabus. Review and make any necessary adjustments.</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-medium text-sm">Generate your study plan</h4>
                <p className="text-sm text-muted-foreground">We'll create a personalized study plan with recommended study sessions based on your course schedule.</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-medium text-sm">Sync with your calendar</h4>
                <p className="text-sm text-muted-foreground">Add your study plan directly to Google Calendar, Apple Calendar, or other supported calendar services.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-primary/5 rounded-md border">
            <h4 className="font-medium text-sm mb-2">Tips for Best Results</h4>
            <ul className="text-sm space-y-1">
              <li className="flex items-start space-x-2">
                <CheckIcon className="text-primary mt-0.5 h-4 w-4" />
                <span>Make sure your PDF is text-searchable (not a scanned image)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckIcon className="text-primary mt-0.5 h-4 w-4" />
                <span>Ensure the syllabus includes clear assignment dates and deadlines</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckIcon className="text-primary mt-0.5 h-4 w-4" />
                <span>Check that course information (name, code, instructor) is clearly stated</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {(studyPlans && studyPlans.length > 0) && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Your Recent Courses</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studyPlans.slice(0, 3).map((plan) => (
              <CourseCard key={plan.id} studyPlan={plan} />
            ))}
          </div>
          
          <div className="text-center mt-6">
            <Button variant="link" asChild>
              <Link href="/courses">
                View All Courses <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for the course cards
const CourseCard = ({ studyPlan }: { studyPlan: StudyPlan }) => {
  // This would normally fetch course events, but for simplicity we'll mock some data
  const progress = Math.floor(Math.random() * 80) + 20; // Random progress between 20-100%

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 border-l-4 border-primary hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{studyPlan.title}</h3>
        <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-1 rounded">Active</span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">Created on {new Date(studyPlan.createdAt).toLocaleDateString()}</p>
      
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium">Course Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>
      
      <div className="border-t border-border pt-3">
        <h4 className="text-xs font-medium mb-2">Calendar Status</h4>
        <div className="flex items-center text-sm">
          {studyPlan.calendarIntegrated ? (
            <span className="text-green-600 dark:text-green-400 flex items-center">
              <CheckIcon className="mr-1 h-4 w-4" /> Synced with calendar
            </span>
          ) : (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/create-plan/${studyPlan.syllabusId}`}>
                <CalendarIcon className="mr-1 h-4 w-4" /> Sync to Calendar
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper icon component
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default Home;
