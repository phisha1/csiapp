import { describe, expect, it } from 'vitest';
import { isTemporaryPasswordExpired, temporaryPasswordExpiresAt } from './temporaryPassword';

describe('cycle du mot de passe temporaire', () => {
  it('calcule la date limite à partir de la durée configurée', () => {
    const start = new Date('2026-07-13T10:00:00.000Z');
    expect(temporaryPasswordExpiresAt(start, 24).toISOString()).toBe('2026-07-14T10:00:00.000Z');
  });

  it('considère le secret expiré dès la date limite', () => {
    const limit = new Date('2026-07-14T10:00:00.000Z');
    expect(isTemporaryPasswordExpired(limit, new Date('2026-07-14T10:00:00.000Z'))).toBe(true);
    expect(isTemporaryPasswordExpired(limit, new Date('2026-07-14T09:59:59.000Z'))).toBe(false);
  });
});
