import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Preview as PreviewIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import axios from 'axios';

const TEMPLATE_TYPES = {
  music: {
    name: 'Plateformes de streaming',
    fields: ['backgroundImage', 'title', 'description', 'ctaButton', 'platforms']
  },
  event: {
    name: 'Événement',
    fields: ['backgroundImage', 'title', 'description', 'schedule', 'registrationForm']
  },
  default: {
    name: 'Page de service',
    fields: ['backgroundImage', 'title', 'description', 'features', 'ctaButton']
  }
};

const LandingPageGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [templateType, setTemplateType] = useState('music');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    backgroundImage: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ctaButton: {
      text: '',
      link: '',
      color: '#000000'
    },
    platforms: [],
    schedule: [],
    features: [],
    registrationForm: {
      enabled: false,
      fields: []
    }
  });

  const theme = useTheme();

  const handleTemplateChange = (event) => {
    const newType = event.target.value;
    setTemplateType(newType);
    // Réinitialiser les champs spécifiques au template
    setFormData(prev => ({
      ...prev,
      platforms: newType === 'music' ? [] : prev.platforms,
      schedule: newType === 'event' ? [] : prev.schedule,
      features: newType === 'default' ? [] : prev.features
    }));
  };

  const handleAddItem = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], { id: Date.now(), value: '' }]
    }));
  };

  const handleRemoveItem = (type, id) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== id)
    }));
  };

  const handleItemChange = (type, id, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map(item =>
        item.id === id ? { ...item, value } : item
      )
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await axios.post('/api/v1/landing-pages', {
        ...formData,
        templateType
      });
      // TODO: Ajouter une notification de succès
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      // TODO: Ajouter une notification d'erreur
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'background.paper',
          zIndex: 1000,
          p: 3,
          overflow: 'auto'
        }}
      >
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h5">Aperçu</Typography>
          <Button
            variant="outlined"
            onClick={() => setPreviewMode(false)}
            startIcon={<PreviewIcon />}
          >
            Retour à l'édition
          </Button>
        </Box>
        <Box
          sx={{
            backgroundImage: `url(${formData.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            p: 4
          }}
        >
          <Typography variant="h2" gutterBottom>
            {formData.title}
          </Typography>
          <Typography variant="body1" paragraph>
            {formData.description}
          </Typography>
          {/* Rendu conditionnel selon le type de template */}
          {templateType === 'music' && (
            <Box>
              {formData.platforms.map(platform => (
                <Button
                  key={platform.id}
                  variant="contained"
                  sx={{ m: 1 }}
                >
                  {platform.value}
                </Button>
              ))}
            </Box>
          )}
          {templateType === 'event' && (
            <Box>
              {formData.schedule.map(item => (
                <Box key={item.id} mb={2}>
                  <Typography variant="h6">{item.value}</Typography>
                </Box>
              ))}
            </Box>
          )}
          {templateType === 'default' && (
            <Box>
              {formData.features.map(feature => (
                <Box key={feature.id} mb={2}>
                  <Typography variant="h6">{feature.value}</Typography>
                </Box>
              ))}
            </Box>
          )}
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3 }}
            href={formData.ctaButton.link}
          >
            {formData.ctaButton.text}
          </Button>
        </Box>
      </Box>
    );
  };

  if (previewMode) {
    return renderPreview();
  }

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">
              Créer une Landing Page
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setPreviewMode(true)}
              startIcon={<PreviewIcon />}
            >
              Aperçu
            </Button>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Type de template */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Type de template</InputLabel>
                  <Select
                    value={templateType}
                    onChange={handleTemplateChange}
                    label="Type de template"
                  >
                    {Object.entries(TEMPLATE_TYPES).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Champs de base */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image de fond"
                  value={formData.backgroundImage}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    backgroundImage: e.target.value
                  }))}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Titre"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  multiline
                  rows={4}
                />
              </Grid>

              {/* Métadonnées */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Métadonnées
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meta Title"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metaTitle: e.target.value
                  }))}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meta Description"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metaDescription: e.target.value
                  }))}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meta Keywords"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metaKeywords: e.target.value
                  }))}
                />
              </Grid>

              {/* CTA Button */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Bouton CTA
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Texte du bouton"
                  value={formData.ctaButton.text}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ctaButton: {
                      ...prev.ctaButton,
                      text: e.target.value
                    }
                  }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Lien du bouton"
                  value={formData.ctaButton.link}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ctaButton: {
                      ...prev.ctaButton,
                      link: e.target.value
                    }
                  }))}
                />
              </Grid>

              {/* Champs spécifiques au template */}
              {templateType === 'music' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Plateformes
                    </Typography>
                  </Grid>
                  {formData.platforms.map(platform => (
                    <Grid item xs={12} key={platform.id}>
                      <Box display="flex" gap={1}>
                        <TextField
                          fullWidth
                          value={platform.value}
                          onChange={(e) => handleItemChange('platforms', platform.id, e.target.value)}
                        />
                        <IconButton
                          onClick={() => handleRemoveItem('platforms', platform.id)}
                          color="error"
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => handleAddItem('platforms')}
                    >
                      Ajouter une plateforme
                    </Button>
                  </Grid>
                </>
              )}

              {templateType === 'event' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Programme
                    </Typography>
                  </Grid>
                  {formData.schedule.map(item => (
                    <Grid item xs={12} key={item.id}>
                      <Box display="flex" gap={1}>
                        <TextField
                          fullWidth
                          value={item.value}
                          onChange={(e) => handleItemChange('schedule', item.id, e.target.value)}
                        />
                        <IconButton
                          onClick={() => handleRemoveItem('schedule', item.id)}
                          color="error"
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => handleAddItem('schedule')}
                    >
                      Ajouter un événement
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.registrationForm.enabled}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            registrationForm: {
                              ...prev.registrationForm,
                              enabled: e.target.checked
                            }
                          }))}
                        />
                      }
                      label="Activer le formulaire d'inscription"
                    />
                  </Grid>
                </>
              )}

              {templateType === 'default' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Fonctionnalités
                    </Typography>
                  </Grid>
                  {formData.features.map(feature => (
                    <Grid item xs={12} key={feature.id}>
                      <Box display="flex" gap={1}>
                        <TextField
                          fullWidth
                          value={feature.value}
                          onChange={(e) => handleItemChange('features', feature.id, e.target.value)}
                        />
                        <IconButton
                          onClick={() => handleRemoveItem('features', feature.id)}
                          color="error"
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => handleAddItem('features')}
                    >
                      Ajouter une fonctionnalité
                    </Button>
                  </Grid>
                </>
              )}

              {/* Bouton de soumission */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  startIcon={<SaveIcon />}
                >
                  Créer la Landing Page
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LandingPageGenerator; 