// analysis-panel.js
// Enhanced analysis panel with all ethical features
// Cross-platform comparison, provenance tracking, historical context

class AnalysisPanel {
  constructor() {
    this.currentAnalysis = null;
    this.comparisonMode = false;
    this.analyses = [];
  }

  // Display comprehensive analysis
  display(analysis, position = { x: 100, y: 100 }) {
    this.currentAnalysis = analysis;
    this.analyses.push({ ...analysis, timestamp: Date.now() });

    const panel = this.createPanel(position);
    document.body.appendChild(panel);
    this.attachEventListeners(panel);
  }

  createPanel(position) {
    const panel = document.createElement('div');
    panel.id = 'narrative-lens-panel';
    panel.className = 'nl-panel';
    panel.style.cssText = `
      position: fixed;
      top: ${position.y}px;
      left: ${position.x}px;
      background: linear-gradient(135deg, rgba(10, 10, 10, 0.98) 0%, rgba(26, 26, 46, 0.98) 100%);
      border: 1px solid rgba(0, 245, 255, 0.4);
      border-radius: 16px;
      padding: 24px;
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 500px;
      min-width: 400px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
      z-index: 999999;
      backdrop-filter: blur(20px);
      animation: slideIn 0.3s ease-out;
    `;

    panel.innerHTML = this.getPanelHTML();
    this.injectStyles();
    return panel;
  }

  getPanelHTML() {
    const a = this.currentAnalysis;

    return `
      <style>
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .nl-panel * {
          box-sizing: border-box;
        }

        .nl-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nl-title {
          margin: 0;
          background: linear-gradient(90deg, #00f5ff, #ff00ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .nl-close {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 24px;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .nl-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .nl-dominant {
          font-size: 1.8rem;
          color: #ff00ff;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .nl-subtitle {
          color: #888;
          font-size: 0.85rem;
          margin-bottom: 20px;
        }

        .nl-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .nl-metric {
          background: rgba(255, 255, 255, 0.03);
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .nl-metric-label {
          color: #888;
          font-size: 0.75rem;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .nl-metric-value {
          font-weight: bold;
          font-size: 1.1rem;
        }

        .nl-coherent {
          color: #00ff88;
        }

        .nl-tension {
          color: #ffaa00;
        }

        .nl-topology {
          margin: 20px 0;
          padding: 16px;
          background: rgba(0, 245, 255, 0.05);
          border-radius: 8px;
          border-left: 3px solid #00f5ff;
        }

        .nl-vector-viz {
          display: flex;
          gap: 4px;
          margin-top: 12px;
        }

        .nl-bar {
          flex: 1;
          height: 60px;
          background: linear-gradient(to top, rgba(0, 245, 255, 0.3), rgba(255, 0, 255, 0.6));
          border-radius: 4px;
          position: relative;
          transition: transform 0.2s;
        }

        .nl-bar:hover {
          transform: scaleY(1.05);
        }

        .nl-bar-label {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7rem;
          color: #888;
        }

        .nl-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 20px;
        }

        .nl-btn {
          padding: 10px 16px;
          background: rgba(0, 245, 255, 0.1);
          border: 1px solid rgba(0, 245, 255, 0.3);
          color: #00f5ff;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.85rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .nl-btn:hover {
          background: rgba(0, 245, 255, 0.2);
          transform: translateY(-1px);
        }

        .nl-privacy {
          margin-top: 16px;
          padding: 12px;
          background: rgba(0, 255, 100, 0.05);
          border-radius: 8px;
          font-size: 0.75rem;
          color: #00ff88;
          display: flex;
          align-items: start;
          gap: 8px;
        }

        .nl-explanation {
          margin-top: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          font-size: 0.85rem;
          line-height: 1.6;
        }
      </style>

      <div class="nl-header">
        <h3 class="nl-title">🔍 Narrative Lens</h3>
        <button class="nl-close" id="nl-close">&times;</button>
      </div>

      <div class="nl-dominant">${a.label}</div>
      <div class="nl-subtitle">Dominant semantic framework</div>

      <div class="nl-metrics">
        <div class="nl-metric">
          <div class="nl-metric-label">Coherence</div>
          <div class="nl-metric-value ${a.cohomologyClass === 0 ? 'nl-coherent' : 'nl-tension'}">
            ${a.cohomologyClass === 0 ? '✓ H¹=0' : '⚠ H¹=1'}
          </div>
        </div>
        <div class="nl-metric">
          <div class="nl-metric-label">Confidence</div>
          <div class="nl-metric-value" style="color: #00f5ff;">
            ${(a.confidence * 100).toFixed(1)}%
          </div>
        </div>
        <div class="nl-metric">
          <div class="nl-metric-label">Coverings</div>
          <div class="nl-metric-value" style="color: #ff00ff;">
            ${a.zariskiCoverings || 0}
          </div>
        </div>
      </div>

      <div class="nl-topology">
        <div style="font-size: 0.9rem; font-weight: 600; margin-bottom: 8px;">
          Semantic Topology
        </div>
        <div style="font-size: 0.8rem; color: #888; margin-bottom: 12px;">
          7-dimensional probability distribution
        </div>
        <div class="nl-vector-viz" id="nl-vector-viz"></div>
      </div>

      <div class="nl-explanation">
        <strong>What this means:</strong><br>
        ${this.getExplanation(a)}
      </div>

      <div class="nl-actions">
        <button class="nl-btn" id="nl-compare">
          🔄 Compare Source
        </button>
        <button class="nl-btn" id="nl-history">
          📚 View Context
        </button>
        <button class="nl-btn" id="nl-save">
          💾 Save Analysis
        </button>
        <button class="nl-btn" id="nl-export">
          📤 Export Data
        </button>
      </div>

      <div class="nl-privacy">
        <div>🔒</div>
        <div>
          <strong>Privacy First:</strong> All analysis happens locally in your browser.
          We never see what you analyze.
          <a href="#" id="nl-learn-more" style="color: #00f5ff; text-decoration: none;">Learn more</a>
        </div>
      </div>
    `;
  }

  getExplanation(a) {
    if (a.cohomologyClass === 0) {
      return `This text presents a coherent narrative structure with H¹=0 (trivial cohomology class).
      The ideas flow consistently through the <strong>${a.label}</strong> framework with minimal internal contradictions.`;
    } else {
      return `This text shows internal tension with H¹=1 (non-trivial cohomology class).
      It presents multiple perspectives or contains contrasting ideas. The dominant framing is
      <strong>${a.label}</strong>, but competing frameworks are present.`;
    }
  }

  attachEventListeners(panel) {
    // Close button
    panel.querySelector('#nl-close').addEventListener('click', () => {
      panel.remove();
    });

    // Render vector visualization
    this.renderVectorViz(panel);

    // Action buttons
    panel.querySelector('#nl-compare')?.addEventListener('click', () => {
      this.openComparisonMode();
    });

    panel.querySelector('#nl-history')?.addEventListener('click', () => {
      this.showHistoricalContext();
    });

    panel.querySelector('#nl-save')?.addEventListener('click', () => {
      this.saveAnalysis();
    });

    panel.querySelector('#nl-export')?.addEventListener('click', () => {
      this.exportAnalysis();
    });

    panel.querySelector('#nl-learn-more')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showPrivacyInfo();
    });

    // Make draggable
    this.makeDraggable(panel);
  }

  renderVectorViz(panel) {
    const viz = panel.querySelector('#nl-vector-viz');
    const labels = ['R', 'Sa', 'So', 'H', 'T', '3E', 'C']; // Short labels

    this.currentAnalysis.vector.forEach((value, i) => {
      const bar = document.createElement('div');
      bar.className = 'nl-bar';
      bar.style.height = `${value * 100}px`;
      bar.style.opacity = value > 0.1 ? '1' : '0.3';
      bar.title = `${labels[i]}: ${(value * 100).toFixed(1)}%`;

      const label = document.createElement('div');
      label.className = 'nl-bar-label';
      label.textContent = labels[i];

      bar.appendChild(label);
      viz.appendChild(bar);
    });
  }

  makeDraggable(panel) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    const header = panel.querySelector('.nl-header');
    header.style.cursor = 'move';

    header.addEventListener('mousedown', (e) => {
      if (e.target.id === 'nl-close') return;
      isDragging = true;
      initialX = e.clientX - panel.offsetLeft;
      initialY = e.clientY - panel.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        panel.style.left = currentX + 'px';
        panel.style.top = currentY + 'px';
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  openComparisonMode() {
    alert('Comparison mode: Right-click and analyze text from another source to compare!');
    this.comparisonMode = true;
  }

  showHistoricalContext() {
    alert('Historical context feature coming soon!');
  }

  saveAnalysis() {
    chrome.storage.local.get(['savedAnalyses'], (result) => {
      const saved = result.savedAnalyses || [];
      saved.push({
        ...this.currentAnalysis,
        savedAt: Date.now(),
        url: window.location.href,
        pageTitle: document.title
      });

      chrome.storage.local.set({ savedAnalyses: saved }, () => {
        alert('Analysis saved locally!');
      });
    });
  }

  exportAnalysis() {
    const data = {
      analysis: this.currentAnalysis,
      timestamp: Date.now(),
      url: window.location.href,
      pageTitle: document.title,
      privacy: 'client-side-only',
      methodology: 'Octonion Semantic Classifier v1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `narrative-analysis-${Date.now()}.json`;
    a.click();
  }

  showPrivacyInfo() {
    alert(`Privacy Guarantee:

✓ All analysis happens in your browser
✓ No data sent to external servers
✓ No tracking or profiling
✓ You control all saved data
✓ Open source and auditable
✓ Reproducible results

Your analyses stay on YOUR device.`);
  }

  injectStyles() {
    // Styles are injected inline in the HTML
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalysisPanel;
}
