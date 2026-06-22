import { z } from 'zod';

export const ligneSchema = z.object({
  medicamentId: z.string().min(1, 'Médicament requis.'),
  posologie: z.string().optional(),
  duree: z.string().optional(),
  instructions: z.string().optional(),
});

export const prescrireMedicamentsSchema = z.object({
  feuilleId: z.string().min(1, 'La feuille est requise.'),
  lignes: z.array(ligneSchema).min(1, 'Au moins un médicament est requis.'),
});

export const orientationSchema = z.object({
  feuilleId: z.string().min(1, 'La feuille est requise.'),
  specialite: z.string().min(1, 'La spécialité est requise.'),
  medecinSpecialisteId: z.string().optional(),
  niveauUrgence: z.enum(['NORMAL', 'URGENT', 'TRES_URGENT']).default('NORMAL'),
});

export type PrescrireMedicamentsInput = z.infer<typeof prescrireMedicamentsSchema>;
export type OrientationInput = z.infer<typeof orientationSchema>;
