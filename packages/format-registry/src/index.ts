import { FormatDefinition, MediaCategory } from './types';
import { VIDEO_FORMATS } from './video';
import { AUDIO_FORMATS } from './audio';

export * from './types';
export * from './video';
export * from './audio';
export * from './presets';

export const ALL_FORMATS: Record<string, FormatDefinition> = {
  ...VIDEO_FORMATS,
  ...AUDIO_FORMATS,
};

export function getFormatById(id: string): FormatDefinition | undefined {
  return ALL_FORMATS[id.toLowerCase()];
}

export function getFormatsByCategory(category: MediaCategory): FormatDefinition[] {
  return Object.values(ALL_FORMATS).filter((f) => f.category === category);
}

export function getTargetOptionsForSource(sourceCategory: MediaCategory): FormatDefinition[] {
  if (sourceCategory === 'audio') {
    // Audio can be converted to other audio formats, or audio-to-video (MP4/WebM)
    return Object.values(ALL_FORMATS);
  }
  // Video can be converted to other video formats or extracted to audio
  return Object.values(ALL_FORMATS);
}
