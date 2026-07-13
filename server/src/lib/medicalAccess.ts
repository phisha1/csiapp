import { Prisma, Role, TypeMedecin, TypePrescription } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errors';
import type { AuthUser } from './jwt';

export type MedicalActor =
  | { kind: 'assureur' }
  | { kind: 'medecin'; medecinId: string; type: TypeMedecin };

export async function resolveMedicalActor(user: AuthUser): Promise<MedicalActor> {
  if (user.role === Role.ASSUREUR) return { kind: 'assureur' };
  if (user.role !== Role.GENERALISTE && user.role !== Role.SPECIALISTE) {
    throw new AppError(403, 'Ce profil ne peut pas accéder aux dossiers médicaux.');
  }
  const medecin = await prisma.medecin.findUnique({
    where: { utilisateurId: user.id },
    select: { id: true, type: true },
  });
  if (!medecin) throw new AppError(403, "Votre compte n'est pas rattaché à un médecin.");
  return { kind: 'medecin', medecinId: medecin.id, type: medecin.type };
}

/** Relation active autorisant l'ouverture du dossier démographique du patient. */
export function activePatientRelationshipWhere(
  medecinId: string,
  type: TypeMedecin,
): Prisma.AssureWhereInput {
  if (type === TypeMedecin.GENERALISTE) return { traitantId: medecinId };
  return {
    prescriptions: {
      some: {
        type: TypePrescription.ORIENTATION,
        medecinSpecialisteId: medecinId,
      },
    },
  };
}

/** Annuaire patient : relation active ou dossier déjà créé par ce médecin. */
export function patientDirectoryWhere(
  medecinId: string,
  type: TypeMedecin,
): Prisma.AssureWhereInput {
  return {
    OR: [
      activePatientRelationshipWhere(medecinId, type),
      { consultations: { some: { medecinId } } },
      { feuilles: { some: { medecinId } } },
      { prescriptions: { some: { medecinId } } },
    ],
  };
}

export function consultationAccessWhere(
  medecinId: string,
  type: TypeMedecin,
): Prisma.ConsultationWhereInput {
  if (type === TypeMedecin.SPECIALISTE) return { medecinId };
  return { OR: [{ medecinId }, { assure: { traitantId: medecinId } }] };
}

export function feuilleAccessWhere(
  medecinId: string,
  type: TypeMedecin,
): Prisma.FeuilleMaladieWhereInput {
  if (type === TypeMedecin.SPECIALISTE) return { medecinId };
  return { OR: [{ medecinId }, { assure: { traitantId: medecinId } }] };
}

export function prescriptionAccessWhere(
  medecinId: string,
  type: TypeMedecin,
): Prisma.PrescriptionWhereInput {
  if (type === TypeMedecin.SPECIALISTE) {
    return { OR: [{ medecinId }, { medecinSpecialisteId: medecinId }] };
  }
  return { OR: [{ medecinId }, { assure: { traitantId: medecinId } }] };
}

/** Un nouveau dossier ne peut être ouvert que pour un patient actuellement confié au médecin. */
export function canStartMedicalRecordWhere(
  medecinId: string,
  type: TypeMedecin,
): Prisma.AssureWhereInput {
  if (type === TypeMedecin.GENERALISTE) return { traitantId: medecinId };
  return {
    prescriptions: {
      some: {
        type: TypePrescription.ORIENTATION,
        medecinSpecialisteId: medecinId,
      },
    },
  };
}
