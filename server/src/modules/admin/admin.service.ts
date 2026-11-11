import { Prisma, Role, StatutCompte } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errors';
import { recordAudit } from '../../lib/audit';
import { generateTemporaryPassword, hashPassword } from '../../lib/password';
import type { CreateAssureurInput } from './admin.schemas';
import { temporaryPasswordExpiresAt } from '../../lib/temporaryPassword';

// Champs exposés d'un utilisateur (jamais le hash du mot de passe).
const publicSelect = {
  id: true,
  login: true,
  role: true,
  statut: true,
  nbEchecs: true,
  verrouilleJusquA: true,
  derniereConnexion: true,
  doitChangerMotDePasse: true,
  motDePasseTemporaireExpireLe: true,
  createdAt: true,
} as const;

/** Liste tous les comptes (administration des utilisateurs). */
export function listUtilisateurs() {
  return prisma.utilisateur.findMany({ select: publicSelect, orderBy: { createdAt: 'asc' } });
}

/**
 * Provisionne un compte assureur depuis l'espace d'administration.
 * Le mot de passe temporaire n'est renvoyé qu'une fois et doit être remplacé
 * lors de la première connexion.
 */
export async function creerAssureur(input: CreateAssureurInput, adminId: string) {
  const motDePasseTemporaire = generateTemporaryPassword();

  try {
    const utilisateur = await prisma.utilisateur.create({
      data: {
        login: input.login.toLowerCase(),
        motDePasseHash: await hashPassword(motDePasseTemporaire),
        role: Role.ASSUREUR,
        doitChangerMotDePasse: true,
        motDePasseTemporaireExpireLe: temporaryPasswordExpiresAt(),
      },
      select: publicSelect,
    });

    await recordAudit({
      utilisateurId: adminId,
      action: 'COMPTE_ASSUREUR_CREE',
      entite: 'Utilisateur',
      entiteId: utilisateur.id,
    });

    return { utilisateur, motDePasseTemporaire };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'Cet identifiant est déjà utilisé.');
    }
    throw error;
  }
}

/** Réactive un compte bloqué ou suspendu : statut ACTIF + compteur d'échecs remis à zéro. */
export async function reactiver(id: string, adminId: string) {
  const user = await prisma.utilisateur.findUnique({ where: { id } });
  if (!user) throw new AppError(404, 'Utilisateur introuvable.');
  const updated = await prisma.utilisateur.update({
    where: { id },
    data: { statut: StatutCompte.ACTIF, nbEchecs: 0, verrouilleJusquA: null },
    select: publicSelect,
  });
  await recordAudit({ utilisateurId: adminId, action: 'COMPTE_REACTIVE', entite: 'Utilisateur', entiteId: id });
  return updated;
}

/** Suspend un compte (décision administrative). Effet immédiat via requireAuth. */
export async function suspendre(id: string, adminId: string) {
  // Garde-fou : un admin ne peut pas se suspendre lui-même (risque de blocage total).
  if (id === adminId) {
    throw new AppError(400, 'Vous ne pouvez pas suspendre votre propre compte.');
  }
  const user = await prisma.utilisateur.findUnique({ where: { id } });
  if (!user) throw new AppError(404, 'Utilisateur introuvable.');
  if (user.role === Role.ADMIN) {
    const activeAdmins = await prisma.utilisateur.count({
      where: { role: Role.ADMIN, statut: StatutCompte.ACTIF },
    });
    if (activeAdmins <= 1) {
      throw new AppError(400, 'Impossible de suspendre le dernier administrateur actif.');
    }
  }
  const updated = await prisma.utilisateur.update({
    where: { id },
    data: { statut: StatutCompte.SUSPENDU },
    select: publicSelect,
  });
  await recordAudit({ utilisateurId: adminId, action: 'COMPTE_SUSPENDU', entite: 'Utilisateur', entiteId: id });
  return updated;
}

/**
 * Réinitialise le mot de passe d'un utilisateur (« mot de passe oublié »).
 * Génère un mot de passe temporaire (renvoyé UNE fois), réactive le compte,
 * invalide les sessions et force le changement à la prochaine connexion.
 */
export async function reinitialiserMotDePasse(id: string, adminId: string) {
  if (id === adminId) {
    throw new AppError(400, 'Utilisez vos paramètres pour changer votre propre mot de passe.');
  }
  const user = await prisma.utilisateur.findUnique({ where: { id } });
  if (!user) throw new AppError(404, 'Utilisateur introuvable.');

  const motDePasseTemporaire = generateTemporaryPassword();
  await prisma.utilisateur.update({
    where: { id },
    data: {
      motDePasseHash: await hashPassword(motDePasseTemporaire),
      doitChangerMotDePasse: true, // devra le changer dès la première connexion
      motDePasseTemporaireExpireLe: temporaryPasswordExpiresAt(),
      statut: StatutCompte.ACTIF, // un compte oublié était souvent bloqué
      nbEchecs: 0,
      verrouilleJusquA: null,
      jetonsInvalidesAvant: new Date(), // coupe toute session existante
      versionSession: { increment: 1 },
    },
  });
  await recordAudit({ utilisateurId: adminId, action: 'MOT_DE_PASSE_REINITIALISE', entite: 'Utilisateur', entiteId: id });
  // Le mot de passe temporaire n'est renvoyé qu'ici, jamais stocké en clair.
  return { message: 'Mot de passe réinitialisé.', motDePasseTemporaire };
}
