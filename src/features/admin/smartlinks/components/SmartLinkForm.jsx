import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  InputAdornment,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PreviewIcon from "@mui/icons-material/Preview";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { toast } from "react-toastify";

import { smartLinkSchema } from "@/features/admin/smartlinks/schemas/smartLinkSchema.js";
import ImageUpload from "@/features/admin/components/ImageUpload.jsx";
import ArtistCreatePage from "@/pages/admin/artists/ArtistCreatePage.jsx";
// Utilisation directe de apiService.artists pour getArtists
import apiService from "@/services/api.service"; 
import musicPlatformService from "@/services/musicPlatform.service.js";
import SmartLinkTemplateSelector from "./SmartLinkTemplateSelector";
import QRCodeDisplay from "./QRCodeDisplay";
import SmartLinkPreview from "./SmartLinkPreview";

const SmartLinkForm = ({ smartLinkData = null, onFormSubmitSuccess }) => {
  const isEditMode = !!smartLinkData;
  const [artists, setArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [artistLoadError, setArtistLoadError] = useState(null);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isFetchingLinks, setIsFetchingLinks] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState(
    smartLinkData?.templateType || ""
  );
  const [currentSmartLinkUrl, setCurrentSmartLinkUrl] = useState(
    isEditMode && smartLinkData?.slug
      ? `${window.location.origin}/s/${smartLinkData.slug}`
      : ""
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting: isSmartLinkSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(smartLinkSchema),
    defaultValues: {
      templateType: smartLinkData?.templateType || "",
      trackTitle: smartLinkData?.trackTitle || "",
      artistId: smartLinkData?.artistId?._id || smartLinkData?.artistId || "",
      coverImageUrl: smartLinkData?.coverImageUrl || "",
      releaseDate: smartLinkData?.releaseDate
        ? new Date(`${smartLinkData.releaseDate}T00:00:00Z`)
        : null,
      description: smartLinkData?.description || "",
      platformLinks: smartLinkData?.platformLinks?.length
        ? smartLinkData.platformLinks
        : [{ platform: "", url: "" }],
      trackingIds: {
        ga4Id: smartLinkData?.trackingIds?.ga4Id || "",
        gtmId: smartLinkData?.trackingIds?.gtmId || "",
        metaPixelId: smartLinkData?.trackingIds?.metaPixelId || "",
        tiktokPixelId: smartLinkData?.trackingIds?.tiktokPixelId || "",
      },
      isPublished: smartLinkData?.isPublished || false,
      slug: smartLinkData?.slug || "",
      utmSource: smartLinkData?.utmSource || "",
      utmMedium: smartLinkData?.utmMedium || "",
      utmCampaign: smartLinkData?.utmCampaign || "",
      utmTerm: smartLinkData?.utmTerm || "",
      utmContent: smartLinkData?.utmContent || "",
      isrcUpc: smartLinkData?.isrcUpc || "",
      pageContent: smartLinkData?.pageContent || "",
      callToActionLabel: smartLinkData?.callToActionLabel || "",
      callToActionUrl: smartLinkData?.callToActionUrl || "",
    },
  });

  const { fields: platformLinkFields, append: appendPlatformLink, remove: removePlatformLink, replace: replacePlatformLinks } = useFieldArray({
    control,
    name: "platformLinks",
  });

  useEffect(() => {
    setValue("templateType", selectedTemplate, { shouldValidate: true, shouldDirty: true });
  }, [selectedTemplate, setValue]);

  const fetchArtistsCallback = useCallback(async () => {
    setLoadingArtists(true);
    setArtistLoadError(null);
    try {
      // Correction: Utilisation de apiService.artists.getArtists()
      const response = await apiService.artists.getArtists(); 
      if (response && response.success && Array.isArray(response.data)) {
        setArtists(response.data);
      } else {
        const errorMsg =
          response?.error || "Format de données artistes incorrect reçu du serveur.";
        toast.error(`Artistes: ${errorMsg}`);
        setArtistLoadError(errorMsg);
        setArtists([]);
      }
    } catch (error) {
      console.error("Erreur non interceptée lors du chargement des artistes:", error);
      const errorMessage =
        error.message ||
        "Impossible de charger la liste des artistes en raison d'une erreur inattendue.";
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
    setValue("coverImageUrl", imageUrl, { shouldValidate: true, shouldDirty: true });
    toast.info("L'image de couverture a été mise à jour dans le formulaire.");
  };

  // Fonctionnalité fetch-platform-links réactivée avec l'API Odesli/Songlink
  const handleFetchLinksFromISRC = async () => {
    const sourceUrl = getValues("isrcUpc");
    if (!sourceUrl || sourceUrl.trim() === "") {
      toast.warn("Veuillez saisir un code ISRC/UPC ou une URL Spotify/Apple Music/Deezer avant de lancer la recherche.");
      return;
    }
    
    setIsFetchingLinks(true);
    toast.info(`Recherche des liens pour : ${sourceUrl}...`);
    
    try {
      const response = await musicPlatformService.fetchLinksFromSourceUrl(sourceUrl);
      
      if (response && response.success && response.data) {
        const { title, artist, artwork, linksByPlatform } = response.data;
        
        // Mise à jour du titre si disponible et non déjà renseigné
        if (title && !getValues("trackTitle")) {
          setValue("trackTitle", title, { shouldValidate: true, shouldDirty: true });
        }

        // Conversion des liens par plateforme en format attendu par le formulaire
        const newPlatformLinks = [];
        
        // Parcourir les liens retournés et les formater pour le formulaire
        for (const [platform, url] of Object.entries(linksByPlatform)) {
          newPlatformLinks.push({ platform, url });
        }
        
        if (newPlatformLinks.length > 0) {
          replacePlatformLinks(newPlatformLinks);
          toast.success(`${newPlatformLinks.length} liens de plateformes trouvés et ajoutés !`);
        } else {
          toast.info("Aucun lien trouvé pour cet ISRC/UPC ou cette URL sur les plateformes principales.");
        }
      } else {
        toast.error(response?.error || "Impossible de récupérer les liens pour cet ISRC/UPC ou cette URL.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des liens:", error);
      toast.error("Une erreur est survenue lors de la recherche des liens.");
    } finally {
      setIsFetchingLinks(false);
    }
  };

  const onSubmitSmartLink = async (data) => {
    const submissionData = {
      ...data,
      templateType: selectedTemplate,
      releaseDate: data.releaseDate
        ? new Date(data.releaseDate).toISOString().split("T")[0]
        : null,
      trackingIds: Object.fromEntries(
        Object.entries(data.trackingIds || {}).filter(
          ([_, value]) => value && String(value).trim() !== ""
        )
      ),
      platformLinks: data.platformLinks.filter(
        (link) => link.platform && link.platform.trim() !== "" && link.url && link.url.trim() !== ""
      ),
      utmSource: data.utmSource || "",
      utmMedium: data.utmMedium || "",
      utmCampaign: data.utmCampaign || "",
      utmTerm: data.utmTerm || "",
      utmContent: data.utmContent || "",
      isrcUpc: data.templateType === "music" ? data.isrcUpc : undefined,
      pageContent: data.templateType === "landing_page" ? data.pageContent : undefined,
      callToActionLabel: data.templateType === "landing_page" ? data.callToActionLabel : undefined,
      callToActionUrl: data.templateType === "landing_page" ? data.callToActionUrl : undefined,
    };

    try {
      let responseData;
      if (isEditMode) {
        responseData = await apiService.smartlinks.update(
          smartLinkData._id,
          submissionData
        );
        toast.success("SmartLink mis à jour avec succès !");
      } else {
        responseData = await apiService.smartlinks.create(submissionData);
        toast.success("SmartLink créé avec succès !");
      }

      if (responseData && responseData.success && responseData.data) {
        if (onFormSubmitSuccess) onFormSubmitSuccess(responseData.data);
        
        if (responseData.data.slug) {
            setCurrentSmartLinkUrl(`${window.location.origin}/s/${responseData.data.slug}`);
        } else {
            setCurrentSmartLinkUrl("");
        }

        if (!isEditMode) {
          const currentArtistId = watch("artistId");
          const currentTemplateType = getValues("templateType");
          reset({
            templateType: currentTemplateType,
            trackTitle: "",
            artistId: currentArtistId,
            coverImageUrl: "",
            releaseDate: null,
            description: "",
            platformLinks: [{ platform: "", url: "" }],
            trackingIds: { ga4Id: "", gtmId: "", metaPixelId: "", tiktokPixelId: "" },
            isPublished: false,
            slug: "",
            utmSource: "",
            utmMedium: "",
            utmCampaign: "",
            utmTerm: "",
            utmContent: "",
            isrcUpc: "",
            pageContent: "", 
            callToActionLabel: "",
            callToActionUrl: "",
          });
        } else {
          const updatedDefaults = {
            ...responseData.data,
            templateType: responseData.data.templateType || selectedTemplate,
            isrcUpc: responseData.data.isrcUpc || "",
            pageContent: responseData.data.pageContent || "",
            callToActionLabel: responseData.data.callToActionLabel || "",
            callToActionUrl: responseData.data.callToActionUrl || "",
          };
          if (responseData.data.releaseDate) {
            updatedDefaults.releaseDate = new Date(
              `${responseData.data.releaseDate}T00:00:00Z`
            );
          }
          if (!updatedDefaults.platformLinks || updatedDefaults.platformLinks.length === 0) {
            updatedDefaults.platformLinks = [{ platform: "", url: "" }];
          }
          reset(updatedDefaults);
          setSelectedTemplate(updatedDefaults.templateType);
        }
      } else {
        toast.error(
          responseData?.error ||
            "Échec de l'enregistrement du SmartLink. Veuillez vérifier les informations."
        );
      }
    } catch (error) {
      console.error("Erreur non interceptée lors de la soumission du formulaire SmartLink:", error);
      toast.error(
        error.message ||
          "Une erreur serveur est survenue lors de l'enregistrement du SmartLink."
      );
    }
  };

  const handleOpenArtistModal = () => setIsArtistModalOpen(true);
  const handleCloseArtistModal = () => setIsArtistModalOpen(false);

  const handleArtistCreatedInModal = (newlyCreatedArtist) => {
    fetchArtistsCallback();
    handleCloseArtistModal();
    if (newlyCreatedArtist && newlyCreatedArtist._id) {
      setValue("artistId", newlyCreatedArtist._id, { shouldValidate: true, shouldDirty: true });
      toast.info(`Artiste "${newlyCreatedArtist.name}" créé et sélectionné.`);
    }
  };

  const handleOpenPreviewModal = () => {
    const currentData = getValues();
    setPreviewData(currentData);
    setIsPreviewModalOpen(true);
  };
  const handleClosePreviewModal = () => setIsPreviewModalOpen(false);

  const watchedTemplateType = watch("templateType");
  const watchedSlug = watch("slug");

  useEffect(() => {
    if (isEditMode && watchedSlug) {
      setCurrentSmartLinkUrl(`${window.location.origin}/s/${watchedSlug}`);
    } else if (!isEditMode) {
      // Pour la création, l'URL n'est connue qu'après soumission
    }
  }, [watchedSlug, isEditMode]);

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
      <Grid container spacing={3} sx={{mb: 2}}>
        <Grid item xs={12} md={isEditMode && currentSmartLinkUrl ? 8 : 12}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: "medium" }}>
                {isEditMode ? "Modifier le SmartLink" : "Créer un nouveau SmartLink"}
            </Typography>
        </Grid>
        {isEditMode && currentSmartLinkUrl && (
            <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start" }}>
                <QRCodeDisplay smartLinkUrl={currentSmartLinkUrl} />
            </Grid>
        )}
      </Grid>

      <form onSubmit={handleSubmit(onSubmitSmartLink)} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="templateType"
              control={control}
              render={({ field }) => (
                <SmartLinkTemplateSelector
                  selectedTemplate={field.value}
                  onTemplateChange={(value) => {
                    field.onChange(value);
                    setSelectedTemplate(value); 
                  }}
                  error={!!errors.templateType}
                  helperText={errors.templateType?.message}
                  disabled={isEditMode} 
                />
              )}
            />
          </Grid>

          {(watchedTemplateType === "music" || watchedTemplateType === "landing_page") && (
            <Grid item xs={12} md={6}>
              <TextField {...register("trackTitle")} label={watchedTemplateType === "music" ? "Titre de la musique/single/album" : "Titre de la page"} required fullWidth variant="outlined" error={!!errors.trackTitle} helperText={errors.trackTitle?.message}/>
            </Grid>
          )}
          
          {watchedTemplateType === "music" && (
             <Grid item xs={12} md={6}>
                <TextField 
                    {...register("isrcUpc")} 
                    label="ISRC / UPC ou URL Spotify/Apple Music/Deezer"
                    fullWidth 
                    variant="outlined" 
                    error={!!errors.isrcUpc} 
                    helperText={errors.isrcUpc?.message || "Saisir un ISRC/UPC ou une URL de plateforme pour l'auto-complétion"}
                    InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Rechercher automatiquement les liens des plateformes à partir de l'ISRC/UPC ou d'une URL">
                              <IconButton
                                onClick={handleFetchLinksFromISRC}
                                disabled={isFetchingLinks}
                                edge="end"
                                color="primary"
                              >
                                {isFetchingLinks ? <CircularProgress size={24} /> : <AutoAwesomeIcon />}
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                    }}
                />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.artistId} required>
              <InputLabel id="artist-select-label">Artiste</InputLabel>
              <Controller
                name="artistId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="artist-select-label"
                    label="Artiste"
                    disabled={loadingArtists}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleOpenArtistModal}
                          edge="end"
                          sx={{ mr: 2 }}
                          title="Créer un nouvel artiste"
                        >
                          <AddIcon />
                        </IconButton>
                      </InputAdornment>
                    }
                  >
                    {loadingArtists ? (
                      <MenuItem disabled>Chargement des artistes...</MenuItem>
                    ) : artistLoadError ? (
                      <MenuItem disabled>Erreur: {artistLoadError}</MenuItem>
                    ) : artists.length === 0 ? (
                      <MenuItem disabled>Aucun artiste disponible</MenuItem>
                    ) : (
                      artists.map((artist) => (
                        <MenuItem key={artist._id} value={artist._id}>
                          {artist.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                )}
              />
              {errors.artistId && (
                <FormHelperText>{errors.artistId.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              {...register("slug")}
              label="Slug personnalisé (optionnel)"
              fullWidth
              variant="outlined"
              error={!!errors.slug}
              helperText={
                errors.slug?.message ||
                "Laissez vide pour générer automatiquement à partir du titre"
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              {...register("releaseDate")}
              label="Date de sortie"
              type="date"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              error={!!errors.releaseDate}
              helperText={errors.releaseDate?.message}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ImageUpload
              currentImageUrl={watch("coverImageUrl")}
              onUploadSuccess={handleImageUploadSuccess}
              label="Image de couverture"
              error={!!errors.coverImageUrl}
              helperText={errors.coverImageUrl?.message}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              {...register("description")}
              label="Description"
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              error={!!errors.description}
              helperText={
                errors.description?.message ||
                "Description optionnelle du SmartLink (max 500 caractères)"
              }
            />
          </Grid>

          {watchedTemplateType === "landing_page" && (
            <>
              <Grid item xs={12}>
                <TextField
                  {...register("pageContent")}
                  label="Contenu de la page"
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  error={!!errors.pageContent}
                  helperText={
                    errors.pageContent?.message ||
                    "Contenu principal de la landing page (supporte le HTML basique)"
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register("callToActionLabel")}
                  label="Texte du bouton d'action"
                  fullWidth
                  variant="outlined"
                  error={!!errors.callToActionLabel}
                  helperText={errors.callToActionLabel?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  {...register("callToActionUrl")}
                  label="URL du bouton d'action"
                  fullWidth
                  variant="outlined"
                  error={!!errors.callToActionUrl}
                  helperText={errors.callToActionUrl?.message}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Liens des plateformes
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Ajoutez les liens vers les différentes plateformes de streaming.
              </Typography>
            </Box>

            {platformLinkFields.map((field, index) => (
              <Grid container spacing={2} key={field.id} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={5}>
                  <Controller
                    name={`platformLinks.${index}.platform`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Nom de la plateforme"
                        fullWidth
                        variant="outlined"
                        error={!!errors.platformLinks?.[index]?.platform}
                        helperText={errors.platformLinks?.[index]?.platform?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name={`platformLinks.${index}.url`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="URL"
                        fullWidth
                        variant="outlined"
                        error={!!errors.platformLinks?.[index]?.url}
                        helperText={errors.platformLinks?.[index]?.url?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={1}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconButton
                    onClick={() => removePlatformLink(index)}
                    color="error"
                    disabled={platformLinkFields.length === 1}
                  >
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => appendPlatformLink({ platform: "", url: "" })}
              variant="outlined"
              color="primary"
              sx={{ mt: 1 }}
            >
              Ajouter une plateforme
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Paramètres de tracking (optionnels)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  {...register("trackingIds.ga4Id")}
                  label="ID Google Analytics 4"
                  fullWidth
                  variant="outlined"
                  error={!!errors.trackingIds?.ga4Id}
                  helperText={errors.trackingIds?.ga4Id?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  {...register("trackingIds.gtmId")}
                  label="ID Google Tag Manager"
                  fullWidth
                  variant="outlined"
                  error={!!errors.trackingIds?.gtmId}
                  helperText={errors.trackingIds?.gtmId?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  {...register("trackingIds.metaPixelId")}
                  label="ID Meta Pixel"
                  fullWidth
                  variant="outlined"
                  error={!!errors.trackingIds?.metaPixelId}
                  helperText={errors.trackingIds?.metaPixelId?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  {...register("trackingIds.tiktokPixelId")}
                  label="ID TikTok Pixel"
                  fullWidth
                  variant="outlined"
                  error={!!errors.trackingIds?.tiktokPixelId}
                  helperText={errors.trackingIds?.tiktokPixelId?.message}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Paramètres UTM (optionnels)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  {...register("utmSource")}
                  label="utm_source"
                  fullWidth
                  variant="outlined"
                  error={!!errors.utmSource}
                  helperText={errors.utmSource?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  {...register("utmMedium")}
                  label="utm_medium"
                  fullWidth
                  variant="outlined"
                  error={!!errors.utmMedium}
                  helperText={errors.utmMedium?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  {...register("utmCampaign")}
                  label="utm_campaign"
                  fullWidth
                  variant="outlined"
                  error={!!errors.utmCampaign}
                  helperText={errors.utmCampaign?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  {...register("utmTerm")}
                  label="utm_term"
                  fullWidth
                  variant="outlined"
                  error={!!errors.utmTerm}
                  helperText={errors.utmTerm?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  {...register("utmContent")}
                  label="utm_content"
                  fullWidth
                  variant="outlined"
                  error={!!errors.utmContent}
                  helperText={errors.utmContent?.message}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Controller
                  name="isPublished"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              }
              label="Publier ce SmartLink"
            />
          </Grid>

          <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleOpenPreviewModal}
              startIcon={<PreviewIcon />}
              disabled={isSmartLinkSubmitting}
            >
              Prévisualiser
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSmartLinkSubmitting}
              sx={{ minWidth: 120 }}
            >
              {isSmartLinkSubmitting ? (
                <CircularProgress size={24} />
              ) : isEditMode ? (
                "Mettre à jour"
              ) : (
                "Créer"
              )}
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Modal pour créer un nouvel artiste */}
      <Dialog
        open={isArtistModalOpen}
        onClose={handleCloseArtistModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Créer un nouvel artiste</DialogTitle>
        <DialogContent>
          <ArtistCreatePage
            onArtistCreated={handleArtistCreatedInModal}
            isModal={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseArtistModal} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de prévisualisation */}
      <Dialog
        open={isPreviewModalOpen}
        onClose={handleClosePreviewModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Prévisualisation du SmartLink</DialogTitle>
        <DialogContent>
          {previewData && <SmartLinkPreview data={previewData} artists={artists} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreviewModal} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SmartLinkForm;
