// src/App.jsx - Correction des routes admin

import React, { useState, useEffect, useRef } from 'react';
// ... autres imports ...

// Déplacer ProtectedRoute en dehors du composant App
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
  }, [location.pathname]); // Changé location.key en location.pathname

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
  // ... code existant ...

  return (
    <Router>
      <Simulator ref={simulatorRef} />
      <Routes>
        <Route path="/" element={<HomePage openSimulator={openSimulator} />} />
        <Route path="/all-reviews" element={<AllReviews />} />
        <Route path="/artists/:slug" element={<ArtistPage />} />
        <Route path="/s/:slug" element={<SmartLinkPage />} />
        <Route path="/smartlinks/:artistSlug/:trackSlug" element={<SmartLinkPage />} />
        
        {/* CORRECTION: Route login AVANT les routes protégées */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Routes admin protégées */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminPanel />} />
          <Route path="artists" element={<Outlet />}>
            <Route index element={<ArtistListPage />} />
            <Route path="new" element={<ArtistCreatePage />} />
            <Route path="edit/:slug" element={<ArtistEditPage />} />
          </Route>
          <Route path="smartlinks" element={<Outlet />}>
            <Route index element={<SmartlinkListPage />} />
            <Route path="new" element={<SmartlinkCreatePage />} />
            <Route path="create" element={<SmartlinkCreatePage />} />
            <Route path="edit/:smartlinkId" element={<SmartlinkEditPage />} />
          </Route>
          <Route path="landing-pages" element={<LandingPageGenerator />} />
          <Route path="wordpress" element={<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}><WordPressConnector /><WordPressSync /></Box>} />
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
