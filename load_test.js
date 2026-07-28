#!/usr/bin/env node
'use strict';

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const options = {
    concurrency: 300,
    duration: 60,
    rampUp: 10,
    baseUrl: process.env.LOAD_TEST_BASE_URL || 'http://localhost:5000',
    path: process.env.LOAD_TEST_PATH || '/api/donations/public-stats',
    method: process.env.LOAD_TEST_METHOD || 'GET',
    headers: {},
    token: process.env.LOAD_TEST_TOKEN || '',
    body: process.env.LOAD_TEST_BODY || '',
    reportDir: path.resolve(process.cwd(), process.env.LOAD_TEST_REPORT_DIR || 'load-test-reports'),
    requestRatePerUser: 1
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const value = argv[i + 1];
    switch (key) {
      case 'concurrency': options.concurrency = Number(value); break;
      case 'duration': options.duration = Number(value); break;
      case 'ramp-up': options.rampUp = Number(value); break;
      case 'base-url': options.baseUrl = value; break;
      case 'path': options.path = value; break;
      case 'method': options.method = value.toUpperCase(); break;
      case 'headers': options.headers = JSON.parse(value); break;
      case 'token': options.token = value; break;
      case 'body': options.body = value; break;
      case 'report-dir': options.reportDir = path.resolve(process.cwd(), value); break;
      case 'request-rate': options.requestRatePerUser = Number(value); break;
      default:
        throw new Error(`Unsupported argument: ${arg}`);
    }
  }

  if (!Number.isFinite(options.concurrency) || options.concurrency < 1) {
    throw new Error('Concurrency must be a positive integer');
  }
  if (!Number.isFinite(options.duration) || options.duration < 1) {
    throw new Error('Duration must be a positive number');
  }
  if (!Number.isFinite(options.rampUp) || options.rampUp < 0) {
    throw new Error('Ramp-up must be a non-negative number');
  }
  if (!Number.isFinite(options.requestRatePerUser) || options.requestRatePerUser <= 0) {
    throw new Error('Request rate per user must be greater than zero');
  }

  return options;
}

function percentile(values, ratio) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.min(sorted.length - 1, Math.max(0, Math.floor(sorted.length * ratio)));
  return sorted[rank];
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}

function formatBytes(value) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = Number(value || 0);
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: formatBytes(usage.rss),
    heapUsed: formatBytes(usage.heapUsed),
    heapTotal: formatBytes(usage.heapTotal)
  };
}

function buildRequestUrl(baseUrl, path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function buildRequestOptions(config) {
  const headers = { Accept: 'application/json', ...(config.headers || {}) };
  if (config.token) headers.Authorization = `Bearer ${config.token}`;

  const requestBody = config.body ? config.body : undefined;
  let parsedBody = requestBody;
  if (typeof requestBody === 'string' && requestBody.trim()) {
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (error) {
      parsedBody = requestBody;
    }
  }

  const options = {
    method: config.method,
    headers
  };
  if (parsedBody !== undefined && !['GET', 'HEAD'].includes(config.method)) {
    options.body = typeof parsedBody === 'string' ? parsedBody : JSON.stringify(parsedBody);
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
  }
  return options;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runLoadTest(config) {
  const startTime = Date.now();
  const stopAt = startTime + config.duration * 1000;
  const requestIntervalMs = Math.max(50, Math.round(1000 / config.requestRatePerUser));
  const reportUrl = buildRequestUrl(config.baseUrl, config.path);
  const requestOptions = buildRequestOptions(config);

  const metrics = {
    name: `${config.method} ${config.path}`,
    url: reportUrl,
    startedAt: new Date(startTime).toISOString(),
    concurrency: config.concurrency,
    durationSeconds: config.duration,
    rampUpSeconds: config.rampUp,
    totalRequests: 0,
    totalSuccessful: 0,
    totalFailed: 0,
    latencies: [],
    statusCodes: {},
    errors: [],
    bytesSent: 0,
    bytesReceived: 0,
    inFlight: 0,
    timeline: [],
    cpuSamples: []
  };

  const dashboard = () => {
    const elapsedSeconds = Math.max(0.01, (Date.now() - startTime) / 1000);
    const total = metrics.totalSuccessful + metrics.totalFailed;
    const currentRps = total / elapsedSeconds;
    const cpu = process.cpuUsage();
    const currentLatency = metrics.latencies.length ? (metrics.latencies.reduce((sum, item) => sum + item, 0) / metrics.latencies.length) : 0;
    const successRate = total ? (metrics.totalSuccessful / total) * 100 : 100;
    const errorRate = total ? (metrics.totalFailed / total) * 100 : 0;

    const line = [
      `Active Users: ${metrics.inFlight}`,
      `Running Time: ${formatDuration(elapsedSeconds)}`,
      `Current RPS: ${currentRps.toFixed(2)}`,
      `Avg Latency: ${currentLatency.toFixed(2)} ms`,
      `Success Rate: ${successRate.toFixed(2)} %`,
      `Failed Requests: ${metrics.totalFailed}`,
      `CPU Usage: ${((cpu.user + cpu.system) / 1000 / 1000).toFixed(1)}%`,
      `Memory Usage: ${getMemoryUsage().heapUsed}`
    ].join(' | ');
    process.stdout.write(`\r${line}`);
  };

  const dashboardTimer = setInterval(dashboard, 500);

  const timelineTimer = setInterval(() => {
    const elapsedSeconds = Math.max(0.01, (Date.now() - startTime) / 1000);
    const total = metrics.totalSuccessful + metrics.totalFailed;
    metrics.timeline.push({
      timestamp: new Date().toISOString(),
      elapsedSeconds: Number(elapsedSeconds.toFixed(2)),
      rps: Number((total / elapsedSeconds).toFixed(2)),
      avgLatencyMs: Number((metrics.latencies.length ? metrics.latencies.reduce((sum, item) => sum + item, 0) / metrics.latencies.length : 0).toFixed(2)),
      activeUsers: metrics.inFlight,
      errorRate: Number((total ? (metrics.totalFailed / total) * 100 : 0).toFixed(2))
    });
  }, 1000);

  const workers = [];
  for (let index = 0; index < config.concurrency; index += 1) {
    const offset = config.rampUp === 0 ? 0 : (index / Math.max(1, config.concurrency)) * config.rampUp * 1000;
    workers.push((async () => {
      await sleep(offset);
      while (Date.now() < stopAt) {
        const reqStart = performance.now();
        metrics.inFlight += 1;
        try {
          const response = await fetch(reportUrl, requestOptions);
          const requestEnd = performance.now();
          const latency = requestEnd - reqStart;
          const bodyText = await response.text();
          const bytesReceived = Buffer.byteLength(bodyText, 'utf8');
          const contentLength = Number(response.headers.get('content-length') || bytesReceived);
          const bytesSent = Buffer.byteLength(typeof requestOptions.body === 'string' ? requestOptions.body : '', 'utf8') + Buffer.byteLength(JSON.stringify(requestOptions.headers || {}), 'utf8');
          metrics.latencies.push(latency);
          metrics.bytesSent += bytesSent;
          metrics.bytesReceived += contentLength;
          metrics.totalRequests += 1;
          if (response.ok) {
            metrics.totalSuccessful += 1;
          } else {
            metrics.totalFailed += 1;
            metrics.statusCodes[response.status] = (metrics.statusCodes[response.status] || 0) + 1;
            metrics.errors.push({ statusCode: response.status, message: response.statusText });
          }
          if (!metrics.statusCodes[response.status]) {
            metrics.statusCodes[response.status] = 0;
          }
          metrics.statusCodes[response.status] += response.ok ? 0 : 0;
        } catch (error) {
          const requestEnd = performance.now();
          const latency = requestEnd - reqStart;
          metrics.latencies.push(latency);
          metrics.totalRequests += 1;
          metrics.totalFailed += 1;
          metrics.statusCodes.ERROR = (metrics.statusCodes.ERROR || 0) + 1;
          metrics.errors.push({ statusCode: 'ERROR', message: error.message });
        } finally {
          metrics.inFlight -= 1;
        }
        await sleep(requestIntervalMs);
      }
    })());
  }

  await Promise.allSettled(workers);
  clearInterval(dashboardTimer);
  clearInterval(timelineTimer);
  process.stdout.write('\n');

  const totalRequests = metrics.totalSuccessful + metrics.totalFailed;
  const durationSeconds = Math.max(0.01, (Date.now() - startTime) / 1000);
  const rps = totalRequests / durationSeconds;
  const avgLatency = metrics.latencies.length ? (metrics.latencies.reduce((sum, item) => sum + item, 0) / metrics.latencies.length) : 0;
  const minLatency = metrics.latencies.length ? Math.min(...metrics.latencies) : 0;
  const maxLatency = metrics.latencies.length ? Math.max(...metrics.latencies) : 0;
  const p90 = percentile(metrics.latencies, 0.90);
  const p95 = percentile(metrics.latencies, 0.95);
  const p99 = percentile(metrics.latencies, 0.99);
  const errorRate = totalRequests ? (metrics.totalFailed / totalRequests) * 100 : 0;
  const successRate = totalRequests ? (metrics.totalSuccessful / totalRequests) * 100 : 0;
  const throughput = rps;
  const performanceScore = Math.max(0, Math.min(100, 100 - (errorRate * 2) - Math.max(0, (p95 - 300) / 10)));

  const summary = {
    ...metrics,
    durationSeconds: Number(durationSeconds.toFixed(2)),
    totalRequests,
    successfulRequests: metrics.totalSuccessful,
    failedRequests: metrics.totalFailed,
    requestsPerSecond: Number(rps.toFixed(2)),
    averageResponseTimeMs: Number(avgLatency.toFixed(2)),
    minimumResponseTimeMs: Number(minLatency.toFixed(2)),
    maximumResponseTimeMs: Number(maxLatency.toFixed(2)),
    percentile90Ms: Number(p90.toFixed(2)),
    percentile95Ms: Number(p95.toFixed(2)),
    percentile99Ms: Number(p99.toFixed(2)),
    throughput: Number(throughput.toFixed(2)),
    errorRatePercent: Number(errorRate.toFixed(2)),
    successRatePercent: Number(successRate.toFixed(2)),
    performanceScore: Number(performanceScore.toFixed(2)),
    networkDataSentBytes: metrics.bytesSent,
    networkDataReceivedBytes: metrics.bytesReceived,
    networkDataSent: formatBytes(metrics.bytesSent),
    networkDataReceived: formatBytes(metrics.bytesReceived),
    status: errorRate === 0 && p95 < 1000 ? 'PASS' : errorRate < 5 && p95 < 2000 ? 'PASS' : 'FAIL',
    bottlenecks: [],
    recommendations: []
  };

  if (summary.percentile95Ms > 800) {
    summary.bottlenecks.push('95th percentile latency is elevated, suggesting capacity or database contention.');
  }
  if (summary.errorRatePercent > 1) {
    summary.bottlenecks.push('Error rate exceeded the acceptable threshold; inspect backend stability and downstream dependencies.');
  }
  if (summary.requestsPerSecond > 200) {
    summary.recommendations.push('Consider horizontal scaling and connection pooling for sustained high-throughput traffic.');
  }
  if (summary.percentile95Ms > 600) {
    summary.recommendations.push('Cache frequently requested data and optimize hotspot endpoints to reduce tail latency.');
  }
  if (summary.errorRatePercent > 0) {
    summary.recommendations.push('Review error logs and validate authentication, rate limiting, and database write latency.');
  }

  fs.mkdirSync(config.reportDir, { recursive: true });
  const htmlReportPath = path.join(config.reportDir, 'load-test-report.html');
  const csvReportPath = path.join(config.reportDir, 'load-test-report.csv');
  const jsonReportPath = path.join(config.reportDir, 'load-test-report.json');
  const pdfReportPath = path.join(config.reportDir, 'load-test-report.pdf');

  writeHtmlReport(summary, htmlReportPath);
  writeCsvReport(summary, csvReportPath);
  writeJsonReport(summary, jsonReportPath);
  writePdfReport(summary, pdfReportPath);

  printConsoleSummary(summary);
  return summary;
}

function printConsoleSummary(summary) {
  console.log('\nLoad Test Summary');
  console.log('-------------------------');
  console.log(`Concurrent Users : ${summary.concurrency}`);
  console.log(`Duration         : ${summary.durationSeconds.toFixed(0)} Seconds`);
  console.log(`Total Requests   : ${summary.totalRequests}`);
  console.log(`Successful       : ${summary.successfulRequests}`);
  console.log(`Failed           : ${summary.failedRequests}`);
  console.log(`Requests/sec     : ${summary.requestsPerSecond}`);
  console.log(`Avg Response     : ${summary.averageResponseTimeMs.toFixed(2)} ms`);
  console.log(`Min Response     : ${summary.minimumResponseTimeMs.toFixed(2)} ms`);
  console.log(`Max Response     : ${summary.maximumResponseTimeMs.toFixed(2)} ms`);
  console.log(`95th Percentile  : ${summary.percentile95Ms.toFixed(2)} ms`);
  console.log(`Error Rate       : ${summary.errorRatePercent.toFixed(2)}%`);
  console.log(`Overall Status   : ${summary.status}`);
  console.log(`Reports          : ${path.dirname(summary.reportDir || '')}`);
}

function buildLineChartSvg(series, width = 480, height = 220, color = '#059669') {
  const maxValue = Math.max(1, ...series.map((item) => Number(item) || 0));
  const minValue = Math.min(0, ...series.map((item) => Number(item) || 0));
  const range = Math.max(1, maxValue - minValue);
  const points = series.map((value, index) => {
    const x = (index / Math.max(1, series.length - 1)) * (width - 20) + 10;
    const normalized = (Number(value) - minValue) / range;
    const y = height - 20 - normalized * (height - 40);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const polyline = points.join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" rx="12"/>` +
    `<line x1="10" y1="${height - 20}" x2="${width - 10}" y2="${height - 20}" stroke="#cbd5e1"/>` +
    `<polyline fill="none" stroke="${color}" stroke-width="3" points="${polyline}" />` +
    `</svg>`;
}

function writeHtmlReport(summary, outputPath) {
  const responseSeries = summary.timeline.length ? summary.timeline.map((sample) => sample.avgLatencyMs) : [summary.averageResponseTimeMs];
  const rpsSeries = summary.timeline.length ? summary.timeline.map((sample) => sample.rps) : [summary.requestsPerSecond];
  const activeSeries = summary.timeline.length ? summary.timeline.map((sample) => sample.activeUsers) : [summary.concurrency];
  const errorSeries = summary.timeline.length ? summary.timeline.map((sample) => sample.errorRate) : [summary.errorRatePercent];

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>FoodShareAI Load Test Report</title>
    <style>
      body { font-family: Segoe UI, Arial, sans-serif; margin: 0; padding: 24px; background: #f8fafc; color: #0f172a; }
      .card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(15,23,42,0.08); margin-bottom: 20px; }
      h1, h2 { margin-top: 0; }
      .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
      .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
      .kpi .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
      .kpi .value { font-size: 24px; font-weight: 700; margin-top: 6px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: left; }
      th { background: #0f172a; color: #fff; }
      .pass { color: #15803d; font-weight: 700; }
      .fail { color: #dc2626; font-weight: 700; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>FoodShareAI Load Test Executive Summary</h1>
      <p>Target: <strong>${summary.url}</strong> | Method: <strong>${summary.method || 'GET'}</strong> | Status: <span class="${summary.status.toLowerCase()}">${summary.status}</span></p>
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Concurrent Users</div><div class="value">${summary.concurrency}</div></div>
        <div class="kpi"><div class="label">Total Requests</div><div class="value">${summary.totalRequests}</div></div>
        <div class="kpi"><div class="label">Successful</div><div class="value">${summary.successfulRequests}</div></div>
        <div class="kpi"><div class="label">Failed</div><div class="value">${summary.failedRequests}</div></div>
        <div class="kpi"><div class="label">Requests/sec</div><div class="value">${summary.requestsPerSecond}</div></div>
        <div class="kpi"><div class="label">Performance Score</div><div class="value">${summary.performanceScore}</div></div>
      </div>
    </div>

    <div class="card">
      <h2>Load Test Configuration</h2>
      <table>
        <tr><th>Setting</th><th>Value</th></tr>
        <tr><td>Concurrent Users</td><td>${summary.concurrency}</td></tr>
        <tr><td>Duration</td><td>${summary.durationSeconds} seconds</td></tr>
        <tr><td>Ramp-up</td><td>${summary.rampUpSeconds} seconds</td></tr>
        <tr><td>Target URL</td><td>${summary.url}</td></tr>
        <tr><td>Request Method</td><td>${summary.method || 'GET'}</td></tr>
        <tr><td>Authentication Token</td><td>${summary.token ? 'Configured' : 'Not supplied'}</td></tr>
      </table>
    </div>

    <div class="card">
      <h2>Metrics Summary</h2>
      <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Average Response Time</td><td>${summary.averageResponseTimeMs.toFixed(2)} ms</td></tr>
        <tr><td>Minimum Response Time</td><td>${summary.minimumResponseTimeMs.toFixed(2)} ms</td></tr>
        <tr><td>Maximum Response Time</td><td>${summary.maximumResponseTimeMs.toFixed(2)} ms</td></tr>
        <tr><td>90th Percentile</td><td>${summary.percentile90Ms.toFixed(2)} ms</td></tr>
        <tr><td>95th Percentile</td><td>${summary.percentile95Ms.toFixed(2)} ms</td></tr>
        <tr><td>99th Percentile</td><td>${summary.percentile99Ms.toFixed(2)} ms</td></tr>
        <tr><td>Throughput</td><td>${summary.throughput.toFixed(2)} req/s</td></tr>
        <tr><td>Error Rate</td><td>${summary.errorRatePercent.toFixed(2)}%</td></tr>
        <tr><td>Network Data Sent</td><td>${summary.networkDataSent}</td></tr>
        <tr><td>Network Data Received</td><td>${summary.networkDataReceived}</td></tr>
      </table>
    </div>

    <div class="card">
      <h2>Charts</h2>
      <div class="grid">
        <div><h3>Response Time</h3>${buildLineChartSvg(responseSeries, 480, 220, '#2563eb')}</div>
        <div><h3>Requests Per Second</h3>${buildLineChartSvg(rpsSeries, 480, 220, '#059669')}</div>
        <div><h3>Active Users</h3>${buildLineChartSvg(activeSeries, 480, 220, '#7c3aed')}</div>
        <div><h3>Error Rate</h3>${buildLineChartSvg(errorSeries, 480, 220, '#dc2626')}</div>
      </div>
    </div>

    <div class="card">
      <h2>Bottlenecks & Recommendations</h2>
      <ul>
        ${summary.bottlenecks.map((item) => `<li>${item}</li>`).join('')}
        ${summary.recommendations.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </div>
  </body>
</html>`;
  fs.writeFileSync(outputPath, html);
}

function writeCsvReport(summary, outputPath) {
  const lines = [];
  lines.push('metric,value');
  lines.push(`concurrency,${summary.concurrency}`);
  lines.push(`durationSeconds,${summary.durationSeconds}`);
  lines.push(`totalRequests,${summary.totalRequests}`);
  lines.push(`successfulRequests,${summary.successfulRequests}`);
  lines.push(`failedRequests,${summary.failedRequests}`);
  lines.push(`requestsPerSecond,${summary.requestsPerSecond}`);
  lines.push(`averageResponseTimeMs,${summary.averageResponseTimeMs}`);
  lines.push(`minimumResponseTimeMs,${summary.minimumResponseTimeMs}`);
  lines.push(`maximumResponseTimeMs,${summary.maximumResponseTimeMs}`);
  lines.push(`percentile95Ms,${summary.percentile95Ms}`);
  lines.push(`errorRatePercent,${summary.errorRatePercent}`);
  lines.push(`performanceScore,${summary.performanceScore}`);
  lines.push(`networkDataSentBytes,${summary.networkDataSentBytes}`);
  lines.push(`networkDataReceivedBytes,${summary.networkDataReceivedBytes}`);
  fs.writeFileSync(outputPath, lines.join('\n'));
}

function writeJsonReport(summary, outputPath) {
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
}

function writePdfReport(summary, outputPath) {
  const lines = [
    'FoodShareAI Load Test Report',
    '===========================',
    `Target URL: ${summary.url}`,
    `Method: ${summary.method || 'GET'}`,
    `Status: ${summary.status}`,
    `Concurrent Users: ${summary.concurrency}`,
    `Total Requests: ${summary.totalRequests}`,
    `Successful Requests: ${summary.successfulRequests}`,
    `Failed Requests: ${summary.failedRequests}`,
    `Average Response Time: ${summary.averageResponseTimeMs.toFixed(2)} ms`,
    `95th Percentile: ${summary.percentile95Ms.toFixed(2)} ms`,
    `Error Rate: ${summary.errorRatePercent.toFixed(2)}%`,
    `Performance Score: ${summary.performanceScore}`,
    'Bottlenecks:',
    ...(summary.bottlenecks.length ? summary.bottlenecks : ['None detected']),
    'Recommendations:',
    ...(summary.recommendations.length ? summary.recommendations : ['Continue monitoring and tune bottlenecks.'])
  ];

  const escapeText = (text) => String(text).replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\\/g, '\\\\');
  const streams = [];
  let y = 760;
  for (const line of lines) {
    const safeLine = escapeText(line);
    streams.push(`BT /F1 12 Tf 40 ${y} Td (${safeLine}) Tj ET`);
    y -= 14;
  }

  const content = `%PDF-1.4\n` +
    `1 0 obj<< /Type /Catalog /Pages 2 0 R>>endobj\n` +
    `2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1>>endobj\n` +
    `3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj\n` +
    `4 0 obj<< /Length 0 >>stream\n` +
    `${streams.join('\n')}\n` +
    `endstream\nendobj\n` +
    `5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n`;

  const offset = content.length;
  const pdf = `%PDF-1.4\n` + content;
  fs.writeFileSync(outputPath, pdf);
  if (typeof summary === 'object') {
    // no-op; the file is written above for compatibility with simple environments
  }
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  const summary = await runLoadTest({
    ...config,
    method: config.method.toUpperCase(),
    reportDir: config.reportDir,
    token: config.token,
    body: config.body,
    headers: config.headers
  });
  summary.reportDir = config.reportDir;
  writeJsonReport(summary, path.join(config.reportDir, 'load-test-report.json'));
}

main().catch((error) => {
  console.error('Load test failed:', error.message || error);
  process.exitCode = 1;
});
