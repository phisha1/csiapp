import { z } from 'zod';

export const createAssureurSchema = z.object({
  login: z
    .string()
    .trim()
    .min(3, "L'identifiant doit faire au moins 3 caractères.")
    .max(100, "L'identifiant ne peut pas dépasser 100 caractères.")
    .regex(
      /^[a-zA-Z0-9._@+-]+$/,
      "L'identifiant contient des caractères non autorisés.",
    ),
});

export type CreateAssureurInput = z.infer<typeof createAssureurSchema>;
