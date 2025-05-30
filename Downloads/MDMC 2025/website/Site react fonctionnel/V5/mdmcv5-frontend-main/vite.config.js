// vite.config.js - CORRIGÉ
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Alias pour les imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@services': resolve(__dirname, 'src/services'),
      '@features': resolve(__dirname, 'src/features'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },

  // Configuration du serveur de développement
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true
  },

  // Configuration de build
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les vendeurs pour un meilleur cache
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'utils-vendor': ['axios', 'react-toastify', 'react-i18next']
        }
      }
    },
    // Optimisation des assets
    assetsInlineLimit: 4096,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  // Configuration pour les variables d'environnement
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  },

  // Configuration pour le preview
  preview: {
    port: 4173,
    host: true,
    open: true
  },

  // Optimisation des dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'react-hook-form',
      'axios',
      'react-toastify'
    ]
  }
});