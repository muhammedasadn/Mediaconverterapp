import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseYouTubeUrl } from '../src/youtube-parser.ts';

describe('YouTube URL Parser & Canonical ID Extractor', () => {
  it('parses standard desktop watch links', () => {
    const res = parseYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    assert.equal(res.isValid, true);
    assert.equal(res.videoId, 'dQw4w9WgXcQ');
    assert.equal(res.canonicalUrl, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  it('parses youtu.be shortlinks', () => {
    const res = parseYouTubeUrl('https://youtu.be/dQw4w9WgXcQ?t=42');
    assert.equal(res.isValid, true);
    assert.equal(res.videoId, 'dQw4w9WgXcQ');
    assert.equal(res.canonicalUrl, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });

  it('parses mobile links and YouTube Shorts links', () => {
    const mobileRes = parseYouTubeUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ');
    assert.equal(mobileRes.isValid, true);
    assert.equal(mobileRes.videoId, 'dQw4w9WgXcQ');

    const shortsRes = parseYouTubeUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
    assert.equal(shortsRes.isValid, true);
    assert.equal(shortsRes.videoId, 'dQw4w9WgXcQ');
  });

  it('rejects lookalike or malicious phishing domains', () => {
    const fake1 = parseYouTubeUrl('https://notyoutube.com/watch?v=dQw4w9WgXcQ');
    assert.equal(fake1.isValid, false);
    assert.match(fake1.reason || '', /not a recognized YouTube domain/);

    const fake2 = parseYouTubeUrl('https://youtube.com.attacker.com/watch?v=dQw4w9WgXcQ');
    assert.equal(fake2.isValid, false);
  });

  it('rejects invalid or malformed video IDs', () => {
    const badId = parseYouTubeUrl('https://www.youtube.com/watch?v=short');
    assert.equal(badId.isValid, false);
    assert.match(badId.reason || '', /valid 11-character/);
  });
});
