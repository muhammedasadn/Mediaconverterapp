import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getDiskStats, assertDiskCapacity } from '../src/services/disk-watchdog.ts';

describe('Cluster Disk Watchdog & Capacity Guard', () => {
  it('returns valid numeric disk statistics with free percentage calculation', () => {
    const stats = getDiskStats();
    assert.equal(typeof stats.freePercent, 'number');
    assert.equal(typeof stats.totalBytes, 'number');
    assert.equal(typeof stats.availableBytes, 'number');
    assert.ok(stats.freePercent >= 0 && stats.freePercent <= 100);
    assert.equal(stats.minFreePercentThreshold, 15);
  });

  it('allows job execution when disk space exceeds threshold', () => {
    assert.doesNotThrow(() => {
      assertDiskCapacity();
    });
  });

  it('reports isAcceptingJobs boolean correctly', () => {
    const stats = getDiskStats();
    if (stats.freePercent >= 15) {
      assert.equal(stats.isAcceptingJobs, true);
    } else {
      assert.equal(stats.isAcceptingJobs, false);
    }
  });
});
