# 🏝️ Tropical Island — Interactive 3D Portfolio

An immersive 3D portfolio experience built with React Three Fiber. Explore a tropical island, discover projects and experiments through an interactive world with physics, animations, and ambient audio.

**Live demo:** [edoedoedo.it/experiments/tropical-island](https://www.edoedoedo.it/experiments/tropical-island/)

![Tropical Island](./assets/loading-bg.jpg)

---

## ✨ Features

- 🏝️ **Fully explorable 3D island** — walk, jump, explore every corner
- 🎬 **Cinema screen** — wooden outdoor cinema with projected content
- 🌴 **Tropical environment** — palm trees, ocean, bonfire, hammock, surfboards and more
- 🗿 **Moai statues** — with torches and grass effects
- 🦀 **Animated characters** — crabs, turtles, parrots
- 🌊 **Ocean system** — Perlin noise waves with foam shader
- 💡 **Sunset lighting** — dynamic directional light with long shadows
- 🔊 **Spatial audio** — ambient music + ocean sounds with volume control
- 📱 **Mobile support** — joystick controls + gyroscope on touch devices
- 🚀 **Production ready** — loading screen, start button, Leva disabled

---

## 🛠️ Tech Stack

| Technology | Use |
|------------|-----|
| [React](https://react.dev/) | UI framework |
| [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) | Three.js renderer for React |
| [@react-three/drei](https://github.com/pmndrs/drei) | Three.js helpers (GLB loader, Sky, etc.) |
| [@react-three/rapier](https://github.com/pmndrs/react-three-rapier) | Physics engine (Rapier WASM) |
| [Three.js](https://threejs.org/) | 3D WebGL rendering |
| [Zustand](https://github.com/pmndrs/zustand) | Global state management |
| [Leva](https://github.com/pmndrs/leva) | Debug controls (dev only) |
| [Vite](https://vitejs.dev/) | Build tool |

---

## 📦 Project Structure

```
src/
├── App.jsx                    # Entry point, canvas setup, controls
├── components/
│   ├── Experience.jsx         # Main scene composition
│   ├── Island.jsx             # Island layout (all objects placed here)
│   ├── CoastalTerrain.jsx     # Procedural terrain with foam shader
│   ├── CoastalWater.jsx       # Ocean with Perlin noise waves
│   ├── SunsetLighting.jsx     # Directional light + shadows
│   ├── SunsetSky.jsx          # Gradient sky shader
│   ├── CharacterController.jsx # WASD + physics movement
│   ├── OceanBarrier.jsx       # Invisible collision wall
│   ├── WoodenCinemaScreen.jsx # Cinema screen component
│   ├── LoadingScreen.jsx      # Loading + START screen
│   ├── VolumeControl.jsx      # Volume slider UI
│   ├── BackgroundMusic.jsx    # HTML5 ambient audio
│   ├── OceanSounds.jsx        # HTML5 ocean audio
│   ├── Joystick.jsx           # Mobile joystick controls
│   ├── useStore.js            # Zustand store
│   └── [3D Models]            # GLB components (Moai, PalmTree, etc.)
public/
├── models/                    # GLB 3D models
├── sounds/                    # MP3 audio files
├── video/                     # MP4 video files
├── hdrs/                      # HDR environment maps
├── fonts/                     # Custom fonts
├── draco/                     # Draco compression decoder
├── loading-bg.jpg             # Desktop loading screen background
└── loading-bg-mobile.jpg      # Mobile loading screen background
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/tropical-island.git
cd tropical-island

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎮 Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Move | `WASD` / Arrow keys | Joystick |
| Jump | `Space` | Jump button |
| Camera | Mouse drag | Touch drag |
| Volume | UI (top right) | UI (top right) |

---

## 🔧 Development

### Dev Mode with Leva Controls

```javascript
// Island.jsx — line 1
const SHOW_LEVA_CONTROLS = true; // Enable Leva panel for tweaking
```

Available controls:
- 🌊 **Water** — level, wave speed, wave amplitude, foam depth

### Add Audio Files

```
public/sounds/
├── ambient-music.mp3   # Background music
└── ocean-waves.mp3     # Ocean ambience
```

---

## 📦 Build & Deploy

### Build for production

```bash
npm run build
```

### Preview build locally

```bash
npm run preview
```

### Deploy to subfolder (e.g. `/experiments/tropical-island/`)

The `vite.config.js` is already configured with the correct base path:

```javascript
export default defineConfig({
  base: '/experiments/tropical-island/',
  // ...
});
```

Upload the entire `dist/` content to your server subfolder. Add the included `.htaccess` for correct routing.

---

## 🗺️ Island Map

```
              NORD [0, Y, +Z]
                    ↑
            🎬 Cinema [0, 3, 25]
                    |
   🏠 House  ←──── ● ────→  🔥 Bonfire
  [-55, 2, 0]   CENTER   [26, 3, 0]
    (-X)           |         (+X)
                   |
            🗿 Moai [0, 7, -25]
                    ↓
              SUD [0, Y, -Z]
```

Key zones:
- **Center (0–20m):** Palm trees, parrot, info signs
- **North (Z+):** Cinema screen, beach chairs, sand castle
- **South (Z-):** Moai, torches, crabs
- **East (-X):** House, grill, table, umbrella, turtle
- **West (+X):** Bonfire, surfboards, hammock

---

## 📄 License

MIT © [Edoardo](https://www.edoedoedo.it)
