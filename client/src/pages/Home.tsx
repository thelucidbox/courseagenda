import { Link } from 'wouter';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowRight, FileText, Book, Calendar as CalendarIcon, 
  CheckCircle, BookOpen, BookMarked, Brain, Upload, Clock 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type Syllabus, type StudyPlan } from '@shared/schema';
import { CourseCard } from '@/components/ui/prodigy-cards';
import { GradientText, FloatingShape } from '@/components/ui/decorative-elements';

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
    <div className="pt-4 pb-12">
      {/* Welcome header section */}
      <section className="mb-12 relative overflow-hidden">
        <div className="prodigy-container">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-2/3">
              <h1 className="text-white font-bold mb-4">
                Welcome to <GradientText from="from-white" to="to-prodigy-light-yellow" className="leading-tight">CourseAgenda</GradientText>
              </h1>
              <p className="text-white/90 mb-6">
                Your personal AI-powered study assistant. Get started by uploading a syllabus or continue with your existing study plans.
              </p>
              <Link href="/upload">
                <a className="btn-yellow inline-flex">
                  Upload Syllabus <Upload className="ml-2 h-5 w-5" />
                </a>
              </Link>
            </div>
            <div className="md:w-1/3 md:pl-6">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                {!isLoadingSyllabi && (
                  <div className="text-white">
                    <div className="flex items-center mb-2">
                      <BookOpen className="h-5 w-5 mr-2" />
                      <span className="font-medium">{syllabi?.length || 0} Syllabi</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <BookMarked className="h-5 w-5 mr-2" />
                      <span className="font-medium">{studyPlans?.length || 0} Study Plans</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-sm">
                        {studyPlans?.length ? "You're making great progress! Keep going." : "Get started by uploading your first syllabus."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <FloatingShape type="star" color="accent" top="10%" left="5%" />
          <FloatingShape type="circle" color="accent" bottom="15%" right="10%" size="sm" />
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content area */}
        <div className="lg:w-2/3">
          {/* Quick actions section */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6">
              <GradientText>Quick Actions</GradientText>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Link href="/upload">
                <a className="prodigy-card p-6 flex flex-col items-center text-center hover:scale-[1.02] transition-all duration-300">
                  <div className="w-14 h-14 bg-prodigy-purple rounded-full flex items-center justify-center mb-3">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-text-primary mb-1">Upload Syllabus</h3>
                  <p className="text-sm text-text-secondary">Upload your course syllabus in PDF format</p>
                </a>
              </Link>
              
              <Link href={syllabi?.length ? `/extract/${syllabi[0].id}` : "/upload"}>
                <a className="prodigy-card p-6 flex flex-col items-center text-center hover:scale-[1.02] transition-all duration-300">
                  <div className="w-14 h-14 bg-prodigy-yellow rounded-full flex items-center justify-center mb-3">
                    <Brain className="h-7 w-7 text-text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-text-primary mb-1">Create Study Plan</h3>
                  <p className="text-sm text-text-secondary">Generate a personalized study schedule</p>
                </a>
              </Link>
              
              <Link href={studyPlans?.length ? `/calendar-integration/${studyPlans[0].id}` : "/courses"}>
                <a className="prodigy-card p-6 flex flex-col items-center text-center hover:scale-[1.02] transition-all duration-300">
                  <div className="w-14 h-14 bg-prodigy-light-purple rounded-full flex items-center justify-center mb-3">
                    <CalendarIcon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-text-primary mb-1">Sync Calendar</h3>
                  <p className="text-sm text-text-secondary">Add study sessions to your calendar</p>
                </a>
              </Link>
            </div>
          </div>
          
          {/* Recent uploads section */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6">Recent Uploads</h2>
            
            {isLoadingSyllabi ? (
              <div className="prodigy-card p-6 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-prodigy-purple border-t-transparent rounded-full"></div>
              </div>
            ) : syllabi && syllabi.length > 0 ? (
              <div className="space-y-3">
                {syllabi.slice(0, 3).map((syllabus) => (
                  <div key={syllabus.id} className="prodigy-card p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-prodigy-light-blue p-2 rounded-lg">
                        <FileText className="h-6 w-6 text-prodigy-purple" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{syllabus.filename || `Syllabus ${syllabus.id}`}</p>
                        <p className="text-sm text-text-secondary">
                          Uploaded {formatDistanceToNow(new Date(syllabus.uploadedAt || Date.now()), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Link href={`/extract/${syllabus.id}`}>
                      <a className="btn-secondary py-2 px-4">
                        View <ArrowRight className="ml-1 h-4 w-4 inline" />
                      </a>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="prodigy-card p-8 text-center">
                <div className="bg-prodigy-light-blue/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-prodigy-purple" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No syllabi uploaded yet</h3>
                <p className="text-text-secondary mb-6">Get started by uploading your first syllabus!</p>
                <Link href="/upload">
                  <a className="btn-primary">
                    Upload Syllabus
                  </a>
                </Link>
              </div>
            )}
            
            {syllabi && syllabi.length > 0 && (
              <div className="mt-4 text-center">
                <Link href="/courses">
                  <a className="text-prodigy-purple hover:text-prodigy-light-purple font-medium inline-flex items-center">
                    View All Uploads <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </Link>
              </div>
            )}
          </div>
          
          {/* Study plans section */}
          {(studyPlans && studyPlans.length > 0) && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-6">
                <GradientText>Your Study Plans</GradientText>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studyPlans.slice(0, 4).map((plan) => (
                  <StyledCourseCard key={plan.id} studyPlan={plan} />
                ))}
              </div>
              
              <div className="text-center mt-6">
                <Link href="/courses">
                  <a className="text-prodigy-purple hover:text-prodigy-light-purple font-medium inline-flex items-center">
                    View All Study Plans <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3">
          <div className="prodigy-card mb-8">
            <div className="bg-prodigy-purple text-white p-4 rounded-t-xl">
              <h3 className="text-lg font-semibold">How It Works</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-8 h-8 bg-prodigy-purple text-white rounded-full flex items-center justify-center">
                    1
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Upload your syllabus</h4>
                  <p className="text-sm text-text-secondary">Upload your course syllabus in PDF format.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-8 h-8 bg-prodigy-purple text-white rounded-full flex items-center justify-center">
                    2
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Review extracted info</h4>
                  <p className="text-sm text-text-secondary">We'll extract key dates, assignments, and exams from your syllabus.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-8 h-8 bg-prodigy-purple text-white rounded-full flex items-center justify-center">
                    3
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Generate study plan</h4>
                  <p className="text-sm text-text-secondary">We'll create a personalized study plan with recommended sessions.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="mr-4 flex-shrink-0">
                  <div className="w-8 h-8 bg-prodigy-purple text-white rounded-full flex items-center justify-center">
                    4
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Sync with calendar</h4>
                  <p className="text-sm text-text-secondary">Add your study plan to Google Calendar, Apple Calendar, or download as ICS.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="prodigy-card">
            <div className="bg-prodigy-yellow p-4 rounded-t-xl">
              <h3 className="text-lg font-semibold text-text-primary">Tips for Best Results</h3>
            </div>
            
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex">
                  <CheckCircle className="text-prodigy-purple h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-text-body">Make sure your PDF is text-searchable (not just a scanned image)</span>
                </li>
                <li className="flex">
                  <CheckCircle className="text-prodigy-purple h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-text-body">Ensure the syllabus includes clear assignment dates and deadlines</span>
                </li>
                <li className="flex">
                  <CheckCircle className="text-prodigy-purple h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-text-body">Check that course information (name, code, instructor) is clearly stated</span>
                </li>
                <li className="flex">
                  <CheckCircle className="text-prodigy-purple h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-text-body">For best results, highlight key dates before uploading</span>
                </li>
              </ul>
              
              <div className="mt-6 p-4 bg-prodigy-light-blue/20 rounded-xl">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-prodigy-purple mr-2" />
                  <p className="font-medium">Time-Saving Tip</p>
                </div>
                <p className="text-sm text-text-body">
                  You can batch upload multiple syllabi at once and CourseAgenda will process them in the background.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced course card with ProdigyLearn styling
const StyledCourseCard = ({ studyPlan }: { studyPlan: StudyPlan }) => {
  // This would normally fetch course events, but for simplicity we'll mock some data
  const progress = Math.floor(Math.random() * 80) + 20; // Random progress between 20-100%

  return (
    <div className="prodigy-card p-5 flex flex-col hover:scale-[1.02] transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-text-primary">{studyPlan.title}</h3>
        <span className="text-xs bg-prodigy-light-purple/20 text-prodigy-purple px-2 py-1 rounded-full">Active</span>
      </div>
      <p className="text-sm text-text-secondary mb-4">Created on {new Date(studyPlan.createdAt || Date.now()).toLocaleDateString()}</p>
      
      <div className="mb-5">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-medium text-text-primary">Course Progress</span>
          <span className="text-prodigy-purple font-semibold">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div 
            className="bg-prodigy-purple h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-border/30">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Calendar Status:</span>
          {studyPlan.calendarIntegrated ? (
            <span className="text-green-600 flex items-center text-sm font-medium">
              <CheckCircle className="mr-1.5 h-4 w-4" /> Synced
            </span>
          ) : (
            <Link href={`/calendar-integration/${studyPlan.id}`}>
              <a className="text-prodigy-purple hover:text-prodigy-light-purple text-sm font-medium flex items-center">
                <CalendarIcon className="mr-1.5 h-4 w-4" /> Sync to Calendar
              </a>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
