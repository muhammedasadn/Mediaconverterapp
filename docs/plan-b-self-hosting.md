# Plan B: Graceful Degradation & Self-Hosting Architecture

## 1. Browser-Only Zero-Server Fallback Mode

If Oracle Cloud signup is unavailable, capacity is exhausted, or the VM is offline, Universal Media Converter seamlessly functions in **100% Browser-Only Mode** at **$0/month indefinitely**.

### How It Works:
1. In Cloudflare Pages environment variables, set:
   ```env
   NEXT_PUBLIC_CLOUD_ENGINE_ENABLED=false
   ```
2. The frontend automatically:
   - Suppresses all cloud routing requests.
   - Routes 100% of video, audio, trimming, and compression tasks to the in-browser **FFmpeg.wasm** engine.
   - Displays a clean status indicator: `100% Private On-Device Mode Active`.
   - Bypasses all server uploads—files never leave the user's browser, providing ultimate privacy and zero external server dependency.

---

## 2. Self-Hosted Mode (Home Server / Old PC / Raspberry Pi 5)

If you have a spare computer, laptop, or Raspberry Pi at home, you can run the full hardware-accelerated cloud conversion engine for free.

### Prerequisites:
- Any Linux, macOS, or Windows machine with Docker installed.
- Internet connection.
- Free Cloudflare account.

### Step-by-Step Setup with Cloudflare Tunnel (No Port Forwarding Required):

1. **Install cloudflared**:
   ```bash
   # Debian / Ubuntu
   sudo apt-get install cloudflared
   # Or run via Docker
   ```
2. **Authenticate & Create Tunnel**:
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create media-converter-tunnel
   ```
3. **Configure Tunnel (`~/.cloudflared/config.yml`)**:
   ```yaml
   tunnel: <TUNNEL_UUID>
   credentials-file: /home/user/.cloudflared/<TUNNEL_UUID>.json

   ingress:
     - hostname: api.yourdomain.com
       service: http://localhost:4000
     - service: http_status:404
   ```
4. **Route DNS**:
   ```bash
   cloudflared tunnel route dns media-converter-tunnel api.yourdomain.com
   ```
5. **Start Docker Compose**:
   ```bash
   cd /path/to/Mediaconverterapp
   cp .env.production.example .env
   docker compose -f docker-compose.prod.yml up -d api worker redis
   cloudflared tunnel run media-converter-tunnel
   ```

Now your home machine powers the backend conversion queue over an encrypted, authenticated Cloudflare Tunnel with zero open inbound router ports and zero hosting costs!
