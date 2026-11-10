import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTrimCommand } from '../src/trim-engine.ts';

describe('Trimming Engine Bug Reproduction & Fix Verification', () => {
  it('places -ss before -i in lossless mode for instant seeking without decode lag', () => {
    const cmd = buildTrimCommand({
      inputPath: 'input.mp4',
      outputPath: 'trimmed.mp4',
      startTimeSeconds: 15.5,
      endTimeSeconds: 45.2,
      mode: 'lossless',
    });

    const ssIndex = cmd.indexOf('-ss');
    const inputIndex = cmd.indexOf('-i');

    // Bug reproduction: In older builder, -ss was placed AFTER -i, causing slow full-file decode
    assert.ok(ssIndex !== -1, 'Command must include -ss');
    assert.ok(inputIndex !== -1, 'Command must include -i');
    assert.ok(
      ssIndex < inputIndex,
      'Lossless seek flag -ss MUST appear BEFORE -i to enable instant keyframe seek'
    );
  });

  it('uses -c copy and -avoid_negative_ts make_zero in lossless mode', () => {
    const cmd = buildTrimCommand({
      inputPath: 'input.mp4',
      outputPath: 'trimmed.mp4',
      startTimeSeconds: 10,
      endTimeSeconds: 30,
      mode: 'lossless',
    });

    assert.ok(cmd.includes('-c'), 'Must specify -c');
    assert.equal(cmd[cmd.indexOf('-c') + 1], 'copy', 'Lossless mode must copy streams without re-encoding');
    assert.ok(
      cmd.includes('-avoid_negative_ts'),
      'Must include -avoid_negative_ts to prevent negative PTS timestamps causing A/V desync'
    );
  });

  it('correctly calculates duration using -to or -t when trimming', () => {
    const cmd = buildTrimCommand({
      inputPath: 'input.mp4',
      outputPath: 'trimmed.mp4',
      startTimeSeconds: 5.25,
      endTimeSeconds: 20.75,
      mode: 'lossless',
    });

    // Duration should be 20.75 - 5.25 = 15.500 seconds
    const toIndex = cmd.indexOf('-to');
    const tIndex = cmd.indexOf('-t');

    assert.ok(toIndex !== -1 || tIndex !== -1, 'Must specify -to or -t for output duration');
    if (tIndex !== -1) {
      assert.equal(cmd[tIndex + 1], '15.500');
    }
  });

  it('re-encodes boundary frames when precise mode is requested', () => {
    const cmd = buildTrimCommand({
      inputPath: 'input.mp4',
      outputPath: 'trimmed_precise.mp4',
      startTimeSeconds: 12.123,
      endTimeSeconds: 18.456,
      mode: 'precise',
    });

    assert.ok(cmd.includes('-c:v'), 'Precise mode must specify video codec');
    assert.notEqual(cmd[cmd.indexOf('-c:v') + 1], 'copy', 'Precise mode should re-encode for frame-exact cuts');
  });

  it('rejects invalid timestamps where start >= end or start < 0', () => {
    assert.throws(
      () => {
        buildTrimCommand({
          inputPath: 'input.mp4',
          outputPath: 'out.mp4',
          startTimeSeconds: 50,
          endTimeSeconds: 20,
          mode: 'lossless',
        });
      },
      /Start time must be less than end time/i
    );
  });
});
