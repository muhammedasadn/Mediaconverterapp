import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectMagicBytes, validateMediaSignature } from '../src/magic-bytes.ts';

describe('Magic Bytes & File Signature Detection', () => {
  it('correctly identifies MP4 container with ftypisom brand', () => {
    // 00 00 00 20 66 74 79 70 69 73 6F 6D ...
    const buffer = new Uint8Array(32);
    buffer.set([0x00, 0x00, 0x00, 0x20], 0);
    // 'ftyp'
    buffer.set([0x66, 0x74, 0x79, 0x70], 4);
    // 'isom'
    buffer.set([0x69, 0x73, 0x6f, 0x6d], 8);

    const result = detectMagicBytes(buffer);
    assert.equal(result.mime, 'video/mp4');
    assert.equal(result.extension, 'mp4');
    assert.equal(result.category, 'video');

    const validation = validateMediaSignature(buffer);
    assert.equal(validation.isValidMedia, true);
  });

  it('identifies QuickTime MOV with qt brand', () => {
    const buffer = new Uint8Array(32);
    buffer.set([0x00, 0x00, 0x00, 0x14], 0);
    buffer.set([0x66, 0x74, 0x79, 0x70], 4); // ftyp
    buffer.set([0x71, 0x74, 0x20, 0x20], 8); // 'qt  '

    const result = detectMagicBytes(buffer);
    assert.equal(result.mime, 'video/quicktime');
    assert.equal(result.extension, 'mov');
  });

  it('correctly identifies WebM container with EBML header', () => {
    const buffer = new Uint8Array(64);
    // EBML magic: 1A 45 DF A3
    buffer.set([0x1a, 0x45, 0xdf, 0xa3], 0);
    // Embed 'webm' inside EBML docType string
    const encoder = new TextEncoder();
    buffer.set(encoder.encode('...webm...'), 10);

    const result = detectMagicBytes(buffer);
    assert.equal(result.mime, 'video/webm');
    assert.equal(result.extension, 'webm');
    assert.equal(result.category, 'video');
  });

  it('correctly identifies WAV audio container with RIFF header', () => {
    const buffer = new Uint8Array(32);
    // 'RIFF'
    buffer.set([0x52, 0x49, 0x46, 0x46], 0);
    buffer.set([0x00, 0x00, 0x00, 0x00], 4);
    // 'WAVE'
    buffer.set([0x57, 0x41, 0x56, 0x45], 8);

    const result = detectMagicBytes(buffer);
    assert.equal(result.mime, 'audio/wav');
    assert.equal(result.extension, 'wav');
    assert.equal(result.category, 'audio');
  });

  it('identifies MP3 with ID3 header', () => {
    const buffer = new Uint8Array(32);
    // 'ID3'
    buffer.set([0x49, 0x44, 0x33], 0);

    const result = detectMagicBytes(buffer);
    assert.equal(result.mime, 'audio/mpeg');
    assert.equal(result.extension, 'mp3');
    assert.equal(result.category, 'audio');
  });

  it('identifies FLAC audio container with fLaC magic', () => {
    const buffer = new Uint8Array(32);
    // 'fLaC'
    buffer.set([0x66, 0x4c, 0x61, 0x43], 0);

    const result = detectMagicBytes(buffer);
    assert.equal(result.mime, 'audio/flac');
    assert.equal(result.extension, 'flac');
  });

  it('identifies Ogg container with OggS magic', () => {
    const buffer = new Uint8Array(32);
    // 'OggS'
    buffer.set([0x4f, 0x67, 0x67, 0x53], 0);

    const result = detectMagicBytes(buffer);
    assert.equal(result.mime, 'audio/ogg');
    assert.equal(result.extension, 'ogg');
  });

  it('identifies GIF image with GIF89a header', () => {
    const buffer = new Uint8Array(32);
    // 'GIF8'
    buffer.set([0x47, 0x49, 0x46, 0x38, 0x39, 0x61], 0);

    const result = detectMagicBytes(buffer);
    assert.equal(result.mime, 'image/gif');
    assert.equal(result.extension, 'gif');
    assert.equal(result.category, 'image');
  });

  it('rejects spoofed plain text files disguised as media', () => {
    const encoder = new TextEncoder();
    const fakeBuffer = encoder.encode('<!DOCTYPE html><html><body>malicious payload</body></html>');

    const validation = validateMediaSignature(fakeBuffer);
    assert.equal(validation.isValidMedia, false);
    assert.equal(validation.detected.category, 'unknown');
  });
});
