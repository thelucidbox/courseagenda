import React from 'react';
import { Clock } from 'lucide-react';

export default function NewLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Nav badge */}
          <div className="inline-flex items-center bg-gray-100 py-1 px-4 rounded-full text-sm">
            <span className="mr-2">★</span>
            <span>New: AI-powered study planning</span>
          </div>

          {/* Hero Section */}
          <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-[#1A1A1A] leading-tight">
                Transform your syllabus into a personalized study plan
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                CourseAgenda helps students automatically organize their academic schedules, turning syllabi into structured study plans with calendar integration.
              </p>
              <div className="mt-10 flex gap-4">
                <a 
                  href="/api/auth/test" 
                  className="inline-flex items-center px-8 py-3.5 bg-[#0F172A] text-white font-medium rounded-md hover:bg-[#1E293B] transition-colors"
                >
                  Log in or Sign up
                  <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                <a 
                  href="#features" 
                  className="inline-flex items-center px-8 py-3.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop"
                alt="Lecture hall"
                className="rounded-lg shadow-lg w-full h-auto object-cover"
              />
              {/* Floating badge */}
              <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-[220px] flex items-start">
                <Clock className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Save time</h3>
                  <p className="text-xs text-gray-500">Upload once, organize instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Section with light gray background */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-[#1A1A1A]">
            Streamline Your Academic Life
          </h2>
          
          {/* Feature section - can be expanded later */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Syllabus</h3>
              <p className="text-gray-600">Upload your course syllabus in PDF format for automatic processing.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate Plan</h3>
              <p className="text-gray-600">AI analyzes your syllabus to create a personalized study schedule.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sync Calendar</h3>
              <p className="text-gray-600">Integrate your study plan with Google Calendar or other services.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}