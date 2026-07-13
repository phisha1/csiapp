import { describe, expect, it } from 'vitest';
import type { FeuilleForm, MedForm, RembBank } from '../types';
import { validateFeuille, validateMed, validateRembBank } from './useAppStore';

const feuilleValide: FeuilleForm = {
  numAssure: 'ASS-2024-0142',
  dateConsult: '2026-06-14',
  montant: '28 500 FCFA',
  diagnostic: 'Paludisme simple',
  actes: 'Consultation',
  prescriptions: '',
  observations: '',
};

const medecinValide: MedForm = {
  nom: 'Atangana',
  prenom: 'Marie',
  numOrdre: 'CM-MED-913',
  type: 'Généraliste',
  specialite: '',
  tel: '699000000',
  etab: 'Hôpital central',
  email: 'marie.atangana@example.test',
  mdp: 'Temporaire-2026',
};

const banqueValide: RembBank = {
  banqueRecep: 'CBC Bank',
  compteRecep: '100020003000',
  titulaire: 'Owona Sandrine',
  useEmetteur: false,
  banqueEmet: '',
  compteEmet: '',
};

describe('validateFeuille', () => {
  it('accepte une feuille métier complète', () => {
    expect(validateFeuille(feuilleValide)).toEqual({});
  });

  it('rejette les identifiants, dates, montants et diagnostics invalides', () => {
    const erreurs = validateFeuille({
      ...feuilleValide,
      numAssure: '142',
      dateConsult: '2026-06-21',
      montant: '0 FCFA',
      diagnostic: 'x',
    });

    expect(erreurs).toEqual({
      numAssure: 'Format attendu : ASS-AAAA-NNNN.',
      dateConsult: 'La date ne peut pas être dans le futur.',
      montant: 'Montant invalide : saisir un nombre positif.',
      diagnostic: 'Diagnostic trop court (3 caractères min.).',
    });
  });
});

describe('validateMed', () => {
  it('accepte un médecin généraliste complet', () => {
    expect(validateMed(medecinValide)).toEqual({});
  });

  it('exige la spécialité pour un spécialiste', () => {
    expect(validateMed({ ...medecinValide, type: 'Spécialiste' })).toMatchObject({
      specialite: 'La spécialité est requise pour un spécialiste.',
    });
  });
});

describe('validateRembBank', () => {
  it('ne demande aucune coordonnée bancaire pour un paiement en espèces', () => {
    expect(validateRembBank({ ...banqueValide, banqueRecep: '', compteRecep: '', titulaire: '' }, 'especes')).toEqual({});
  });

  it('contrôle les deux comptes lorsque le compte émetteur est activé', () => {
    const erreurs = validateRembBank({
      ...banqueValide,
      compteRecep: '123',
      useEmetteur: true,
      banqueEmet: '',
      compteEmet: '456',
    }, 'virement');

    expect(erreurs).toEqual({
      compteRecep: 'Numéro de compte invalide (10 caractères min.).',
      banqueEmet: 'Sélectionnez la banque émettrice.',
      compteEmet: 'Numéro de compte invalide.',
    });
  });
});
