// popup.js
// Narrative Lens - Browser Extension Popup with Real-Time Status

let workerReady = false;

document.addEventListener('DOMContentLoaded', () => {
  const analyzePageBtn = document.getElementById('analyzePageBtn');
  const optionsBtn = document.getElementById('optionsBtn');
  const statusEl = document.getElementById('status');

  // Check worker status on popup open
  checkWorkerStatus();

  // Listen for worker status updates
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'workerStatus') {
      updateStatus(message.message, 'loading', message.progress);
    }

    if (message.type === 'workerReady') {
      workerReady = true;
      statusEl.textContent = '✓ Ready to analyze';
      statusEl.className = 'status ready';
    }
  });

  // Analyze entire page
  analyzePageBtn.addEventListener('click', async () => {
    if (!workerReady) {
      statusEl.textContent = '⏳ Model is still loading... please wait';
      statusEl.className = 'status loading';
      return;
    }

    statusEl.textContent = '⏳ Analyzing page...';
    statusEl.className = 'status loading';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Send message to content script to analyze page
      chrome.tabs.sendMessage(tab.id, {
        type: 'analyzePage'
      }, (response) => {
        if (chrome.runtime.lastError) {
          statusEl.textContent = '✗ Error: Content script not loaded. Try refreshing the page.';
          statusEl.className = 'status error';
          return;
        }

        if (response && response.success) {
          statusEl.textContent = '✓ Analysis complete!';
          statusEl.className = 'status ready';

          // Show results in a new view
          displayResults(response.analysis);
        } else {
          statusEl.textContent = '✗ Analysis failed: ' + (response?.error || 'Unknown error');
          statusEl.className = 'status error';
        }
      });
    } catch (error) {
      console.error('Analysis error:', error);
      statusEl.textContent = '✗ Error: ' + error.message;
      statusEl.className = 'status error';
    }
  });

  // Open options page
  optionsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  });
});

// Check if worker is ready
async function checkWorkerStatus() {
  const statusEl = document.getElementById('status');

  chrome.runtime.sendMessage({ type: 'checkWorkerStatus' }, (response) => {
    if (response && response.ready) {
      workerReady = true;
      statusEl.textContent = '✓ Ready to analyze';
      statusEl.className = 'status ready';
    } else {
      workerReady = false;
      statusEl.textContent = '⏳ Loading model (~80MB)...';
      statusEl.className = 'status loading';

      // Add a progress element
      const progressBar = document.createElement('div');
      progressBar.style.cssText = 'width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 8px; overflow: hidden;';
      progressBar.innerHTML = '<div id="progress-fill" style="height: 100%; width: 0%; background: linear-gradient(90deg, #00f5ff, #ff00ff); transition: width 0.3s;"></div>';
      statusEl.appendChild(progressBar);

      // Re-check status every second
      const interval = setInterval(() => {
        chrome.runtime.sendMessage({ type: 'checkWorkerStatus' }, (response) => {
          if (response && response.ready) {
            workerReady = true;
            statusEl.innerHTML = '✓ Ready to analyze';
            statusEl.className = 'status ready';
            clearInterval(interval);
          }
        });
      }, 1000);
    }
  });
}

// Update status with message and progress
function updateStatus(message, state = 'loading', progress = null) {
  const statusEl = document.getElementById('status');
  statusEl.className = `status ${state}`;
  statusEl.textContent = message;

  if (progress !== null && progress !== undefined) {
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
  }
}

// Display classification results
function displayResults(analysis) {
  if (!analysis) return;

  const resultsHTML = `
    <div style="margin-top: 16px; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
      <div style="font-size: 1.5rem; color: #ff00ff; margin-bottom: 8px;">
        ${analysis.label}
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem;">
        <div>
          <span style="color: #888;">Coherence:</span>
          <span style="color: ${analysis.cohomologyClass === 0 ? '#00ff88' : '#ffaa00'}">
            ${analysis.cohomologyClass === 0 ? '✓ Consistent' : '⚠ Tensions'}
          </span>
        </div>
        <div>
          <span style="color: #888;">Confidence:</span>
          <span style="color: #00f5ff;">
            ${(analysis.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      ${analysis.trajectory ? `
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.8rem;">
          <strong>Narrative Evolution:</strong><br>
          <span style="color: #888;">
            ${analysis.trajectory.trajectories[0].result.finalLabel}
          </span>
        </div>
      ` : ''}
    </div>
  `;

  // Insert results below status
  const statusEl = document.getElementById('status');
  const existingResults = document.getElementById('results-container');
  if (existingResults) {
    existingResults.remove();
  }

  const resultsDiv = document.createElement('div');
  resultsDiv.id = 'results-container';
  resultsDiv.innerHTML = resultsHTML;
  statusEl.parentNode.insertBefore(resultsDiv, statusEl.nextSibling);
}
