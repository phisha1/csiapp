import { z } from 'zod';

export const loginSchema = z.object({
  login: z.string().min(1, "L'identifiant est obligatoire."),
  motDePasse: z.string().min(1, 'Le mot de passe est obligatoire.'),
});

// Mot de passe fort (BNF1 : ≥ 8 caractères + complexité).
export const motDePasseFort = z
  .string()
  .min(8, 'Le mot de passe doit faire au moins 8 caractères.')
  .regex(/[A-Za-z]/, 'Le mot de passe doit contenir au moins une lettre.')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre.');

export const changePasswordSchema = z.object({
  motDePasseActuel: z.string().min(1, 'Le mot de passe actuel est obligatoire.'),
  nouveauMotDePasse: motDePasseFort,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
