import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { config } from '../config';
import { createError } from './errorHandler';

export function validatePath(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const candidates: string[] = [];

  const isString = (v: unknown): v is string => typeof v === 'string';

  const bodyPaths = [req.body?.path, req.body?.targetPath].filter(isString);
  const queryPaths = [req.query?.path].filter(isString);

  candidates.push(...bodyPaths, ...queryPaths);

  if (candidates.length === 0) {
    next();
    return;
  }

  for (const candidate of candidates) {
    if (typeof candidate !== 'string') {
      return next(createError('Path must be a string', 400));
    }

    const resolved = path.resolve(config.DOCS_ROOT, candidate);

    if (
      !resolved.startsWith(config.DOCS_ROOT + path.sep) &&
      resolved !== config.DOCS_ROOT
    ) {
      return next(createError('Forbidden: path is outside the vault', 403));
    }
  }

  next();
}

export function requirePathQuery(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.query['path'] || typeof req.query['path'] !== 'string') {
    return next(createError('Missing required query param: path', 400));
  }
  next();
}

export function requirePathBody(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.body?.path || typeof req.body.path !== 'string') {
    return next(createError('Missing required body field: path', 400));
  }
  next();
}
