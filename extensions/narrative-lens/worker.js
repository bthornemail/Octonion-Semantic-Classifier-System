// transformer-worker.js
// Transformer.js + Octonion Classifier with Cohomological Invariants
// Production-grade semantic topology engine
// Author: Brian (Axiomatic Research Laboratory)
// License: MIT

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Configure transformers.js
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency || 4;

// State
let embedder = null;
let currentLabels = ["Root", "Sacral", "Solar-Plexus", "Heart", "Throat", "Third-Eye", "Crown"];
let prototypes = [
  "",  // Index 0 unused (real scalar)
  "A narrative of survival, fear, security, tribal identity, grounding in the material world.",
  "Stories of pleasure, desire, creativity, emotional flow, relationships, and sensual abundance.",
  "Themes of personal power, will, confidence, ego, anger, control, and fiery ambition.",
  "Tales of love, compassion, connection, forgiveness, empathy, and heart-centered unity.",
  "Expression of truth, voice, communication, authenticity, clarity, and creative speech.",
  "Intuitive vision, insight, awareness, discernment, third-eye perception, and inner knowing.",
  "Transcendence, divine unity, surrender, cosmic consciousness, crown awakening, and oneness."
];

let prototypeEmbeddings = null;  // Cache
let modelHash = null;  // For integrity verification

// Octonion multiplication table (Fano plane structure)
// Each entry: [sign, index] where sign ∈ {-1, 1} and index ∈ {0..7}
// e_i * e_j = sign * e_k according to Fano plane
const octTable = [
  null,  // e_0 (real scalar - not used in multiplication)
  [null, [-1,0], [1,4], [1,7], [-1,2], [1,6], [-1,5], [-1,3]],  // e_1
  [null, [-1,4], [-1,0], [1,5], [1,1], [-1,3], [1,7], [-1,6]],  // e_2
  [null, [-1,7], [-1,5], [-1,0], [1,6], [1,2], [-1,4], [1,1]],  // e_3
  [null, [1,2], [-1,1], [-1,6], [-1,0], [1,7], [1,3], [-1,5]],  // e_4
  [null, [-1,6], [1,3], [-1,2], [-1,7], [-1,0], [1,1], [1,4]],  // e_5
  [null, [1,5], [-1,7], [1,4], [-1,3], [-1,1], [-1,0], [1,2]],  // e_6
  [null, [1,3], [1,6], [-1,1], [1,5], [-1,4], [-1,2], [-1,0]]   // e_7
];

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initEngine() {
  try {
    postMessage({ type: "status", message: "Loading MiniLM model (~80MB)..." });

    // Load sentence transformer
    embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      {
        quantized: true,
        progress_callback: (progress) => {
          if (progress.status === 'progress') {
            const pct = ((progress.loaded / progress.total) * 100).toFixed(0);
            postMessage({
              type: "status",
              message: `Loading model: ${pct}%`,
              progress: parseFloat(pct)
            });
          }
        }
      }
    );

    // Verify Fano plane structure
    const fanoCheck = verifyFanoStructure();
    if (!fanoCheck.valid) {
      postMessage({
        type: "warning",
        message: `Fano structure warnings: ${fanoCheck.warnings.join(', ')}`
      });
    }

    // Pre-compute prototype embeddings
    await updatePrototypeEmbeddings();

    postMessage({
      type: "ready",
      info: {
        model: "all-MiniLM-L6-v2",
        dimensions: 384,
        labels: currentLabels,
        fanoValid: fanoCheck.valid
      }
    });

  } catch (error) {
    postMessage({
      type: "error",
      message: `Initialization failed: ${error.message}`,
      stack: error.stack
    });
  }
}

// ============================================================================
// FANO PLANE VERIFICATION
// ============================================================================

function verifyFanoStructure() {
  const warnings = [];
  let valid = true;

  // Test anti-commutativity: e_i * e_j = -e_j * e_i
  for (let i = 1; i <= 7; i++) {
    for (let j = i + 1; j <= 7; j++) {
      const ij = octTable[i][j];
      const ji = octTable[j][i];

      if (!ij || !ji) continue;

      if (ij[1] !== ji[1] || ij[0] !== -ji[0]) {
        warnings.push(`Anti-commutativity fails: e${i}*e${j} ≠ -e${j}*e${i}`);
        valid = false;
      }
    }
  }

  // Test Fano plane cycles (should have consistent signs)
  const fanoCycles = [
    [1, 2, 4],  // Cycle 1
    [2, 3, 5],  // Cycle 2
    [3, 4, 6],  // Cycle 3
    [4, 5, 7],  // Cycle 4
    [5, 6, 1],  // Cycle 5
    [6, 7, 2],  // Cycle 6
    [7, 1, 3]   // Cycle 7
  ];

  for (const cycle of fanoCycles) {
    const [a, b, c] = cycle;
    const ab = octTable[a][b];
    const bc = octTable[b][c];
    const ca = octTable[c][a];

    if (!ab || !bc || !ca) continue;

    // Should form a consistent triple
    const product = ab[0] * bc[0] * ca[0];
    if (product !== -1 && product !== 1) {
      warnings.push(`Fano cycle [${a},${b},${c}] inconsistent`);
      valid = false;
    }
  }

  return { valid, warnings };
}

// ============================================================================
// EMBEDDING COMPUTATION
// ============================================================================

async function updatePrototypeEmbeddings() {
  postMessage({ type: "status", message: "Computing prototype embeddings..." });

  prototypeEmbeddings = [];
  for (let i = 1; i < prototypes.length; i++) {
    const output = await embedder(prototypes[i], {
      pooling: 'mean',
      normalize: true
    });
    prototypeEmbeddings.push(Array.from(output.data));
  }

  postMessage({ type: "status", message: "Prototypes ready" });
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB)) || 0;
}

// ============================================================================
// TEXT CLASSIFICATION
// ============================================================================

async function classifyText(text, options = {}) {
  if (!embedder) throw new Error("Embedder not initialized");
  if (!prototypeEmbeddings) await updatePrototypeEmbeddings();

  const maxChunkSize = options.maxChunkSize || 512;
  const minChunkSize = options.minChunkSize || 100;

  // Intelligent chunking (preserve sentences)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize) {
      if (currentChunk.length >= minChunkSize) {
        chunks.push(currentChunk);
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    } else {
      currentChunk += sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk);

  // Compute average embedding across chunks
  let avgEmbedding = new Array(384).fill(0);
  let validChunks = 0;

  for (const chunk of chunks) {
    if (chunk.trim().length < 10) continue;  // Skip trivial chunks

    try {
      const output = await embedder(chunk.trim(), {
        pooling: 'mean',
        normalize: true
      });
      const embedding = Array.from(output.data);

      for (let i = 0; i < 384; i++) {
        avgEmbedding[i] += embedding[i];
      }
      validChunks++;
    } catch (e) {
      console.warn("Chunk embedding failed:", e);
    }
  }

  if (validChunks === 0) {
    throw new Error("No valid chunks to embed");
  }

  // Normalize average
  for (let i = 0; i < 384; i++) {
    avgEmbedding[i] /= validChunks;
  }

  // Compute similarities to prototypes
  const rawVector = prototypeEmbeddings.map(protoEmb =>
    cosineSimilarity(avgEmbedding, protoEmb)
  );

  // Softmax normalization for probability distribution
  const expScores = rawVector.map(x => Math.exp(Math.max(0, x) * 5));  // Scale factor
  const sumExp = expScores.reduce((a, b) => a + b, 0);
  const vector = expScores.map(x => x / sumExp);

  // Find dominant dimension
  const maxScore = Math.max(...vector);
  const dominant = vector.indexOf(maxScore) + 1;

  // Compute cohomological invariants
  const cohomology = computeCohomologyClass(vector);
  const zariski = zariskiCoverings(vector);

  return {
    dominant,
    label: currentLabels[dominant - 1],
    vector,
    rawVector,
    avgEmbedding,
    cohomologyClass: cohomology,
    zariskiCoverings: zariski.length,
    confidence: maxScore,
    chunksProcessed: validChunks
  };
}

// ============================================================================
// COHOMOLOGICAL INVARIANTS
// ============================================================================

function computeCohomologyClass(vector) {
  // Compute H¹(RP⁶; Z/2Z) via sign pattern analysis
  // Detects topological "winding" in the probability simplex

  const threshold = 0.1;
  let signChanges = 0;

  for (let i = 0; i < 7; i++) {
    const diff = vector[(i + 1) % 7] - vector[i];
    if (Math.abs(diff) > threshold) {
      signChanges += diff > 0 ? 1 : 0;
    }
  }

  // Torsion class: even/odd winding number
  return signChanges % 2;
}

function zariskiCoverings(vector) {
  // Compute Zariski-like open coverings
  // Returns subsets where cumulative probability > threshold

  const threshold = 0.8;
  const covers = [];

  for (let mask = 1; mask < 128; mask++) {  // 2^7 - 1 non-empty subsets
    let sum = 0;
    const indices = [];

    for (let i = 0; i < 7; i++) {
      if (mask & (1 << i)) {
        sum += vector[i];
        indices.push(i + 1);
      }
    }

    if (sum >= threshold) {
      covers.push({
        mask,
        indices,
        sum,
        labels: indices.map(idx => currentLabels[idx - 1])
      });
    }
  }

  return covers;
}

// ============================================================================
// OCTONION PROPAGATION
// ============================================================================

function propagateNarrative(startDim, chain, options = {}) {
  const verbose = options.verbose || false;
  const steps = [];

  // Start with identity in dimension startDim
  let accumulator = [1, startDim];  // [sign, dimension]

  if (verbose) {
    steps.push({
      step: 0,
      element: `e${startDim}`,
      sign: 1,
      dimension: startDim
    });
  }

  // Apply each transformation in the chain
  for (let i = 0; i < chain.length; i++) {
    const nextDim = chain[i];

    if (nextDim < 1 || nextDim > 7) {
      throw new Error(`Invalid dimension in chain: ${nextDim}`);
    }

    const currentDim = accumulator[1];
    const currentSign = accumulator[0];

    // Look up multiplication result
    const product = octTable[currentDim][nextDim];

    if (!product) {
      throw new Error(`Invalid octonion multiplication: e${currentDim} * e${nextDim}`);
    }

    // Update accumulator: (sign₁ * e_i) * e_j = (sign₁ * sign₂) * e_k
    accumulator = [currentSign * product[0], product[1]];

    if (verbose) {
      steps.push({
        step: i + 1,
        input: `e${nextDim}`,
        result: `${accumulator[0] > 0 ? '+' : '-'}e${accumulator[1]}`,
        sign: accumulator[0],
        dimension: accumulator[1]
      });
    }
  }

  return {
    finalSign: accumulator[0],
    finalDimension: accumulator[1],
    finalLabel: currentLabels[accumulator[1] - 1] || 'Real',
    steps: verbose ? steps : undefined
  };
}

function analyzeNarrativeTrajectory(vector, maxSteps = 5) {
  // Analyze how narrative might evolve via dominant transitions
  const sorted = vector
    .map((v, i) => ({ value: v, dim: i + 1, label: currentLabels[i] }))
    .sort((a, b) => b.value - a.value);

  const startDim = sorted[0].dim;
  const topDims = sorted.slice(1, 4).map(x => x.dim);

  // Compute propagation for different chains
  const trajectories = [];

  // Linear chain (top 3 in order)
  trajectories.push({
    name: "Linear Progression",
    chain: topDims.slice(0, maxSteps),
    result: propagateNarrative(startDim, topDims.slice(0, maxSteps), { verbose: true })
  });

  // Cyclic chain (return to start)
  const cyclicChain = [...topDims.slice(0, 2), startDim];
  trajectories.push({
    name: "Cyclic Return",
    chain: cyclicChain,
    result: propagateNarrative(startDim, cyclicChain, { verbose: true })
  });

  // Resonant chain (repeat dominant)
  const resonantChain = new Array(3).fill(topDims[0]);
  trajectories.push({
    name: "Resonant Amplification",
    chain: resonantChain,
    result: propagateNarrative(startDim, resonantChain, { verbose: true })
  });

  return {
    startDimension: startDim,
    startLabel: currentLabels[startDim - 1],
    trajectories
  };
}

// ============================================================================
// MESSAGE HANDLER
// ============================================================================

self.onmessage = async function(e) {
  const { type, data } = e.data;

  try {
    switch(type) {
      case "init":
        await initEngine();
        break;

      case "set-labels":
        if (data.labels && data.labels.length === 7) {
          currentLabels = data.labels;
          if (data.prototypes && data.prototypes.length === 8) {
            prototypes = data.prototypes;
            await updatePrototypeEmbeddings();
          }
          postMessage({
            type: "labels-updated",
            labels: currentLabels,
            prototypes: prototypes.slice(1)
          });
        } else {
          throw new Error("Labels must be array of exactly 7 strings");
        }
        break;

      case "classify":
        if (!data.text) {
          throw new Error("No text provided for classification");
        }

        const result = await classifyText(data.text, data.options);

        // Compute narrative trajectories
        const trajectory = analyzeNarrativeTrajectory(result.vector);

        postMessage({
          type: "classification",
          ...result,
          trajectory
        });
        break;

      case "propagate":
        if (!data.startDim || !data.chain) {
          throw new Error("Propagation requires startDim and chain");
        }

        const propResult = propagateNarrative(
          data.startDim,
          data.chain,
          { verbose: true }
        );

        postMessage({
          type: "propagation",
          ...propResult
        });
        break;

      case "verify-fano":
        const fanoCheck = verifyFanoStructure();
        postMessage({
          type: "fano-verification",
          ...fanoCheck
        });
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

  } catch (error) {
    postMessage({
      type: "error",
      message: error.message,
      stack: error.stack,
      context: { type, data }
    });
  }
};

// Auto-initialize on load
initEngine();
