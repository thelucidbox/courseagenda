import { Link, useLocation } from 'wouter';
import { Home, BookOpen, Calendar, HelpCircle } from 'lucide-react';

const MobileNavigation = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="md:hidden border-t border-gray-200">
      <div className="flex justify-between px-4 py-3">
        <Link href="/" className={`flex flex-col items-center text-xs ${isActive('/') ? 'text-primary' : 'text-gray-500'}`}>
          <Home className="text-sm mb-1" />
          <span>Home</span>
        </Link>
        <Link href="/courses" className={`flex flex-col items-center text-xs ${isActive('/courses') ? 'text-primary' : 'text-gray-500'}`}>
          <BookOpen className="text-sm mb-1" />
          <span>Courses</span>
        </Link>
        <Link href="/calendar" className={`flex flex-col items-center text-xs ${isActive('/calendar') ? 'text-primary' : 'text-gray-500'}`}>
          <Calendar className="text-sm mb-1" />
          <span>Calendar</span>
        </Link>
        <Link href="/help" className={`flex flex-col items-center text-xs ${isActive('/help') ? 'text-primary' : 'text-gray-500'}`}>
          <HelpCircle className="text-sm mb-1" />
          <span>Help</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNavigation;
