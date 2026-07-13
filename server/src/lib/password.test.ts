import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('password (hachage bcrypt des mots de passe)', () => {
  // PROPRIÉTÉ DE SÉCURITÉ — le hash ne doit JAMAIS ressembler au mot de passe.
  // C'est la garantie BNF1 : "jamais stocké en clair". Le préfixe $2 identifie bcrypt.
  it('produit un hash qui ne contient pas le mot de passe en clair', async () => {
    const hash = await hashPassword('SuperSecret123');
    expect(hash).not.toContain('SuperSecret123');
    expect(hash.startsWith('$2')).toBe(true);
  });

  // CAS NOMINAL — le bon mot de passe est accepté.
  it('valide le bon mot de passe', async () => {
    const hash = await hashPassword('SuperSecret123');
    expect(await verifyPassword('SuperSecret123', hash)).toBe(true);
  });

  // CAS D'ERREUR — un mot de passe faux est rejeté. Si ce test casse,
  // n'importe qui pourrait se connecter : c'est le garde-fou de l'authentification.
  it('rejette un mauvais mot de passe', async () => {
    const hash = await hashPassword('SuperSecret123');
    expect(await verifyPassword('mauvais', hash)).toBe(false);
  });

  // PROPRIÉTÉ — le "salage" bcrypt : deux hash du même mot de passe diffèrent,
  // ce qui empêche les attaques par table pré-calculée (rainbow tables).
  it('génère un hash différent pour le même mot de passe (salage)', async () => {
    expect(await hashPassword('meme')).not.toBe(await hashPassword('meme'));
  });
});
