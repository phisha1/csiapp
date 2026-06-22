import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`✅ API CSI-CNAM démarrée sur http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

// Arrêt propre : on ferme la connexion à la base.
async function shutdown(signal: string) {
  console.log(`\n${signal} reçu — arrêt en cours…`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
