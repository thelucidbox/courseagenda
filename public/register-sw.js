/**
 * Service Worker Registration for CourseAgenda PWA
 */

// Check if service workers are supported by the browser
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('PWA: Service Worker registered successfully:', registration.scope);
        
        // Check for updates to the service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('PWA: New service worker installing...');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // There's a new service worker available, show update notification
              console.log('PWA: New service worker installed, update available');
              showUpdateNotification();
            }
          });
        });
      })
      .catch(error => {
        console.warn('PWA: Service Worker registration not completed:', error);
      });
  });
  
  // Listen for controlling service worker changes (update activated)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('PWA: New service worker activated, reloading for updates');
      window.location.reload();
    }
  });
}

// Function to show update notification
function showUpdateNotification() {
  const updateNotification = document.createElement('div');
  updateNotification.className = 'update-notification';
  updateNotification.innerHTML = `
    <div class="update-content">
      <p><strong>Update Available!</strong> Refresh to get the latest version.</p>
      <div class="update-actions">
        <button id="update-now">Update Now</button>
        <button id="update-later">Later</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(updateNotification);
  
  // Set up styles for the notification
  updateNotification.style.position = 'fixed';
  updateNotification.style.bottom = '20px';
  updateNotification.style.left = '50%';
  updateNotification.style.transform = 'translateX(-50%)';
  updateNotification.style.backgroundColor = '#4f46e5';
  updateNotification.style.color = 'white';
  updateNotification.style.padding = '12px 20px';
  updateNotification.style.borderRadius = '8px';
  updateNotification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  updateNotification.style.zIndex = '9999';
  updateNotification.style.maxWidth = '90%';
  updateNotification.style.width = '400px';
  updateNotification.style.display = 'flex';
  updateNotification.style.justifyContent = 'space-between';
  updateNotification.style.alignItems = 'center';
  
  // Handle button clicks
  document.getElementById('update-now').addEventListener('click', () => {
    window.location.reload();
  });
  
  document.getElementById('update-later').addEventListener('click', () => {
    updateNotification.remove();
  });
}

// Check if the app is being launched from the homescreen (in standalone mode)
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('PWA: Running in standalone mode (installed as PWA)');
  // Here we could enhance the UI for installed PWA mode
  
  // Track PWA usage in analytics
  if (typeof gtag === 'function') {
    gtag('event', 'pwa_launch', {
      'app_mode': 'standalone'
    });
  }
}

// Listen for app install event (for analytics)
window.addEventListener('appinstalled', () => {
  console.log('PWA: App was installed to device');
  
  // Track successful installation in analytics
  if (typeof gtag === 'function') {
    gtag('event', 'pwa_installed');
  }
  
  // Hide any install prompts after installation
  const pwaNotification = document.getElementById('pwa-notification');
  if (pwaNotification) {
    pwaNotification.style.display = 'none';
  }
});