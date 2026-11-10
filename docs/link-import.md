# Open-Source Link Import Engine (`/import`)

## 1. Overview
The **Open-Source Link Import Engine** allows users to import public audio, video, and image assets directly via HTTPS URLs without requiring manual download and upload cycles.

---

## 2. Supported Sources & Formats
- **Direct Public Media Files**: `.mp3`, `.wav`, `.flac`, `.ogg`, `.opus`, `.m4a`, `.aac`, `.mp4`, `.webm`, `.mov`, `.mkv`, `.gif`.
- **Open-Access Repositories**:
  - Wikimedia Commons (`commons.wikimedia.org`, `upload.wikimedia.org`)
  - Internet Archive (`archive.org`)
  - Free Music Archive
  - Pixabay & Pexels CC video assets
  - Freesound audio samples

---

## 3. Multi-Layer SSRF Defense Architecture
To prevent Server-Side Request Forgery, local network port scanning, and cloud credential exfiltration:

1. **Protocol Constraint**: Strictly requires `https:`. Plaintext `http:`, `file://`, `gopher://`, and `ftp://` schemes are immediately rejected.
2. **Credential Neutralization**: URLs with userinfo credentials (`https://user:pass@host`) are strictly prohibited.
3. **Port Enforcement**: Only default HTTPS (port 443) is permitted; custom ports (`:8080`, `:8443`, etc.) are rejected.
4. **DNS Pre-Resolution & Rebinding Protection**:
   - The domain is pre-resolved using `dns.promises.lookup()`.
   - The resolved IP is verified against blocked CIDRs:
     - `127.0.0.0/8` (Loopback)
     - `10.0.0.0/8` (Private RFC 1918)
     - `172.16.0.0/12` (Private RFC 1918)
     - `192.168.0.0/16` (Private RFC 1918)
     - `169.254.0.0/16` (Link-local & AWS/GCP Instance Metadata `169.254.169.254`)
     - `::1` and `fc00::/7` (IPv6 loopback and unique local addresses)
5. **Streaming Size Limit**: As chunks stream from the remote server, a byte counter terminates the stream and purges temporary files if total bytes exceed **500 MB**.
6. **Binary Magic Bytes Verification**: The first 12–32 bytes are verified with `validateMediaSignature` to confirm a genuine audio/video/image container before passing to FFmpeg.
