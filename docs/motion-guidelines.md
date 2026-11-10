# Motion Guidelines & Interaction Physics

## 1. Spring Physics Presets
- `springSnappy`: `stiffness: 420, damping: 30, mass: 0.8` (Buttons, segmented controls, dropzone snap)
- `springGentle`: `stiffness: 240, damping: 26, mass: 1.0` (Bottom sheets, modals)
- `springBouncy`: `stiffness: 360, damping: 18, mass: 1.0` (Checkmark draw, success animations)
- `springMicro`: `stiffness: 500, damping: 35, mass: 0.5` (Hover micro-scales)

## 2. Rules
- **60fps / 120fps GPU Rendering**: Animate composite-only properties (`transform`, `opacity`).
- **Reduced Motion**: Automatically respect `prefers-reduced-motion` with instantaneous opacity fades.
- **Micro-Haptics**: Subtle Web Vibration API integration on touch events (`light` for clicks, `medium` for drops/drags, `success` for completed jobs).
