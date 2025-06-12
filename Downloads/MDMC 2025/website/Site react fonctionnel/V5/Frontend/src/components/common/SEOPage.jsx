import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useSEO } from '../../hooks/useSEO';
import { usePerformance } from '../../hooks/usePerformance';
import OptimizedComponent from './OptimizedComponent';

const SEOPage = ({
  children,
  title,
  description,
  keywords,
  image,
  type = 'website',
  structuredData,
  canonicalUrl,
  socialData,
  className,
  style,
  ...props
}) => {
  const { measureRender } = usePerformance('SEOPage');
  const endMeasure = measureRender();

  const { updateSEO, generateStructuredData, updateCanonicalUrl, updateSocialMediaTags } = useSEO({
    title,
    description,
    keywords,
    ogType: type,
    ogImage: image,
  });

  // Mise à jour des métadonnées SEO
  React.useEffect(() => {
    updateSEO();
  }, [updateSEO]);

  // Mise à jour des données structurées
  React.useEffect(() => {
    if (structuredData) {
      generateStructuredData(type, structuredData);
    }
  }, [structuredData, type, generateStructuredData]);

  // Mise à jour de l'URL canonique
  React.useEffect(() => {
    if (canonicalUrl) {
      updateCanonicalUrl(canonicalUrl);
    }
  }, [canonicalUrl, updateCanonicalUrl]);

  // Mise à jour des balises de médias sociaux
  React.useEffect(() => {
    if (socialData) {
      updateSocialMediaTags(socialData);
    }
  }, [socialData, updateSocialMediaTags]);

  return (
    <OptimizedComponent
      component="main"
      role="main"
      className={className}
      style={style}
      {...props}
    >
      <Box
        component="article"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </OptimizedComponent>
  );
};

SEOPage.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  keywords: PropTypes.string,
  image: PropTypes.string,
  type: PropTypes.string,
  structuredData: PropTypes.object,
  canonicalUrl: PropTypes.string,
  socialData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
  }),
  className: PropTypes.string,
  style: PropTypes.object,
};

export default memo(SEOPage); 