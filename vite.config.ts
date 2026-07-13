import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const variables = loadEnv(mode, process.cwd(), '');
  if (mode === 'production') {
    const apiUrl = variables.VITE_API_URL;
    if (!apiUrl) {
      throw new Error('VITE_API_URL est obligatoire pour un build de production.');
    }
    const parsed = new URL(apiUrl);
    if (parsed.protocol !== 'https:' || !parsed.pathname.replace(/\/$/, '').endsWith('/api')) {
      throw new Error('VITE_API_URL doit être une URL HTTPS se terminant par /api.');
    }
  }

  return {
    plugins: [react()],
    server: {
      // Port dédié à csiapp (5173 est utilisé par un autre projet).
      // strictPort : échoue clairement au lieu de dériver silencieusement (sinon CORS casse).
      port: 5175,
      strictPort: true,
      open: true,
    },
  };
});
