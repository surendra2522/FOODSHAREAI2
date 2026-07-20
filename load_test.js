import { performance } from 'perf_hooks';
import fs from 'fs';

// Configuration
const DURATION_MS = 60 * 1000; // 1 minute
const CONCURRENCY = 100; // 100 virtual users
const ENDPOINTS = [
  { name: 'Root API (/)', url: 'http://localhost:5000/' },
  { name: 'Public Stats (/api/donations/public-stats)', url: 'http://localhost:5000/api/donations/public-stats' }
];

async function runLoadTest(name, url) {
  console.log(`\n========================================`);
  console.log(`Starting load test for: ${name}`);
  console.log(`URL: ${url}`);
  console.log(`Concurrency: ${CONCURRENCY} VUs`);
  console.log(`Duration: ${DURATION_MS / 1000} seconds`);
  console.log(`========================================`);

  const stats = {
    latencies: [],
    success: 0,
    failure: 0,
    statusCodes: {}
  };

  const startTime = Date.now();
  const stopTime = startTime + DURATION_MS;

  // Define the worker loop
  async function worker() {
    while (Date.now() < stopTime) {
      const reqStart = performance.now();
      try {
        const res = await fetch(url);
        const reqEnd = performance.now();
        const duration = reqEnd - reqStart;
        stats.latencies.push(duration);

        if (res.ok) {
          stats.success++;
        } else {
          stats.failure++;
          stats.statusCodes[res.status] = (stats.statusCodes[res.status] || 0) + 1;
        }
      } catch (err) {
        const reqEnd = performance.now();
        const duration = reqEnd - reqStart;
        stats.latencies.push(duration);
        stats.failure++;
        stats.statusCodes['ERROR'] = (stats.statusCodes['ERROR'] || 0) + 1;
      }
    }
  }

  // Spawn concurrent workers
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker());
  }

  // Wait for all workers to finish
  await Promise.all(workers);

  const actualDurationMs = Date.now() - startTime;
  const actualDurationSec = actualDurationMs / 1000;
  const totalRequests = stats.success + stats.failure;
  const rps = totalRequests / actualDurationSec;

  if (stats.latencies.length === 0) {
    console.log(`No requests completed for ${name}.`);
    return null;
  }

  // Calculate metrics
  const sorted = stats.latencies.sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const sum = sorted.reduce((a, b) => a + b, 0);
  const avg = sum / sorted.length;
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p90 = sorted[Math.floor(sorted.length * 0.9)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];

  console.log(`Test Finished!`);
  console.log(`Actual Duration: ${actualDurationSec.toFixed(2)}s`);
  console.log(`Total Requests: ${totalRequests}`);
  console.log(`Requests/sec (RPS): ${rps.toFixed(2)}`);
  console.log(`Successful: ${stats.success}`);
  console.log(`Failed: ${stats.failure}`);
  console.log(`Response Times:`);
  console.log(`  Min: ${min.toFixed(2)}ms`);
  console.log(`  Max: ${max.toFixed(2)}ms`);
  console.log(`  Avg: ${avg.toFixed(2)}ms`);
  console.log(`  p50 (Median): ${p50.toFixed(2)}ms`);
  console.log(`  p90: ${p90.toFixed(2)}ms`);
  console.log(`  p95: ${p95.toFixed(2)}ms`);
  console.log(`  p99: ${p99.toFixed(2)}ms`);
  if (Object.keys(stats.statusCodes).length > 0) {
    console.log(`Status Codes:`, stats.statusCodes);
  }

  return {
    name,
    url,
    concurrency: CONCURRENCY,
    durationSeconds: actualDurationSec,
    totalRequests,
    rps,
    successCount: stats.success,
    failureCount: stats.failure,
    minMs: min,
    maxMs: max,
    avgMs: avg,
    p50Ms: p50,
    p90Ms: p90,
    p95Ms: p95,
    p99Ms: p99,
    statusCodes: stats.statusCodes
  };
}

async function main() {
  const results = [];
  for (const endpoint of ENDPOINTS) {
    const res = await runLoadTest(endpoint.name, endpoint.url);
    if (res) results.push(res);
    // Pause briefly between tests to let server recover/cool down
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Write results to JSON
  fs.writeFileSync('load_test_results.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to load_test_results.json');
}

main().catch(err => {
  console.error('Error running load test:', err);
});
