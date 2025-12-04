# Narrative Lens - Browser Extension

**Understand the structure and coherence of what you read.**

## What It Does

Narrative Lens helps you understand information by analyzing its semantic structure:

- 🔍 **Coherence Analysis** - Is this text internally consistent?
- 🎨 **Semantic Framing** - What perspective is being presented?
- 📊 **Topology Visualization** - See the structure of ideas
- 🔄 **Source Comparison** - Compare how different sources frame the same topic

## Privacy First

- ✅ All analysis happens **locally in your browser**
- ✅ **Zero data collection** - we never see what you analyze
- ✅ **Open source** - audit the code yourself
- ✅ **No tracking** - no analytics, no telemetry
- ✅ **No servers** - no data ever leaves your device

## Installation

### Chrome/Edge (Development Mode)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Octonion-Semantic-Classifier-System
   cd Octonion-Semantic-Classifier-System/extensions/narrative-lens
   ```

2. Open Chrome/Edge and go to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top right)

4. Click **Load unpacked**

5. Select the `narrative-lens` folder

6. The extension is now installed! Look for the Narrative Lens icon in your toolbar.

### Firefox (Coming Soon)

Firefox support is planned for a future release.

## How to Use

### Method 1: Analyze Selected Text

1. **Highlight any text** on a webpage
2. **Right-click** and select "Analyze with Narrative Lens"
3. See the analysis overlay with:
   - Dominant semantic framework
   - Coherence indicator (H¹ class)
   - Confidence score
   - Explanation

### Method 2: Analyze Entire Page

1. Click the **Narrative Lens icon** in your toolbar
2. Click **"Analyze Entire Page"**
3. See the overall analysis of the page content

## What the Analysis Means

### Dominant Framework
The primary perspective or "lens" through which the text is framed.

Example frameworks (using Chakra ontology):
- **Root** - Survival, security, fear, grounding
- **Heart** - Love, compassion, connection
- **Throat** - Truth, expression, communication
- **Third Eye** - Insight, awareness, vision
- **Crown** - Transcendence, spirituality, unity

### Coherence (H¹ Class)
- **H¹ = 0** (✓ Consistent): Text presents a coherent narrative without major internal contradictions
- **H¹ = 1** (⚠ Contains tensions): Text shows complexity, multiple perspectives, or potential contradictions

**Note**: Neither is "good" or "bad" - complex topics often require multiple perspectives!

### Confidence Score
How strongly the text aligns with the detected framework (0-100%).

## Current Status

**Version**: 0.1.0 (Prototype)

**Status**: Early development - not yet using the full octonion classifier

**Current Implementation**:
- ✅ User interface complete
- ✅ Context menu integration
- ✅ Analysis overlay
- ✅ Privacy-preserving architecture
- 🔄 Simple heuristic classifier (placeholder)
- ⏳ Full transformer + octonion integration (coming soon)

## Roadmap

### Phase 1: Foundation (Current)
- [x] Extension architecture
- [x] User interface
- [x] Context menu integration
- [ ] Integrate actual transformer worker
- [ ] Integrate octonion classifier

### Phase 2: Features
- [ ] Compare multiple sources side-by-side
- [ ] Track how narratives evolve over time
- [ ] Custom ontologies (beyond Chakras)
- [ ] Export analysis results
- [ ] Keyboard shortcuts

### Phase 3: Advanced
- [ ] Visual topology graphs
- [ ] Provenance chain tracking
- [ ] Historical context lookup
- [ ] Educational mode (learn while analyzing)
- [ ] Mobile support

## Technical Architecture

```
Extension Structure:
├── manifest.json         # Extension configuration
├── popup.html/js        # Extension popup UI
├── content.js           # Runs on web pages
├── background.js        # Service worker
├── worker.js            # Classification engine (planned)
└── icons/               # Extension icons
```

### Current Limitations

1. **Placeholder Classifier**: Currently uses simple keyword matching instead of the full transformer + octonion classifier
2. **No Offline Model**: Full model integration requires bundling ~80MB model
3. **Single Ontology**: Only Chakra framework available (others planned)
4. **No Persistence**: Analysis results aren't saved (coming in Phase 2)

### Integration Plan

To integrate the full classifier:
1. Bundle transformer model or load from CDN
2. Initialize Web Worker with octonion classifier
3. Replace placeholder `classifyTextSimple()` with actual classification
4. Add loading indicators for model initialization

## Development

### Prerequisites
- Chrome/Edge browser (v88+)
- Basic understanding of JavaScript
- Extension development mode enabled

### Local Development

1. Make changes to the extension files
2. Go to `chrome://extensions/`
3. Click **Reload** icon for Narrative Lens
4. Test your changes

### Testing

```bash
# Run tests (when implemented)
npm test

# Lint code
npm run lint
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

**Areas where we need help:**
- Integrating the full transformer model
- Performance optimization
- UI/UX improvements
- Multi-language support
- Accessibility features

## Ethics & Responsible Use

### What This Tool Is
- ✅ A lens for understanding structure
- ✅ An educational tool for critical thinking
- ✅ A privacy-preserving analysis system

### What This Tool Is Not
- ❌ A "truth detector"
- ❌ A propaganda identifier
- ❌ A moral judgment system
- ❌ A replacement for critical thinking

### Responsible Use Guidelines

1. **Understand Limitations**: This is an experimental research tool
2. **Verify Claims**: Don't rely solely on automated analysis
3. **Respect Privacy**: Don't analyze others' private communications
4. **Context Matters**: Coherence ≠ truth, tension ≠ falsehood
5. **Continuous Learning**: Use as a tool for understanding, not judgment

## Support

- **Issues**: [GitHub Issues](https://github.com/bthornemail/Octonion-Semantic-Classifier-System/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bthornemail/Octonion-Semantic-Classifier-System/discussions)
- **Email**: bthornemail@gmail.com

**Support Development**:
💰 [Cash App](https://cash.app/$brianthorne) | [Venmo](https://venmo.com/u/brianthorne)

## License

MIT License - See [LICENSE](../../LICENSE)

## Acknowledgments

- Built on [transformers.js](https://huggingface.co/docs/transformers.js)
- Uses [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- Inspired by sheaf theory, octonion algebra, and a desire for epistemic transparency

---

**Remember**: This tool helps you understand structure, not determine truth. Use it as one of many lenses for critical thinking.

*Built with mathematical rigor and ethical responsibility.*
