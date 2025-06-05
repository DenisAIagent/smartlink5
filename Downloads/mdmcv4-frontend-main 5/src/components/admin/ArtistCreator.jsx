import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { artistsService } from '../../services/artists.service';
import logger from '../../utils/logger';

const ArtistCreator = ({ onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genre: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
      const response = await artistsService.create(formData);
      setSuccess(true);
      logger.info('Artiste créé avec succès', { id: response.id });
      
      if (onSuccess) {
        onSuccess(response);
      }

      // Réinitialiser le formulaire
      setFormData({
        name: '',
        description: '',
        genre: '',
        imageUrl: ''
      });
    } catch (err) {
      logger.error('Erreur lors de la création de l\'artiste', { error: err });
      setError(t('errors.creationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('artists.create')}
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label={t('artists.name')}
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
                  label={t('artists.description')}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('artists.genre')}
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('artists.imageUrl')}
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {t('artists.creationSuccess')}
                  </Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !formData.name}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? t('common.creating') : t('artists.create')}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ArtistCreator; 