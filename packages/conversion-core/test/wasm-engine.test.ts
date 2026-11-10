import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WasmBrowserEngine, isSharedFFmpegLoaded } from '../src/wasm-engine.ts';
import type { ConversionRequest } from '../../job-contracts/src/index.ts';

describe('WasmBrowserEngine Singleton & Performance Pipeline', () => {
  it('instantiates engine with correct name and initial singleton state', () => {
    const engine = new WasmBrowserEngine();
    assert.equal(engine.name, 'device');
    assert.equal(isSharedFFmpegLoaded(), false);
  });

  it('reports unsupported in non-browser Node environments', async () => {
    const engine = new WasmBrowserEngine();
    const supported = await engine.isSupported();
    assert.equal(supported, false);
  });

  it('probes raw Blob objects accurately', async () => {
    const engine = new WasmBrowserEngine();
    const fakeBlob = new Blob([new Uint8Array([1, 2, 3, 4])], { type: 'video/mp4' });
    const probe = await engine.probe(fakeBlob);

    assert.equal(probe.sizeBytes, 4);
    assert.equal(probe.mimeType, 'video/mp4');
  });

  it('handles conversion pipeline safely and invokes progress events', async () => {
    const engine = new WasmBrowserEngine();
    const fakeBlob = new Blob([new Uint8Array(100)], { type: 'video/mp4' });
    const progressList: number[] = [];

    const req: ConversionRequest = {
      id: '12345678-1234-4234-8234-123456789012',
      inputFilename: 'test.mp4',
      inputSizeBytes: 100,
      inputMimeType: 'video/mp4',
      targetFormat: 'mp4',
      preset: 'balanced',
      enginePreference: 'device',
      createdAt: new Date().toISOString(),
    };

    const result = await engine.convert(fakeBlob, req, (p) => {
      progressList.push(p.progressPercent);
    });

    assert.equal(result.engineUsed, 'device');
    assert.equal(result.outputFilename, 'converted_test.mp4');
    assert.ok(progressList.length > 0);
    assert.ok(progressList.includes(100));
  });

  it('cancels without unhandled exceptions', async () => {
    const engine = new WasmBrowserEngine();
    await assert.doesNotReject(async () => {
      await engine.cancel('job-123');
    });
  });
});
