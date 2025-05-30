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
  Avatar,
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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MusicNote as MusicNoteIcon,
  Link as LinkIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Language as WebsiteIcon
} from '@mui/icons-material';
import './ArtistManagement.css';

/**
 * Composant ArtistManagement amélioré pour l'interface d'administration
 * Intègre la nouvelle charte graphique et améliore l'expérience utilisateur
 */
const ArtistManagement = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentArtist, setCurrentArtist] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Données simulées pour les artistes
  useEffect(() => {
    const fetchArtists = async () => {
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Données simulées
      const mockArtists = [
        { 
          id: 1, 
          name: 'DJ Harmony', 
          slug: 'dj-harmony', 
          bio: 'Producteur et DJ électro basé à Paris', 
          imageUrl: 'https://example.com/artists/dj-harmony.jpg',
          website: 'https://djharmony.com',
          socialLinks: [
            { platform: 'instagram', url: 'https://instagram.com/djharmony' },
            { platform: 'facebook', url: 'https://facebook.com/djharmony' },
            { platform: 'twitter', url: 'https://twitter.com/djharmony' }
          ],
          smartLinksCount: 12,
          status: 'active'
        },
        { 
          id: 2, 
          name: 'Luna Project', 
          slug: 'luna-project', 
          bio: 'Groupe de musique électronique ambient', 
          imageUrl: 'https://example.com/artists/luna-project.jpg',
          website: 'https://lunaproject.net',
          socialLinks: [
            { platform: 'instagram', url: 'https://instagram.com/lunaproject' },
            { platform: 'facebook', url: 'https://facebook.com/lunaproject' }
          ],
          smartLinksCount: 8,
          status: 'active'
        },
        { 
          id: 3, 
          name: 'Sarah Strings', 
          slug: 'sarah-strings', 
          bio: 'Violoniste et compositrice de musique acoustique', 
          imageUrl: 'https://example.com/artists/sarah-strings.jpg',
          website: 'https://sarahstrings.com',
          socialLinks: [
            { platform: 'instagram', url: 'https://instagram.com/sarahstrings' },
            { platform: 'twitter', url: 'https://twitter.com/sarahstrings' }
          ],
          smartLinksCount: 5,
          status: 'active'
        },
        { 
          id: 4, 
          name: 'Metro Crew', 
          slug: 'metro-crew', 
          bio: 'Collectif de hip-hop urbain', 
          imageUrl: 'https://example.com/artists/metro-crew.jpg',
          website: 'https://metrocrew.org',
          socialLinks: [
            { platform: 'instagram', url: 'https://instagram.com/metrocrew' },
            { platform: 'facebook', url: 'https://facebook.com/metrocrew' },
            { platform: 'twitter', url: 'https://twitter.com/metrocrew' }
          ],
          smartLinksCount: 10,
          status: 'active'
        },
        { 
          id: 5, 
          name: 'Electro Collective', 
          slug: 'electro-collective', 
          bio: 'Collectif de DJs et producteurs électro', 
          imageUrl: 'https://example.com/artists/electro-collective.jpg',
          website: 'https://electrocollective.com',
          socialLinks: [
            { platform: 'instagram', url: 'https://instagram.com/electrocollective' },
            { platform: 'facebook', url: 'https://facebook.com/electrocollective' }
          ],
          smartLinksCount: 15,
          status: 'active'
        },
        { 
          id: 6, 
          name: 'Jazz Quartet', 
          slug: 'jazz-quartet', 
          bio: 'Quartet de jazz contemporain', 
          imageUrl: 'https://example.com/artists/jazz-quartet.jpg',
          website: 'https://jazzquartet.com',
          socialLinks: [
            { platform: 'instagram', url: 'https://instagram.com/jazzquartet' },
            { platform: 'facebook', url: 'https://facebook.com/jazzquartet' }
          ],
          smartLinksCount: 7,
          status: 'inactive'
        }
      ];
      
      setArtists(mockArtists);
      setLoading(false);
    };
    
    fetchArtists();
  }, []);
  
  // Filtrer les artistes en fonction du terme de recherche
  const filteredArtists = artists.filter(artist => 
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.bio.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Gestion du dialogue d'ajout/édition d'artiste
  const handleOpenDialog = (artist = null) => {
    setCurrentArtist(artist);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentArtist(null);
  };
  
  // Simuler l'ajout ou la modification d'un artiste
  const handleSaveArtist = () => {
    setLoading(true);
    
    // Simuler un délai de traitement
    setTimeout(() => {
      setOpenDialog(false);
      setCurrentArtist(null);
      setLoading(false);
      
      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: currentArtist ? 'Artiste modifié avec succès' : 'Nouvel artiste ajouté avec succès',
        severity: 'success'
      });
    }, 1000);
  };
  
  // Simuler la suppression d'un artiste
  const handleDeleteArtist = (id) => {
    setLoading(true);
    
    // Simuler un délai de traitement
    setTimeout(() => {
      setLoading(false);
      
      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: 'Artiste supprimé avec succès',
        severity: 'success'
      });
    }, 1000);
  };
  
  // Fermer le snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Rendu des icônes de réseaux sociaux
  const renderSocialIcon = (platform) => {
    switch (platform) {
      case 'instagram':
        return <InstagramIcon fontSize="small" />;
      case 'facebook':
        return <FacebookIcon fontSize="small" />;
      case 'twitter':
        return <TwitterIcon fontSize="small" />;
      default:
        return null;
    }
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
          Gestion des artistes
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nouvel artiste
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
              placeholder="Rechercher un artiste..."
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
            <Button variant="outlined">
              Exporter
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tableau des artistes */}
      <Paper 
        sx={{ 
          width: '100%',
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[2],
          overflow: 'hidden'
        }}
      >
        {loading && (
          <LinearProgress sx={{ height: 4 }} />
        )}
        
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Artiste</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Site web</TableCell>
                <TableCell>Réseaux sociaux</TableCell>
                <TableCell>Smart Links</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && page === 0 ? (
                Array.from(new Array(rowsPerPage)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7} sx={{ height: 60 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%' }}>
                          <LinearProgress />
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredArtists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">Aucun artiste trouvé</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredArtists
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((artist) => (
                    <TableRow 
                      key={artist.id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: theme.palette.action.hover 
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={artist.imageUrl} 
                            alt={artist.name}
                            sx={{ 
                              mr: 2,
                              width: 40,
                              height: 40,
                              bgcolor: theme.palette.primary.light
                            }}
                          >
                            <MusicNoteIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {artist.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {artist.bio}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{artist.slug}</TableCell>
                      <TableCell>
                        {artist.website && (
                          <Tooltip title={artist.website}>
                            <IconButton 
                              size="small" 
                              href={artist.website} 
                              target="_blank"
                              aria-label="Site web"
                            >
                              <WebsiteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex' }}>
                          {artist.socialLinks.map((link, index) => (
                            <Tooltip key={index} title={link.platform}>
                              <IconButton 
                                size="small" 
                                href={link.url} 
                                target="_blank"
                                aria-label={link.platform}
                                sx={{ mr: 0.5 }}
                              >
                                {renderSocialIcon(link.platform)}
                              </IconButton>
                            </Tooltip>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinkIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                          <Typography variant="body2">
                            {artist.smartLinksCount}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={artist.status === 'active' ? 'Actif' : 'Inactif'} 
                          color={artist.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Modifier">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog(artist)}
                            aria-label="Modifier"
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteArtist(artist.id)}
                            aria-label="Supprimer"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredArtists.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>
      
      {/* Dialogue d'ajout/édition d'artiste */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentArtist ? 'Modifier un artiste' : 'Ajouter un nouvel artiste'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom de l'artiste"
                variant="outlined"
                required
                defaultValue={currentArtist?.name || ''}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Slug"
                variant="outlined"
                defaultValue={currentArtist?.slug || ''}
                margin="normal"
                helperText="Laissez vide pour générer automatiquement"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Biographie"
                variant="outlined"
                multiline
                rows={4}
                defaultValue={currentArtist?.bio || ''}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Site web"
                variant="outlined"
                defaultValue={currentArtist?.website || ''}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Réseaux sociaux
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Instagram"
                    variant="outlined"
                    defaultValue={currentArtist?.socialLinks?.find(link => link.platform === 'instagram')?.url || ''}
                    margin="normal"
                    InputProps={{
                      startAdornment: <InstagramIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Facebook"
                    variant="outlined"
                    defaultValue={currentArtist?.socialLinks?.find(link => link.platform === 'facebook')?.url || ''}
                    margin="normal"
                    InputProps={{
                      startAdornment: <FacebookIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Twitter"
                    variant="outlined"
                    defaultValue={currentArtist?.socialLinks?.find(link => link.platform === 'twitter')?.url || ''}
                    margin="normal"
                    InputProps={{
                      startAdornment: <TwitterIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />,
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>Statut</InputLabel>
                <Select
                  label="Statut"
                  defaultValue={currentArtist?.status || 'active'}
                >
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
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
            onClick={handleSaveArtist}
            disabled={loading}
          >
            {currentArtist ? 'Mettre à jour' : 'Ajouter'}
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

export default ArtistManagement;
