// coherence-analyzer.js
// Cohomological invariant computations for narrative analysis
// Author: Brian (Axiomatic Research Laboratory)
// License: MIT

export class CoherenceAnalyzer {
  constructor() {
    this.threshold = 0.8;
  }

  // Calculate H¹(RP⁶; Z/2Z) cohomology class
  calculateCohomologyClass(vector) {
    // Count dimensions with significant probability
    const significantDims = vector.filter(v => v > this.threshold).length;

    // H¹ = 0 means coherent (single dominant frame)
    // H¹ = 1 means tension (multiple competing frames)
    return significantDims <= 1 ? 0 : 1;
  }

  // Find Zariski coverings (open sets where probability > threshold)
  findZariskiCoverings(vector) {
    const coverings = [];

    for (let i = 0; i < vector.length; i++) {
      if (vector[i] > this.threshold) {
        coverings.push({
          dimension: i + 1,
          probability: vector[i],
          coverage: vector[i]
        });
      }
    }

    return coverings;
  }

  // Analyze narrative coherence
  analyzeCoherence(result) {
    const { vector, dominant, label } = result;
    const cohClass = this.calculateCohomologyClass(vector);
    const coverings = this.findZariskiCoverings(vector);

    return {
      isCoherent: cohClass === 0,
      cohomologyClass: cohClass,
      dominantFrame: {
        dimension: dominant,
        label: label,
        confidence: result.confidence
      },
      tensions: cohClass === 1 ? this.identifyTensions(vector, dominant) : [],
      zariskiCoverings: coverings,
      interpretation: this.interpretCoherence(cohClass, dominant, coverings)
    };
  }

  // Identify competing frames (tensions)
  identifyTensions(vector, dominantDim) {
    const tensions = [];
    const dominantValue = vector[dominantDim - 1];

    for (let i = 0; i < vector.length; i++) {
      if (i !== dominantDim - 1 && vector[i] > this.threshold * dominantValue) {
        tensions.push({
          dimension: i + 1,
          strength: vector[i],
          ratio: vector[i] / dominantValue
        });
      }
    }

    return tensions.sort((a, b) => b.strength - a.strength);
  }

  // Human-readable interpretation
  interpretCoherence(cohClass, dominant, coverings) {
    if (cohClass === 0) {
      return {
        summary: "Internally consistent",
        explanation: `This text maintains a coherent narrative structure focused primarily on dimension ${dominant}.`,
        visualMetaphor: "A single, clear path through semantic space"
      };
    } else {
      return {
        summary: "Contains tensions",
        explanation: `This text exhibits multiple competing narrative frames (${coverings.length} significant dimensions detected).`,
        visualMetaphor: "Multiple paths that diverge and compete"
      };
    }
  }

  // Compare two narratives
  compareNarratives(result1, result2) {
    const analysis1 = this.analyzeCoherence(result1);
    const analysis2 = this.analyzeCoherence(result2);

    // Calculate framing distance
    const framingDistance = this.calculateFramingDistance(result1.vector, result2.vector);

    // Find shared and unique elements
    const shared = this.findSharedFraming(result1.vector, result2.vector);
    const unique1 = this.findUniqueFraming(result1.vector, result2.vector);
    const unique2 = this.findUniqueFraming(result2.vector, result1.vector);

    return {
      framingDistance,
      similarity: 1 - framingDistance,
      source1: analysis1,
      source2: analysis2,
      sharedElements: shared,
      uniqueToSource1: unique1,
      uniqueToSource2: unique2,
      interpretation: this.interpretComparison(framingDistance, analysis1, analysis2)
    };
  }

  calculateFramingDistance(v1, v2) {
    // Euclidean distance in probability simplex
    let sum = 0;
    for (let i = 0; i < v1.length; i++) {
      sum += Math.pow(v1[i] - v2[i], 2);
    }
    return Math.sqrt(sum);
  }

  findSharedFraming(v1, v2) {
    const shared = [];
    const minThreshold = 0.3;

    for (let i = 0; i < v1.length; i++) {
      if (v1[i] > minThreshold && v2[i] > minThreshold) {
        shared.push({
          dimension: i + 1,
          weight: Math.min(v1[i], v2[i])
        });
      }
    }

    return shared.sort((a, b) => b.weight - a.weight);
  }

  findUniqueFraming(v1, v2) {
    const unique = [];
    const threshold = 0.3;

    for (let i = 0; i < v1.length; i++) {
      if (v1[i] > threshold && v2[i] < threshold / 2) {
        unique.push({
          dimension: i + 1,
          weight: v1[i]
        });
      }
    }

    return unique.sort((a, b) => b.weight - a.weight);
  }

  interpretComparison(distance, analysis1, analysis2) {
    if (distance < 0.3) {
      return "These sources tell the story very similarly, using the same narrative framing.";
    } else if (distance < 0.7) {
      return "These sources emphasize different aspects of the story while maintaining some common ground.";
    } else {
      return "These sources frame the story from fundamentally different perspectives.";
    }
  }
}

// Statistical coherence measures
export class StatisticalCoherence {
  // Shannon entropy of probability distribution
  static entropy(vector) {
    return -vector.reduce((sum, p) => {
      return p > 0 ? sum + p * Math.log2(p) : sum;
    }, 0);
  }

  // Gini coefficient (inequality measure)
  static giniCoefficient(vector) {
    const sorted = [...vector].sort((a, b) => a - b);
    const n = sorted.length;
    let sum = 0;

    for (let i = 0; i < n; i++) {
      sum += (2 * (i + 1) - n - 1) * sorted[i];
    }

    return sum / (n * sorted.reduce((a, b) => a + b, 0));
  }

  // Concentration ratio (top-k dominance)
  static concentrationRatio(vector, k = 3) {
    const sorted = [...vector].sort((a, b) => b - a);
    return sorted.slice(0, k).reduce((a, b) => a + b, 0);
  }
}
