import { Link, useLocation } from 'wouter';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Header = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" fill="#4f46e5"/>
              <line x1="12" y1="11" x2="12" y2="17" stroke="white" />
              <line x1="9" y1="14" x2="15" y2="14" stroke="white" />
            </svg>
          </div>
          <Link href="/">
            <a className="font-bold text-xl text-gray-900">
              Syllabus<span className="text-primary">Sync</span>
            </a>
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <Link href="/">
            <a className={`${isActive('/') ? 'text-gray-900 font-medium' : 'text-gray-500'} hover:text-primary transition`}>
              Home
            </a>
          </Link>
          <Link href="/courses">
            <a className={`${isActive('/courses') ? 'text-gray-900 font-medium' : 'text-gray-500'} hover:text-primary transition`}>
              My Courses
            </a>
          </Link>
          <Link href="/calendar">
            <a className={`${isActive('/calendar') ? 'text-gray-900 font-medium' : 'text-gray-500'} hover:text-primary transition`}>
              Calendar
            </a>
          </Link>
          <Link href="/help">
            <a className={`${isActive('/help') ? 'text-gray-900 font-medium' : 'text-gray-500'} hover:text-primary transition`}>
              Help
            </a>
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
            <Bell className="h-5 w-5" />
          </Button>
          <Avatar>
            <AvatarFallback className="bg-primary-100 text-primary-600">JS</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
