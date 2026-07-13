import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Role, TypeMedecin } from '@prisma/client';

const mocks = vi.hoisted(() => ({ findUnique: vi.fn() }));

vi.mock('../config/prisma', () => ({
  prisma: { medecin: { findUnique: mocks.findUnique } },
}));
import {
  canStartMedicalRecordWhere,
  consultationAccessWhere,
  patientDirectoryWhere,
  prescriptionAccessWhere,
  resolveMedicalActor,
} from './medicalAccess';

describe('règles d’accès médical', () => {
  beforeEach(() => vi.clearAllMocks());

  it('refuse un administrateur avant toute lecture de données médicales', async () => {
    await expect(resolveMedicalActor({ id: 'admin-1', login: 'admin', role: Role.ADMIN }))
      .rejects.toThrow(/ne peut pas accéder/i);
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it('refuse un compte médecin qui n’est rattaché à aucun professionnel', async () => {
    mocks.findUnique.mockResolvedValue(null);
    await expect(resolveMedicalActor({ id: 'user-1', login: 'med', role: Role.GENERALISTE }))
      .rejects.toThrow(/rattaché/i);
  });

  it('limite l’annuaire aux relations et dossiers du médecin', () => {
    const serialized = JSON.stringify(patientDirectoryWhere('med-1', TypeMedecin.SPECIALISTE));
    expect(serialized).toContain('consultations');
    expect(serialized).toContain('medecinSpecialisteId');
    expect(serialized).not.toContain('traitantId');
    expect(serialized).not.toContain('utilisateurId');

    expect(JSON.stringify(patientDirectoryWhere('med-1', TypeMedecin.GENERALISTE)))
      .toContain('traitantId');
  });

  it('autorise un généraliste à ouvrir un dossier uniquement pour son patient traitant', () => {
    expect(canStartMedicalRecordWhere('med-1', TypeMedecin.GENERALISTE)).toEqual({
      traitantId: 'med-1',
    });
  });

  it('exige une orientation nominative pour un spécialiste', () => {
    const serialized = JSON.stringify(canStartMedicalRecordWhere('spec-1', TypeMedecin.SPECIALISTE));
    expect(serialized).toContain('ORIENTATION');
    expect(serialized).toContain('spec-1');
  });

  it('inclut les dossiers propres sans ouvrir ceux des autres médecins', () => {
    expect(JSON.stringify(consultationAccessWhere('med-1', TypeMedecin.GENERALISTE)))
      .toContain('traitantId');
    expect(consultationAccessWhere('med-1', TypeMedecin.SPECIALISTE)).toEqual({
      medecinId: 'med-1',
    });
    expect(JSON.stringify(prescriptionAccessWhere('med-1', TypeMedecin.SPECIALISTE)))
      .toContain('medecinSpecialisteId');
  });
});
