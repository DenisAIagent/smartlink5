// src/App.jsx - CORRIGÉ
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { toast } from 'react-toastify';

// Services
import apiService from './services/api.service';

// Pages publiques
import HomePage from './pages/public/HomePage';
import AllReviews from './pages/public/AllReviews';
import ArtistPage from './pages/public/ArtistPage';
import SmartLinkPage from './pages/public/SmartLinkPage';

// Pages admin
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminPanel from './components/admin/AdminPanel';
import ArtistListPage from './pages/admin/artists/ArtistListPage';
import ArtistCreatePage from './pages/admin/artists/ArtistCreatePage';
import ArtistEditPage from './pages/admin/artists/ArtistEditPage';
import SmartlinkListPage from './pages/admin/smartlinks/SmartlinkListPage';
import SmartlinkCreatePage from './pages/admin/smartlinks/SmartlinkCreatePage';
import SmartlinkEditPage from './pages/admin/smartlinks/SmartlinkEditPage';

// Composants utilitaires
import LandingPageGenerator from './components/admin/LandingPageGenerator';
import WordPressConnector from './components/admin/WordPressConnector';
import WordPressSync from './components/admin/WordPressSync';
import ReviewManager from './components/admin/ReviewManager';
import CampaignStatsShowcase from './components/landing/common/CampaignStatsShowcase';
import Simulator from './components/features/Simulator';

// Composant ProtectedRoute pour les routes admin
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
          setAuthStatus({ 
            isLoading: false, 
            isAuthenticated: false, 
            isAdmin: false 
          });
        }
      } catch (error) {
        if (isMounted) {
          setAuthStatus({ 
            isLoading: false, 
            isAuthenticated: false, 
            isAdmin: false 
          });
        }
      }
    };
    
    checkAuth();
    
    return () => { 
      isMounted = false; 
    };
  }, [location.pathname]);

  if (authStatus.isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        flexDirection: 'column',
        backgroundColor: '#0d0d0d'
      }}>
        <CircularProgress sx={{ color: '#ff003c' }} />
        <Typography sx={{ mt: 2, color: '#ffffff' }}>
          Vérification de l'accès...
        </Typography>
      </Box>
    );
  }

  if (!authStatus.isAuthenticated || !authStatus.isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  // Référence pour le simulateur
  const simulatorRef = useRef();

  // Fonction pour ouvrir le simulateur
  const openSimulator = () => {
    if (simulatorRef.current) {
      simulatorRef.current.openSimulator();
    }
  };

  return (
    <Router>
      {/* Simulateur global */}
      <Simulator ref={simulatorRef} />
      
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<HomePage openSimulator={openSimulator} />} />
        <Route path="/all-reviews" element={<AllReviews />} />
        <Route path="/artists/:slug" element={<ArtistPage />} />
        <Route path="/s/:slug" element={<SmartLinkPage />} />
        <Route path="/smartlinks/:artistSlug/:trackSlug" element={<SmartLinkPage />} />
        
        {/* Route login admin - AVANT les routes protégées */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Routes admin protégées */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminPanel />} />
          
          {/* Routes artistes */}
          <Route path="artists" element={<Outlet />}>
            <Route index element={<ArtistListPage />} />
            <Route path="new" element={<ArtistCreatePage />} />
            <Route path="edit/:slug" element={<ArtistEditPage />} />
          </Route>
          
          {/* Routes smartlinks */}
          <Route path="smartlinks" element={<Outlet />}>
            <Route index element={<SmartlinkListPage />} />
            <Route path="new" element={<SmartlinkCreatePage />} />
            <Route path="create" element={<SmartlinkCreatePage />} />
            <Route path="edit/:smartlinkId" element={<SmartlinkEditPage />} />
          </Route>
          
          {/* Autres routes admin */}
          <Route path="landing-pages" element={<LandingPageGenerator />} />
          <Route 
            path="wordpress" 
            element={
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <WordPressConnector />
                <WordPressSync />
              </Box>
            } 
          />
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