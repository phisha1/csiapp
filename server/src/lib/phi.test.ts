import { describe, it, expect } from 'vitest';
import {
  encryptPHI,
  decryptPHI,
  isEncrypted,
  decryptFeuille,
  decryptPrescription,
} from './phi';

describe('phi (chiffrement des données de santé au repos)', () => {
  // CAS NOMINAL — un diagnostic chiffré doit se relire à l'identique.
  it('chiffre puis déchiffre un champ clinique', () => {
    const chiffre = encryptPHI('Angine bactérienne');
    expect(chiffre).not.toBe('Angine bactérienne'); // en base : illisible
    expect(decryptPHI(chiffre)).toBe('Angine bactérienne'); // à l'écran : lisible
  });

  // COMPORTEMENT PRISMA — undefined = « ne pas toucher au champ » lors d'un update.
  it('préserve undefined (mise à jour partielle) et null (champ vide)', () => {
    expect(encryptPHI(undefined)).toBeUndefined();
    expect(encryptPHI(null)).toBeNull();
    expect(encryptPHI('')).toBeNull();
  });

  // IDEMPOTENCE — protège le backfill : re-chiffrer ne double pas le chiffrement.
  it('ne re-chiffre pas une valeur déjà chiffrée', () => {
    const once = encryptPHI('Diabète type 2') as string;
    expect(encryptPHI(once)).toBe(once);
  });

  // TOLÉRANCE MIGRATION — une donnée héritée en clair est renvoyée telle quelle.
  it('renvoie une donnée en clair non chiffrée telle quelle', () => {
    expect(decryptPHI('ancien diagnostic en clair')).toBe('ancien diagnostic en clair');
    expect(isEncrypted('ancien diagnostic en clair')).toBe(false);
  });

  // CENTRALISATION — decryptFeuille traite aussi la consultation imbriquée,
  // ce qui garantit qu'aucun champ clinique imbriqué ne fuit chiffré.
  it('déchiffre le diagnostic de la feuille ET de sa consultation imbriquée', () => {
    const feuille = {
      diagnostic: encryptPHI('Grippe') as string | null,
      consultation: {
        motif: encryptPHI('Fièvre') as string | null,
        diagnostic: encryptPHI('Grippe') as string | null,
        actes: null,
        suite: null,
      },
    };
    const clair = decryptFeuille(feuille);
    expect(clair.diagnostic).toBe('Grippe');
    expect(clair.consultation.motif).toBe('Fièvre');
    expect(clair.consultation.diagnostic).toBe('Grippe');
  });

  it('déchiffre toutes les consignes sensibles d’une ordonnance', () => {
    const prescription = {
      lignes: [{
        posologie: encryptPHI('1 comprimé matin et soir') as string,
        duree: encryptPHI('7 jours') as string,
        instructions: encryptPHI('Après le repas') as string,
      }],
    };

    const clair = decryptPrescription(prescription);
    expect(clair.lignes[0]).toEqual({
      posologie: '1 comprimé matin et soir',
      duree: '7 jours',
      instructions: 'Après le repas',
    });
  });
});
