import { Link } from 'wouter';
import { Twitter, Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" fill="#4f46e5"/>
                <line x1="12" y1="11" x2="12" y2="17" stroke="white" />
                <line x1="9" y1="14" x2="15" y2="14" stroke="white" />
              </svg>
            </div>
            <h2 className="font-bold text-lg text-gray-900">
              Syllabus<span className="text-primary">Sync</span>
            </h2>
          </div>
          
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link href="/about" className="text-gray-600 hover:text-primary transition">
              About
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-primary transition">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-primary transition">
              Terms
            </Link>
            <Link href="/help" className="text-gray-600 hover:text-primary transition">
              Help
            </Link>
          </div>
          
          <div className="flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-primary transition">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-600 hover:text-primary transition">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-600 hover:text-primary transition">
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>
        
        <div className="mt-4 text-center md:text-left text-sm text-gray-500">
          &copy; {new Date().getFullYear()} SyllabusSync. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
