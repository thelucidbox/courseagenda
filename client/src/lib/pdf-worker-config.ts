/**
 * Central configuration for PDF.js worker
 * Import this file at the entry point to ensure consistent worker setup
 */

import { pdfjs } from 'react-pdf';

// Define a base URL for the worker
const BASE_URL = window.location.origin;

// Set the worker source to our custom worker file
pdfjs.GlobalWorkerOptions.workerSrc = `${BASE_URL}/custom-pdf-worker.js`;

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

// Handle fallback if the worker fails to load
window.addEventListener('error', function(event) {
  if (
    event.message?.includes('worker') || 
    event.filename?.includes('pdf') || 
    event.error?.stack?.includes('pdf')
  ) {
    console.log('PDF worker error detected, using fallback mode');
    pdfjs.GlobalWorkerOptions.workerSrc = '';
  }
}, true);

export default pdfjs;