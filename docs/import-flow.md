# Universal Media Converter: Single-Screen Import Flow

## 1. Overview & Architecture

The **V4 Link-to-Download Pipeline** delivers a single-screen 3-step experience modeled on modern browser-first media editors like Flixier, while strictly adhering to copyright law and platform terms of service.

```
[ Step 1: Paste Link ] ──▶ [ Step 2: Instant Analyze ] ──▶ [ Step 3: Choose Quality & Download ]
      (Clipboard /                 (~1-2s Probing,                 (Original Stream Copy, 1080p,
     Global Ctrl+V)              Thumbnails, Codecs)              720p, 480p, MP3, M4A, WAV)
```

---

## 2. Step-by-Step Flow

### Step 1: Paste Anywhere
- **Clipboard API**: One-tap "Paste" button using `navigator.clipboard.readText()`.
- **Global Listener**: Users can press `Ctrl+V` (or `Cmd+V`) anywhere on the page without focusing the input.
- **Immediate Debouncing**: Validates URLs within ~250ms with inline visual indicators:
  - *Checking*: Animated loader.
  - *Supported*: Verified repository badge (e.g. Wikimedia Commons, Internet Archive).
  - *YouTube*: Automatically morphs into the YouTube Creator Studio Helper.
  - *Not Supported*: Clear message with suggested open-source repositories.

### Step 2: Media Analysis
- Fast metadata inspection via `POST /api/import/analyze`.
- Server-side HEAD probe with DNS pre-resolution and IP pinning.
- Extract file name, MIME type, stream categories (Video / Audio), container formats, and estimated dimensions.
- Caches analysis results for **10 minutes** per URL.

### Step 3: Quality Picker & Download
- **Video Options**:
  - `Original`: Lossless stream copy (`-c copy`) completing in **<2 seconds**.
  - `1080p FHD`: Only available if source resolution $\ge 1080p$.
  - `720p HD`: Recommended default for web and social.
  - `480p SD` & `360p Mobile`: Bandwidth-efficient compact tiers.
  - **Strict Rule: Never upscale above source resolution.**
- **Audio Options**:
  - `MP3`: 320 kbps (High Fidelity), 192 kbps (Recommended), 128 kbps (Compact), 64 kbps (Speech).
  - `M4A (AAC Stream Copy)`: Offered when source audio is AAC; extracts audio in **<100ms** without re-encoding.
  - `WAV / FLAC`: Uncompressed studio masters.
- **Estimated File Size**: Calculated dynamically using:
  $$\text{Bytes} = \frac{(\text{Video Bitrate} + \text{Audio Bitrate}) \times \text{Duration}}{8} \times 1.05$$
- **Quick Action Tools**:
  - `Trim First`: Jump straight to timeline cutter with keyboard shortcuts.
  - `Compress for Discord (25MB)`: Pre-calculates target bitrate to guarantee Discord acceptance.
  - `Compress for WhatsApp (16MB)`: Auto-steps down resolution to fit mobile messaging caps.

---

## 3. Speed Guarantees

| Operation | Target Codec / Format | Execution Engine | Typical Latency |
| :--- | :--- | :--- | :--- |
| **Container Remux** | MP4 to MKV / MOV | WebAssembly `-c copy` | **<1.5 seconds** |
| **Audio Extraction (AAC Source)** | Video to M4A | WebAssembly `-c:a copy` | **<500ms** |
| **Video Transcode (720p)** | H.264 / AAC | WASM multi-threaded `-preset veryfast` | ~15–30 seconds |
| **Cloud Turbo Cluster** | Heavy 4K / AV1 / ProRes | Native FFmpeg worker (`-threads 0 -preset fast`) | Accelerated |
