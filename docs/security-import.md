# Multi-Layer SSRF & Media Import Defense Specification

## 1. Threat Model & Security Posture

Media download platforms are high-value targets for:
- **Server-Side Request Forgery (SSRF)**: Attacking internal microservices, AWS/GCP instance metadata endpoints (`169.254.169.254`), or database interfaces.
- **DNS Rebinding**: Directing a public DNS record to a private IP address after initial validation.
- **Decompression Bombs & Infinite Streams**: Overloading disk space and memory buffers.
- **Command Injection**: Passing un-sanitized external input strings to FFmpeg CLI processes.

---

## 2. Security Controls Implemented

### A. Strict Protocol & Scheme Constraints
- **HTTPS Enforcement**: Only URLs with `https:` scheme and port `443` are processed.
- **No User Credentials**: URLs containing `user:pass@host` are immediately rejected.
- **Punycode / IDN Blocking**: Internationalized domain names (`xn--...`) are blocked to prevent homograph phishing attacks.

### B. DNS Pre-Resolution & Pinning
1. Server resolves domain IP address via DNS lookup *before* making any connection.
2. Checks IP against blocked subnets:
   - `127.0.0.0/8` and `::1` (Loopback)
   - `169.254.0.0/16` and `fe80::/10` (Cloud Metadata & Link-Local)
   - `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (RFC 1918 Private Networks)
   - `fc00::/7` (IPv6 Unique Local)
3. **Manual Redirect Inspection**: HTTP redirects (`301`, `302`, `303`, `307`, `308`) are **never followed automatically**. The server intercepts each hop, parses the `Location` header, and re-validates the destination URL and IP. Max 3 hops allowed.

### C. Streaming Security & Magic Byte Inspection
- **500 MB Hard Stream Cap**: The HTTP streaming consumer counts bytes and aborts immediately if the remote stream exceeds 500 MB.
- **Magic Byte Verification**: The first 12–16 bytes of the stream are matched against known file signatures (MP4 `ftyp`, WebM `EBML`, RIFF `WAVE`, MP3 `ID3`, FLAC `fLaC`).
- **Streaming Manifest Defense**: Streaming manifests (`.m3u8`, `.mpd`, `.ffconcat`, `.pls`) are actively rejected to prevent secondary SSRF injection and nested playlist fetches.

### D. FFmpeg Hardening
- Remote URLs are **never** passed directly to the FFmpeg CLI.
- All media must be verified on local scratch disk first.
- CLI arguments are constructed as an immutable string array passed to `child_process.spawn()`, defeating shell command injection.
