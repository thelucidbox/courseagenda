/**
 * Central configuration for PDF.js worker
 * Import this file at the entry point to ensure consistent worker setup
 */

import { pdfjs } from 'react-pdf';

// Get the correct version that matches what we have installed
// Important: This must match the version we installed with npm
const PDF_VERSION = '3.11.174';

// Use the CDN version of the PDF.js worker
// This ensures we have a reliable worker file from the official source
const CDN_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDF_VERSION}/build/pdf.worker.min.js`;

// Set the worker source to the CDN version
console.log('Setting PDF.js worker source to CDN URL:', CDN_URL);
pdfjs.GlobalWorkerOptions.workerSrc = CDN_URL;

// Log successful initialization
console.log('PDF.js worker configuration initialized');

// Disable worker-related warnings
const originalConsoleError = console.error;
console.error = function(msg, ...args) {
  // Don't suppress errors during development - better to see the actual errors
  return originalConsoleError.call(console, msg, ...args);
};

// Export the correctly configured PDF.js instance
export default pdfjs;