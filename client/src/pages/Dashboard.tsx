import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Calendar, FileText, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Syllabus } from '@shared/schema';

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
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to CourseAgenda</h1>
        <Button size="lg" className="bg-[#7209B7] hover:bg-[#7209B7]/90 text-white rounded-full">
          Get Started
        </Button>
      </div>

      {/* Feature cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {/* Upload Syllabus */}
        <Link href="/upload">
          <Card className="p-6 h-full hover:shadow-lg transition-shadow cursor-pointer border-gray-200">
            <div className="flex flex-col items-center h-full">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <FileText className="h-8 w-8 text-[#7209B7]" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-center">Upload Syllabus</h2>
              <p className="text-gray-600 text-center flex-grow">
                Upload your course syllabus in PDF format
              </p>
            </div>
          </Card>
        </Link>

        {/* Create Study Plan */}
        <Link href="/create-plan">
          <Card className="p-6 h-full hover:shadow-lg transition-shadow cursor-pointer border-gray-200">
            <div className="flex flex-col items-center h-full">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Layout className="h-8 w-8 text-[#7209B7]" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-center">Create Study Plan</h2>
              <p className="text-gray-600 text-center flex-grow">
                Generate a personalized study schedule
              </p>
            </div>
          </Card>
        </Link>

        {/* Sync Calendar */}
        <Link href="/calendar-integration">
          <Card className="p-6 h-full hover:shadow-lg transition-shadow cursor-pointer border-gray-200">
            <div className="flex flex-col items-center h-full">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-[#7209B7]" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-center">Sync Calendar</h2>
              <p className="text-gray-600 text-center flex-grow">
                Add study sessions to your calendar
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Uploads */}
      <div className="bg-[#FFF9EE] p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Uploads</h2>
        {syllabi && syllabi.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {syllabi.map((syllabus) => (
              <Link key={syllabus.id} href={`/syllabi/${syllabus.id}`}>
                <a className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-medium">{syllabus.courseName || syllabus.filename}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {syllabus.courseCode || 'Course code not available'}
                  </p>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No syllabi uploaded yet. Get started by uploading your first syllabus!</p>
        )}
      </div>

      {/* How It Works */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="col-span-2">
          {/* This space can be used for additional content */}
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          
          <div className="space-y-6">
            <div className="flex">
              <div className="bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <span className="font-semibold text-[#7209B7]">1</span>
              </div>
              <div>
                <h3 className="font-medium">Upload your syllabus</h3>
                <p className="text-sm text-gray-600">Upload your course syllabus in PDF format.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <span className="font-semibold text-[#7209B7]">2</span>
              </div>
              <div>
                <h3 className="font-medium">Review extracted information</h3>
                <p className="text-sm text-gray-600">
                  We'll extract key dates, assignments, and exams from your syllabus and make any necessary adjustments.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <span className="font-semibold text-[#7209B7]">3</span>
              </div>
              <div>
                <h3 className="font-medium">Generate your study plan</h3>
                <p className="text-sm text-gray-600">
                  We'll create a personalized study schedule with recommended study sessions based on your course schedule.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <span className="font-semibold text-[#7209B7]">4</span>
              </div>
              <div>
                <h3 className="font-medium">Sync with your calendar</h3>
                <p className="text-sm text-gray-600">
                  Add your study plan directly to Google Calendar, Apple Calendar, or other supported calendar services.
                </p>
              </div>
            </div>
          </div>
          
          {/* Tips box */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Tips for Best Results</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-[#7209B7] mr-2">✓</span>
                <span className="text-sm">Make sure your PDF is text-searchable (not a scanned image)</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#7209B7] mr-2">✓</span>
                <span className="text-sm">Ensure the syllabus includes all assignment dates and deadlines</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#7209B7] mr-2">✓</span>
                <span className="text-sm">Check that course information is clearly stated</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}