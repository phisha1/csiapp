import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`✅ API CSI-CNAM démarrée sur http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

// Arrêt propre : on ferme la connexion à la base.
let isShuttingDown = false;
async function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n${signal} reçu — arrêt en cours…`);

  const forceExit = setTimeout(() => {
    console.error(`Arrêt forcé après ${env.SHUTDOWN_TIMEOUT_SECONDS} secondes.`);
    process.exit(1);
  }, env.SHUTDOWN_TIMEOUT_SECONDS * 1_000);
  forceExit.unref();

  server.closeIdleConnections();
  server.close(async () => {
    await prisma.$disconnect();
    clearTimeout(forceExit);
    process.exit(0);
  });
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
