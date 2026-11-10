import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateImportUrl, isPrivateOrBlockedIp } from '../src/security/ssrf-guard.ts';

describe('SSRF Defense & IP Validation Test Suite', () => {
  it('blocks private loopback and localhost addresses', async () => {
    assert.equal(isPrivateOrBlockedIp('127.0.0.1'), true);
    assert.equal(isPrivateOrBlockedIp('127.0.1.5'), true);
    assert.equal(isPrivateOrBlockedIp('::1'), true);
  });

  it('blocks RFC 1918 private IPv4 subnets (10.x, 172.16-31.x, 192.168.x)', async () => {
    assert.equal(isPrivateOrBlockedIp('10.0.0.1'), true);
    assert.equal(isPrivateOrBlockedIp('10.254.254.1'), true);
    assert.equal(isPrivateOrBlockedIp('172.16.0.1'), true);
    assert.equal(isPrivateOrBlockedIp('172.31.255.254'), true);
    assert.equal(isPrivateOrBlockedIp('192.168.1.1'), true);
    assert.equal(isPrivateOrBlockedIp('192.168.0.100'), true);
  });

  it('blocks cloud metadata endpoint (169.254.169.254) to protect cloud credentials', async () => {
    assert.equal(isPrivateOrBlockedIp('169.254.169.254'), true);
    assert.equal(isPrivateOrBlockedIp('169.254.1.1'), true);
  });

  it('permits valid public IP addresses', async () => {
    assert.equal(isPrivateOrBlockedIp('8.8.8.8'), false);
    assert.equal(isPrivateOrBlockedIp('1.1.1.1'), false);
    assert.equal(isPrivateOrBlockedIp('208.67.222.222'), false);
  });

  it('rejects URLs with credentials, non-https schemes, and custom ports', async () => {
    // Non-https
    const httpRes = await validateImportUrl('http://archive.org/sample.mp3');
    assert.equal(httpRes.isValid, false);
    assert.match(httpRes.reason || '', /https/i);

    // User credentials in URL
    const credsRes = await validateImportUrl('https://admin:secret@archive.org/sample.mp3');
    assert.equal(credsRes.isValid, false);
    assert.match(credsRes.reason || '', /credential/i);

    // Custom port
    const portRes = await validateImportUrl('https://archive.org:8443/sample.mp3');
    assert.equal(portRes.isValid, false);
    assert.match(portRes.reason || '', /port/i);
  });

  it('approves legitimate public HTTPS media URLs', async () => {
    const validRes = await validateImportUrl('https://upload.wikimedia.org/wikipedia/commons/test.ogg', {
      dnsLookupFn: async () => ({ address: '91.198.174.208' }),
    });
    assert.equal(validRes.isValid, true);
    assert.equal(validRes.resolvedIp, '91.198.174.208');
  });
});
