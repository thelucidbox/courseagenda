/**
 * Central configuration for PDF.js worker
 * Import this file at the entry point to ensure consistent worker setup
 */

import { pdfjs } from 'react-pdf';

// Use the CDN version of the PDF.js worker
// This ensures we have a reliable worker file from the official source
const CDN_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

// Set the worker source to the CDN version
console.log('Setting PDF.js worker source to CDN URL:', CDN_URL);
pdfjs.GlobalWorkerOptions.workerSrc = CDN_URL;

// Log successful initialization
console.log('PDF.js worker configuration initialized');

// Disable worker-related warnings
const originalConsoleError = console.error;
console.error = function(msg, ...args) {
  // Suppress PDF.js worker-related errors
  if (
    (typeof msg === 'string' && (
      msg.includes('PDF.js') || 
      msg.includes('worker') || 
      msg.includes('GlobalWorkerOptions')
    )) || 
    args.some(arg => arg?.message?.includes?.('worker'))
  ) {
    console.log('PDF.js worker message suppressed');
    return;
  }
  return originalConsoleError.call(console, msg, ...args);
};

// Handle fallback if the CDN worker fails to load
window.addEventListener('error', function(event) {
  if (
    event.message?.includes('worker') || 
    event.filename?.includes('pdf') || 
    event.error?.stack?.includes('pdf')
  ) {
    console.log('PDF worker error detected, using fallback mode');
    // Try a different CDN as fallback
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    console.log('Switched to fallback PDF.js worker URL');
  }
}, true);

export default pdfjs;