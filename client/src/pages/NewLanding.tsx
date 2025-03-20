import React from 'react';
import { Link } from 'wouter';
import { Check, Calendar, FileText, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProdigyNavbar } from '@/components/ProdigyNavbar';

export default function NewLanding() {
  return (
    <div className="flex flex-col min-h-screen">
      <ProdigyNavbar />
      
      <main className="flex-grow bg-white">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="md:w-1/2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Welcome to CourseAgenda
              </h1>
              <Button 
                className="bg-[#7209B7] hover:bg-[#7209B7]/90 text-white px-6 py-3 rounded-md font-medium"
              >
                Get Started
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Upload Syllabus */}
            <Card className="p-6 flex flex-col items-center hover:shadow-md transition-shadow border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-[#7209B7]" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Upload Syllabus</h2>
              <p className="text-gray-600 text-center">
                Upload your course syllabus in PDF format
              </p>
            </Card>

            {/* Create Study Plan */}
            <Card className="p-6 flex flex-col items-center hover:shadow-md transition-shadow border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Layout className="h-6 w-6 text-[#7209B7]" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Create Study Plan</h2>
              <p className="text-gray-600 text-center">
                Generate a personalized study schedule
              </p>
            </Card>

            {/* Sync Calendar */}
            <Card className="p-6 flex flex-col items-center hover:shadow-md transition-shadow border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-[#7209B7]" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Sync Calendar</h2>
              <p className="text-gray-600 text-center">
                Add study sessions to your calendar
              </p>
            </Card>
          </div>
        </section>

        {/* Recent Uploads */}
        <section className="container mx-auto px-4 py-8 bg-[#FFF9EE] my-8 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Recent Uploads</h2>
          <p className="text-gray-600">No syllabi uploaded yet. Get started by uploading your first syllabus!</p>
        </section>

        {/* Two Column Layout */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {/* Empty space for additional content */}
            </div>
            
            {/* How It Works */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">How It Works</h2>
              
              <div className="space-y-6">
                <div className="flex">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-[#7209B7] font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Upload your syllabus</h3>
                    <p className="text-sm text-gray-600">Upload your course syllabus in PDF format.</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-[#7209B7] font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Review extracted information</h3>
                    <p className="text-sm text-gray-600">
                      We'll extract key dates, assignments, and exams from your syllabus and make any necessary adjustments.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-[#7209B7] font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Generate your study plan</h3>
                    <p className="text-sm text-gray-600">
                      We'll create a personalized study schedule with recommended study sessions based on your course schedule.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-[#7209B7] font-semibold">4</span>
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
                    <Check className="h-4 w-4 text-[#7209B7] mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">Make sure your PDF is text-searchable (not a scanned image)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[#7209B7] mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">Ensure the syllabus includes assignment dates and deadlines</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[#7209B7] mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">Check that course information is clearly stated</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}