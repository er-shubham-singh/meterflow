export function requestLogger(req, res, next) {
  // Skip logging high-frequency SSE/telemetry endpoints to keep console readable
  if (req.url.includes('/stream') || req.url.includes('/telemetry')) {
    return next();
  }

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
}
