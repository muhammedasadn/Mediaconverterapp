// ----------------------------------------------------------------------------
// Universal Media Converter — Production k6 Performance & Load Benchmark
// Simulates 50 concurrent users exercising API health, readiness, and link analysis
// Run with: k6 run scripts/k6-load-test.js
// ----------------------------------------------------------------------------

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = __ENV.API_URL || 'http://localhost:4000';

// Custom metrics
const healthDuration = new Trend('health_duration_ms');
const readyDuration = new Trend('ready_duration_ms');
const errorRate = new Rate('error_rate');

export const options = {
  stages: [
    { duration: '10s', target: 15 }, // Warm-up ramp
    { duration: '30s', target: 50 }, // Peak sustained load (50 concurrent users)
    { duration: '10s', target: 0 },  // Cool-down
  ],
  thresholds: {
    'health_duration_ms': ['p(95)<150'], // 95% of health requests under 150ms
    'ready_duration_ms': ['p(95)<250'],  // 95% of readiness checks under 250ms
    'error_rate': ['rate<0.01'],         // Less than 1% failure rate
  },
};

export default function () {
  // Test 1: Liveness Probe
  const healthRes = http.get(`${BASE_URL}/api/health`, {
    tags: { name: 'HealthCheck' },
  });
  healthDuration.add(healthRes.timings.duration);
  const healthOk = check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health payload status healthy': (r) => r.json('status') === 'healthy',
  });
  if (!healthOk) errorRate.add(1);

  // Test 2: Readiness Probe
  const readyRes = http.get(`${BASE_URL}/api/ready`, {
    tags: { name: 'ReadinessCheck' },
  });
  readyDuration.add(readyRes.timings.duration);
  const readyOk = check(readyRes, {
    'ready status is 200': (r) => r.status === 200,
    'ready payload status ready': (r) => r.json('status') === 'ready',
    'redis check connected': (r) => r.json('checks.redis') === 'connected',
  });
  if (!readyOk) errorRate.add(1);

  // Test 3: Synthetic Media Analysis (Cached / Fast path)
  const payload = JSON.stringify({
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Big_Buck_Bunny_medium.ogv',
  });

  const analyzeRes = http.post(`${BASE_URL}/api/import/analyze`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'AnalyzeUrl' },
  });

  check(analyzeRes, {
    'analyze responded (200 or 400)': (r) => r.status === 200 || r.status === 400,
  });

  sleep(0.5);
}
