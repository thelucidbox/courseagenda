import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";
import { CalendarRange, LogOut, UserCircle, BookOpen, Home, Upload } from "lucide-react";

const Header = () => {
  const [location] = useLocation();
  const { user, isAuthenticated, loginWithGoogle, logout } = useAuth();
  const { isMobile } = useMobile();

  // Only show the mobile menu toggle on mobile devices
  if (isMobile) {
    return null; // Mobile navigation is handled by the MobileNavigation component
  }

  const navItems = [
    { href: "/", label: "Home", icon: <Home className="mr-2 h-4 w-4" /> },
    { href: "/courses", label: "My Courses", icon: <BookOpen className="mr-2 h-4 w-4" /> },
    { href: "/upload", label: "Upload Syllabus", icon: <Upload className="mr-2 h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 mx-auto">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <CalendarRange className="h-6 w-6" />
            <span className="font-bold text-lg md:inline-block">StudyPlanner</span>
          </Link>
        </div>
        
        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6 hidden md:flex">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={location === item.href ? "secondary" : "ghost"}
              className="text-sm font-medium transition-colors"
              asChild
            >
              <Link href={item.href}>
                {item.icon}
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
        
        <div className="flex-1 flex justify-end items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={user?.profileImage} 
                      alt={user?.name || user?.username} 
                    />
                    <AvatarFallback>{getInitials(user?.name || user?.username || "")}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || user?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={loginWithGoogle}>
              Sign in with Google
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;