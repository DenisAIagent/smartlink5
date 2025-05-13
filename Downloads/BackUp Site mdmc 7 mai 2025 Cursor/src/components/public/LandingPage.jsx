import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import { apiService } from '../../services/apiService';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import HeroSection from '../landing/common/HeroSection';
import SocialShare from '../landing/common/SocialShare';
import FAQSection from '../landing/common/FAQSection';
import PlatformsSection from '../landing/common/PlatformsSection';
import CampaignStatsShowcase from '../landing/common/CampaignStatsShowcase';
import { trackTimeOnPage, trackScroll } from '../../utils/analytics';

const LandingPage = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchPage();
    // Initialisation du tracking
    trackTimeOnPage();
    trackScroll();
  }, [slug]);

  const fetchPage = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get(`/landing-pages/${slug}`);
      setPage(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération de la page:', error);
      setError('Page non trouvée');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!page) {
    return null;
  }

  const pageUrl = `${window.location.origin}/landing/${page.slug}`;

  return (
    <>
      <Helmet>
        <title>{page?.seo?.title || 'MDMC - Marketing Digital pour Musiciens'}</title>
        <meta name="description" content={page?.seo?.description} />
        <meta name="keywords" content={page?.seo?.keywords} />
        <meta property="og:title" content={page?.seo?.title} />
        <meta property="og:description" content={page?.seo?.description} />
        <meta property="og:image" content={page?.seo?.image} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page?.seo?.title} />
        <meta name="twitter:description" content={page?.seo?.description} />
        <meta name="twitter:image" content={page?.seo?.image} />
      </Helmet>

      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: page.design?.primaryColor || theme.palette.background.default,
          color: page.design?.textColor || theme.palette.text.primary,
          fontFamily: page.design?.fontFamily || theme.typography.fontFamily
        }}
      >
        <HeroSection
          title={page.title}
          subtitle={page.subtitle}
          description={page.description}
          backgroundImage={page.backgroundImage}
          primaryButton={page.primaryButton}
          secondaryButton={page.secondaryButton}
          overlayColor={page.design?.overlayColor}
          textColor={page.design?.textColor}
        />

        <Container maxWidth="lg">
          <PlatformsSection
            title={page.platforms?.title}
            subtitle={page.platforms?.subtitle}
            platforms={page.platforms?.items}
          />

          <CampaignStatsShowcase
            title="Des résultats concrets, prouvés par les chiffres"
            darkMode={page.design?.darkMode || false}
            backgroundColor={page.design?.backgroundColor || theme.palette.background.default}
            textColor={page.design?.textColor}
          />

          <FAQSection
            title={page.faq?.title}
            subtitle={page.faq?.subtitle}
            questions={page.faq?.questions}
          />

          {/* Section de partage social */}
          <Box sx={{ py: 4, borderTop: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <SocialShare
              url={pageUrl}
              title={page.title}
              description={page.description}
            />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default LandingPage; 