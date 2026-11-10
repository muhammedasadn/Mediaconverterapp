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

  withThreads(threads: number = 0): this {
    if (!this.preInputArgs.includes('-threads')) {
      this.preInputArgs.push('-threads', String(Math.max(0, threads)));
    }
    return this;
  }

  withFastStart(): this {
    if (!this.postInputArgs.includes('-movflags')) {
      this.postInputArgs.push('-movflags', '+faststart');
    }
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
   * Frame-accurate precise trim: re-encodes boundary frames with fast preset.
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
    // Multi-threaded CPU utilization
    if (!this.preInputArgs.includes('-threads')) {
      this.preInputArgs.push('-threads', '0');
    }

    // Sub-clip trimming if specified in request
    if (req.trim) {
      const dur = req.trim.endTimeSeconds - req.trim.startTimeSeconds;
      if (req.trim.mode === 'lossless') {
        this.losslessTrim(req.trim.startTimeSeconds, dur);
      } else {
        this.preciseTrim(req.trim.startTimeSeconds, dur, req.trim.crf ?? 20);
      }
    }

    // Video settings
    if (req.video) {
      if (req.video.codec) {
        const safeCodec = /^[a-zA-Z0-9_-]+$/.test(req.video.codec) ? req.video.codec : 'libx264';
        this.postInputArgs.push('-c:v', safeCodec);
      }

      // High-efficiency fast encode preset
      const speedPreset = req.video.speedPreset || 'fast';
      this.postInputArgs.push('-preset', speedPreset);

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

    // Streaming optimization for MP4 and M4A
    if (req.targetFormat === 'mp4' || req.targetFormat === 'm4a') {
      this.withFastStart();
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
