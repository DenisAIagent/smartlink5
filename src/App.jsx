// src/App.jsx - Code complet corrigé

import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

// Imports des composants layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Imports des sections de la page d'accueil
import Hero from './components/sections/Hero';
import Services from './components/sections/Services';
import About from './components/sections/About';
import Articles from './components/sections/Articles';
import Reviews from './components/sections/Reviews';
import Contact from './components/sections/Contact';

// Imports des fonctionnalités
import Simulator from './components/features/Simulator';
import CookieBanner from './components/features/CookieBanner';

// Imports des pages publiques
import AllReviews from './components/pages/AllReviews';
import ArtistPage from './pages/public/ArtistPage';
import SmartLinkPage from './pages/public/SmartLinkPage';

// Imports des composants admin
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './components/admin/AdminLogin';
import AdminPanel from './components/admin/AdminPanel';

// Imports des pages admin - Artistes
import ArtistListPage from './pages/admin/artists/ArtistListPage';
import ArtistCreatePage from './pages/admin/artists/ArtistCreatePage';
import ArtistEditPage from './pages/admin/artists/ArtistEditPage';

// Imports des pages admin - SmartLinks
import SmartlinkListPage from './pages/admin/smartlinks/SmartlinkListPage';
import SmartlinkCreatePage from './pages/admin/smartlinks/SmartlinkCreatePage';
import SmartlinkEditPage from './pages/admin/smartlinks/SmartlinkEditPage';

// Imports des autres pages admin
import LandingPageGenerator from './components/admin/LandingPageGenerator';
import WordPressConnector from './components/admin/WordPressConnector';
import WordPressSync from './components/admin/WordPressSync';
import ReviewManager from './components/admin/ReviewManager';
import CampaignStatsShowcase from './components/landing/common/CampaignStatsShowcase';

// Services
import apiService from './services/api.service';

// CSS global
import './App.css';

// Composant pour la page d'accueil
const HomePage = ({ openSimulator }) => (
  <div className="App">
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
  </div>
);

// Composant ProtectedRoute pour protéger les routes admin
const ProtectedRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState({ 
    isLoading: true, 
    isAuthenticated: false, 
    isAdmin: false 
  });
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      if (!isMounted) return;
      try {
        const response = await apiService.auth.getMe();
        if (response.success && response.data) {
          setAuthStatus({
            isLoading: false,
            isAuthenticated: true,
            isAdmin: response.data.role === 'admin',
          });
        } else {
          setAuthStatus({ isLoading: false, isAuthenticated: false, isAdmin: false });
        }
      } catch {
        if (isMounted) setAuthStatus({ isLoading: false, isAuthenticated: false, isAdmin: false });
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, [location.pathname]);

  if (authStatus.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Vérification de l'accès...</Typography>
      </Box>
    );
  }

  if (!authStatus.isAuthenticated || !authStatus.isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const simulatorRef = useRef();

  const openSimulator = () => {
    if (simulatorRef.current) {
      simulatorRef.current.openSimulator();
    }
  };

  return (
    <Router>
      <Simulator ref={simulatorRef} />
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<HomePage openSimulator={openSimulator} />} />
        <Route path="/all-reviews" element={<AllReviews />} />
        <Route path="/artists/:slug" element={<ArtistPage />} />
        <Route path="/s/:slug" element={<SmartLinkPage />} />
        <Route path="/smartlinks/:artistSlug/:trackSlug" element={<SmartLinkPage />} />
        
        {/* Route login admin (non protégée) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Routes admin protégées */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminPanel />} />
          
          {/* Routes artistes */}
          <Route path="artists" element={<Outlet />}>
            <Route index element={<ArtistListPage />} />
            <Route path="new" element={<ArtistCreatePage />} />
            <Route path="edit/:slug" element={<ArtistEditPage />} />
          </Route>
          
          {/* Routes SmartLinks */}
          <Route path="smartlinks" element={<Outlet />}>
            <Route index element={<SmartlinkListPage />} />
            <Route path="new" element={<SmartlinkCreatePage />} />
            <Route path="create" element={<SmartlinkCreatePage />} />
            <Route path="edit/:smartlinkId" element={<SmartlinkEditPage />} />
          </Route>
          
          {/* Autres routes admin */}
          <Route path="landing-pages" element={<LandingPageGenerator />} />
          <Route path="wordpress" element={
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <WordPressConnector />
              <WordPressSync />
            </Box>
          } />
          <Route path="reviews" element={<ReviewManager />} />
          <Route path="stats" element={<CampaignStatsShowcase />} />
        </Route>
        
        {/* Route fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
