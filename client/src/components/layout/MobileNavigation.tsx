import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import { 
  Menu, 
  CalendarRange, 
  Home, 
  BookOpen, 
  Upload, 
  UserCircle, 
  LogOut, 
  LogIn 
} from "lucide-react";

const MobileNavigation = () => {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { isMobile } = useMobile();
  const { user, isAuthenticated, loginWithGoogle, logout } = useAuth();
  
  // Only display on mobile
  if (!isMobile) {
    return null;
  }
  
  const handleNavItemClick = () => {
    setOpen(false); // Close menu when navigation item is clicked
  };
  
  const handleLogout = () => {
    logout();
    setOpen(false);
  };
  
  const navItems = [
    { href: "/", label: "Home", icon: <Home className="mr-2 h-4 w-4" /> },
    { href: "/courses", label: "My Courses", icon: <BookOpen className="mr-2 h-4 w-4" /> },
    { href: "/upload", label: "Upload Syllabus", icon: <Upload className="mr-2 h-4 w-4" /> },
  ];
  
  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between px-4 h-16 border-b">
        <Link href="/" className="flex items-center space-x-2">
          <CalendarRange className="h-6 w-6" />
          <span className="font-bold text-lg">StudyPlanner</span>
        </Link>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <div className="py-6">
              <div className="flex items-center mb-6">
                <CalendarRange className="h-6 w-6 mr-2" />
                <span className="font-bold text-lg">StudyPlanner</span>
              </div>
              
              {isAuthenticated && (
                <div className="mb-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.profileImage} alt={user?.name || user?.username} />
                      <AvatarFallback>{getInitials(user?.name || user?.username || "")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user?.name || user?.username}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={location === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={handleNavItemClick}
                    asChild
                  >
                    <Link href={item.href}>
                      {item.icon}
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </nav>
            </div>
            
            <Separator className="my-4" />
            
            <div className="mt-auto">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start mb-2"
                    onClick={handleNavItemClick}
                    asChild
                  >
                    <Link href="/profile">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-500" 
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </>
              ) : (
                <Button 
                  variant="default" 
                  className="w-full" 
                  onClick={() => { 
                    loginWithGoogle();
                    setOpen(false);
                  }}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in with Google
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileNavigation;