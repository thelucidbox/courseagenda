import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FloatingShape } from "@/components/ui/floating-shapes";
import { Menu, X, User, Calendar, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProdigyNavbar() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/", current: location === "/" || location === "/dashboard", icon: "home" },
    { name: "My Courses", href: "/courses", current: location === "/courses", icon: "book-open" },
    { name: "Upload Syllabus", href: "/upload", current: location === "/upload", icon: "upload" },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-card border-b border-border relative"> {/* Updated background and border */}
      {/* Decorative floating shapes - using theme color names */}
      <FloatingShape type="circle" color="prodigy-purple" top="15px" left="5%" size="sm" />
      <FloatingShape type="star" color="prodigy-light-blue" bottom="15px" right="12%" size="sm" /> {/* Assuming accent means prodigy-light-blue */}
      <FloatingShape type="plus" color="prodigy-purple" top="50%" right="25%" size="sm" opacity={0.4} />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex h-16 justify-between items-center">
          {/* Logo and desktop navigation */}
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer group">
                  {/* Updated logo container with theme colors and shadows */}
                  <div className="w-10 h-10 flex items-center justify-center mr-3 bg-prodigy-purple rounded-xl shadow-prodigy-sm transform group-hover:scale-105 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 5H7C5.89543 5 5 5.89543 5 7V17C5 18.1046 5.89543 19 7 19H17C18.1046 19 19 18.1046 19 17V7C19 5.89543 18.1046 5 17 5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 9H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {/* Updated logo text with theme colors */}
                  <span className="text-xl font-bold text-text-primary group-hover:text-prodigy-purple transition-colors">
                    CourseAgenda
                  </span>
                </div>
              </Link>
            </div>
            
            {/* Desktop navigation - updated with theme colors */}
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium transition-all rounded-full
                      ${item.current
                        ? "text-prodigy-purple font-semibold bg-prodigy-purple/10" // Use theme color and tint
                        : "text-text-secondary hover:text-prodigy-purple hover:bg-prodigy-purple/10" // Use theme colors and tint
                      }`}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          
          {/* User profile and actions */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {/* Avatar button with theme hover color */}
                    <Button variant="ghost" className="rounded-full p-0 w-10 h-10 hover:bg-prodigy-purple/10">
                      <Avatar className="h-9 w-9 border-2 border-prodigy-purple/20"> {/* Theme border color */}
                        <AvatarImage src={user?.profileImage} />
                        <AvatarFallback className="bg-prodigy-purple text-primary-foreground font-medium"> {/* Theme colors */}
                          {user?.name ? getInitials(user.name) : user?.username?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  {/* Dropdown content with theme border, shadow, and colors */}
                  <DropdownMenuContent align="end" className="w-56 rounded-xl border-border shadow-prodigy-lg bg-card">
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {user?.name || user?.username}
                      </p>
                      <p className="text-xs text-text-secondary truncate mt-1">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-border" /> {/* Theme separator color */}
                    {/* Dropdown items with theme focus colors */}
                    <DropdownMenuItem asChild className="focus:bg-prodigy-purple/10 focus:text-prodigy-purple">
                      <Link href="/profile">
                        <a className="flex cursor-pointer items-center py-2">
                          <User className="mr-3 h-4 w-4" />
                          <span>Profile</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-prodigy-purple/10 focus:text-prodigy-purple">
                      <Link href="/calendar">
                        <a className="flex cursor-pointer items-center py-2">
                          <Calendar className="mr-3 h-4 w-4" />
                          <span>Calendar</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-prodigy-purple/10 focus:text-prodigy-purple">
                      <Link href="/settings">
                        <a className="flex cursor-pointer items-center py-2">
                          <Settings className="mr-3 h-4 w-4" />
                          <span>Settings</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem asChild className="focus:bg-destructive/10 focus:text-destructive-foreground"> {/* Destructive theme focus */}
                      <a href="/api/auth/logout" className="flex cursor-pointer items-center text-destructive py-2">
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>Logout</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Login button using standardized Button component */}
                <Button asChild variant="default" className="rounded-full px-6 py-2.5"> 
                  {/* Kept slightly custom padding and rounded-full for specific navbar look if needed, else remove className for full default */}
                  <a href="/api/auth/test">
                    Log in with Replit
                  </a>
                </Button>
              </div>
            )}
            
            {/* Mobile menu button - using standardized Button component */}
            <div className="flex items-center sm:hidden ml-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-text-secondary hover:bg-prodigy-purple/10 hover:text-prodigy-purple"
                onClick={toggleMobileMenu}
                aria-expanded={mobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - updated with theme colors */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-card border-b border-border">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={`block py-2 pl-5 pr-4 text-base font-medium transition-colors ${
                    item.current
                      ? "bg-prodigy-purple/10 text-prodigy-purple border-l-4 border-prodigy-purple"
                      : "text-text-secondary hover:text-prodigy-purple hover:bg-prodigy-purple/10"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              </Link>
            ))}
          </div>
          {isAuthenticated && (
            <div className="border-t border-border pb-3 pt-4">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <Avatar className="h-10 w-10 border-2 border-prodigy-purple/20">
                    <AvatarImage src={user?.profileImage} />
                    <AvatarFallback className="bg-prodigy-purple text-primary-foreground font-medium">
                      {user?.name ? getInitials(user.name) : user?.username?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-text-primary">{user?.name || user?.username}</div>
                  <div className="text-sm text-text-secondary">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link href="/profile">
                  <a
                    className="block px-5 py-2 text-base font-medium text-text-secondary hover:text-prodigy-purple hover:bg-prodigy-purple/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </a>
                </Link>
                <Link href="/calendar">
                  <a
                    className="block px-5 py-2 text-base font-medium text-text-secondary hover:text-prodigy-purple hover:bg-prodigy-purple/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Calendar
                  </a>
                </Link>
                <Link href="/settings">
                  <a
                    className="block px-5 py-2 text-base font-medium text-text-secondary hover:text-prodigy-purple hover:bg-prodigy-purple/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </a>
                </Link>
                <a
                  href="/api/auth/logout"
                  className="block px-5 py-2 text-base font-medium text-destructive hover:bg-destructive/10" // Destructive theme colors
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Logout
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}