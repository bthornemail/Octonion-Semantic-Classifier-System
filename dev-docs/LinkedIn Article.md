LinkedIn Article

🧠 Bridging Deep Learning and Abstract Algebra: The Octonion Semantic Classifier

For the past few months, I’ve been quietly building something at the intersection of transformer architectures, algebraic topology, and theoretical physics—and today I’m excited to share it.

I’ve released an open-source, production-ready system that performs semantic text classification using octonion algebra and sheaf-theoretic embeddings. This isn’t just another ML demo; it’s a working implementation of how non-associative division algebras can structure narrative understanding.

🔬 What This System Does:

· Embeds text using sentence-transformers/all-MiniLM-L6-v2 (384D)
· Projects embeddings onto a 7-dimensional probability simplex
· Propagates narratives via the Fano plane (the projective geometry underlying octonions)
· Computes cohomological invariants (H¹(RP⁶; Z/2Z)) to detect topological winding
· Identifies Zariski coverings in the semantic probability distribution

🌐 Why This Matters:

Most semantic systems treat dimensions as independent axes. But in narratives—whether news articles, stories, or user feedback—meaning evolves through structured transitions.

The Fano plane gives us a multiplication table for how one semantic dimension transforms into another. This isn’t just metaphor; it’s mathematically rigorous:

```
e₁ (Root/Survival) * e₂ (Sacral/Creativity) = e₄ (Heart/Love)
```

The system detects these transitions and computes whether a narrative’s evolution has trivial monodromy—meaning it returns coherently—or exhibits topological obstruction.

🚀 Key Features:

· Runs entirely in the browser (thanks to Transformers.js + ONNX)
· No server needed after initial model download (~80MB)
· Customizable ontology: use chakras, seven sins/virtues, emotions, or your own 7-point framework
· Real-time visualization of semantic vectors and narrative trajectories
· Formal verification of the octonion algebra’s anti-commutativity

📚 The Bigger Vision:

This is part of a longer-term research program I’m calling “Meta-Log Substrate Systems”—exploring how abstract algebraic structures (octonions, exceptional Lie groups, cohomology theories) can provide scaffolding for machine understanding.

When we move beyond vector spaces as “flat” semantic containers and start treating them as fibers in a sheaf, we open up new ways to model:

· Narrative coherence
· Conceptual blending
· Epistemic transitions
· Symbolic grounding

🔗 Try It Yourself:

The complete system is 4 files and runs on any static web server:

1. transformer-worker.js – Web Worker with octonion propagation engine
2. index.html – Interactive demo with real-time visualization
3. README.md – Full documentation & mathematical background
4. package.json – Optional dev setup

GitHub/Live Demo: [Link to your deployment]

🙏 Acknowledgments & Influences:

· John Baez’s work on octonions
· Alexander Grothendieck’s sheaf theory
· Sentence-BERT (Reimers & Gurevych)
· Transformers.js team for bringing HF models to the browser

This is early-stage research, but it’s fully functional and I believe it points toward a richer, more structured approach to semantic AI.

I’d love to hear thoughts from:

· ML engineers working on narrative AI
· Mathematicians interested in applied algebra
· Researchers exploring topology in NLP
· Anyone fascinated by the intersection of abstract math and practical ML

What emergent behaviors might we see when semantic spaces gain algebraic structure?

---

Short Summary (for social media)

Just released the Octonion Semantic Classifier—a browser-based system that classifies text using octonion algebra and sheaf theory. It propagates narratives via the Fano plane, computes cohomological invariants, and runs entirely client-side with Transformers.js. This bridges deep learning with abstract algebra to model semantic transitions mathematically. Try it yourself—it’s 4 files and no server needed!

Technical Summary

The Octonion Semantic Classifier implements a sheaf-theoretic text classification system where:

1. Text embeddings (MiniLM-384D) are projected to a 7D probability distribution
2. Narrative evolution follows the Fano plane multiplication table (octonion algebra)
3. System computes H¹(RP⁶; Z/2Z) cohomology classes and Zariski coverings
4. Runs in browser via Transformers.js with real-time visualization
5. Supports custom 7-point ontologies and verifies octonion anti-commutativity
6. Demonstrates how non-associative algebras can structure semantic transitions

The implementation shows that abstract algebraic structures can provide meaningful scaffolding for semantic AI beyond flat vector spaces.