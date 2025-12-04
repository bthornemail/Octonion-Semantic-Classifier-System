# Octonion Semantic Classifier - Live Demo

**🌐 Live Demo**: This folder contains the GitHub Pages deployment of the Octonion Semantic Classifier.

## What is this?

This is a browser-based semantic text classification system that combines:

- **Transformer Embeddings** (sentence-transformers/all-MiniLM-L6-v2)
- **Octonion Algebra** (Fano plane multiplication for narrative propagation)
- **Cohomological Invariants** (topological analysis of semantic space)
- **Interactive UI** with 4 preset label systems + custom labels

## Try It Now!

The system is fully client-side - no server required!

1. **Open the live demo** (GitHub Pages URL will be here once deployed)
2. Wait for the model to download (~80MB, first time only)
3. Try classifying text with different semantic frameworks:
   - 🧘 **Chakras** - Energy centers and consciousness levels
   - 😈 **Seven Sins** - Vices and moral failures
   - 😇 **Seven Virtues** - Moral excellences and virtues
   - 😊 **Emotions** - Basic emotional categories
   - ✏️ **Custom Labels** - Define your own 7-point classification

## Features

### Classification Modes
- Real-time text classification into 7 semantic dimensions
- Probability distribution visualization with color gradients
- Confidence scores and topological invariants

### Octonion Propagation
- **Linear Progression** - Sequential narrative evolution
- **Cyclic Return** - Paths that loop back to origin
- **Resonant Amplification** - Reinforcement through repetition

### Mathematical Foundations
- **Fano Plane Verification** - Check octonion multiplication table integrity
- **H¹(RP⁶; Z/2Z)** - Cohomology class (winding number detection)
- **Zariski Coverings** - Sheaf-theoretic probability analysis

## Performance

- **Model Size**: ~80MB (ONNX quantized)
- **Inference**: ~100-200ms per classification (WebGPU)
- **Memory**: ~150MB peak (including model cache)
- **Offline**: Works offline after initial model download

## For Developers

### Source Code
The full source code is in the parent repository:
- `../src/transformer-worker.js` - Core classification engine
- `../index.html` - Complete UI implementation
- `../README.md` - Full documentation

### Local Development
```bash
# From repository root
python -m http.server 8000
# or
npm run dev

# Then open http://localhost:8000
```

### API Usage
```javascript
const worker = new Worker('src/transformer-worker.js', { type: 'module' });

// Classify text
worker.postMessage({
  type: 'classify',
  data: { text: 'Your text here...' }
});

// Listen for results
worker.onmessage = (e) => {
  if (e.data.type === 'classification') {
    console.log('Dominant dimension:', e.data.label);
    console.log('Vector:', e.data.vector);
    console.log('Trajectory:', e.data.trajectory);
  }
};
```

## References

### Academic
- Baez, J. (2002). "The Octonions". *Bulletin of the AMS*
- Grothendieck, A. (1957). "Sur quelques points d'algèbre homologique"
- Reimers, N. & Gurevych, I. (2019). "Sentence-BERT". *EMNLP*

### Technical
- [transformers.js](https://huggingface.co/docs/transformers.js) - Browser ML framework
- [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) - Sentence embeddings
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/) - WebAssembly inference

## License

MIT License - See [LICENSE](../LICENSE)

## Author

**Brian @ Axiomatic Research Laboratory**
Meta-Log Substrate System Development

---

**Note**: This is experimental research software. The mathematical claims require formal peer review. Use in production at your own risk.

## GitHub Pages Setup

This folder is configured for GitHub Pages deployment:

1. Go to repository **Settings** → **Pages**
2. Set **Source** to: `main` branch, `/docs` folder
3. Save and wait for deployment (usually ~1 minute)
4. Your live demo will be available at: `https://<username>.github.io/<repository-name>/`

Enjoy exploring semantic topology! 🌀✨
