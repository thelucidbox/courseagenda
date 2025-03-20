import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GradientText } from "@/components/ui/decorative-elements";
import { Menu, X, BookOpen, User, Calendar, LogOut, Settings } from "lucide-react";
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
    { name: "Home", href: "/", current: location === "/" },
    { name: "Courses", href: "/courses", current: location === "/courses" },
    { name: "Upload Syllabus", href: "/upload", current: location === "/upload" },
    { name: "My Study Plans", href: "/plans", current: location === "/plans" },
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
    <div className="bg-white border-b border-border/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo and desktop navigation */}
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <div className="w-8 h-8 rounded-md bg-prodigy-purple flex items-center justify-center mr-2">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">
                    <GradientText from="from-prodigy-purple" to="to-prodigy-light-purple">
                      CourseAgenda
                    </GradientText>
                  </span>
                </div>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      item.current
                        ? "border-b-2 border-prodigy-purple text-prodigy-purple"
                        : "text-text-secondary hover:text-prodigy-purple hover:border-b-2 hover:border-prodigy-purple/40"
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
                    <Button variant="ghost" className="rounded-full p-0 w-10 h-10">
                      <Avatar className="h-8 w-8 bg-prodigy-light-purple/20">
                        <AvatarImage src={user?.profileImage} />
                        <AvatarFallback className="bg-prodigy-purple text-white">
                          {user?.name ? getInitials(user.name) : user?.username?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {user?.name || user?.username}
                      </p>
                      <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <a className="flex cursor-pointer items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/calendar">
                        <a className="flex cursor-pointer items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Calendar</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <a className="flex cursor-pointer items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" className="flex cursor-pointer items-center text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  asChild 
                  className="bg-prodigy-purple hover:bg-prodigy-purple/90 text-white"
                >
                  <a href="/api/auth/replit">
                    Log in with Replit
                  </a>
                </Button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden ml-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:bg-prodigy-light-purple/10 hover:text-prodigy-purple"
                aria-expanded="false"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-border/30">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={`block py-2 pl-3 pr-4 text-base font-medium ${
                    item.current
                      ? "bg-prodigy-light-purple/10 text-prodigy-purple border-l-4 border-prodigy-purple"
                      : "text-text-secondary hover:text-prodigy-purple hover:bg-prodigy-light-purple/5"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              </Link>
            ))}
          </div>
          {isAuthenticated && (
            <div className="border-t border-border/30 pb-3 pt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-10 w-10 bg-prodigy-light-purple/20">
                    <AvatarImage src={user?.profileImage} />
                    <AvatarFallback className="bg-prodigy-purple text-white">
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
                    className="block px-4 py-2 text-base font-medium text-text-secondary hover:text-prodigy-purple hover:bg-prodigy-light-purple/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </a>
                </Link>
                <Link href="/calendar">
                  <a
                    className="block px-4 py-2 text-base font-medium text-text-secondary hover:text-prodigy-purple hover:bg-prodigy-light-purple/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Calendar
                  </a>
                </Link>
                <Link href="/settings">
                  <a
                    className="block px-4 py-2 text-base font-medium text-text-secondary hover:text-prodigy-purple hover:bg-prodigy-light-purple/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </a>
                </Link>
                <a
                  href="/api/logout"
                  className="block px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50"
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