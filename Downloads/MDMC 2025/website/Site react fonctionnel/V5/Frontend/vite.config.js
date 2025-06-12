// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { splitVendorChunkPlugin } from 'vite';
// 'path' n'est plus nécessaire pour cet alias spécifique
// import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    ViteImageOptimizer({
      jpg: {
        quality: 80,
      },
      png: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
    }),
    splitVendorChunkPlugin(),
  ],
  resolve: {
    alias: {
      // Tentez cette définition plus simple : '@' pointe vers '/src'
      // Ceci suppose que vite.config.js est à la racine du projet.
      '@': '/src',
    },
  },
  // Le reste de votre configuration...
  assetsInclude: ['**/*.json'],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
          utils: ['axios', 'date-fns', 'i18next'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
});
