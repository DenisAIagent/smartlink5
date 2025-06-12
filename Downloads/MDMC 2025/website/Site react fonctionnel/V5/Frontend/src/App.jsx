import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  NavLink
} from 'react-router-dom';

import './App.css';
import './assets/styles/global.css';
import './assets/styles/animations.css';

import apiService from './services/api.service';
import { updateMetaTags } from './i18n';

import {
  CircularProgress,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Drawer,
  Divider,
  useTheme,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LinkIcon from '@mui/icons-material/Link';
import LogoutIcon from '@mui/icons-material/Logout';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import SEO from './components/SEO';
import { LazyLoad, LoadingFallback } from './components/lazy/LazyLoad';
import * as LazyComponents from './components/lazy';
import AccessibilityTester from './components/a11y/AccessibilityTester';

const drawerWidth = 240;

const ProtectedRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState({ isLoading: true, isAuthenticated: false, isAdmin: false });
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
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await apiService.auth.logout?.();
    } catch {}
    localStorage.clear();
    navigate('/admin/login', { replace: true });
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
    { label: 'Artistes', path: '/admin/artists', icon: <PeopleIcon /> },
    { label: 'SmartLinks', path: '/admin/smartlinks', icon: <LinkIcon /> },
    { label: 'Landing Pages', path: '/admin/landing-pages', icon: <DashboardIcon /> },
    { label: 'WordPress', path: '/admin/wordpress', icon: <LinkIcon /> },
    { label: 'Avis Clients', path: '/admin/reviews', icon: <PeopleIcon /> },
    { label: 'Statistiques', path: '/admin/stats', icon: <DashboardIcon /> },
  ];

  const drawer = (
    <div>
      <Toolbar><Typography variant="h6">Menu Admin</Typography></Toolbar>
      <Divider />
      <List>
        {menuItems.map(({ label, path, icon }) => (
          <ListItemButton
            key={path}
            component={NavLink}
            to={path}
            onClick={() => setMobileOpen(false)}
            sx={{
              '&.active': {
                backgroundColor: theme.palette.primary.main,
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
              },
            }}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` } }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Panneau d'administration</Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>Déconnexion</Button>
        </Toolbar>
      </AppBar>

      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}>{drawer}</Drawer>
      <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth } }} open>{drawer}</Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

const HomePage = ({ openSimulator }) => {
  useEffect(() => { console.log("HomePage rendu"); }, []);
  return (
    <>
      <SEO
        title="MDMC Music Ads - Solutions de Marketing Musical"
        description="Solutions innovantes de marketing musical pour les artistes et les labels. Maximisez votre visibilité et votre engagement avec nos outils spécialisés."
        keywords="marketing musical, promotion artiste, solutions marketing, MDMC Music Ads"
      />
      <LazyLoad>
        <LazyComponents.Hero openSimulator={openSimulator} />
      </LazyLoad>
      <LazyLoad>
        <LazyComponents.Services />
      </LazyLoad>
      <LazyLoad>
        <LazyComponents.About />
      </LazyLoad>
      <LazyLoad>
        <LazyComponents.Articles />
      </LazyLoad>
      <LazyLoad>
        <LazyComponents.Reviews />
      </LazyLoad>
      <LazyLoad>
        <LazyComponents.Contact />
      </LazyLoad>
    </>
  );
};

function App() {
  const { t } = useTranslation();
  const simulatorRef = useRef(null);
  const openSimulator = () => simulatorRef.current?.openSimulator();
  const [showA11yTester, setShowA11yTester] = useState(process.env.NODE_ENV === 'development');

  return (
    <HelmetProvider>
      <Router>
        <div className="app">
          <Header />
          <main>
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<HomePage openSimulator={openSimulator} />} />
              <Route path="/artists/:id" element={
                <LazyLoad>
                  <LazyComponents.ArtistPage />
                </LazyLoad>
              } />
              <Route path="/smartlinks/:id" element={
                <LazyLoad>
                  <LazyComponents.SmartLinkPage />
                </LazyLoad>
              } />
              <Route path="/reviews" element={
                <LazyLoad>
                  <LazyComponents.AllReviews />
                </LazyLoad>
              } />

              {/* Routes d'administration */}
              <Route path="/admin/login" element={
                <LazyLoad>
                  <LazyComponents.AdminLogin />
                </LazyLoad>
              } />
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={
                  <LazyLoad>
                    <LazyComponents.AdminPanel />
                  </LazyLoad>
                } />
                <Route path="artists" element={
                  <LazyLoad>
                    <LazyComponents.ArtistListPage />
                  </LazyLoad>
                } />
                <Route path="artists/create" element={
                  <LazyLoad>
                    <LazyComponents.ArtistCreatePage />
                  </LazyLoad>
                } />
                <Route path="artists/:id/edit" element={
                  <LazyLoad>
                    <LazyComponents.ArtistEditPage />
                  </LazyLoad>
                } />
                <Route path="smartlinks" element={
                  <LazyLoad>
                    <LazyComponents.SmartlinkListPage />
                  </LazyLoad>
                } />
                <Route path="smartlinks/create" element={
                  <LazyLoad>
                    <LazyComponents.SmartlinkCreatePage />
                  </LazyLoad>
                } />
                <Route path="smartlinks/:id/edit" element={
                  <LazyLoad>
                    <LazyComponents.SmartlinkEditPage />
                  </LazyLoad>
                } />
                <Route path="landing-pages" element={
                  <LazyLoad>
                    <LazyComponents.LandingPageGenerator />
                  </LazyLoad>
                } />
                <Route path="wordpress" element={
                  <LazyLoad>
                    <LazyComponents.WordPressConnector />
                  </LazyLoad>
                } />
                <Route path="wordpress/sync" element={
                  <LazyLoad>
                    <LazyComponents.WordPressSync />
                  </LazyLoad>
                } />
                <Route path="reviews" element={
                  <LazyLoad>
                    <LazyComponents.ReviewManager />
                  </LazyLoad>
                } />
                <Route path="stats" element={
                  <LazyLoad>
                    <LazyComponents.CampaignStatsShowcase />
                  </LazyLoad>
                } />
              </Route>
            </Routes>
          </main>
          <Footer />
          <LazyLoad>
            <LazyComponents.Simulator ref={simulatorRef} />
          </LazyLoad>
          <LazyLoad>
            <LazyComponents.CookieBanner />
          </LazyLoad>
          {showA11yTester && <AccessibilityTester />}
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
