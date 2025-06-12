import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';

const SmartLinkForm = ({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    releaseDate: '',
    genre: '',
    links: {
      spotify: '',
      appleMusic: '',
      youtube: '',
      deezer: '',
      amazonMusic: '',
      soundcloud: ''
    },
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [platform]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    
    if (!formData.artist.trim()) {
      newErrors.artist = 'L\'artiste est requis';
    }

    const hasLinks = Object.values(formData.links).some(link => link.trim());
    if (!hasLinks) {
      newErrors.links = 'Au moins un lien de streaming est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const platforms = [
    { key: 'spotify', label: 'Spotify', color: '#1DB954' },
    { key: 'appleMusic', label: 'Apple Music', color: '#FA243C' },
    { key: 'youtube', label: 'YouTube Music', color: '#FF0000' },
    { key: 'deezer', label: 'Deezer', color: '#FEAA2D' },
    { key: 'amazonMusic', label: 'Amazon Music', color: '#00A8E1' },
    { key: 'soundcloud', label: 'SoundCloud', color: '#FF3300' }
  ];

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {initialData.id ? 'Modifier le Smart Link' : 'Créer un Smart Link'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Informations générales */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Titre"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Artiste"
              value={formData.artist}
              onChange={(e) => handleChange('artist', e.target.value)}
              error={!!errors.artist}
              helperText={errors.artist}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Date de sortie"
              type="date"
              value={formData.releaseDate}
              onChange={(e) => handleChange('releaseDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Genre</InputLabel>
              <Select
                value={formData.genre}
                onChange={(e) => handleChange('genre', e.target.value)}
              >
                <MenuItem value="pop">Pop</MenuItem>
                <MenuItem value="rock">Rock</MenuItem>
                <MenuItem value="hip-hop">Hip-Hop</MenuItem>
                <MenuItem value="electronic">Electronic</MenuItem>
                <MenuItem value="jazz">Jazz</MenuItem>
                <MenuItem value="classical">Classical</MenuItem>
                <MenuItem value="other">Autre</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Liens de streaming */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Liens de streaming
            </Typography>
            {errors.links && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {errors.links}
              </Typography>
            )}
            
            <Grid container spacing={2}>
              {platforms.map((platform) => (
                <Grid item xs={12} md={6} key={platform.key}>
                  <TextField
                    fullWidth
                    label={platform.label}
                    value={formData.links[platform.key]}
                    onChange={(e) => handleLinkChange(platform.key, e.target.value)}
                    placeholder={`URL ${platform.label}`}
                    InputProps={{
                      startAdornment: (
                        <Chip 
                          size="small" 
                          label={platform.label.charAt(0)} 
                          sx={{ 
                            bgcolor: platform.color, 
                            color: 'white',
                            mr: 1 
                          }} 
                        />
                      )
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={onCancel}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={isLoading}
                sx={{ bgcolor: '#cc271a', '&:hover': { bgcolor: '#b71c0c' } }}
              >
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SmartLinkForm; 