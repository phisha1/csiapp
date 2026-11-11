import { EtatFeuille, Prisma, StatutRemboursement } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middlewares/errors';
import { recordAudit } from '../../lib/audit';
import { decrypt } from '../../lib/crypto';
import { decryptFeuille } from '../../lib/phi';
import { executeVirement } from '../../lib/bank';
import type { EffectuerRemboursementInput } from './remboursements.schemas';

const rembInclude = {
  feuille: true,
  assure: { include: { personne: true } },
  facture: true,
} satisfies Prisma.RemboursementInclude;

/** Référence tirée d'une séquence PostgreSQL : jamais deux fois le même numéro. */
async function nextRef(tx: Prisma.TransactionClient, table: 'remboursement' | 'facture', prefix: string) {
  const rows = table === 'remboursement'
    ? await tx.$queryRaw<{ n: bigint }[]>`SELECT nextval('remboursement_reference_seq') AS n`
    : await tx.$queryRaw<{ n: bigint }[]>`SELECT nextval('facture_reference_seq') AS n`;
  return `${prefix}-${new Date().getFullYear()}-${String(rows[0].n).padStart(4, '0')}`;
}

const isUniqueViolation = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';

/**
 * Effectue le remboursement d'une feuille validée (BF5/BF10/BF11) en trois temps :
 *   1. réservation en base (statut EN_COURS) — l'unicité sur la feuille garantit
 *      qu'un double clic ou deux agents ne lancent pas deux paiements ;
 *   2. ordre de virement, identifié par la référence du remboursement ;
 *   3. confirmation atomique (EFFECTUE + feuille REMBOURSEE + facture + audit).
 * L'argent ne part donc jamais sans trace préalable en base.
 */
export async function effectuerRemboursement(input: EffectuerRemboursementInput, actorId: string) {
  const feuille = await prisma.feuilleMaladie.findUnique({
    where: { id: input.feuilleId },
    include: { assure: { include: { coordBancaire: true } }, remboursement: true },
  });
  if (!feuille) throw new AppError(404, 'Feuille introuvable.');
  if (feuille.etat !== EtatFeuille.VALIDEE) {
    throw new AppError(409, 'La feuille doit être validée avant remboursement.');
  }
  if (feuille.remboursement) {
    throw new AppError(
      409,
      feuille.remboursement.statut === StatutRemboursement.EN_COURS
        ? `Un remboursement (${feuille.remboursement.reference}) est déjà en cours pour cette feuille : rapprochement bancaire requis avant toute relance.`
        : 'Remboursement déjà effectué pour cette feuille.',
    );
  }
  if (feuille.taux == null) throw new AppError(409, 'Le taux de remboursement n\'est pas défini.');
  if (env.SEPARATION_VALIDATION_PAIEMENT && feuille.valideParId === actorId) {
    throw new AppError(403, 'Vous avez validé cette feuille : le paiement doit être effectué par un autre agent.');
  }

  const cb = feuille.assure.coordBancaire;
  if (input.mode === 'VIREMENT') {
    if (!cb) throw new AppError(422, 'Coordonnées bancaires manquantes pour un virement.');
    if (env.NODE_ENV === 'production' && !env.ALLOW_MOCK_BANK) {
      throw new AppError(503, 'Virement indisponible : aucun système bancaire n’est connecté. Utilisez le paiement en espèces.');
    }
  }

  const montantRembourse = Math.round((Number(feuille.montant) * feuille.taux) / 100);
  const taux = feuille.taux;

  // 1. Réservation : rien n'est encore payé, mais la feuille est prise.
  let reservation: { id: string; reference: string };
  try {
    reservation = await prisma.$transaction(async (tx) => {
      const { count } = await tx.feuilleMaladie.updateMany({
        where: { id: feuille.id, etat: EtatFeuille.VALIDEE },
        data: { updatedAt: new Date() },
      });
      if (count !== 1) throw new AppError(409, 'La feuille n’est plus à l’état validé.');
      return tx.remboursement.create({
        data: {
          reference: await nextRef(tx, 'remboursement', 'RB'),
          feuilleId: feuille.id,
          assureId: feuille.assureId,
          montant: montantRembourse,
          taux,
          mode: input.mode,
          statut: StatutRemboursement.EN_COURS,
        },
        select: { id: true, reference: true },
      });
    });
  } catch (e) {
    if (isUniqueViolation(e)) throw new AppError(409, 'Un remboursement est déjà en cours ou effectué pour cette feuille.');
    throw e;
  }

  const annulerReservation = () => prisma.remboursement.delete({ where: { id: reservation.id } });

  // 2. Ordre de virement.
  let referenceBancaire: string | undefined;
  if (input.mode === 'VIREMENT' && cb) {
    // Le scénario d'échec simulé (BNF3) n'existe que hors production.
    const simulerEchec = env.NODE_ENV !== 'production' && input.simulerEchec;
    let result: Awaited<ReturnType<typeof executeVirement>>;
    try {
      result = await executeVirement(
        {
          montant: montantRembourse,
          banque: cb.banque,
          compte: decrypt(cb.numeroCompte),
          titulaire: cb.titulaire,
          idempotencyKey: reservation.reference,
        },
        simulerEchec,
      );
    } catch {
      // Issue inconnue (coupure, délai dépassé) : l'argent est peut-être parti.
      // On garde la réservation EN_COURS pour empêcher toute relance aveugle.
      await recordAudit({ utilisateurId: actorId, action: 'REMBOURSEMENT_A_RAPPROCHER', entite: 'Remboursement', entiteId: reservation.id, details: { raison: 'issue du virement inconnue' } });
      throw new AppError(502, `Issue du virement inconnue (${reservation.reference}). Ne relancez pas : rapprochement bancaire requis.`);
    }
    if (!result.success) {
      // Refus net de la banque : rien n'est parti, la feuille redevient payable.
      await annulerReservation();
      await recordAudit({ utilisateurId: actorId, action: 'REMBOURSEMENT_ECHEC', entite: 'FeuilleMaladie', entiteId: feuille.id, details: { erreur: result.error } });
      throw new AppError(502, result.error ?? 'Le virement a échoué.');
    }
    referenceBancaire = result.reference;
  }

  // 3. Confirmation atomique, audit compris (pas de paiement sans trace).
  try {
    await prisma.$transaction(async (tx) => {
      await tx.remboursement.update({
        where: { id: reservation.id },
        data: { statut: StatutRemboursement.EFFECTUE, referenceBancaire, date: new Date() },
      });
      const { count } = await tx.feuilleMaladie.updateMany({
        where: { id: feuille.id, etat: EtatFeuille.VALIDEE },
        data: { etat: EtatFeuille.REMBOURSEE },
      });
      if (count !== 1) throw new AppError(409, 'La feuille n’est plus à l’état validé.');
      await tx.facture.create({
        data: {
          reference: await nextRef(tx, 'facture', 'FACT'),
          remboursementId: reservation.id,
          assureId: feuille.assureId,
          feuilleId: feuille.id,
          montant: montantRembourse,
        },
      });
      await tx.journalAudit.create({
        data: {
          utilisateurId: actorId,
          action: 'REMBOURSEMENT_EFFECTUE',
          entite: 'Remboursement',
          entiteId: reservation.id,
          details: { mode: input.mode, montant: montantRembourse, taux },
        },
      });
    });
  } catch (e) {
    if (!referenceBancaire) {
      // Espèces : rien n'a été remis, on libère la feuille.
      await annulerReservation().catch(() => undefined);
      throw e;
    }
    // Virement émis mais confirmation impossible : on sauve la référence bancaire.
    await prisma.remboursement
      .update({ where: { id: reservation.id }, data: { referenceBancaire } })
      .catch(() => undefined);
    await recordAudit({ utilisateurId: actorId, action: 'REMBOURSEMENT_A_RAPPROCHER', entite: 'Remboursement', entiteId: reservation.id, details: { referenceBancaire } });
    throw new AppError(500, `Virement émis (${referenceBancaire}) mais enregistrement incomplet. Ne relancez pas : rapprochement requis.`);
  }

  return getRemboursement(reservation.id);
}

export async function getRemboursement(id: string) {
  const remboursement = await prisma.remboursement.findUnique({ where: { id }, include: rembInclude });
  if (!remboursement) throw new AppError(404, 'Remboursement introuvable.');
  decryptFeuille(remboursement.feuille);
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
  items.forEach((r) => decryptFeuille(r.feuille));
  return { total, items };
}
