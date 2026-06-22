import { z } from 'zod';

export const createMedicamentSchema = z.object({
  code: z.string().min(1, 'Le code est obligatoire.'),
  nom: z.string().min(1, 'Le nom est obligatoire.'),
  forme: z.string().optional(),
});

export type CreateMedicamentInput = z.infer<typeof createMedicamentSchema>;
