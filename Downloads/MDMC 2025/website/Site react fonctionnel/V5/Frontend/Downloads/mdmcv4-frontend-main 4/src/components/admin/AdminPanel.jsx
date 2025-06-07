import React from 'react';
import { Box, Drawer, AppBar, Toolbar, Typography, IconButton, Button, Grid, Card, CardContent, useMediaQuery, Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Menu as MenuIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminPanel.css'; // Ajoutez ici les styles personnalisés inspirés du HTML fourni

const menuItems = [
  { label: 'Dashboard', icon: <i className="fas fa-chart-line" />, path: '/admin' },
  { label: 'Artistes', icon: <i className="fas fa-music" />, path: '/admin/artists' },
  { label: 'SmartLinks', icon: <i className="fas fa-link" />, path: '/admin/smartlinks' },
  { label: 'Avis & Témoignages', icon: <i className="fas fa-star" />, path: '/admin/reviews' },
  { label: 'Intégrations marketing', icon: <i className="fas fa-bullhorn" />, path: '/admin/marketing' },
  { label: 'Pages d\'atterrissage', icon: <i className="fas fa-rocket" />, path: '/admin/landing-pages' },
  { label: 'Synchronisation WordPress', icon: <i className="fab fa-wordpress" />, path: '/admin/wordpress' },
  { label: 'Paramètres', icon: <i className="fas fa-cog" />, path: '/admin/settings' },
];

const kpis = [
  {
    icon: <i className="fas fa-bullhorn" />,
    title: 'Campagnes actives',
    value: 12,
    change: '+2 depuis hier',
    positive: true
  },
  {
    icon: <i className="fas fa-music" />,
    title: 'Artistes suivis',
    value: 27,
    change: '+3 ce mois',
    positive: true
  },
  {
    icon: <i className="fas fa-mouse-pointer" />,
    title: 'Taux de clic moyen',
    value: '4.8%',
    change: '-0.2% depuis la semaine dernière',
    positive: false
  },
  {
    icon: <i className="fab fa-wordpress" />,
    title: 'Dernière synchro WordPress',
    value: '2h',
    change: 'Synchronisé',
    positive: true
  }
];

const actions = [
  {
    icon: <i className="fas fa-user-plus" />,
    title: 'Ajouter un artiste',
    description: 'Ajoutez un nouvel artiste à votre portfolio pour commencer à gérer ses campagnes publicitaires sur toutes les plateformes.',
    button: 'Nouvel artiste',
    path: '/admin/artists/create'
  },
  {
    icon: <i className="fas fa-link" />,
    title: 'Créer un SmartLink',
    description: 'Générez un lien intelligent qui dirige les fans vers toutes les plateformes de streaming musical avec des analyses détaillées.',
    button: 'Nouveau SmartLink',
    path: '/admin/smartlinks/create'
  }
];

export default function AdminPanel() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Ajoutez ici la logique de déconnexion
    navigate('/login');
  };

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'var(--black)' }}>
      {/* Mobile Header */}
      {isMobile && (
        <AppBar position="fixed" color="default" sx={{ background: 'var(--dark-gray)', boxShadow: 'none', zIndex: 1300 }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
            <Box className="logo-container" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box className="logo" />
              <Typography className="logo-text">MDMC</Typography>
            </Box>
          </Toolbar>
        </AppBar>
      )}
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            background: 'var(--dark-gray)',
            color: 'var(--white)',
            boxShadow: '5px 0 15px rgba(0,0,0,0.2)',
            borderRight: 0,
            p: 0,
            zIndex: 1200
          }
        }}
      >
        <Box className="sidebar-header" sx={{ p: 3, borderBottom: '1px solid var(--light-gray)', mb: 2 }}>
          <Box className="logo-container">
            <Box className="logo" />
            <Typography className="logo-text">MDMC MUSIC ADS</Typography>
          </Box>
        </Box>
        <Box component="ul" className="nav-menu" sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {menuItems.map((item, idx) => (
            <Fade in timeout={400 + idx * 100} key={item.label}>
              <li className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link${location.pathname === item.path ? ' active' : ''}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            </Fade>
          ))}
        </Box>
      </Drawer>
      {/* Main Content */}
      <Box className="main-content" sx={{ flex: 1, ml: { md: '280px' }, p: 3, maxWidth: { md: 'calc(100vw - 280px)' } }}>
        {/* Header */}
        <Box className="main-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pb: 2, borderBottom: '1px solid var(--light-gray)', position: 'relative' }}>
          <Typography className="page-title" variant="h4" sx={{ fontWeight: 800, fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg, #fff, #b0b0b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Dashboard
          </Typography>
          <Button className="logout-btn" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Déconnexion
          </Button>
        </Box>
        {/* Welcome Message */}
        <Box className="welcome-message" sx={{ background: 'var(--gradient-dark)', p: 3, borderRadius: 3, mb: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Poppins, sans-serif', mb: 1 }}>
            🎧 Bienvenue Denis ! Prêt à booster vos campagnes ?
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: '80%' }}>
            Votre plateforme de gestion publicitaire pour artistes sur YouTube, TikTok et Meta est prête. Consultez vos performances et lancez de nouvelles campagnes.
          </Typography>
        </Box>
        {/* KPI Cards */}
        <Grid container spacing={3} className="kpi-grid" sx={{ mb: 4 }}>
          {kpis.map((kpi, idx) => (
            <Grid item xs={12} sm={6} md={3} key={kpi.title}>
              <Card className="kpi-card" sx={{ background: 'var(--gradient-dark)', borderRadius: 3, p: 3, position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', backdropFilter: 'blur(10px)' }}>
                <CardContent>
                  <Box className="kpi-title" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--white)', opacity: 0.8, fontSize: '0.9rem', mb: 2, fontWeight: 600 }}>
                    <span className="kpi-icon" style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(244,67,54,0.2) 0%, rgba(244,67,54,0.1) 100%)', color: 'var(--red)' }}>{kpi.icon}</span>
                    {kpi.title}
                  </Box>
                  <Typography className="kpi-value" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '2rem', mb: 1, background: 'linear-gradient(to right, #fff, #b0b0b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{kpi.value}</Typography>
                  <Box className={`kpi-change${kpi.positive ? '' : ' negative'}`} sx={{ fontSize: '0.85rem', color: kpi.positive ? '#4CAF50' : 'var(--red)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {kpi.positive ? <i className="fas fa-arrow-up"></i> : <i className="fas fa-arrow-down"></i>}
                    {kpi.change}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {/* Action Cards */}
        <Grid container spacing={3} className="action-grid">
          {actions.map((action, idx) => (
            <Grid item xs={12} md={6} key={action.title}>
              <Card className="action-card" sx={{ background: 'var(--gradient-dark)', borderRadius: 3, p: 3, display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box className="action-header" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <span className="action-icon" style={{ width: 40, height: 40, borderRadius: 2, background: 'var(--gradient-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 5px 15px rgba(244,67,54,0.3)' }}>{action.icon}</span>
                    <Typography className="action-title" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.25rem', background: 'linear-gradient(135deg, #fff, #b0b0b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{action.title}</Typography>
                  </Box>
                  <Typography className="action-description" sx={{ mb: 3, fontSize: '0.95rem', opacity: 0.9, flexGrow: 1 }}>{action.description}</Typography>
                  <Button
                    className="action-button"
                    variant="contained"
                    sx={{ background: 'var(--gradient-red)', color: 'var(--white)', fontWeight: 700, py: 1.2, px: 3, borderRadius: 2, fontSize: '1rem', fontFamily: 'Outfit, sans-serif', boxShadow: '0 5px 15px rgba(244,67,54,0.3)', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', position: 'relative', zIndex: 1, overflow: 'hidden' }}
                    onClick={() => navigate(action.path)}
                  >
                    {action.button}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
} 