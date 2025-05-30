import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  IconButton, 
  Divider,
  Paper,
  Avatar,
  LinearProgress,
  useTheme,
  Chip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  MusicNote as MusicNoteIcon,
  Link as LinkIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import './Dashboard.css';

/**
 * Composant Dashboard amélioré pour l'interface d'administration
 * Intègre la nouvelle charte graphique et améliore l'expérience utilisateur
 */
const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArtists: 0,
    totalSmartLinks: 0,
    totalVisits: 0,
    totalShares: 0
  });
  
  // Données simulées pour les graphiques et statistiques
  const [recentActivity, setRecentActivity] = useState([]);
  const [topSmartLinks, setTopSmartLinks] = useState([]);
  
  // Effet pour simuler le chargement des données
  useEffect(() => {
    const fetchData = async () => {
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Données simulées
      setStats({
        totalArtists: 24,
        totalSmartLinks: 87,
        totalVisits: 12458,
        totalShares: 3721
      });
      
      setRecentActivity([
        { id: 1, type: 'artist', name: 'DJ Harmony', action: 'Nouvel artiste créé', time: '2 heures' },
        { id: 2, type: 'smartlink', name: 'Summer Vibes EP', action: 'Smart Link partagé', time: '3 heures' },
        { id: 3, type: 'visit', name: 'Midnight Dreams', action: '250 nouvelles visites', time: '5 heures' },
        { id: 4, type: 'smartlink', name: 'Acoustic Sessions', action: 'Smart Link créé', time: '1 jour' },
        { id: 5, type: 'artist', name: 'Electro Collective', action: 'Profil mis à jour', time: '1 jour' }
      ]);
      
      setTopSmartLinks([
        { id: 1, title: 'Summer Vibes EP', artist: 'DJ Harmony', visits: 4872, shares: 1245, trend: 'up' },
        { id: 2, title: 'Midnight Dreams', artist: 'Luna Project', visits: 3654, shares: 987, trend: 'up' },
        { id: 3, title: 'Acoustic Sessions', artist: 'Sarah Strings', visits: 2541, shares: 632, trend: 'down' },
        { id: 4, title: 'Urban Beats', artist: 'Metro Crew', visits: 1987, shares: 543, trend: 'up' }
      ]);
      
      setLoading(false);
    };
    
    fetchData();
  }, []);
  
  // Fonction pour rafraîchir les données
  const handleRefresh = () => {
    setLoading(true);
    // Simuler un rafraîchissement des données
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Titre de la page avec bouton de rafraîchissement */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          Dashboard
        </Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={handleRefresh}
          variant="outlined"
          color="primary"
          disabled={loading}
        >
          Actualiser
        </Button>
      </Box>
      
      {/* Indicateurs de performance clés */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total d'artistes */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[2],
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Artistes
                  </Typography>
                  {loading ? (
                    <Box sx={{ height: 40, display: 'flex', alignItems: 'center' }}>
                      <LinearProgress sx={{ width: '100%' }} />
                    </Box>
                  ) : (
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                      {stats.totalArtists}
                    </Typography>
                  )}
                </Box>
                <Avatar 
                  sx={{ 
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText
                  }}
                >
                  <MusicNoteIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Chip 
                  size="small" 
                  label="+12% ce mois" 
                  color="success"
                  sx={{ fontSize: '0.75rem' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Total de Smart Links */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[2],
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Smart Links
                  </Typography>
                  {loading ? (
                    <Box sx={{ height: 40, display: 'flex', alignItems: 'center' }}>
                      <LinearProgress sx={{ width: '100%' }} />
                    </Box>
                  ) : (
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                      {stats.totalSmartLinks}
                    </Typography>
                  )}
                </Box>
                <Avatar 
                  sx={{ 
                    bgcolor: theme.palette.secondary.light,
                    color: theme.palette.secondary.contrastText
                  }}
                >
                  <LinkIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Chip 
                  size="small" 
                  label="+8% ce mois" 
                  color="success"
                  sx={{ fontSize: '0.75rem' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Total de visites */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[2],
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Visites
                  </Typography>
                  {loading ? (
                    <Box sx={{ height: 40, display: 'flex', alignItems: 'center' }}>
                      <LinearProgress sx={{ width: '100%' }} />
                    </Box>
                  ) : (
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                      {stats.totalVisits.toLocaleString()}
                    </Typography>
                  )}
                </Box>
                <Avatar 
                  sx={{ 
                    bgcolor: theme.palette.info.light,
                    color: theme.palette.info.contrastText
                  }}
                >
                  <VisibilityIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Chip 
                  size="small" 
                  label="+23% ce mois" 
                  color="success"
                  sx={{ fontSize: '0.75rem' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Total de partages */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[2],
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Partages
                  </Typography>
                  {loading ? (
                    <Box sx={{ height: 40, display: 'flex', alignItems: 'center' }}>
                      <LinearProgress sx={{ width: '100%' }} />
                    </Box>
                  ) : (
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                      {stats.totalShares.toLocaleString()}
                    </Typography>
                  )}
                </Box>
                <Avatar 
                  sx={{ 
                    bgcolor: theme.palette.success.light,
                    color: theme.palette.success.contrastText
                  }}
                >
                  <ShareIcon />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Chip 
                  size="small" 
                  label="+15% ce mois" 
                  color="success"
                  sx={{ fontSize: '0.75rem' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Contenu principal */}
      <Grid container spacing={3}>
        {/* Smart Links les plus performants */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[2]
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                Smart Links les plus performants
              </Typography>
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            
            {loading ? (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
              </Box>
            ) : (
              <Box>
                {topSmartLinks.map((link, index) => (
                  <React.Fragment key={link.id}>
                    <Box sx={{ py: 2, display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 2, width: 40, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                          #{index + 1}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {link.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {link.artist}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                        <VisibilityIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {link.visits.toLocaleString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <ShareIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {link.shares.toLocaleString()}
                        </Typography>
                      </Box>
                      
                      {link.trend === 'up' ? (
                        <TrendingUpIcon sx={{ color: theme.palette.success.main }} />
                      ) : (
                        <TrendingDownIcon sx={{ color: theme.palette.error.main }} />
                      )}
                    </Box>
                    {index < topSmartLinks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    variant="text" 
                    color="primary"
                    sx={{ mt: 1 }}
                  >
                    Voir tous les Smart Links
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Activité récente */}
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[2]
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                Activité récente
              </Typography>
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            
            {loading ? (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
              </Box>
            ) : (
              <Box>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <Box sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          {activity.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {activity.action}
                      </Typography>
                    </Box>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    variant="text" 
                    color="primary"
                    sx={{ mt: 1 }}
                  >
                    Voir toute l'activité
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
