import 'dotenv/config';
import { z } from 'zod';

/** Validation et typage des variables d'environnement (échoue tôt si invalides). */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requis'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET doit faire au moins 8 caractères'),
  JWT_EXPIRES_IN: z.string().default('2h'),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().int().positive().default(5),
  AGENT_REGISTRATION_CODE: z.string().default('CNAM-AGENT-2024'),
  ENCRYPTION_KEY: z
    .string()
    .min(16, 'ENCRYPTION_KEY doit faire au moins 16 caractères')
    .default('dev-encryption-key-change-me-please'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Configuration .env invalide :', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
