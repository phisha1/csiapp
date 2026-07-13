import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { Role } from '@prisma/client';

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  changePassword: vi.fn(),
  revokeToken: vi.fn(),
  recordAudit: vi.fn(),
  verifyToken: vi.fn(),
}));

vi.mock('./auth.service', () => ({
  login: mocks.login,
  changePassword: mocks.changePassword,
}));
vi.mock('../../lib/tokenDenylist', () => ({ revokeToken: mocks.revokeToken }));
vi.mock('../../lib/audit', () => ({ recordAudit: mocks.recordAudit }));
vi.mock('../../lib/jwt', () => ({ verifyToken: mocks.verifyToken }));

import { loginHandler, logoutHandler } from './auth.controller';

function response() {
  const res = {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
    json: vi.fn(),
  };
  return res as unknown as Response;
}

describe('contrôleur de session navigateur', () => {
  beforeEach(() => vi.clearAllMocks());

  it('place le JWT dans un cookie HttpOnly sans l’exposer dans le JSON', async () => {
    mocks.login.mockResolvedValue({
      token: 'signed-token',
      utilisateur: { id: 'u-1', login: 'agent', role: Role.ASSUREUR },
    });
    const req = { body: { login: 'agent', motDePasse: 'Secret123' } } as Request;
    const res = response();

    await loginHandler(req, res);

    expect(res.cookie).toHaveBeenCalledWith(
      'csi_session',
      'signed-token',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(res.json).toHaveBeenCalledWith({
      utilisateur: { id: 'u-1', login: 'agent', role: Role.ASSUREUR },
    });
  });

  it('révoque le jeton puis efface le cookie à la déconnexion', async () => {
    mocks.verifyToken.mockReturnValue({ id: 'u-1', jti: 'jti-1', exp: 2_000_000_000 });
    mocks.revokeToken.mockResolvedValue(undefined);
    const req = { headers: { cookie: 'csi_session=signed-token' } } as Request;
    const res = response();

    await logoutHandler(req, res);

    expect(mocks.revokeToken).toHaveBeenCalledWith('jti-1', 2_000_000_000);
    expect(res.clearCookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Déconnexion réussie.' });
  });

  it('ne masque pas une erreur empêchant la révocation serveur', async () => {
    mocks.verifyToken.mockReturnValue({ id: 'u-1', jti: 'jti-1', exp: 2_000_000_000 });
    mocks.revokeToken.mockRejectedValue(new Error('database unavailable'));
    const req = { headers: { cookie: 'csi_session=signed-token' } } as Request;
    const res = response();

    await expect(logoutHandler(req, res)).rejects.toThrow(/database unavailable/i);
    expect(res.clearCookie).toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
