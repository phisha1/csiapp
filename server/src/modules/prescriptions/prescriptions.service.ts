import { Prisma, Role, TypeMedecin, TypePrescription } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errors';
import { recordAudit } from '../../lib/audit';
import type { AuthUser } from '../../lib/jwt';
import type { OrientationInput, PrescrireMedicamentsInput } from './prescriptions.schemas';

const prescInclude = {
  feuille: true,
  specialite: true,
  assure: { include: { personne: true } },
  medecin: { include: { personne: true } },
  medecinSpecialiste: { include: { personne: true, specialite: true } },
  lignes: { include: { medicament: true } },
} satisfies Prisma.PrescriptionInclude;

async function resolveSpecialiteId(libelle: string): Promise<string> {
  const sp = await prisma.specialite.upsert({
    where: { libelle: libelle.trim() },
    update: {},
    create: { libelle: libelle.trim() },
  });
  return sp.id;
}

/** Récupère le médecin courant + sa feuille, en vérifiant qu'elle lui appartient. */
async function medecinEtFeuille(userId: string, feuilleId: string) {
  const medecin = await prisma.medecin.findUnique({ where: { utilisateurId: userId } });
  if (!medecin) throw new AppError(403, "Votre compte n'est pas rattaché à un médecin.");
  const feuille = await prisma.feuilleMaladie.findUnique({ where: { id: feuilleId } });
  if (!feuille) throw new AppError(404, 'Feuille introuvable.');
  if (feuille.medecinId !== medecin.id) throw new AppError(403, 'Cette feuille ne vous appartient pas.');
  return { medecin, feuille };
}

/** Prescrire des médicaments rattachés à une feuille (BF8). */
export async function prescrireMedicaments(input: PrescrireMedicamentsInput, userId: string) {
  const { medecin, feuille } = await medecinEtFeuille(userId, input.feuilleId);

  const ids = input.lignes.map((l) => l.medicamentId);
  const trouves = await prisma.medicamentCatalogue.count({ where: { id: { in: ids } } });
  if (trouves !== new Set(ids).size) {
    throw new AppError(422, 'Un ou plusieurs médicaments sont introuvables dans le catalogue.');
  }

  const prescription = await prisma.$transaction(async (tx) => {
    const presc = await tx.prescription.create({
      data: {
        feuilleId: feuille.id,
        assureId: feuille.assureId,
        medecinId: medecin.id,
        type: TypePrescription.MEDICAMENT,
      },
    });
    await tx.ordonnanceLigne.createMany({
      data: input.lignes.map((l) => ({
        prescriptionId: presc.id,
        medicamentId: l.medicamentId,
        posologie: l.posologie,
        duree: l.duree,
        instructions: l.instructions,
      })),
    });
    return tx.prescription.findUniqueOrThrow({ where: { id: presc.id }, include: prescInclude });
  });
  await recordAudit({ utilisateurId: userId, action: 'PRESCRIPTION_MEDICAMENTS', entite: 'Prescription', entiteId: prescription.id });
  return prescription;
}

/** Orienter vers un spécialiste (BF9) : spécialité + médecin spécialiste + niveau d'urgence. */
export async function orienter(input: OrientationInput, userId: string) {
  const { medecin, feuille } = await medecinEtFeuille(userId, input.feuilleId);
  const specialiteId = await resolveSpecialiteId(input.specialite);

  if (input.medecinSpecialisteId) {
    const spec = await prisma.medecin.findUnique({ where: { id: input.medecinSpecialisteId } });
    if (!spec) throw new AppError(404, 'Médecin spécialiste introuvable.');
    if (spec.type !== TypeMedecin.SPECIALISTE) {
      throw new AppError(422, 'Le médecin choisi doit être un spécialiste.');
    }
  }

  const prescription = await prisma.prescription.create({
    data: {
      feuilleId: feuille.id,
      assureId: feuille.assureId,
      medecinId: medecin.id,
      type: TypePrescription.ORIENTATION,
      specialiteId,
      medecinSpecialisteId: input.medecinSpecialisteId,
      niveauUrgence: input.niveauUrgence,
    },
    include: prescInclude,
  });
  await recordAudit({ utilisateurId: userId, action: 'PRESCRIPTION_ORIENTATION', entite: 'Prescription', entiteId: prescription.id });
  return prescription;
}

export async function listPrescriptions(
  params: { feuilleId?: string; skip: number; take: number },
  user: AuthUser,
) {
  const { feuilleId, skip, take } = params;
  const filters: Prisma.PrescriptionWhereInput[] = [];
  if (user.role !== Role.ASSUREUR) {
    const medecin = await prisma.medecin.findUnique({ where: { utilisateurId: user.id } });
    filters.push({ medecinId: medecin?.id ?? '00000000-0000-0000-0000-000000000000' });
  }
  if (feuilleId) filters.push({ feuilleId });
  const where: Prisma.PrescriptionWhereInput = filters.length ? { AND: filters } : {};
  const [total, items] = await prisma.$transaction([
    prisma.prescription.count({ where }),
    prisma.prescription.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: prescInclude }),
  ]);
  return { total, items };
}

export async function getPrescription(id: string) {
  const prescription = await prisma.prescription.findUnique({ where: { id }, include: prescInclude });
  if (!prescription) throw new AppError(404, 'Prescription introuvable.');
  return prescription;
}
