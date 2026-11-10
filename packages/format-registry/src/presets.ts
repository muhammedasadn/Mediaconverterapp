import { QualityPreset } from './types';

export interface PresetConfiguration {
  id: QualityPreset;
  label: string;
  badge: string;
  description: string;
  videoCrf: number;
  audioBitrateKbps: number;
  speedPreset: 'ultrafast' | 'fast' | 'medium' | 'slow';
}

export const QUALITY_PRESETS: Record<QualityPreset, PresetConfiguration> = {
  small: {
    id: 'small',
    label: 'Small Size',
    badge: 'Fastest',
    description: 'Aggressive compression. Great for Discord, WhatsApp, and email attachments.',
    videoCrf: 28,
    audioBitrateKbps: 96,
    speedPreset: 'fast',
  },
  balanced: {
    id: 'balanced',
    label: 'Balanced',
    badge: 'Recommended',
    description: 'Perfect equilibrium between file size and crystal-clear visual quality.',
    videoCrf: 23,
    audioBitrateKbps: 160,
    speedPreset: 'medium',
  },
  best: {
    id: 'best',
    label: 'High Fidelity',
    badge: 'Pro Quality',
    description: 'Near-lossless clarity for YouTube, Vimeo, and archive presentations.',
    videoCrf: 18,
    audioBitrateKbps: 320,
    speedPreset: 'slow',
  },
  lossless: {
    id: 'lossless',
    label: 'Lossless',
    badge: 'Zero Loss',
    description: 'Bit-for-bit exact audio/video stream copying without re-encoding.',
    videoCrf: 0,
    audioBitrateKbps: 0,
    speedPreset: 'medium',
  },
};
