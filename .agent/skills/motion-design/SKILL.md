---
name: motion-design
description: Motion design system and animation guidelines for Universal Media Converter using Motion (Framer Motion) and GSAP. Covers spring physics, layout morphing, gestures, 60fps GPU acceleration, and accessibility.
---

# Motion Design System — Universal Media Converter

This skill defines the animation tokens, interaction physics, and performance standards for the application.

## 1. Spring Physics Tokens

```typescript
export const motionTokens = {
  duration: {
    instant: 0.12,
    fast: 0.2,
    standard: 0.32,
    cinematic: 0.5,
    hero: 1.2,
  },
  spring: {
    // Buttons, segmented pills, micro-interactions
    snappy: { type: 'spring', stiffness: 420, damping: 30, mass: 0.8 },
    // Bottom sheets, page transitions, modal dialogs
    gentle: { type: 'spring', stiffness: 240, damping: 26, mass: 1 },
    // Success celebrations, checkmark draw, reaction badges
    bouncy: { type: 'spring', stiffness: 360, damping: 18, mass: 1 },
    // Hover micro-scales
    micro: { type: 'spring', stiffness: 500, damping: 35, mass: 0.5 },
  },
};
```

## 2. Signature Motion Moments

1. **Dynamic Island Status Capsule**: Expands on file drag-over (`layoutId="status-capsule"`), pulses during conversion, and draws checkmark on completion.
2. **Magnetic Drop Zone**: Hover pulls slightly toward cursor (`0.25` factor), border glows on `dragOver`, and file tile settles with `springSnappy`.
3. **Format Picker Sliding Pill**: Selected format chip uses `layoutId="active-format-pill"` with `springSnappy`.
4. **Progress Waveform Fill**: Real FFmpeg timecode progress drives a filling SVG waveform or frame-strip.
5. **Success Count-Up**: Size savings animate from input size down to compressed output size.

## 3. Strict Performance & Accessibility Rules
- **Composite-Only**: Only animate `transform` and `opacity`. Never animate `width`, `height`, `top`, or `left`.
- **Reduced Motion**: All components must check `useReducedMotion()` from `framer-motion` and fall back to simple opacity fades (`duration: 0.15`).
