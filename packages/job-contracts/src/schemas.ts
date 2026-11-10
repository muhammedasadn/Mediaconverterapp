import { z } from 'zod';

export const EngineModeSchema = z.enum(['auto', 'device', 'cloud']);
export type EngineMode = z.infer<typeof EngineModeSchema>;

export const QualityPresetSchema = z.enum(['small', 'balanced', 'best', 'lossless']);
export type QualityPresetType = z.infer<typeof QualityPresetSchema>;

export const AudioEncodingSettingsSchema = z.object({
  codec: z.string().regex(/^[a-zA-Z0-9_-]+$/).optional(),
  bitrateKbps: z.number().int().min(32).max(640).optional(),
  sampleRateHz: z.number().int().min(8000).max(96000).optional(),
  channels: z.union([z.literal(1), z.literal(2), z.literal(6)]).optional(),
});
export type AudioEncodingSettings = z.infer<typeof AudioEncodingSettingsSchema>;

export const VideoEncodingSettingsSchema = z.object({
  codec: z.string().regex(/^[a-zA-Z0-9_-]+$/).optional(),
  crf: z.number().int().min(0).max(51).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  fps: z.number().min(1).max(120).optional(),
  speedPreset: z.enum(['ultrafast', 'fast', 'medium', 'slow']).optional(),
});
export type VideoEncodingSettings = z.infer<typeof VideoEncodingSettingsSchema>;

export const ConversionRequestSchema = z.object({
  id: z.string().uuid(),
  inputFilename: z.string().min(1).max(255),
  inputSizeBytes: z.number().positive(),
  inputMimeType: z.string(),
  targetFormat: z.string().min(2).max(10),
  preset: QualityPresetSchema.default('balanced'),
  enginePreference: EngineModeSchema.default('auto'),
  video: VideoEncodingSettingsSchema.optional(),
  audio: AudioEncodingSettingsSchema.optional(),
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
});
export type ConversionRequest = z.infer<typeof ConversionRequestSchema>;

export const JobStatusEnum = z.enum(['queued', 'probing', 'converting', 'completed', 'failed', 'cancelled']);
export type JobStatus = z.infer<typeof JobStatusEnum>;

export const JobStatusResponseSchema = z.object({
  jobId: z.string().uuid(),
  status: JobStatusEnum,
  progressPercent: z.number().min(0).max(100),
  stage: z.string().optional(),
  etaSeconds: z.number().optional(),
  currentFps: z.number().optional(),
  engineUsed: z.enum(['device', 'cloud']),
  downloadUrl: z.string().url().optional(),
  outputSizeBytes: z.number().optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      suggestCloud: z.boolean().optional(),
    })
    .optional(),
});
export type JobStatusResponse = z.infer<typeof JobStatusResponseSchema>;
