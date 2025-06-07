import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { smartlinksService } from '../../services/smartlinks.service';
import { artistsService } from '../../services/artists.service';
import logger from '../../utils/logger';

const SmartLinkCreator = ({ onSuccess, initialData }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platform: '',
    url: '',
    artistId: ''
  });
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const artistsData = await artistsService.getAll();
        setArtists(artistsData);
      } catch (err) {
        logger.error('Erreur lors du chargement des artistes', { error: err });
        setError(t('errors.loadingFailed'));
      }
    };

    fetchArtists();
  }, [t]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = initialData
        ? await smartlinksService.update(initialData.id, formData)
        : await smartlinksService.create(formData);

      setSuccess(true);
      logger.info(
        initialData ? 'Smartlink mis à jour avec succès' : 'Smartlink créé avec succès',
        { id: response.id }
      );

      if (onSuccess) {
        onSuccess(response);
      }

      if (!initialData) {
        // Réinitialiser le formulaire seulement si c'est une création
        setFormData({
          name: '',
          description: '',
          platform: '',
          url: '',
          artistId: ''
        });
      }
    } catch (err) {
      logger.error(
        initialData ? 'Erreur lors de la mise à jour du smartlink' : 'Erreur lors de la création du smartlink',
        { error: err }
      );
      setError(t('errors.creationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {initialData ? t('smartlinks.edit') : t('smartlinks.create')}
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label={t('smartlinks.name')}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!formData.name}
                  helperText={!formData.name ? t('validation.required') : ''}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={t('smartlinks.description')}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label={t('smartlinks.platform')}
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  error={!formData.platform}
                  helperText={!formData.platform ? t('validation.required') : ''}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label={t('smartlinks.url')}
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  error={!formData.url}
                  helperText={!formData.url ? t('validation.required') : ''}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required error={!formData.artistId}>
                  <InputLabel>{t('smartlinks.artist')}</InputLabel>
                  <Select
                    name="artistId"
                    value={formData.artistId}
                    onChange={handleChange}
                    label={t('smartlinks.artist')}
                  >
                    {artists.map(artist => (
                      <MenuItem key={artist.id} value={artist.id}>
                        {artist.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {!formData.artistId && (
                    <Typography color="error" variant="caption">
                      {t('validation.required')}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {initialData
                      ? t('smartlinks.updateSuccess')
                      : t('smartlinks.creationSuccess')}
                  </Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !formData.name || !formData.platform || !formData.url || !formData.artistId}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading
                    ? (initialData ? t('common.updating') : t('common.creating'))
                    : (initialData ? t('smartlinks.update') : t('smartlinks.create'))}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SmartLinkCreator; 