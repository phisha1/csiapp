import 'dotenv/config';
import { z } from 'zod';

/** Validation et typage des variables d'environnement (échoue tôt si invalides). */
const UNSAFE_PRODUCTION_SECRETS = [
  'change-me',
  'a-changer',
  'dev-jwt',
  'dev-encryption',
  'secret-de-test',
  'cle-de-test',
];

function isUnsafeProductionSecret(value: string) {
  const normalized = value.toLowerCase();
  return value.length < 32 || UNSAFE_PRODUCTION_SECRETS.some((part) => normalized.includes(part));
}

export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requis'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET doit faire au moins 8 caractères'),
  JWT_EXPIRES_IN: z.string().default('2h'),
  SESSION_COOKIE_MAX_AGE_SECONDS: z.coerce.number().int().min(300).max(86400).default(7200),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().int().positive().default(5),
  TEMP_PASSWORD_EXPIRES_HOURS: z.coerce.number().int().min(1).max(168).default(24),
  SHUTDOWN_TIMEOUT_SECONDS: z.coerce.number().int().min(5).max(60).default(15),
  RELEASE_SHA: z.string().trim().min(1).default('local'),
  ENCRYPTION_KEY: z
    .string()
    .min(16, 'ENCRYPTION_KEY doit faire au moins 16 caractères')
    .default('dev-encryption-key-change-me-please'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  // Plafond du rate-limit global, par IP, sur 15 min (BNF2 : doit absorber ~50 utilisateurs).
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(600),
}).superRefine((value, ctx) => {
  if (value.NODE_ENV !== 'production') return;

  if (isUnsafeProductionSecret(value.JWT_SECRET)) {
    ctx.addIssue({
      code: 'custom',
      path: ['JWT_SECRET'],
      message: 'JWT_SECRET doit être un secret de production aléatoire d’au moins 32 caractères',
    });
  }
  if (isUnsafeProductionSecret(value.ENCRYPTION_KEY)) {
    ctx.addIssue({
      code: 'custom',
      path: ['ENCRYPTION_KEY'],
      message: 'ENCRYPTION_KEY doit être une clé de production aléatoire d’au moins 32 caractères',
    });
  }
  if (value.JWT_SECRET === value.ENCRYPTION_KEY) {
    ctx.addIssue({
      code: 'custom',
      path: ['ENCRYPTION_KEY'],
      message: 'La clé de chiffrement doit être distincte du secret de session',
    });
  }
  if (value.RELEASE_SHA === 'local') {
    ctx.addIssue({
      code: 'custom',
      path: ['RELEASE_SHA'],
      message: 'RELEASE_SHA doit identifier précisément la version déployée',
    });
  }

  const origins = value.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
  if (
    origins.length === 0 ||
    origins.some((origin) => {
      try {
        return new URL(origin).protocol !== 'https:';
      } catch {
        return true;
      }
    })
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['CORS_ORIGIN'],
      message: 'Toutes les origines CORS de production doivent être des URL HTTPS valides',
    });
  }
});

const parsed = environmentSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Configuration .env invalide :', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
