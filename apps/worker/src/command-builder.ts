import type { ConversionRequest } from '@universal/job-contracts';

export class SafeFFmpegCommandBuilder {
  private preInputArgs: string[] = [];
  private inputArg: string[] = [];
  private postInputArgs: string[] = [];

  constructor() {
    this.preInputArgs = ['-hide_banner', '-y'];
  }

  input(inputFilePath: string): this {
    this.inputArg = ['-i', inputFilePath];
    return this;
  }

  /**
   * Fast seek trim: -ss placed BEFORE -i enables instant keyframe seek without decoding latency.
   */
  losslessTrim(startTimeSeconds: number, durationSeconds: number): this {
    if (startTimeSeconds >= 0) {
      this.preInputArgs.push('-ss', startTimeSeconds.toFixed(3));
    }
    if (durationSeconds > 0) {
      this.postInputArgs.push('-t', durationSeconds.toFixed(3));
    }
    this.postInputArgs.push('-c', 'copy', '-avoid_negative_ts', 'make_zero');
    return this;
  }

  /**
   * Frame-accurate precise trim: re-encodes boundary frames.
   */
  preciseTrim(startTimeSeconds: number, durationSeconds: number, crf: number = 20): this {
    if (startTimeSeconds >= 0) {
      this.preInputArgs.push('-ss', startTimeSeconds.toFixed(3));
    }
    if (durationSeconds > 0) {
      this.postInputArgs.push('-t', durationSeconds.toFixed(3));
    }
    this.postInputArgs.push(
      '-c:v',
      'libx264',
      '-crf',
      String(Math.max(0, Math.min(51, crf))),
      '-preset',
      'fast',
      '-c:a',
      'aac',
      '-b:a',
      '192k'
    );
    return this;
  }

  trim(startTimeSeconds?: number, durationSeconds?: number): this {
    if (startTimeSeconds !== undefined && startTimeSeconds >= 0) {
      this.preInputArgs.push('-ss', startTimeSeconds.toFixed(3));
    }
    if (durationSeconds !== undefined && durationSeconds > 0) {
      this.postInputArgs.push('-t', durationSeconds.toFixed(3));
    }
    return this;
  }

  applyRequestSettings(req: ConversionRequest): this {
    // Video settings
    if (req.video) {
      if (req.video.codec) {
        const safeCodec = /^[a-zA-Z0-9_-]+$/.test(req.video.codec) ? req.video.codec : 'libx264';
        this.postInputArgs.push('-c:v', safeCodec);
      }
      if (req.video.crf !== undefined) {
        this.postInputArgs.push('-crf', String(Math.max(0, Math.min(51, req.video.crf))));
      }
      if (req.video.fps) {
        this.postInputArgs.push('-r', String(Math.max(1, Math.min(120, req.video.fps))));
      }
      if (req.video.width && req.video.height) {
        const w = Math.floor(req.video.width);
        const h = Math.floor(req.video.height);
        this.postInputArgs.push('-vf', `scale=${w}:${h}`);
      }
    }

    // Audio settings
    if (req.audio) {
      if (req.audio.codec) {
        const safeCodec = /^[a-zA-Z0-9_-]+$/.test(req.audio.codec) ? req.audio.codec : 'aac';
        this.postInputArgs.push('-c:a', safeCodec);
      }
      if (req.audio.bitrateKbps) {
        this.postInputArgs.push('-b:a', `${Math.max(32, Math.min(640, req.audio.bitrateKbps))}k`);
      }
      if (req.audio.sampleRateHz) {
        this.postInputArgs.push('-ar', String(Math.max(8000, Math.min(96000, req.audio.sampleRateHz))));
      }
      if (req.audio.channels) {
        this.postInputArgs.push('-ac', String(Math.max(1, Math.min(8, req.audio.channels))));
      }
    }

    return this;
  }

  addCustomFilter(filterString: string): this {
    const sanitized = filterString.replace(/[;&|`$]/g, '').trim();
    if (sanitized) {
      this.postInputArgs.push('-vf', sanitized);
    }
    return this;
  }

  build(outputFilePath: string): string[] {
    return [
      ...this.preInputArgs,
      ...this.inputArg,
      ...this.postInputArgs,
      outputFilePath,
    ];
  }
}
