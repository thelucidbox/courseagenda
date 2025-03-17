import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Declaring the global deferredPrompt variable
declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent;
  }
}

export const PWAInstallPrompt = () => {
  const [installable, setInstallable] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  
  // Check if the device is iOS
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  };
  
  // Check if the app is already in standalone mode (installed)
  const isInStandaloneMode = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  };
  
  useEffect(() => {
    // For iOS devices, show the guide if not in standalone mode
    if (isIOS() && !isInStandaloneMode()) {
      setShowIOSGuide(true);
    }
    
    // For other devices, listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      window.deferredPrompt = e as BeforeInstallPromptEvent;
      // Show the install button
      setInstallable(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Listen for app installed event to hide the prompt
    window.addEventListener('appinstalled', () => {
      setInstallable(false);
      window.deferredPrompt = undefined;
    });
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);
  
  const handleInstallClick = async () => {
    if (!window.deferredPrompt) return;
    
    // Show the install prompt
    window.deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await window.deferredPrompt.userChoice;
    
    // Clear the saved prompt since it can't be used again
    window.deferredPrompt = undefined;
    
    // Hide the install button regardless of outcome
    setInstallable(false);
  };
  
  const closeIOSGuide = () => {
    setShowIOSGuide(false);
    // Store in localStorage to avoid showing again in the same session
    localStorage.setItem('iosInstallGuideShown', 'true');
  };
  
  if (!installable && !showIOSGuide) return null;
  
  if (showIOSGuide) {
    // Show iOS installation guide
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-card rounded-lg shadow-lg border p-4 z-50 animate-in fade-in slide-in-from-bottom-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">Install CourseAgenda</h3>
          <Button variant="ghost" size="icon" onClick={closeIOSGuide} className="-mt-1 -mr-1">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          To install CourseAgenda on your iPhone/iPad:
        </p>
        <ol className="text-sm space-y-2 mb-4 list-decimal pl-5">
          <li>Tap the <span className="inline-flex items-center"><svg className="h-4 w-4 mx-1" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg> Share</span> button</li>
          <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
          <li>Tap <strong>"Add"</strong> in the top-right corner</li>
        </ol>
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={closeIOSGuide}>
            Got it
          </Button>
        </div>
      </div>
    );
  }
  
  // Show install button for Android and other platforms
  return (
    <div className="fixed bottom-4 left-4 right-4 bg-card rounded-lg shadow-lg border p-4 z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">Install CourseAgenda</h3>
        <Button variant="ghost" size="icon" onClick={() => setInstallable(false)} className="-mt-1 -mr-1">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Install CourseAgenda on your device for a better experience, offline access, and quick launch from your home screen.
      </p>
      <div className="flex justify-end">
        <Button onClick={handleInstallClick} size="sm" className="flex items-center">
          <Download className="mr-2 h-4 w-4" />
          Install App
        </Button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;