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
    <div className="bg-white border-b border-gray-100 relative">
      {/* Decorative floating shapes */}
      <FloatingShape type="circle" color="purple" top="15px" left="5%" size="sm" />
      <FloatingShape type="star" color="accent" bottom="15px" right="12%" size="sm" />
      <FloatingShape type="plus" color="purple" top="50%" right="25%" size="sm" opacity={0.4} />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex h-16 justify-between items-center">
          {/* Logo and desktop navigation */}
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer group">
                  <div className="w-10 h-10 flex items-center justify-center mr-3 bg-[#7209B7] rounded-xl shadow-md transform group-hover:scale-105 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 5H7C5.89543 5 5 5.89543 5 7V17C5 18.1046 5.89543 19 7 19H17C18.1046 19 19 18.1046 19 17V7C19 5.89543 18.1046 5 17 5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 9H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#7209B7] transition-colors">
                    CourseAgenda
                  </span>
                </div>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium transition-all rounded-full
                      ${item.current
                        ? "text-[#7209B7] font-semibold bg-[#7209B7]/5"
                        : "text-[#666666] hover:text-[#7209B7] hover:bg-[#7209B7]/5"
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
                    <Button variant="ghost" className="rounded-full p-0 w-10 h-10 hover:bg-[#7209B7]/10">
                      <Avatar className="h-9 w-9 border-2 border-[#7209B7]/20">
                        <AvatarImage src={user?.profileImage} />
                        <AvatarFallback className="bg-[#7209B7] text-white font-medium">
                          {user?.name ? getInitials(user.name) : user?.username?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl border-gray-100 shadow-xl">
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                        {user?.name || user?.username}
                      </p>
                      <p className="text-xs text-[#666666] truncate mt-1">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-100" />
                    <DropdownMenuItem asChild className="focus:bg-[#7209B7]/5 focus:text-[#7209B7]">
                      <Link href="/profile">
                        <a className="flex cursor-pointer items-center py-2">
                          <User className="mr-3 h-4 w-4" />
                          <span>Profile</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-[#7209B7]/5 focus:text-[#7209B7]">
                      <Link href="/calendar">
                        <a className="flex cursor-pointer items-center py-2">
                          <Calendar className="mr-3 h-4 w-4" />
                          <span>Calendar</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-[#7209B7]/5 focus:text-[#7209B7]">
                      <Link href="/settings">
                        <a className="flex cursor-pointer items-center py-2">
                          <Settings className="mr-3 h-4 w-4" />
                          <span>Settings</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-100" />
                    <DropdownMenuItem asChild className="focus:bg-red-50">
                      <a href="/api/auth/logout" className="flex cursor-pointer items-center text-red-600 py-2">
                        <LogOut className="mr-3 h-4 w-4" />
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
                  className="bg-[#7209B7] hover:bg-[#7209B7]/90 text-white px-6 py-2.5 rounded-full font-medium transform hover:scale-105 transition-transform"
                >
                  <a href="/api/auth/test">
                    Log in with Replit
                  </a>
                </Button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden ml-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full p-2 text-[#666666] hover:bg-[#7209B7]/10 hover:text-[#7209B7]"
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
        <div className="sm:hidden bg-white border-b border-gray-100">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={`block py-2 pl-5 pr-4 text-base font-medium transition-colors ${
                    item.current
                      ? "bg-[#7209B7]/10 text-[#7209B7] border-l-4 border-[#7209B7]"
                      : "text-[#666666] hover:text-[#7209B7] hover:bg-[#7209B7]/5"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              </Link>
            ))}
          </div>
          {isAuthenticated && (
            <div className="border-t border-gray-100 pb-3 pt-4">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <Avatar className="h-10 w-10 border-2 border-[#7209B7]/20">
                    <AvatarImage src={user?.profileImage} />
                    <AvatarFallback className="bg-[#7209B7] text-white font-medium">
                      {user?.name ? getInitials(user.name) : user?.username?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-[#1A1A1A]">{user?.name || user?.username}</div>
                  <div className="text-sm text-[#666666]">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link href="/profile">
                  <a
                    className="block px-5 py-2 text-base font-medium text-[#666666] hover:text-[#7209B7] hover:bg-[#7209B7]/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </a>
                </Link>
                <Link href="/calendar">
                  <a
                    className="block px-5 py-2 text-base font-medium text-[#666666] hover:text-[#7209B7] hover:bg-[#7209B7]/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Calendar
                  </a>
                </Link>
                <Link href="/settings">
                  <a
                    className="block px-5 py-2 text-base font-medium text-[#666666] hover:text-[#7209B7] hover:bg-[#7209B7]/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </a>
                </Link>
                <a
                  href="/api/auth/logout"
                  className="block px-5 py-2 text-base font-medium text-red-600 hover:bg-red-50"
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