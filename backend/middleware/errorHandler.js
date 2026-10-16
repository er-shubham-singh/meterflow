export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('[Error Handler]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
}
