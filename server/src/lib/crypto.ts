import crypto from 'crypto';
import { env } from '../config/env';

// Clé AES-256 dérivée de la passphrase d'environnement (BNF1 : chiffrement des données bancaires).
const key = crypto.scryptSync(env.ENCRYPTION_KEY, 'csi-cnam-salt', 32);

/** Chiffre une chaîne (AES-256-GCM) → "iv:tag:données" en base64. */
export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join(':');
}

/** Déchiffre une valeur produite par encrypt(). */
export function decrypt(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(':');
  if (!ivB64 || !tagB64 || !dataB64) return '';
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const dec = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]);
  return dec.toString('utf8');
}

/** Masque un numéro de compte chiffré pour l'affichage (ne révèle que les 4 derniers). */
export function maskAccount(encrypted: string): string {
  try {
    const full = decrypt(encrypted);
    return `**** **** ${full.slice(-4)}`;
  } catch {
    return '••••';
  }
}
