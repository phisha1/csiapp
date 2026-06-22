import bcrypt from 'bcryptjs';

const ROUNDS = 10;

/** Hache un mot de passe en clair (BNF1 : jamais stocké en clair). */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

/** Compare un mot de passe en clair à son hash. */
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
