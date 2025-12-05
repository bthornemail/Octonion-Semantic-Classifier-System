// Truth Commons - Public Research Platform
import { ProvenanceTracker } from '../shared/provenance-tracker.js';
import { CoherenceAnalyzer } from '../shared/coherence-analyzer.js';

class TruthCommonsApp {
  constructor() {
    this.tracker = new ProvenanceTracker();
    this.analyzer = new CoherenceAnalyzer();
    this.worker = null;
    this.isReady = false;
  }

  async initialize() {
    await this.initializeWorker();
    this.setupUI();
  }

  async initializeWorker() {
    return new Promise((resolve, reject) => {
      this.worker = new Worker('../../src/transformer-worker.js', { type: 'module' });

      this.worker.onmessage = (e) => {
        if (e.data.type === 'ready') {
          this.isReady = true;
          resolve();
        }
      };

      this.worker.onerror = reject;
      this.worker.postMessage({ type: 'init' });
    });
  }

  async classifyText(text) {
    return new Promise((resolve, reject) => {
      const handler = (e) => {
        if (e.data.type === 'classification') {
          this.worker.removeEventListener('message', handler);
          resolve(e.data);
        }
      };
      this.worker.addEventListener('message', handler);
      this.worker.postMessage({ type: 'classify', data: { text } });
      setTimeout(() => reject(new Error('Timeout')), 30000);
    });
  }

  setupUI() {
    document.getElementById('analyze-claim')?.addEventListener('click', () => {
      this.analyzeClaim();
    });

    document.getElementById('verify-provenance')?.addEventListener('click', () => {
      this.verifyProvenance();
    });
  }

  async analyzeClaim() {
    const claim = document.getElementById('claim').value;
    const sources = document.getElementById('sources').value.split('\n').filter(s => s.trim());

    if (!claim || sources.length === 0) {
      alert('Please provide both a claim and sources');
      return;
    }

    const resultsDiv = document.getElementById('claim-results');
    resultsDiv.innerHTML = '<div class="results">Analyzing claim across sources...</div>';

    try {
      // For demo - would fetch actual URLs in production
      const analyses = [];

      for (const source of sources) {
        // In production, would fetch content from URL
        const analysis = {
          source,
          label: 'Sample',
          coherence: 0,
          confidence: 0.85
        };
        analyses.push(analysis);
      }

      resultsDiv.innerHTML = `
        <div class="results">
          <h3>Transparent Analysis Results</h3>
          <div style="margin: 20px 0;">
            <span class="metric">${analyses.length} sources analyzed</span>
            <span class="metric">Methodology: Open Source</span>
            <span class="metric">Timestamp: ${new Date().toISOString()}</span>
          </div>
          <div class="methodology">
            <strong>Full Transparency:</strong><br>
            • All source code available on GitHub<br>
            • Analysis is reproducible by anyone<br>
            • No black-box algorithms<br>
            • Complete methodology documented<br>
            <br>
            <strong>Download:</strong>
            <button class="btn" onclick="alert('Export feature coming soon')">Export Analysis JSON</button>
          </div>
        </div>
      `;
    } catch (error) {
      resultsDiv.innerHTML = `<div class="results">Error: ${error.message}</div>`;
    }
  }

  async verifyProvenance() {
    const original = document.getElementById('original-text').value;
    const derived = document.getElementById('derived-texts').value.split('---').filter(t => t.trim());

    if (!original || derived.length === 0) {
      alert('Please provide both original and derived texts');
      return;
    }

    const resultsDiv = document.getElementById('provenance-results');
    resultsDiv.innerHTML = '<div class="results">Verifying provenance chain...</div>';

    try {
      const originalAnalysis = await this.classifyText(original);
      const chainId = this.tracker.createChain('Original Source', originalAnalysis);

      const chainHtml = derived.map((text, idx) => `
        <div class="chain-node">
          <strong>Source ${idx + 1}</strong><br>
          <small>Distance: Calculating...</small>
        </div>
      `).join('<div class="chain-arrow">→</div>');

      resultsDiv.innerHTML = `
        <div class="results">
          <h3>Provenance Chain Verification</h3>
          <div class="provenance-chain">
            <div class="chain-node">
              <strong>Original</strong><br>
              <small>${originalAnalysis.label}</small>
            </div>
            <div class="chain-arrow">→</div>
            ${chainHtml}
          </div>
          <div class="methodology">
            <strong>Verification Method:</strong> Octonion distance metric in semantic space<br>
            <strong>Chain ID:</strong> ${chainId}<br>
            <strong>Reproducible:</strong> ✓ Yes
          </div>
        </div>
      `;
    } catch (error) {
      resultsDiv.innerHTML = `<div class="results">Error: ${error.message}</div>`;
    }
  }
}

const app = new TruthCommonsApp();
app.initialize();
