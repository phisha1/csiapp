import { test as teardown } from '@playwright/test';
import { loadServerEnvironment } from './load-server-env';

teardown('supprimer les données métier E2E', async () => {
  loadServerEnvironment();
  const fixtures = await import('../server/scripts/e2e-business-fixtures');
  try {
    await fixtures.cleanupE2EFixtures();
  } finally {
    await fixtures.closeE2EFixtureDatabase();
  }
});
