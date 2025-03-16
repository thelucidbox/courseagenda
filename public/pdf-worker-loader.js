/**
 * PDF.js Worker Loader
 * 
 * This script ensures that a proper PDF.js worker is loaded from a CDN.
 * It is referenced in the main HTML file and loads before the application.
 */

(function() {
  // Current version of PDF.js in use
  const PDFJS_VERSION = '3.11.174';
  
  // CDN URLs for worker
  const CDN_URLS = [
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js`,
    `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js`,
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`
  ];
  
  // Check if window.pdfjsWorkerSrc is defined (should be referenced by PDF.js)
  let pdfjsWorkerSrc;
  
  // Try to detect the best CDN URL
  function detectBestCDN() {
    // Try to load from each CDN and see which loads fastest
    let promises = CDN_URLS.map((url, index) => {
      return new Promise((resolve) => {
        const startTime = performance.now();
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = () => {
          const loadTime = performance.now() - startTime;
          resolve({ url, loadTime, index });
          // Clean up the test script
          script.remove();
        };
        script.onerror = () => {
          resolve({ url, loadTime: Infinity, index });
          // Clean up the test script
          script.remove();
        };
        document.head.appendChild(script);
      });
    });
    
    // Use the fastest CDN
    Promise.race(promises).then((fastestCDN) => {
      console.log(`PDF Worker: Selected fastest CDN: ${fastestCDN.url}`);
      // Set the worker source for PDF.js to find
      window.pdfjsWorkerSrc = fastestCDN.url;
    });
  }
  
  // Detect if running in development mode and configure accordingly
  const isDevelopment = 
    window.location.hostname === 'localhost' || 
    window.location.hostname.includes('replit.dev');
  
  // Set the worker source
  if (isDevelopment) {
    // In development, use the first CDN directly
    window.pdfjsWorkerSrc = CDN_URLS[0];
    console.log(`PDF Worker: Development mode, using ${CDN_URLS[0]}`);
  } else {
    // In production, test which CDN is fastest
    detectBestCDN();
  }
  
  // Log that the loader has run
  console.log('PDF Worker Loader initialized');
})();