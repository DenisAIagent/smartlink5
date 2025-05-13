// src/App.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation, NavLink } from 'react-router-dom';

import './App.css';
import './assets/styles/global.css';
import './assets/styles/animations.css';

import apiService from './services/api.service';
import { updateMetaTags } from './i18n';

import { CircularProgress, Box, Typography } from '@mui/material';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Simulator from './components/features/Simulator';
import CookieBanner from './components/features/CookieBanner';

import Hero from './components/sections/Hero';
import Services from './components/sections/Services';
import About from './components/sections/About';
import Articles from './components/sections/Articles';
import Reviews from './components/sections/Reviews';
import Contact from './components/sections/Contact';
import AllReviews from './components/pages/AllReviews';
import ArtistPage from './pages/public/ArtistPage';

import AdminLogin from './components/admin/AdminLogin';
import AdminPanel from './components/admin/AdminPanel';
import ArtistListPage from './pages/admin/artists/ArtistListPage';
import ArtistCreatePage from './pages/admin/artists/ArtistCreatePage';
import ArtistEditPage from './pages/admin/artists/ArtistEditPage';

import SmartlinkListPage from './pages/admin/smartlinks/SmartlinkListPage';
import SmartlinkCreatePage from './pages/admin/smartlinks/SmartlinkCreatePage';
import SmartlinkEditPage from './pages/admin/smartlinks/SmartlinkEditPage';

import SmartLinkPage from './pages/public/SmartLinkPage';

// === ProtectedRoute ===
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
        const response = await apiService.auth.getMe();
        if (isMounted) {
          if (response.success && response.data) {
            setAuthStatus({
              isLoading: false,
              isAuthenticated: true,
              isAdmin: response.data.role === 'admin',
            });
          } else {
            setAuthStatus({ isLoading: false, isAuthenticated: false, isAdmin: false });
          }
        }
      } catch {
        if (isMounted) {
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
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return children;
};

// === Admin Layout avec Menu ===
const AdminLayout = () => (
  <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <Box component="nav" sx={{ width: { sm: 240 }, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Menu Admin</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <NavLink to="/admin/dashboard">Dashboard</NavLink>
        <NavLink to="/admin/artists">Artistes</NavLink>
        <NavLink to="/admin/smartlinks">SmartLinks</NavLink>
      </Box>
    </Box>
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Outlet />
    </Box>
  </Box>
);

// === HomePage ===
const HomePage = ({ openSimulator }) => {
  useEffect(() => {
    console.log("HomePage a été rendu !");
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

// === App ===
function App() {
  const { t, i18n } = useTranslation();
  const simulatorRef = useRef(null);

  useEffect(() => {
    updateMetaTags(t);
    const lang = i18n.language.split('-')[0];
    document.documentElement.setAttribute('lang', lang);
    const ogLocaleValue = i18n.language.replace('-', '_');
    const ogLocaleElement = document.querySelector('meta[property="og:locale"]');
    if (ogLocaleElement) ogLocaleElement.setAttribute('content', ogLocaleValue);
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
        {/* Public */}
        <Route path="/" element={<HomePage openSimulator={openSimulator} />} />
        <Route path="/all-reviews" element={<AllReviews />} />
        <Route path="/artists/:slug" element={<ArtistPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/smartlinks/:artistSlug/:trackSlug" element={<SmartLinkPage />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminPanel />} />

          <Route path="artists" element={<Outlet />}>
            <Route index element={<ArtistListPage />} />
            <Route path="new" element={<ArtistCreatePage />} />
            <Route path="edit/:slug" element={<ArtistEditPage />} />
          </Route>

          <Route path="smartlinks" element={<Outlet />}>
            <Route index element={<SmartlinkListPage />} />
            <Route path="new" element={<SmartlinkCreatePage />} />
            <Route path="edit/:smartlinkId" element={<SmartlinkEditPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
