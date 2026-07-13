import { StatutCompte, type Utilisateur } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middlewares/errors';
import { hashPassword, verifyPassword } from '../../lib/password';
import { signToken, type AuthUser } from '../../lib/jwt';
import { recordAudit } from '../../lib/audit';
import type { ChangePasswordInput, LoginInput } from './auth.schemas';

const compteBloqueMsg = `Compte bloqué après ${env.MAX_LOGIN_ATTEMPTS} tentatives échouées. Contactez l'administrateur pour le débloquer.`;

function toPublic(u: Utilisateur) {
  return {
    id: u.id,
    login: u.login,
    role: u.role,
    statut: u.statut,
    doitChangerMotDePasse: u.doitChangerMotDePasse,
  };
}

function session(u: Utilisateur) {
  const authUser: AuthUser = { id: u.id, role: u.role, login: u.login };
  return { token: signToken(authUser), utilisateur: toPublic(u) };
}

/** Connexion avec verrouillage après MAX_LOGIN_ATTEMPTS échecs (BF1 / BNF1). */
export async function login(input: LoginInput) {
  const user = await prisma.utilisateur.findUnique({ where: { login: input.login } });
  if (!user) {
    throw new AppError(401, 'Identifiants incorrects.');
  }
  if (user.statut === StatutCompte.BLOQUE) {
    throw new AppError(423, compteBloqueMsg);
  }
  if (user.statut === StatutCompte.SUSPENDU) {
    throw new AppError(423, 'Compte suspendu par un administrateur. Contactez-le pour le réactiver.');
  }

  const motDePasseOk = await verifyPassword(input.motDePasse, user.motDePasseHash);
  if (!motDePasseOk) {
    const nbEchecs = user.nbEchecs + 1;
    const verrouille = nbEchecs >= env.MAX_LOGIN_ATTEMPTS;
    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { nbEchecs, statut: verrouille ? StatutCompte.BLOQUE : undefined },
    });
    await recordAudit({
      utilisateurId: user.id,
      action: verrouille ? 'COMPTE_BLOQUE' : 'CONNEXION_ECHEC',
    });
    if (verrouille) throw new AppError(423, compteBloqueMsg);
    throw new AppError(
      401,
      `Identifiants incorrects. Tentative ${nbEchecs}/${env.MAX_LOGIN_ATTEMPTS} — le compte sera bloqué après ${env.MAX_LOGIN_ATTEMPTS} échecs.`,
    );
  }

  const updated = await prisma.utilisateur.update({
    where: { id: user.id },
    data: { nbEchecs: 0, derniereConnexion: new Date() },
  });
  await recordAudit({ utilisateurId: user.id, action: 'CONNEXION_REUSSIE' });
  return session(updated);
}

/** Changement de mot de passe par l'utilisateur connecté (invalide toutes ses sessions). */
export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.utilisateur.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'Compte introuvable.');

  const actuelOk = await verifyPassword(input.motDePasseActuel, user.motDePasseHash);
  if (!actuelOk) throw new AppError(401, 'Mot de passe actuel incorrect.');

  await prisma.utilisateur.update({
    where: { id: userId },
    data: {
      motDePasseHash: await hashPassword(input.nouveauMotDePasse),
      doitChangerMotDePasse: false,
      // Invalide toutes les sessions existantes, y compris celle en cours (OWASP ASVS).
      jetonsInvalidesAvant: new Date(),
    },
  });
  await recordAudit({ utilisateurId: userId, action: 'MOT_DE_PASSE_CHANGE' });
  return { message: 'Mot de passe modifié. Veuillez vous reconnecter.' };
}
