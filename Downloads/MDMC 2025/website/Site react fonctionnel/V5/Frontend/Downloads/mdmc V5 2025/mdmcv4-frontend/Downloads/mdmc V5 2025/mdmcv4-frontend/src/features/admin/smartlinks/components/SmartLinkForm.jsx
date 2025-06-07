// src/components/smartlinks/SmartLinkForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextField, Button, Box, Typography, Paper, Grid, FormControl,
  InputLabel, Select, MenuItem, FormHelperText, FormControlLabel,
  Switch, CircularProgress, IconButton, FormLabel, Tooltip,
  Dialog, DialogContent, DialogTitle
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';

// Adaptez ces chemins d'importation à votre structure de projet
import { smartLinkSchema } from '@/features/admin/smartlinks/schemas/smartLinkSchema.js'; // Adaptez
import ImageUpload from '@/features/admin/components/ImageUpload.jsx'; // Adaptez
import ArtistCreatePage from '@/pages/admin/artists/ArtistCreatePage.jsx'; // Adaptez
import apiService from '@/services/api.service'; // Adaptez

const SmartLinkForm = ({ smartLinkData = null, onFormSubmitSuccess }) => {
  const isEditMode = !!smartLinkData;
  const [artists, setArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [artistLoadError, setArtistLoadError] = useState(null);

  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);

  const {
    register, handleSubmit, control, setValue, watch,
    formState: { errors, isSubmitting: isSmartLinkSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(smartLinkSchema),
    defaultValues: {
      trackTitle: smartLinkData?.trackTitle || '',
      artistId: smartLinkData?.artistId?._id || smartLinkData?.artistId || '',
      coverImageUrl: smartLinkData?.coverImageUrl || '',
      releaseDate: smartLinkData?.releaseDate ? new Date(`${smartLinkData.releaseDate}T00:00:00Z`) : null,
      description: smartLinkData?.description || '',
      platformLinks: smartLinkData?.platformLinks?.length ? smartLinkData.platformLinks : [{ platform: '', url: '' }],
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
    control, name: "platformLinks"
  });

  const fetchArtistsCallback = useCallback(async () => {
    setLoadingArtists(true);
    setArtistLoadError(null);
    try {
      const response = await apiService.artists.getAllArtists();
      // Votre interceptor retourne response.data, qui contient { success: true, data: [...] }
      if (response && response.success && Array.isArray(response.data)) {
          setArtists(response.data);
      } else if (response && Array.isArray(response)) { // Fallback si l'API retourne directement un tableau
          setArtists(response);
      } else {
          console.warn('Structure de réponse inattendue pour getAllArtists:', response);
          setArtists([]);
          const errorMsg = response?.error || 'Format de données artistes incorrect.';
          toast.error(`Artistes: ${errorMsg}`);
          setArtistLoadError(errorMsg);
      }
    } catch (error) {
      console.error('Erreur API lors du chargement des artistes:', error);
      const errorMessage = error.message || 'Impossible de charger la liste des artistes.';
      toast.error(`Artistes: ${errorMessage}`);
      setArtistLoadError(errorMessage);
      setArtists([]);
    } finally {
      setLoadingArtists(false);
    }
  }, []);

  useEffect(() => {
    fetchArtistsCallback();
  }, [fetchArtistsCallback]);

  const handleImageUploadSuccess = (imageUrl) => {
    setValue('coverImageUrl', imageUrl, { shouldValidate: true, shouldDirty: true });
    toast.info("L'image de couverture a été mise à jour dans le formulaire.");
  };

  const onSubmitSmartLink = async (data) => {
    const submissionData = {
        ...data,
        releaseDate: data.releaseDate ? new Date(data.releaseDate).toISOString().split('T')[0] : null,
        trackingIds: Object.fromEntries(Object.entries(data.trackingIds).filter(([_, value]) => value && value.trim() !== '')),
        platformLinks: data.platformLinks.filter(link => link.platform && link.url.trim() !== ''),
    };

    try {
      let responseData; // Sera { success: true, data: ... } ou { success: false, error: ... }
      if (isEditMode) {
        responseData = await apiService.smartlinks.update(smartLinkData._id, submissionData);
        toast.success('SmartLink mis à jour avec succès !'); // Toast générique, le succès est géré par la présence de responseData.data
      } else {
        responseData = await apiService.smartlinks.create(submissionData);
        toast.success('SmartLink créé avec succès !');
      }

      if (responseData && responseData.success && responseData.data) {
        if (onFormSubmitSuccess) onFormSubmitSuccess(responseData.data);
        if (!isEditMode) {
          const currentArtistId = watch('artistId');
          reset({
              trackTitle: '', artistId: currentArtistId, coverImageUrl: '', releaseDate: null,
              description: '', platformLinks: [{ platform: '', url: '' }],
              trackingIds: { ga4Id: '', gtmId: '', metaPixelId: '', tiktokPixelId: '' },
              isPublished: false, slug: '',
          });
        } else {
          reset(responseData.data); // Réinitialiser avec les nouvelles données du serveur
        }
      } else {
        // L'erreur spécifique devrait déjà avoir été toastée par l'intercepteur ou la logique onSubmit
        // Si responseData.error existe, on peut l'utiliser
        toast.error(responseData.error || "Une erreur est survenue lors de l'enregistrement du SmartLink.");
      }
    } catch (error) {
      console.error('Erreur de soumission du formulaire SmartLink:', error);
      toast.error(error.message || "Une erreur serveur est survenue lors de l'enregistrement du SmartLink.");
    }
  };

  const handleOpenArtistModal = () => setIsArtistModalOpen(true);
  const handleCloseArtistModal = () => setIsArtistModalOpen(false);

  const handleArtistCreatedInModal = (newlyCreatedArtist) => {
    fetchArtistsCallback(); // Recharger la liste des artistes
    handleCloseArtistModal();
    if (newlyCreatedArtist && newlyCreatedArtist._id) {
      setValue('artistId', newlyCreatedArtist._id, { shouldValidate: true, shouldDirty: true });
      toast.info(`Artiste "${newlyCreatedArtist.name}" créé et sélectionné.`);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
        {isEditMode ? 'Modifier le SmartLink' : 'Créer un nouveau SmartLink'}
      </Typography>

      <form onSubmit={handleSubmit(onSubmitSmartLink)} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField {...register('trackTitle')} label="Titre de la musique" required fullWidth variant="outlined" error={!!errors.trackTitle} helperText={errors.trackTitle?.message}/>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField {...register('slug')} label="Slug (URL personnalisée)" fullWidth variant="outlined" error={!!errors.slug} helperText={errors.slug?.message || 'Ex: mon-nouveau-single. Laisser vide pour auto-génération.'}/>
          </Grid>

          <Grid item xs={12} md={5}>
            <FormControl fullWidth required error={!!errors.artistId || !!artistLoadError}>
              <InputLabel id="artist-select-label">Artiste *</InputLabel>
              <Controller name="artistId" control={control} render={({ field }) => (
                  <Select labelId="artist-select-label" label="Artiste *" {...field} disabled={loadingArtists}>
                    {loadingArtists && ( <MenuItem value="" disabled><em>Chargement... <CircularProgress size={16} sx={{ ml: 1 }} /></em></MenuItem> )}
                    {!loadingArtists && artists.length === 0 && !artistLoadError && ( <MenuItem value="" disabled><em>Aucun artiste. Créez-en un.</em></MenuItem> )}
                    {!loadingArtists && artistLoadError && ( <MenuItem value="" disabled><em>Erreur chargement artistes.</em></MenuItem> )}
                    {!loadingArtists && artists.map((artist) => ( <MenuItem key={artist._id} value={artist._id}>{artist.name}</MenuItem> ))}
                  </Select>
              )}/>
              {errors.artistId && (<FormHelperText>{errors.artistId.message}</FormHelperText>)}
              {artistLoadError && (<FormHelperText error>{artistLoadError}</FormHelperText>)}
            </FormControl>
            <Button variant="text" startIcon={<AddIcon />} onClick={handleOpenArtistModal} sx={{ mt: 0.5, textTransform: 'none' }} disabled={loadingArtists}>
              Nouvel artiste
            </Button>
          </Grid>

          <Grid item xs={12} md={7}>
            <Controller name="releaseDate" control={control} render={({ field }) => ( <TextField label="Date de sortie (Optionnel)" type="date" fullWidth variant="outlined" value={ field.value ? new Date(field.value).toISOString().split('T')[0] : '' } onChange={(e) => { const dateValue = e.target.value ? new Date(e.target.value+"T00:00:00Z") : null; field.onChange( dateValue && !isNaN(dateValue.getTime()) ? dateValue : null ); }} error={!!errors.releaseDate} helperText={errors.releaseDate?.message} InputLabelProps={{ shrink: true }} /> )}/>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>Image de couverture *</Typography>
            <ImageUpload onUploadSuccess={handleImageUploadSuccess} initialImageUrl={watch('coverImageUrl') || null} buttonText="Télécharger la pochette" apiUploadFunction={apiService.upload.uploadImage} />
            <input type="hidden" {...register('coverImageUrl')} />
            {errors.coverImageUrl && ( <FormHelperText error sx={{ mt: 1 }}> {errors.coverImageUrl.message} </FormHelperText> )}
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField {...register('description')} label="Description (Optionnel)" multiline rows={4} fullWidth variant="outlined" error={!!errors.description} helperText={errors.description?.message} />
          </Grid>
          <Grid item xs={12}>
            <FormControl component="fieldset" fullWidth margin="normal">
              <FormLabel component="legend" sx={{ mb: 1.5, fontWeight: 'medium', fontSize: '1.1rem' }}> Liens des plateformes de streaming * </FormLabel>
              {platformLinkFields.map((item, index) => ( <Grid container spacing={1.5} key={item.id} sx={{ mb: 2, alignItems: 'flex-start' }}> <Grid item xs={12} sm={5}> <Controller name={`platformLinks.${index}.platform`} control={control} render={({ field }) => ( <TextField {...field} label="Plateforme" variant="outlined" fullWidth size="small" error={!!errors.platformLinks?.[index]?.platform} helperText={errors.platformLinks?.[index]?.platform?.message} /> )}/> </Grid> <Grid item xs={12} sm={6}> <Controller name={`platformLinks.${index}.url`} control={control} render={({ field }) => ( <TextField {...field} label="URL du lien" variant="outlined" fullWidth type="url" size="small" error={!!errors.platformLinks?.[index]?.url} helperText={errors.platformLinks?.[index]?.url?.message} /> )}/> </Grid> <Grid item xs={12} sm={1} sx={{ textAlign: {xs: 'right', sm: 'left'}, pt: {xs: 1, sm: 0.5} }}> <Tooltip title="Supprimer ce lien"> <IconButton onClick={() => removePlatformLink(index)} color="error" size="small" disabled={platformLinkFields.length <= 1}> <RemoveCircleOutlineIcon /> </IconButton> </Tooltip> </Grid> </Grid> ))}
              <Button type="button" onClick={() => appendPlatformLink({ platform: '', url: '' })} startIcon={<AddCircleOutlineIcon />} variant="outlined" size="small" > Ajouter un lien de plateforme </Button>
              {errors.platformLinks && typeof errors.platformLinks === 'object' && !Array.isArray(errors.platformLinks) && ( <FormHelperText error sx={{mt:1}}>{errors.platformLinks.message || errors.platformLinks.root?.message}</FormHelperText> )}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl component="fieldset" fullWidth margin="normal">
              <FormLabel component="legend" sx={{ mb: 1.5, fontWeight: 'medium', fontSize: '1.1rem' }}> Pixels de Tracking (Optionnel) </FormLabel>
              <Grid container spacing={2}> <Grid item xs={12} sm={6}> <TextField {...register('trackingIds.ga4Id')} label="Google Analytics 4 ID (GA4)" fullWidth variant="outlined" error={!!errors.trackingIds?.ga4Id} helperText={errors.trackingIds?.ga4Id?.message} /> </Grid> <Grid item xs={12} sm={6}> <TextField {...register('trackingIds.gtmId')} label="Google Tag Manager ID (GTM)" fullWidth variant="outlined" error={!!errors.trackingIds?.gtmId} helperText={errors.trackingIds?.gtmId?.message} /> </Grid> <Grid item xs={12} sm={6}> <TextField {...register('trackingIds.metaPixelId')} label="Meta Pixel ID (Facebook/Instagram)" fullWidth variant="outlined" error={!!errors.trackingIds?.metaPixelId} helperText={errors.trackingIds?.metaPixelId?.message} /> </Grid> <Grid item xs={12} sm={6}> <TextField {...register('trackingIds.tiktokPixelId')} label="TikTok Pixel ID" fullWidth variant="outlined" error={!!errors.trackingIds?.tiktokPixelId} helperText={errors.trackingIds?.tiktokPixelId?.message} /> </Grid> </Grid>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel control={ <Controller name="isPublished" control={control} render={({ field }) => ( <Switch {...field} checked={field.value} color="primary" /> )} /> } label="Publier ce SmartLink (le rendre accessible publiquement)" />
            {errors.isPublished && ( <FormHelperText error> {errors.isPublished.message} </FormHelperText> )}
          </Grid>

          <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" color="primary" disabled={isSmartLinkSubmitting || loadingArtists} startIcon={isSmartLinkSubmitting ? <CircularProgress size={20} color="inherit" /> : null} sx={{ minWidth: { xs: '100%', sm: 180 }, py: 1.5 }} >
              {isSmartLinkSubmitting ? 'Enregistrement...' : isEditMode ? 'Mettre à jour le SmartLink' : 'Créer le SmartLink'}
            </Button>
          </Grid>
        </Grid>
      </form>

      <Dialog open={isArtistModalOpen} onClose={handleCloseArtistModal} maxWidth="md" fullWidth>
        <DialogTitle>Créer un nouvel artiste</DialogTitle>
        <DialogContent sx={{pt:0.5 /* Ajustement pour l'espace sous le titre */}}>
          <ArtistCreatePage
            isInModal={true}
            onSuccessInModal={handleArtistCreatedInModal}
            onCancelInModal={handleCloseArtistModal}
          />
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default SmartLinkForm;
