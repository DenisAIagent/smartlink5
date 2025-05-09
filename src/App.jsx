// src/App.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';

// Styles Globaux (Vérifie les chemins !)
import './App.css';
import './assets/styles/global.css';
import './assets/styles/animations.css';

// --- Services & Config ---
import apiService from './services/api.service'; // Chemin vers ton instance Axios configurée
import { updateMetaTags } from './i18n'; // Assure-toi que le chemin est correct

// --- Composants UI & Layout ---
import { CircularProgress, Box, Typography } from '@mui/material';
// Vérifie tous tes chemins d'import pour les composants ci-dessous :
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Simulator from './components/features/Simulator';
import CookieBanner from './components/features/CookieBanner';

// --- Pages Publiques ---
import Hero from './components/sections/Hero'; // Assure-toi que ce composant existe et est importable
import Services from './components/sections/Services'; // Idem
import About from './components/sections/About';     // Idem
import Articles from './components/sections/Articles'; // Idem
import Reviews from './components/sections/Reviews';   // Idem
import Contact from './components/sections/Contact';   // Idem
import AllReviews from './components/pages/AllReviews'; // Idem

// --- Pages/Composants Admin ---
import AdminLogin from './components/admin/AdminLogin';     // Doit être le composant qui appelle apiService.auth.login()
import AdminPanel from './components/admin/AdminPanel';     // Dashboard principal
import ArtistListPage from './pages/admin/artists/ArtistListPage'; // Page liste artistes
import ArtistCreatePage from './pages/admin/artists/ArtistCreatePage'; // Page création artiste
import ArtistEditPage from './pages/admin/artists/ArtistEditPage';   // Page édition artiste

// --- Page Publique SmartLink (Basé sur rapport Manus.im) ---
import SmartLinkPage from './pages/public/SmartLinkPage'; // Assure-toi que ce composant existe et est importable

// === ProtectedRoute (Vérifie l'authentification via API) ===
const ProtectedRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState({
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
  });
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      if (!isMounted) return;
      setAuthStatus(prev => ({ ...prev, isLoading: true }));
      try {
        console.log("ProtectedRoute: Vérification auth via apiService.auth.getMe()...");
        const response = await apiService.auth.getMe();

        if (isMounted) {
          if (response.success && response.data) {
            console.log("ProtectedRoute: Auth check réussi", response.data);
            setAuthStatus({
              isLoading: false,
              isAuthenticated: true,
              isAdmin: response.data.role === 'admin',
            });
            if (response.data.role !== 'admin') {
              console.warn("ProtectedRoute: Utilisateur authentifié mais PAS admin.");
            }
          } else {
            console.warn("ProtectedRoute: Auth check a renvoyé success:false ou data manquante.");
            setAuthStatus({ isLoading: false, isAuthenticated: false, isAdmin: false });
          }
        }
      } catch (error) { 
        if (isMounted) {
          console.error("ProtectedRoute: Auth check API error:", error.status, error.message, error.data);
          setAuthStatus({ isLoading: false, isAuthenticated: false, isAdmin: false });
        }
      }
    };

    checkAuth();
    return () => { isMounted = false; };
  }, [location.key]); 

  if (authStatus.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Vérification de l'accès...</Typography>
      </Box>
    );
  }

  if (!authStatus.isAuthenticated || !authStatus.isAdmin) {
    console.log(`ProtectedRoute: Redirection vers /admin (login). Auth: ${authStatus.isAuthenticated}, Admin: ${authStatus.isAdmin}`);
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return children; 
};

// === Layout pour les Pages Admin ===
const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box component="nav" sx={{ width: { sm: 240 }, flexShrink: { sm: 0 }, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ p: 2 }}>Menu Admin</Typography>
        {/* TODO: Liens de navigation admin ici (ex: Dashboard, Artistes, SmartLinks) */}
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - 240px)` } }}
      >
        <Outlet /> {/* Rend les composants des sous-routes admin */}
      </Box>
    </Box>
  );
};

// === Composant pour la Page d'Accueil Publique ===
const HomePage = ({ openSimulator }) => {
  useEffect(() => {
    console.log("HomePage a été rendu !"); // Log pour vérifier si HomePage est atteint
  }, []);

  return (
    <>
      <Header /> 
      <main>
        <Hero openSimulator={openSimulator} />
        <Services />
        <About />
        <Articles />
        <Reviews />
        <Contact />
      </main>
      <Footer openSimulator={openSimulator} /> 
      <CookieBanner />
    </>
  );
};

// === Composant Principal de l'Application ===
function App() {
  const { t, i18n } = useTranslation();
  const simulatorRef = useRef(null);

  useEffect(() => {
    updateMetaTags(t); 
    const lang = i18n.language.split('-')[0];
    document.documentElement.setAttribute('lang', lang);
    const ogLocaleValue = i18n.language.replace('-', '_');
    const ogLocaleElement = document.querySelector('meta[property="og:locale"]');
    if (ogLocaleElement) {
      ogLocaleElement.setAttribute('content', ogLocaleValue);
    }
  }, [t, i18n.language]);

  const openSimulator = () => {
    if (simulatorRef.current) {
      simulatorRef.current.openSimulator(); 
    }
  };

  return (
    <Router>
      <Simulator ref={simulatorRef} /> 

      <Routes>
        {/* --- Routes Publiques --- */}
        <Route path="/" element={<HomePage openSimulator={openSimulator} />} />
        <Route path="/all-reviews" element={<AllReviews />} />
        <Route path="/admin" element={<AdminLogin />} /> {/* Page de login admin, publique */}
        <Route path="/smartlinks/:artistSlug/:trackSlug" element={<SmartLinkPage />} /> {/* Page publique SmartLink */}

        {/* --- Routes Admin Protégées --- */}
        {/* Ce groupe de routes est protégé. Le path="/admin" ici crée un contexte de chemin. */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          {/* path="dashboard" est relatif à "/admin" -> donc "/admin/dashboard" */}
          <Route path="dashboard" element={<AdminPanel />} />
          {/* La route index n'est plus nécessaire ici si AdminLogin redirige bien vers "dashboard" */}
          {/* <Route index element={<Navigate to="dashboard" replace />} /> */}
          
          <Route path="artists" element={<Outlet />}> {/* Crée un contexte pour /admin/artists */}
            <Route index element={<ArtistListPage />} /> {/* /admin/artists */}
            <Route path="new" element={<ArtistCreatePage />} /> {/* /admin/artists/new */}
            <Route path="edit/:slug" element={<ArtistEditPage />} /> {/* /admin/artists/edit/:slug */}
          </Route>

          {/* Routes Smartlinks (à créer et décommenter) */}
          {/* <Route path="smartlinks" element={<Outlet />}>
            <Route index element={<SmartlinkListPage />} />
            <Route path="new" element={<SmartlinkCreatePage />} />
            <Route path="edit/:id" element={<SmartlinkEditPage />} />
          </Route>
          */}
        </Route>

        {/* --- Route Catch-all (404 Not Found) --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
