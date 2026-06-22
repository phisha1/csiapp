import { z } from 'zod';

export const effectuerRemboursementSchema = z.object({
  feuilleId: z.string().min(1, 'La feuille est requise.'),
  mode: z.enum(['ESPECES', 'VIREMENT']),
  // Permet de tester le scénario d'échec de virement (rollback, BNF3).
  simulerEchec: z.boolean().optional().default(false),
});

export type EffectuerRemboursementInput = z.infer<typeof effectuerRemboursementSchema>;
