import { describe, expect, it } from 'vitest';
import { decryptBlob, documentSha256, encryptBlob } from './encryptedBlob';

describe('archive chiffrée des documents', () => {
  it('chiffre puis restitue exactement un PDF', () => {
    const pdf = Buffer.from('%PDF-1.7\ncontenu médical sensible');
    const encrypted = encryptBlob(pdf);

    expect(encrypted.equals(pdf)).toBe(false);
    expect(decryptBlob(encrypted)).toEqual(pdf);
    expect(documentSha256(decryptBlob(encrypted))).toBe(documentSha256(pdf));
  });

  it('refuse un document altéré', () => {
    const encrypted = encryptBlob(Buffer.from('facture'));
    encrypted[encrypted.length - 1] ^= 1;

    expect(() => decryptBlob(encrypted)).toThrow();
  });
});
