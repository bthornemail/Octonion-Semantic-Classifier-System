// background.js
// Narrative Lens - Background Service Worker with Real Classifier

let worker = null;
let isWorkerReady = false;
let workerInitPromise = null;

// Initialize the transformer worker
function initializeWorker() {
  if (workerInitPromise) return workerInitPromise;

  workerInitPromise = new Promise((resolve, reject) => {
    try {
      // Create worker from the copied transformer-worker.js
      worker = new Worker(chrome.runtime.getURL('worker.js'), { type: 'module' });

      // Handle worker messages
      worker.onmessage = function(e) {
        const { type, message } = e.data;

        if (type === 'ready') {
          isWorkerReady = true;
          console.log('Narrative Lens: Classifier ready', e.data.info);
          resolve(true);

          // Notify all tabs that worker is ready
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              chrome.tabs.sendMessage(tab.id, {
                type: 'workerReady'
              }).catch(() => {}); // Ignore errors for tabs without content script
            });
          });
        }

        if (type === 'status') {
          console.log('Narrative Lens:', message);
          // Broadcast status to popup if open
          chrome.runtime.sendMessage({
            type: 'workerStatus',
            message,
            progress: e.data.progress
          }).catch(() => {}); // Ignore if popup isn't open
        }

        if (type === 'error') {
          console.error('Narrative Lens Worker Error:', message);
          reject(new Error(message));
        }
      };

      worker.onerror = function(error) {
        console.error('Narrative Lens Worker Error:', error);
        reject(error);
      };

      // Worker will auto-initialize and send 'ready' message
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      reject(error);
    }
  });

  return workerInitPromise;
}

// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyzeWithNarrativeLens',
    title: 'Analyze with Narrative Lens',
    contexts: ['selection']
  });

  console.log('Narrative Lens: Extension installed');

  // Initialize worker on install
  initializeWorker();
});

// Initialize worker when extension starts
initializeWorker();

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyzeWithNarrativeLens') {
    if (!isWorkerReady) {
      // Show "loading" notification
      chrome.tabs.sendMessage(tab.id, {
        type: 'showNotification',
        message: 'Model is still loading... please wait'
      });
      return;
    }

    // Send message to content script to analyze selection
    chrome.tabs.sendMessage(tab.id, {
      type: 'analyzeSelection',
      text: info.selectionText,
      position: { x: 100, y: 100 }
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'classify') {
    if (!isWorkerReady) {
      sendResponse({
        error: 'Model not ready yet. Please wait for initialization.',
        loading: true
      });
      return true;
    }

    // Use real classifier
    classifyTextReal(request.text, request.options).then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({
        error: error.message,
        dominant: 4,
        label: 'Heart',
        vector: [0.1, 0.15, 0.12, 0.25, 0.2, 0.1, 0.08],
        confidence: 0,
        cohomologyClass: 0
      });
    });
    return true; // Keep channel open for async response
  }

  if (request.type === 'checkWorkerStatus') {
    sendResponse({ ready: isWorkerReady });
    return true;
  }

  if (request.type === 'setLabels') {
    if (!isWorkerReady) {
      sendResponse({ error: 'Worker not ready' });
      return true;
    }

    worker.postMessage({
      type: 'set-labels',
      data: request.data
    });

    sendResponse({ success: true });
    return true;
  }
});

// Real classification using the transformer worker
async function classifyTextReal(text, options = {}) {
  return new Promise((resolve, reject) => {
    if (!worker || !isWorkerReady) {
      reject(new Error('Worker not initialized'));
      return;
    }

    // Create a unique message ID for tracking
    const messageId = Date.now() + Math.random();

    // Set up one-time listener for this specific classification
    const messageHandler = function(e) {
      const { type, ...data } = e.data;

      if (type === 'classification') {
        // Remove listener
        worker.removeEventListener('message', messageHandler);

        resolve({
          dominant: data.dominant,
          label: data.label,
          vector: data.vector,
          confidence: data.confidence,
          cohomologyClass: data.cohomologyClass,
          zariskiCoverings: data.zariskiCoverings,
          chunksProcessed: data.chunksProcessed,
          trajectory: data.trajectory
        });
      }

      if (type === 'error') {
        worker.removeEventListener('message', messageHandler);
        reject(new Error(data.message));
      }
    };

    worker.addEventListener('message', messageHandler);

    // Send classification request
    worker.postMessage({
      type: 'classify',
      data: {
        text: text,
        options: options || {}
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      worker.removeEventListener('message', messageHandler);
      reject(new Error('Classification timeout'));
    }, 30000);
  });
}

console.log('Narrative Lens: Background script initialized');
