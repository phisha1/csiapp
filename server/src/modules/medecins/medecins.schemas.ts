import { z } from 'zod';

export const createMedecinSchema = z
  .object({
    nom: z.string().min(1, 'Le nom est obligatoire.'),
    prenom: z.string().min(1, 'Le prénom est obligatoire.'),
    sexe: z.enum(['M', 'F']).optional(),
    dateNaissance: z.coerce.date().optional(),
    telephone: z.string().optional(),
    email: z.string().email('Adresse e-mail invalide.').optional(),
    numOrdre: z.string().regex(/^CM-MED-\d{3,}$/i, 'Format attendu : CM-MED-001.'),
    type: z.enum(['GENERALISTE', 'SPECIALISTE']),
    specialite: z.string().optional(),
    etablissement: z.string().optional(),
    login: z.string().min(3, "L'identifiant doit faire au moins 3 caractères."),
    motDePasse: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères.'),
  })
  .refine((d) => d.type !== 'SPECIALISTE' || !!d.specialite?.trim(), {
    message: 'La spécialité est requise pour un spécialiste.',
    path: ['specialite'],
  });

export const updateMedecinSchema = z.object({
  telephone: z.string().optional(),
  email: z.string().email('Adresse e-mail invalide.').optional(),
  etablissement: z.string().optional(),
  specialite: z.string().optional(),
});

export type CreateMedecinInput = z.infer<typeof createMedecinSchema>;
export type UpdateMedecinInput = z.infer<typeof updateMedecinSchema>;
