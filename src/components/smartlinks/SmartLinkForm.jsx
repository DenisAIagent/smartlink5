// src/components/smartlinks/SmartLinkForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Switch,
  CircularProgress,
  IconButton,
  FormLabel,
  Tooltip,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Schéma de validation Zod
// CORRECTION 1: Chemin d'importation complet et correct pour smartLinkSchema
import { smartLinkSchema } from '@/features/admin/smartlinks/schemas/smartLinkSchema.js';

// Composant pour l'upload d'image
// CORRECTION 2: Chemin d'importation complet et correct pour ImageUpload
import ImageUpload from '@/features/admin/components/ImageUpload.jsx';

// Service API (s'assurer que le chemin est correct - à vérifier si besoin)
import apiService from '@/services/api.service';

const SmartLinkForm = ({ smartLinkData = null, onFormSubmitSuccess }) => {
  const isEditMode = !!smartLinkData;
  const [artists, setArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(smartLinkSchema),
    defaultValues: {
      trackTitle: smartLinkData?.trackTitle || '',
      artistId: smartLinkData?.artistId?._id || smartLinkData?.artistId || '',
      coverImageUrl: smartLinkData?.coverImageUrl || '',
      releaseDate: smartLinkData?.releaseDate
        ? new Date(`${smartLinkData.releaseDate}T00:00:00`)
        : null,
      description: smartLinkData?.description || '',
      platformLinks: smartLinkData?.platformLinks?.length
        ? smartLinkData.platformLinks
        : [{ platform: '', url: '' }],
      trackingIds: {
        ga4Id: smartLinkData?.trackingIds?.ga4Id || '',
        gtmId: smartLinkData?.trackingIds?.gtmId || '',
        metaPixelId: smartLinkData?.trackingIds?.metaPixelId || '',
        tiktokPixelId: smartLinkData?.trackingIds?.tiktokPixelId || '',
      },
      isPublished: smartLinkData?.isPublished || false,
      slug: smartLinkData?.slug || '',
    },
  });

  const { fields: platformLinkFields, append: appendPlatformLink, remove: removePlatformLink } = useFieldArray({
    control,
    name: "platformLinks"
  });

  useEffect(() => {
    const fetchArtists = async () => {
      setLoadingArtists(true);
      setFormError(null);
      try {
        const response = await apiService.artists.getAllArtists();
        setArtists(response.data || response || []);
      } catch (error) {
        console.error('Erreur lors du chargement des artistes:', error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Impossible de charger la liste des artistes.';
        toast.error(errorMessage);
        setFormError(errorMessage);
        setArtists([]);
      } finally {
        setLoadingArtists(false);
      }
    };
    fetchArtists();
  }, []);

  const handleImageUploadSuccess = (imageUrl) => {
    setValue('coverImageUrl', imageUrl, { shouldValidate: true, shouldDirty: true });
    toast.info("L'image de couverture a été mise à jour dans le formulaire.");
  };

  const onSubmit = async (data) => {
    setFormError(null);
    const submissionData = {
      ...data,
      releaseDate: data.releaseDate
        ? new Date(data.releaseDate).toISOString().split('T')[0]
        : null,
      trackingIds: Object.fromEntries(
        Object.entries(data.trackingIds).filter(([_, value]) => value && value.trim() !== '')
      )
    };

    submissionData.platformLinks = submissionData.platformLinks.filter(link => link.platform && link.url);

    console.log('Données du formulaire SmartLink soumises:', submissionData);

    try {
      let responseData;
      if (isEditMode) {
        responseData = await apiService.smartlinks.update(
          smartLinkData._id,
          submissionData
        );
        toast.success('SmartLink mis à jour avec succès !');
      } else {
        responseData = await apiService.smartlinks.create(submissionData);
        toast.success('SmartLink créé avec succès !');
      }

      if (onFormSubmitSuccess) {
        onFormSubmitSuccess(responseData.data || responseData);
      }

      if (!isEditMode) {
        const currentArtistId = watch('artistId');
        reset({
          trackTitle: '',
          artistId: currentArtistId,
          coverImageUrl: '',
          releaseDate: null,
          description: '',
          platformLinks: [{ platform: '', url: '' }],
          trackingIds: { ga4Id: '', gtmId: '', metaPixelId: '', tiktokPixelId: '' },
          isPublished: false,
          slug: '',
        });
      } else {
        reset(submissionData);
      }
    } catch (error) {
      console.error('Erreur de soumission du formulaire:', error);
      const submissionErrorMessage =
        error.response?.data?.message ||
        error.message ||
        'Une erreur est survenue lors de la soumission.';
      toast.error(submissionErrorMessage);
      setFormError(submissionErrorMessage);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ mb: 3, fontWeight: 'medium' }}
      >
        {isEditMode ? 'Modifier le SmartLink' : 'Créer un nouveau SmartLink'}
      </Typography>

      {formError && (
        <Typography color="error" sx={{ mb: 2 }} role="alert">
          {formError}
        </Typography>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              {...register('trackTitle')}
              label="Titre de la musique"
              required
              fullWidth
              variant="outlined"
              error={!!errors.trackTitle}
              helperText={errors.trackTitle?.message}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              {...register('slug')}
              label="Slug (URL personnalisée)"
              fullWidth
              variant="outlined"
              error={!!errors.slug}
              helperText={
                errors.slug?.message ||
                'Ex: mon-nouveau-single. Laisser vide pour auto-génération.'
              }
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <FormControl fullWidth required error={!!errors.artistId}>
              <InputLabel id="artist-select-label">Artiste *</InputLabel>
              <Controller
                name="artistId"
                control={control}
                render={({ field }) => (
                  <Select
                    labelId="artist-select-label"
                    label="Artiste *"
                    {...field}
                    disabled={loadingArtists}
                  >
                    {loadingArtists && (
                      <MenuItem value="" disabled>
                        <em>Chargement... <CircularProgress size={16} sx={{ ml: 1 }} /></em>
                      </MenuItem>
                    )}
                    {!loadingArtists && artists.length === 0 && (
                      <MenuItem value="" disabled>
                        <em>Aucun artiste. Créez-en un d'abord.</em>
                      </MenuItem>
                    )}
                    {!loadingArtists &&
                      artists.map((artist) => (
                        <MenuItem key={artist._id} value={artist._id}>
                          {artist.name}
                        </MenuItem>
                      ))}
                  </Select>
                )}
              />
              {errors.artistId && (
                <FormHelperText>{errors.artistId.message}</FormHelperText>
              )}
            </FormControl>
            {!loadingArtists && artists.length === 0 && (
              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 2, borderRadius: 99, fontWeight: 600 }}
                onClick={() => navigate('/admin/artists/new')}
              >
                Créer un artiste
              </Button>
            )}
          </Grid>

          <Grid item xs={12} md={7}>
            <Controller
              name="releaseDate"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Date de sortie (Optionnel)"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={
                    field.value
                      ? new Date(field.value).toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) => {
                    const dateValue = e.target.value
                      ? new Date(`${e.target.value}T00:00:00`)
                      : null;
                    field.onChange(
                      dateValue && !isNaN(dateValue.getTime()) ? dateValue : null
                    );
                  }}
                  error={!!errors.releaseDate}
                  helperText={errors.releaseDate?.message}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
              Image de couverture *
            </Typography>
            <ImageUpload
              onUploadSuccess={handleImageUploadSuccess}
              initialImageUrl={watch('coverImageUrl') || null}
              buttonText="Télécharger la pochette"
              apiUploadFunction={apiService.upload.uploadImage}
            />
            <input type="hidden" {...register('coverImageUrl')} />
            {errors.coverImageUrl && (
              <FormHelperText error sx={{ mt: 1 }}>
                {errors.coverImageUrl.message}
              </FormHelperText>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              {...register('description')}
              label="Description (Optionnel)"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl component="fieldset" fullWidth margin="normal">
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'medium', fontSize: '1.1rem' }}>
                Liens des plateformes de streaming *
              </FormLabel>
              {platformLinkFields.map((item, index) => (
                <Grid container spacing={2} key={item.id} sx={{ mb: 2, alignItems: 'center' }}>
                  <Grid item xs={12} sm={5}>
                    <Controller
                      name={`platformLinks.${index}.platform`}
                      control={control}
                      defaultValue={item.platform}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Nom de la plateforme"
                          variant="outlined"
                          fullWidth
                          error={!!errors.platformLinks?.[index]?.platform}
                          helperText={errors.platformLinks?.[index]?.platform?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={10} sm={6}>
                     <Controller
                      name={`platformLinks.${index}.url`}
                      control={control}
                      defaultValue={item.url}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="URL du lien"
                          variant="outlined"
                          fullWidth
                          type="url"
                          error={!!errors.platformLinks?.[index]?.url}
                          helperText={errors.platformLinks?.[index]?.url?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={2} sm={1} sx={{ textAlign: 'right' }}>
                    <Tooltip title="Supprimer ce lien">
                      <IconButton onClick={() => removePlatformLink(index)} color="error" disabled={platformLinkFields.length <= 1}>
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              ))}
              <Button
                type="button"
                onClick={() => appendPlatformLink({ platform: '', url: '' })}
                startIcon={<AddCircleOutlineIcon />}
                variant="outlined"
                size="small"
              >
                Ajouter un lien de plateforme
              </Button>
               {errors.platformLinks && typeof errors.platformLinks === 'object' && !Array.isArray(errors.platformLinks) && (
                 <FormHelperText error>{errors.platformLinks.message || errors.platformLinks.root?.message}</FormHelperText>
               )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
             <FormControl component="fieldset" fullWidth margin="normal">
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'medium', fontSize: '1.1rem' }}>
                Pixels de Tracking (Optionnel)
              </FormLabel>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register('trackingIds.ga4Id')}
                    label="Google Analytics 4 ID (GA4)"
                    fullWidth
                    variant="outlined"
                    error={!!errors.trackingIds?.ga4Id}
                    helperText={errors.trackingIds?.ga4Id?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register('trackingIds.gtmId')}
                    label="Google Tag Manager ID (GTM)"
                    fullWidth
                    variant="outlined"
                    error={!!errors.trackingIds?.gtmId}
                    helperText={errors.trackingIds?.gtmId?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register('trackingIds.metaPixelId')}
                    label="Meta Pixel ID (Facebook/Instagram)"
                    fullWidth
                    variant="outlined"
                    error={!!errors.trackingIds?.metaPixelId}
                    helperText={errors.trackingIds?.metaPixelId?.message}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register('trackingIds.tiktokPixelId')}
                    label="TikTok Pixel ID"
                    fullWidth
                    variant="outlined"
                    error={!!errors.trackingIds?.tiktokPixelId}
                    helperText={errors.trackingIds?.tiktokPixelId?.message}
                  />
                </Grid>
              </Grid>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Controller
                  name="isPublished"
                  control={control}
                  render={({ field }) => (
                    <Switch {...field} checked={field.value} color="primary" />
                  )}
                />
              }
              label="Publier ce SmartLink (le rendre accessible publiquement)"
            />
            {errors.isPublished && (
              <FormHelperText error>
                {errors.isPublished.message}
              </FormHelperText>
            )}
          </Grid>

          <Grid
            item
            xs={12}
            sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}
          >
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, fontWeight: 700, fontSize: '1.1rem', borderRadius: 99 }}
              disabled={isSubmitting || artists.length === 0 || !watch('artistId')}
            >
              {isSubmitting ? <CircularProgress size={24} /> : isEditMode ? 'Mettre à jour' : 'Créer le SmartLink'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default SmartLinkForm;
