import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import {
  YouTube as YouTubeIcon,
  Facebook as FacebookIcon,
  MusicNote as MusicNoteIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const defaultPlatforms = [
  {
    icon: <YouTubeIcon />,
    name: "YouTube Ads",
    description: "Amplifiez votre visibilité sur la plus grande plateforme vidéo au monde",
    features: [
      "Publicité ciblée par intérêts et comportements",
      "Diffusion sur les vidéos et la page d'accueil",
      "Analytics détaillés et suivi des performances",
      "Optimisation automatique des campagnes"
    ]
  },
  {
    icon: <FacebookIcon />,
    name: "Meta Ads",
    description: "Touchez une audience massive sur Facebook et Instagram",
    features: [
      "Publicité sur les stories et le feed",
      "Ciblage précis par démographie",
      "Intégration avec Instagram",
      "Suivi des conversions et ROI"
    ]
  },
  {
    icon: <MusicNoteIcon />,
    name: "TikTok Ads",
    description: "Engagez la nouvelle génération sur la plateforme la plus dynamique",
    features: [
      "Publicité native et organique",
      "Tendances et hashtags viraux",
      "Création de contenu adapté",
      "Communauté active et engagée"
    ]
  }
];

const PlatformsSection = ({
  title = "Nos plateformes",
  subtitle = "Une présence optimale sur les réseaux les plus pertinents",
  platforms = defaultPlatforms,
  backgroundColor,
  textColor,
  iconColor
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: 8,
        backgroundColor: backgroundColor || theme.palette.background.default,
        color: textColor || theme.palette.text.primary
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '2rem', md: '2.5rem' },
            mb: 2
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            {subtitle}
          </Typography>
        )}
        <Grid container spacing={4}>
          {platforms.map((platform, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)'
                  },
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Box
                    sx={{
                      color: iconColor || theme.palette.primary.main,
                      mb: 2,
                      '& svg': {
                        fontSize: '3rem'
                      }
                    }}
                  >
                    {platform.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                  >
                    {platform.name}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    paragraph
                    sx={{ mb: 3 }}
                  >
                    {platform.description}
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {platform.features.map((feature, featureIndex) => (
                      <Typography
                        component="li"
                        key={featureIndex}
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {feature}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default PlatformsSection; 