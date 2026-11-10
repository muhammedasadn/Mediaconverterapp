export const TYPES_VERSION = '1.0.0';
export type MediaCategory = 'video' | 'audio' | 'image';


export type QualityPreset = 'small' | 'balanced' | 'best' | 'lossless';

export interface CodecInfo {
  id: string;
  name: string;
  description: string;
  isLossless?: boolean;
  requiresCloud?: boolean;
}

export interface FormatDefinition {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  category: MediaCategory;
  description: string;
  supportedVideoCodecs: CodecInfo[];
  supportedAudioCodecs: CodecInfo[];
  defaultVideoCodec?: string;
  defaultAudioCodec?: string;
  supportsBrowserWasm: boolean;
  isRecommended?: boolean;
}

export interface MediaProbeResult {
  filename: string;
  sizeBytes: number;
  format: string;
  mimeType: string;
  durationSeconds?: number;
  bitrateKbps?: number;
  video?: {
    codec: string;
    width: number;
    height: number;
    fps: number;
    aspectRatio?: string;
  };
  audio?: {
    codec: string;
    sampleRateHz: number;
    channels: number;
    bitrateKbps?: number;
  };
}
