import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import { usePageTransition } from '../../hooks/usePageTransition';
import { LazyLoad, LoadingFallback } from '../common/LazyLoad';
import ErrorBoundary from '../common/ErrorBoundary';
import useProtectedRoute from '../../hooks/useProtectedRoute';
import { NAV_ITEMS, ADMIN_MENU_ITEMS } from '../../config/constants';

// Importation des composants avec lazy loading
const HomePage = React.lazy(() => import('../../pages/HomePage'));
const AdminLayout = React.lazy(() => import('../../pages/admin/AdminLayout'));
const AdminLogin = React.lazy(() => import('../../pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('../../pages/admin/AdminDashboard'));
const ArtistPage = React.lazy(() => import('../../pages/ArtistPage'));
const SmartLinkPage = React.lazy(() => import('../../pages/SmartLinkPage'));
const AllReviews = React.lazy(() => import('../../pages/AllReviews'));

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useProtectedRoute();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

const AppRouter = () => {
  const { PageTransition } = usePageTransition({
    type: 'fade',
    duration: 0.3,
  });

  return (
    <HelmetProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <PageTransition>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<HomePage />} />
                <Route path="/artists/:id" element={
                  <LazyLoad>
                    <ArtistPage />
                  </LazyLoad>
                } />
                <Route path="/smartlinks/:id" element={
                  <LazyLoad>
                    <SmartLinkPage />
                  </LazyLoad>
                } />
                <Route path="/reviews" element={
                  <LazyLoad>
                    <AllReviews />
                  </LazyLoad>
                } />

                {/* Routes d'administration */}
                <Route path="/admin/login" element={
                  <LazyLoad>
                    <AdminLogin />
                  </LazyLoad>
                } />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <LazyLoad>
                        <AdminLayout />
                      </LazyLoad>
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={
                    <LazyLoad>
                      <AdminDashboard />
                    </LazyLoad>
                  } />
                  {ADMIN_MENU_ITEMS.map(({ path, label }) => (
                    <Route
                      key={path}
                      path={path.replace('/admin/', '')}
                      element={
                        <LazyLoad>
                          <Box component="div" role="main">
                            {/* Les composants seront chargés dynamiquement */}
                            <h1>{label}</h1>
                          </Box>
                        </LazyLoad>
                      }
                    />
                  ))}
                </Route>

                {/* Route 404 */}
                <Route path="*" element={
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '100vh',
                    }}
                  >
                    <h1>404 - Page non trouvée</h1>
                  </Box>
                } />
              </Routes>
            </Suspense>
          </PageTransition>
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default AppRouter; 