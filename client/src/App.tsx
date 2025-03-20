import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, lazy, Suspense } from "react";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import UploadSyllabus from "@/pages/UploadSyllabus";
import ExtractInfo from "@/pages/ExtractInfo";
import CreateStudyPlan from "@/pages/CreateStudyPlan";
import Courses from "@/pages/Courses";
import CalendarIntegration from "@/pages/CalendarIntegration";
import Profile from "@/pages/Profile";
import NewLanding from "@/pages/NewLanding";
import Admin from "@/pages/Admin";
// Import directly using relative path instead of alias to fix the module resolution
import CalendarPermissions from "./pages/CalendarPermissions";
import CalendarSuccess from "./pages/CalendarSuccess";
import CalendarError from "./pages/CalendarError";
import { ThemeProvider } from "./components/ThemeProvider";
import { useReplitAuth } from "@/hooks/use-replit-auth";

// Lazy load the PWA install prompt component for better performance
const PWAInstallPrompt = lazy(() => import('@/components/PWAInstallPrompt'));

function Router() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useReplitAuth();

  // Redirect authenticated users from root to dashboard
  useEffect(() => {
    if (isAuthenticated && location === '/') {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, location, setLocation]);

  // Auto-scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  // Show a simple loading state
  if (isLoading && location !== '/') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }
  
  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? Dashboard : NewLanding} />
      <Route path="/dashboard" component={isAuthenticated ? Dashboard : NewLanding} />
      <Route path="/upload" component={isAuthenticated ? UploadSyllabus : NewLanding} />
      <Route path="/calendar-permissions/:id?" component={isAuthenticated ? CalendarPermissions : NewLanding} />
      <Route path="/extract/:id" component={isAuthenticated ? ExtractInfo : NewLanding} />
      <Route path="/create-plan/:id" component={isAuthenticated ? CreateStudyPlan : NewLanding} />
      <Route path="/courses" component={isAuthenticated ? Courses : NewLanding} />
      <Route path="/calendar-integration/:id" component={isAuthenticated ? CalendarIntegration : NewLanding} />
      <Route path="/calendar/success" component={isAuthenticated ? CalendarSuccess : NewLanding} />
      <Route path="/calendar/error" component={isAuthenticated ? CalendarError : NewLanding} />
      <Route path="/profile" component={isAuthenticated ? Profile : NewLanding} />
      <Route path="/admin" component={isAuthenticated ? Admin : NewLanding} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Apply dark mode on initial load
  useEffect(() => {
    const root = window.document.documentElement;
    const savedTheme = localStorage.getItem("theme") || "dark";
    root.classList.add(savedTheme);
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <MainLayout>
          <Router />
        </MainLayout>
        <Toaster />
        
        {/* PWA Install Prompt - Lazy loaded with Suspense to improve initial load performance */}
        <Suspense fallback={null}>
          <PWAInstallPrompt />
        </Suspense>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
