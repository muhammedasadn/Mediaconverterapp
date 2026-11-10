import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateVideoQualityOptions,
  generateAudioQualityOptions,
  estimateMediaSizeBytes,
  formatBytes,
} from '../src/quality-calculator.ts';

describe('Quality Picker & Sizing Engine Tests', () => {
  it('never produces upscaled quality options above source resolution', () => {
    // 720p source should NOT have 1080p
    const options720 = generateVideoQualityOptions({
      sourceWidth: 1280,
      sourceHeight: 720,
      durationSeconds: 120,
    });

    const has1080 = options720.some((o) => o.id === '1080p');
    assert.equal(has1080, false, '720p source must not contain 1080p option');

    const has720 = options720.some((o) => o.id === '720p');
    assert.equal(has720, true, '720p source must contain 720p option');

    // 480p source should NOT have 1080p or 720p
    const options480 = generateVideoQualityOptions({
      sourceWidth: 854,
      sourceHeight: 480,
      durationSeconds: 60,
    });

    assert.equal(options480.some((o) => o.id === '1080p'), false);
    assert.equal(options480.some((o) => o.id === '720p'), false);
    assert.equal(options480.some((o) => o.id === '480p'), true);
    assert.equal(options480.some((o) => o.id === '360p'), true);
  });

  it('marks 720p as recommended for HD video and 192k for standard audio', () => {
    const videoOpts = generateVideoQualityOptions({
      sourceWidth: 1920,
      sourceHeight: 1080,
      durationSeconds: 90,
    });

    const recVideo = videoOpts.find((o) => o.isRecommended);
    assert.equal(recVideo?.id, '720p', 'Default recommended video quality must be 720p');

    const audioOpts = generateAudioQualityOptions({
      durationSeconds: 180,
      sourceIsAac: false,
    });

    const recAudio = audioOpts.find((o) => o.isRecommended);
    assert.equal(recAudio?.id, '192k', 'Default recommended audio quality must be 192k');
  });

  it('offers instant M4A stream copy when source audio is AAC', () => {
    const audioOptsAac = generateAudioQualityOptions({
      durationSeconds: 180,
      sourceIsAac: true,
    });

    const m4aCopy = audioOptsAac.find((o) => o.id === 'm4a_copy');
    assert.ok(m4aCopy, 'M4A stream copy option must be present for AAC audio source');
    assert.equal(m4aCopy?.isStreamCopy, true);
    assert.equal(m4aCopy?.format, 'm4a');
  });

  it('calculates estimated size with 5% container overhead margin', () => {
    // 2000 kbps video + 128 kbps audio for 10 seconds:
    // 2128 kbps = 2,128,000 bps
    // raw = 2,128,000 * 10 / 8 = 2,660,000 bytes
    // with 5% overhead = 2,660,000 * 1.05 = 2,793,000 bytes
    const estimated = estimateMediaSizeBytes(2000, 128, 10);
    assert.equal(estimated, 2793000);

    const formatted = formatBytes(estimated);
    assert.match(formatted, /~2\.7 MB/);
  });
});
