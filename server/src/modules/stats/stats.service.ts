import { EtatFeuille, Role, TypeMedecin, TypePrescription } from '@prisma/client';
import { prisma } from '../../config/prisma';
import type { AuthUser } from '../../lib/jwt';

const personne = { include: { personne: true } } as const;

export async function getStats(user: AuthUser) {
  return user.role === Role.ASSUREUR ? assureurStats() : medecinStats(user.id);
}

async function assureurStats() {
  const [assures, feuillesAttente, remboursements, factures, medecins, generalistes, recentFeuilles] =
    await prisma.$transaction([
      prisma.assure.count(),
      prisma.feuilleMaladie.count({
        where: { etat: { in: [EtatFeuille.TRANSMISE, EtatFeuille.EN_COURS, EtatFeuille.INCOMPLETE] } },
      }),
      prisma.remboursement.count(),
      prisma.facture.count(),
      prisma.medecin.count(),
      prisma.medecin.count({ where: { type: TypeMedecin.GENERALISTE } }),
      prisma.feuilleMaladie.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { assure: personne, medecin: personne },
      }),
    ]);
  return { role: 'assureur', assures, feuillesAttente, remboursements, factures, medecins, generalistes, recentFeuilles };
}

async function medecinStats(userId: string) {
  const medecin = await prisma.medecin.findUnique({ where: { utilisateurId: userId } });
  const medecinId = medecin?.id ?? '00000000-0000-0000-0000-000000000000';
  const [consultations, feuilles, prescriptions, orientations, recentConsultations] =
    await prisma.$transaction([
      prisma.consultation.count({ where: { medecinId } }),
      prisma.feuilleMaladie.count({ where: { medecinId } }),
      prisma.prescription.count({ where: { medecinId } }),
      prisma.prescription.count({ where: { medecinId, type: TypePrescription.ORIENTATION } }),
      prisma.consultation.findMany({
        where: { medecinId },
        take: 4,
        orderBy: { date: 'desc' },
        include: { assure: personne },
      }),
    ]);
  return { role: 'medecin', consultations, feuilles, prescriptions, orientations, recentConsultations };
}
