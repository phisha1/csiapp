import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Port dédié à csiapp (5173 est utilisé par un autre projet).
    // strictPort : échoue clairement au lieu de dériver silencieusement (sinon CORS casse).
    port: 5175,
    strictPort: true,
    open: true,
  },
});
