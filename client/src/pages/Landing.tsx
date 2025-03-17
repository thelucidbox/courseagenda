import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { CalendarRange, Clock, ArrowRight, CheckCircle, FileText, Calendar, Star, Users } from 'lucide-react';
import { useReplitAuth } from '@/hooks/use-replit-auth';

const Landing = () => {
  const { login, isAuthenticated } = useReplitAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Star className="h-4 w-4" /> 
                <span>New: AI-powered study planning</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Transform your syllabus into a personalized study plan
              </h1>
              
              <p className="text-xl text-muted-foreground">
                CourseAgenda helps students automatically organize their academic schedules, turning syllabi into structured study plans with calendar integration.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {isAuthenticated ? (
                  <Button size="lg" asChild>
                    <Link href="/upload">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" onClick={login}>
                    Log in with Replit <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2 relative">
              <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-1">
                <div className="bg-card rounded-xl shadow-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=1074&auto=format&fit=crop" 
                    alt="Student using CourseAgenda" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-background rounded-xl shadow-lg p-4 border">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Save time</p>
                    <p className="text-xs text-muted-foreground">Upload once, organize instantly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section id="features" className="py-20 bg-accent/5">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Streamline Your Academic Life</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              CourseAgenda helps you stay organized and focused throughout the semester
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FileText className="h-8 w-8" />}
              title="Syllabus Analysis"
              description="Upload your syllabus and our AI will automatically extract key dates, assignments, and exams."
            />
            
            <FeatureCard 
              icon={<Calendar className="h-8 w-8" />}
              title="Calendar Integration"
              description="Sync your study plan with Google Calendar, Apple Calendar, or download as an ICS file."
            />
            
            <FeatureCard 
              icon={<Users className="h-8 w-8" />}
              title="Study Recommendations"
              description="Get personalized study session recommendations based on your course schedule."
            />
          </div>
        </div>
      </section>
      
      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started for free and upgrade when you're ready
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="border rounded-xl p-6 bg-card flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-bold">Free</h3>
                <p className="text-muted-foreground mt-2">Perfect for trying out CourseAgenda</p>
              </div>
              
              <div className="mb-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/forever</span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow">
                <PricingItem text="1 syllabus upload" />
                <PricingItem text="Basic study plan" />
                <PricingItem text="Calendar download (ICS)" />
              </ul>
              
              {isAuthenticated ? (
                <Button asChild>
                  <Link href="/upload">Get Started</Link>
                </Button>
              ) : (
                <Button onClick={login}>Log in with Replit</Button>
              )}
            </div>
            
            <div className="border rounded-xl p-6 bg-card relative flex flex-col border-primary">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
              
              <div className="mb-4">
                <h3 className="text-xl font-bold">Annual</h3>
                <p className="text-muted-foreground mt-2">Perfect for students</p>
              </div>
              
              <div className="mb-4">
                <span className="text-4xl font-bold">$5</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow">
                <PricingItem text="Unlimited syllabus uploads" />
                <PricingItem text="Advanced study plans" />
                <PricingItem text="Calendar integration" />
                <PricingItem text="Export options" />
              </ul>
              
              <Button variant="default">
                Subscribe
              </Button>
            </div>
            
            <div className="border rounded-xl p-6 bg-card flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-bold">Lifetime</h3>
                <p className="text-muted-foreground mt-2">Best value for serious students</p>
              </div>
              
              <div className="mb-4">
                <span className="text-4xl font-bold">$50</span>
                <span className="text-muted-foreground">/once</span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow">
                <PricingItem text="Everything in Annual plan" />
                <PricingItem text="Priority support" />
                <PricingItem text="Early access to new features" />
                <PricingItem text="Never pay again" />
              </ul>
              
              <Button variant="outline">
                Buy Lifetime
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 bg-accent/10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start organizing your academic life today
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of students who are saving time and reducing stress with CourseAgenda
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button size="lg" asChild>
                  <Link href="/upload">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" onClick={login}>
                  Log in with Replit <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <CalendarRange className="h-6 w-6" />
              <span className="font-bold text-lg">CourseAgenda</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="#features" className="text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Terms
              </a>
            </div>
            
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} CourseAgenda. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const PricingItem = ({ text }: { text: string }) => {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
      <span>{text}</span>
    </li>
  );
};

export default Landing;