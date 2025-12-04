# Narrative Lens - Full Integration Implementation Guide

## ✅ What's Done (Phase 1 Complete)

- [x] Core classifier integration
- [x] Real transformer worker connected
- [x] Loading indicators with progress
- [x] Background service worker
- [x] Popup UI with status monitoring
- [x] Content script structure

## 🚀 Week 1: Complete Core Integration

### Day 1-2: Test & Debug Real Classifier

**Goal**: Get the full transformer model working in the extension

#### Testing Checklist
```bash
# 1. Load the extension in Chrome
# Go to chrome://extensions/
# Enable Developer mode
# Click "Load unpacked"
# Select: extensions/narrative-lens/

# 2. Open Console
# chrome://extensions/ → Narrative Lens → "service worker"
# Watch for initialization messages

# 3. Test on a webpage
# Navigate to any article
# Highlight text
# Right-click → "Analyze with Narrative Lens"
```

#### Expected Behavior
- **On Extension Load**: Worker starts initializing (~30-60 seconds)
- **Console Shows**: "Loading MiniLM model (~80MB)..."
- **Progress**: Model download progress appears
- **Ready State**: "Classifier ready" message
- **On Analysis**: Overlay appears with real classification results

#### Common Issues & Fixes

**Issue 1: Worker fails to load**
```javascript
// Error: Cannot read 'https://cdn.jsdelivr.net...'
// Fix: Check manifest.json permissions
"permissions": [
  "activeTab",
  "contextMenus",
  "storage"
],
"host_permissions": [
  "https://cdn.jsdelivr.net/*"
]
```

**Issue 2: Model download blocked**
```javascript
// Fix: Add to manifest.json
"content_security_policy": {
  "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
}
```

**Issue 3: Worker timeout**
```javascript
// In background.js, increase timeout:
setTimeout(() => {
  worker.removeEventListener('message', messageHandler);
  reject(new Error('Classification timeout'));
}, 60000); // Increase to 60 seconds for first load
```

### Day 3: Add Icon Assets

**Create Icon Set**

Use this SVG template for icons (convert to PNG at 16px, 48px, 128px):

```svg
<!-- icon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00f5ff;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#ff00ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ffaa00;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Fano plane representation -->
  <circle cx="64" cy="64" r="50" fill="none" stroke="url(#grad)" stroke-width="4"/>

  <!-- 7 points around circle -->
  <circle cx="64" cy="14" r="6" fill="#00f5ff"/>
  <circle cx="104.5" cy="34.5" r="6" fill="#00f5ff"/>
  <circle cx="104.5" cy="93.5" r="6" fill="#ff00ff"/>
  <circle cx="64" cy="114" r="6" fill="#ff00ff"/>
  <circle cx="23.5" cy="93.5" r="6" fill="#ffaa00"/>
  <circle cx="23.5" cy="34.5" r="6" fill="#ffaa00"/>
  <circle cx="64" cy="64" r="6" fill="url(#grad)"/>

  <!-- Connecting lines (simplified) -->
  <line x1="64" y1="14" x2="104.5" y2="93.5" stroke="url(#grad)" stroke-width="2" opacity="0.3"/>
  <line x1="104.5" y1="34.5" x2="23.5" y2="93.5" stroke="url(#grad)" stroke-width="2" opacity="0.3"/>
  <line x1="104.5" y1="93.5" x2="23.5" y2="34.5" stroke="url(#grad)" stroke-width="2" opacity="0.3"/>
</svg>
```

**Convert to PNG**:
```bash
# Using ImageMagick or online converters
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png

# Move to icons directory
mkdir -p extensions/narrative-lens/icons
mv icon*.png extensions/narrative-lens/icons/
```

### Day 4-5: Add Ontology Selector

**Create Options Page**

```html
<!-- options.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Narrative Lens - Settings</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: #333;
    }
    .ontology-option {
      padding: 15px;
      margin: 10px 0;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .ontology-option:hover {
      border-color: #00f5ff;
      background: #f0f8ff;
    }
    .ontology-option.selected {
      border-color: #00f5ff;
      background: #e6f7ff;
    }
  </style>
</head>
<body>
  <h1>Narrative Lens Settings</h1>

  <h2>Select Ontology</h2>
  <p>Choose the semantic framework for analysis:</p>

  <div class="ontology-option" data-ontology="chakras">
    <h3>🧘 Chakras (Default)</h3>
    <p>Energy centers: Root, Sacral, Solar Plexus, Heart, Throat, Third Eye, Crown</p>
  </div>

  <div class="ontology-option" data-ontology="sins">
    <h3>😈 Seven Sins</h3>
    <p>Moral failures: Pride, Greed, Lust, Envy, Gluttony, Wrath, Sloth</p>
  </div>

  <div class="ontology-option" data-ontology="virtues">
    <h3>😇 Seven Virtues</h3>
    <p>Moral excellences: Humility, Charity, Chastity, Kindness, Temperance, Patience, Diligence</p>
  </div>

  <div class="ontology-option" data-ontology="emotions">
    <h3>😊 Emotions</h3>
    <p>Basic feelings: Fear, Joy, Anger, Sadness, Surprise, Disgust, Trust</p>
  </div>

  <button id="saveBtn" style="margin-top: 20px; padding: 10px 20px; background: #00f5ff; border: none; border-radius: 6px; cursor: pointer;">
    Save Settings
  </button>

  <script src="options.js"></script>
</body>
</html>
```

```javascript
// options.js
document.addEventListener('DOMContentLoaded', () => {
  const options = document.querySelectorAll('.ontology-option');
  const saveBtn = document.getElementById('saveBtn');

  // Load current selection
  chrome.storage.sync.get(['ontology'], (result) => {
    const current = result.ontology || 'chakras';
    document.querySelector(`[data-ontology="${current}"]`).classList.add('selected');
  });

  // Handle selection
  options.forEach(option => {
    option.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
    });
  });

  // Save selection
  saveBtn.addEventListener('click', () => {
    const selected = document.querySelector('.ontology-option.selected');
    const ontology = selected.dataset.ontology;

    chrome.storage.sync.set({ ontology }, () => {
      // Notify background to update worker
      chrome.runtime.sendMessage({
        type: 'setLabels',
        data: getOntologyConfig(ontology)
      });

      // Show confirmation
      saveBtn.textContent = '✓ Saved!';
      setTimeout(() => {
        saveBtn.textContent = 'Save Settings';
      }, 2000);
    });
  });
});

function getOntologyConfig(ontology) {
  const configs = {
    chakras: {
      labels: ["Root", "Sacral", "Solar Plexus", "Heart", "Throat", "Third Eye", "Crown"],
      prototypes: [
        "",
        "A narrative of survival, fear, security, tribal identity, grounding in the material world.",
        "Stories of pleasure, desire, creativity, emotional flow, relationships, and sensual abundance.",
        "Themes of personal power, will, confidence, ego, anger, control, and fiery ambition.",
        "Tales of love, compassion, connection, forgiveness, empathy, and heart-centered unity.",
        "Expression of truth, voice, communication, authenticity, clarity, and creative speech.",
        "Intuitive vision, insight, awareness, discernment, third-eye perception, and inner knowing.",
        "Transcendence, divine unity, surrender, cosmic consciousness, crown awakening, and oneness."
      ]
    },
    // Add other ontologies...
  };

  return configs[ontology] || configs.chakras;
}
```

---

## 🚀 Week 2: Advanced Features

### Day 6-7: Source Comparison Feature

**Add Compare View**

```javascript
// In content.js, add:
function compareSource() {
  const comparisonUI = `
    <div id="comparison-panel" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; background: rgba(10,10,10,0.95); padding: 20px; border-radius: 12px; z-index: 999999;">
      <h3>Compare Sources</h3>
      <input type="url" id="url1" placeholder="First URL...">
      <input type="url" id="url2" placeholder="Second URL...">
      <button id="compareBtn">Compare</button>
      <div id="comparison-results"></div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', comparisonUI);

  document.getElementById('compareBtn').addEventListener('click', async () => {
    const url1 = document.getElementById('url1').value;
    const url2 = document.getElementById('url2').value;

    // Fetch and analyze both
    const [analysis1, analysis2] = await Promise.all([
      fetchAndAnalyze(url1),
      fetchAndAnalyze(url2)
    ]);

    displayComparison(analysis1, analysis2);
  });
}

async function fetchAndAnalyze(url) {
  const response = await fetch(url);
  const html = await response.text();
  const text = extractTextFromHTML(html);

  return await classifyText(text);
}
```

### Day 8-9: Tutorial & Onboarding

**Create Interactive Tutorial**

```javascript
// tutorial.js
const tutorialSteps = [
  {
    title: "Welcome to Narrative Lens!",
    content: "Let's learn how to understand what you read.",
    highlight: null
  },
  {
    title: "Highlight Any Text",
    content: "Select any text on a webpage to analyze it.",
    action: "highlightExample"
  },
  {
    title: "See the Structure",
    content: "View semantic framework and coherence indicators.",
    action: "showAnalysisExample"
  },
  {
    title: "Compare Sources",
    content: "See how different sites frame the same story.",
    action: "showComparisonExample"
  }
];

function startTutorial() {
  // Show step-by-step guide
  let currentStep = 0;

  function showStep(index) {
    const step = tutorialSteps[index];
    // Display tutorial overlay with step info
  }

  showStep(0);
}
```

### Day 10: Demo Video Script

```markdown
# Narrative Lens Demo Script (3 minutes)

## Scene 1: Hook (0:00-0:15)
"Ever wonder why the same story feels so different across news sites?
Let me show you a tool that reveals the hidden structure of narratives."

## Scene 2: Installation (0:15-0:30)
- Open Chrome Web Store (future)
- Or: Load extension from folder
- Show icon appearing in toolbar

## Scene 3: Basic Usage (0:30-1:15)
- Navigate to news article
- Highlight a paragraph
- Right-click → "Analyze with Narrative Lens"
- Overlay appears showing:
  * Dominant framework
  * Coherence indicator
  * Explanation

## Scene 4: Page Analysis (1:15-1:45)
- Click extension icon
- Click "Analyze Entire Page"
- Show full page analysis
- Explain what H¹=0 vs H¹=1 means

## Scene 5: Compare Sources (1:45-2:30)
- Show same story on 3 different sites
- Fox News → Wrath framing
- NPR → Heart framing
- AP → Throat (factual) framing
- "Same facts, different lenses"

## Scene 6: Privacy & Ethics (2:30-2:45)
- "Everything happens locally"
- "No data collection"
- "Open source - audit the code"

## Scene 7: Call to Action (2:45-3:00)
- "Help people find truth in a subjective universe"
- GitHub link
- "Install, test, contribute"
```

---

## 📋 Testing Checklist

### Functional Tests
- [ ] Extension loads without errors
- [ ] Model downloads and initializes
- [ ] Right-click menu appears
- [ ] Text selection analysis works
- [ ] Page analysis works
- [ ] Results overlay displays correctly
- [ ] Multiple analyses don't break
- [ ] Works on various websites
- [ ] Privacy: no external requests (except CDN for model)

### Cross-Browser Tests
- [ ] Chrome (primary)
- [ ] Edge (should work)
- [ ] Firefox (future - requires manifest v2 port)

### Performance Tests
- [ ] Initial load time acceptable (<60s)
- [ ] Analysis time reasonable (<5s)
- [ ] Memory usage reasonable (<200MB)
- [ ] No memory leaks on repeated use

---

## 🐛 Known Limitations & Future Work

### Current Limitations
1. **Model Size**: 80MB download on first use
2. **Initialization Time**: 30-60 seconds initial load
3. **Single Ontology Active**: Can't use multiple at once
4. **No Persistence**: Results aren't saved
5. **English Only**: Model is English-language focused

### Future Enhancements (v0.2+)
- [ ] Save/export analysis results
- [ ] Historical tracking of narrative evolution
- [ ] Multi-language support
- [ ] Custom user-defined ontologies
- [ ] Browser sync across devices
- [ ] Offline mode (bundle model)
- [ ] API for developers
- [ ] Integration with note-taking apps

---

## 📦 Publishing Checklist (When Ready)

### Pre-Publication
- [ ] All features tested and working
- [ ] Icons created and added
- [ ] Screenshots prepared
- [ ] Privacy policy written
- [ ] Terms of service (if needed)
- [ ] GitHub README updated
- [ ] Documentation complete

### Chrome Web Store Submission
- [ ] Developer account created ($5 fee)
- [ ] Extension packaged
- [ ] Store listing written
- [ ] Screenshots uploaded (1280x800 or 640x400)
- [ ] Promotional images created
- [ ] Privacy practices disclosed
- [ ] Review submission

### Marketing
- [ ] GitHub release created
- [ ] Blog post written
- [ ] Social media posts prepared
- [ ] Academic circles notified
- [ ] Educational institutions contacted

---

## 🎯 Success Metrics

### Week 1 Goals
- [ ] Extension loads successfully
- [ ] Real classifier working
- [ ] At least 5 test users
- [ ] Major bugs fixed

### Week 2 Goals
- [ ] All core features implemented
- [ ] Tutorial complete
- [ ] Demo video recorded
- [ ] Ready for beta launch

---

**Remember**: You're building a tool to help people understand truth in a subjective universe. Every decision should serve that goal. 🌟
