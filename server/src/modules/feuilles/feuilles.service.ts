import { EtatFeuille, Prisma, TypeMedecin } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errors';
import { recordAudit } from '../../lib/audit';
import { encryptPHI, decryptFeuille } from '../../lib/phi';
import type { AuthUser } from '../../lib/jwt';
import type { CreateFeuilleInput } from './feuilles.schemas';
import {
  canStartMedicalRecordWhere,
  feuilleAccessWhere,
  resolveMedicalActor,
} from '../../lib/medicalAccess';
import { medicalAssureSelect, medicalMedecinSelect } from '../../lib/medicalProjections';

const feuilleInclude = {
  assure: { select: medicalAssureSelect },
  medecin: { select: medicalMedecinSelect },
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
  // Séquence PostgreSQL : deux feuilles créées en même temps n'ont jamais le même code.
  const [{ n }] = await tx.$queryRaw<{ n: bigint }[]>`SELECT nextval('feuille_code_seq') AS n`;
  return `FM-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`;
}

/** Enregistre une feuille lors d'une consultation → état TRANSMISE (BF7). */
export async function createFeuille(input: CreateFeuilleInput, userId: string) {
  const medecin = await prisma.medecin.findUnique({
    where: { utilisateurId: userId },
    select: { id: true, type: true },
  });
  if (!medecin) throw new AppError(403, "Votre compte n'est pas rattaché à un médecin.");
  const assure = await prisma.assure.findFirst({
    where: {
      AND: [
        { matricule: input.numAssure },
        canStartMedicalRecordWhere(medecin.id, medecin.type),
      ],
    },
    select: { id: true },
  });
  if (!assure) {
    throw new AppError(404, "Aucun patient qui vous est confié ne correspond à ce matricule.");
  }

  const feuille = await prisma.$transaction(async (tx) => {
    const consultation = await tx.consultation.create({
      data: {
        assureId: assure.id,
        medecinId: medecin.id,
        date: input.dateConsult,
        motif: encryptPHI(input.motif),
        type: medecin.type,
        diagnostic: encryptPHI(input.diagnostic),
        actes: encryptPHI(input.actes),
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
        diagnostic: encryptPHI(input.diagnostic),
        montant: input.montant,
        etat: EtatFeuille.TRANSMISE,
      },
      include: feuilleInclude,
    });
  });
  await recordAudit({ utilisateurId: userId, action: 'FEUILLE_TRANSMISE', entite: 'FeuilleMaladie', entiteId: feuille.id });
  return decryptFeuille(feuille);
}

export async function listFeuilles(params: { q?: string; skip: number; take: number }, user: AuthUser) {
  const { q, skip, take } = params;
  const filters: Prisma.FeuilleMaladieWhereInput[] = [];
  const actor = await resolveMedicalActor(user);
  if (actor.kind === 'medecin') filters.push(feuilleAccessWhere(actor.medecinId, actor.type));
  if (q) {
    filters.push({
      OR: [
        { code: { contains: q, mode: 'insensitive' } },
        // NB : diagnostic chiffré au repos → non recherchable (choix conformité).
        // La recherche reste possible par code, matricule et nom d'assuré.
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
  return { total, items: items.map(decryptFeuille) };
}

export async function getFeuille(id: string, user: AuthUser) {
  const actor = await resolveMedicalActor(user);
  const feuille = actor.kind === 'assureur'
    ? await prisma.feuilleMaladie.findUnique({ where: { id }, include: feuilleInclude })
    : await prisma.feuilleMaladie.findFirst({
        where: { AND: [{ id }, feuilleAccessWhere(actor.medecinId, actor.type)] },
        include: feuilleInclude,
      });
  if (!feuille) throw new AppError(404, 'Feuille introuvable ou non accessible.');
  await recordAudit({
    utilisateurId: user.id,
    action: 'FEUILLE_CONSULTEE',
    entite: 'FeuilleMaladie',
    entiteId: id,
  });
  return decryptFeuille(feuille);
}

async function changeEtat(id: string, to: EtatFeuille, actorId: string, action: string, details?: unknown) {
  const feuille = await prisma.feuilleMaladie.findUnique({ where: { id } });
  if (!feuille) throw new AppError(404, 'Feuille introuvable.');
  if (!TRANSITIONS[feuille.etat].includes(to)) {
    throw new AppError(409, `Transition invalide : ${feuille.etat} → ${to}.`);
  }
  // Mise à jour conditionnelle : si l'état a changé entre la lecture et l'écriture
  // (deux agents sur la même feuille), on refuse au lieu d'écraser.
  const { count } = await prisma.feuilleMaladie.updateMany({ where: { id, etat: feuille.etat }, data: { etat: to } });
  if (count !== 1) throw new AppError(409, 'La feuille vient d’être modifiée par un autre agent. Rechargez-la.');
  const updated = await prisma.feuilleMaladie.findUniqueOrThrow({ where: { id }, include: feuilleInclude });
  await recordAudit({ utilisateurId: actorId, action, entite: 'FeuilleMaladie', entiteId: id, details });
  return decryptFeuille(updated);
}

export const ouvrir = (id: string, actorId: string) =>
  changeEtat(id, EtatFeuille.EN_COURS, actorId, 'FEUILLE_OUVERTE');
export const refuser = (id: string, motif: string | undefined, actorId: string) =>
  changeEtat(id, EtatFeuille.REFUSEE, actorId, 'FEUILLE_REFUSEE', { motif });
export const marquerIncomplete = (id: string, motif: string | undefined, actorId: string) =>
  changeEtat(id, EtatFeuille.INCOMPLETE, actorId, 'FEUILLE_INCOMPLETE', { motif });

/**
 * Valide une feuille (BF6) : taux auto 100 % généraliste / 80 % spécialiste (BF5).
 * Le diagnostic et le montant saisis par le médecin ne sont pas modifiables ici,
 * et le validateur est retenu pour interdire qu'il paie lui-même la feuille.
 */
export async function completer(id: string, actorId: string) {
  const feuille = await prisma.feuilleMaladie.findUnique({ where: { id }, include: { medecin: true } });
  if (!feuille) throw new AppError(404, 'Feuille introuvable.');
  const etatsValidables: EtatFeuille[] = [EtatFeuille.TRANSMISE, EtatFeuille.EN_COURS];
  if (!etatsValidables.includes(feuille.etat)) {
    throw new AppError(409, `Impossible de compléter une feuille à l'état ${feuille.etat}.`);
  }
  const taux = feuille.medecin.type === TypeMedecin.SPECIALISTE ? 80 : 100;
  const { count } = await prisma.feuilleMaladie.updateMany({
    where: { id, etat: { in: etatsValidables } },
    data: { etat: EtatFeuille.VALIDEE, taux, valideParId: actorId },
  });
  if (count !== 1) throw new AppError(409, 'La feuille vient d’être modifiée par un autre agent. Rechargez-la.');
  const updated = await prisma.feuilleMaladie.findUniqueOrThrow({ where: { id }, include: feuilleInclude });
  await recordAudit({ utilisateurId: actorId, action: 'FEUILLE_VALIDEE', entite: 'FeuilleMaladie', entiteId: id, details: { taux } });
  return decryptFeuille(updated);
}
