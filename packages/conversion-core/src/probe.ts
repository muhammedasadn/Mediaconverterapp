import { MediaProbeResult } from '@universal/format-registry';

/**
 * Fast client-side media probe extracting duration, dimensions, and type
 * using native browser HTML5 audio/video elements and Object URLs.
 */
export async function probeMediaFile(file: File): Promise<MediaProbeResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const isVideo = file.type.startsWith('video/') || ['mp4', 'mov', 'webm', 'mkv', 'avi', 'flv'].includes(extension);
  const isAudio = file.type.startsWith('audio/') || ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg', 'opus'].includes(extension);

  const initialResult: MediaProbeResult = {
    filename: file.name,
    sizeBytes: file.size,
    format: extension,
    mimeType: file.type || (isVideo ? `video/${extension}` : `audio/${extension}`),
  };

  if (typeof window === 'undefined') {
    return initialResult;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = objectUrl;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => resolve(); // Graceful fallback if format not natively decodable by browser
        setTimeout(() => resolve(), 3000); // 3-second safeguard
      });

      if (video.duration && !isNaN(video.duration)) {
        initialResult.durationSeconds = video.duration;
      }
      if (video.videoWidth && video.videoHeight) {
        initialResult.video = {
          codec: extension === 'webm' ? 'vp9' : 'h264',
          width: video.videoWidth,
          height: video.videoHeight,
          fps: 30,
          aspectRatio: `${video.videoWidth}:${video.videoHeight}`,
        };
      }
    } else if (isAudio) {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.src = objectUrl;

      await new Promise<void>((resolve) => {
        audio.onloadedmetadata = () => resolve();
        audio.onerror = () => resolve();
        setTimeout(() => resolve(), 3000);
      });

      if (audio.duration && !isNaN(audio.duration)) {
        initialResult.durationSeconds = audio.duration;
        initialResult.audio = {
          codec: extension,
          sampleRateHz: 44100,
          channels: 2,
        };
      }
    }
  } catch (err) {
    console.warn('Browser media probe error:', err);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  return initialResult;
}
