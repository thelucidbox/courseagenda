/**
 * Custom PDF Worker Initialization
 * This file is used as a workaround for PDF.js worker initialization issues
 */

// Simple worker that does minimal processing and allows PDF.js to function
self.onmessage = function(e) {
  const data = e.data;
  
  // Handle messages from the main thread
  if (data.action === 'test') {
    // Respond to test message
    self.postMessage({
      action: 'test',
      result: true
    });
  } else if (data.action === 'init') {
    // Respond to initialization
    self.postMessage({
      action: 'init',
      result: true
    });
  } else {
    // Default echo response for other messages
    self.postMessage({
      action: 'echo',
      data: data
    });
  }
};

// Signal worker is loaded
console.log('PDF Custom Worker loaded');