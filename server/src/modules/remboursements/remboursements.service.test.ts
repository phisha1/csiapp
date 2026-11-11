import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EtatFeuille, StatutRemboursement } from '@prisma/client';

const mocks = vi.hoisted(() => {
  const tx = {
    $queryRaw: vi.fn(),
    feuilleMaladie: { updateMany: vi.fn() },
    remboursement: { create: vi.fn(), update: vi.fn() },
    facture: { create: vi.fn() },
    journalAudit: { create: vi.fn() },
  };
  return {
    tx,
    feuilleFindUnique: vi.fn(),
    rembFindUnique: vi.fn(),
    rembDelete: vi.fn(),
    rembUpdate: vi.fn(),
    executeVirement: vi.fn(),
    recordAudit: vi.fn(),
    ordre: [] as string[],
  };
});

vi.mock('../../config/prisma', () => ({
  prisma: {
    feuilleMaladie: { findUnique: mocks.feuilleFindUnique },
    remboursement: { findUnique: mocks.rembFindUnique, delete: mocks.rembDelete, update: mocks.rembUpdate },
    $transaction: (fn: (tx: unknown) => unknown) => fn(mocks.tx),
  },
}));
vi.mock('../../lib/bank', () => ({ executeVirement: mocks.executeVirement }));
vi.mock('../../lib/audit', () => ({ recordAudit: mocks.recordAudit }));
vi.mock('../../lib/crypto', () => ({ decrypt: () => '00112233445566' }));
vi.mock('../../lib/phi', () => ({ decryptFeuille: (f: unknown) => f }));

import { effectuerRemboursement } from './remboursements.service';

function feuille(overrides: Record<string, unknown> = {}) {
  return {
    id: 'feuille-1',
    assureId: 'assure-1',
    etat: EtatFeuille.VALIDEE,
    montant: 20_000,
    taux: 80,
    valideParId: 'agent-validateur',
    remboursement: null,
    assure: { coordBancaire: { banque: 'Banque', numeroCompte: 'chiffre', titulaire: 'Titulaire' } },
    ...overrides,
  };
}

describe('remboursement : la trace précède toujours le paiement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.ordre.length = 0;
    mocks.feuilleFindUnique.mockResolvedValue(feuille());
    mocks.tx.$queryRaw.mockResolvedValue([{ n: 7n }]);
    mocks.tx.feuilleMaladie.updateMany.mockResolvedValue({ count: 1 });
    mocks.tx.remboursement.create.mockImplementation(async ({ data }) => {
      mocks.ordre.push('reservation');
      return { id: 'remb-1', reference: data.reference };
    });
    mocks.tx.remboursement.update.mockImplementation(async () => { mocks.ordre.push('confirmation'); });
    mocks.executeVirement.mockImplementation(async () => {
      mocks.ordre.push('banque');
      return { success: true, reference: 'VIR-ABC' };
    });
    mocks.rembFindUnique.mockResolvedValue({ id: 'remb-1', feuille: {} });
    mocks.rembDelete.mockResolvedValue({});
    mocks.rembUpdate.mockResolvedValue({});
  });

  it('réserve en base avant d’appeler la banque, puis confirme', async () => {
    await effectuerRemboursement({ feuilleId: 'feuille-1', mode: 'VIREMENT', simulerEchec: false }, 'agent-payeur');

    expect(mocks.ordre).toEqual(['reservation', 'banque', 'confirmation']);
    expect(mocks.tx.remboursement.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ statut: StatutRemboursement.EN_COURS, montant: 16_000 }),
    }));
    expect(mocks.executeVirement).toHaveBeenCalledWith(
      expect.objectContaining({ idempotencyKey: expect.stringMatching(/^RB-\d{4}-0007$/) }),
      false,
    );
    expect(mocks.tx.journalAudit.create).toHaveBeenCalledOnce();
  });

  it('interdit au validateur de payer lui-même la feuille', async () => {
    await expect(
      effectuerRemboursement({ feuilleId: 'feuille-1', mode: 'ESPECES', simulerEchec: false }, 'agent-validateur'),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.tx.remboursement.create).not.toHaveBeenCalled();
  });

  it('refuse une relance tant qu’un remboursement est en cours', async () => {
    mocks.feuilleFindUnique.mockResolvedValue(feuille({
      remboursement: { statut: StatutRemboursement.EN_COURS, reference: 'RB-2026-0001' },
    }));
    await expect(
      effectuerRemboursement({ feuilleId: 'feuille-1', mode: 'VIREMENT', simulerEchec: false }, 'agent-payeur'),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(mocks.executeVirement).not.toHaveBeenCalled();
  });

  it('libère la feuille si la banque refuse nettement le virement', async () => {
    mocks.executeVirement.mockResolvedValue({ success: false, error: 'Refusé' });
    await expect(
      effectuerRemboursement({ feuilleId: 'feuille-1', mode: 'VIREMENT', simulerEchec: false }, 'agent-payeur'),
    ).rejects.toMatchObject({ statusCode: 502 });
    expect(mocks.rembDelete).toHaveBeenCalledWith({ where: { id: 'remb-1' } });
    expect(mocks.tx.facture.create).not.toHaveBeenCalled();
  });

  it('garde la réservation si l’issue du virement est inconnue', async () => {
    mocks.executeVirement.mockRejectedValue(new Error('timeout'));
    await expect(
      effectuerRemboursement({ feuilleId: 'feuille-1', mode: 'VIREMENT', simulerEchec: false }, 'agent-payeur'),
    ).rejects.toMatchObject({ statusCode: 502 });
    expect(mocks.rembDelete).not.toHaveBeenCalled();
    expect(mocks.recordAudit).toHaveBeenCalledWith(expect.objectContaining({ action: 'REMBOURSEMENT_A_RAPPROCHER' }));
  });

  it('conserve la référence bancaire si la confirmation échoue après un virement émis', async () => {
    mocks.tx.facture.create.mockRejectedValue(new Error('base indisponible'));
    await expect(
      effectuerRemboursement({ feuilleId: 'feuille-1', mode: 'VIREMENT', simulerEchec: false }, 'agent-payeur'),
    ).rejects.toMatchObject({ statusCode: 500 });
    expect(mocks.rembDelete).not.toHaveBeenCalled();
    expect(mocks.rembUpdate).toHaveBeenCalledWith({ where: { id: 'remb-1' }, data: { referenceBancaire: 'VIR-ABC' } });
  });
});
