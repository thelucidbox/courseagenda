import { Link } from 'wouter';
import { BookOpen, Clock, ArrowRight, CheckCircle, FileText, Calendar, Star, Users, BookMarked, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ProdigyNavbar } from '@/components/ProdigyNavbar'; // Assuming ProdigyNavbar is already standardized
import { FeatureCard, TestimonialCard, ProdigyCard as CustomProdigyCard } from '@/components/ui/prodigy-cards'; // Renamed to avoid conflict
import { Card } from '@/components/ui/card'; // Import standardized Card
import { Button } from '@/components/ui/button'; // Import standardized Button
import { GradientText, FloatingShape, SectionDivider } from '@/components/ui/decorative-elements'; // Assuming these are styled correctly

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-background"> {/* Use bg-background */}
      <ProdigyNavbar />
      
      <section className="section-spacing relative overflow-hidden bg-prodigy-light-blue/10"> {/* Themed background */}
        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2 space-y-6 relative">
              {/* Themed badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-prodigy-purple/10 text-prodigy-purple text-sm font-medium mb-4 shadow-prodigy-sm border border-prodigy-purple/20">
                <Star className="h-4 w-4" /> 
                <span>New: AI-powered study planning</span>
              </div>
              
              <h1 className="font-extrabold text-4xl md:text-5xl tracking-tight text-text-primary"> {/* Themed text */}
                <span className="text-prodigy-purple">Transform Your Syllabus</span> Into A
                <br/>
                Personalized Study Plan
              </h1>
              
              <p className="text-xl text-text-body"> {/* Themed text */}
                CourseAgenda helps students automatically organize their academic schedules, turning syllabi into structured study plans with calendar integration.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {isAuthenticated ? (
                  <Button asChild variant="default" size="default" className="rounded-full">
                    <Link href="/upload">
                      Get Started <ArrowRight className="ml-2 h-4 w-4 inline" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="default" size="default" className="rounded-full">
                    <a href="/api/auth/test">
                      Log in with Replit <ArrowRight className="ml-2 h-4 w-4 inline" />
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" size="default" className="rounded-full">
                  <Link href="#features">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2 relative">
              {/* Themed image card */}
              <Card className="rounded-2xl p-1 overflow-hidden shadow-prodigy-lg">
                <div className="bg-card rounded-xl overflow-hidden relative">
                  <img 
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1470&auto=format&fit=crop"
                    alt="Lecture hall" 
                    className="w-full h-auto"
                  />
                </div>
              </Card>
              
              {/* Themed floating card */}
              <Card className="absolute -bottom-6 -right-6 p-4 max-w-[240px]"> {/* Adjusted max-width for content */}
                <div className="flex items-center gap-3">
                  <div className="bg-prodigy-light-purple/20 rounded-full p-2">
                    <Clock className="h-5 w-5 text-prodigy-purple" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">Save time</p>
                    <p className="text-xs text-text-secondary">Upload once, organize instantly</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Background decorations - using theme color names for consistency */}
        <div className="absolute top-0 right-0 opacity-10 w-1/3 h-1/3 bg-prodigy-yellow rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 opacity-10 w-1/2 h-1/2 bg-prodigy-purple rounded-full blur-3xl"></div>
      </section>
      
      <SectionDivider />
      
      <section id="features" className="section-spacing bg-prodigy-light-blue/10 relative">
        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-bold mb-4 text-text-primary"> {/* Use theme text color */}
              <GradientText>Streamline Your Academic Life</GradientText>
            </h2>
            <p className="text-xl text-text-body max-w-2xl mx-auto">
              CourseAgenda helps you stay organized and focused throughout the semester
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* FeatureCard should be consistent from its definition */}
            <FeatureCard 
              icon={FileText}
              title="Syllabus Analysis"
              description="Upload your syllabus and our AI will automatically extract key dates, assignments, and exams."
              number={1}
            />
            <FeatureCard 
              icon={Calendar}
              title="Calendar Integration"
              description="Sync your study plan with Google Calendar, Apple Calendar, or download as an ICS file."
              number={2}
            />
            <FeatureCard 
              icon={Brain}
              title="Study Recommendations"
              description="Get personalized study session recommendations based on your course schedule."
              number={3}
            />
          </div>
        </div>
        
        <FloatingShape type="circle" color="prodigy-purple" top="20%" right="5%" size="lg" />
        <FloatingShape type="donut" color="prodigy-yellow" bottom="15%" left="10%" />
        <FloatingShape type="triangle" color="prodigy-purple" top="50%" left="15%" size="sm" />
      </section>
      
      <section className="section-spacing relative bg-background"> {/* Use bg-background */}
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="font-bold mb-4 text-text-primary">
              How <GradientText>CourseAgenda</GradientText> Works
            </h2>
            <p className="text-xl text-text-body max-w-2xl mx-auto">
              Our simple 3-step process makes academic planning effortless
            </p>
          </div>
          
          {/* Using standardized Card for "How it Works" steps */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-prodigy-purple rounded-full flex items-center justify-center mx-auto mb-6">
                <BookMarked className="h-8 w-8 text-white" />
              </div>
              <div className="text-prodigy-purple text-3xl font-bold mb-4">Step 1</div>
              <h3 className="text-xl font-bold mb-3 text-text-primary">Upload Your Syllabus</h3>
              <p className="text-text-secondary">Simply upload your course syllabus PDF or paste the text. Our system supports various formats.</p>
            </Card>
            
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-prodigy-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-text-primary" />
              </div>
              <div className="text-prodigy-yellow text-3xl font-bold mb-4">Step 2</div>
              <h3 className="text-xl font-bold mb-3 text-text-primary">AI Analysis</h3>
              <p className="text-text-secondary">Our AI automatically extracts key dates, assignments, exams, and other important course information.</p>
            </Card>
            
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-prodigy-light-purple rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="text-prodigy-light-purple text-3xl font-bold mb-4">Step 3</div>
              <h3 className="text-xl font-bold mb-3 text-text-primary">Get Your Study Plan</h3>
              <p className="text-text-secondary">Receive a personalized study plan with recommended study sessions and calendar integration.</p>
            </Card>
          </div>
        </div>
      </section>
      
      <section className="section-spacing bg-prodigy-light-blue/10 relative">
        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-bold mb-4 text-text-primary">
              What <GradientText>Students Say</GradientText>
            </h2>
            <p className="text-xl text-text-body max-w-2xl mx-auto">
              Join thousands of students already using CourseAgenda
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* TestimonialCard is already refactored to use Card */}
            <TestimonialCard
              quote="CourseAgenda saved me so much time! I uploaded all my syllabi and had my entire semester organized in minutes."
              author="Sarah K."
              role="Computer Science Major"
              rating={5}
            />
            <TestimonialCard
              quote="As a double major, keeping track of assignments was overwhelming. This tool has been a lifesaver for my academic planning."
              author="Michael T."
              role="Business & Psychology"
              rating={5}
            />
            <TestimonialCard
              quote="The calendar integration feature works perfectly with my Google Calendar. Now I never miss an assignment deadline."
              author="Jessica R."
              role="Engineering Student"
              rating={4}
            />
          </div>
        </div>
        
        <FloatingShape type="plus" color="prodigy-yellow" top="20%" left="5%" />
        <FloatingShape type="square" color="prodigy-purple" bottom="15%" right="10%" size="sm" />
      </section>
      
      <section id="pricing" className="section-spacing relative bg-background"> {/* Use bg-background */}
        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-bold mb-4 text-text-primary">
              Simple, <GradientText>Transparent</GradientText> Pricing
            </h2>
            <p className="text-xl text-text-body max-w-2xl mx-auto">
              Get started for free and upgrade when you're ready
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Pricing cards using standardized Card and Button */}
            <Card className="p-8 flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-text-primary">Free</h3>
                <p className="text-text-secondary mt-2">Perfect for trying out CourseAgenda</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-text-primary">$0</span>
                <span className="text-text-secondary">/forever</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <PricingItem text="1 syllabus upload" />
                <PricingItem text="Basic study plan" />
                <PricingItem text="Calendar download (ICS)" />
              </ul>
              {isAuthenticated ? (
                <Button asChild variant="default" className="w-full">
                  <Link href="/upload">Get Started</Link>
                </Button>
              ) : (
                <Button asChild variant="default" className="w-full">
                  <a href="/api/auth/test">Log in with Replit</a>
                </Button>
              )}
            </Card>
            
            <Card className="p-8 relative flex flex-col border-2 border-prodigy-purple shadow-prodigy-lg"> {/* Highlighted card with themed shadow */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-prodigy-purple text-white px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-text-primary">Annual</h3>
                <p className="text-text-secondary mt-2">Perfect for students</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-prodigy-purple">$5</span>
                <span className="text-text-secondary">/year</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <PricingItem text="Unlimited syllabus uploads" />
                <PricingItem text="Advanced study plans" />
                <PricingItem text="Calendar integration" />
                <PricingItem text="Export options" />
              </ul>
              <Button variant="yellow" className="w-full" disabled>Coming Soon</Button>
            </Card>
            
            <Card className="p-8 flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-text-primary">Lifetime</h3>
                <p className="text-text-secondary mt-2">Best value for serious students</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-text-primary">$50</span>
                <span className="text-text-secondary">/once</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <PricingItem text="Everything in Annual plan" />
                <PricingItem text="Priority support" />
                <PricingItem text="Early access to new features" />
                <PricingItem text="Never pay again" />
              </ul>
              <Button variant="secondary" className="w-full" disabled>Coming Soon</Button>
            </Card>
          </div>
        </div>
        
        <FloatingShape type="star" color="prodigy-yellow" top="10%" right="5%" />
        <FloatingShape type="circle" color="prodigy-purple" bottom="15%" left="10%" size="sm" />
      </section>
      
      <section className="py-20 relative overflow-hidden section-spacing"> {/* Added section-spacing for consistency */}
        <div className="absolute inset-0 bg-gradient-to-r from-prodigy-purple to-prodigy-light-purple"></div>
        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Start organizing your academic life today
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of students who are saving time and reducing stress with CourseAgenda
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* CTA Button using themed secondary style variant but with specific padding and hover for this context */}
              {isAuthenticated ? (
                 <Button asChild variant="secondary" size="lg" className="bg-white text-prodigy-purple hover:bg-prodigy-light-blue/20 px-8 py-3">
                  <Link href="/upload">
                    Get Started <ArrowRight className="ml-2 h-4 w-4 inline" />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="secondary" size="lg" className="bg-white text-prodigy-purple hover:bg-prodigy-light-blue/20 px-8 py-3">
                  <a href="/api/auth/test">
                    Log in with Replit <ArrowRight className="ml-2 h-4 w-4 inline" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <FloatingShape type="star" color="prodigy-light-yellow" top="20%" left="5%" /> {/* Changed accent to light-yellow */}
        <FloatingShape type="circle" color="prodigy-light-yellow" top="30%" right="10%" size="md" />
        <FloatingShape type="plus" color="prodigy-light-yellow" bottom="20%" left="15%" size="lg" />
        <FloatingShape type="donut" color="prodigy-light-yellow" bottom="30%" right="5%" />
      </section>
    </div>
  );
};

const PricingItem = ({ text }: { text: string }) => {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle className="h-5 w-5 text-prodigy-purple flex-shrink-0 mt-0.5" />
      <span className="text-text-body">{text}</span>
    </li>
  );
};

export default Landing;