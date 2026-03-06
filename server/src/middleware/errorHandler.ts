import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: string;
}

export const errorHandler: ErrorRequestHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err.statusCode ?? 500;

  console.error(`[ERROR] ${err.message}`, err.stack);

  res.status(statusCode).json({
    ok: false,
    error: err.message ?? 'Internal server error',
    details: err.details,
  });
};

export function createError(message: string, statusCode = 500, details?: string): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  err.details = details;
  return err;
}
