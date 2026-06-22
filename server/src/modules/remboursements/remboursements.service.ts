import { EtatFeuille, Prisma, StatutRemboursement } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errors';
import { recordAudit } from '../../lib/audit';
import { decrypt } from '../../lib/crypto';
import { executeVirement } from '../../lib/bank';
import type { EffectuerRemboursementInput } from './remboursements.schemas';

const rembInclude = {
  feuille: true,
  assure: { include: { personne: true } },
  facture: true,
} satisfies Prisma.RemboursementInclude;

async function genRef(tx: Prisma.TransactionClient, table: 'remboursement' | 'facture', prefix: string) {
  const year = new Date().getFullYear();
  const count = table === 'remboursement' ? await tx.remboursement.count() : await tx.facture.count();
  return `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;
}

/** Effectue le remboursement d'une feuille validée (BF5/BF10/BF11). */
export async function effectuerRemboursement(input: EffectuerRemboursementInput, actorId: string) {
  const feuille = await prisma.feuilleMaladie.findUnique({
    where: { id: input.feuilleId },
    include: { assure: { include: { coordBancaire: true } }, remboursement: true },
  });
  if (!feuille) throw new AppError(404, 'Feuille introuvable.');
  if (feuille.etat !== EtatFeuille.VALIDEE) {
    throw new AppError(409, 'La feuille doit être validée avant remboursement.');
  }
  if (feuille.remboursement) throw new AppError(409, 'Remboursement déjà effectué pour cette feuille.');
  if (feuille.taux == null) throw new AppError(409, 'Le taux de remboursement n\'est pas défini.');

  const montantRembourse = Math.round((Number(feuille.montant) * feuille.taux) / 100);

  // Virement : appel banque AVANT toute écriture → en cas d'échec, rien n'est persisté (BNF3).
  let referenceBancaire: string | undefined;
  if (input.mode === 'VIREMENT') {
    const cb = feuille.assure.coordBancaire;
    if (!cb) throw new AppError(422, 'Coordonnées bancaires manquantes pour un virement.');
    const result = await executeVirement(
      { montant: montantRembourse, banque: cb.banque, compte: decrypt(cb.numeroCompte), titulaire: cb.titulaire },
      input.simulerEchec,
    );
    if (!result.success) {
      await recordAudit({ utilisateurId: actorId, action: 'REMBOURSEMENT_ECHEC', entite: 'FeuilleMaladie', entiteId: feuille.id, details: { erreur: result.error } });
      throw new AppError(502, result.error ?? 'Le virement a échoué.');
    }
    referenceBancaire = result.reference;
  }

  // Transaction atomique : remboursement + passage REMBOURSEE + facture (BNF3).
  const { remboursement } = await prisma.$transaction(async (tx) => {
    const refRemb = await genRef(tx, 'remboursement', 'RB');
    const remb = await tx.remboursement.create({
      data: {
        reference: refRemb,
        feuilleId: feuille.id,
        assureId: feuille.assureId,
        montant: montantRembourse,
        taux: feuille.taux!,
        mode: input.mode,
        statut: StatutRemboursement.EFFECTUE,
        referenceBancaire,
        date: new Date(),
      },
    });
    await tx.feuilleMaladie.update({ where: { id: feuille.id }, data: { etat: EtatFeuille.REMBOURSEE } });
    const refFact = await genRef(tx, 'facture', 'FACT');
    await tx.facture.create({
      data: {
        reference: refFact,
        remboursementId: remb.id,
        assureId: feuille.assureId,
        feuilleId: feuille.id,
        montant: montantRembourse,
      },
    });
    return { remboursement: remb };
  });

  await recordAudit({
    utilisateurId: actorId,
    action: 'REMBOURSEMENT_EFFECTUE',
    entite: 'Remboursement',
    entiteId: remboursement.id,
    details: { mode: input.mode, montant: montantRembourse, taux: feuille.taux },
  });
  return getRemboursement(remboursement.id);
}

export async function getRemboursement(id: string) {
  const remboursement = await prisma.remboursement.findUnique({ where: { id }, include: rembInclude });
  if (!remboursement) throw new AppError(404, 'Remboursement introuvable.');
  return remboursement;
}

export async function listRemboursements(params: { q?: string; skip: number; take: number }) {
  const { q, skip, take } = params;
  const where: Prisma.RemboursementWhereInput = q
    ? {
        OR: [
          { reference: { contains: q, mode: 'insensitive' } },
          { assure: { matricule: { contains: q, mode: 'insensitive' } } },
          { assure: { personne: { nom: { contains: q, mode: 'insensitive' } } } },
        ],
      }
    : {};
  const [total, items] = await prisma.$transaction([
    prisma.remboursement.count({ where }),
    prisma.remboursement.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: rembInclude }),
  ]);
  return { total, items };
}
