# Ethical Applications Suite

**Privacy-Preserving Tools for Truth-Seeking and Critical Thinking**

This directory contains four ethical applications built on the Octonion Semantic Classifier, all designed with transparency, privacy, and educational principles at their core.

## 🎯 Core Principles

✅ **Privacy First** - All analysis happens client-side in your browser
✅ **Open Source** - Full transparency, anyone can audit the code
✅ **Reproducible** - Same input always gives same output
✅ **No Data Collection** - We never see what you analyze
✅ **Educational Focus** - Empower understanding, not control narratives

---

## 📦 Applications

### 1. Narrative Lens (Browser Extension)

**Location**: `../extensions/narrative-lens/`

**Purpose**: Help readers understand the structure and coherence of what they're reading in real-time.

**Features**:
- 🔍 **Coherence Analysis** - Is this text internally consistent?
- 🎨 **Semantic Framing** - What perspective is being used?
- 📊 **Topology View** - Visualize the semantic structure
- 🔄 **Compare Sources** - See different framings side-by-side
- 💾 **Save Analyses** - Keep personal records locally

**How to Use**:
1. Load the extension in your browser (Chrome/Edge)
2. Highlight any text on a webpage
3. Right-click → "Analyze with Narrative Lens"
4. See coherence, framing, and topological structure

**Privacy**: All analysis happens locally. Nothing sent to servers.

---

### 2. Context Keeper (Personal Knowledge Management)

**Location**: `apps/context-keeper/`

**Purpose**: Help individuals maintain consistent understanding of what they've read and learned.

**Features**:
- 📚 **Reading History** - Track all articles you've analyzed
- 🕸️ **Knowledge Graph** - Visualize connections between your reading
- 🧠 **Belief Consistency Check** - Analyze your own writing for coherence
- 📊 **Pattern Discovery** - Find trends in what you read
- 💾 **Export/Import** - Full control over your data

**How to Use**:
1. Open `apps/context-keeper/index.html` in a browser
2. Add articles you've read for analysis
3. Check your own writing for internal consistency
4. Build your personal knowledge graph over time
5. Export your data anytime (JSON or CSV)

**Privacy**: All data stored in your browser (IndexedDB). Never leaves your device.

---

### 3. Truth Commons (Public Research Platform)

**Location**: `apps/truth-commons/`

**Purpose**: Create a public, transparent platform where anyone can verify narrative analysis.

**Features**:
- 🔍 **Public Fact-Checking** - Submit claims for transparent analysis
- 🔗 **Provenance Chain Verification** - Track how narratives evolve
- 📖 **Database of Verified Analyses** - Public repository of fact-checks
- ✓ **Full Transparency** - All methodology open and reproducible
- 🔓 **Open Source** - Anyone can audit and reproduce results

**How to Use**:
1. Open `apps/truth-commons/index.html`
2. Submit a claim and source URLs
3. Get transparent analysis showing methodology
4. Verify provenance chains to detect mutations
5. Export analyses for independent verification

**Privacy**: Analysis is public and reproducible. No personal data collected.

---

### 4. Educational Tools (Interactive Learning)

**Location**: `apps/educational-tools/`

**Purpose**: Teach people to think critically about information structure.

**Features**:
- 🎯 **Interactive Fano Plane Explorer** - Learn octonion algebra visually
- 📝 **Critical Thinking Exercises** - Gamified learning about narratives
- 🔍 **Coherence Detection** - Practice identifying inconsistencies
- 📐 **Theory & Background** - Understand the mathematics
- 🎓 **Self-Paced Learning** - Educational content for all levels

**How to Use**:
1. Open `apps/educational-tools/index.html`
2. Explore the Fano plane to see how perspectives combine
3. Complete exercises to practice critical analysis
4. Read theory section to understand the mathematics
5. Use real examples to test your skills

**Privacy**: Fully educational. No data collection.

---

## 🛠️ Shared Utilities

**Location**: `apps/shared/`

All applications use these privacy-preserving utilities:

### `classifier-client.js`
- Interface to the transformer-worker
- Privacy-preserving wrapper for semantic classification
- Supports batch processing

### `coherence-analyzer.js`
- Cohomological invariant computations (H¹)
- Zariski covering detection
- Narrative comparison utilities
- Statistical coherence measures

### `provenance-tracker.js`
- Track narrative evolution over time
- Detect mutations and changes
- Verify authenticity of chains
- Export for reproducibility

### `storage-manager.js`
- Privacy-first local storage (localStorage + IndexedDB)
- Full user control over data
- Export/import capabilities
- Storage statistics

---

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Edge, Firefox, Safari)
- Local web server (for CORS compliance)

### Quick Start

```bash
# Start a local server in the repository root
python -m http.server 8000

# Or use Node.js
npx http-server -p 8000
```

Then open in your browser:
- Narrative Lens: Load extension from `extensions/narrative-lens/`
- Context Keeper: `http://localhost:8000/apps/context-keeper/`
- Truth Commons: `http://localhost:8000/apps/truth-commons/`
- Educational Tools: `http://localhost:8000/apps/educational-tools/`

---

## 📊 Technology Stack

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **ML Model**: Sentence-Transformers (all-MiniLM-L6-v2)
- **Runtime**: Transformers.js (ONNX Runtime Web)
- **Mathematics**: Octonion algebra, sheaf theory, cohomology
- **Storage**: IndexedDB, localStorage
- **Privacy**: 100% client-side processing

---

## 🔐 Privacy Guarantees

All applications follow these principles:

1. **Client-Side Processing**: All analysis happens in your browser
2. **No Server Communication**: Zero data sent to external servers
3. **Local Storage Only**: All data stays on your device
4. **User Control**: You own and control all your data
5. **Exportable**: Export your data anytime in standard formats
6. **Open Source**: Full code transparency for auditing
7. **Reproducible**: Same input → same output, always

---

## 📖 Use Cases

### For Students
- Analyze sources for research papers
- Check your own writing for consistency
- Learn critical thinking about information
- Build personal knowledge base

### For Researchers
- Transparently analyze narrative structures
- Compare different framings of topics
- Track provenance of claims
- Collaborate with verifiable methodology

### For Journalists
- Understand different source framings
- Detect narrative mutations
- Verify claim evolution
- Maintain source coherence records

### For Educators
- Teach media literacy
- Interactive critical thinking lessons
- Demonstrate information structure
- Assess student understanding

### For Citizens
- Make informed decisions
- Understand news framing
- Verify information sources
- Develop critical analysis skills

---

## 🎯 Success Metrics

We measure success by:
- **Empowerment**: Do users feel more confident understanding complex information?
- **Education**: Are users learning about information structure?
- **Transparency**: Can users verify and reproduce all analyses?
- **Privacy**: Zero data collection maintained?
- **Accessibility**: Is the tool free and easy to use?

We explicitly **do not** measure:
- ❌ "Truth detection rate" (we don't claim to detect truth)
- ❌ Number of "propaganda" sources found (not our goal)
- ❌ User behavior changes (not tracking users)
- ❌ Market impact (not optimizing for profit)

---

## 🤝 Contributing

### For Developers
- Improve visualizations
- Add features (with ethical review)
- Optimize performance
- Fix bugs

### For Educators
- Develop lesson plans
- Create exercises
- Provide feedback
- Share use cases

### For Researchers
- Validate methodology
- Suggest improvements
- Collaborate on papers
- Contribute theory

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🌟 Vision

A world where:
- Anyone can understand how information is structured
- Narrative manipulation is harder because detection tools are free
- People can verify provenance of ideas themselves
- Critical thinking is assisted by transparent tools
- Knowledge is democratized, not controlled

**We're not building truth detectors. We're building understanding amplifiers.**

---

## 📧 Contact

**Author**: Brian Thorne
**Organization**: Axiomatic Research Laboratory
**Email**: bthornemail@gmail.com
**Support**: [Cash App](https://cash.app/$brianthorne) | [Venmo](https://venmo.com/u/brianthorne)

---

*Built with mathematical rigor, ethical responsibility, and hope for a more informed world.*
