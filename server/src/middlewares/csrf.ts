import type { NextFunction, Request, Response } from 'express';
import { AppError } from './errors';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function isAllowedOrigin(origin: string | undefined, allowedOrigins: string[]) {
  return origin !== undefined && allowedOrigins.includes(origin);
}

/**
 * Les mutations authentifiées par cookie exigent une origine frontend autorisée.
 * Un client serveur utilisant explicitement Authorization: Bearer reste accepté.
 */
export function createCsrfProtection(allowedOrigins: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (SAFE_METHODS.has(req.method)) return next();
    const origin = req.headers.origin;
    if (isAllowedOrigin(origin, allowedOrigins)) return next();
    if (!origin && req.headers.authorization?.startsWith('Bearer ')) return next();
    throw new AppError(403, 'Origine de la requête non autorisée.');
  };
}
