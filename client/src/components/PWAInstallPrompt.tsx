import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Define BeforeInstallPromptEvent interface for TypeScript
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Extend Window interface to add deferredPrompt property
declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent;
  }
}

export const PWAInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Check if app is already installed in standalone mode
  const isAppInstalled = () => 
    window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true;

  // Check if device is iOS
  const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    // If already in standalone mode, don't show install prompts
    if (isAppInstalled()) {
      return;
    }

    // Check if device is iOS (to show special instructions)
    const iosDevice = isIOS();
    setIsIOSDevice(iosDevice);

    // For iOS, check if we should show special instructions
    if (iosDevice) {
      const dismissed = localStorage.getItem('iosInstallDismissed');
      setShowIOSInstructions(!dismissed);
      return;
    }

    // For other devices, listen for beforeinstallprompt event
    const savePrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      
      // Check if user previously dismissed the prompt
      const dismissed = localStorage.getItem('installPromptDismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', savePrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', savePrompt);
    };
  }, []);

  // Handle install button click
  const handleInstall = async () => {
    if (!installPrompt) return;

    // Show installation prompt
    await installPrompt.prompt();
    
    // Get user's choice
    const { outcome } = await installPrompt.userChoice;
    console.log(`PWA installation outcome: ${outcome}`);

    // Clear the prompt and hide the installation notification
    setInstallPrompt(null);
    setShowPrompt(false);
  };

  // Dismiss prompt and remember user's choice
  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  // Dismiss iOS instructions and remember user's choice
  const dismissIOSInstructions = () => {
    setShowIOSInstructions(false);
    localStorage.setItem('iosInstallDismissed', 'true');
  };

  // If nothing to show, render nothing
  if ((!isIOSDevice && !showPrompt) || (isIOSDevice && !showIOSInstructions)) {
    return null;
  }

  // Render different UI based on device type
  return (
    <>
      {/* Standard install prompt for non-iOS devices */}
      {!isIOSDevice && showPrompt && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-primary text-white p-4 rounded-lg shadow-lg z-50 w-[90%] max-w-md">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg">Install CourseAgenda</h3>
              <p className="text-sm">Add to your home screen for the best experience</p>
            </div>
            <button 
              onClick={dismissPrompt}
              className="text-white hover:text-gray-200"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
          <div className="flex justify-end mt-2">
            <Button 
              onClick={handleInstall}
              className="bg-white text-primary hover:bg-gray-100"
            >
              Install Now
            </Button>
          </div>
        </div>
      )}

      {/* iOS specific instructions */}
      {isIOSDevice && showIOSInstructions && (
        <div className="fixed top-0 left-0 right-0 bg-slate-50 text-slate-900 p-3 z-50 border-b border-slate-200">
          <div className="flex justify-between items-start">
            <p className="text-sm">
              To install this app: tap <span className="inline-block mx-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 10h8"/><path d="M12 14V6"/><path d="M9 17H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"/>
                  <path d="M12 17v5"/><path d="m15 19-3-2-3 2"/>
                </svg>
              </span> 
              then <strong>Add to Home Screen</strong>
            </p>
            <button 
              onClick={dismissIOSInstructions}
              className="text-slate-500 hover:text-slate-700" 
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;