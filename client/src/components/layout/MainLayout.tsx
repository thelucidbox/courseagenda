import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import MobileNavigation from './MobileNavigation';
import { useMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useMobile();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {isMobile && <MobileNavigation />}
      <main className="flex-grow py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
