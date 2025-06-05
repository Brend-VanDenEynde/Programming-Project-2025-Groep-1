import { defineConfig } from 'vite';

export default defineConfig({
  // Development server configuratie
  server: {
    port: 3000,
    open: true,
    // Enable history API fallback for client-side routing
    historyApiFallback: true,
  },

  // Build configuratie
  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  // Base URL voor productie
  base: '/',
});
