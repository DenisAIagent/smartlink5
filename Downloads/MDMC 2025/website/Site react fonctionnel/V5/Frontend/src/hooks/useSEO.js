import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import seoService from '../services/seo.service';
import { useStore } from '../store';

export const useSEO = (metadata = {}) => {
  const location = useLocation();
  const { ui: { language } } = useStore();

  const updateSEO = useCallback((customMetadata = {}) => {
    const baseUrl = window.location.origin;
    const currentPath = location.pathname;
    const fullUrl = `${baseUrl}${currentPath}`;

    const defaultMetadata = {
      url: fullUrl,
      locale: language === 'fr' ? 'fr_FR' : 'en_US',
      alternateLanguages: {
        fr: `${baseUrl}/fr${currentPath}`,
        en: `${baseUrl}/en${currentPath}`,
      },
      preconnectUrls: [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://api.mdmcmusicads.com',
      ],
      dnsPrefetchUrls: [
        'https://cdn.mdmcmusicads.com',
        'https://analytics.mdmcmusicads.com',
      ],
      resourceHints: [
        {
          rel: 'preload',
          as: 'font',
          href: '/fonts/custom-font.woff2',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
      ],
    };

    const mergedMetadata = {
      ...defaultMetadata,
      ...metadata,
    };

    seoService.updateMetadata(mergedMetadata);
  }, [location.pathname, language]);

  useEffect(() => {
    updateSEO(metadata);
  }, [updateSEO, metadata]);

  const generateStructuredData = useCallback((type, data) => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data,
    };

    seoService.updateMetadata({
      schemaType: type,
      schemaData: structuredData,
    });
  }, []);

  const updateCanonicalUrl = useCallback((url) => {
    seoService.updateMetadata({
      canonicalUrl: url,
    });
  }, []);

  const updateSocialMediaTags = useCallback((socialData) => {
    seoService.updateMetadata({
      ogImage: socialData.image,
      ogTitle: socialData.title,
      ogDescription: socialData.description,
      twitterImage: socialData.image,
      twitterTitle: socialData.title,
      twitterDescription: socialData.description,
    });
  }, []);

  return {
    updateSEO,
    generateStructuredData,
    updateCanonicalUrl,
    updateSocialMediaTags,
  };
};

export default useSEO; 