/**
 * Central configuration for PDF.js worker
 * Import this file at the entry point to ensure consistent worker setup
 */

import { pdfjs } from 'react-pdf';

// Configure PDF.js to use the built-in fake worker
// This bypasses the need for external worker files
pdfjs.GlobalWorkerOptions.workerSrc = '';

// Disable warning messages
console.warn = (function(originalWarn) {
  return function(msg: string, ...args: any[]) {
    // Suppress worker-related warnings
    if (
      msg?.includes('Setting up fake worker') || 
      msg?.includes('worker') ||
      msg?.includes('pdf.worker')
    ) {
      return;
    }
    return originalWarn.call(console, msg, ...args);
  };
})(console.warn);

export default pdfjs;