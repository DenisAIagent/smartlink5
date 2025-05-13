import React from 'react';
import {
  Box,
  Container,
  Typography,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const SocialShare = ({ url, title, description }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
  };

  const handleShare = (platform) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  return (
    <Box
      sx={{
        py: 4,
        textAlign: 'center'
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          color: theme.palette.text.secondary,
          mb: 2
        }}
      >
        {t('Partagez cette page')}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 2
        }}
      >
        <IconButton
          onClick={() => handleShare('facebook')}
          sx={{
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.1)'
            }
          }}
        >
          <FacebookIcon />
        </IconButton>
        <IconButton
          onClick={() => handleShare('twitter')}
          sx={{
            color: theme.palette.info.main,
            '&:hover': {
              backgroundColor: 'rgba(2, 136, 209, 0.1)'
            }
          }}
        >
          <TwitterIcon />
        </IconButton>
        <IconButton
          onClick={() => handleShare('linkedin')}
          sx={{
            color: theme.palette.info.dark,
            '&:hover': {
              backgroundColor: 'rgba(0, 105, 192, 0.1)'
            }
          }}
        >
          <LinkedInIcon />
        </IconButton>
        <IconButton
          onClick={() => handleShare('whatsapp')}
          sx={{
            color: theme.palette.success.main,
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.1)'
            }
          }}
        >
          <WhatsAppIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default SocialShare; 