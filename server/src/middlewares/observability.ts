import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{1,64}$/;

/** Associe chaque réponse à un identifiant et produit un journal JSON exploitable. */
export function requestContext(req: Request, res: Response, next: NextFunction) {
  const supplied = req.get('x-request-id');
  const requestId = supplied && SAFE_REQUEST_ID.test(supplied) ? supplied : randomUUID();
  const startedAt = process.hrtime.bigint();

  res.locals.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    if (env.NODE_ENV === 'test') return;
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    console.log(JSON.stringify({
      level: 'info',
      event: 'http_request',
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(1)),
    }));
  });

  next();
}
