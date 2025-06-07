import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const CTASection = ({
  title = "Prêt à booster votre visibilité ?",
  subtitle = "Contactez-nous dès maintenant pour une consultation gratuite",
  buttonText = "Démarrer votre projet",
  buttonLink = "/contact",
  backgroundColor,
  textColor,
  buttonColor
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(buttonLink);
  };

  return (
    <Box
      sx={{
        py: 8,
        backgroundColor: backgroundColor || theme.palette.primary.main,
        color: textColor || theme.palette.primary.contrastText,
        textAlign: 'center'
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h2"
          component="h2"
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
            sx={{ mb: 4, opacity: 0.9 }}
          >
            {subtitle}
          </Typography>
        )}
        <Button
          variant="contained"
          size="large"
          onClick={handleClick}
          sx={{
            backgroundColor: buttonColor || theme.palette.background.paper,
            color: backgroundColor || theme.palette.primary.main,
            py: 2,
            px: 4,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: buttonColor || theme.palette.background.paper,
              opacity: 0.9
            }
          }}
        >
          {buttonText}
        </Button>
      </Container>
    </Box>
  );
};

export default CTASection; 