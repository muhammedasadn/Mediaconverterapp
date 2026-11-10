# YouTube Creator Helper (`/youtube`)

## 1. Overview & Compliance Mission
**Universal Media Converter** does **not** extract, scrape, or download streams from YouTube or any platform that does not provide a direct download option. 

Instead, the **YouTube Creator Helper** provides legitimate, authorized workflows for channel owners and creative editors through official Google APIs and YouTube Studio features.

---

## 2. Architecture & Workflows

### 2.1 Domain & Canonical ID Validation
- Input URLs are verified against an allowlist of valid YouTube domains (`youtube.com`, `www.youtube.com`, `m.youtube.com`, `music.youtube.com`, `youtu.be`).
- Canonical 11-character video IDs (`[A-Za-z0-9_-]{11}`) are extracted and normalized to `https://www.youtube.com/watch?v=<id>`.

### 2.2 Official oEmbed Metadata Preview
- Queries YouTube's official public oEmbed endpoint:
  ```
  https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json
  ```
- Displays verified video title, creator channel name, and official thumbnail without accessing any video or audio stream data.

### 2.3 Three Guided Creator Paths
1. **"My Own Channel Video"**:
   - Step-by-step instructions for exporting master MP4 files via YouTube Studio (`studio.youtube.com` → `Content` → `⋮` → `Download`).
   - Integrated dropzone to convert, compress, or trim the downloaded master file immediately.
2. **"Royalty-Free Music & Creative Commons"**:
   - Direct shortcuts to YouTube Audio Library, Wikimedia Commons, and Free Music Archive.
3. **"Creator Collaboration"**:
   - Guidance on requesting high-fidelity master camera recordings from creators for remixes or editing.

### 2.4 Dedicated SEO Route: `/youtube-mp4-to-mp3`
- Direct browser-based WebAssembly MP3 extractor for creators who have already saved their MP4 video locally.
- Zero server bandwidth; runs 100% on-device.
