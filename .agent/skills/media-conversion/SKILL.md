---
name: media-conversion
description: Media conversion pipeline, FFmpeg.wasm client integration, native FFmpeg worker commands, hybrid routing heuristics, and audio/video codec matrices for Universal Media Converter.
---

# Media Conversion Architecture & Pipeline

Engineering guidelines for the hybrid client-cloud media conversion engine.

## 1. Engine Abstraction Interface (`MediaEngine`)

All conversions implement a unified interface so the UI code remains completely decoupled from whether execution happens locally in WebAssembly or remotely in the cloud worker:

```typescript
export interface MediaEngine {
  name: 'device' | 'cloud';
  probe(file: File | Blob): Promise<MediaMetadata>;
  convert(
    request: ConversionRequest,
    onProgress: (progress: ConversionProgress) => void
  ): Promise<ConversionResult>;
  cancel(jobId: string): Promise<void>;
}
```

## 2. Hybrid Router 5-Factor Heuristics

The hybrid router evaluates:
1. **File Size**:
   - iOS / Mobile: $\le 35\text{ MB}$ $\rightarrow$ Device; $> 35\text{ MB}$ $\rightarrow$ Cloud.
   - Desktop: $\le 100\text{ MB}$ $\rightarrow$ Device; $> 100\text{ MB}$ $\rightarrow$ Cloud.
2. **Codec Complexity**:
   - Fast client transcode: MP3, WAV, AAC, WebM (VP8/VP9), H.264 baseline.
   - Cloud mandatory: AV1, HEVC/H.265 10-bit, ProRes, multi-pass CRF encodes.
3. **Hardware & Memory**:
   - Fall back to cloud if `navigator.deviceMemory < 4` or if client Wasm emits OOM.
4. **Network State**:
   - If offline, enforce device mode.
5. **User Override**:
   - Respect explicit user setting (`auto` / `device` / `cloud`).

## 3. Safe FFmpeg Command Builder (Injection-Proof)

Never concatenate shell strings. Use typed arguments array:

```typescript
export class FFmpegCommandBuilder {
  private args: string[] = [];

  input(filename: string): this {
    this.args.push('-i', filename);
    return this;
  }

  videoCodec(codec: string): this {
    const safeCodec = /^[a-zA-Z0-9_-]+$/.test(codec) ? codec : 'copy';
    this.args.push('-c:v', safeCodec);
    return this;
  }

  audioCodec(codec: string): this {
    const safeCodec = /^[a-zA-Z0-9_-]+$/.test(codec) ? codec : 'copy';
    this.args.push('-c:a', safeCodec);
    return this;
  }

  build(outputFilename: string): string[] {
    return [...this.args, outputFilename];
  }
}
```
