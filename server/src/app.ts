import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler, notFound } from './middlewares/errors';
import authRoutes from './modules/auth/auth.routes';
import medecinsRoutes from './modules/medecins/medecins.routes';
import assuresRoutes from './modules/assures/assures.routes';
import feuillesRoutes from './modules/feuilles/feuilles.routes';
import medicamentsRoutes from './modules/medicaments/medicaments.routes';
import prescriptionsRoutes from './modules/prescriptions/prescriptions.routes';
import remboursementsRoutes from './modules/remboursements/remboursements.routes';
import facturesRoutes from './modules/factures/factures.routes';
import auditRoutes from './modules/audit/audit.routes';
import consultationsRoutes from './modules/consultations/consultations.routes';
import statsRoutes from './modules/stats/stats.routes';

export function createApp() {
  const app = express();

  // Derrière le proxy de l'hébergeur (Render) en production : nécessaire pour
  // que req.ip / rate-limit fonctionnent correctement.
  if (env.NODE_ENV === 'production') app.set('trust proxy', 1);

  // Origines autorisées (CORS_ORIGIN peut lister plusieurs URLs séparées par des virgules).
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);

  // Sécurité HTTP de base (BNF1)
  app.use(helmet());
  app.use(cors({ origin: allowedOrigins, credentials: true }));
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
  app.use('/api/medecins', medecinsRoutes);
  app.use('/api/assures', assuresRoutes);
  app.use('/api/feuilles', feuillesRoutes);
  app.use('/api/medicaments', medicamentsRoutes);
  app.use('/api/prescriptions', prescriptionsRoutes);
  app.use('/api/remboursements', remboursementsRoutes);
  app.use('/api/factures', facturesRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/consultations', consultationsRoutes);
  app.use('/api/stats', statsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
