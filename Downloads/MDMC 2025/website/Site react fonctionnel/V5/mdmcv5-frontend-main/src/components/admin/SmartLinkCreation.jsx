import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  useTheme,
  Tooltip,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Link as LinkIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  QrCode as QrCodeIcon,
  ContentCopy as CopyIcon,
  BarChart as BarChartIcon,
  MusicNote as MusicNoteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import './SmartLinkCreation.css';

/**
 * Composant SmartLinkCreation amélioré pour l'interface d'administration
 * Intègre la nouvelle charte graphique et améliore l'expérience utilisateur
 */
const SmartLinkCreation = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [smartLinks, setSmartLinks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSmartLink, setCurrentSmartLink] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Données simulées pour les Smart Links
  useEffect(() => {
    const fetchSmartLinks = async () => {
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Données simulées
      const mockSmartLinks = [
        { 
          id: 1, 
          title: 'Summer Vibes EP', 
          slug: 'summer-vibes-ep', 
          artist: 'DJ Harmony',
          artistId: 1,
          releaseDate: '2025-04-15',
          coverImageUrl: 'https://example.com/covers/summer-vibes.jpg',
          platforms: [
            { name: 'Spotify', url: 'https://spotify.com/summer-vibes' },
            { name: 'Apple Music', url: 'https://apple.music.com/summer-vibes' },
            { name: 'Deezer', url: 'https://deezer.com/summer-vibes' },
            { name: 'YouTube Music', url: 'https://youtube.music.com/summer-vibes' }
          ],
          visits: 4872,
          shares: 1245,
          status: 'published',
          createdAt: '2025-04-10'
        },
        { 
          id: 2, 
          title: 'Midnight Dreams', 
          slug: 'midnight-dreams', 
          artist: 'Luna Project',
          artistId: 2,
          releaseDate: '2025-03-22',
          coverImageUrl: 'https://example.com/covers/midnight-dreams.jpg',
          platforms: [
            { name: 'Spotify', url: 'https://spotify.com/midnight-dreams' },
            { name: 'Apple Music', url: 'https://apple.music.com/midnight-dreams' },
            { name: 'Deezer', url: 'https://deezer.com/midnight-dreams' }
          ],
          visits: 3654,
          shares: 987,
          status: 'published',
          createdAt: '2025-03-15'
        },
        { 
          id: 3, 
          title: 'Acoustic Sessions', 
          slug: 'acoustic-sessions', 
          artist: 'Sarah Strings',
          artistId: 3,
          releaseDate: '2025-05-10',
          coverImageUrl: 'https://example.com/covers/acoustic-sessions.jpg',
          platforms: [
            { name: 'Spotify', url: 'https://spotify.com/acoustic-sessions' },
            { name: 'Apple Music', url: 'https://apple.music.com/acoustic-sessions' },
            { name: 'YouTube Music', url: 'https://youtube.music.com/acoustic-sessions' }
          ],
          visits: 2541,
          shares: 632,
          status: 'published',
          createdAt: '2025-05-01'
        },
        { 
          id: 4, 
          title: 'Urban Beats', 
          slug: 'urban-beats', 
          artist: 'Metro Crew',
          artistId: 4,
          releaseDate: '2025-02-28',
          coverImageUrl: 'https://example.com/covers/urban-beats.jpg',
          platforms: [
            { name: 'Spotify', url: 'https://spotify.com/urban-beats' },
            { name: 'Apple Music', url: 'https://apple.music.com/urban-beats' },
            { name: 'Deezer', url: 'https://deezer.com/urban-beats' },
            { name: 'SoundCloud', url: 'https://soundcloud.com/urban-beats' }
          ],
          visits: 1987,
          shares: 543,
          status: 'published',
          createdAt: '2025-02-20'
        },
        { 
          id: 5, 
          title: 'Electronic Fusion', 
          slug: 'electronic-fusion', 
          artist: 'Electro Collective',
          artistId: 5,
          releaseDate: '2025-06-15',
          coverImageUrl: 'https://example.com/covers/electronic-fusion.jpg',
          platforms: [
            { name: 'Spotify', url: 'https://spotify.com/electronic-fusion' },
            { name: 'Apple Music', url: 'https://apple.music.com/electronic-fusion' }
          ],
          visits: 0,
          shares: 0,
          status: 'draft',
          createdAt: '2025-05-25'
        }
      ];
      
      setSmartLinks(mockSmartLinks);
      setLoading(false);
    };
    
    fetchSmartLinks();
  }, []);
  
  // Filtrer les Smart Links en fonction du terme de recherche et de l'onglet actif
  const filteredSmartLinks = smartLinks.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.artist.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (tabValue === 0) {
      return matchesSearch;
    } else if (tabValue === 1) {
      return matchesSearch && link.status === 'published';
    } else if (tabValue === 2) {
      return matchesSearch && link.status === 'draft';
    }
    
    return matchesSearch;
  });
  
  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Changement d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };
  
  // Gestion du dialogue d'ajout/édition de Smart Link
  const handleOpenDialog = (smartLink = null) => {
    setCurrentSmartLink(smartLink);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentSmartLink(null);
  };
  
  // Simuler l'ajout ou la modification d'un Smart Link
  const handleSaveSmartLink = () => {
    setLoading(true);
    
    // Simuler un délai de traitement
    setTimeout(() => {
      setOpenDialog(false);
      setCurrentSmartLink(null);
      setLoading(false);
      
      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: currentSmartLink ? 'Smart Link modifié avec succès' : 'Nouveau Smart Link créé avec succès',
        severity: 'success'
      });
    }, 1000);
  };
  
  // Simuler la suppression d'un Smart Link
  const handleDeleteSmartLink = (id) => {
    setLoading(true);
    
    // Simuler un délai de traitement
    setTimeout(() => {
      setLoading(false);
      
      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: 'Smart Link supprimé avec succès',
        severity: 'success'
      });
    }, 1000);
  };
  
  // Simuler la copie d'un lien
  const handleCopyLink = (slug) => {
    // Simuler la copie dans le presse-papier
    navigator.clipboard.writeText(`https://mdmc.com/${slug}`).then(() => {
      setSnackbar({
        open: true,
        message: 'Lien copié dans le presse-papier',
        severity: 'success'
      });
    });
  };
  
  // Fermer le snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Titre de la page avec bouton d'ajout */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          Smart Links
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nouveau Smart Link
        </Button>
      </Box>
      
      {/* Barre de recherche et filtres */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[2]
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher un Smart Link..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />,
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button 
              variant="outlined" 
              startIcon={<FilterListIcon />}
              sx={{ mr: 1 }}
            >
              Filtres
            </Button>
            <Button 
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1000);
              }}
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
          <Tab label="Tous" />
          <Tab label="Publiés" />
          <Tab label="Brouillons" />
        </Tabs>
      </Box>
      
      {/* Vue en grille pour les Smart Links */}
      <Box sx={{ mb: 3 }}>
        {loading ? (
          <LinearProgress sx={{ mb: 2 }} />
        ) : filteredSmartLinks.length === 0 ? (
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[2]
            }}
          >
            <Typography variant="h6" gutterBottom>
              Aucun Smart Link trouvé
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Créez un nouveau Smart Link ou modifiez vos critères de recherche.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Créer un Smart Link
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredSmartLinks
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((link) => (
                <Grid item xs={12} sm={6} md={4} key={link.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: theme.shape.borderRadius,
                      boxShadow: theme.shadows[2],
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: 'relative',
                        paddingTop: '100%',
                        backgroundColor: theme.palette.grey[200]
                      }}
                    >
                      <Box
                        component="img"
                        src={link.coverImageUrl}
                        alt={link.title}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300?text=Cover';
                        }}
                      />
                      {link.status === 'draft' && (
                        <Chip
                          label="Brouillon"
                          color="default"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            color: '#fff'
                          }}
                        />
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {link.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {link.artist}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <VisibilityIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 0.5 }} />
                          <Typography variant="body2">
                            {link.visits.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ShareIcon fontSize="small" sx={{ color: theme.palette.text.secondary, mr: 0.5 }} />
                          <Typography variant="body2">
                            {link.shares.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Plateformes: {link.platforms.length}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {link.platforms.slice(0, 3).map((platform, index) => (
                            <Chip
                              key={index}
                              label={platform.name}
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                          {link.platforms.length > 3 && (
                            <Chip
                              label={`+${link.platforms.length - 3}`}
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Tooltip title="Copier le lien">
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopyLink(link.slug)}
                          aria-label="Copier le lien"
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Code QR">
                        <IconButton 
                          size="small" 
                          aria-label="Code QR"
                        >
                          <QrCodeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Statistiques">
                        <IconButton 
                          size="small" 
                          aria-label="Statistiques"
                        >
                          <BarChartIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Box sx={{ flexGrow: 1 }} />
                      <Tooltip title="Modifier">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(link)}
                          aria-label="Modifier"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteSmartLink(link.id)}
                          aria-label="Supprimer"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}
        
        {/* Pagination */}
        {filteredSmartLinks.length > 0 && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <TablePagination
              component="div"
              count={filteredSmartLinks.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[6, 12, 24]}
              labelRowsPerPage="Par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </Box>
        )}
      </Box>
      
      {/* Dialogue d'ajout/édition de Smart Link */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentSmartLink ? 'Modifier un Smart Link' : 'Créer un nouveau Smart Link'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Titre"
                variant="outlined"
                required
                defaultValue={currentSmartLink?.title || ''}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Slug"
                variant="outlined"
                defaultValue={currentSmartLink?.slug || ''}
                margin="normal"
                helperText="Laissez vide pour générer automatiquement"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>Artiste</InputLabel>
                <Select
                  label="Artiste"
                  defaultValue={currentSmartLink?.artistId || ''}
                >
                  <MenuItem value={1}>DJ Harmony</MenuItem>
                  <MenuItem value={2}>Luna Project</MenuItem>
                  <MenuItem value={3}>Sarah Strings</MenuItem>
                  <MenuItem value={4}>Metro Crew</MenuItem>
                  <MenuItem value={5}>Electro Collective</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de sortie"
                type="date"
                variant="outlined"
                defaultValue={currentSmartLink?.releaseDate || ''}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Plateformes
              </Typography>
              
              {/* Plateformes existantes */}
              {currentSmartLink?.platforms && currentSmartLink.platforms.map((platform, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Plateforme"
                      variant="outlined"
                      defaultValue={platform.name}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={7}>
                    <TextField
                      fullWidth
                      label="URL"
                      variant="outlined"
                      defaultValue={platform.url}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton color="error" size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              
              {/* Nouvelle plateforme */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Plateforme"
                    variant="outlined"
                    placeholder="Spotify, Apple Music, etc."
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={7}>
                  <TextField
                    fullWidth
                    label="URL"
                    variant="outlined"
                    placeholder="https://..."
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton color="primary" size="small">
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>Statut</InputLabel>
                <Select
                  label="Statut"
                  defaultValue={currentSmartLink?.status || 'draft'}
                >
                  <MenuItem value="draft">Brouillon</MenuItem>
                  <MenuItem value="published">Publié</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveSmartLink}
            disabled={loading}
          >
            {currentSmartLink ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default SmartLinkCreation;
