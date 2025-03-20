import React from 'react';
import { Clock, FileText, Calendar, LayoutGrid, CheckCircle, Star } from 'lucide-react';
import { DecorativeShapes, FloatingShape } from '@/components/ui/floating-shapes';

export default function NewLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      {/* Decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#7209B7]/10 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#FFB627]/10 rounded-full filter blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
      </div>
      
      {/* Top Section with decorative elements */}
      <div className="bg-white relative">
        <FloatingShape type="star" color="accent" top="15%" right="8%" size="md" />
        <FloatingShape type="circle" color="purple" top="35%" left="5%" size="sm" />
        <FloatingShape type="plus" color="purple" bottom="15%" right="15%" size="md" />
        <FloatingShape type="donut" color="accent" bottom="30%" left="12%" size="md" opacity={0.5} />
        <FloatingShape type="square" color="purple" top="65%" right="25%" size="sm" rotate="15deg" opacity={0.3} />
        
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Nav badge */}
          <div className="inline-flex items-center bg-[#7209B7]/5 py-1.5 px-4 rounded-full text-sm font-medium shadow-sm">
            <span className="mr-2 text-[#7209B7]">★</span>
            <span className="bg-gradient-to-r from-[#7209B7] to-[#9D4EDD] bg-clip-text text-transparent">
              New: AI-powered study planning
            </span>
          </div>

          {/* Hero Section */}
          <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
            <div className="relative z-10">
              <div className="relative">
                <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] leading-tight">
                  Transform your syllabus into a 
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-[#7209B7] to-[#9D4EDD] bg-clip-text text-transparent"> personalized</span>
                    <FloatingShape type="star" color="accent" top="-15px" right="-25px" size="xs" />
                  </span> 
                  study plan
                </h1>
              </div>
              
              <p className="mt-6 text-lg text-[#333333] leading-relaxed">
                CourseAgenda helps students automatically organize their academic schedules, turning syllabi into structured study plans with calendar integration.
              </p>
              
              <div className="mt-12 flex flex-wrap gap-4">
                <a 
                  href="/api/auth/test" 
                  className="inline-flex items-center px-8 py-3.5 bg-[#7209B7] text-white font-medium rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Log in with Replit
                  <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                <a 
                  href="#features" 
                  className="inline-flex items-center px-8 py-3.5 border border-gray-200 text-[#666666] font-medium rounded-full hover:bg-gray-50 shadow-sm hover:shadow transition-all"
                >
                  Learn More
                </a>
              </div>
              
              {/* Social proof */}
              <div className="mt-12 inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm py-2 px-4 rounded-full shadow-sm border border-gray-100">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-8 h-8 rounded-full bg-[#7209B7] text-white flex items-center justify-center text-xs border-2 border-white`}>
                      {['J', 'K', 'M', 'S'][i-1]}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-[#666666]">
                  <span className="font-semibold">1,200+</span> students use CourseAgenda
                </span>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute w-72 h-72 bg-[#7209B7]/10 rounded-full filter blur-3xl top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 z-0"></div>
              
              <div className="rounded-2xl overflow-hidden shadow-xl transform rotate-1 relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop"
                  alt="Lecture hall"
                  className="w-full h-auto object-cover rounded-2xl"
                />
              </div>
              
              {/* Floating badges */}
              <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-xl p-4 max-w-[220px] flex items-start transform -rotate-1 z-20">
                <Clock className="h-5 w-5 text-[#FFB627] mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Save time</h3>
                  <p className="text-xs text-gray-500">Upload once, organize instantly</p>
                </div>
              </div>
              
              <div className="absolute top-8 -left-4 bg-[#7209B7] text-white rounded-xl shadow-xl p-4 max-w-[200px] flex items-start transform rotate-2 z-20">
                <Star className="h-5 w-5 text-[#FFB627] mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">AI-Powered</h3>
                  <p className="text-xs text-white/80">Intelligent schedule creation</p>
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
        <FloatingShape type="triangle" color="purple" top="40%" left="20%" size="md" rotate="180deg" opacity={0.3} />
        <FloatingShape type="plus" color="accent" bottom="20%" right="15%" size="sm" opacity={0.6} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl font-bold text-center text-[#1A1A1A] mb-16">
            <span className="relative inline-block">
              Streamline
              <FloatingShape type="star" color="accent" top="-15px" right="-20px" size="xs" />
            </span> Your Academic Life
          </h2>
          
          {/* Feature section */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-102 duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 w-24 h-24 bg-[#7209B7]/5 rounded-full"></div>
              <div className="h-14 w-14 bg-[#7209B7]/10 rounded-full flex items-center justify-center mb-6 relative z-10">
                <FileText className="h-7 w-7 text-[#7209B7]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1A1A1A]">Upload Syllabus</h3>
              <p className="text-[#666666] leading-relaxed">Upload your course syllabus in PDF format for automatic analysis with our AI system.</p>
            </div>
            
            {/* Card 2 - Highlighted card */}
            <div className="bg-[#7209B7] rounded-xl p-8 shadow-lg hover:shadow-xl transition-all text-white transform hover:scale-102 duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center mb-6 relative z-10">
                <LayoutGrid className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Generate Plan</h3>
              <p className="text-white/90 leading-relaxed">Our AI analyzes your syllabus to create a personalized study schedule optimized for your success.</p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-102 duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 w-24 h-24 bg-[#7209B7]/5 rounded-full"></div>
              <div className="h-14 w-14 bg-[#7209B7]/10 rounded-full flex items-center justify-center mb-6 relative z-10">
                <Calendar className="h-7 w-7 text-[#7209B7]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1A1A1A]">Sync Calendar</h3>
              <p className="text-[#666666] leading-relaxed">Integrate your study plan with Google Calendar, Apple Calendar, or other services.</p>
            </div>
          </div>
          
          {/* Additional features section */}
          <div className="mt-20 bg-white rounded-xl p-8 shadow-lg relative overflow-hidden">
            <FloatingShape type="donut" color="accent" top="-20px" right="-20px" size="md" />
            <FloatingShape type="plus" color="purple" bottom="-15px" left="10%" size="sm" opacity={0.4} />
            
            <h3 className="text-2xl font-bold mb-8 text-[#1A1A1A]">Why students love CourseAgenda</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start p-4 hover:bg-[#7209B7]/5 rounded-xl transition-colors group">
                <div className="h-10 w-10 bg-[#FFB627] rounded-full flex items-center justify-center flex-shrink-0 mr-4 shadow-md transform group-hover:scale-110 transition-transform">
                  <span className="font-bold text-white">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-[#1A1A1A]">Time Saving</h4>
                  <p className="text-[#666666] mt-1">Automatically extract important dates and deadlines from your syllabus.</p>
                </div>
              </div>
              
              <div className="flex items-start p-4 hover:bg-[#7209B7]/5 rounded-xl transition-colors group">
                <div className="h-10 w-10 bg-[#FFB627] rounded-full flex items-center justify-center flex-shrink-0 mr-4 shadow-md transform group-hover:scale-110 transition-transform">
                  <span className="font-bold text-white">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-[#1A1A1A]">AI-Powered</h4>
                  <p className="text-[#666666] mt-1">Smart algorithm creates optimal study schedules based on your course load.</p>
                </div>
              </div>
              
              <div className="flex items-start p-4 hover:bg-[#7209B7]/5 rounded-xl transition-colors group">
                <div className="h-10 w-10 bg-[#FFB627] rounded-full flex items-center justify-center flex-shrink-0 mr-4 shadow-md transform group-hover:scale-110 transition-transform">
                  <span className="font-bold text-white">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-[#1A1A1A]">Easy Integration</h4>
                  <p className="text-[#666666] mt-1">Connect with your favorite calendar apps with just a few clicks.</p>
                </div>
              </div>
            </div>
            
            {/* CTA Banner */}
            <div className="mt-12 bg-gradient-to-r from-[#7209B7] to-[#9D4EDD] rounded-xl p-8 text-white relative overflow-hidden">
              <FloatingShape type="circle" color="light" top="20%" right="5%" size="sm" opacity={0.2} />
              <FloatingShape type="donut" color="light" bottom="20%" left="10%" size="sm" opacity={0.2} />
              
              <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-2">
                  <h3 className="text-xl font-bold mb-2">Ready to transform your study experience?</h3>
                  <p className="text-white/80">Join thousands of students using CourseAgenda to stay organized and achieve better results.</p>
                </div>
                <div className="flex justify-center md:justify-end">
                  <a 
                    href="/api/auth/test" 
                    className="inline-flex items-center px-6 py-3 bg-white text-[#7209B7] font-medium rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    Get Started
                    <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}