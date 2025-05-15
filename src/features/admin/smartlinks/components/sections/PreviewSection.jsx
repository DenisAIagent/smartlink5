import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, List, ListItem, ListItemIcon, ListItemText, Divider, Paper } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { styled } from '@mui/material/styles';

// Composant stylisé pour le smartphone
const SmartphonePreview = styled(Paper)(({ theme, primaryColor }) => ({
  width: 300,
  height: 600,
  margin: '0 auto',
  borderRadius: 20,
  overflow: 'hidden',
  border: '10px solid #333',
  position: 'relative',
  boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  backgroundColor: '#fff',
}));

// Composant pour la barre de statut
const StatusBar = styled(Box)(({ theme }) => ({
  height: 30,
  backgroundColor: '#333',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: '0 10px',
  color: 'white',
  fontSize: '12px',
}));

// Composant pour le contenu du SmartLink
const SmartLinkContent = styled(Box)(({ theme, primaryColor }) => ({
  height: 'calc(100% - 30px)',
  overflow: 'auto',
  backgroundColor: '#f5f5f5',
}));

// Composant pour le bouton de plateforme
const PlatformButton = styled(Box)(({ theme, primaryColor }) => ({
  backgroundColor: primaryColor || theme.palette.primary.main,
  color: 'white',
  padding: '12px 16px',
  borderRadius: 8,
  margin: '8px 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    opacity: 0.9,
    transform: 'translateY(-2px)',
  },
}));

// Logos des plateformes
const platformLogos = {
  spotify: 'https://services.linkfire.com/logo_spotify_onlight.svg',
  deezer: 'https://services.linkfire.com/logo_deezer_onlight.svg',
  appleMusic: 'https://services.linkfire.com/logo_applemusic_onlight.svg',
  youtube: 'https://services.linkfire.com/logo_youtube_onlight.svg',
  youtubeMusic: 'https://services.linkfire.com/logo_youtubemusic_onlight.svg',
  amazonMusic: 'https://services.linkfire.com/logo_amazonmusic_onlight.svg',
  tidal: 'https://services.linkfire.com/logo_tidal_onlight.svg',
  soundcloud: 'https://services.linkfire.com/logo_soundcloud_onlight.svg',
};

// Fonction pour obtenir le logo d'une plateforme
const getPlatformLogo = (platform) => {
  const normalizedPlatform = platform.toLowerCase().replace(/\s+/g, '');
  
  // Correspondances spécifiques
  const mappings = {
    'spotify': 'spotify',
    'deezer': 'deezer',
    'applemusic': 'appleMusic',
    'apple music': 'appleMusic',
    'youtube': 'youtube',
    'youtubemusic': 'youtubeMusic',
    'youtube music': 'youtubeMusic',
    'amazonmusic': 'amazonMusic',
    'amazon music': 'amazonMusic',
    'tidal': 'tidal',
    'soundcloud': 'soundcloud',
  };
  
  const key = mappings[normalizedPlatform] || normalizedPlatform;
  return platformLogos[key] || 'https://via.placeholder.com/40x40?text=' + platform.substring(0, 2).toUpperCase();
};

const PreviewSection = ({ metadata, platformLinks, formValues }) => {
  const primaryColor = formValues.primaryColor || '#FF0000';
  const ctaText = formValues.ctaText || 'Écouter maintenant';
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Prévisualisation
      </Typography>
      
      <SmartphonePreview primaryColor={primaryColor}>
        <StatusBar>
          <Typography variant="caption">18:19</Typography>
        </StatusBar>
        <SmartLinkContent primaryColor={primaryColor}>
          {/* Header avec pochette et infos */}
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              image={metadata.artwork || 'https://via.placeholder.com/300x300?text=Pochette+non+disponible'}
              alt={metadata.title}
              sx={{ height: 200, objectFit: 'cover' }}
            />
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                p: 2
              }}
            >
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                {formValues.title || metadata.title || 'Titre du morceau'}
              </Typography>
              <Typography variant="subtitle1" component="div">
                {formValues.artist || metadata.artist || 'Nom de l\'artiste'}
              </Typography>
            </Box>
          </Box>
          
          {/* Contenu principal */}
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Choisissez votre plateforme préférée
            </Typography>
            
            {/* Boutons des plateformes */}
            <Box sx={{ my: 2 }}>
              {platformLinks.filter(link => link.enabled).map((link, index) => (
                <PlatformButton key={index} primaryColor={primaryColor}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box 
                      component="img" 
                      src={getPlatformLogo(link.platform)} 
                      alt={link.platform}
                      sx={{ width: 24, height: 24, mr: 2 }}
                    />
                    <Typography variant="button">
                      {ctaText} sur {link.platform}
                    </Typography>
                  </Box>
                </PlatformButton>
              ))}
            </Box>
            
            {/* Informations supplémentaires */}
            <Card variant="outlined" sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Informations
                </Typography>
                <List dense>
                  {metadata.isrc && (
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <MusicNoteIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="ISRC" 
                        secondary={metadata.isrc} 
                        primaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  )}
                  {metadata.label && (
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <MusicNoteIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Label" 
                        secondary={metadata.label} 
                        primaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  )}
                  {metadata.releaseDate && (
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <MusicNoteIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Date de sortie" 
                        secondary={metadata.releaseDate} 
                        primaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
            
            {/* Footer */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Propulsé par MDM Music Ads
              </Typography>
            </Box>
          </Box>
        </SmartLinkContent>
      </SmartphonePreview>
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
        Cette prévisualisation montre l'apparence approximative de votre SmartLink sur mobile.
      </Typography>
    </Box>
  );
};

export default PreviewSection;
