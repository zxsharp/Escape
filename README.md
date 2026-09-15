# Escape - Multiplayer 3D Web Maze Game

An interactive, first-person 3D maze game and multiplayer speed-running race built with **React**, **Three.js**, **WebSockets (Socket.io)**, and **JavaScript**.

---

## 🚀 Features

- **Solo Mode**: Procedurally generates solvable mazes at runtime across 4 difficulty tiers (*Easy*, *Intermediate*, *Hard*, *Extreme*) with a live stopwatch clock.
- **Multiplayer Race Mode**: Real-time room lobbies with custom codes (e.g., `ESC-8A2F`). Host triggers a synchronized 3-2-1 countdown before the race begins.
- **Deterministic Seeded DFS Generation**: Both players share a short seed string over WebSockets, generating the **exact same 3D maze** locally in milliseconds without transmitting heavy 3D geometry over the wire.
- **Live Opponent HUD & Race Leaderboard**: Displays real-time status (`In Maze` vs. `🏆 00:34.25`) as opponents reach the exit.
- **First-Person 3D Controls**: Decoupled 2D-to-3D coordinate projection with mouse/touch look, keyboard WASD, and virtual mobile controls.
- **Cheat Map & Mini-Map**: Optional top-down 2D minimap showing current position and orientation.

---

## 🛠️ Tech Stack & Architecture

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend UI** | React 19 + Vite | State machine, room lobby, HUD overlay, stopwatch clock, victory popup |
| **3D Engine** | Three.js | First-person camera, scene lighting, floor & wall box mesh rendering |
| **Maze Algorithm** | Randomized Depth-First Search (DFS) | Generates perfect, single-solution solvable mazes with winding corridors |
| **Multiplayer / Networking** | Node.js + Socket.io / WebSockets | Room creation, player roster presence, synchronized countdown, and win time broadcast |
| **Physics / Collision** | 2D Spatial Grid AABB ($O(1)$) | High-performance collision detection against immediate neighboring grid cells |
| **Audio** | Web Audio API | Directional movement, countdown, and victory sound effects |

---

## 🏃 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Frontend (Vite)
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Start the Multiplayer WebSocket Server
```bash
npm run server
```
Runs the lightweight Socket.io room server on port `3001`.

---

## 🧠 Interview Defense & Architecture Highlights

### 1. Why Depth-First Search (DFS) for Maze Generation?
- DFS uses recursive backtracking with a stack to explore as deep as possible before backtracking.
- This creates **long, winding corridors with high branching factor and deep dead ends**, providing a fun, challenging first-person exploration experience.
- It generates a "perfect maze" (spanning tree) ensuring **exactly one unique solution path** from start to exit with zero loops.

### 2. How Does Multiplayer Synchronization Work?
- Instead of serializing 200+ wall mesh coordinates over WebSockets, the host generates a random 8-character **seed** (`seed_9x7a2`).
- Both clients use a deterministic **Mulberry32 PRNG** with that seed to run the DFS algorithm locally.
- Both machines construct the identical maze layout in under 5ms with near-zero network bandwidth (< 50 bytes per race).

### 3. How Are 2D Grids Mapped to 3D Three.js Coordinates?
- Game logic and player collision are tracked entirely in 2D coordinates $(X, Z)$.
- Three.js is treated as a pure visual view layer: every frame, the camera position is updated to $(X, \text{eye\_height}, Z)$ and oriented with $\sin(\theta) / \cos(\theta)$.
- Collision checking is optimized from $O(N)$ to $O(1)$ by converting world coordinates to grid cell indices and testing only the walls in the player's immediate 3x3 neighborhood.

---

## 🎮 Controls
- **W / ↑**: Move Forward
- **S / ↓**: Move Backward
- **A / ←**: Strafe Left
- **D / →**: Strafe Right
- **Mouse Drag / Touch**: Look & Rotate View
