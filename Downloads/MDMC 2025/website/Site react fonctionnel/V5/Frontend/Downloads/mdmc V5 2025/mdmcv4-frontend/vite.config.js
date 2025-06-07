// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// 'path' n'est plus nécessaire pour cet alias spécifique
// import path from 'path';

export default defineConfig({
  plugins: [react()],
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
      input: {
        main: './index.html',
      },
    },
    commonjsOptions: {
      include: [/node_modules/, /locales/],
    }
  }
});
