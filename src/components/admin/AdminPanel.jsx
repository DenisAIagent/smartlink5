import React, { useState } from 'react'; // Ajout de useState
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  useTheme,
  Tabs, // Ajouté
  Tab,  // Ajouté
} from '@mui/material';
import {
  Campaign,
  Group,
  Mouse,
  Sync,
  Add,
  Link as LinkIcon,
  Logout,
  Dashboard as DashboardIcon, // Ajouté
  ListAlt as ListIcon, // Ajouté pour les listes
} from '@mui/icons-material';

// Importer les composants de page nécessaires
import SmartlinkListPage from '@/pages/admin/smartlinks/SmartlinkListPage';
import ArtistListPage from '@/pages/admin/artists/ArtistListPage'; // Supposons que ce composant existe
import SmartlinkCreatePage from '@/pages/admin/smartlinks/SmartlinkCreatePage';
import SmartlinkEditPage from '@/pages/admin/smartlinks/SmartlinkEditPage';
import ArtistCreatePage from '@/pages/admin/artists/ArtistCreatePage';
import ArtistEditPage from '@/pages/admin/artists/ArtistEditPage';

const AdminPanel = () => {
  const theme = useTheme();
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'smartlinks', 'artists', 'createSmartlink', 'editSmartlink/:id', 'createArtist', 'editArtist/:id'
  const [editingId, setEditingId] = useState(null); // Pour stocker l'ID de l'élément à éditer

  const handleNavigate = (view, id = null) => {
    setCurrentView(view);
    setEditingId(id);
  };

  const renderView = () => {
    switch (currentView) {
      case 'smartlinks':
        return <SmartlinkListPage onNavigateToCreate={() => handleNavigate('createSmartlink')} onNavigateToEdit={(id) => handleNavigate('editSmartlink', id)} />;
      case 'artists':
        // Supposons une ArtistListPage similaire
        return <ArtistListPage onNavigateToCreate={() => handleNavigate('createArtist')} onNavigateToEdit={(id) => handleNavigate('editArtist', id)} />;
      case 'createSmartlink':
        return <SmartlinkCreatePage onFormSubmitSuccess={() => handleNavigate('smartlinks')} />;
      case 'editSmartlink':
        return <SmartlinkEditPage smartlinkId={editingId} onFormSubmitSuccess={() => handleNavigate('smartlinks')} />;
      case 'createArtist':
        return <ArtistCreatePage onSuccessInModal={() => handleNavigate('artists')} />;
      case 'editArtist':
        return <ArtistEditPage artistId={editingId} onSuccess={() => handleNavigate('artists')} />;
      case 'dashboard':
      default:
        return (
          <>
            {/* Welcome Box */}
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mb: 4,
                background: theme.palette.background.paper,
                borderLeft: `6px solid ${theme.palette.primary.main}`,
              }}
            >
              <Typography variant="h6" fontWeight={700} gutterBottom>
                🎧 Bienvenue Denis ! Prêt à booster vos campagnes ?
              </Typography>
              <Typography>
                Votre plateforme de gestion publicitaire pour artistes sur YouTube, TikTok et Meta est prête. Consultez vos performances et lancez de nouvelles campagnes.
              </Typography>
            </Paper>

            {/* KPI Grid */}
            <Grid container spacing={3} mb={4}>
              {[
                { icon: <Campaign />, label: 'Campagnes actives', value: '12', change: '+2 depuis hier', color: 'success' },
                { icon: <Group />, label: 'Artistes suivis', value: '27', change: '+3 ce mois', color: 'success' },
                { icon: <Mouse />, label: 'Taux de clic moyen', value: '4.8%', change: '-0.2% semaine', color: 'error' },
                { icon: <Sync />, label: 'Dernière synchro WP', value: '2h', change: 'Synchronisé', color: 'success' },
              ].map((kpi, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Box
                        sx={{
                          mr: 1,
                          p: 1,
                          backgroundColor: `${theme.palette.primary.light}22`,
                          borderRadius: '50%',
                          color: theme.palette.primary.main,
                        }}
                      >
                        {kpi.icon}
                      </Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {kpi.label}
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={800} gutterBottom>
                      {kpi.value}
                    </Typography>
                    <Typography color={kpi.color === 'success' ? 'success.main' : 'error.main'} fontSize={14}>
                      {kpi.change}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Actions Grid */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Box sx={{ mr: 2, background: theme.palette.primary.main, p: 1, borderRadius: 1, color: 'white' }}>
                        <Group />
                      </Box>
                      <Typography variant="h6" fontWeight={700}>Gérer les Artistes</Typography>
                    </Box>
                    <Typography mb={2}>Consultez, ajoutez ou modifiez les artistes de votre portfolio.</Typography>
                  </Box>
                  <Button variant="contained" fullWidth color="primary" sx={{ fontWeight: 700 }} onClick={() => handleNavigate('artists')}>
                    Voir les Artistes
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Box sx={{ mr: 2, background: theme.palette.primary.main, p: 1, borderRadius: 1, color: 'white' }}>
                        <LinkIcon />
                      </Box>
                      <Typography variant="h6" fontWeight={700}>Gérer les SmartLinks</Typography>
                    </Box>
                    <Typography mb={2}>Consultez, générez ou modifiez les liens intelligents pour vos artistes.</Typography>
                  </Box>
                  <Button variant="contained" fullWidth color="primary" sx={{ fontWeight: 700 }} onClick={() => handleNavigate('smartlinks')}>
                    Voir les SmartLinks
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </>
        );
    }
  };

  return (
    <Box sx={{p: {xs: 1, sm: 2, md: 3}}}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary">
          Panneau d'Administration
        </Typography>
        <Button variant="outlined" color="error" startIcon={<Logout />} sx={{ borderRadius: 99 }}>
          Déconnexion
        </Button>
      </Box>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentView.split('/')[0]} onChange={(event, newValue) => handleNavigate(newValue)} aria-label="admin navigation tabs">
          <Tab label="Dashboard" value="dashboard" icon={<DashboardIcon />} iconPosition="start" />
          <Tab label="SmartLinks" value="smartlinks" icon={<LinkIcon />} iconPosition="start" />
          <Tab label="Artistes" value="artists" icon={<Group />} iconPosition="start" />
          {/* Les vues de création/édition ne sont pas des onglets directs mais sont accessibles via les listes */}
        </Tabs>
      </Box>

      {/* Content Area */}
      {renderView()}
    </Box>
  );
};

export default AdminPanel;
