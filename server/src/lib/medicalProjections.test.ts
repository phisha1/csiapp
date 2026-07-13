import { describe, expect, it } from 'vitest';
import { medicalAssureSelect, medicalMedecinSelect } from './medicalProjections';

describe('projections minimales des données médicales', () => {
  it('n’expose pas les champs administratifs ou bancaires de l’assuré', () => {
    expect(medicalAssureSelect).not.toHaveProperty('numeroSecu');
    expect(medicalAssureSelect).not.toHaveProperty('profession');
    expect(medicalAssureSelect).not.toHaveProperty('employeur');
    expect(medicalAssureSelect).not.toHaveProperty('modeRembPref');
    expect(medicalAssureSelect).not.toHaveProperty('coordBancaire');
  });

  it('n’expose pas le compte utilisateur rattaché au médecin', () => {
    expect(medicalMedecinSelect).not.toHaveProperty('utilisateurId');
    expect(medicalMedecinSelect).not.toHaveProperty('utilisateur');
  });
});
