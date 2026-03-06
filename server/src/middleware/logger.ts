import type { Request, Response, NextFunction } from 'express';

const colors = {
  GET: '\x1b[32m',
  POST: '\x1b[34m',
  PUT: '\x1b[33m',
  PATCH: '\x1b[35m',
  DELETE: '\x1b[31m',
  reset: '\x1b[0m',
  dim: '\x1b[2m',
} as const;

export function logger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const method = req.method as keyof typeof colors;
  const color = colors[method] ?? colors.reset;

  res.on('finish', () => {
    const ms = Date.now() - start;
    const status = res.statusCode;
    const statusColor =
      status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';

    console.log(
      `${color}${method}${colors.reset} ` +
        `${colors.dim}${req.originalUrl}${colors.reset} ` +
        `${statusColor}${status}${colors.reset} ` +
        `${colors.dim}${ms}ms${colors.reset}`
    );
  });

  next();
}
