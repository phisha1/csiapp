import { z } from 'zod';

const matriculeRegex = /^ASS-\d{4}-\d{4,}$/;

export const createFeuilleSchema = z.object({
  numAssure: z.string().regex(matriculeRegex, 'Format attendu : ASS-AAAA-NNNN.'),
  dateConsult: z.coerce
    .date()
    .refine((d) => d.getTime() <= Date.now(), 'La date ne peut pas être dans le futur.'),
  montant: z.coerce.number().positive('Montant invalide : saisir un nombre positif.'),
  diagnostic: z.string().min(3, 'Diagnostic trop court (3 caractères min.).'),
  motif: z.string().optional(),
  actes: z.string().optional(),
});

// La validation ne modifie ni le diagnostic ni le montant : ils appartiennent au médecin.
// Les clés inconnues sont refusées pour qu'un ancien client ne croie pas les avoir changés.
export const completerSchema = z.object({}).strict();

export const motifSchema = z.object({
  motif: z.string().optional(),
});

export type CreateFeuilleInput = z.infer<typeof createFeuilleSchema>;
