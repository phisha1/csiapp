import { defineConfig } from 'vitest/config';

// Configuration des tests (Vitest).
// On teste le code TypeScript directement (Vitest le compile à la volée via esbuild).
export default defineConfig({
  test: {
    environment: 'node', // pas de navigateur : c'est du back-end
    include: ['src/**/*.test.ts'], // convention : un fichier X.test.ts à côté de X.ts
    // `dotenv/config` (importé par src/config/env.ts) charge automatiquement server/.env,
    // donc les variables d'environnement sont disponibles pendant les tests.
  },
});
