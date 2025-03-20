import React from 'react';
import { Link } from 'wouter';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9F9F9]">
      {/* Nav badge */}
      <header className="py-4 px-4 md:px-8 lg:px-12">
        <div className="inline-flex items-center bg-[#F0F0F0] py-1 px-3 rounded-full text-sm">
          <span className="mr-2">✦</span>
          <span>New: AI-powered study planning</span>
        </div>
      </header>
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Transform your syllabus into a personalized study plan
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                CourseAgenda helps students automatically organize their academic schedules, turning syllabi into structured study plans with calendar integration.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="/api/auth/test">
                  <Button className="bg-[#0F172A] hover:bg-[#0F172A]/90 text-white px-6 py-3 rounded-md text-base font-medium flex items-center">
                    Log in or Sign up
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Button>
                </a>
                <Button variant="outline" className="border-gray-300 text-gray-700 px-6 py-3 rounded-md text-base font-medium">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop"
                alt="Lecture hall"
                className="rounded-lg shadow-lg w-full h-auto object-cover"
              />
              {/* Floating badge */}
              <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-[200px] flex items-start">
                <Clock className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Save time</h3>
                  <p className="text-xs text-gray-500">Upload once, organize instantly</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Secondary Section */}
        <section className="py-16 bg-[#F1F1F1]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Streamline Your Academic Life
            </h2>
            
            {/* More content can be added here */}
          </div>
        </section>
      </main>
    </div>
  );
}