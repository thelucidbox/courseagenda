// Service Worker Registration Script
(() => {
  // Only register service worker in production or when supported
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
          
          // Check for updates on page refresh
          registration.update();
          
          // Handle new service worker installation
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('Service Worker update found, installing...');
            
            // Listen for the new service worker's state changes
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show notification to the user
                console.log('New Service Worker installed, content is available');
                showUpdateNotification();
              }
            });
          });
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
      
      // Detect controller change when new service worker activates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New Service Worker controller activated');
      });
    });
    
    // Setup iOS PWA install banner logic
    const isIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    };
    
    const isInStandaloneMode = () => {
      return window.matchMedia('(display-mode: standalone)').matches || 
             window.navigator.standalone === true;
    };
    
    // Handle the iOS-specific installation banner
    window.addEventListener('load', () => {
      if (isIOS() && !isInStandaloneMode() && !localStorage.getItem('iosInstallPromptShown')) {
        const iosMessage = document.getElementById('ios-install-message');
        if (iosMessage) {
          iosMessage.style.display = 'block';
          localStorage.setItem('iosInstallPromptShown', 'true');
        }
      }
    });
  }
  
  // Function to show update notification
  function showUpdateNotification() {
    // Create a banner or use an existing element to notify the user
    // For now we'll just log to console, but in a real app you'd show UI
    console.log('New version available! Refresh the page to update.');
    
    // You could also show a toast notification here
    if (window.confirm('A new version of the app is available. Reload now to update?')) {
      window.location.reload();
    }
  }
})();