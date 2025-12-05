// storage-manager.js
// Privacy-preserving local storage manager
// All data stays on user's device
// Author: Brian (Axiomatic Research Laboratory)
// License: MIT

export class PrivacyStorage {
  constructor(namespace = 'octonion_app') {
    this.namespace = namespace;
    this.privacyPolicy = {
      dataLocation: 'client-device-only',
      noServerTransmission: true,
      userControlled: true,
      exportable: true,
      deletable: true
    };
  }

  // Save data with privacy guarantee
  async save(key, data) {
    const storageKey = `${this.namespace}:${key}`;
    const envelope = {
      data,
      metadata: {
        savedAt: Date.now(),
        version: '1.0',
        privacy: 'client-side-only'
      }
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(envelope));
      return { success: true, key: storageKey };
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please clear some data.');
      }
      throw error;
    }
  }

  // Load data
  async load(key) {
    const storageKey = `${this.namespace}:${key}`;
    const item = localStorage.getItem(storageKey);

    if (!item) {
      return null;
    }

    try {
      const envelope = JSON.parse(item);
      return envelope.data;
    } catch (error) {
      console.error('Failed to parse stored data:', error);
      return null;
    }
  }

  // Delete specific item
  async delete(key) {
    const storageKey = `${this.namespace}:${key}`;
    localStorage.removeItem(storageKey);
    return { success: true };
  }

  // List all keys in namespace
  async list() {
    const keys = [];
    const prefix = `${this.namespace}:`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key.substring(prefix.length));
      }
    }

    return keys;
  }

  // Clear all data in namespace
  async clear() {
    const keys = await this.list();
    for (const key of keys) {
      await this.delete(key);
    }
    return { success: true, cleared: keys.length };
  }

  // Export all data for user backup
  async exportAll() {
    const keys = await this.list();
    const exported = {};

    for (const key of keys) {
      exported[key] = await this.load(key);
    }

    return {
      namespace: this.namespace,
      exportedAt: Date.now(),
      itemCount: keys.length,
      data: exported,
      privacy: this.privacyPolicy
    };
  }

  // Import data from backup
  async importAll(backup) {
    if (backup.namespace !== this.namespace) {
      throw new Error('Namespace mismatch');
    }

    const imported = [];
    for (const [key, data] of Object.entries(backup.data)) {
      await this.save(key, data);
      imported.push(key);
    }

    return { success: true, imported: imported.length };
  }

  // Get storage stats
  async getStats() {
    const keys = await this.list();
    let totalSize = 0;

    for (const key of keys) {
      const storageKey = `${this.namespace}:${key}`;
      const item = localStorage.getItem(storageKey);
      if (item) {
        totalSize += item.length * 2; // Rough estimate (UTF-16)
      }
    }

    return {
      itemCount: keys.length,
      totalSizeBytes: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      availableQuotaMB: this.estimateAvailableQuota(),
      privacy: this.privacyPolicy
    };
  }

  estimateAvailableQuota() {
    // Rough estimate of localStorage quota
    // Most browsers: 5-10 MB
    try {
      const test = 'x'.repeat(1024); // 1 KB
      let total = 0;

      while (total < 100000) { // Test up to ~100 MB
        try {
          localStorage.setItem(`test_${total}`, test);
          localStorage.removeItem(`test_${total}`);
          total += 1;
        } catch (e) {
          break;
        }
      }

      return total / 1024; // Return in MB
    } catch (e) {
      return 'unknown';
    }
  }
}

// IndexedDB storage for larger datasets
export class IndexedStorage {
  constructor(dbName = 'octonion_db', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('analyses')) {
          const store = db.createObjectStore('analyses', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('label', 'label', { unique: false });
        }

        if (!db.objectStoreNames.contains('chains')) {
          const store = db.createObjectStore('chains', { keyPath: 'id' });
          store.createIndex('created', 'metadata.created', { unique: false });
        }

        if (!db.objectStoreNames.contains('knowledge_graph')) {
          const store = db.createObjectStore('knowledge_graph', { keyPath: 'id', autoIncrement: true });
          store.createIndex('title', 'title', { unique: false });
          store.createIndex('readDate', 'readDate', { unique: false });
        }
      };
    });
  }

  async save(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add({ ...data, savedAt: Date.now() });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
