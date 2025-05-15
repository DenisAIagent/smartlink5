// src/features/admin/smartlinks/components/SmartLinkForm.jsx
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
// Modification de l'import pour apiService et artistService
import apiService, { artistService as importedArtistService } from "@/services/api.service"; 
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
      // Utilisation de importedArtistService directement
      const response = await importedArtistService.getAllArtists(); 
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
    toast.info("Limage de couverture a été mise à jour dans le formulaire.");
  };

  const handleFetchLinksFromISRC = async () => {
    const isrcValue = getValues("isrcUpc");
    if (!isrcValue || isrcValue.trim() === "") {
      toast.warn("Veuillez saisir un code ISRC/UPC avant de lancer la recherche.");
      return;
    }
    setIsFetchingLinks(true);
    toast.info(`Recherche des liens pour l'ISRC/UPC : ${isrcValue}...`);
    try {
      const response = await musicPlatformService.fetchLinksFromISRC(isrcValue);
      if (response && response.success && response.data) {
        const { title, artist, artwork, linksByPlatform } = response.data;
        if (title && !getValues("trackTitle")) {
          setValue("trackTitle", title, { shouldValidate: true, shouldDirty: true });
        }

        const newPlatformLinks = [];
        const platformOrder = ["spotify", "appleMusic", "deezer", "youtube"];

        platformOrder.forEach(platformKey => {
          if (linksByPlatform[platformKey]) {
            let platformName = "";
            switch (platformKey) {
              case "spotify": platformName = "Spotify"; break;
              case "appleMusic": platformName = "Apple Music"; break;
              case "deezer": platformName = "Deezer"; break;
              case "youtube": platformName = "YouTube"; break;
              default: platformName = platformKey;
            }
            newPlatformLinks.push({ platform: platformName, url: linksByPlatform[platformKey] });
          }
        });
        
        if (newPlatformLinks.length > 0) {
          replacePlatformLinks(newPlatformLinks);
          toast.success("Liens des plateformes mis à jour avec succès !");
        } else {
          toast.info("Aucun lien trouvé pour cet ISRC/UPC sur les plateformes principales.");
        }
      } else {
        toast.error(response?.error || "Impossible de récupérer les liens pour cet ISRC/UPC.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des liens depuis ISRC:", error);
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
            "Échec de lenregistrement du SmartLink. Veuillez vérifier les informations."
        );
      }
    } catch (error) {
      console.error("Erreur non interceptée lors de la soumission du formulaire SmartLink:", error);
      toast.error(
        error.message ||
          "Une erreur serveur est survenue lors de lenregistrement du SmartLink."
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
      // Pour la création, lURL nest connue quaprès soumission
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
                    label="ISRC / UPC"
                    fullWidth 
                    variant="outlined" 
                    error={!!errors.isrcUpc} 
                    helperText={errors.isrcUpc?.message || "Saisir ISRC/UPC puis cliquer sur l'icône ✨"}
                    InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Auto-compléter les liens des plateformes (Spotify, Apple Music, Deezer, YouTube) à partir de cet ISRC/UPC.">
                              <IconButton onClick={handleFetchLinksFromISRC} edge="end" disabled={isFetchingLinks || !watch("isrcUpc")}>
                                {isFetchingLinks ? <CircularProgress size={24} /> : <AutoAwesomeIcon />}
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                    }}
                />
            </Grid>
          )}

          {(watchedTemplateType === "music" || watchedTemplateType === "landing_page") && (
            <Grid item xs={12} md={watchedTemplateType === "music" ? 12 : 6}> 
              <TextField {...register("slug")} label="Slug (URL personnalisée)" fullWidth variant="outlined" error={!!errors.slug} helperText={errors.slug?.message || "Ex: mon-nouveau-single. Laisser vide pour auto-génération."}/>
            </Grid>
          )}

          {(watchedTemplateType === "music" || watchedTemplateType === "landing_page") && (
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
              <Button variant="text" startIcon={<AddIcon />} onClick={handleOpenArtistModal} sx={{ mt: 0.5, textTransform: "none" }} disabled={loadingArtists}>
                Nouvel artiste
              </Button>
            </Grid>
          )}
          
          {watchedTemplateType === "music" && (
            <Grid item xs={12} md={7}>
              <Controller name="releaseDate" control={control} render={({ field }) => ( <TextField label="Date de sortie (Optionnel)" type="date" fullWidth variant="outlined" value={ field.value ? new Date(field.value).toISOString().split("T")[0] : "" } onChange={(e) => { const dateValue = e.target.value ? new Date(e.target.value+"T00:00:00Z") : null; field.onChange( dateValue && !isNaN(dateValue.getTime()) ? dateValue : null ); }} error={!!errors.releaseDate} helperText={errors.releaseDate?.message} InputLabelProps={{ shrink: true }} /> )}/>
            </Grid>
          )}

          {watchedTemplateType === "landing_page" && (
            <>
                <Grid item xs={12}>
                    <TextField 
                        {...register("pageContent")} 
                        label="Contenu de la page (Optionnel)" 
                        multiline 
                        rows={6} 
                        fullWidth 
                        variant="outlined" 
                        error={!!errors.pageContent} 
                        helperText={errors.pageContent?.message || "Décrivez le contenu principal de votre page de destination ici."}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField 
                        {...register("callToActionLabel")} 
                        label="Label du Bouton dAction (Optionnel)" 
                        fullWidth 
                        variant="outlined" 
                        error={!!errors.callToActionLabel} 
                        helperText={errors.callToActionLabel?.message || "Ex: En savoir plus, Acheter maintenant"}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField 
                        {...register("callToActionUrl")} 
                        label="URL du Bouton dAction (Optionnel)" 
                        type="url" 
                        fullWidth 
                        variant="outlined" 
                        error={!!errors.callToActionUrl} 
                        helperText={errors.callToActionUrl?.message || "Lien vers lequel le bouton redirigera."}
                    />
                </Grid>
            </>
          )}

          {(watchedTemplateType === "music" || watchedTemplateType === "landing_page") && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>Image de couverture *</Typography>
              <ImageUpload onUploadSuccess={handleImageUploadSuccess} initialImageUrl={watch("coverImageUrl") || null} buttonText="Télécharger limage" apiUploadFunction={apiService.upload.uploadImage} />
              <input type="hidden" {...register("coverImageUrl")} />
              {errors.coverImageUrl && ( <FormHelperText error sx={{ mt: 1 }}> {errors.coverImageUrl.message} </FormHelperText> )}
            </Grid>
          )}

          {(watchedTemplateType === "music" || watchedTemplateType === "landing_page") && (
            <Grid item xs={12} md={6}>
              <TextField {...register("description")} label="Description (Optionnel)" multiline rows={4} fullWidth variant="outlined" error={!!errors.description} helperText={errors.description?.message} />
            </Grid>
          )}

          {(watchedTemplateType === "music" || watchedTemplateType === "landing_page") && (
            <Grid item xs={12}>
              <FormControl component="fieldset" fullWidth margin="normal">
                <FormLabel component="legend" sx={{ mb: 1.5, fontWeight: "medium", fontSize: "1.1rem" }}> 
                    {watchedTemplateType === "music" ? "Liens des plateformes de streaming *" : "Liens externes (Optionnel)"}
                </FormLabel>
                {platformLinkFields.map((item, index) => ( <Grid container spacing={1.5} key={item.id} sx={{ mb: 2, alignItems: "flex-start" }}> <Grid item xs={12} sm={5}> <Controller name={`platformLinks.${index}.platform`} control={control} render={({ field }) => ( <TextField {...field} label="Nom du lien / Plateforme" variant="outlined" fullWidth size="small" error={!!errors.platformLinks?.[index]?.platform} helperText={errors.platformLinks?.[index]?.platform?.message} /> )}/> </Grid> <Grid item xs={12} sm={6}> <Controller name={`platformLinks.${index}.url`} control={control} render={({ field }) => ( <TextField {...field} label="URL du lien" variant="outlined" fullWidth type="url" size="small" error={!!errors.platformLinks?.[index]?.url} helperText={errors.platformLinks?.[index]?.url?.message} /> )}/> </Grid> <Grid item xs={12} sm={1} sx={{ textAlign: {xs: "right", sm: "left"}, pt: {xs: 1, sm: 0.5} }}> <Tooltip title="Supprimer ce lien"> <IconButton onClick={() => removePlatformLink(index)} color="error" size="small" disabled={platformLinkFields.length <= 1 && watchedTemplateType === "music"}> <RemoveCircleOutlineIcon /> </IconButton> </Tooltip> </Grid> </Grid> ))}
                <Button type="button" onClick={() => appendPlatformLink({ platform: "", url: "" })} startIcon={<AddCircleOutlineIcon />} variant="outlined" size="small" > Ajouter un lien </Button>
                {errors.platformLinks && typeof errors.platformLinks === "object" && !Array.isArray(errors.platformLinks) && ( <FormHelperText error sx={{mt:1}}>{errors.platformLinks.message || errors.platformLinks.root?.message}</FormHelperText> )}
                {watchedTemplateType === "landing_page" && platformLinkFields.length === 0 && (
                    <FormHelperText sx={{mt:1}}>Aucun lien externe ajouté. Cest optionnel pour les pages de destination.</FormHelperText>
                )}
              </FormControl>
            </Grid>
          )}
          
          {watchedTemplateType && (
            <>
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth margin="normal">
                  <FormLabel component="legend" sx={{ mb: 1.5, fontWeight: "medium", fontSize: "1.1rem" }}> Pixels de Tracking (Optionnel) </FormLabel>
                  <Grid container spacing={2}> <Grid item xs={12} sm={6}> <TextField {...register("trackingIds.ga4Id")} label="Google Analytics 4 ID (GA4)" fullWidth variant="outlined" error={!!errors.trackingIds?.ga4Id} helperText={errors.trackingIds?.ga4Id?.message} /> </Grid> <Grid item xs={12} sm={6}> <TextField {...register("trackingIds.gtmId")} label="Google Tag Manager ID (GTM)" fullWidth variant="outlined" error={!!errors.trackingIds?.gtmId} helperText={errors.trackingIds?.gtmId?.message} /> </Grid> <Grid item xs={12} sm={6}> <TextField {...register("trackingIds.metaPixelId")} label="Meta Pixel ID (Facebook/Instagram)" fullWidth variant="outlined" error={!!errors.trackingIds?.metaPixelId} helperText={errors.trackingIds?.metaPixelId?.message} /> </Grid> <Grid item xs={12} sm={6}> <TextField {...register("trackingIds.tiktokPixelId")} label="TikTok Pixel ID" fullWidth variant="outlined" error={!!errors.trackingIds?.tiktokPixelId} helperText={errors.trackingIds?.tiktokPixelId?.message} /> </Grid> </Grid>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth margin="normal">
                  <FormLabel component="legend" sx={{ mb: 1.5, fontWeight: "medium", fontSize: "1.1rem" }}> Paramètres UTM (Optionnel) </FormLabel>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField {...register("utmSource")} label="UTM Source" fullWidth variant="outlined" error={!!errors.utmSource} helperText={errors.utmSource?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField {...register("utmMedium")} label="UTM Medium" fullWidth variant="outlined" error={!!errors.utmMedium} helperText={errors.utmMedium?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField {...register("utmCampaign")} label="UTM Campaign" fullWidth variant="outlined" error={!!errors.utmCampaign} helperText={errors.utmCampaign?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <TextField {...register("utmTerm")} label="UTM Term" fullWidth variant="outlined" error={!!errors.utmTerm} helperText={errors.utmTerm?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <TextField {...register("utmContent")} label="UTM Content" fullWidth variant="outlined" error={!!errors.utmContent} helperText={errors.utmContent?.message} />
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel control={ <Controller name="isPublished" control={control} render={({ field }) => ( <Switch {...field} checked={field.value} color="primary" /> )} /> } label="Publier ce SmartLink (le rendre accessible publiquement)" />
                {errors.isPublished && ( <FormHelperText error> {errors.isPublished.message} </FormHelperText> )}
              </Grid>

              <Grid item xs={12} sx={{ mt: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Button 
                  variant="outlined" 
                  color="info" 
                  onClick={handleOpenPreviewModal} 
                  startIcon={<PreviewIcon />} 
                  disabled={!watchedTemplateType || isSmartLinkSubmitting}
                  sx={{ minWidth: { xs: "calc(50% - 8px)", sm: 180 }, py: 1.5 }}
                >
                  Prévisualiser
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={isSmartLinkSubmitting || loadingArtists || !watchedTemplateType} 
                  startIcon={isSmartLinkSubmitting ? <CircularProgress size={20} color="inherit" /> : null} 
                  sx={{ minWidth: { xs: "calc(50% - 8px)", sm: 180 }, py: 1.5 }}
                >
                  {isSmartLinkSubmitting ? "Enregistrement..." : isEditMode ? "Mettre à jour" : "Créer SmartLink"}
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </form>

      <Dialog open={isArtistModalOpen} onClose={handleCloseArtistModal} maxWidth="md" fullWidth>
        <DialogTitle>Créer un nouvel artiste</DialogTitle>
        <DialogContent sx={{pt:0.5}}>
          <ArtistCreatePage
            isInModal={true}
            onSuccessInModal={handleArtistCreatedInModal}
            onCancelInModal={handleCloseArtistModal}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewModalOpen} onClose={handleClosePreviewModal} maxWidth="lg" fullWidth>
        <DialogContent sx={{ p:0, "&:first-of-type": { paddingTop: 0 } }}>
          {previewData && <SmartLinkPreview formData={previewData} onClose={handleClosePreviewModal} />}
        </DialogContent>
      </Dialog>

    </Paper>
  );
};

export default SmartLinkForm;

