---
name: design-system
description: iOS Cupertino glassmorphism design system tokens, color palettes, typography scale, 4px spacing grid, and modular component specifications for Universal Media Converter.
---

# Cupertino Pro Design System — Universal Media Converter

A high-production-value, iOS-inspired design system tailored for modern media tools.

## 1. Color Palette (Dark & Light)

### Dark Palette (Default)
- **Background Canvas**: `#0B0D12`
- **Elevated Card Glass**: `rgba(22, 25, 34, 0.72)` with `backdrop-filter: blur(28px) saturate(180%)`
- **Specular Hairline Border**: `rgba(255, 255, 255, 0.12)` top/left to `rgba(255, 255, 255, 0.04)` bottom/right
- **Signature Accent**: Electric Ultramarine Gradient (`#0A84FF` to `#00F2FE`)
- **Semantic Accents**:
  - Video: `#0A84FF` (iOS Cyan-Blue)
  - Audio: `#BF5AF2` (iOS Electric Violet)
  - Compression: `#32D74B` (iOS Mint)
  - Success: `#30D158` (iOS Spring Green)
  - Warning: `#FF9F0A` (iOS Amber)
  - Error: `#FF453A` (iOS Coral Red)

### Light Palette
- **Background Canvas**: `#F8F9FA`
- **Elevated Card Glass**: `rgba(255, 255, 255, 0.82)` with `backdrop-filter: blur(24px)`
- **Border**: `rgba(0, 0, 0, 0.08)`
- **Signature Accent**: `#0071E3` (Apple Royal Blue)

## 2. Spacing & Radii Grid
- **Base Grid**: 4px increment (`p-1` = 4px, `p-2` = 8px, `p-3` = 12px, `p-4` = 16px, `p-6` = 24px)
- **Corner Radii**:
  - `radius-sm`: 8px (badges, small chips)
  - `radius-md`: 12px (buttons, input fields)
  - `radius-lg`: 20px (cards, tool panels)
  - `radius-xl`: 28px (main hero dropzone, bottom sheets)
  - `radius-full`: 9999px (capsules, circular buttons)

## 3. Typography Scale
- **Headings**: `font-sans` (Plus Jakarta Sans / Cabinet Grotesk), `tracking-tight`
  - Hero: `clamp(2.5rem, 5vw, 4.5rem)`
  - Section Title: `clamp(1.75rem, 3vw, 2.5rem)`
  - Card Title: `1.25rem` / `font-semibold`
- **Body UI**: `font-sans` (SF Pro Display / System Font), `text-sm` or `text-base`
- **Technical Metadata**: `font-mono` (JetBrains Mono / SF Mono), `text-xs` (bitrate, codecs, timecodes)
