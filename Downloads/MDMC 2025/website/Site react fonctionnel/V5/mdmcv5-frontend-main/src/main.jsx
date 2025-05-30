// src/main.jsx - CORRIGÉ
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Styles globaux et i18n
import './index.css';
import './i18n.js';

// Material-UI Theme
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';

// React Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// i18next - Configuration langue
import i18n from 'i18next';
i18n.changeLanguage('fr');

// Configuration Toast pour MDMC
const toastConfig = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
  style: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    border: '1px solid #333'
  }
};

// Point d'entrée principal
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
      <ToastContainer {...toastConfig} />
    </ThemeProvider>
  </React.StrictMode>
);