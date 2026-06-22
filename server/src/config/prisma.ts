import { PrismaClient } from '@prisma/client';
import { env } from './env';

/** Client Prisma unique (singleton) réutilisé dans toute l'application. */
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
