import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ajouter cette configuration pour inclure les fichiers JSON
  assetsInclude: ['**/*.json'],
  // Optimiser le build pour la production
  build: {
    // Assurer que les fichiers de traduction sont inclus
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
    // Éviter la minification des fichiers JSON
    commonjsOptions: {
      include: [/node_modules/, /locales/],
    }
  }
})
