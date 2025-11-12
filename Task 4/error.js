// middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  // CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  // Duplicate key
  if (err.code && err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate key error', detail: err.keyValue });
  }

  // Default
  const status = err.status || 500;
  const payload = { message: err.message || 'Internal Server Error' };
  if (process.env.NODE_ENV === 'development') payload.stack = err.stack;
  res.status(status).json(payload);
}
