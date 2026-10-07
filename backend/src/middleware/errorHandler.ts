import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError, notFound } from '../utils/AppError';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(notFound(`Route ${req.method} ${req.originalUrl} was not found`));
};

// Express recognises an error handler by its four parameters, so `_next` must stay
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      ...(error.errors ? { errors: error.errors } : {}),
    });
    return;
  }

  // Raised by express.json() for a malformed request body
  if ((error as { type?: string }).type === 'entity.parse.failed') {
    res.status(400).json({ message: 'Request body is not valid JSON' });
    return;
  }

  // Unexpected failures are logged in full but never described to the client
  console.error(error);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
};
