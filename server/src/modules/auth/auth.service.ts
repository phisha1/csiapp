import { randomBytes } from 'crypto';
import { StatutCompte, type Utilisateur } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middlewares/errors';
import { hashPassword, verifyPassword } from '../../lib/password';
import { signToken, type AuthUser } from '../../lib/jwt';
import { recordAudit } from '../../lib/audit';
import type { ChangePasswordInput, LoginInput } from './auth.schemas';
import { isTemporaryPasswordExpired } from '../../lib/temporaryPassword';

// Réponse unique pour « compte inconnu », « mauvais mot de passe » et « compte verrouillé » :
// un tiers ne peut ni deviner quels identifiants existent, ni savoir s'il a déclenché un verrou.
const echecConnexionMsg = `Identifiants incorrects. Après ${env.MAX_LOGIN_ATTEMPTS} échecs, le compte est verrouillé ${env.LOGIN_LOCK_MINUTES} minutes.`;

// Hash factice : on vérifie toujours un mot de passe, même pour un compte inconnu ou
// verrouillé, afin que le temps de réponse ne trahisse pas l'existence du compte.
let hashFactice: Promise<string> | null = null;
function getHashFactice() {
  hashFactice ??= hashPassword(randomBytes(24).toString('hex'));
  return hashFactice;
}

async function trouverCompte(login: string) {
  const saisi = login.trim();
  const exact = await prisma.utilisateur.findUnique({ where: { login: saisi } });
  if (exact || saisi === saisi.toLowerCase()) return exact;
  return prisma.utilisateur.findUnique({ where: { login: saisi.toLowerCase() } });
}

function toPublic(u: Utilisateur) {
  return {
    id: u.id,
    login: u.login,
    role: u.role,
    statut: u.statut,
    doitChangerMotDePasse: u.doitChangerMotDePasse,
    motDePasseTemporaireExpireLe: u.motDePasseTemporaireExpireLe,
  };
}

function session(u: Utilisateur) {
  const authUser: AuthUser = {
    id: u.id,
    role: u.role,
    login: u.login,
    versionSession: u.versionSession,
  };
  return { token: signToken(authUser), utilisateur: toPublic(u) };
}

/**
 * Connexion avec verrou temporaire après MAX_LOGIN_ATTEMPTS échecs (BF1 / BNF1).
 * Le verrou se lève seul : un tiers ne peut plus bloquer durablement un compte,
 * ni celui de l'administrateur.
 */
export async function login(input: LoginInput) {
  const user = await trouverCompte(input.login);
  const maintenant = new Date();
  const verrouille = !!user?.verrouilleJusquA && user.verrouilleJusquA > maintenant;

  if (!user || verrouille) {
    // Pendant le verrou, même le bon mot de passe est refusé avec la même réponse :
    // sinon la différence de message confirmerait un mot de passe deviné.
    await verifyPassword(input.motDePasse, await getHashFactice());
    throw new AppError(401, echecConnexionMsg);
  }

  const motDePasseOk = await verifyPassword(input.motDePasse, user.motDePasseHash);
  if (!motDePasseOk) {
    // Incrément atomique : des tentatives simultanées ne contournent pas le compteur.
    const { nbEchecs } = await prisma.utilisateur.update({
      where: { id: user.id },
      data: { nbEchecs: { increment: 1 } },
      select: { nbEchecs: true },
    });
    const seuilAtteint = nbEchecs >= env.MAX_LOGIN_ATTEMPTS;
    if (seuilAtteint) {
      await prisma.utilisateur.update({
        where: { id: user.id },
        data: {
          nbEchecs: 0,
          verrouilleJusquA: new Date(maintenant.getTime() + env.LOGIN_LOCK_MINUTES * 60_000),
        },
      });
    }
    await recordAudit({
      utilisateurId: user.id,
      action: seuilAtteint ? 'COMPTE_VERROUILLE' : 'CONNEXION_ECHEC',
    });
    throw new AppError(401, echecConnexionMsg);
  }

  // Le statut n'est révélé qu'à celui qui connaît le mot de passe.
  if (user.statut === StatutCompte.SUSPENDU) {
    throw new AppError(423, 'Compte suspendu par un administrateur. Contactez-le pour le réactiver.');
  }
  if (user.statut !== StatutCompte.ACTIF) {
    throw new AppError(423, "Compte bloqué. Contactez l'administrateur pour le réactiver.");
  }

  if (
    user.doitChangerMotDePasse &&
    isTemporaryPasswordExpired(user.motDePasseTemporaireExpireLe)
  ) {
    await recordAudit({ utilisateurId: user.id, action: 'MOT_DE_PASSE_TEMPORAIRE_EXPIRE' });
    throw new AppError(403, 'Mot de passe temporaire expiré. Demandez une réinitialisation à votre administrateur.');
  }

  const updated = await prisma.utilisateur.update({
    where: { id: user.id },
    data: { nbEchecs: 0, verrouilleJusquA: null, derniereConnexion: new Date() },
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
  if (input.motDePasseActuel === input.nouveauMotDePasse) {
    throw new AppError(400, 'Le nouveau mot de passe doit être différent du mot de passe actuel.');
  }

  await prisma.utilisateur.update({
    where: { id: userId },
    data: {
      motDePasseHash: await hashPassword(input.nouveauMotDePasse),
      doitChangerMotDePasse: false,
      motDePasseTemporaireExpireLe: null,
      // Invalide toutes les sessions existantes, y compris celle en cours (OWASP ASVS).
      jetonsInvalidesAvant: new Date(),
      versionSession: { increment: 1 },
    },
  });
  await recordAudit({ utilisateurId: userId, action: 'MOT_DE_PASSE_CHANGE' });
  return { message: 'Mot de passe modifié. Veuillez vous reconnecter.' };
}
