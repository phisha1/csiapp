import { Prisma } from '@prisma/client';

/** Données d'identité strictement nécessaires dans les écrans de soins. */
export const medicalPersonSelect = {
  nom: true,
  prenom: true,
  sexe: true,
  dateNaissance: true,
  telephone: true,
  email: true,
} satisfies Prisma.PersonneSelect;

/** Exclut numéro de sécurité sociale, emploi, banque et préférences de remboursement. */
export const medicalAssureSelect = {
  id: true,
  matricule: true,
  statut: true,
  personne: { select: medicalPersonSelect },
} satisfies Prisma.AssureSelect;

/** Exclut le lien technique vers le compte utilisateur du médecin. */
export const medicalMedecinSelect = {
  id: true,
  numOrdre: true,
  type: true,
  etablissement: true,
  personne: { select: medicalPersonSelect },
  specialite: { select: { id: true, libelle: true } },
} satisfies Prisma.MedecinSelect;
