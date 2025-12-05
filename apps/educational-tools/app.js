// Educational Tools - Interactive Learning Platform
// Author: Brian (Axiomatic Research Laboratory)

class EducationalApp {
  constructor() {
    this.worker = null;
    this.isReady = false;
    this.octTable = this.createFanoTable();
  }

  async initialize() {
    await this.initializeWorker();
    this.setupUI();
    this.renderFanoPlane();
  }

  createFanoTable() {
    // Standard Fano plane multiplication table
    return [
      null,
      [null, [-1,0], [1,4], [1,7], [-1,2], [1,6], [-1,5], [-1,3]],
      [null, [-1,4], [-1,0], [1,5], [1,1], [-1,3], [1,7], [-1,6]],
      [null, [-1,7], [-1,5], [-1,0], [1,6], [1,2], [-1,4], [1,1]],
      [null, [1,2], [-1,1], [-1,6], [-1,0], [1,7], [1,3], [-1,5]],
      [null, [-1,6], [1,3], [-1,2], [-1,7], [-1,0], [1,1], [1,4]],
      [null, [1,5], [-1,7], [1,4], [-1,3], [-1,1], [-1,0], [1,2]],
      [null, [1,3], [1,6], [-1,1], [1,5], [-1,4], [-1,2], [-1,0]]
    ];
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
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Multiplication calculator
    document.getElementById('multiply-btn')?.addEventListener('click', () => {
      this.calculateMultiplication();
    });

    // Propagation
    document.getElementById('propagate-btn')?.addEventListener('click', () => {
      this.showPropagation();
    });

    // Exercises
    document.getElementById('analyze-ex1')?.addEventListener('click', () => {
      this.analyzeExercise1();
    });

    document.getElementById('analyze-custom')?.addEventListener('click', () => {
      this.analyzeCustomText();
    });

    document.getElementById('analyze-ex3')?.addEventListener('click', () => {
      this.analyzeExercise3();
    });
  }

  switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    document.getElementById(`${tabName}-tab`)?.classList.add('active');
  }

  renderFanoPlane() {
    const svg = document.querySelector('#fano-canvas svg');
    if (!svg) return;

    const centerX = 300;
    const centerY = 300;
    const radius = 200;

    const labels = ['e₁', 'e₂', 'e₃', 'e₄', 'e₅', 'e₆', 'e₇'];
    const colors = ['#ff0000', '#ff7700', '#ffdd00', '#00ff00', '#0077ff', '#4400ff', '#ff00ff'];

    // Draw points
    const points = labels.map((label, i) => {
      const angle = (i * 2 * Math.PI / 7) - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      return { x, y, label, color: colors[i] };
    });

    const basisGroup = svg.querySelector('#basis-elements');
    points.forEach((p, i) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', p.x);
      circle.setAttribute('cy', p.y);
      circle.setAttribute('r', '12');
      circle.setAttribute('fill', p.color);
      circle.setAttribute('stroke', '#fff');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('class', 'clickable');
      circle.style.cursor = 'pointer';
      basisGroup.appendChild(circle);
    });

    const labelsGroup = svg.querySelector('#labels');
    points.forEach((p) => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', p.x);
      text.setAttribute('y', p.y - 20);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#fff');
      text.setAttribute('font-size', '18');
      text.textContent = p.label;
      labelsGroup.appendChild(text);
    });
  }

  calculateMultiplication() {
    const e1 = parseInt(document.getElementById('octonion-1').value);
    const e2 = parseInt(document.getElementById('octonion-2').value);

    const result = this.octTable[e1][e2];
    const sign = result[0] > 0 ? '+' : '-';
    const dim = result[1];

    const resultEl = document.getElementById('multiply-result');
    resultEl.textContent = dim === 0 ? (sign + '1') : (sign + 'e' + dim);

    const explanation = document.getElementById('multiplication-explanation');
    explanation.innerHTML = `
      <strong>Result:</strong> e${e1} × e${e2} = ${sign}e${dim === 0 ? '0 (real)' : dim}<br>
      <br>
      <strong>Why this matters:</strong> The order you encounter information affects the outcome!
      Try swapping e${e1} and e${e2} to see non-commutativity in action.
    `;
  }

  showPropagation() {
    const startDim = parseInt(document.getElementById('start-dim').value);
    const chain = [2, 4, 3]; // Example chain

    const resultEl = document.getElementById('propagation-result');
    resultEl.innerHTML = `
      <strong>Starting from e${startDim}:</strong><br>
      <div style="margin: 12px 0;">
        e${startDim} → e${chain[0]} → e${chain[1]} → e${chain[2]}
      </div>
      <p style="color: #888; margin-top: 12px;">
        This shows how starting from different perspectives leads to different conclusions.
        The path matters!
      </p>
    `;
  }

  async analyzeExercise1() {
    const textA = document.getElementById('exercise-1-text-a').textContent;
    const textB = document.getElementById('exercise-1-text-b').textContent;

    try {
      const analysisA = await this.classifyText(textA);
      const analysisB = await this.classifyText(textB);

      const resultEl = document.getElementById('result-ex1');
      resultEl.innerHTML = `
        <h4>Analysis Results:</h4>
        <div style="margin: 16px 0;">
          <strong>Text A:</strong> ${analysisA.label} (${(analysisA.confidence * 100).toFixed(1)}%)<br>
          <strong>Text B:</strong> ${analysisB.label} (${(analysisB.confidence * 100).toFixed(1)}%)
        </div>
        <div style="background: rgba(0, 255, 100, 0.1); padding: 12px; border-radius: 6px;">
          <strong>Interpretation:</strong><br>
          ${analysisA.label !== analysisB.label
            ? 'These texts frame the same topic from different perspectives! They emphasize different aspects.'
            : 'These texts share the same dominant framing despite appearing different.'}
        </div>
      `;
    } catch (error) {
      alert('Analysis error: ' + error.message);
    }
  }

  async analyzeCustomText() {
    const text = document.getElementById('custom-text').value;

    if (!text.trim()) {
      alert('Please enter some text');
      return;
    }

    try {
      const analysis = await this.classifyText(text);

      const resultEl = document.getElementById('result-custom');
      resultEl.innerHTML = `
        <h4>Framework Analysis:</h4>
        <div style="margin: 16px 0;">
          <div style="font-size: 1.5rem; color: #ff00ff; margin-bottom: 8px;">
            ${analysis.label}
          </div>
          <div>Confidence: ${(analysis.confidence * 100).toFixed(1)}%</div>
          <div>Coherence: H¹=${analysis.cohomologyClass === 0 ? '0 (coherent)' : '1 (tensions)'}</div>
        </div>
        <div style="background: rgba(0, 245, 255, 0.1); padding: 12px; border-radius: 6px;">
          This text primarily uses the <strong>${analysis.label}</strong> semantic framework.
        </div>
      `;
    } catch (error) {
      alert('Analysis error: ' + error.message);
    }
  }

  async analyzeExercise3() {
    const text = document.getElementById('practice-text').textContent;

    try {
      const analysis = await this.classifyText(text);

      const resultEl = document.getElementById('result-ex3');
      const isCoherent = analysis.cohomologyClass === 0;

      resultEl.innerHTML = `
        <h4>Coherence Analysis:</h4>
        <div style="margin: 16px 0;">
          <div style="font-size: 1.3rem; color: ${isCoherent ? '#00ff88' : '#ffaa00'}; margin-bottom: 8px;">
            ${isCoherent ? '✓ H¹=0: Internally Consistent' : '⚠ H¹=1: Contains Tensions'}
          </div>
          <div>Dominant Framework: ${analysis.label}</div>
          <div>Confidence: ${(analysis.confidence * 100).toFixed(1)}%</div>
        </div>
        <div style="background: rgba(255, 170, 0, 0.1); padding: 12px; border-radius: 6px;">
          <strong>Explanation:</strong><br>
          ${!isCoherent
            ? 'This text contains internal contradictions! It advocates for both individual freedom AND government control, which are competing frameworks.'
            : 'This text maintains internal consistency without major contradictions.'}
        </div>
      `;
    } catch (error) {
      alert('Analysis error: ' + error.message);
    }
  }
}

// Initialize app
const app = new EducationalApp();
app.initialize();
