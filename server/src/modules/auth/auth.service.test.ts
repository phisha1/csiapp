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

  describe('verrou temporaire et anti-énumération', () => {
    const tentative = () => login({ login: 'agent', motDePasse: 'Mauvais123' }).catch((e) => e);

    it('répond exactement pareil pour un compte inconnu et un mauvais mot de passe', async () => {
      mocks.findUnique.mockResolvedValue(null);
      const inconnu = await tentative();

      mocks.findUnique.mockResolvedValue(user({ doitChangerMotDePasse: false }));
      mocks.verifyPassword.mockResolvedValue(false);
      mocks.update.mockResolvedValue({ nbEchecs: 1 });
      const mauvais = await tentative();

      expect(inconnu.statusCode).toBe(401);
      expect(mauvais.statusCode).toBe(401);
      expect(mauvais.message).toBe(inconnu.message);
      // Un mot de passe est vérifié même pour un compte inconnu (temps de réponse).
      expect(mocks.verifyPassword).toHaveBeenCalledTimes(2);
    });

    it('pose un verrou temporaire au seuil, sans bloquer le compte définitivement', async () => {
      mocks.findUnique.mockResolvedValue(user({ doitChangerMotDePasse: false, nbEchecs: 4 }));
      mocks.verifyPassword.mockResolvedValue(false);
      mocks.update.mockResolvedValue({ nbEchecs: 5 });

      const erreur = await tentative();

      expect(erreur.statusCode).toBe(401);
      expect(mocks.update).toHaveBeenNthCalledWith(1, expect.objectContaining({
        data: { nbEchecs: { increment: 1 } },
      }));
      const verrou = mocks.update.mock.calls[1][0].data;
      expect(verrou.nbEchecs).toBe(0);
      expect(verrou.verrouilleJusquA.getTime()).toBeGreaterThan(Date.now());
      expect(verrou.statut).toBeUndefined();
      expect(mocks.recordAudit).toHaveBeenCalledWith(expect.objectContaining({ action: 'COMPTE_VERROUILLE' }));
    });

    it('refuse même le bon mot de passe pendant le verrou, avec la réponse générique', async () => {
      mocks.findUnique.mockResolvedValue(user({
        doitChangerMotDePasse: false,
        verrouilleJusquA: new Date(Date.now() + 60_000),
      }));
      mocks.verifyPassword.mockResolvedValue(true);

      const erreur = await login({ login: 'agent', motDePasse: 'BonMotDePasse1' }).catch((e) => e);

      expect(erreur.statusCode).toBe(401);
      expect(mocks.signToken).not.toHaveBeenCalled();
      expect(mocks.update).not.toHaveBeenCalled();
    });

    it('rouvre le compte de lui-même une fois le verrou échu', async () => {
      const compte = user({ doitChangerMotDePasse: false, verrouilleJusquA: new Date(Date.now() - 1_000) });
      mocks.findUnique.mockResolvedValue(compte);
      mocks.update.mockResolvedValue(compte);

      await expect(login({ login: 'agent', motDePasse: 'BonMotDePasse1' })).resolves.toMatchObject({ token: 'token' });
      expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ nbEchecs: 0, verrouilleJusquA: null }),
      }));
    });

    it('ne révèle une suspension qu’à celui qui connaît le mot de passe', async () => {
      mocks.findUnique.mockResolvedValue(user({ statut: StatutCompte.SUSPENDU }));
      mocks.verifyPassword.mockResolvedValue(false);
      mocks.update.mockResolvedValue({ nbEchecs: 1 });
      expect((await tentative()).statusCode).toBe(401);

      mocks.verifyPassword.mockResolvedValue(true);
      expect((await tentative()).statusCode).toBe(423);
    });
  });
});
