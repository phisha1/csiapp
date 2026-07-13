import { prisma } from '../config/prisma';

/**
 * Liste de révocation des jetons JWT (OWASP ASVS V3 — Session Management).
 * Rend un JWT « stateless » révocable : logout, changement de mot de passe,
 * suspension d'un compte, activité suspecte.
 */

/** Révoque un jeton jusqu'à son expiration naturelle. */
export async function revokeToken(jti: string, expSeconds: number): Promise<void> {
  await prisma.jetonRevoque.upsert({
    where: { jti },
    create: { jti, expiration: new Date(expSeconds * 1000) },
    update: {}, // déjà révoqué : rien à faire (idempotent)
  });
  // Nettoyage opportuniste : une fois expiré, un jeton est de toute façon refusé
  // par la vérification de signature — inutile de garder son entrée.
  await prisma.jetonRevoque.deleteMany({ where: { expiration: { lt: new Date() } } });
}

/** Indique si un jeton (par son jti) a été révoqué. */
export async function isRevoked(jti: string): Promise<boolean> {
  const found = await prisma.jetonRevoque.findUnique({ where: { jti } });
  return found !== null;
}
