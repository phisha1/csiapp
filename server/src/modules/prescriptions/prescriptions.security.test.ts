import { beforeEach, describe, expect, it, vi } from 'vitest';
import { decryptPHI } from '../../lib/phi';

const mocks = vi.hoisted(() => ({
  medecinFindUnique: vi.fn(),
  feuilleFindUnique: vi.fn(),
  medicamentCount: vi.fn(),
  prescriptionCreate: vi.fn(),
  ordonnanceCreateMany: vi.fn(),
  prescriptionFindUniqueOrThrow: vi.fn(),
  recordAudit: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    medecin: { findUnique: mocks.medecinFindUnique },
    feuilleMaladie: { findUnique: mocks.feuilleFindUnique },
    medicamentCatalogue: { count: mocks.medicamentCount },
    $transaction: vi.fn(async (callback) => callback({
      prescription: {
        create: mocks.prescriptionCreate,
        findUniqueOrThrow: mocks.prescriptionFindUniqueOrThrow,
      },
      ordonnanceLigne: { createMany: mocks.ordonnanceCreateMany },
    })),
  },
}));
vi.mock('../../lib/audit', () => ({ recordAudit: mocks.recordAudit }));

import { prescrireMedicaments } from './prescriptions.service';

describe('protection des consignes d’ordonnance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.medecinFindUnique.mockResolvedValue({ id: 'med-1' });
    mocks.feuilleFindUnique.mockResolvedValue({ id: 'feuille-1', assureId: 'assure-1', medecinId: 'med-1' });
    mocks.medicamentCount.mockResolvedValue(1);
    mocks.prescriptionCreate.mockResolvedValue({ id: 'prescription-1' });
  });

  it('écrit les consignes chiffrées en base puis les renvoie lisibles', async () => {
    let persistedData: Array<Record<string, string | null | undefined>> = [];
    mocks.ordonnanceCreateMany.mockImplementation(async ({ data }) => {
      persistedData = structuredClone(data);
      mocks.prescriptionFindUniqueOrThrow.mockResolvedValue({
        id: 'prescription-1',
        lignes: structuredClone(data),
      });
      return { count: data.length };
    });

    const result = await prescrireMedicaments({
      feuilleId: 'feuille-1',
      lignes: [{
        medicamentId: 'medicament-1',
        posologie: '1 comprimé par jour',
        duree: '7 jours',
        instructions: 'Après le repas',
      }],
    }, 'user-1');

    const stored = persistedData[0];
    expect(stored.posologie).not.toBe('1 comprimé par jour');
    expect(decryptPHI(stored.posologie)).toBe('1 comprimé par jour');
    expect(result.lignes[0].posologie).toBe('1 comprimé par jour');
    expect(result.lignes[0].instructions).toBe('Après le repas');
  });
});
