// provenance-tracker.js
// Track narrative evolution and mutations over time
// Author: Brian (Axiomatic Research Laboratory)
// License: MIT

export class ProvenanceTracker {
  constructor() {
    this.chains = new Map();
  }

  // Create a new provenance chain
  createChain(originalSource, originalAnalysis) {
    const chainId = this.generateChainId(originalSource);

    const chain = {
      id: chainId,
      original: {
        source: originalSource,
        analysis: originalAnalysis,
        timestamp: Date.now(),
        hash: this.hashAnalysis(originalAnalysis)
      },
      mutations: [],
      metadata: {
        created: Date.now(),
        updated: Date.now()
      }
    };

    this.chains.set(chainId, chain);
    return chainId;
  }

  // Add a mutation to the chain
  addMutation(chainId, derivedSource, derivedAnalysis) {
    const chain = this.chains.get(chainId);
    if (!chain) {
      throw new Error(`Chain ${chainId} not found`);
    }

    const mutation = {
      source: derivedSource,
      analysis: derivedAnalysis,
      timestamp: Date.now(),
      hash: this.hashAnalysis(derivedAnalysis),
      distance: this.calculateDistance(chain.original.analysis, derivedAnalysis),
      changes: this.identifyChanges(chain.original.analysis, derivedAnalysis)
    };

    chain.mutations.push(mutation);
    chain.metadata.updated = Date.now();

    return mutation;
  }

  // Calculate octonion distance between analyses
  calculateDistance(original, derived) {
    const v1 = original.vector;
    const v2 = derived.vector;

    let sum = 0;
    for (let i = 0; i < v1.length; i++) {
      sum += Math.pow(v1[i] - v2[i], 2);
    }

    return Math.sqrt(sum);
  }

  // Identify specific changes between narratives
  identifyChanges(original, derived) {
    const changes = [];

    // Framing shift
    if (original.dominant !== derived.dominant) {
      changes.push({
        type: 'framing_shift',
        from: {
          dimension: original.dominant,
          label: original.label
        },
        to: {
          dimension: derived.dominant,
          label: derived.label
        },
        severity: 'high'
      });
    }

    // Coherence change
    if (original.cohomologyClass !== derived.cohomologyClass) {
      changes.push({
        type: 'coherence_change',
        from: original.cohomologyClass,
        to: derived.cohomologyClass,
        interpretation: original.cohomologyClass === 0
          ? 'Became less coherent (gained tensions)'
          : 'Became more coherent (resolved tensions)',
        severity: 'medium'
      });
    }

    // Significant probability shifts
    for (let i = 0; i < original.vector.length; i++) {
      const diff = Math.abs(original.vector[i] - derived.vector[i]);
      if (diff > 0.15) {
        changes.push({
          type: 'probability_shift',
          dimension: i + 1,
          from: original.vector[i],
          to: derived.vector[i],
          magnitude: diff,
          severity: diff > 0.3 ? 'high' : 'medium'
        });
      }
    }

    return changes;
  }

  // Verify provenance chain authenticity
  verifyChain(chainId, threshold = 0.5) {
    const chain = this.chains.get(chainId);
    if (!chain) {
      return { valid: false, reason: 'Chain not found' };
    }

    const results = {
      valid: true,
      authenticity: 'consistent',
      mutations: [],
      warnings: []
    };

    for (const mutation of chain.mutations) {
      if (mutation.distance > threshold) {
        results.warnings.push({
          source: mutation.source,
          issue: 'Significant mutation detected',
          distance: mutation.distance,
          severity: mutation.distance > 0.8 ? 'high' : 'medium'
        });

        if (mutation.distance > 0.8) {
          results.authenticity = 'significantly_mutated';
        }
      }

      results.mutations.push({
        source: mutation.source,
        distance: mutation.distance,
        changes: mutation.changes.length,
        timestamp: mutation.timestamp
      });
    }

    return results;
  }

  // Visualize evolution path
  visualizeEvolution(chainId) {
    const chain = this.chains.get(chainId);
    if (!chain) {
      return null;
    }

    const nodes = [
      {
        id: 'original',
        label: 'Original Source',
        analysis: chain.original.analysis,
        timestamp: chain.original.timestamp
      }
    ];

    const edges = [];

    chain.mutations.forEach((mutation, idx) => {
      nodes.push({
        id: `mutation_${idx}`,
        label: mutation.source,
        analysis: mutation.analysis,
        timestamp: mutation.timestamp
      });

      edges.push({
        from: idx === 0 ? 'original' : `mutation_${idx - 1}`,
        to: `mutation_${idx}`,
        distance: mutation.distance,
        changes: mutation.changes
      });
    });

    return {
      nodes,
      edges,
      timeline: this.createTimeline(chain),
      keyChanges: this.summarizeKeyChanges(chain)
    };
  }

  createTimeline(chain) {
    const timeline = [{
      timestamp: chain.original.timestamp,
      event: 'Original narrative',
      label: chain.original.analysis.label
    }];

    chain.mutations.forEach(mutation => {
      timeline.push({
        timestamp: mutation.timestamp,
        event: 'Mutation detected',
        label: mutation.analysis.label,
        distance: mutation.distance
      });
    });

    return timeline;
  }

  summarizeKeyChanges(chain) {
    const allChanges = chain.mutations.flatMap(m => m.changes);

    // Group by type
    const grouped = allChanges.reduce((acc, change) => {
      acc[change.type] = acc[change.type] || [];
      acc[change.type].push(change);
      return acc;
    }, {});

    return {
      totalMutations: chain.mutations.length,
      totalChanges: allChanges.length,
      byType: grouped,
      highSeverity: allChanges.filter(c => c.severity === 'high').length,
      mediumSeverity: allChanges.filter(c => c.severity === 'medium').length
    };
  }

  // Generate unique chain ID
  generateChainId(source) {
    return `chain_${Date.now()}_${this.simpleHash(source)}`;
  }

  // Simple hash function
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  hashAnalysis(analysis) {
    return this.simpleHash(JSON.stringify({
      dominant: analysis.dominant,
      vector: analysis.vector.map(v => v.toFixed(3))
    }));
  }

  // Export chain for verification
  exportChain(chainId) {
    const chain = this.chains.get(chainId);
    if (!chain) {
      return null;
    }

    return {
      ...chain,
      exportedAt: Date.now(),
      version: '1.0',
      methodology: 'Octonion Semantic Classifier v1.0',
      reproducible: true
    };
  }
}
