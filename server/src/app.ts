import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler, notFound } from './middlewares/errors';
import authRoutes from './modules/auth/auth.routes';

export function createApp() {
  const app = express();

  // Sécurité HTTP de base (BNF1)
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());

  // Limitation de débit globale (atténue le brute-force — BNF1)
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Trop de requêtes — réessayez plus tard.' },
    }),
  );

  // Sonde de santé
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'csi-cnam-api', time: new Date().toISOString() });
  });

  // --- Routes métier ---
  app.use('/api/auth', authRoutes);
  // (assures, medecins, feuilles… seront montées ici dans les lots suivants)

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
