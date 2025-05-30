import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import './i18n';

// Point d'entrée principal qui détermine quel application charger
const path = window.location.pathname;

// Si le chemin commence par /admin, charger l'application admin
// Sinon, charger l'application publique
const isAdminRoute = path.startsWith('/admin');
const AppComponent = isAdminRoute ? React.lazy(() => import('./AdminApp')) : App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <React.Suspense fallback={<div>Chargement...</div>}>
      <AppComponent />
    </React.Suspense>
  </React.StrictMode>
);
