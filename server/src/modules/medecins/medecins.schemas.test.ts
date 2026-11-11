import { describe, expect, it } from 'vitest';
import { createMedecinSchema } from './medecins.schemas';
import { completerSchema, createFeuilleSchema } from '../feuilles/feuilles.schemas';

const base = {
  nom: 'Atangana',
  prenom: 'Paul',
  numOrdre: 'CM-MED-001',
  type: 'GENERALISTE',
  login: 'paul.atangana@example.test',
};

describe('séparation des tâches côté assureur', () => {
  it('ne laisse pas l’assureur choisir le mot de passe d’un médecin', () => {
    const parsed = createMedecinSchema.parse({ ...base, motDePasse: 'ConnuDeLAssureur1' });
    expect(parsed).not.toHaveProperty('motDePasse');
  });

  it('refuse que la validation d’une feuille modifie le montant ou le diagnostic', () => {
    expect(completerSchema.safeParse({}).success).toBe(true);
    expect(completerSchema.safeParse({ montant: 9_000_000 }).success).toBe(false);
    expect(completerSchema.safeParse({ diagnostic: 'réécrit' }).success).toBe(false);
  });

  it('accepte un matricule au-delà du 9 999e assuré', () => {
    const feuille = { dateConsult: '2026-01-10', montant: 5000, diagnostic: 'Paludisme simple' };
    expect(createFeuilleSchema.safeParse({ ...feuille, numAssure: 'ASS-2026-10000' }).success).toBe(true);
    expect(createFeuilleSchema.safeParse({ ...feuille, numAssure: 'ASS-2026-123' }).success).toBe(false);
  });
});
