import { ReactNode } from "react";
import Header from "./Header";
import MobileNavigation from "./MobileNavigation";
import Footer from "./Footer";
import { useLocation } from "wouter";
import { useReplitAuth } from "@/hooks/use-replit-auth";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [location] = useLocation();
  const { isAuthenticated } = useReplitAuth();
  
  // Check if we're on the landing page (root path and not authenticated)
  const isLandingPage = location === "/" && !isAuthenticated;
  
  return (
    <div className="flex min-h-screen flex-col">
      {!isLandingPage && <Header />}
      {!isLandingPage && <MobileNavigation />}
      <main className={`flex-1 ${isLandingPage ? 'p-0' : ''}`}>
        {children}
      </main>
      {!isLandingPage && <Footer />}
    </div>
  );
};

export default MainLayout;