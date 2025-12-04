// content.js
// Narrative Lens - Content Script
// Runs on every webpage to enable text analysis

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'analyzePage') {
    analyzePageContent().then(analysis => {
      sendResponse({ success: true, analysis });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async response
  }

  if (request.type === 'analyzeSelection') {
    const selectedText = window.getSelection().toString();
    if (selectedText) {
      analyzeText(selectedText).then(analysis => {
        displayAnalysisOverlay(analysis, request.position);
        sendResponse({ success: true, analysis });
      });
    }
    return true;
  }
});

// Analyze full page content
async function analyzePageContent() {
  // Extract main content (simple version - can be improved)
  const mainContent = extractMainContent();

  // Classify using the octonion classifier
  const analysis = await classifyText(mainContent);

  return analysis;
}

// Extract main content from page
function extractMainContent() {
  // Try to find main article content
  const article = document.querySelector('article');
  if (article) return article.innerText;

  const main = document.querySelector('main');
  if (main) return main.innerText;

  // Fallback to body text
  return document.body.innerText.substring(0, 10000);
}

// Display analysis overlay on page
function displayAnalysisOverlay(analysis, position) {
  // Remove existing overlay if any
  const existingOverlay = document.getElementById('narrative-lens-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'narrative-lens-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: ${position?.y || 100}px;
    left: ${position?.x || 100}px;
    background: rgba(10, 10, 10, 0.95);
    border: 1px solid rgba(0, 245, 255, 0.5);
    border-radius: 12px;
    padding: 20px;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 400px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    z-index: 999999;
    backdrop-filter: blur(10px);
  `;

  overlay.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
      <h3 style="margin: 0; color: #00f5ff;">Narrative Analysis</h3>
      <button id="close-overlay" style="background: none; border: none; color: #888; cursor: pointer; font-size: 20px;">&times;</button>
    </div>

    <div style="margin-bottom: 12px;">
      <div style="font-size: 1.5rem; color: #ff00ff; margin-bottom: 8px;">
        ${analysis.label}
      </div>
      <div style="color: #888; font-size: 0.85rem;">
        Dominant semantic framework
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
      <div>
        <div style="color: #888; font-size: 0.75rem; margin-bottom: 4px;">Coherence</div>
        <div style="color: ${analysis.cohomologyClass === 0 ? '#00ff88' : '#ffaa00'}; font-weight: bold;">
          ${analysis.cohomologyClass === 0 ? '✓ Consistent' : '⚠ Contains tensions'}
        </div>
      </div>
      <div>
        <div style="color: #888; font-size: 0.75rem; margin-bottom: 4px;">Confidence</div>
        <div style="color: #00f5ff; font-weight: bold;">
          ${(analysis.confidence * 100).toFixed(1)}%
        </div>
      </div>
    </div>

    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.8rem; color: #888;">
      <strong>What this means:</strong><br>
      ${getExplanation(analysis)}
    </div>

    <div style="margin-top: 12px; padding: 8px; background: rgba(0, 255, 100, 0.05); border-radius: 6px; font-size: 0.7rem; color: #00ff88;">
      🔒 All analysis happens locally. Nothing is sent to servers.
    </div>
  `;

  document.body.appendChild(overlay);

  // Close button
  document.getElementById('close-overlay').addEventListener('click', () => {
    overlay.remove();
  });

  // Close on click outside
  setTimeout(() => {
    document.addEventListener('click', function closeOnClickOutside(e) {
      if (!overlay.contains(e.target)) {
        overlay.remove();
        document.removeEventListener('click', closeOnClickOutside);
      }
    });
  }, 100);
}

// Get explanation for analysis
function getExplanation(analysis) {
  if (analysis.cohomologyClass === 0) {
    return `This text presents a coherent narrative structure. The ideas flow consistently
    through the <strong>${analysis.label}</strong> framework. There are no major internal contradictions detected.`;
  } else {
    return `This text shows some internal tension or complexity. It may be presenting multiple
    perspectives or contain contrasting ideas. The dominant framing is <strong>${analysis.label}</strong>,
    but other elements are present.`;
  }
}

// Simple classifier - connects to background worker
async function classifyText(text) {
  // Send to background script which has the worker
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      type: 'classify',
      text: text
    }, response => {
      resolve(response);
    });
  });
}

console.log('Narrative Lens: Content script loaded');
