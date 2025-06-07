import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Autocomplete,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import axios from 'axios';

const SmartLinkForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    isrc: '',
    platforms: {
      spotify: '',
      apple: '',
      youtube: '',
      deezer: '',
      amazon: ''
    }
  });

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await axios.get('/api/v1/artists');
      setArtists(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des artistes:', err);
    }
  };

  const handleArtistSelect = (event, newValue) => {
    setSelectedArtist(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        title: newValue.name,
        description: newValue.bio || ''
      }));
    }
  };

  const handleUrlChange = async (event) => {
    const url = event.target.value;
    setFormData(prev => ({ ...prev, url }));

    if (url && url.length > 10) {
      try {
        setLoading(true);
        const response = await axios.post('/api/v1/smartlinks/fetch-platform-links', { url });
        const { artist, platforms } = response.data;

        setFormData(prev => ({
          ...prev,
          title: artist.name,
          description: artist.bio || '',
          platforms: {
            ...prev.platforms,
            ...platforms
          }
        }));

        setSelectedArtist(artist);
      } catch (err) {
        console.error('Erreur lors de l\'enrichissement:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await axios.post('/api/v1/smartlinks', {
        ...formData,
        artistId: selectedArtist?.id
      });

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        url: '',
        isrc: '',
        platforms: {
          spotify: '',
          apple: '',
          youtube: '',
          deezer: '',
          amazon: ''
        }
      });
      setSelectedArtist(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    // TODO: Ajouter une notification de succès
  };

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Créer un Smart Link
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Smart Link créé avec succès !
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Sélection d'artiste */}
              <Grid item xs={12}>
                <Autocomplete
                  options={artists}
                  getOptionLabel={(option) => option.name}
                  value={selectedArtist}
                  onChange={handleArtistSelect}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Artiste"
                      placeholder="Rechercher un artiste..."
                    />
                  )}
                />
              </Grid>

              {/* URL ou ISRC */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL ou ISRC"
                  value={formData.url}
                  onChange={handleUrlChange}
                  InputProps={{
                    endAdornment: loading && (
                      <InputAdornment position="end">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              {/* Titre et description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Titre"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={4}
                />
              </Grid>

              {/* Liens des plateformes */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Liens des plateformes
                </Typography>
              </Grid>

              {Object.entries(formData.platforms).map(([platform, url]) => (
                <Grid item xs={12} md={6} key={platform}>
                  <TextField
                    fullWidth
                    label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    value={url}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      platforms: {
                        ...prev.platforms,
                        [platform]: e.target.value
                      }
                    }))}
                    InputProps={{
                      endAdornment: url && (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleCopyLink(url)}
                            edge="end"
                          >
                            <CopyIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              ))}

              {/* Bouton de soumission */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                >
                  Créer le Smart Link
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SmartLinkForm; 