import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/MainLayout";
import Home from "@/pages/Home";
import UploadSyllabus from "@/pages/UploadSyllabus";
import ExtractInfo from "@/pages/ExtractInfo";
import CreateStudyPlan from "@/pages/CreateStudyPlan";
import Courses from "@/pages/Courses";
import CalendarIntegration from "@/pages/CalendarIntegration";
import Profile from "@/pages/Profile";
// Import directly using relative path instead of alias to fix the module resolution
import CalendarPermissions from "./pages/CalendarPermissions";
import CalendarSuccess from "./pages/CalendarSuccess";
import CalendarError from "./pages/CalendarError";
import { ThemeProvider } from "./components/ThemeProvider";

function Router() {
  const [location] = useLocation();

  // Auto-scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/upload" component={UploadSyllabus} />
      <Route path="/calendar-permissions/:id?" component={CalendarPermissions} />
      <Route path="/extract/:id" component={ExtractInfo} />
      <Route path="/create-plan/:id" component={CreateStudyPlan} />
      <Route path="/courses" component={Courses} />
      <Route path="/calendar-integration/:id" component={CalendarIntegration} />
      <Route path="/calendar/success" component={CalendarSuccess} />
      <Route path="/calendar/error" component={CalendarError} />
      <Route path="/profile" component={Profile} />
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
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
