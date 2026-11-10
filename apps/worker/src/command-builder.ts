import type { ConversionRequest } from '@universal/job-contracts';

export class SafeFFmpegCommandBuilder {
  private args: string[] = [];

  constructor() {
    this.args = ['-hide_banner', '-y'];
  }

  input(inputFilePath: string): this {
    this.args.push('-i', inputFilePath);
    return this;
  }

  trim(startTimeSeconds?: number, durationSeconds?: number): this {
    if (startTimeSeconds !== undefined && startTimeSeconds >= 0) {
      this.args.push('-ss', startTimeSeconds.toFixed(3));
    }
    if (durationSeconds !== undefined && durationSeconds > 0) {
      this.args.push('-t', durationSeconds.toFixed(3));
    }
    return this;
  }

  applyRequestSettings(req: ConversionRequest): this {
    // Video settings
    if (req.video) {
      if (req.video.codec) {
        const safeCodec = /^[a-zA-Z0-9_-]+$/.test(req.video.codec) ? req.video.codec : 'libx264';
        this.args.push('-c:v', safeCodec);
      }
      if (req.video.crf !== undefined) {
        this.args.push('-crf', String(Math.max(0, Math.min(51, req.video.crf))));
      }
      if (req.video.fps) {
        this.args.push('-r', String(Math.max(1, Math.min(120, req.video.fps))));
      }
      if (req.video.width && req.video.height) {
        const w = Math.floor(req.video.width);
        const h = Math.floor(req.video.height);
        this.args.push('-vf', `scale=${w}:${h}`);
      }
    }

    // Audio settings
    if (req.audio) {
      if (req.audio.codec) {
        const safeCodec = /^[a-zA-Z0-9_-]+$/.test(req.audio.codec) ? req.audio.codec : 'aac';
        this.args.push('-c:a', safeCodec);
      }
      if (req.audio.bitrateKbps) {
        this.args.push('-b:a', `${Math.max(32, Math.min(640, req.audio.bitrateKbps))}k`);
      }
      if (req.audio.sampleRateHz) {
        this.args.push('-ar', String(Math.max(8000, Math.min(96000, req.audio.sampleRateHz))));
      }
      if (req.audio.channels) {
        this.args.push('-ac', String(Math.max(1, Math.min(8, req.audio.channels))));
      }
    }

    return this;
  }

  addCustomFilter(filterString: string): this {
    // Clean and validate filter string (prevent command injection characters)
    const sanitized = filterString.replace(/[;&|`$]/g, '').trim();
    if (sanitized) {
      this.args.push('-vf', sanitized);
    }
    return this;
  }

  build(outputFilePath: string): string[] {
    return [...this.args, outputFilePath];
  }
}
