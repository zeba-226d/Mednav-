# 🏥 MedNav — Accessible Indoor Hospital Navigation

An accessibility-first indoor navigation app for hospitals, built for the HSIL Hackathon 2026.

## Features

- **🗺️ Dijkstra Pathfinding** — Graph-based shortest path on a hospital floor plan with 15 rooms and 23 corridors
- **♿ Accessibility Modes** — Wheelchair (avoids stairs/narrow), Low Vision (high contrast), Hearing (visual-only + sign phrases), Cognitive (simplified directions)
- **🌐 6 Languages** — English, Spanish, Chinese, Arabic (RTL), Hindi, French — all UI, room labels, and phrases translated
- **🤟 Sign Language Phrases** — 14 common hospital phrases with category filtering and multilingual display

## Tech Stack

- React 18 + Vite
- Dijkstra's Algorithm (custom implementation)
- SVG interactive map
- CSS-in-JS (no external UI library)
- Deployed on Vercel

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173
```

## Deploy to Vercel

```bash
# Option A: Vercel CLI
npm i -g vercel
vercel

# Option B: GitHub → Vercel
# 1. Push to GitHub
# 2. Go to vercel.com → New Project → Import your repo
# 3. Framework: Vite → Deploy
```

## Project Structure

```
mednav-app/
├── index.html          # Entry HTML
├── package.json        # Dependencies & scripts
├── vite.config.js      # Vite configuration
├── public/
│   └── favicon.svg     # App icon
└── src/
    ├── main.jsx        # React entry point
    ├── index.css       # Global CSS reset
    └── MedNav.jsx      # Main app component (all logic here)
```

## How It Works

### Pathfinding
The hospital is modelled as a weighted undirected graph. Each room is a node, each corridor is an edge with a distance weight. Dijkstra's algorithm finds the shortest path, with accessibility-aware edge filtering:
- **Wheelchair mode**: removes edges with stairs or narrow width before running Dijkstra
- **Cognitive mode**: simplifies the generated turn-by-turn directions

### Accessibility
Four toggleable modes that modify both the pathfinding algorithm and the UI:
- Wheelchair → graph edge filtering + route weight adjustment
- Vision → theme swap to high-contrast colours + larger fonts
- Hearing → enables sign language phrase panel + visual-only navigation
- Cognitive → simplified direction text (arrow + destination only)

## Team

Built for HSIL Hackathon 2026 (Harvard/Sydney Innovation Lab)

## License

MIT
