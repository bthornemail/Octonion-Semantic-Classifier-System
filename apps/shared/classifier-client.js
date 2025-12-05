// classifier-client.js
// Shared client for octonion semantic classifier
// Privacy-preserving wrapper for transformer-worker
// Author: Brian (Axiomatic Research Laboratory)
// License: MIT

export class ClassifierClient {
  constructor(workerPath = '../../src/transformer-worker.js') {
    this.worker = null;
    this.workerPath = workerPath;
    this.ready = false;
    this.messageQueue = [];
    this.pendingCallbacks = new Map();
    this.messageId = 0;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      try {
        this.worker = new Worker(this.workerPath, { type: 'module' });

        this.worker.onmessage = (e) => this.handleMessage(e);
        this.worker.onerror = (error) => {
          console.error('Worker error:', error);
          reject(error);
        };

        // Wait for ready signal
        const readyHandler = (e) => {
          if (e.data.type === 'ready') {
            this.ready = true;
            this.worker.removeEventListener('message', readyHandler);
            resolve(e.data.info);
          }
        };

        this.worker.addEventListener('message', readyHandler);
        this.worker.postMessage({ type: 'init' });
      } catch (error) {
        reject(error);
      }
    });
  }

  handleMessage(e) {
    const { type, id, data, error } = e.data;

    if (this.pendingCallbacks.has(id)) {
      const { resolve, reject } = this.pendingCallbacks.get(id);
      this.pendingCallbacks.delete(id);

      if (error) {
        reject(new Error(error));
      } else {
        resolve(data);
      }
    }
  }

  async classify(text, options = {}) {
    if (!this.ready) {
      throw new Error('Classifier not initialized. Call initialize() first.');
    }

    const id = this.messageId++;

    return new Promise((resolve, reject) => {
      this.pendingCallbacks.set(id, { resolve, reject });

      this.worker.postMessage({
        type: 'classify',
        id,
        data: { text, options }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingCallbacks.has(id)) {
          this.pendingCallbacks.delete(id);
          reject(new Error('Classification timeout'));
        }
      }, 30000);
    });
  }

  async setLabels(labels, prototypes) {
    if (labels.length !== 7) {
      throw new Error('Must provide exactly 7 labels');
    }

    const id = this.messageId++;

    return new Promise((resolve, reject) => {
      this.pendingCallbacks.set(id, { resolve, reject });

      this.worker.postMessage({
        type: 'set-labels',
        id,
        data: { labels, prototypes }
      });
    });
  }

  async propagateNarrative(startDim, chain) {
    const id = this.messageId++;

    return new Promise((resolve, reject) => {
      this.pendingCallbacks.set(id, { resolve, reject });

      this.worker.postMessage({
        type: 'propagate',
        id,
        data: { startDim, chain }
      });
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.ready = false;
    }
  }
}

// Privacy-preserving batch classifier
export class PrivacyClassifier extends ClassifierClient {
  constructor(workerPath) {
    super(workerPath);
    this.processedCount = 0;
    this.metrics = {
      totalAnalyzed: 0,
      avgProcessingTime: 0,
      privacyGuarantee: 'All processing happens client-side. No data sent to servers.'
    };
  }

  async classifyWithPrivacy(text, options = {}) {
    const startTime = performance.now();
    const result = await this.classify(text, options);
    const endTime = performance.now();

    // Update metrics (kept locally only)
    this.processedCount++;
    this.metrics.totalAnalyzed++;
    this.metrics.avgProcessingTime =
      (this.metrics.avgProcessingTime * (this.processedCount - 1) + (endTime - startTime)) / this.processedCount;

    return {
      ...result,
      processingTime: endTime - startTime,
      privacy: {
        clientSide: true,
        noDataTransmitted: true,
        reproducible: true
      }
    };
  }

  getMetrics() {
    return { ...this.metrics };
  }
}
