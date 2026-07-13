import { StatutCompte } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errors';
import { recordAudit } from '../../lib/audit';

// Champs exposés d'un utilisateur (jamais le hash du mot de passe).
const publicSelect = {
  id: true,
  login: true,
  role: true,
  statut: true,
  nbEchecs: true,
  derniereConnexion: true,
  createdAt: true,
} as const;

/** Liste tous les comptes (administration des utilisateurs). */
export function listUtilisateurs() {
  return prisma.utilisateur.findMany({ select: publicSelect, orderBy: { createdAt: 'asc' } });
}

/** Réactive un compte bloqué ou suspendu : statut ACTIF + compteur d'échecs remis à zéro. */
export async function reactiver(id: string, adminId: string) {
  const user = await prisma.utilisateur.findUnique({ where: { id } });
  if (!user) throw new AppError(404, 'Utilisateur introuvable.');
  const updated = await prisma.utilisateur.update({
    where: { id },
    data: { statut: StatutCompte.ACTIF, nbEchecs: 0 },
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
  const updated = await prisma.utilisateur.update({
    where: { id },
    data: { statut: StatutCompte.SUSPENDU },
    select: publicSelect,
  });
  await recordAudit({ utilisateurId: adminId, action: 'COMPTE_SUSPENDU', entite: 'Utilisateur', entiteId: id });
  return updated;
}
