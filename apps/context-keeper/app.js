// Context Keeper - Main Application
// Personal Knowledge Management with Octonion Classifier

import { IndexedStorage } from '../shared/storage-manager.js';
import { CoherenceAnalyzer, StatisticalCoherence } from '../shared/coherence-analyzer.js';

class ContextKeeperApp {
  constructor() {
    this.storage = new IndexedStorage('context_keeper_db');
    this.analyzer = new CoherenceAnalyzer();
    this.worker = null;
    this.isReady = false;
    this.articles = [];
    this.currentView = 'dashboard';
  }

  async initialize() {
    try {
      // Initialize storage
      await this.storage.initialize();
      console.log('Storage initialized');

      // Initialize worker
      await this.initializeWorker();
      console.log('Worker initialized');

      // Load articles
      await this.loadArticles();

      // Setup UI
      this.setupUI();
      this.updateStats();
      this.renderDashboard();

    } catch (error) {
      console.error('Initialization error:', error);
      this.showError('Failed to initialize application');
    }
  }

  async initializeWorker() {
    return new Promise((resolve, reject) => {
      this.worker = new Worker('../../src/transformer-worker.js', { type: 'module' });

      this.worker.onmessage = (e) => {
        const { type } = e.data;

        if (type === 'ready') {
          this.isReady = true;
          console.log('Classifier ready:', e.data.info);
          resolve();
        }

        if (type === 'status') {
          console.log('Status:', e.data.message);
          this.updateStatus(e.data.message);
        }

        if (type === 'error') {
          console.error('Worker error:', e.data.message);
          reject(new Error(e.data.message));
        }
      };

      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        reject(error);
      };

      this.worker.postMessage({ type: 'init' });
    });
  }

  async classifyText(text) {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        reject(new Error('Classifier not ready'));
        return;
      }

      const handler = (e) => {
        const { type, ...data } = e.data;

        if (type === 'classification') {
          this.worker.removeEventListener('message', handler);
          resolve(data);
        }

        if (type === 'error') {
          this.worker.removeEventListener('message', handler);
          reject(new Error(data.message));
        }
      };

      this.worker.addEventListener('message', handler);

      this.worker.postMessage({
        type: 'classify',
        data: { text }
      });

      setTimeout(() => {
        this.worker.removeEventListener('message', handler);
        reject(new Error('Classification timeout'));
      }, 30000);
    });
  }

  setupUI() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.switchView(view);
      });
    });

    // Quick actions
    document.getElementById('analyze-new')?.addEventListener('click', () => {
      this.showAddArticleModal();
    });

    document.getElementById('check-consistency')?.addEventListener('click', () => {
      this.switchView('beliefs');
    });

    document.getElementById('view-patterns')?.addEventListener('click', () => {
      this.switchView('graph');
    });

    // Modal
    document.getElementById('close-modal')?.addEventListener('click', () => {
      this.hideAddArticleModal();
    });

    document.getElementById('cancel-add')?.addEventListener('click', () => {
      this.hideAddArticleModal();
    });

    document.getElementById('save-article')?.addEventListener('click', () => {
      this.saveNewArticle();
    });

    // Belief analysis
    document.getElementById('analyze-belief')?.addEventListener('click', () => {
      this.analyzeBeliefConsistency();
    });

    // Export/Import
    document.getElementById('export-json')?.addEventListener('click', () => {
      this.exportAsJSON();
    });

    document.getElementById('export-csv')?.addEventListener('click', () => {
      this.exportAsCSV();
    });

    document.getElementById('import-btn')?.addEventListener('click', () => {
      this.importData();
    });

    document.getElementById('clear-all')?.addEventListener('click', () => {
      this.clearAllData();
    });

    // Search and filters
    document.getElementById('search-articles')?.addEventListener('input', (e) => {
      this.filterArticles(e.target.value);
    });

    document.getElementById('sort-articles')?.addEventListener('change', (e) => {
      this.sortArticles(e.target.value);
    });
  }

  switchView(viewName) {
    // Update nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });

    document.getElementById(`${viewName}-view`)?.classList.add('active');

    this.currentView = viewName;

    // Render view-specific content
    if (viewName === 'articles') {
      this.renderArticlesList();
    } else if (viewName === 'graph') {
      this.renderKnowledgeGraph();
    } else if (viewName === 'export') {
      this.renderStorageStats();
    }
  }

  async loadArticles() {
    try {
      this.articles = await this.storage.getAll('knowledge_graph');
      console.log(`Loaded ${this.articles.length} articles`);
    } catch (error) {
      console.error('Error loading articles:', error);
      this.articles = [];
    }
  }

  updateStats() {
    document.getElementById('total-articles').textContent = this.articles.length;
    document.getElementById('knowledge-nodes').textContent = this.articles.length;
  }

  renderDashboard() {
    const recentList = document.getElementById('recent-list');
    if (!recentList) return;

    const recent = this.articles
      .sort((a, b) => b.readDate - a.readDate)
      .slice(0, 5);

    if (recent.length === 0) {
      recentList.innerHTML = '<div class="loading">No articles yet. Add your first one!</div>';
      return;
    }

    recentList.innerHTML = recent.map(article => this.renderArticleCard(article)).join('');
  }

  renderArticleCard(article) {
    const coherence = article.analysis?.cohomologyClass === 0 ? 'coherent' : 'tension';
    const coherenceText = article.analysis?.cohomologyClass === 0 ? 'H¹=0' : 'H¹=1';
    const date = new Date(article.readDate).toLocaleDateString();

    return `
      <div class="article-card">
        <div class="article-header">
          <div>
            <div class="article-title">${this.escapeHtml(article.title)}</div>
            <div class="article-date">${date}</div>
          </div>
        </div>
        <div class="article-meta">
          <div class="meta-item">
            <span class="label-badge">${article.analysis?.label || 'Unknown'}</span>
          </div>
          <div class="meta-item">
            <span class="coherence-badge ${coherence}">${coherenceText}</span>
          </div>
          <div class="meta-item">
            ${(article.analysis?.confidence * 100 || 0).toFixed(0)}% confidence
          </div>
        </div>
      </div>
    `;
  }

  renderArticlesList() {
    const list = document.getElementById('articles-list');
    if (!list) return;

    if (this.articles.length === 0) {
      list.innerHTML = '<div class="loading">No articles yet</div>';
      return;
    }

    list.innerHTML = this.articles.map(article => this.renderArticleCard(article)).join('');
  }

  renderKnowledgeGraph() {
    // Placeholder for now - would use D3.js or similar in production
    const canvas = document.getElementById('graph-canvas');
    if (!canvas) return;

    if (this.articles.length === 0) {
      canvas.innerHTML = `
        <div class="graph-placeholder">
          <div class="placeholder-icon">🕸️</div>
          <div class="placeholder-text">Your knowledge graph will appear here</div>
          <div class="placeholder-hint">Analyze some articles to build your graph</div>
        </div>
      `;
    } else {
      canvas.innerHTML = `
        <div class="graph-placeholder">
          <div class="placeholder-icon">🕸️</div>
          <div class="placeholder-text">${this.articles.length} nodes in your knowledge graph</div>
          <div class="placeholder-hint">Full visualization coming soon!</div>
        </div>
      `;
    }
  }

  renderStorageStats() {
    const stats = document.getElementById('storage-stats');
    if (!stats) return;

    const articlesCount = this.articles.length;
    const estimatedSize = JSON.stringify(this.articles).length;

    stats.innerHTML = `
      <div class="article-card">
        <div class="article-title">Storage Usage</div>
        <div style="margin-top: 16px;">
          <div class="meta-item">
            <strong>Articles:</strong> ${articlesCount}
          </div>
          <div class="meta-item">
            <strong>Estimated Size:</strong> ${(estimatedSize / 1024).toFixed(2)} KB
          </div>
          <div class="meta-item">
            <strong>Privacy:</strong> ✓ All data stored locally
          </div>
        </div>
      </div>
    `;
  }

  showAddArticleModal() {
    document.getElementById('add-article-modal')?.classList.add('active');
  }

  hideAddArticleModal() {
    document.getElementById('add-article-modal')?.classList.remove('active');
    // Clear form
    document.getElementById('article-title').value = '';
    document.getElementById('article-url').value = '';
    document.getElementById('article-content').value = '';
    document.getElementById('article-notes').value = '';
  }

  async saveNewArticle() {
    const title = document.getElementById('article-title').value;
    const url = document.getElementById('article-url').value;
    const content = document.getElementById('article-content').value;
    const notes = document.getElementById('article-notes').value;

    if (!title || !content) {
      alert('Please provide at least a title and content');
      return;
    }

    try {
      // Classify the content
      this.updateStatus('Analyzing article...');
      const analysis = await this.classifyText(content);

      // Add coherence analysis
      const coherence = this.analyzer.analyzeCoherence(analysis);

      // Save to storage
      const article = {
        title,
        url,
        content: content.substring(0, 5000), // Store first 5000 chars
        notes,
        analysis: {
          ...analysis,
          coherence
        },
        readDate: Date.now()
      };

      await this.storage.save('knowledge_graph', article);

      // Reload and update
      await this.loadArticles();
      this.updateStats();
      this.renderDashboard();

      this.hideAddArticleModal();
      this.updateStatus('Article saved!');
      alert('Article analyzed and saved successfully!');

    } catch (error) {
      console.error('Error saving article:', error);
      alert('Error analyzing article: ' + error.message);
    }
  }

  async analyzeBeliefConsistency() {
    const text = document.getElementById('belief-input').value;

    if (!text.trim()) {
      alert('Please enter some text to analyze');
      return;
    }

    try {
      this.updateStatus('Analyzing consistency...');

      const analysis = await this.classifyText(text);
      const coherence = this.analyzer.analyzeCoherence(analysis);

      // Display results
      const results = document.getElementById('belief-results');
      results.innerHTML = `
        <h3>Consistency Analysis</h3>
        <div style="margin: 20px 0;">
          <div class="article-card">
            <div class="article-meta">
              <div class="meta-item">
                <span class="label-badge">${analysis.label}</span>
              </div>
              <div class="meta-item">
                <span class="coherence-badge ${coherence.isCoherent ? 'coherent' : 'tension'}">
                  ${coherence.isCoherent ? '✓ Coherent (H¹=0)' : '⚠ Tensions (H¹=1)'}
                </span>
              </div>
            </div>
            <div style="margin-top: 16px;">
              <strong>Interpretation:</strong><br>
              ${coherence.interpretation.explanation}
            </div>
            ${coherence.tensions.length > 0 ? `
              <div style="margin-top: 16px;">
                <strong>Competing Frameworks:</strong><br>
                ${coherence.tensions.map(t =>
                  `Dimension ${t.dimension}: ${(t.strength * 100).toFixed(1)}%`
                ).join('<br>')}
              </div>
            ` : ''}
          </div>
        </div>
      `;

      this.updateStatus('Analysis complete');

    } catch (error) {
      console.error('Error analyzing belief:', error);
      alert('Error: ' + error.message);
    }
  }

  async exportAsJSON() {
    const data = {
      exported: Date.now(),
      articleCount: this.articles.length,
      articles: this.articles,
      metadata: {
        version: '1.0',
        app: 'Context Keeper',
        privacy: 'client-side-only'
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `context-keeper-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async exportAsCSV() {
    const headers = ['Title', 'Date', 'Label', 'Coherence', 'Confidence', 'URL'];
    const rows = this.articles.map(a => [
      a.title,
      new Date(a.readDate).toLocaleDateString(),
      a.analysis?.label || '',
      a.analysis?.cohomologyClass === 0 ? 'Coherent' : 'Tensions',
      ((a.analysis?.confidence || 0) * 100).toFixed(1) + '%',
      a.url || ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `context-keeper-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importData() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];

    if (!file) {
      alert('Please select a file');
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (confirm(`Import ${data.articles?.length || 0} articles? This will not delete existing data.`)) {
        for (const article of data.articles || []) {
          await this.storage.save('knowledge_graph', article);
        }

        await this.loadArticles();
        this.updateStats();
        alert('Data imported successfully!');
      }
    } catch (error) {
      alert('Error importing data: ' + error.message);
    }
  }

  async clearAllData() {
    if (!confirm('Are you sure? This will permanently delete all your articles and analyses.')) {
      return;
    }

    if (!confirm('Really sure? This cannot be undone.')) {
      return;
    }

    try {
      await this.storage.clear('knowledge_graph');
      this.articles = [];
      this.updateStats();
      this.renderDashboard();
      alert('All data cleared');
    } catch (error) {
      alert('Error clearing data: ' + error.message);
    }
  }

  filterArticles(query) {
    // TODO: Implement filtering
    console.log('Filter:', query);
  }

  sortArticles(sortBy) {
    // TODO: Implement sorting
    console.log('Sort by:', sortBy);
    this.renderArticlesList();
  }

  updateStatus(message) {
    console.log('Status:', message);
    // Could show in UI
  }

  showError(message) {
    console.error(message);
    alert(message);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new ContextKeeperApp();
    app.initialize();
  });
} else {
  const app = new ContextKeeperApp();
  app.initialize();
}
