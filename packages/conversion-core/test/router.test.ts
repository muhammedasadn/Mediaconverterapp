import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateHybridRouting } from '../src/router.ts';
import type { ConversionRequest } from '../../job-contracts/src/index.ts';

describe('Hybrid Engine Router Heuristics', () => {
  const baseRequest: ConversionRequest = {
    sourceFileName: 'sample.mp4',
    targetFormat: 'mp4',
    enginePreference: 'auto',
    video: {
      codec: 'libx264',
      crf: 23,
    },
  };

  it('routes to device when user explicitly chooses device preference', () => {
    const decision = evaluateHybridRouting(
      150 * 1024 * 1024, // 150MB
      { ...baseRequest, enginePreference: 'device' },
      { isOnline: true, isMobile: false }
    );

    assert.equal(decision.engine, 'device');
    assert.equal(decision.isOverride, true);
  });

  it('routes to cloud when user explicitly chooses cloud preference', () => {
    const decision = evaluateHybridRouting(
      5 * 1024 * 1024, // 5MB
      { ...baseRequest, enginePreference: 'cloud' },
      { isOnline: true, isMobile: false }
    );

    assert.equal(decision.engine, 'cloud');
    assert.equal(decision.isOverride, true);
  });

  it('falls back to device if user chose cloud but client is offline', () => {
    const decision = evaluateHybridRouting(
      20 * 1024 * 1024,
      { ...baseRequest, enginePreference: 'cloud' },
      { isOnline: false, isMobile: false }
    );

    assert.equal(decision.engine, 'device');
    assert.equal(decision.canUseCloud, false);
  });

  it('forces cloud processing for demanding codecs (libx265 / HEVC / AV1)', () => {
    const decision = evaluateHybridRouting(
      10 * 1024 * 1024, // 10MB
      {
        ...baseRequest,
        video: { codec: 'libx265', crf: 28 },
      },
      { isOnline: true, isMobile: false }
    );

    assert.equal(decision.engine, 'cloud');
    assert.equal(decision.canUseDevice, false);
    assert.match(decision.reason, /libx265/);
  });

  it('routes to device for lightweight files on desktop', () => {
    const decision = evaluateHybridRouting(
      25 * 1024 * 1024, // 25MB
      baseRequest,
      { isOnline: true, isMobile: false }
    );

    assert.equal(decision.engine, 'device');
    assert.equal(decision.canUseDevice, true);
  });

  it('routes to cloud on desktop when file exceeds desktop threshold (100MB)', () => {
    const decision = evaluateHybridRouting(
      120 * 1024 * 1024, // 120MB
      baseRequest,
      { isOnline: true, isMobile: false }
    );

    assert.equal(decision.engine, 'cloud');
  });

  it('routes to cloud on mobile when file exceeds mobile threshold (35MB)', () => {
    const decision = evaluateHybridRouting(
      40 * 1024 * 1024, // 40MB
      baseRequest,
      { isOnline: true, isMobile: true }
    );

    assert.equal(decision.engine, 'cloud');
    assert.match(decision.reason, /mobile/i);
  });

  it('allows mobile device processing for files under 35MB', () => {
    const decision = evaluateHybridRouting(
      15 * 1024 * 1024, // 15MB
      baseRequest,
      { isOnline: true, isMobile: true }
    );

    assert.equal(decision.engine, 'device');
  });

  it('gracefully degrades to device engine when cloud cluster is disabled or offline', () => {
    const decision = evaluateHybridRouting(
      200 * 1024 * 1024, // 200MB (normally cloud)
      baseRequest,
      { isOnline: true, isMobile: false, cloudEngineEnabled: false }
    );

    assert.equal(decision.engine, 'device');
    assert.equal(decision.canUseCloud, false);
    assert.match(decision.reason, /offline|disabled/i);
  });

  it('forces device fallback when user selects cloud preference but cloud cluster is disabled', () => {
    const decision = evaluateHybridRouting(
      50 * 1024 * 1024,
      { ...baseRequest, enginePreference: 'cloud' },
      { isOnline: true, isMobile: false, cloudEngineEnabled: false }
    );

    assert.equal(decision.engine, 'device');
    assert.equal(decision.canUseCloud, false);
    assert.equal(decision.isOverride, true);
  });
});
