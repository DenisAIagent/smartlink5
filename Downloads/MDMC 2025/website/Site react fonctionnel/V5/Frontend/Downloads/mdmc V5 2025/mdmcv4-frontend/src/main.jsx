// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Votre composant App principal

// Styles globaux et i18n
import './index.css'; // Vos styles CSS globaux existants
import './i18n.js'; // Votre configuration i18next

// Importations pour Material-UI Theme
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme'; // Assurez-vous que ce chemin mène à votre fichier theme.js créé à l'étape précédente

// Importations pour React Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Styles pour les notifications toast

// Forcer la langue française directement (votre code existant)
import i18n from 'i18next';
i18n.changeLanguage('fr');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalise les styles et applique les couleurs de fond du thème */}
      <App /> {/* Votre application principale */}
      <ToastContainer
        position="bottom-right" // Position préférée pour les toasts
        autoClose={5000} // Fermeture automatique après 5 secondes
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // Options: "light", "dark", "colored"
      />
    </ThemeProvider>
  </React.StrictMode>
);
