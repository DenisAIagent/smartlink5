import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, TextField, Button, Paper, Divider, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import musicPlatformService from '../../../../services/musicPlatform.service';

// Composants pour chaque section
import MetadataSection from './sections/MetadataSection';
import PlatformLinksSection from './sections/PlatformLinksSection';
import UtmSection from './sections/UtmSection';
import TrackingSection from './sections/TrackingSection';
import CustomizationSection from './sections/CustomizationSection';
import PreviewSection from './sections/PreviewSection';

const SmartLinkWizard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sourceData, setSourceData] = useState(null);
  const [platformLinks, setPlatformLinks] = useState([]);
  const [metadata, setMetadata] = useState({
    title: '',
    artist: '',
    isrc: '',
    label: '',
    distributor: '',
    releaseDate: '',
    artwork: ''
  });

  const { control, handleSubmit, setValue, getValues, watch } = useForm({
    defaultValues: {
      sourceUrl: '',
      title: '',
      artist: '',
      isrc: '',
      utmSource: 'wiseband',
      utmMedium: 'smartlink',
      utmCampaign: '',
      gaId: '',
      gtmId: '',
      adsId: '',
      metaPixelId: '',
      tiktokPixelId: '',
      template: 'standard',
      primaryColor: '#FF0000',
      ctaText: 'Écouter maintenant'
    }
  });

  // Observer les changements de valeur pour mettre à jour la prévisualisation
  const formValues = watch();

  const fetchLinksFromSource = async (sourceUrl) => {
    setIsLoading(true);
    try {
      const response = await musicPlatformService.fetchLinksFromSourceUrl(sourceUrl);
      console.log("Réponse de l'API:", response);
      
      if (response && response.success && response.data) {
        // Extraire les métadonnées
        const { title, artist, artwork, isrc, linksByPlatform } = response.data;
        
        setMetadata({
          title: title || '',
          artist: artist || '',
          isrc: isrc || '',
          label: response.data.label || '',
          distributor: response.data.distributor || '',
          releaseDate: response.data.releaseDate || '',
          artwork: artwork || ''
        });
        
        // Mettre à jour les champs du formulaire
        setValue('title', title || '');
        setValue('artist', artist || '');
        setValue('isrc', isrc || '');
        setValue('utmCampaign', `${artist || 'artist'}-${title || 'track'}`.toLowerCase().replace(/\s+/g, '-'));
        
        // Traiter les liens des plateformes
        if (linksByPlatform && typeof linksByPlatform === 'object') {
          const links = Object.entries(linksByPlatform).map(([platform, url]) => ({
            platform,
            url: typeof url === 'string' ? url.replace(/;$/, '') : url,
            enabled: true
          }));
          
          setPlatformLinks(links);
          setSourceData(response.data);
          
          toast.success(`${links.length} liens de plateformes trouvés !`);
        } else {
          toast.info("Aucun lien de plateforme trouvé.");
        }
      } else {
        toast.error(response?.error || "Impossible de récupérer les liens pour cette source.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des liens:", error);
      toast.error("Une erreur est survenue lors de la recherche des liens.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data) => {
    // Traitement final pour créer le SmartLink
    console.log("Données finales:", data, platformLinks);
    toast.info("Création du SmartLink en cours...");
    // Ici, appel à l'API pour créer le SmartLink
  };

  const handleSourceSubmit = () => {
    const sourceUrl = getValues('sourceUrl');
    if (!sourceUrl || sourceUrl.trim() === '') {
      toast.warn("Veuillez saisir un code ISRC/UPC ou une URL de plateforme musicale.");
      return;
    }
    
    fetchLinksFromSource(sourceUrl);
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Créer un Nouveau SmartLink
        </Typography>
        
        {!sourceData ? (
          // Étape 1: Saisie de la source
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSourceSubmit(); }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="sourceUrl"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="ISRC / UPC ou URL Spotify/Apple Music/Deezer"
                      variant="outlined"
                      fullWidth
                      required
                      helperText="Entrez un code ISRC, UPC ou une URL de plateforme musicale"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  type="submit" 
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                  fullWidth
                >
                  {isLoading ? 'Recherche en cours...' : 'Rechercher les liens'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        ) : (
          // Étape 2: Page intermédiaire avec toutes les sections
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              {/* Section Métadonnées */}
              <Grid item xs={12}>
                <MetadataSection 
                  metadata={metadata} 
                  control={control} 
                  setValue={setValue}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              {/* Section Liens des plateformes */}
              <Grid item xs={12}>
                <PlatformLinksSection 
                  platformLinks={platformLinks} 
                  setPlatformLinks={setPlatformLinks} 
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              {/* Section UTM */}
              <Grid item xs={12}>
                <UtmSection 
                  control={control} 
                  platformLinks={platformLinks}
                  setPlatformLinks={setPlatformLinks}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              {/* Section Outils de tracking */}
              <Grid item xs={12}>
                <TrackingSection control={control} />
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              {/* Section Personnalisation */}
              <Grid item xs={12}>
                <CustomizationSection control={control} />
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              {/* Section Prévisualisation */}
              <Grid item xs={12} md={6}>
                <PreviewSection 
                  metadata={metadata}
                  platformLinks={platformLinks}
                  formValues={formValues}
                />
              </Grid>
              
              {/* Boutons d'action */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setSourceData(null)}
                  >
                    Retour
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    type="submit"
                    disabled={isLoading}
                  >
                    Créer le SmartLink
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SmartLinkWizard;
