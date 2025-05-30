import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Divider,
  LinearProgress,
  useTheme,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  DateRange as DateRangeIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  Share as ShareIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  MusicNote as MusicNoteIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import './AnalyticsPanel.css';

/**
 * Composant AnalyticsPanel amélioré pour l'interface d'administration
 * Intègre la nouvelle charte graphique et améliore l'expérience utilisateur
 */
const AnalyticsPanel = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedArtist, setSelectedArtist] = useState('all');
  const [selectedSmartLink, setSelectedSmartLink] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Données simulées pour les statistiques
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalShares: 0,
    totalClicks: 0,
    conversionRate: 0,
    platformDistribution: [],
    dailyVisits: [],
    topSmartLinks: [],
    topArtists: [],
    geographicData: []
  });
  
  // Effet pour simuler le chargement des données
  useEffect(() => {
    const fetchData = async () => {
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Données simulées
      setStats({
        totalVisits: 24563,
        totalShares: 5872,
        totalClicks: 18921,
        conversionRate: 77.03,
        platformDistribution: [
          { platform: 'Spotify', percentage: 45 },
          { platform: 'Apple Music', percentage: 25 },
          { platform: 'Deezer', percentage: 15 },
          { platform: 'YouTube Music', percentage: 10 },
          { platform: 'Autres', percentage: 5 }
        ],
        dailyVisits: [
          { date: '2025-05-01', visits: 720 },
          { date: '2025-05-02', visits: 680 },
          { date: '2025-05-03', visits: 750 },
          { date: '2025-05-04', visits: 890 },
          { date: '2025-05-05', visits: 920 },
          { date: '2025-05-06', visits: 870 },
          { date: '2025-05-07', visits: 830 },
          { date: '2025-05-08', visits: 790 },
          { date: '2025-05-09', visits: 810 },
          { date: '2025-05-10', visits: 880 },
          { date: '2025-05-11', visits: 910 },
          { date: '2025-05-12', visits: 940 },
          { date: '2025-05-13', visits: 960 },
          { date: '2025-05-14', visits: 980 },
          { date: '2025-05-15', visits: 1020 },
          { date: '2025-05-16', visits: 1050 },
          { date: '2025-05-17', visits: 1080 },
          { date: '2025-05-18', visits: 1100 },
          { date: '2025-05-19', visits: 1120 },
          { date: '2025-05-20', visits: 1150 },
          { date: '2025-05-21', visits: 1180 },
          { date: '2025-05-22', visits: 1210 },
          { date: '2025-05-23', visits: 1240 },
          { date: '2025-05-24', visits: 1270 },
          { date: '2025-05-25', visits: 1300 },
          { date: '2025-05-26', visits: 1330 },
          { date: '2025-05-27', visits: 1360 },
          { date: '2025-05-28', visits: 1390 },
          { date: '2025-05-29', visits: 1420 },
          { date: '2025-05-30', visits: 1450 }
        ],
        topSmartLinks: [
          { id: 1, title: 'Summer Vibes EP', artist: 'DJ Harmony', visits: 4872, shares: 1245 },
          { id: 2, title: 'Midnight Dreams', artist: 'Luna Project', visits: 3654, shares: 987 },
          { id: 3, title: 'Acoustic Sessions', artist: 'Sarah Strings', visits: 2541, shares: 632 },
          { id: 4, title: 'Urban Beats', artist: 'Metro Crew', visits: 1987, shares: 543 },
          { id: 5, title: 'Electronic Fusion', artist: 'Electro Collective', visits: 1654, shares: 421 }
        ],
        topArtists: [
          { id: 1, name: 'DJ Harmony', visits: 8745, smartLinks: 12 },
          { id: 2, name: 'Luna Project', visits: 6532, smartLinks: 8 },
          { id: 3, name: 'Sarah Strings', visits: 4321, smartLinks: 5 },
          { id: 4, name: 'Metro Crew', visits: 3654, smartLinks: 10 },
          { id: 5, name: 'Electro Collective', visits: 2987, smartLinks: 15 }
        ],
        geographicData: [
          { country: 'France', visits: 8745 },
          { country: 'États-Unis', visits: 5432 },
          { country: 'Allemagne', visits: 3210 },
          { country: 'Royaume-Uni', visits: 2987 },
          { country: 'Canada', visits: 1876 },
          { country: 'Espagne', visits: 1543 },
          { country: 'Italie', visits: 1321 },
          { country: 'Belgique', visits: 987 },
          { country: 'Suisse', visits: 876 },
          { country: 'Autres', visits: 3586 }
        ]
      });
      
      setLoading(false);
    };
    
    fetchData();
  }, [dateRange, selectedArtist, selectedSmartLink]);
  
  // Changement d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Changement de plage de dates
  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
    setLoading(true);
  };
  
  // Changement d'artiste
  const handleArtistChange = (event) => {
    setSelectedArtist(event.target.value);
    setLoading(true);
  };
  
  // Changement de Smart Link
  const handleSmartLinkChange = (event) => {
    setSelectedSmartLink(event.target.value);
    setLoading(true);
  };
  
  // Fonction pour rafraîchir les données
  const handleRefresh = () => {
    setLoading(true);
    // Simuler un rafraîchissement des données
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  // Fonction pour exporter les données
  const handleExport = (format) => {
    setSnackbar({
      open: true,
      message: `Données exportées au format ${format.toUpperCase()}`,
      severity: 'success'
    });
  };
  
  // Fermer le snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Rendu du contenu en fonction de l'onglet actif
  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // Vue d'ensemble
        return (
          <Grid container spacing={3}>
            {/* Indicateurs de performance clés */}
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
                        Visites totales
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
                    <Box 
                      sx={{ 
                        bgcolor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <VisibilityIcon />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      color="success.main"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      +12% par rapport à la période précédente
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
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
                    <Box 
                      sx={{ 
                        bgcolor: theme.palette.secondary.light,
                        color: theme.palette.secondary.contrastText,
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <ShareIcon />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      color="success.main"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      +8% par rapport à la période précédente
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
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
                        Clics sur plateformes
                      </Typography>
                      {loading ? (
                        <Box sx={{ height: 40, display: 'flex', alignItems: 'center' }}>
                          <LinearProgress sx={{ width: '100%' }} />
                        </Box>
                      ) : (
                        <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                          {stats.totalClicks.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                    <Box 
                      sx={{ 
                        bgcolor: theme.palette.info.light,
                        color: theme.palette.info.contrastText,
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <LinkIcon />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      color="success.main"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      +15% par rapport à la période précédente
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
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
                        Taux de conversion
                      </Typography>
                      {loading ? (
                        <Box sx={{ height: 40, display: 'flex', alignItems: 'center' }}>
                          <LinearProgress sx={{ width: '100%' }} />
                        </Box>
                      ) : (
                        <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                          {stats.conversionRate.toFixed(1)}%
                        </Typography>
                      )}
                    </Box>
                    <Box 
                      sx={{ 
                        bgcolor: theme.palette.success.light,
                        color: theme.palette.success.contrastText,
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <TimelineIcon />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      color="success.main"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      +3% par rapport à la période précédente
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Graphique des visites quotidiennes */}
            <Grid item xs={12} md={8}>
              <Paper 
                sx={{ 
                  p: 3,
                  height: '100%',
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[2]
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    Visites quotidiennes
                  </Typography>
                  <IconButton size="small" onClick={handleRefresh} disabled={loading}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                {loading ? (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress />
                  </Box>
                ) : (
                  <Box sx={{ height: 300, position: 'relative' }}>
                    {/* Emplacement pour le graphique - à implémenter avec une bibliothèque comme Chart.js ou Recharts */}
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                      }}
                    >
                      <BarChartIcon sx={{ fontSize: 60, color: theme.palette.primary.light, mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Graphique des visites quotidiennes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        (Implémentation avec Chart.js ou Recharts)
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            {/* Distribution des plateformes */}
            <Grid item xs={12} md={4}>
              <Paper 
                sx={{ 
                  p: 3,
                  height: '100%',
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[2]
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    Distribution des plateformes
                  </Typography>
                  <IconButton size="small" onClick={handleRefresh} disabled={loading}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                {loading ? (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress />
                  </Box>
                ) : (
                  <Box sx={{ height: 300, position: 'relative' }}>
                    {/* Emplacement pour le graphique - à implémenter avec une bibliothèque comme Chart.js ou Recharts */}
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                      }}
                    >
                      <PieChartIcon sx={{ fontSize: 60, color: theme.palette.secondary.light, mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Graphique de distribution des plateformes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        (Implémentation avec Chart.js ou Recharts)
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            {/* Top Smart Links */}
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 3,
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[2]
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    Top Smart Links
                  </Typography>
                  <IconButton size="small" onClick={handleRefresh} disabled={loading}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                {loading ? (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress />
                  </Box>
                ) : (
                  <Box>
                    {stats.topSmartLinks.map((link, index) => (
                      <React.Fragment key={link.id}>
                        <Box sx={{ py: 2, display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 2, width: 24, textAlign: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                              #{index + 1}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
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
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ShareIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {link.shares.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                        {index < stats.topSmartLinks.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
            
            {/* Top Artistes */}
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 3,
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[2]
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    Top Artistes
                  </Typography>
                  <IconButton size="small" onClick={handleRefresh} disabled={loading}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                {loading ? (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress />
                  </Box>
                ) : (
                  <Box>
                    {stats.topArtists.map((artist, index) => (
                      <React.Fragment key={artist.id}>
                        <Box sx={{ py: 2, display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 2, width: 24, textAlign: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                              #{index + 1}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                              {artist.name}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                            <VisibilityIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {artist.visits.toLocaleString()}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinkIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {artist.smartLinks}
                            </Typography>
                          </Box>
                        </Box>
                        {index < stats.topArtists.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        );
      
      case 1: // Smart Links
        return (
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[2]
            }}
          >
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
              Analyse des Smart Links
            </Typography>
            
            {loading ? (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
              </Box>
            ) : (
              <Box sx={{ height: 500, position: 'relative' }}>
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <BarChartIcon sx={{ fontSize: 80, color: theme.palette.primary.light, mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Analyse détaillée des Smart Links
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    (Implémentation avec des graphiques interactifs)
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        );
      
      case 2: // Artistes
        return (
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[2]
            }}
          >
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
              Analyse des artistes
            </Typography>
            
            {loading ? (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
              </Box>
            ) : (
              <Box sx={{ height: 500, position: 'relative' }}>
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <MusicNoteIcon sx={{ fontSize: 80, color: theme.palette.secondary.light, mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Analyse détaillée des artistes
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    (Implémentation avec des graphiques interactifs)
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        );
      
      case 3: // Géographie
        return (
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[2]
            }}
          >
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
              Analyse géographique
            </Typography>
            
            {loading ? (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
              </Box>
            ) : (
              <Box sx={{ height: 500, position: 'relative' }}>
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <Box 
                    component="img"
                    src="https://via.placeholder.com/600x400?text=World+Map+Visualization"
                    alt="Carte du monde"
                    sx={{ maxWidth: '80%', maxHeight: 300, mb: 2 }}
                  />
                  <Typography variant="body1" color="text.secondary">
                    Analyse géographique des visites
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    (Implémentation avec une carte interactive)
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Titre de la page */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          Analytics
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<FileDownloadIcon />}
            onClick={() => handleExport('csv')}
            sx={{ mr: 1 }}
          >
            Exporter CSV
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<FileDownloadIcon />}
            onClick={() => handleExport('pdf')}
          >
            Exporter PDF
          </Button>
        </Box>
      </Box>
      
      {/* Filtres */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[2]
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Période</InputLabel>
              <Select
                value={dateRange}
                onChange={handleDateRangeChange}
                label="Période"
                startAdornment={<DateRangeIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />}
              >
                <MenuItem value="last7days">7 derniers jours</MenuItem>
                <MenuItem value="last30days">30 derniers jours</MenuItem>
                <MenuItem value="last90days">90 derniers jours</MenuItem>
                <MenuItem value="thisMonth">Ce mois-ci</MenuItem>
                <MenuItem value="lastMonth">Mois dernier</MenuItem>
                <MenuItem value="thisYear">Cette année</MenuItem>
                <MenuItem value="custom">Personnalisé</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Artiste</InputLabel>
              <Select
                value={selectedArtist}
                onChange={handleArtistChange}
                label="Artiste"
                startAdornment={<MusicNoteIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />}
              >
                <MenuItem value="all">Tous les artistes</MenuItem>
                <MenuItem value="1">DJ Harmony</MenuItem>
                <MenuItem value="2">Luna Project</MenuItem>
                <MenuItem value="3">Sarah Strings</MenuItem>
                <MenuItem value="4">Metro Crew</MenuItem>
                <MenuItem value="5">Electro Collective</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Smart Link</InputLabel>
              <Select
                value={selectedSmartLink}
                onChange={handleSmartLinkChange}
                label="Smart Link"
                startAdornment={<LinkIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />}
              >
                <MenuItem value="all">Tous les Smart Links</MenuItem>
                <MenuItem value="1">Summer Vibes EP</MenuItem>
                <MenuItem value="2">Midnight Dreams</MenuItem>
                <MenuItem value="3">Acoustic Sessions</MenuItem>
                <MenuItem value="4">Urban Beats</MenuItem>
                <MenuItem value="5">Electronic Fusion</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button 
              variant="outlined" 
              startIcon={<FilterListIcon />}
              sx={{ mr: 1 }}
            >
              Plus de filtres
            </Button>
            <Button 
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              Actualiser
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Onglets */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Vue d'ensemble" />
          <Tab label="Smart Links" />
          <Tab label="Artistes" />
          <Tab label="Géographie" />
        </Tabs>
      </Box>
      
      {/* Contenu des onglets */}
      {renderTabContent()}
      
      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AnalyticsPanel;
