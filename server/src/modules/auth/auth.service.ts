import { Role, StatutCompte, type Utilisateur } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middlewares/errors';
import { hashPassword, verifyPassword } from '../../lib/password';
import { signToken, type AuthUser } from '../../lib/jwt';
import { recordAudit } from '../../lib/audit';
import type { LoginInput, RegisterInput } from './auth.schemas';

const compteBloqueMsg = `Compte bloqué après ${env.MAX_LOGIN_ATTEMPTS} tentatives échouées. Contactez l'administrateur pour le débloquer.`;

function toPublic(u: Utilisateur) {
  return { id: u.id, login: u.login, role: u.role, statut: u.statut };
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

/** Inscription d'un agent assureur, conditionnée par le code d'habilitation. */
export async function register(input: RegisterInput) {
  if (input.codeHabilitation.trim().toUpperCase() !== env.AGENT_REGISTRATION_CODE.toUpperCase()) {
    throw new AppError(403, "Code d'habilitation invalide. Demandez-le à l'entreprise d'assurance.");
  }
  const existant = await prisma.utilisateur.findUnique({ where: { login: input.login } });
  if (existant) {
    throw new AppError(409, 'Cet identifiant est déjà utilisé.');
  }
  const user = await prisma.utilisateur.create({
    data: {
      login: input.login,
      motDePasseHash: await hashPassword(input.motDePasse),
      role: Role.ASSUREUR,
    },
  });
  await recordAudit({ utilisateurId: user.id, action: 'INSCRIPTION_AGENT' });
  return session(user);
}
