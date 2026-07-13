import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const ROUNDS = 10;

/**
 * Génère un mot de passe temporaire aléatoire respectant la politique
 * (≥ 8 caractères, au moins une lettre et un chiffre). Utilisé lors d'une
 * réinitialisation par l'administrateur.
 */
export function generateTemporaryPassword(): string {
  // "Tmp" garantit des lettres ; le hex ajoute de l'aléa ; les 2 chiffres finaux
  // garantissent la présence d'un chiffre — la politique est donc toujours respectée.
  const alea = randomBytes(4).toString('hex'); // 8 caractères hexadécimaux
  const chiffres = String(10 + Math.floor(Math.random() * 90)); // 2 chiffres
  return `Tmp${alea}${chiffres}`;
}

/** Hache un mot de passe en clair (BNF1 : jamais stocké en clair). */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

/** Compare un mot de passe en clair à son hash. */
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
