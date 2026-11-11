import { randomBytes } from 'crypto';
import { Prisma, Role, TypeMedecin } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errors';
import { hashPassword } from '../../lib/password';
import { recordAudit } from '../../lib/audit';
import type { CreateMedecinInput, UpdateMedecinInput } from './medecins.schemas';
import { medicalMedecinSelect } from '../../lib/medicalProjections';

async function resolveSpecialiteId(libelle?: string): Promise<string | null> {
  if (!libelle || !libelle.trim()) return null;
  const sp = await prisma.specialite.upsert({
    where: { libelle: libelle.trim() },
    update: {},
    create: { libelle: libelle.trim() },
  });
  return sp.id;
}

/**
 * Enregistre un médecin + son compte utilisateur (BF2).
 * Le compte naît inutilisable (mot de passe aléatoire que personne ne connaît, déjà
 * expiré) : seul un administrateur l'active en remettant un mot de passe temporaire
 * au médecin. L'assureur ne peut donc pas se connecter à la place d'un médecin.
 */
export async function createMedecin(input: CreateMedecinInput, actorId: string) {
  const login = input.login.toLowerCase();
  if (await prisma.medecin.findUnique({ where: { numOrdre: input.numOrdre } })) {
    throw new AppError(409, "Ce numéro d'ordre est déjà enregistré.");
  }
  if (await prisma.utilisateur.findUnique({ where: { login } })) {
    throw new AppError(409, 'Cet identifiant est déjà utilisé.');
  }

  const specialiteId =
    input.type === 'SPECIALISTE' ? await resolveSpecialiteId(input.specialite) : null;
  const role = input.type === 'SPECIALISTE' ? Role.SPECIALISTE : Role.GENERALISTE;
  const motDePasseHash = await hashPassword(randomBytes(32).toString('hex'));

  const medecin = await prisma.$transaction(async (tx) => {
    const personne = await tx.personne.create({
      data: {
        nom: input.nom,
        prenom: input.prenom,
        sexe: input.sexe,
        dateNaissance: input.dateNaissance,
        telephone: input.telephone,
        email: input.email,
      },
    });
    const utilisateur = await tx.utilisateur.create({
      data: {
        login,
        motDePasseHash,
        role,
        doitChangerMotDePasse: true,
        motDePasseTemporaireExpireLe: new Date(), // expiré d'emblée : activation par l'admin
      },
    });
    return tx.medecin.create({
      data: {
        personneId: personne.id,
        utilisateurId: utilisateur.id,
        numOrdre: input.numOrdre,
        type: input.type as TypeMedecin,
        specialiteId,
        etablissement: input.etablissement,
      },
      select: medicalMedecinSelect,
    });
  });

  await recordAudit({ utilisateurId: actorId, action: 'MEDECIN_CREE', entite: 'Medecin', entiteId: medecin.id });
  return medecin;
}

export async function listMedecins(params: { q?: string; skip: number; take: number }) {
  const { q, skip, take } = params;
  const where: Prisma.MedecinWhereInput = q
    ? {
        OR: [
          { numOrdre: { contains: q, mode: 'insensitive' } },
          { etablissement: { contains: q, mode: 'insensitive' } },
          { personne: { nom: { contains: q, mode: 'insensitive' } } },
          { personne: { prenom: { contains: q, mode: 'insensitive' } } },
          { specialite: { libelle: { contains: q, mode: 'insensitive' } } },
        ],
      }
    : {};
  const [total, items] = await prisma.$transaction([
    prisma.medecin.count({ where }),
    prisma.medecin.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: medicalMedecinSelect,
    }),
  ]);
  return { total, items };
}

export async function getMedecin(id: string) {
  const medecin = await prisma.medecin.findUnique({ where: { id }, select: medicalMedecinSelect });
  if (!medecin) throw new AppError(404, 'Médecin introuvable.');
  return medecin;
}

export async function updateMedecin(id: string, input: UpdateMedecinInput, actorId: string) {
  await getMedecin(id);
  const data: Prisma.MedecinUpdateInput = {
    etablissement: input.etablissement,
    personne:
      input.telephone !== undefined || input.email !== undefined
        ? { update: { telephone: input.telephone, email: input.email } }
        : undefined,
  };
  if (input.specialite !== undefined) {
    const specialiteId = await resolveSpecialiteId(input.specialite);
    data.specialite = specialiteId ? { connect: { id: specialiteId } } : { disconnect: true };
  }
  const updated = await prisma.medecin.update({ where: { id }, data, select: medicalMedecinSelect });
  await recordAudit({ utilisateurId: actorId, action: 'MEDECIN_MODIFIE', entite: 'Medecin', entiteId: id });
  return updated;
}
