import { EtatFeuille, Prisma, Role, TypeMedecin } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errors';
import { recordAudit } from '../../lib/audit';
import type { AuthUser } from '../../lib/jwt';
import type { CompleterInput, CreateFeuilleInput } from './feuilles.schemas';

const feuilleInclude = {
  assure: { include: { personne: true } },
  medecin: { include: { personne: true, specialite: true } },
  consultation: true,
} satisfies Prisma.FeuilleMaladieInclude;

// Transitions autorisées du cycle de vie (rapport §1.2.4).
const TRANSITIONS: Record<EtatFeuille, EtatFeuille[]> = {
  BROUILLON: [EtatFeuille.TRANSMISE, EtatFeuille.SUPPRIMEE],
  TRANSMISE: [EtatFeuille.EN_COURS, EtatFeuille.REFUSEE],
  EN_COURS: [EtatFeuille.INCOMPLETE, EtatFeuille.VALIDEE, EtatFeuille.REFUSEE],
  INCOMPLETE: [EtatFeuille.EN_COURS],
  VALIDEE: [EtatFeuille.REMBOURSEE],
  REMBOURSEE: [],
  REFUSEE: [],
  SUPPRIMEE: [],
};

async function genCode(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const count = await tx.feuilleMaladie.count();
  return `FM-${year}-${String(count + 1).padStart(4, '0')}`;
}

/** Enregistre une feuille lors d'une consultation → état TRANSMISE (BF7). */
export async function createFeuille(input: CreateFeuilleInput, userId: string) {
  const medecin = await prisma.medecin.findUnique({ where: { utilisateurId: userId } });
  if (!medecin) throw new AppError(403, "Votre compte n'est pas rattaché à un médecin.");
  const assure = await prisma.assure.findUnique({ where: { matricule: input.numAssure } });
  if (!assure) throw new AppError(404, 'Aucun assuré ne correspond à ce matricule.');

  const feuille = await prisma.$transaction(async (tx) => {
    const consultation = await tx.consultation.create({
      data: {
        assureId: assure.id,
        medecinId: medecin.id,
        date: input.dateConsult,
        motif: input.motif,
        type: medecin.type,
        diagnostic: input.diagnostic,
        actes: input.actes,
      },
    });
    const code = await genCode(tx);
    return tx.feuilleMaladie.create({
      data: {
        code,
        assureId: assure.id,
        medecinId: medecin.id,
        consultationId: consultation.id,
        date: input.dateConsult,
        diagnostic: input.diagnostic,
        montant: input.montant,
        etat: EtatFeuille.TRANSMISE,
      },
      include: feuilleInclude,
    });
  });
  await recordAudit({ utilisateurId: userId, action: 'FEUILLE_TRANSMISE', entite: 'FeuilleMaladie', entiteId: feuille.id });
  return feuille;
}

export async function listFeuilles(params: { q?: string; skip: number; take: number }, user: AuthUser) {
  const { q, skip, take } = params;
  const filters: Prisma.FeuilleMaladieWhereInput[] = [];
  // Un médecin ne voit que ses feuilles ; l'assureur les voit toutes.
  if (user.role !== Role.ASSUREUR) {
    const medecin = await prisma.medecin.findUnique({ where: { utilisateurId: user.id } });
    filters.push({ medecinId: medecin?.id ?? '00000000-0000-0000-0000-000000000000' });
  }
  if (q) {
    filters.push({
      OR: [
        { code: { contains: q, mode: 'insensitive' } },
        { diagnostic: { contains: q, mode: 'insensitive' } },
        { assure: { matricule: { contains: q, mode: 'insensitive' } } },
        { assure: { personne: { nom: { contains: q, mode: 'insensitive' } } } },
      ],
    });
  }
  const where: Prisma.FeuilleMaladieWhereInput = filters.length ? { AND: filters } : {};
  const [total, items] = await prisma.$transaction([
    prisma.feuilleMaladie.count({ where }),
    prisma.feuilleMaladie.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: feuilleInclude }),
  ]);
  return { total, items };
}

export async function getFeuille(id: string) {
  const feuille = await prisma.feuilleMaladie.findUnique({ where: { id }, include: feuilleInclude });
  if (!feuille) throw new AppError(404, 'Feuille introuvable.');
  return feuille;
}

async function changeEtat(id: string, to: EtatFeuille, actorId: string, action: string, details?: unknown) {
  const feuille = await prisma.feuilleMaladie.findUnique({ where: { id } });
  if (!feuille) throw new AppError(404, 'Feuille introuvable.');
  if (!TRANSITIONS[feuille.etat].includes(to)) {
    throw new AppError(409, `Transition invalide : ${feuille.etat} → ${to}.`);
  }
  const updated = await prisma.feuilleMaladie.update({ where: { id }, data: { etat: to }, include: feuilleInclude });
  await recordAudit({ utilisateurId: actorId, action, entite: 'FeuilleMaladie', entiteId: id, details });
  return updated;
}

export const ouvrir = (id: string, actorId: string) =>
  changeEtat(id, EtatFeuille.EN_COURS, actorId, 'FEUILLE_OUVERTE');
export const refuser = (id: string, motif: string | undefined, actorId: string) =>
  changeEtat(id, EtatFeuille.REFUSEE, actorId, 'FEUILLE_REFUSEE', { motif });
export const marquerIncomplete = (id: string, motif: string | undefined, actorId: string) =>
  changeEtat(id, EtatFeuille.INCOMPLETE, actorId, 'FEUILLE_INCOMPLETE', { motif });

/** Complète et valide une feuille (BF6) : taux auto 100 % généraliste / 80 % spécialiste (BF5). */
export async function completer(id: string, input: CompleterInput, actorId: string) {
  const feuille = await prisma.feuilleMaladie.findUnique({ where: { id }, include: { medecin: true } });
  if (!feuille) throw new AppError(404, 'Feuille introuvable.');
  if (feuille.etat !== EtatFeuille.TRANSMISE && feuille.etat !== EtatFeuille.EN_COURS) {
    throw new AppError(409, `Impossible de compléter une feuille à l'état ${feuille.etat}.`);
  }
  const taux = feuille.medecin.type === TypeMedecin.SPECIALISTE ? 80 : 100;
  const updated = await prisma.feuilleMaladie.update({
    where: { id },
    data: { diagnostic: input.diagnostic, montant: input.montant, etat: EtatFeuille.VALIDEE, taux },
    include: feuilleInclude,
  });
  await recordAudit({ utilisateurId: actorId, action: 'FEUILLE_VALIDEE', entite: 'FeuilleMaladie', entiteId: id, details: { taux } });
  return updated;
}
