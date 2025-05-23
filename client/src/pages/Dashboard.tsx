import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Calendar, FileText, LayoutGrid, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming Card parts might be useful
import { useQuery } from '@tanstack/react-query';
import { Syllabus } from '@shared/schema';
import { FloatingShape } from '@/components/ui/floating-shapes';

export default function Dashboard() {
  const { user } = useAuth();
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  
  const { data: syllabiData } = useQuery<Syllabus[]>({ // Added type for syllabiData
    queryKey: ['/api/syllabi'],
    enabled: !!user,
  });
  
  useEffect(() => {
    if (syllabiData) {
      setSyllabi(Array.isArray(syllabiData) ? syllabiData : []);
    }
  }, [syllabiData]);

  // Custom class for hover scale effect, can be reused
  const hoverScaleEffect = "transform hover:scale-105 transition-transform duration-300";

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 relative overflow-hidden section-spacing"> {/* Added section-spacing */}
      {/* Decorative floating shapes - using theme color names */}
      <FloatingShape type="star" color="prodigy-light-blue" top="5%" right="5%" size="md" />
      <FloatingShape type="circle" color="prodigy-purple" bottom="20%" left="3%" size="md" />
      <FloatingShape type="plus" color="prodigy-purple" top="40%" right="15%" size="sm" />
      <FloatingShape type="donut" color="prodigy-light-blue" bottom="30%" right="8%" size="md" opacity={0.5} />
      
      <div className="flex justify-between items-center mb-12 relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">Welcome to CourseAgenda</h1>
        {/* Standardized Button */}
        <Button variant="default" size="lg" className="rounded-full"> {/* Kept rounded-full as specific design choice */}
          Get Started
        </Button>
      </div>

      {/* Feature cards - using standardized Card and theme colors */}
      <div className="grid md:grid-cols-3 gap-6 mb-16 relative z-10">
        <Link href="/upload" className="h-full">
          <Card className={cn("p-8 h-full cursor-pointer", hoverScaleEffect)}>
            <div className="flex flex-col items-center text-center h-full">
              <div className="bg-prodigy-purple/10 p-4 rounded-full mb-6">
                <FileText className="h-8 w-8 text-prodigy-purple" />
              </div>
              <h2 className="text-xl font-semibold mb-3 text-text-primary">Upload Syllabus</h2>
              <p className="text-text-secondary flex-grow leading-relaxed">
                Upload your course syllabus in PDF format for AI analysis
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/create-plan" className="h-full">
          <Card className={cn("p-8 h-full cursor-pointer bg-prodigy-purple text-primary-foreground", hoverScaleEffect)}>
            <div className="flex flex-col items-center text-center h-full">
              <div className="bg-white/20 p-4 rounded-full mb-6">
                <LayoutGrid className="h-8 w-8 text-white" /> {/* text-white is fine on dark bg */}
              </div>
              <h2 className="text-xl font-semibold mb-3">Create Study Plan</h2>
              <p className="text-primary-foreground/90 flex-grow leading-relaxed">
                Generate a personalized study schedule that works for you
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/calendar-integration" className="h-full">
          <Card className={cn("p-8 h-full cursor-pointer", hoverScaleEffect)}>
            <div className="flex flex-col items-center text-center h-full">
              <div className="bg-prodigy-purple/10 p-4 rounded-full mb-6">
                <Calendar className="h-8 w-8 text-prodigy-purple" />
              </div>
              <h2 className="text-xl font-semibold mb-3 text-text-primary">Sync Calendar</h2>
              <p className="text-text-secondary flex-grow leading-relaxed">
                Add study sessions to your favorite calendar application
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Uploads - using standardized Card and theme colors */}
      <Card as="section" className="p-8 mb-16 relative bg-prodigy-light-yellow/10"> {/* Using Card as section container */}
        <FloatingShape type="donut" color="prodigy-light-blue" top="-15px" right="-15px" size="md" />
        <FloatingShape type="star" color="prodigy-purple" bottom="-10px" left="20%" size="sm" />
        
        <h2 className="text-2xl font-semibold mb-6 text-text-primary">Recent Uploads</h2>
        {syllabi && syllabi.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {syllabi.map((syllabus) => (
              <Link key={syllabus.id} href={`/syllabi/${syllabus.id}`} className="block">
                <Card className={cn("p-6", hoverScaleEffect)}> {/* Standard Card for items */}
                  <h3 className="font-semibold text-lg text-text-primary">{syllabus.courseName || syllabus.filename}</h3>
                  <p className="text-text-secondary mt-2">
                    {syllabus.courseCode || 'Course code not available'}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center p-8"> {/* Inner div for centering content, Card already provides bg */}
            <div className="inline-flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-prodigy-purple/10 mb-4">
              <FileText className="h-8 w-8 text-prodigy-purple" />
            </div>
            <p className="text-text-secondary text-lg">No syllabi uploaded yet. Get started by uploading your first syllabus!</p>
            <Button asChild variant="default" className="mt-4 rounded-full">
              <Link href="/upload">Upload a Syllabus</Link>
            </Button>
          </div>
        )}
      </Card>

      {/* How It Works Section */}
      <div className="grid md:grid-cols-3 gap-8 relative">
        <FloatingShape type="plus" color="prodigy-purple" bottom="10%" right="33%" size="lg" />
        <FloatingShape type="circle" color="prodigy-light-blue" top="5%" left="45%" size="sm" />
        
        <Card as="section" className="md:col-span-2 p-8 bg-accent/30"> {/* Using Card as section container, with accent bg */}
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Start Your Journey</h2>
          <p className="text-text-body leading-relaxed">
            CourseAgenda helps you stay organized throughout the semester. Upload your syllabus, create a study plan, and never miss another deadline.
          </p>
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Adjusted grid for better responsiveness */}
            <Card className="p-4"> {/* Inner cards for highlights */}
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 bg-prodigy-purple/10 rounded-full flex items-center justify-center mr-3 shrink-0">
                  <Check className="h-4 w-4 text-prodigy-purple" />
                </div>
                <h3 className="font-medium text-text-primary">AI Analysis</h3>
              </div>
              <p className="text-text-secondary text-sm">Extracts important dates and assignments automatically</p>
            </Card>
            
            <Card className="p-4"> {/* Inner cards for highlights */}
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 bg-prodigy-purple/10 rounded-full flex items-center justify-center mr-3 shrink-0">
                  <Check className="h-4 w-4 text-prodigy-purple" />
                </div>
                <h3 className="font-medium text-text-primary">Smart Planning</h3>
              </div>
              <p className="text-text-secondary text-sm">Creates balanced study schedules based on workload</p>
            </Card>
          </div>
        </Card>
        
        <Card className="p-8"> {/* Standard Card for steps */}
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">How It Works</h2>
          <div className="space-y-6">
            {[
              { title: "Upload your syllabus", description: "Upload your course syllabus in PDF format." },
              { title: "Review extracted information", description: "We'll extract key dates, assignments, and exams from your syllabus." },
              { title: "Generate your study plan", description: "We'll create a personalized study schedule based on your course." },
              { title: "Sync with your calendar", description: "Add study plan to your favorite calendar service." }
            ].map((step, index) => (
              <div className="flex" key={index}>
                <div className="bg-prodigy-yellow text-text-primary h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4 shadow-prodigy-sm">
                  <span className="font-bold">{index + 1}</span>
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">{step.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-accent/30 p-6 rounded-xl"> {/* Tips box with accent bg */}
            <h3 className="font-semibold mb-4 text-text-primary">Tips for Best Results</h3>
            <ul className="space-y-3">
              {[
                "Make sure your PDF is text-searchable",
                "Ensure syllabus includes all assignment dates",
                "Check that course information is clear"
              ].map((tip, index) => (
                <li className="flex items-start" key={index}>
                  <Check className="h-5 w-5 text-prodigy-purple mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-text-body">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}