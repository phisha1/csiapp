import { test as setup } from '@playwright/test';
import { loadServerEnvironment } from './load-server-env';

setup('créer les données métier E2E isolées', async () => {
  loadServerEnvironment();
  const fixtures = await import('../server/scripts/e2e-business-fixtures');
  try {
    await fixtures.setupE2EFixtures();
  } finally {
    await fixtures.closeE2EFixtureDatabase();
  }
});
