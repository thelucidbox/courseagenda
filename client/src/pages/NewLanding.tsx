import React from 'react';
import { Clock, FileText, Calendar, LayoutGrid } from 'lucide-react';
import { FloatingShape } from '@/components/ui/floating-shapes';

export default function NewLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      {/* Top Section with decorative elements */}
      <div className="bg-white relative">
        <FloatingShape type="star" color="accent" top="15%" right="8%" size="md" />
        <FloatingShape type="circle" color="purple" top="35%" left="5%" size="sm" />
        <FloatingShape type="plus" color="purple" bottom="15%" right="15%" size="md" />
        <FloatingShape type="donut" color="accent" bottom="30%" left="12%" size="md" opacity={0.5} />
        
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Nav badge */}
          <div className="inline-flex items-center bg-gray-100 py-1.5 px-4 rounded-full text-sm">
            <span className="mr-2 text-[#7209B7]">★</span>
            <span>New: AI-powered study planning</span>
          </div>

          {/* Hero Section */}
          <div className="mt-12 grid md:grid-cols-2 gap-12 items-center">
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] leading-tight">
                Transform your syllabus into a personalized study plan
              </h1>
              <p className="mt-6 text-lg text-[#333333] leading-relaxed">
                CourseAgenda helps students automatically organize their academic schedules, turning syllabi into structured study plans with calendar integration.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a 
                  href="/api/auth/test" 
                  className="inline-flex items-center px-8 py-3.5 bg-[#0F172A] text-white font-medium rounded-full hover:bg-[#1E293B] transition-colors"
                >
                  Log in or Sign up
                  <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                <a 
                  href="#features" 
                  className="inline-flex items-center px-8 py-3.5 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-lg transform rotate-1">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop"
                  alt="Lecture hall"
                  className="w-full h-auto object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-lg p-4 max-w-[220px] flex items-start transform -rotate-1">
                <Clock className="h-5 w-5 text-[#FFB627] mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Save time</h3>
                  <p className="text-xs text-gray-500">Upload once, organize instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Section with light background */}
      <div className="bg-[#F8F9FC] py-20 relative">
        <FloatingShape type="star" color="purple" top="15%" right="10%" size="md" />
        <FloatingShape type="circle" color="accent" bottom="10%" left="5%" size="lg" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl font-bold text-center text-[#1A1A1A] mb-16">
            Streamline Your Academic Life
          </h2>
          
          {/* Feature section */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow transform hover:scale-105 transition-transform">
              <div className="h-14 w-14 bg-[#7209B7]/10 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-7 w-7 text-[#7209B7]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1A1A1A]">Upload Syllabus</h3>
              <p className="text-[#666666] leading-relaxed">Upload your course syllabus in PDF format for automatic analysis with our AI system.</p>
            </div>
            
            {/* Card 2 - Highlighted card */}
            <div className="bg-[#7209B7] rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow text-white transform hover:scale-105 transition-transform">
              <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center mb-6">
                <LayoutGrid className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Generate Plan</h3>
              <p className="text-white/90 leading-relaxed">Our AI analyzes your syllabus to create a personalized study schedule optimized for your success.</p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow transform hover:scale-105 transition-transform">
              <div className="h-14 w-14 bg-[#7209B7]/10 rounded-full flex items-center justify-center mb-6">
                <Calendar className="h-7 w-7 text-[#7209B7]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1A1A1A]">Sync Calendar</h3>
              <p className="text-[#666666] leading-relaxed">Integrate your study plan with Google Calendar, Apple Calendar, or other services.</p>
            </div>
          </div>
          
          {/* Additional features section can be added here */}
          <div className="mt-20 bg-white rounded-xl p-8 shadow-md relative overflow-hidden">
            <FloatingShape type="donut" color="accent" top="-10px" right="-10px" size="md" />
            
            <h3 className="text-2xl font-bold mb-6 text-[#1A1A1A]">Why students love CourseAgenda</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start">
                <div className="h-10 w-10 bg-[#FFB627] rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <span className="font-bold text-white">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-[#1A1A1A]">Time Saving</h4>
                  <p className="text-[#666666] mt-1">Automatically extract important dates and deadlines from your syllabus.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-10 w-10 bg-[#FFB627] rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <span className="font-bold text-white">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-[#1A1A1A]">AI-Powered</h4>
                  <p className="text-[#666666] mt-1">Smart algorithm creates optimal study schedules based on your course load.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-10 w-10 bg-[#FFB627] rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <span className="font-bold text-white">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-[#1A1A1A]">Easy Integration</h4>
                  <p className="text-[#666666] mt-1">Connect with your favorite calendar apps with just a few clicks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}