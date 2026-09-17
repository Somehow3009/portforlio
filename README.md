# The Developer's Universe

A spatial 3D, gamified portfolio — a short browser adventure instead of a flat CV. You pilot a small probe across four floating islands that map to the developer's skills, projects, and contact info.

## Tech stack

- **3D engine**: Three.js + React Three Fiber (R3F) + @react-three/drei
- **State**: Zustand
- **UI**: Tailwind CSS (2D overlay panels)
- **Audio**: Web Audio API (procedural — no audio assets)
- **Build**: Vite + TypeScript

## Running

```bash
npm install
npm run dev      # local dev server
npm run build    # production build -> dist/
npm run lint     # oxlint
```

## Controls

- **WASD / arrow keys** — move the probe (camera-relative)
- **E** — interact with nearby objects (inspect projects, open terminal)
- **Touch**: drag anywhere on mobile — a virtual move-zone appears
- Top-right buttons: **2D MODE** (low-power CV fallback) and **HOME**

## The four zones

1. **The Landing Platform** — welcome & bio; intro cinematically descends from space.
2. **The Skill Forge** — energy towers per technology; approaching a tower lights it up and raises its mastery bar; each "solves" into a stat panel.
3. **The Project Galaxy** — each project is a floating hologram; approaching highlights it, pressing **E** zooms a full detail card (problem / solution / stack / GitHub / live demo).
4. **The Innovation Hub** — observatory with a **contact terminal** (Sci-Fi message port) and a hovering **AI companion** with a rule-based FAQ chat.

## Performance notes

- The Three.js scene is code-split and lazy-loaded so the title screen paints instantly (~70 KB gz initial).
- In-world text uses a vendored pixel font (`public/fonts/kenpixel.ttf`) — no external font/network dependency.
- Ambient/audio are 100% procedural via Web Audio API.
- A `2D MODE` fallback serves a fast text CV for low-end devices.

## Customizing

All portfolio content lives in `src/data.ts` (profile, skills, projects, zones) and `src/components/ui/ContactPanel.tsx` (AI FAQ). Colors, names and links are centralized there.

> Note: This project uses a procedural on-page 3D walkthrough rather than pre-modeled `.glb` assets, keeping the repo fully self-contained and network-free.
