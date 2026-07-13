import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { isTemporaryPasswordRouteAllowed, requireRole } from './auth';

// requireRole est le garde RBAC : il décide, à partir de req.user.role, si l'accès
// à une route est autorisé. Fonction pure (pas de base) → testable en isolation.

function fakeReq(role?: Role): Request {
  return { user: role ? { id: 'x', login: 'u', role, jti: 'j', exp: 0 } : undefined } as Request;
}
const res = {} as Response;

describe('requireRole (contrôle d\'accès par rôle)', () => {
  // CAS NOMINAL — le bon rôle passe : next() est appelé, sans erreur.
  it('laisse passer un rôle autorisé', () => {
    const next = vi.fn();
    requireRole(Role.ADMIN)(fakeReq(Role.ADMIN), res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  // CAS D'ERREUR — un rôle non autorisé est refusé (403). C'est ce qui empêche
  // un assureur d'atteindre les routes /api/admin.
  it('refuse un rôle non autorisé (403)', () => {
    const next = vi.fn();
    expect(() => requireRole(Role.ADMIN)(fakeReq(Role.ASSUREUR), res, next)).toThrowError(/refusé/i);
    expect(next).not.toHaveBeenCalled();
  });

  // CAS D'ERREUR — sans utilisateur authentifié, accès refusé (401).
  it('refuse un accès sans authentification', () => {
    const next = vi.fn();
    expect(() => requireRole(Role.ADMIN)(fakeReq(undefined), res, next)).toThrow();
    expect(next).not.toHaveBeenCalled();
  });
});

describe('restriction du mot de passe temporaire', () => {
  it('autorise uniquement les routes nécessaires au remplacement et à la sortie', () => {
    expect(isTemporaryPasswordRouteAllowed('/api/auth/change-password')).toBe(true);
    expect(isTemporaryPasswordRouteAllowed('/api/auth/me')).toBe(true);
    expect(isTemporaryPasswordRouteAllowed('/api/auth/logout')).toBe(true);
  });

  it('refuse les routes métier tant que le mot de passe temporaire est actif', () => {
    expect(isTemporaryPasswordRouteAllowed('/api/admin/utilisateurs')).toBe(false);
    expect(isTemporaryPasswordRouteAllowed('/api/assures')).toBe(false);
  });
});
