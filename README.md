# Rishab Kumar — Personal Portfolio & Engineering Lab

[![Live Site](https://img.shields.io/badge/Live_Site-rishabkr0.github.io%2FMyPortfolio-1E40AF?style=for-the-badge&logo=githubpages&logoColor=white)](https://rishabkr0.github.io/MyPortfolio/)
[![Pure Vanilla Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-EA580C?style=for-the-badge&logo=javascript&logoColor=white)](https://github.com/Rishabkr0/MyPortfolio)
[![Zero External Dependencies](https://img.shields.io/badge/Dependencies-0%20(Pure%20Vanilla)-141412?style=for-the-badge&logo=npm&logoColor=white)](https://github.com/Rishabkr0/MyPortfolio)
[![GitHub License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **"Building resilient software and AI products."**  
> A high-craft, editorial portfolio website showcasing autonomous agents, client-side web utilities, interactive algorithm simulations, and frontend systems. Built by **Rishab Kumar**, a 2nd-year Computer Science & Engineering undergraduate at Shri Ramswaroop Memorial University (SRMU), Lucknow.

---

## 🌐 Live Deployment

Experience the interactive simulation, live audio and algorithm canvases, and project archives:  
👉 **[https://rishabkr0.github.io/MyPortfolio/](https://rishabkr0.github.io/MyPortfolio/)**

---

## ✨ Key Highlights

- **Interactive Pixel Koi Pond Engine (`koi-pond.js`)**:
  - Custom 60fps HTML5 `<canvas>` simulation inspired by Japanese digital zen gardens and mosaic art.
  - 7 procedural koi fish rendered from dynamic square tile matrices with authentic fin physics, waggle cycles, and traditional Sanke/Kohaku colorations (Royal Cobalt Blue `#1E40AF` & Terracotta Orange `#EA580C`).
  - Interactive feeding mechanics: clicking or tapping drops square food pellets that produce realistic radial ripple waves.
  - Intelligent collision avoidance with dynamic exclusion zones ensuring koi naturally inhabit open water areas around the typography.
  - Live micro-HUD tracking real-time koi and pellet counts.

- **Zero-Dependency Vanilla Architecture**:
  - 100% native Web standards: Semantic HTML5, modern CSS3 (Custom Properties, Grid, Flexbox, fluid typography via `clamp()`), and vanilla ES6+ JavaScript.
  - Zero framework overhead, zero third-party scripts, and zero bundler requirements. Instant load times and sub-50ms Time to Interactive (TTI).

- **Creative Explorations & 2nd-Year CS Sandbox (`#explorations`)**:
  - **A\* Grid Pathfinder**: Interactive 2D square-tile pathfinder stepping through Manhattan heuristic graph search around procedural maze barriers with real-time visited and step counters.
  - **Sorting Race Lab**: Live Quicksort visualization highlighting pivot selection, active comparison pointers, and swap counters.
  - **75% Attendance & Bunk Planner**: A practical, relatable campus utility modeling lecture thresholds, semester holidays, and safe skip margins for university compliance.

- **Curated Projects Showcase (`#work`)**:
  - Interactive multi-view image toggles, technical specifications, architecture notes, and deep links to source code repositories.
  - Accessible modal lightbox with focus trapping and keyboard navigation.

- **High-Contrast Editorial Aesthetics**:
  - Warm paper canvas (`#F4F2EC`) balanced by dark graphite sanctuary sections (`#141412`).
  - Strict typography hierarchy powered by **Syne** (display headlines), **Newsreader** (editorial serif accents), and **JetBrains Mono** (code & telemetry).

---

## 🛠️ Featured Projects

| Project | Category | Tech Stack | Highlights |
| :--- | :--- | :--- | :--- |
| **[C.A.S.P.E.R](https://github.com/Rishabkr0)** | Autonomous AI Desktop Agent | Python, PyQt6, Ollama, TTS Engine | Local desktop assistant capable of file management, intent classification, local LLM inference, and zero-cloud voice workflows. |
| **[ToolHub](https://github.com/Rishabkr0)** | 100% Client-Side Web Utilities | Vanilla JS, Web Workers, Canvas, PDF.js | Privacy-first document conversion, PDF manipulators, and image processors executing entirely in-browser with 0 bytes transmitted to any server. |
| **[RCODE Systems](https://github.com/Rishabkr0)** | Frontend Design Architecture | HTML5, Modern CSS, Vanilla JS | Ultra-clean UI components, modular design token implementations, and accessible navigation patterns built without third-party frameworks. |
| **[CodeVerse IDE](https://github.com/Rishabkr0)** | Browser-Based Code Runner | JavaScript, Web Workers, AST Parser | Sandboxed code editor and runtime sandbox featuring syntax highlighting, live evaluation, and thread isolation. |

---

## 📁 Repository Structure

```text
MyPortfolio/
├── .nojekyll                 # Prevents Jekyll processing on GitHub Pages
├── index.html                # Single-page application structure & semantic layout
├── style.css                 # Comprehensive design system, tokens, and animations
├── koi-pond.js               # 60fps canvas pixel koi fish simulation & physics engine
├── script.js                 # UI interactions, A* pathfinder, Quicksort visualizer, modal logic
├── assets/
│   └── images/               # High-resolution project previews, screenshots, and icons
└── README.md                 # Project documentation and setup guide
```

---

## 🎨 Design Tokens & Color Palette

| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| `--canvas-paper` | `#F4F2EC` | Main light page background & warm paper texture |
| `--canvas-paper-subtle` | `#FAF8F3` | Form cards, interactive containers, and elevated light surfaces |
| `--graphite-base` | `#141412` | Dark sanctuary background (Explorations & Services) |
| `--graphite-surface` | `#1C1C1A` | Dark cards, code terminals, and elevated dark elements |
| `--cobalt-deep` | `#1E3A8A` | Primary brand accent & Royal Cobalt koi body tiles |
| `--primary-container` | `#1E40AF` | Button hovers, active focus rings, and primary interactive badges |
| `--terracotta-koi` | `#EA580C` | Secondary accent, resolved pathfinder lines, and koi spots |
| `--confetti-lime` | `#C3EB38` | Terminal indicators, status pings, and algorithmic success states |

---

## 🚀 Local Development Setup

To run this repository locally without any dependencies or package managers:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rishabkr0/MyPortfolio.git
   cd MyPortfolio
   ```

2. **Serve the project:**
   Because all assets and imports use relative paths, you can view the portfolio in several ways:

   - **Using Python 3:**
     ```bash
     python -m http.server 8000
     ```
     Then open `http://localhost:8000` in your browser.

   - **Using Node.js (`npx serve`):**
     ```bash
     npx serve .
     ```

   - **Using VS Code Live Server:**  
     Right-click `index.html` and click **"Open with Live Server"**.

3. **Verify JavaScript syntax:**
   ```bash
   node -c script.js
   node -c koi-pond.js
   ```

---

## ⚡ Performance & Standards

- **0 Dependencies**: Zero npm packages, zero external CDNs required for runtime logic.
- **Fluid Responsiveness**: Scaled via CSS `clamp()` units across ultra-wide monitors, laptops, tablets, and mobile devices.
- **Accessible & Semantic**: ARIA labels, semantic markup (`<header>`, `<main>`, `<section>`, `<article>`), focus-visible states, and WCAG AA contrast ratios.
- **Hardware Acceleration**: Pixel koi physics and algorithm canvas loops use decoupled `requestAnimationFrame()` loops with automatic `devicePixelRatio` scaling.

---

## 📬 Contact & Connect

- **Developer**: Rishab Kumar
- **Degree**: B.Tech, Computer Science & Engineering (2nd Year)
- **University**: Shri Ramswaroop Memorial University (SRMU), Lucknow, India
- **Email**: [rishabkr2005@gmail.com](mailto:rishabkr2005@gmail.com)
- **GitHub**: [@Rishabkr0](https://github.com/Rishabkr0)
- **LinkedIn**: [linkedin.com/in/rishab-kumar](https://linkedin.com/in/rishab-kumar)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to explore, learn from, and adapt the techniques used here.
