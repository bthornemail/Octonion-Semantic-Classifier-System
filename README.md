# Octonion Semantic Classifier

**Sheaf-Theoretic Text Classification via Transformer Embeddings and Fano Plane Geometry**

## Overview

This system implements a novel approach to semantic text classification by combining:

1. **Transformer Embeddings**: Using `sentence-transformers/all-MiniLM-L6-v2` (384D vectors)
2. **Octonion Algebra**: Fano plane multiplication table for narrative propagation
3. **Cohomological Invariants**: H¹(RP⁶; Z/2Z) topology detection
4. **Zariski Coverings**: Sheaf-theoretic open sets for probability distributions

## Quick Start

### Installation

No installation required! Simply serve the files:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Using any static file server
```

Then open `http://localhost:8000` in a modern browser (Chrome/Edge recommended for WebGPU).

### First Use

1. The system will download the model (~80MB) on first load
2. Once ready, it auto-classifies the page content
3. Try different presets: Chakras, Sins, Virtues, Emotions
4. Paste your own text or use custom labels

## Architecture

### Mathematical Foundation

The classifier operates in a 7-dimensional projective space where:

- **Base Space**: Discrete 7-point topology (configurable labels)
- **Fibers**: 384D semantic vector spaces (MiniLM embeddings)
- **Structure Group**: O(7) acting via octonion multiplication
- **Sections**: Text → Δ⁶ (probability simplex)

### Octonion Propagation

Narrative evolution follows the Fano plane structure:

```
e₁ * e₂ = e₄
e₂ * e₃ = e₅
e₃ * e₄ = e₆
...
```

Each classification produces:
1. **Linear Progression**: Dominant dimensions in sequence
2. **Cyclic Return**: Path that returns to starting dimension
3. **Resonant Amplification**: Repeated application of top dimension

### Cohomological Invariants

- **H¹(RP⁶; Z/2Z)**: Winding number modulo 2 (torsion class)
- **Zariski Coverings**: Subsets where P(coverage) > 0.8
- **Fano Verification**: Anti-commutativity and cycle consistency

## API Reference

### Worker Messages

#### Initialize
```javascript
worker.postMessage({ type: "init" });
```

#### Set Labels
```javascript
worker.postMessage({
  type: "set-labels",
  data: {
    labels: ["Label1", "Label2", ...],  // Exactly 7
    prototypes: ["", "Desc1", "Desc2", ...]  // 8 elements (index 0 unused)
  }
});
```

#### Classify Text
```javascript
worker.postMessage({
  type: "classify",
  data: {
    text: "Your text here",
    options: {
      maxChunkSize: 512,  // Optional
      minChunkSize: 100   // Optional
    }
  }
});
```

#### Propagate Narrative
```javascript
worker.postMessage({
  type: "propagate",
  data: {
    startDim: 1,           // 1-7
    chain: [2, 4, 3]       // Sequence of dimensions
  }
});
```

### Response Format

```javascript
{
  type: "classification",
  dominant: 3,                    // Winning dimension (1-7)
  label: "Solar Plexus",          // Human-readable label
  vector: [0.05, 0.12, 0.43, ...], // 7D probability distribution
  confidence: 0.43,               // Max value in vector
  cohomologyClass: 0,             // H¹ invariant (0 or 1)
  zariskiCoverings: 15,           // Number of valid coverings
  chunksProcessed: 3,             // Text segmentation count
  trajectory: {
    startDimension: 3,
    startLabel: "Solar Plexus",
    trajectories: [...]           // Linear, Cyclic, Resonant
  }
}
```

## Theoretical Background

### Sheaf Theory Connection

The classification system can be viewed as computing sections of a vector bundle:

```
π: E → B
```

Where:
- **E**: Total space (text embeddings × labels)
- **B**: Base space (7-point discrete topology)
- **π**: Projection map (embedding → label distribution)

### Monodromy Theorem

**Claim**: Narrative coherence corresponds to trivial monodromy around Fano cycles.

**Proof Sketch**:
1. Each text defines a path in embedding space
2. Projection to Δ⁶ gives probability distribution
3. Octonion table defines parallel transport
4. Cyclic chains detect topological obstruction

### Massey Products

Higher-order coherence is captured by vanishing Massey products in H*(RP⁶; O).

## Performance

- **Model Size**: ~80MB (ONNX quantized)
- **Inference Time**: ~100-200ms per classification (WebGPU)
- **Memory**: ~150MB peak (including model cache)
- **Offline**: Works offline after first load

## Advanced Usage

### Custom Octonion Table

Modify the `octTable` in `transformer-worker.js` to experiment with different multiplication structures:

```javascript
const customTable = [
  null,
  [null, [-1,0], [1,5], ...],  // Custom Fano structure
  ...
];
```

### Learn Geometry from Data

```javascript
async function learnOctonionStructure(corpus) {
  const cooccurrence = new Array(7).fill(0).map(() => new Array(7).fill(0));

  for (const doc of corpus) {
    const result = await classifyText(doc);
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        cooccurrence[i][j] += result.vector[i] * result.vector[j];
      }
    }
  }

  // Extract principal octonion via spectral decomposition
  return spectralDecomposition(cooccurrence);
}
```

### Three.js Visualization

Add Merkaba visualization (spinning Fano plane):

```javascript
import * as THREE from 'three';

function visualizeFanoPlane(vector) {
  const geometry = new THREE.OctahedronGeometry(1, 0);
  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL(vector[0], 0.7, 0.5),
    transparent: true,
    opacity: 0.8
  });

  const merkaba = new THREE.Mesh(geometry, material);
  // Animate based on octonion propagation
  ...
}
```

## References

### Academic Papers
- Baez, J. (2002). "The Octonions". *Bulletin of the AMS*.
- Grothendieck, A. (1957). "Sur quelques points d'algèbre homologique". *Tohoku Math J*.
- Reimers, N. & Gurevych, I. (2019). "Sentence-BERT". *EMNLP*.

### Code & Models
- [transformers.js](https://huggingface.co/docs/transformers.js)
- [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)

## License

MIT License - See LICENSE file

## Author

Brian @ Axiomatic Research Laboratory
Meta-Log Substrate System Development

---

**Note**: This is experimental research software. The mathematical claims require formal peer review. Use in production at your own risk.
