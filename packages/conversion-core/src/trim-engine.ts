/**
 * Trimming Engine with Lossless Stream Copy & Precise Frame-Accurate Modes
 */

export interface TrimOptions {
  inputPath: string;
  outputPath: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  mode?: 'lossless' | 'precise';
  crf?: number;
}

export function buildTrimCommand(options: TrimOptions): string[] {
  const {
    inputPath,
    outputPath,
    startTimeSeconds,
    endTimeSeconds,
    mode = 'lossless',
    crf = 20,
  } = options;

  if (startTimeSeconds < 0) {
    throw new Error('Start time must be greater than or equal to 0');
  }

  if (startTimeSeconds >= endTimeSeconds) {
    throw new Error('Start time must be less than end time');
  }

  const durationSeconds = (endTimeSeconds - startTimeSeconds).toFixed(3);
  const startStr = startTimeSeconds.toFixed(3);

  // 1. Lossless Stream Copy Mode (Default — Instantaneous, Zero Quality Loss)
  // Placing -ss BEFORE -i enables fast keyframe seeking
  if (mode === 'lossless') {
    return [
      '-hide_banner',
      '-y',
      '-ss',
      startStr,
      '-i',
      inputPath,
      '-t',
      durationSeconds,
      '-c',
      'copy',
      '-avoid_negative_ts',
      'make_zero',
      outputPath,
    ];
  }

  // 2. Precise Mode (Frame-Accurate Cut with Boundary Re-encoding)
  return [
    '-hide_banner',
    '-y',
    '-ss',
    startStr,
    '-i',
    inputPath,
    '-t',
    durationSeconds,
    '-c:v',
    'libx264',
    '-crf',
    String(Math.max(0, Math.min(51, crf))),
    '-preset',
    'fast',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    outputPath,
  ];
}
