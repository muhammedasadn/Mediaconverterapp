# Design System Documentation — Cupertino Pro

## 1. Design Tokens & Palette

The design system implements Apple iOS Human Interface Guidelines combined with modern glassmorphism.

### Color Tokens
- Canvas Base: `#0B0D12` (Dark) / `#F8F9FA` (Light)
- Glass Surface: `rgba(22, 25, 34, 0.72)` with `backdrop-filter: blur(28px) saturate(180%)`
- Specular Highlight: `inset 0 1px 1px 0 rgba(255, 255, 255, 0.18)`
- Hairline Border: `1px solid rgba(255, 255, 255, 0.12)`
- Signature Accent: `linear-gradient(135deg, #0A84FF 0%, #00F2FE 100%)`

### Spacing & Corner Radii
- Grid: 4px base increment
- Radii:
  - Small (8px): Badges, chip tags
  - Medium (12px): Interactive buttons, text inputs
  - Large (20px): Modular tool cards
  - Extra Large (28px): Hero dropzone, bottom sheets
  - Full (9999px): Dynamic Island pills

### Typography Scale
- Heading Display: Plus Jakarta Sans / Cabinet Grotesk (`tracking-tight`)
- UI Controls: SF Pro Display / Apple System Font
- Technical Metrics: JetBrains Mono / SF Mono (for bitrates, codecs, resolutions)
