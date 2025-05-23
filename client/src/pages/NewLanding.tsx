import React from 'react';
import { Clock, FileText, Calendar, LayoutGrid, Star, ArrowRight } from 'lucide-react';
import { FloatingShape } from '@/components/ui/floating-shapes'; // Assuming DecorativeShapes is not used or part of FloatingShapes

export default function NewLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden">
      {/* Decorative background elements - using theme colors */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-prodigy-purple/10 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-prodigy-yellow/10 rounded-full filter blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
      </div>
      
      {/* Top Section with decorative elements */}
      <div className="bg-background relative section-spacing"> {/* Added section-spacing */}
        {/* Floating shapes with theme colors */}
        <FloatingShape type="star" color="prodigy-light-blue" top="15%" right="8%" size="md" />
        <FloatingShape type="circle" color="prodigy-purple" top="35%" left="5%" size="sm" />
        <FloatingShape type="plus" color="prodigy-purple" bottom="15%" right="15%" size="md" />
        <FloatingShape type="donut" color="prodigy-light-blue" bottom="30%" left="12%" size="md" opacity={0.5} />
        <FloatingShape type="square" color="prodigy-purple" top="65%" right="25%" size="sm" rotate="15deg" opacity={0.3} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Nav badge - using theme colors */}
          <div className="inline-flex items-center bg-prodigy-purple/10 py-1.5 px-4 rounded-full text-sm font-medium shadow-prodigy-sm border border-prodigy-purple/20">
            <Star className="mr-2 text-prodigy-purple h-4 w-4" /> {/* Use Star from lucide */}
            <span className="bg-gradient-to-r from-prodigy-purple to-prodigy-light-purple bg-clip-text text-transparent">
              New: AI-powered study planning
            </span>
          </div>

          {/* Hero Section */}
          <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
            <div className="relative z-10">
              <div className="relative">
                {/* Typography using theme text colors */}
                <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary leading-tight">
                  Transform your syllabus into a 
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-prodigy-purple to-prodigy-light-purple bg-clip-text text-transparent"> personalized</span>
                    <FloatingShape type="star" color="prodigy-light-blue" top="-15px" right="-25px" size="xs" />
                  </span> 
                  study plan
                </h1>
              </div>
              
              <p className="mt-6 text-lg text-text-body leading-relaxed">
                CourseAgenda helps students automatically organize their academic schedules, turning syllabi into structured study plans with calendar integration.
              </p>
              
              <div className="mt-12">
                {/* Button using btn-primary class */}
                <a 
                  href="/api/auth/test" 
                  className="btn-primary" // Applied btn-primary
                >
                  Log in with Replit
                  <ArrowRight className="ml-2 h-5 w-5" /> {/* Use ArrowRight from lucide */}
                </a>
              </div>
              
              {/* Social proof - using theme colors and borders */}
              <div className="mt-12 inline-flex items-center space-x-2 bg-background/80 backdrop-blur-sm py-2 px-4 rounded-full shadow-prodigy-sm border border-border">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-8 h-8 rounded-full bg-prodigy-purple text-white flex items-center justify-center text-xs border-2 border-white`}>
                      {['J', 'K', 'M', 'S'][i-1]}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">1,200+</span> students use CourseAgenda
                </span>
              </div>
            </div>
            
            <div className="relative">
              {/* Decorative element with theme color */}
              <div className="absolute w-72 h-72 bg-prodigy-purple/10 rounded-full filter blur-3xl top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 z-0"></div>
              
              {/* Image container with prodigy shadow and border radius */}
              <div className="rounded-2xl overflow-hidden shadow-prodigy-lg transform rotate-1 relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop"
                  alt="Lecture hall"
                  className="w-full h-auto object-cover" // Removed rounded-2xl from img, parent has it
                />
              </div>
              
              {/* Floating badges - styled as prodigy-cards (conceptually) */}
              <div className="prodigy-card absolute bottom-4 right-4 p-4 max-w-[220px] flex items-start transform -rotate-1 z-20"> {/* Applied prodigy-card concept */}
                <Clock className="h-5 w-5 text-prodigy-yellow mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm text-text-primary">Save time</h3>
                  <p className="text-xs text-text-secondary">Upload once, organize instantly</p>
                </div>
              </div>
              
              <div className="prodigy-card absolute top-8 -left-4 p-4 max-w-[200px] flex items-start transform rotate-2 z-20 bg-prodigy-purple text-white"> {/* Applied prodigy-card concept, added theme colors */}
                <Star className="h-5 w-5 text-prodigy-yellow mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm">AI-Powered</h3>
                  <p className="text-xs text-white/80">Intelligent schedule creation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Section with light background - using theme colors and spacing */}
      <div className="bg-prodigy-light-blue/10 section-spacing relative"> {/* Changed bg, added section-spacing */}
        <FloatingShape type="star" color="prodigy-purple" top="15%" right="10%" size="md" />
        <FloatingShape type="circle" color="prodigy-yellow" bottom="10%" left="5%" size="lg" /> {/* Changed color */}
        <FloatingShape type="triangle" color="prodigy-purple" top="40%" left="20%" size="md" rotate="180deg" opacity={0.3} />
        <FloatingShape type="plus" color="prodigy-yellow" bottom="20%" right="15%" size="sm" opacity={0.6} /> {/* Changed color */}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl font-bold text-center text-text-primary mb-16">
            <span className="relative inline-block">
              Streamline
              <FloatingShape type="star" color="prodigy-yellow" top="-15px" right="-20px" size="xs" /> {/* Changed color */}
            </span> Your Academic Life
          </h2>
          
          {/* Feature section - using prodigy-card styling */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="prodigy-card p-8 relative overflow-hidden"> {/* Applied prodigy-card */}
              <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 w-24 h-24 bg-prodigy-purple/5 rounded-full"></div>
              <div className="h-14 w-14 bg-prodigy-purple/10 rounded-full flex items-center justify-center mb-6 relative z-10">
                <FileText className="h-7 w-7 text-prodigy-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-primary">Upload Syllabus</h3>
              <p className="text-text-secondary leading-relaxed">Upload your course syllabus in PDF format for automatic analysis with our AI system.</p>
            </div>
            
            {/* Card 2 - Highlighted card (feature-card) */}
            <div className="feature-card p-8 relative overflow-hidden"> {/* Applied feature-card */}
              {/* Removed redundant bg color, text color, rounded-xl, shadow as they come from feature-card class */}
              <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center mb-6 relative z-10">
                <LayoutGrid className="h-7 w-7 text-white" /> {/* text-white is fine on feature-card */}
              </div>
              <h3 className="text-xl font-semibold mb-3">Generate Plan</h3> {/* text-white from feature-card */}
              <p className="text-white/90 leading-relaxed">Our AI analyzes your syllabus to create a personalized study schedule optimized for your success.</p>
            </div>
            
            {/* Card 3 */}
            <div className="prodigy-card p-8 relative overflow-hidden"> {/* Applied prodigy-card */}
              <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 w-24 h-24 bg-prodigy-purple/5 rounded-full"></div>
              <div className="h-14 w-14 bg-prodigy-purple/10 rounded-full flex items-center justify-center mb-6 relative z-10">
                <Calendar className="h-7 w-7 text-prodigy-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-primary">Sync Calendar</h3>
              <p className="text-text-secondary leading-relaxed">Integrate your study plan with Google Calendar, Apple Calendar, or other services.</p>
            </div>
          </div>
          
          {/* Additional features section - using prodigy-card styling */}
          <div className="mt-20 prodigy-card p-8 relative overflow-hidden"> {/* Applied prodigy-card */}
            <FloatingShape type="donut" color="prodigy-yellow" top="-20px" right="-20px" size="md" /> {/* Changed color */}
            <FloatingShape type="plus" color="prodigy-purple" bottom="-15px" left="10%" size="sm" opacity={0.4} />
            
            <h3 className="text-2xl font-bold mb-8 text-text-primary">Why students love CourseAgenda</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Item 1 */}
              <div className="flex items-start p-4 hover:bg-prodigy-purple/5 rounded-xl transition-colors group">
                <div className="h-10 w-10 bg-prodigy-yellow rounded-full flex items-center justify-center flex-shrink-0 mr-4 shadow-prodigy-sm transform group-hover:scale-110 transition-transform">
                  <span className="font-bold text-text-primary">1</span> {/* Text color for number on yellow bg */}
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">Time Saving</h4>
                  <p className="text-text-secondary mt-1">Automatically extract important dates and deadlines from your syllabus.</p>
                </div>
              </div>
              
              {/* Item 2 */}
              <div className="flex items-start p-4 hover:bg-prodigy-purple/5 rounded-xl transition-colors group">
                <div className="h-10 w-10 bg-prodigy-yellow rounded-full flex items-center justify-center flex-shrink-0 mr-4 shadow-prodigy-sm transform group-hover:scale-110 transition-transform">
                  <span className="font-bold text-text-primary">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">AI-Powered</h4>
                  <p className="text-text-secondary mt-1">Smart algorithm creates optimal study schedules based on your course load.</p>
                </div>
              </div>
              
              {/* Item 3 */}
              <div className="flex items-start p-4 hover:bg-prodigy-purple/5 rounded-xl transition-colors group">
                <div className="h-10 w-10 bg-prodigy-yellow rounded-full flex items-center justify-center flex-shrink-0 mr-4 shadow-prodigy-sm transform group-hover:scale-110 transition-transform">
                  <span className="font-bold text-text-primary">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">Easy Integration</h4>
                  <p className="text-text-secondary mt-1">Connect with your favorite calendar apps with just a few clicks.</p>
                </div>
              </div>
            </div>
            
            {/* CTA Banner - using theme colors and button style */}
            <div className="mt-12 bg-gradient-to-r from-prodigy-purple to-prodigy-light-purple rounded-xl p-8 text-white relative overflow-hidden shadow-prodigy-md"> {/* Added shadow */}
              <FloatingShape type="circle" color="prodigy-light-yellow" top="20%" right="5%" size="sm" opacity={0.2} /> {/* Changed color */}
              <FloatingShape type="donut" color="prodigy-light-yellow" bottom="20%" left="10%" size="sm" opacity={0.2} /> {/* Changed color */}
              
              <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-2">
                  <h3 className="text-xl font-bold mb-2">Ready to transform your study experience?</h3>
                  <p className="text-white/80">Join thousands of students using CourseAgenda to stay organized and achieve better results.</p>
                </div>
                <div className="flex justify-center md:justify-end">
                  {/* Button using btn-secondary concept (white bg on dark, purple text) */}
                  <a 
                    href="/api/auth/test" 
                    className="btn-secondary bg-white text-prodigy-purple hover:bg-prodigy-light-purple/10" // Applied btn-secondary and overrode colors for this context
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
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