import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Role, StatutCompte } from '@prisma/client';

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  count: vi.fn(),
  update: vi.fn(),
  recordAudit: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    utilisateur: {
      findUnique: mocks.findUnique,
      count: mocks.count,
      update: mocks.update,
    },
  },
}));

vi.mock('../../lib/audit', () => ({ recordAudit: mocks.recordAudit }));

import { reinitialiserMotDePasse, suspendre } from './admin.service';

describe('garde-fous de gestion des comptes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("interdit à un administrateur de suspendre son propre compte", async () => {
    await expect(suspendre('admin-1', 'admin-1')).rejects.toThrow(/propre compte/i);
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it('interdit de suspendre le dernier administrateur actif', async () => {
    mocks.findUnique.mockResolvedValue({ id: 'admin-2', role: Role.ADMIN });
    mocks.count.mockResolvedValue(1);

    await expect(suspendre('admin-2', 'admin-1')).rejects.toThrow(/dernier administrateur actif/i);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('autorise la suspension contrôlée d’un autre compte', async () => {
    const updated = { id: 'assureur-1', role: Role.ASSUREUR, statut: StatutCompte.SUSPENDU };
    mocks.findUnique.mockResolvedValue({ id: 'assureur-1', role: Role.ASSUREUR });
    mocks.update.mockResolvedValue(updated);

    await expect(suspendre('assureur-1', 'admin-1')).resolves.toEqual(updated);
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'assureur-1' },
      data: { statut: StatutCompte.SUSPENDU },
    }));
    expect(mocks.recordAudit).toHaveBeenCalledOnce();
  });

  it("interdit la réinitialisation de son propre mot de passe depuis la console", async () => {
    await expect(reinitialiserMotDePasse('admin-1', 'admin-1')).rejects.toThrow(/paramètres/i);
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });
});
