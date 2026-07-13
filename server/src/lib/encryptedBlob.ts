import crypto from 'crypto';
import { env } from '../config/env';

const MAGIC = Buffer.from('CSI1');
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const key = crypto.scryptSync(env.ENCRYPTION_KEY, 'csi-cnam-document-v1', 32);

/** Chiffre un document binaire avec AES-256-GCM avant son stockage en base. */
export function encryptBlob(plain: Buffer): Buffer {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([MAGIC, iv, cipher.getAuthTag(), encrypted]);
}

/** Déchiffre et authentifie un document produit par encryptBlob(). */
export function decryptBlob(payload: Uint8Array): Buffer {
  const input = Buffer.from(payload);
  const minimumLength = MAGIC.length + IV_LENGTH + TAG_LENGTH;
  if (input.length < minimumLength || !input.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw new Error('Format de document chiffré invalide.');
  }

  const ivStart = MAGIC.length;
  const tagStart = ivStart + IV_LENGTH;
  const dataStart = tagStart + TAG_LENGTH;
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, input.subarray(ivStart, tagStart));
  decipher.setAuthTag(input.subarray(tagStart, dataStart));
  return Buffer.concat([decipher.update(input.subarray(dataStart)), decipher.final()]);
}

export function documentSha256(content: Uint8Array): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}
