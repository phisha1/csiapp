import { z } from 'zod';

const matriculeRegex = /^ASS-\d{4}-\d{4}$/;

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

export const completerSchema = z.object({
  diagnostic: z.string().min(3, 'Diagnostic trop court (3 caractères min.).').optional(),
  montant: z.coerce.number().positive('Montant invalide.').optional(),
});

export const motifSchema = z.object({
  motif: z.string().optional(),
});

export type CreateFeuilleInput = z.infer<typeof createFeuilleSchema>;
export type CompleterInput = z.infer<typeof completerSchema>;
