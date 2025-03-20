import React from 'react';
import { Link } from 'wouter';
import { Clock, Star, Circle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className={`${sizeClass} ${colorClass} opacity-70`} style={style}>
      {type === 'star' && <Star />}
      {type === 'circle' && <Circle />}
      {type === 'plus' && <Plus />}
      {type === 'donut' && (
        <div className="rounded-full border-2 border-current w-full h-full"></div>
      )}
    </div>
  );
};

export default function NewLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Nav badge */}
      <header className="py-4 px-4 md:px-8 lg:px-12 relative">
        <div className="inline-flex items-center bg-[#F0F0F0] py-1 px-3 rounded-full text-sm">
          <span className="mr-2">✦</span>
          <span>New: AI-powered study planning</span>
        </div>
        <FloatingShape type="star" color="accent" top="40%" right="10%" />
      </header>
      
      <main className="flex-grow relative">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8 md:py-12 relative overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-[#1A1A1A]">
                Transform your syllabus into a personalized study plan
              </h1>
              <p className="text-lg text-[#333333] mb-8 leading-relaxed">
                CourseAgenda helps students automatically organize their academic schedules, turning syllabi into structured study plans with calendar integration.
              </p>
              <div className="flex flex-wrap">
                <a href="/api/auth/test">
                  <Button className="bg-[#0F172A] hover:bg-[#0F172A]/90 text-white px-8 py-4 rounded-full text-base font-semibold flex items-center">
                    Log in or Sign up
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative hidden md:block z-10">
              <div className="rounded-2xl overflow-hidden shadow-lg transform rotate-1">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop"
                  alt="Lecture hall"
                  className="w-full h-auto object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-lg p-4 max-w-[200px] flex items-start transform -rotate-1">
                <Clock className="h-5 w-5 text-[#FFB627] mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">Save time</h3>
                  <p className="text-xs text-gray-500">Upload once, organize instantly</p>
                </div>
              </div>
            </div>
          </div>

          <FloatingShape type="plus" color="accent" bottom="10%" left="5%" size="lg" />
          <FloatingShape type="circle" color="purple" top="20%" right="20%" size="md" />
          <FloatingShape type="donut" color="accent" bottom="30%" right="5%" />
        </section>

        {/* Secondary Section */}
        <section className="py-16 bg-[#E2F0FF]/20 relative">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Streamline Your Academic Life
            </h2>
            
            {/* Feature cards would go here */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Placeholder for feature cards */}
            </div>
          </div>
          <FloatingShape type="star" color="purple" top="20%" left="5%" />
          <FloatingShape type="circle" color="accent" bottom="20%" right="10%" size="md" />
        </section>
      </main>
    </div>
  );
}