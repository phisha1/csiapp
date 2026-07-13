import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TypeMedecin } from '@prisma/client';

const mocks = vi.hoisted(() => ({
  findMedecin: vi.fn(),
  findAssure: vi.fn(),
  transaction: vi.fn(),
  recordAudit: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    medecin: { findUnique: mocks.findMedecin },
    assure: { findFirst: mocks.findAssure },
    $transaction: mocks.transaction,
  },
}));
vi.mock('../../lib/audit', () => ({ recordAudit: mocks.recordAudit }));

import { createFeuille } from './feuilles.service';

describe('création d’un dossier médical', () => {
  beforeEach(() => vi.clearAllMocks());

  it('ne crée rien si le patient n’est pas confié au médecin', async () => {
    mocks.findMedecin.mockResolvedValue({ id: 'med-1', type: TypeMedecin.GENERALISTE });
    mocks.findAssure.mockResolvedValue(null);

    await expect(createFeuille({
      numAssure: 'ASS-2026-9999',
      dateConsult: new Date('2026-07-13T10:00:00.000Z'),
      montant: 10_000,
      motif: 'Consultation',
      diagnostic: 'Diagnostic',
      actes: 'Examen',
    }, 'user-med-1')).rejects.toThrow(/confié/i);

    expect(mocks.findAssure).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        AND: [
          { matricule: 'ASS-2026-9999' },
          { traitantId: 'med-1' },
        ],
      },
    }));
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.recordAudit).not.toHaveBeenCalled();
  });
});
