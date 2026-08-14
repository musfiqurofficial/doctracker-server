import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorDetails: unknown = err;

  // Handle custom ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Zod Validation Error
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  }
  // Handle Mongoose CastError (Invalid ObjectId)
  else if (err?.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  // Handle Mongoose ValidationError
  else if (err?.name === 'ValidationError') {
    statusCode = 400;
    message = err.message || 'Mongoose Validation Error';
  }
  // Handle Duplicate Key Error (MongoDB Code 11000)
  else if (err?.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    message = `${field} already exists`;
  }
  // Standard Error instance
  else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error: errorDetails,
    ...(env.NODE_ENV === 'development' && { stack: err?.stack }),
  });
};
