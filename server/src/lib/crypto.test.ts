import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, maskAccount } from './crypto';

// `describe` regroupe des tests liés ; `it` décrit UN comportement attendu ;
// `expect(...)` vérifie une assertion. On lit un test comme une phrase :
// "il (it) chiffre puis déchiffre et retrouve le texte d'origine".

describe('crypto (chiffrement AES-256-GCM des données sensibles)', () => {
  // 1) CAS NOMINAL — la garantie de base : ce qu'on chiffre, on doit pouvoir le relire.
  //    Si ce test casse un jour, cela signifie que des données déjà en base
  //    (numéros de compte) deviennent illisibles. C'est le test le plus important.
  it('déchiffre exactement ce qui a été chiffré (aller-retour)', () => {
    const secret = 'CM76 10005 00012345678 90';
    expect(decrypt(encrypt(secret))).toBe(secret);
  });

  // 2) PROPRIÉTÉ DE SÉCURITÉ — deux chiffrements du même texte doivent DIFFÉRER.
  //    Grâce à l'IV aléatoire, un attaquant ne peut pas deviner que deux assurés
  //    ont le même numéro de compte en comparant les valeurs chiffrées.
  it('produit un chiffré différent à chaque appel (IV aléatoire)', () => {
    expect(encrypt('meme-valeur')).not.toBe(encrypt('meme-valeur'));
  });

  // 3) PROPRIÉTÉ DE SÉCURITÉ — l'authentification GCM détecte toute altération.
  //    Si quelqu'un modifie le chiffré en base, le déchiffrement doit ÉCHOUER
  //    plutôt que de renvoyer une donnée corrompue silencieusement.
  it('rejette un chiffré falsifié', () => {
    const falsifie = encrypt('donnee').slice(0, -4) + 'AAAA';
    expect(() => decrypt(falsifie)).toThrow();
  });

  // 4) CAS D'ERREUR — une entrée malformée ne doit pas planter, mais renvoyer ''.
  it('renvoie une chaîne vide pour une entrée invalide', () => {
    expect(decrypt('pas-un-format-valide')).toBe('');
  });

  // 5) COMPORTEMENT MÉTIER — le masque ne révèle QUE les 4 derniers chiffres.
  it('ne révèle que les 4 derniers caractères du compte', () => {
    const masque = maskAccount(encrypt('1234567890'));
    expect(masque).toContain('7890'); // les 4 derniers, oui
    expect(masque).not.toContain('123456'); // le reste, jamais
  });
});
