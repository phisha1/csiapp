import { z } from 'zod';

export const coordBancaireSchema = z.object({
  banque: z.string().min(1, 'La banque est obligatoire.'),
  numeroCompte: z.string().min(10, 'Numéro de compte invalide (10 caractères min.).'),
  titulaire: z.string().min(1, 'Le titulaire est obligatoire.'),
});

export const createAssureSchema = z
  .object({
    // Identité : requise sauf si on lie à un médecin existant (dualité, BF3).
    nom: z.string().optional(),
    prenom: z.string().optional(),
    sexe: z.enum(['M', 'F']).optional(),
    dateNaissance: z.coerce.date().optional(),
    telephone: z.string().optional(),
    email: z.string().email('Adresse e-mail invalide.').optional(),
    matricule: z
      .string()
      .regex(/^ASS-\d{4}-\d{4}$/, 'Format attendu : ASS-AAAA-NNNN.')
      .optional(),
    numeroSecu: z.string().optional(),
    profession: z.string().optional(),
    employeur: z.string().optional(),
    groupe: z.string().optional(),
    modeRembPref: z.enum(['ESPECES', 'VIREMENT']).default('ESPECES'),
    coordBancaire: coordBancaireSchema.optional(),
    // Lier ce nouvel assuré à un médecin déjà enregistré (même personne).
    medecinId: z.string().optional(),
  })
  .refine((d) => !!d.medecinId || (!!d.nom && !!d.prenom && !!d.sexe && !!d.dateNaissance), {
    message: 'Renseignez l’identité (nom, prénom, sexe, date) ou liez à un médecin existant.',
    path: ['nom'],
  });

export const updateAssureSchema = z.object({
  telephone: z.string().optional(),
  email: z.string().email('Adresse e-mail invalide.').optional(),
  profession: z.string().optional(),
  employeur: z.string().optional(),
  groupe: z.string().optional(),
  statut: z.string().optional(),
  modeRembPref: z.enum(['ESPECES', 'VIREMENT']).optional(),
});

export const setTraitantSchema = z.object({
  medecinId: z.string().min(1, 'Le médecin est obligatoire.'),
});

export type CreateAssureInput = z.infer<typeof createAssureSchema>;
export type UpdateAssureInput = z.infer<typeof updateAssureSchema>;
