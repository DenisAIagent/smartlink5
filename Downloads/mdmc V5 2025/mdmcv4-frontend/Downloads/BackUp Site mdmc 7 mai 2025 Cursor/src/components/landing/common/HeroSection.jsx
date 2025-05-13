import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const HeroSection = ({
  title,
  subtitle,
  description,
  backgroundImage,
  primaryButton,
  secondaryButton,
  overlayColor,
  textColor
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: overlayColor || 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          color: textColor || theme.palette.common.white
        }}
      >
        <Box
          sx={{
            maxWidth: '800px',
            mx: 'auto',
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              mb: 2
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                mb: 3,
                opacity: 0.9
              }}
            >
              {subtitle}
            </Typography>
          )}
          {description && (
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.8
              }}
            >
              {description}
            </Typography>
          )}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            {primaryButton && (
              <Button
                variant="contained"
                size="large"
                href={primaryButton.link}
                sx={{
                  minWidth: 200,
                  backgroundColor: primaryButton.color || theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: primaryButton.color || theme.palette.primary.dark
                  }
                }}
              >
                {primaryButton.text}
              </Button>
            )}
            {secondaryButton && (
              <Button
                variant="outlined"
                size="large"
                href={secondaryButton.link}
                sx={{
                  minWidth: 200,
                  borderColor: textColor || theme.palette.common.white,
                  color: textColor || theme.palette.common.white,
                  '&:hover': {
                    borderColor: textColor || theme.palette.common.white,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {secondaryButton.text}
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection; 