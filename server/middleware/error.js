export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(error, req, res, next) {
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(status).json({
    message: error.message || 'Server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
  });
}