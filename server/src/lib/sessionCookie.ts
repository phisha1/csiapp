import type { CookieOptions, Request, Response } from 'express';
import { env } from '../config/env';

export const SESSION_COOKIE_NAME = 'csi_session';

export function sessionCookieOptions(): CookieOptions {
  const production = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: production,
    // `none` impose `Secure` ; hors production (HTTP local) on retombe sur `lax`.
    sameSite: production ? env.SESSION_COOKIE_SAMESITE : 'lax',
    path: '/api',
    maxAge: env.SESSION_COOKIE_MAX_AGE_SECONDS * 1000,
  };
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());
}

export function clearSessionCookie(res: Response) {
  const { maxAge: _maxAge, ...options } = sessionCookieOptions();
  res.clearCookie(SESSION_COOKIE_NAME, options);
}

function readCookie(header: string | undefined, name: string) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

/** Cookie HttpOnly pour le navigateur, Bearer conservé pour les clients API explicites. */
export function readSessionToken(req: Request) {
  const authorization = req.headers.authorization;
  if (authorization?.startsWith('Bearer ')) return authorization.slice(7);
  return readCookie(req.headers.cookie, SESSION_COOKIE_NAME);
}
