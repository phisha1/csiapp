import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Role, StatutCompte } from '@prisma/client';

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn(),
  verifyPassword: vi.fn(),
  hashPassword: vi.fn(),
  recordAudit: vi.fn(),
  signToken: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    utilisateur: {
      findUnique: mocks.findUnique,
      update: mocks.update,
    },
  },
}));

vi.mock('../../lib/password', () => ({
  verifyPassword: mocks.verifyPassword,
  hashPassword: mocks.hashPassword,
}));

vi.mock('../../lib/audit', () => ({ recordAudit: mocks.recordAudit }));
vi.mock('../../lib/jwt', () => ({ signToken: mocks.signToken }));

import { changePassword, login } from './auth.service';

function user(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    login: 'agent',
    motDePasseHash: 'hash',
    role: Role.ASSUREUR,
    statut: StatutCompte.ACTIF,
    nbEchecs: 0,
    derniereConnexion: null,
    jetonsInvalidesAvant: null,
    versionSession: 0,
    doitChangerMotDePasse: true,
    motDePasseTemporaireExpireLe: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('cycle d’authentification temporaire', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyPassword.mockResolvedValue(true);
    mocks.hashPassword.mockResolvedValue('new-hash');
    mocks.signToken.mockReturnValue('token');
  });

  it('refuse la connexion lorsque le mot de passe temporaire est expiré', async () => {
    mocks.findUnique.mockResolvedValue(user({
      motDePasseTemporaireExpireLe: new Date(Date.now() - 60_000),
    }));

    await expect(login({ login: 'agent', motDePasse: 'Temp1234' })).rejects.toThrow(/expiré/i);
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.recordAudit).toHaveBeenCalledWith(expect.objectContaining({
      action: 'MOT_DE_PASSE_TEMPORAIRE_EXPIRE',
    }));
  });

  it('refuse de réutiliser le mot de passe temporaire', async () => {
    mocks.findUnique.mockResolvedValue(user());

    await expect(changePassword('user-1', {
      motDePasseActuel: 'Temp1234',
      nouveauMotDePasse: 'Temp1234',
    })).rejects.toThrow(/différent/i);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('désactive le mode temporaire et invalide les sessions après changement', async () => {
    mocks.findUnique.mockResolvedValue(user());
    mocks.update.mockResolvedValue(user({ doitChangerMotDePasse: false }));

    await expect(changePassword('user-1', {
      motDePasseActuel: 'Temp1234',
      nouveauMotDePasse: 'Nouveau5678',
    })).resolves.toEqual({ message: 'Mot de passe modifié. Veuillez vous reconnecter.' });

    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        motDePasseHash: 'new-hash',
        doitChangerMotDePasse: false,
        motDePasseTemporaireExpireLe: null,
        jetonsInvalidesAvant: expect.any(Date),
        versionSession: { increment: 1 },
      },
    });
  });
});
