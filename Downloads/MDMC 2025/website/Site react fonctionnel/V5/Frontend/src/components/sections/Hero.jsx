import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { useAnimations } from '../../hooks/useAnimations';
import { AnimatedText, AnimatedButton } from '../common/AnimatedElement';

const Hero = ({ openSimulator }) => {
  const { t } = useTranslation();
  const { getSequenceAnimation } = useAnimations();
  const sequence = getSequenceAnimation();

  return (
    <Box
      component={motion.section}
      initial="hidden"
      animate="show"
      variants={sequence.container}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center' }}>
          <AnimatedText
            component={motion.h1}
            variants={sequence.item}
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 700,
              mb: 3
            }}
          >
            {t('hero.title', 'Solutions de Marketing Musical Innovantes')}
          </AnimatedText>

          <AnimatedText
            component={motion.p}
            variants={sequence.item}
            sx={{
              fontSize: { xs: '1.1rem', md: '1.5rem' },
              mb: 4,
              opacity: 0.9
            }}
          >
            {t('hero.subtitle', 'Maximisez votre visibilité et votre engagement avec nos outils spécialisés pour artistes et labels.')}
          </AnimatedText>

          <Box
            component={motion.div}
            variants={sequence.item}
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <AnimatedButton
              variant="contained"
              color="primary"
              size="large"
              onClick={openSimulator}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none'
              }}
            >
              {t('hero.cta.primary', 'Essayer la démo')}
            </AnimatedButton>

            <AnimatedButton
              variant="outlined"
              color="inherit"
              size="large"
              href="#contact"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2
                }
              }}
            >
              {t('hero.cta.secondary', 'Nous contacter')}
            </AnimatedButton>
          </Box>
        </Box>
      </Container>

      {/* Éléments décoratifs animés */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none'
        }}
      />
    </Box>
  );
};

export default Hero;
