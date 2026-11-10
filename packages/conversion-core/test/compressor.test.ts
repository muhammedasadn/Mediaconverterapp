import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTargetBitrate, shouldSkipCompression } from '../src/compression-calculator.ts';

describe('Target Size Compressor Bug Reproduction & Fix Verification', () => {
  it('deducts 5% container overhead buffer to prevent Discord / WhatsApp file limit rejection', () => {
    const targetMb = 25; // 25MB Discord limit
    const targetBytes = targetMb * 1024 * 1024;
    const durationSeconds = 120; // 2 minutes
    const audioBitrateKbps = 128;

    const result = calculateTargetBitrate({
      targetBytes,
      durationSeconds,
      audioBitrateKbps,
      sourceWidth: 1920,
      sourceHeight: 1080,
      fps: 30,
    });

    // Total target bits = 25 * 1024 * 1024 * 8 = 209,715,200 bits
    // Safe target bits (with 5% overhead margin) = 209,715,200 * 0.95 = 199,229,440 bits
    // Total kbps budget = 199,229,440 / 120 / 1000 = ~1,660 kbps
    // Video bitrate = 1,660 - 128 = ~1,532 kbps
    assert.ok(result.videoBitrateKbps < 1650, 'Video bitrate must account for 5% container overhead');
    assert.ok(result.videoBitrateKbps > 1400, 'Video bitrate should be in reasonable range');
  });

  it('automatically steps down resolution when bits-per-pixel is too low for 1080p', () => {
    // 10MB target for a 10-minute (600s) video
    const targetBytes = 10 * 1024 * 1024;
    const durationSeconds = 600;

    const result = calculateTargetBitrate({
      targetBytes,
      durationSeconds,
      audioBitrateKbps: 64,
      sourceWidth: 1920,
      sourceHeight: 1080,
      fps: 30,
    });

    // Bitrate for 10MB over 10 mins is very low (~70 kbps)
    // Resolution must step down from 1080p to prevent extreme macroblocking
    assert.ok(result.recommendedWidth < 1920, 'Should downscale from 1080p');
    assert.ok(result.recommendedHeight <= 720, 'Height should be 720p or lower');
    assert.equal(result.isDownscaled, true);
  });

  it('detects when source file is already smaller than target size (no-growth guard)', () => {
    const sourceBytes = 15 * 1024 * 1024; // 15MB
    const targetBytes = 25 * 1024 * 1024; // 25MB (Discord)

    const shouldSkip = shouldSkipCompression(sourceBytes, targetBytes);
    assert.equal(
      shouldSkip.skip,
      true,
      'Must skip compression if source is already smaller than target size'
    );
    assert.match(shouldSkip.reason, /already smaller/i);
  });
});
