# Universal Media Converter — System Architecture Specification (V3)

## 1. High-Level Architecture Overview

Universal Media Converter is an enterprise-grade, privacy-first media processing suite built around a **hybrid execution model**. It pairs client-side **WebAssembly (FFmpeg.wasm)** for zero-latency, private, on-device conversion with a **native FFmpeg 7.x Docker cluster** for high-complexity encoding and heavy workloads.

```mermaid
flowchart TD
    User([User / Web Browser]) -->|Paste URL or Upload File| IngressRouter{Ingress Router}
    
    %% Input branching
    IngressRouter -->|Direct Media URL / CC Archive| SSRFGuard[SSRF Defense & IP Pre-Resolver]
    IngressRouter -->|YouTube Link| oEmbedProxy[YouTube oEmbed API]
    IngressRouter -->|Local Media File| LocalWorkspace[Cupertino Conversion Workspace]
    
    %% SSRF path
    SSRFGuard -->|Private / Loopback / Cloud Metadata| Reject[400 Bad Request / Blocked Range]
    SSRFGuard -->|Public IP & Magic Bytes OK| StreamFetch[Streaming Fetch Pipe <=500MB]
    StreamFetch --> LocalWorkspace
    
    %% YouTube path
    oEmbedProxy -->|Extract 11-char ID| PreviewCard[oEmbed Video Preview]
    PreviewCard --> YouTubeStudioGuide[Path A: YouTube Studio Master Export]
    PreviewCard --> CCShortcuts[Path B: CC Audio & Video Repositories]
    PreviewCard --> CreatorCollab[Path C: Creator Master File Request]
    
    %% Processing path
    LocalWorkspace --> HeuristicRouter{5-Factor Hybrid Router}
    
    HeuristicRouter -->|Lightweight / Audio / Fast Codecs| WasmWorker[FFmpeg.wasm Web Worker]
    HeuristicRouter -->|Large File >100MB / AV1 / HEVC| CloudGateway[Fastify 4.x Streaming API]
    
    WasmWorker --> InstantDownload[1-Click Direct Download]
    
    CloudGateway --> BullMQ[(BullMQ Redis Job Queue)]
    BullMQ --> FFmpegWorker[Native FFmpeg 7.x Docker Node]
    FFmpegWorker --> RollingStorage[(Scratch Disk - 1hr TTL Eviction)]
    FFmpegWorker -->|SSE Real-Time Progress| CloudGateway
    CloudGateway -->|Server-Sent Events| LocalWorkspace
```

---

## 2. Monorepo Structural Blueprint

```
Mediaconverterapp/
├── apps/
│   ├── web/                    # Next.js 15 (App Router), React 19, Motion, PWA
│   │   ├── app/
│   │   │   ├── page.tsx        # Unified conversion workspace & landing suite
│   │   │   ├── import/         # Open-Source Link Import Studio
│   │   │   ├── youtube/        # Compliant YouTube Creator Helper Studio
│   │   │   ├── youtube-mp4-to-mp3/ # Local MP4 to MP3 extractor
│   │   │   ├── compress/       # Target-size compressor
│   │   │   ├── edit/           # Lossless & precise timeline trimmer
│   │   │   ├── batch/          # Multi-file queue manager
│   │   │   ├── audio-to-video/ # Audio waveform visualizer studio
│   │   │   ├── info/           # Media stream deep inspector
│   │   │   ├── history/        # Local persistent history manager
│   │   │   └── settings/       # iOS grouped settings & cache purge
│   │   └── shell.tsx           # Global CupertinoShell with navbar & spotlight palette
│   ├── api/                    # Fastify 4.x streaming gateway
│   │   ├── src/routes/import.ts   # SSRF-guarded media streaming pipe
│   │   ├── src/routes/youtube.ts  # oEmbed metadata proxy
│   │   ├── src/routes/jobs.ts     # Multipart upload & job lifecycle
│   │   ├── src/routes/stream.ts   # Real-time SSE progress stream
│   │   └── src/security/ssrf-guard.ts # IP validation & CIDR blocklist
│   ├── worker/                 # High-throughput Dockerized FFmpeg 7.x worker
│   │   ├── src/command-builder.ts # Injection-safe argument builder
│   │   ├── src/ffmpeg-runner.ts   # Real-time regex progress parser
│   │   └── src/cleaner.ts         # 1-hour rolling TTL scratch disk eviction
│   └── admin/                  # Worker cluster telemetry & node health
├── packages/
│   ├── conversion-core/        # Hybrid router, probe, trim, compress, and magic bytes
│   ├── ui/                     # Cupertino glassmorphism primitives & motion tokens
│   ├── format-registry/        # Audio/video codec matrices & containers
│   ├── job-contracts/          # Zod validation schemas & SSE contracts
│   ├── config-tailwind/        # Shared Tailwind CSS v4 design tokens
│   └── i18n/                   # Multilingual dictionary (en, es, ar, hi, ml)
├── docs/                       # Architectural & feature specifications
├── docker-compose.yml          # Redis, API, Worker, and Web container orchestration
└── package.json                # Turborepo root workspace
```

---

## 3. Core Engine Pipelines

### 3.1 Open-Source Link Import & Multi-Layer SSRF Defense
- **Protocol Restriction**: Enforces `https:` exclusively; blocks custom ports, user credentials, and direct IP literals.
- **DNS Pre-Resolution**: Pre-resolves hostnames via `dns.promises.lookup()` and blocks private CIDRs (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16` AWS/GCP metadata, `::1`, `fc00::/7`).
- **Streaming Guard**: Aborts incoming network streams exceeding 500MB without relying on `Content-Length`.
- **Magic Byte Verification**: Inspects leading binary headers to prevent file extension spoofing attacks.

### 3.2 Lossless vs Precise Trimming Pipeline
- **Lossless Stream Copy**:
  ```bash
  ffmpeg -hide_banner -y -ss <start> -i <input> -t <duration> -c copy -avoid_negative_ts make_zero <output>
  ```
  - Fast keyframe seeking with zero decoding latency and instantaneous export (<500ms).
- **Precise Frame-Accurate Mode**:
  ```bash
  ffmpeg -hide_banner -y -ss <start> -i <input> -t <duration> -c:v libx264 -crf 20 -c:a aac -b:a 192k <output>
  ```
  - Re-encodes boundary GOP frames for sub-frame surgical precision.

### 3.3 Target-Size Compression Calculator
- **5% Container Buffer**:
  $$\text{video\_bitrate} = \frac{\text{target\_bytes} \times 8 \times 0.95}{\text{duration\_seconds}} - \text{audio\_bitrate}$$
- **Bits-Per-Pixel (BPP) Threshold**: Automatically steps down resolution ($1080\text{p} \rightarrow 720\text{p} \rightarrow 480\text{p}$) if BPP drops below $0.07$, preventing macroblocking artifacts.
- **No-Growth Protection**: Skips re-encoding if the original file is already smaller than the chosen target.

---

## 4. Verification & Testing Matrix
- **41 automated unit tests** passing in ~380ms via `npm test`.
- **Zero stream-ripping or circumvention code**: 100% compliant with copyright and platform terms of service.
