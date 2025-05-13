import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Campaign,
  Group,
  Mouse,
  Sync,
  Add,
  Link as LinkIcon,
  Logout,
} from '@mui/icons-material';

const AdminPanel = () => {
  const theme = useTheme();

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight={800} color="primary">
          Dashboard
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          sx={{ borderRadius: 99 }}
        >
          Déconnexion
        </Button>
      </Box>

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
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Box
                sx={{
                  mr: 2,
                  background: theme.palette.primary.main,
                  p: 1,
                  borderRadius: 1,
                  color: 'white',
                }}
              >
                <Add />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                Ajouter un artiste
              </Typography>
            </Box>
            <Typography mb={2}>
              Ajoutez un nouvel artiste à votre portfolio pour commencer à gérer ses campagnes publicitaires sur toutes les plateformes.
            </Typography>
            <Button variant="contained" fullWidth color="primary" sx={{ fontWeight: 700 }}>
              Nouvel artiste
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Box
                sx={{
                  mr: 2,
                  background: theme.palette.primary.main,
                  p: 1,
                  borderRadius: 1,
                  color: 'white',
                }}
              >
                <LinkIcon />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                Créer un SmartLink
              </Typography>
            </Box>
            <Typography mb={2}>
              Générez un lien intelligent qui dirige les fans vers toutes les plateformes de streaming musical avec des analyses détaillées.
            </Typography>
            <Button variant="contained" fullWidth color="primary" sx={{ fontWeight: 700 }}>
              Nouveau SmartLink
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminPanel;
