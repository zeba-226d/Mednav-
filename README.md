<img width="474" height="713" alt="Screenshot 2026-08-31 at 8 14 20 am" src="https://github.com/user-attachments/assets/2d67bcb7-93e6-4df4-a3a8-bcd7eaed5e5d" />
# 🏥 MedNav

> **Navigate with confidence. Communicate without barriers.**

An accessibility-first indoor hospital navigation platform built for the **HSIL Hackathon 2026** (Sydney Hub).

According to the WHO, **1 in 5 hospital visitors** struggle with navigation due to disability, language barriers, or unfamiliarity with the building. MedNav exists because getting lost in a hospital shouldn't delay critical care.

🔗 **Live demo:** [mednav.vercel.app](https://mednav.vercel.app)

---

## 🧩 What MedNav Is

**MedNav is a platform, not a single-hospital app.** Think of it like Shopify for hospital wayfinding: we built the engine, any hospital can plug in their floor plan.

The product has two parts:

**1. The Engine (what we sell)**  
The React app, the Dijkstra pathfinding algorithm with accessibility-aware graph modification, the 6-language i18n system, the sign language phrase library, the dark mode theme system, and the patient flow logic. This is layout-agnostic — it works on any hospital.

**2. The Data Layer (what hospitals provide)**  
Each hospital provides their floor plan data: rooms with coordinates, corridors with accessibility properties (stairs, width), and floor numbers. This maps directly to our `ROOMS` and `EDGES` data structures. Once provided, all features — pathfinding, accessibility, multilingual support, sign language — work automatically on the new layout.

The hospital shown in our demo is a realistic 5-floor, 55-room example we built to prove the platform handles every major hospital department type (Emergency, OPD, Diagnostics, IPD, Surgery, ICU). In production, the first thing we'd do with a pilot hospital is translate their real floor plan into our data format — a process that takes a hospital admin about a day with our admin tool.

**Why a platform approach?** 164,000+ hospitals worldwide need accessible wayfinding. A single-hospital app doesn't scale. A platform that any hospital can adopt does.

---

## ✨ Features

- 🗺️ **Multi-floor Dijkstra pathfinding** — 5 floors, 55+ rooms, 100+ corridors covering Emergency, OPD, Diagnostics, IPD wards, Surgery, and ICU
- ♿ **Accessibility-first architecture** — Wheelchair mode modifies the pathfinding graph itself, removing stairs and narrow corridors *before* the algorithm runs
- 🌐 **6 languages with full RTL** — English, Arabic, Spanish, Chinese, Hindi, French (3.5B native speakers covered)
- 🤟 **Sign language communication** — 14 hospital phrases with gesture instructions and a "Show to Staff" fullscreen mode
- 🌙 **Dark mode** — complete theme system with light/dark variants
- 🏥 **Patient flow presets** — quick navigation for OPD, IPD, and Emergency journeys
- 📱 **100% client-side** — works offline once loaded, no backend required

---

## 🧠 How It Works

### Pathfinding
The hospital is modelled as a weighted undirected graph. Rooms are nodes, corridors are edges with distance weights. **Dijkstra's algorithm** finds the shortest path — but with a twist that makes MedNav different from every competitor:

**The graph itself changes based on accessibility needs.** In wheelchair mode, stair edges and narrow corridors are removed from the adjacency list *before* pathfinding runs. The algorithm literally cannot produce an inaccessible route — accessibility isn't a filter on the output, it's built into the architecture.

- **Complexity:** O(V²) where V = 55 nodes — runs in under 1ms
- **Multi-floor:** Lifts and stairs are modelled as inter-floor edges; the algorithm treats all 5 floors as one connected graph

### Accessibility Modes
Four toggleable modes that work independently or combined:
- **Wheelchair** — graph edge filtering + 15% weight penalty on remaining edges (prefers wider routes)
- **Low Vision** — larger fonts and higher contrast
- **Hearing** — visual-only navigation, auto-opens sign language phrases
- **Cognitive** — simplified directions (one action per step, no distances)

### Internationalisation
Custom key-value translation system. UI strings, room labels, and sign language phrases are all separately translated. Adding a new language takes under an hour — a Japanese hospital could add Japanese in 60 minutes.

---

## 🛠️ Tech Stack

- **React 18** with hooks (functional components)
- **Vite** build tool
- **Dijkstra's algorithm** (custom implementation, no external graph libraries)
- **SVG** interactive map drawn inline in JSX
- **CSS-in-JS** (no external UI library)
- **Vercel** deployment with auto-deploy from GitHub

---

## 🚀 Getting Started
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:5173
```

### Deploy to Vercel
```bash
# Option A: Vercel CLI
npm i -g vercel
vercel

# Option B: GitHub → Vercel
# 1. Push to GitHub
# 2. Go to vercel.com → New Project → Import your repo
# 3. Framework: Vite → Deploy
```

---

## 📁 Project Structure
mednav-app/
├── index.html          # Entry HTML
├── package.json        # Dependencies & scripts
├── vite.config.js      # Vite configuration
├── public/
│   └── favicon.svg     # App icon
└── src/
├── main.jsx        # React entry point
├── index.css       # Global CSS reset
└── MedNav.jsx      # Main app component (all logic in one file)

---

## 🤝 Built With

We used AI tools as a development accelerator throughout this hackathon — the same way developers use libraries, frameworks, and Stack Overflow. Every architectural decision was made by the team: combining navigation with accessibility-first pathfinding and sign language, modifying the graph structure rather than overlaying accessibility filters, the language selection covering WHO priority regions, the OPD/IPD structure, and the patient flow presets. AI helped us write code faster so we could focus on what matters: user experience, accessibility, and impact.

---

## 👥 The Team

Built for HSIL Hackathon 2026 — Sydney Hub  
University of Sydney · Bachelor of Advanced Computing

- **Team Member 1** — Speaker / Lead
- **Team Member 2** — Demo Operator
- **Team Member 3** — Technical Q&A
- **Team Member 4** — Business & Strategy

---

## 💜 Why MedNav

Existing wayfinding solutions like MazeMap, Connexient, and Gozio Health offer general indoor navigation but none modify the pathfinding graph based on accessibility needs, and none include integrated sign language communication. MedNav's edge: **accessibility isn't a feature overlay — it's the architecture**.

**1 in 5 people shouldn't have to navigate a hospital in fear. With MedNav, they don't have to.**

---

## 📄 License

MIT

---

*Built for HSIL Hackathon 2026 — Sydney Hub · April 10–11, 2026*
