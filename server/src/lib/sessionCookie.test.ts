import { describe, expect, it } from 'vitest';
import type { Request } from 'express';
import { readSessionToken, sessionCookieOptions } from './sessionCookie';

describe('cookie de session', () => {
  it('lit le jeton depuis le cookie HttpOnly reçu', () => {
    const req = { headers: { cookie: 'theme=dark; csi_session=jwt%2Evalue%2Esigned' } } as Request;
    expect(readSessionToken(req)).toBe('jwt.value.signed');
  });

  it('privilégie le Bearer explicite pour les clients API', () => {
    const req = {
      headers: {
        authorization: 'Bearer api-token',
        cookie: 'csi_session=browser-token',
      },
    } as Request;
    expect(readSessionToken(req)).toBe('api-token');
  });

  it('rend toujours le cookie inaccessible au JavaScript', () => {
    expect(sessionCookieOptions().httpOnly).toBe(true);
  });

  it('n’émet jamais SameSite=None hors production (cookie tiers bloqué par Safari)', () => {
    expect(sessionCookieOptions().sameSite).toBe('lax');
  });
});
