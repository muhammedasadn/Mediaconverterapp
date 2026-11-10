# ANTIGRAVITY MASTER PROMPT — Universal Media Converter

## 0. ROLE

You are a senior product designer, motion designer, and full-stack engineer working together as one team. You will design AND build **Universal Media Converter**: a modern, free, privacy-conscious web platform (PWA) for converting, compressing, and editing video and audio, with a hybrid browser (FFmpeg.wasm) and cloud (native FFmpeg workers) engine.

The attached architecture blueprint is the source of truth for technology, folder structure, conversion pipeline, schemas, and features. Do not deviate from it without explaining why in the implementation plan. **Your main additional mandate: the product must look, feel, and move like a premium, modern, extremely user-friendly app, not a generic converter site.**

---

## 1. WORKING METHOD (follow strictly)

1. **Plan first.** Produce an Implementation Plan artifact and a Task List artifact before writing code. Wait for my approval of the plan.
2. **Load skills.** Check `.agent/skills/` and your available skills. Use any skills for: frontend design, UI/UX, motion/animation, accessibility, PWA, testing. If a needed skill does not exist, create it under `.agent/skills/<name>/SKILL.md` (e.g. `motion-design`, `design-system`, `media-conversion`) and then use it.
3. **Work in phases** (Section 12). Finish and verify each phase before the next.
4. **Verify visually.** After each UI phase, use the browser tool to open the app, test at 375px, 768px, 1280px, and 1920px widths, in light and dark mode, and attach screenshots and a short browser recording as artifacts.
5. **Walkthrough artifact** at the end of every phase: what was built, what was tested, known gaps.
6. Ask me only about decisions that truly block you. Otherwise choose sensible defaults and list them in the plan.

---

## 2. PRODUCT EXPERIENCE GOALS

- **One drop zone, zero confusion.** The user drops any file, the app detects it, and shows only relevant output options.
- **Under 3 clicks** from landing to a started conversion.
- **Smart defaults.** Auto-recommended format and quality; advanced settings hidden behind an "Advanced" disclosure.
- **Instant feedback.** Every action responds within 100 ms visually (hover, press, loading, success).
- **Trust.** Clear privacy messaging: "Converted on your device when possible. Files never leave your browser unless needed." Show which engine (Device / Cloud) is being used and why, in plain language.
- **Calm and delightful.** Motion explains what's happening; it never distracts or delays.
- **Mobile-first.** Thumb-friendly layout, bottom sheets, large tap targets (min 44px).
- **No dark patterns.** No forced sign-up, no fake countdowns, no ad-style clutter.

---

## 3. DESIGN DIRECTION

**Style:** Modern, clean, slightly futuristic "creative tool" feel (think Linear, Raycast, Arc, Vercel, CapCut web). Soft depth, generous whitespace, confident typography, subtle gradients and glass surfaces used sparingly.

**Do not** use: stock purple-gradient-on-white AI look, cluttered tool grids, tiny gray text, heavy drop shadows, emoji as icons, or default unstyled shadcn.

### 3.1 Design tokens (define in `packages/ui` and Tailwind config)

- **Color:** neutral base (near-black `#0B0D12` dark / warm off-white `#FAFAF8` light), one signature accent (choose a vivid electric tone, e.g. indigo-to-cyan or lime-to-teal, and justify it), semantic colors for success / warning / error / info. Provide full light and dark palettes with AA contrast minimum.
- **Category colors:** video, audio, compression, editing, utilities each get a subtle accent used in icons and highlights.
- **Typography:** one expressive display font for headings plus one highly readable UI font plus mono for technical data (codec, bitrate). Fluid type scale using `clamp()`.
- **Spacing/radius:** 4px grid; radii 8 / 12 / 20 / 28; consistent elevation scale (0–4).
- **Iconography:** one consistent icon set (Lucide or Phosphor), custom-styled strokes.
- Export tokens as CSS variables and document in `docs/design-system.md`.

### 3.2 Layout principles

- Max content width 1200px, 12-column grid desktop, 4-column mobile.
- Persistent minimal top bar (logo, tools menu, theme toggle, language, account). On mobile: bottom navigation (Convert, Tools, History, Account).
- Command palette (`Cmd/Ctrl + K`) to jump to any tool or format.

---

## 4. MOTION SYSTEM (critical)

Use **Motion (Framer Motion / `motion/react`)** as the primary animation library; use **GSAP** only for complex timeline or scroll sequences if truly needed; use CSS transitions for simple hover states. Create a `motion-design` skill and a shared `packages/ui/motion/` module containing:

- **Motion tokens:** durations (120 / 200 / 320 / 500 ms), easings (standard, emphasized-out, spring-soft, spring-snappy), stagger values.
- **Reusable variants:** `fadeUp`, `scaleIn`, `slideSheet`, `listStagger`, `morphCard`, `pressFeedback`.
- **Rules:**
  - Animate only `transform` and `opacity` where possible (GPU-friendly); avoid layout thrash.
  - Respect `prefers-reduced-motion`: replace movement with simple fades; never block functionality.
  - No animation over 600 ms for UI feedback; hero sequences may reach 1.2 s.
  - Motion must communicate state: appear, progress, success, error.

### Signature motion moments to build

1. **Hero:** headline word-by-word reveal; an animated "file morph" illustration (a video tile morphs into audio waveform, GIF, etc.) in a seamless loop.
2. **Drop zone:** magnetic hover, glowing border that reacts to drag-over, file icon "catches" and settles with a spring when dropped.
3. **File card:** shared-element (layout) transition from drop zone into the conversion workspace; thumbnail or waveform preview fades in once probing finishes.
4. **Format picker:** chips with animated selection pill (layoutId), recommended format has a subtle pulse once.
5. **Progress:** smooth progress ring/bar with real-time percentage, ETA, and engine badge; a live animated waveform or frame-strip that "fills" as conversion advances. Never a fake progress bar; use real FFmpeg progress.
6. **Success:** satisfying completion (checkmark draw, soft confetti-lite burst, download button morphs from progress). Show before/after size comparison with animated count-up.
7. **Error states:** gentle shake plus clear human explanation and a one-click fix ("Try cloud conversion").
8. **Page transitions:** shared layout transitions between tool pages; skeleton loaders that match final layout.
9. **Scroll storytelling (landing only):** "How it works" in 3 steps with scroll-linked reveal; keep performance above 60fps.
10. **Micro-interactions:** button press scale, toggle springs, slider thumb feedback, tooltip fade, toast slide-in with swipe-to-dismiss on mobile.
11. **Audio visualizer** component: canvas/WebAudio-based live waveform used in the audio tools and the audio-to-video preview.

Add a **Motion Playground** dev page (`/dev/motion`) showing every variant for review.

---

## 5. KEY SCREENS AND UX (design each in light and dark)

1. **Landing / Home**
   - Hero with giant drop zone as the primary CTA (the product *is* the hero).
   - Tool shortcuts as 6–8 large, visual cards: Video, Audio, Video→Audio, Audio→Video, Compress, Trim/Edit, GIF, Media Info.
   - Trust strip: "Free · No sign-up · Private by design · Works offline".
   - How it works (3 steps), supported formats grid (from format registry), FAQ, footer.
2. **Convert workspace** (the core screen)
   - Left/top: file card with preview, detected info (format, duration, resolution, size).
   - Center: output format picker (visual chips grouped by category), quality presets (Small / Balanced / Best), estimated output size updating live.
   - "Advanced" accordion: codec, bitrate, resolution, frame rate, sample rate, channels, audio track.
   - Engine indicator with explanation tooltip and manual override (Auto / Device / Cloud).
   - Primary action button always visible (sticky on mobile).
   - Multi-file queue with drag-reorder and per-file settings; "Apply to all".
3. **Progress and result**: described in motion moments; includes Download, Download all (ZIP), Convert again, Share (Web Share API), Preview player.
4. **Compressor**: target-size slider (with honest "estimated" label), before/after comparison with draggable split preview.
5. **Editor** (trim / merge): timeline with waveform and frame thumbnails, draggable handles with snapping, keyboard shortcuts (space, J/K/L, arrows, I/O), zoom, undo/redo.
6. **Audio-to-Video studio**: background image or color, waveform/visualizer style gallery, title/artist text, aspect ratio presets (16:9, 9:16, 1:1) with live preview.
7. **History** (optional account): searchable list, re-run, delete; guests see local-only history.
8. **Auth and Account**: minimal, passwordless-friendly, delete-account flow clearly accessible.
9. **Settings**: theme, language, default quality, privacy controls, clear cached engine.
10. **Offline and Install**: install prompt card, offline page, "engine cached" status.

Every screen needs: empty state, loading skeleton, error state, and success state designed, not just the happy path.

---

## 6. ACCESSIBILITY AND INCLUSIVITY

- WCAG 2.2 AA minimum: contrast, focus rings (visible, branded), full keyboard navigation, ARIA live regions for progress and errors.
- Screen-reader-friendly drop zone (also a real `<input type="file">` and a "Choose file" button).
- Reduced motion, reduced transparency, and high-contrast support.
- i18n-ready from day one (`packages/i18n`), RTL layout support, no hard-coded strings; ship English plus the structure for Hindi, Malayalam, Arabic, Spanish.
- Plain-language copy; avoid codec jargon in primary UI (show jargon only in Advanced/Info).

---

## 7. ENGINEERING REQUIREMENTS (from the blueprint)

- Monorepo: `pnpm` + Turborepo, exactly the structure in the blueprint (`apps/web`, `apps/api`, `apps/worker`, `apps/admin`, `packages/*`, `infrastructure/*`).
- Frontend: Next.js (App Router), React, TypeScript (strict), Tailwind, shadcn/ui heavily customized to the design system.
- Browser engine: FFmpeg.wasm in Web Workers, behind the shared `MediaEngine` interface; handle cross-origin isolation headers (COOP/COEP) for multithreaded build with a single-thread fallback.
- Cloud engine: Node API + BullMQ/Redis + PostgreSQL + S3-compatible storage + native FFmpeg workers in Docker. FFmpeg never runs inside Next.js routes.
- **Hybrid router** in `packages/conversion-core`: considers codec demand, resolution, memory estimate, device capability, browser support, network, and user preference. File size alone must not decide.
- Shared `ConversionRequest` schema validated with Zod in `packages/job-contracts`; central `format-registry`; never hardcode formats in pages.
- PWA: manifest, service worker, offline shell, cached engine assets, update prompt.
- Security: strict file-type validation (magic bytes, not just extension), size and duration limits, sanitized filenames, signed URLs, auto-deletion of temporary files (default 1 hour), rate limiting, no FFmpeg command injection (build commands from validated objects only, never string concatenation).
- Observability: Sentry + OpenTelemetry hooks; privacy-respecting analytics (no fingerprinting).
- Performance budget: LCP < 2.0 s on mid-range mobile, JS for landing < 150 KB gzip (load FFmpeg.wasm lazily only after a file is chosen), CLS < 0.05, INP < 200 ms. Run Lighthouse and report scores.

---

## 8. FEATURE SCOPE

Implement all eight areas from the blueprint (A–H): video conversion, audio conversion, video→audio, audio→video, compression, editing tools, file utilities, user features. Prioritize per the phases below. Mark anything not yet built as "coming soon" in the UI only if it has a designed placeholder; never show broken buttons.

Be honest in UI copy: do not promise exact output sizes or guaranteed browser support for every codec. Show "Estimated" labels and automatic cloud fallback messaging.

---

## 9. CODE QUALITY RULES

- Strict TypeScript, ESLint, Prettier, Husky pre-commit, conventional commits.
- Component-driven: build in isolation with Storybook (or the playground page) for design-system components.
- Unit tests (Vitest) for router logic, schema validation, command builder; Playwright e2e for: upload → convert → download (MP3→WAV, MP4→MP3, MOV→MP4), mobile viewport, offline mode, reduced motion.
- No `any`, no dead code, no giant components (>250 lines): split by feature.
- Every package has a README with purpose and public API.

---

## 10. DELIVERABLES

1. Working monorepo, runnable with `pnpm install && docker compose up && pnpm dev`.
2. `docs/design-system.md`, `docs/motion-guidelines.md`, `docs/architecture.md`, `docs/engine-routing.md`.
3. Design-system package with token files, motion module, and documented components.
4. Screenshots and recordings (artifacts) for every key screen in light/dark and mobile/desktop.
5. Test reports, Lighthouse report, and an accessibility audit summary.
6. `README.md` with setup, env vars, deployment guide (Docker), and a roadmap.

---

## 11. DEFINITION OF DONE (per screen/feature)

- [ ] Matches design tokens; no hard-coded colors or magic numbers
- [ ] Light and dark themes verified
- [ ] 375 / 768 / 1280 / 1920 px verified with screenshots
- [ ] Empty, loading, error, success states present
- [ ] Motion follows tokens; reduced-motion verified
- [ ] Keyboard and screen-reader tested
- [ ] Tests passing; no console errors
- [ ] Performance budget met

---

## 12. PHASES

**Phase 1: Foundation.** Monorepo, tooling, design tokens, Tailwind/shadcn theme, motion module, Motion Playground, format registry, shared schemas, app shell (top bar, mobile nav, theme, command palette).

**Phase 2: Core conversion (browser).** Landing page with hero drop zone, file detection/probing, convert workspace, format picker, FFmpeg.wasm engine in worker, progress and success experience, download. Ship audio↔audio, video→audio, and video↔video basics end to end.

**Phase 3: Cloud engine and router.** API, queue, workers, storage, job status (SSE/WebSocket), hybrid routing with plain-language engine explanations, cancel and retry, cleanup jobs.

**Phase 4: Compression and editing.** Compressor with before/after, trim and merge timeline editor, GIF tools, batch and ZIP.

**Phase 5: Audio-to-Video studio and utilities.** Visualizer styles, backgrounds, aspect ratios, media info viewer.

**Phase 6: Accounts, history, presets, PWA.** Auth.js, history, saved presets, install/offline flows, i18n additional languages, admin app basics.

**Phase 7: Hardening.** Security review, performance tuning, accessibility audit, full e2e suite, monitoring, deployment docs.

At the end of each phase: stop, present the Walkthrough artifact, and wait for my "continue".

---

## 13. START NOW

Begin with **Phase 1**.
