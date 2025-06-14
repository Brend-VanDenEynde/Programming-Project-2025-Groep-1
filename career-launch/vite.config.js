import { defineConfig } from 'vite';

export default defineConfig({
  // Development server configuratie
  server: {
    port: 3001,
    open: true,
    // Enable history API fallback for client-side routing
    historyApiFallback: true,
  },

  // Build configuratie
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Configureer assets behandeling
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Zorg ervoor dat assets goed behandeld worden
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },

  // Base URL voor productie - zorg ervoor dat dit correct is voor je hosting
  base: './',

  // Configureer public directory
  publicDir: 'public',

  // Asset behandeling
  assetsInclude: [
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.svg',
    '**/*.gif',
    '**/*.webp',
  ],
});
