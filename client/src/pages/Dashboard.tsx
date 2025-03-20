import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Calendar, FileText, Layout, Star, Circle, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Syllabus } from '@shared/schema';

// Floating shape component for decorative elements
const FloatingShape = ({ 
  type, 
  color = 'purple', 
  top, 
  bottom, 
  left, 
  right, 
  size = 'sm' 
}: { 
  type: 'star' | 'circle' | 'plus' | 'donut'; 
  color?: 'purple' | 'accent';
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }[size];
  
  const colorClass = {
    purple: 'text-[#7209B7]',
    accent: 'text-[#FFB627]'
  }[color];
  
  const style = {
    position: 'absolute',
    top: top,
    bottom: bottom,
    left: left,
    right: right
  } as React.CSSProperties;
  
  return (
    <div className={`${sizeClass} ${colorClass} opacity-70 z-0`} style={style}>
      {type === 'star' && <Star />}
      {type === 'circle' && <Circle />}
      {type === 'plus' && <Plus />}
      {type === 'donut' && (
        <div className="rounded-full border-2 border-current w-full h-full"></div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  
  // Fetch syllabi
  const { data: syllabiData } = useQuery({
    queryKey: ['/api/syllabi'],
    enabled: !!user,
  });
  
  useEffect(() => {
    if (syllabiData) {
      setSyllabi(Array.isArray(syllabiData) ? syllabiData : []);
    }
  }, [syllabiData]);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 relative">
      <FloatingShape type="star" color="accent" top="5%" right="5%" />
      <FloatingShape type="circle" color="purple" bottom="10%" left="5%" size="md" />
      
      <div className="flex justify-between items-center mb-12 relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A1A]">Welcome to CourseAgenda</h1>
        <Button size="lg" className="bg-[#7209B7] hover:bg-[#7209B7]/90 text-white rounded-full px-8 py-3 font-semibold text-base">
          Get Started
        </Button>
      </div>

      {/* Feature cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-16 relative z-10">
        {/* Upload Syllabus */}
        <Link href="/upload">
          <Card className="p-8 h-full hover:shadow-lg transition-shadow cursor-pointer border-gray-100 rounded-xl transform hover:scale-105 transition-transform">
            <div className="flex flex-col items-center h-full">
              <div className="bg-[#7209B7]/10 p-4 rounded-full mb-6">
                <FileText className="h-8 w-8 text-[#7209B7]" />
              </div>
              <h2 className="text-xl font-semibold mb-3 text-center text-[#1A1A1A]">Upload Syllabus</h2>
              <p className="text-[#666666] text-center flex-grow leading-relaxed">
                Upload your course syllabus in PDF format
              </p>
            </div>
          </Card>
        </Link>

        {/* Create Study Plan */}
        <Link href="/create-plan">
          <Card className="p-8 h-full hover:shadow-lg transition-shadow cursor-pointer border-gray-100 rounded-xl transform hover:scale-105 transition-transform bg-[#7209B7]">
            <div className="flex flex-col items-center h-full">
              <div className="bg-white/20 p-4 rounded-full mb-6">
                <Layout className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-3 text-center text-white">Create Study Plan</h2>
              <p className="text-white/80 text-center flex-grow leading-relaxed">
                Generate a personalized study schedule
              </p>
            </div>
          </Card>
        </Link>

        {/* Sync Calendar */}
        <Link href="/calendar-integration">
          <Card className="p-8 h-full hover:shadow-lg transition-shadow cursor-pointer border-gray-100 rounded-xl transform hover:scale-105 transition-transform">
            <div className="flex flex-col items-center h-full">
              <div className="bg-[#7209B7]/10 p-4 rounded-full mb-6">
                <Calendar className="h-8 w-8 text-[#7209B7]" />
              </div>
              <h2 className="text-xl font-semibold mb-3 text-center text-[#1A1A1A]">Sync Calendar</h2>
              <p className="text-[#666666] text-center flex-grow leading-relaxed">
                Add study sessions to your calendar
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Uploads */}
      <div className="bg-[#FFF9EE] p-8 rounded-xl mb-16 relative">
        <FloatingShape type="donut" color="accent" top="-15px" right="-15px" />
        
        <h2 className="text-2xl font-semibold mb-6 text-[#1A1A1A]">Recent Uploads</h2>
        {syllabi && syllabi.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {syllabi.map((syllabus) => (
              <Link key={syllabus.id} href={`/syllabi/${syllabus.id}`}>
                <a className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all transform hover:scale-105">
                  <h3 className="font-semibold text-lg text-[#1A1A1A]">{syllabus.courseName || syllabus.filename}</h3>
                  <p className="text-[#666666] mt-2">
                    {syllabus.courseCode || 'Course code not available'}
                  </p>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[#666666] text-lg">No syllabi uploaded yet. Get started by uploading your first syllabus!</p>
        )}
      </div>

      {/* How It Works */}
      <div className="grid md:grid-cols-3 gap-8 relative">
        <FloatingShape type="plus" color="purple" bottom="10%" right="33%" size="lg" />
        
        <div className="col-span-2 relative z-10">
          {/* Placeholder for content */}
          <div className="bg-[#E2F0FF]/20 p-8 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4 text-[#1A1A1A]">Start Your Journey</h2>
            <p className="text-[#333333] leading-relaxed">
              CourseAgenda helps you stay organized throughout the semester. Upload your syllabus, create a study plan, and never miss another deadline.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 relative z-10">
          <h2 className="text-2xl font-semibold mb-6 text-[#1A1A1A]">How It Works</h2>
          
          <div className="space-y-6">
            <div className="flex">
              <div className="bg-[#FFB627] h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                <span className="font-bold text-white">1</span>
              </div>
              <div>
                <h3 className="font-medium text-[#1A1A1A]">Upload your syllabus</h3>
                <p className="text-[#666666] leading-relaxed">Upload your course syllabus in PDF format.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-[#FFB627] h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                <span className="font-bold text-white">2</span>
              </div>
              <div>
                <h3 className="font-medium text-[#1A1A1A]">Review extracted information</h3>
                <p className="text-[#666666] leading-relaxed">
                  We'll extract key dates, assignments, and exams from your syllabus.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-[#FFB627] h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                <span className="font-bold text-white">3</span>
              </div>
              <div>
                <h3 className="font-medium text-[#1A1A1A]">Generate your study plan</h3>
                <p className="text-[#666666] leading-relaxed">
                  We'll create a personalized study schedule based on your course.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-[#FFB627] h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                <span className="font-bold text-white">4</span>
              </div>
              <div>
                <h3 className="font-medium text-[#1A1A1A]">Sync with your calendar</h3>
                <p className="text-[#666666] leading-relaxed">
                  Add study plan to your favorite calendar service.
                </p>
              </div>
            </div>
          </div>
          
          {/* Tips box */}
          <div className="mt-8 bg-[#E2F0FF]/30 p-6 rounded-xl">
            <h3 className="font-semibold mb-4 text-[#1A1A1A]">Tips for Best Results</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-[#7209B7] mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-[#333333]">Make sure your PDF is text-searchable</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-[#7209B7] mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-[#333333]">Ensure syllabus includes all assignment dates</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-[#7209B7] mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-[#333333]">Check that course information is clear</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}