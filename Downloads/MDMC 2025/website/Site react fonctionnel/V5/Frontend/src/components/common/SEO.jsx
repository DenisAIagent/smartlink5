import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  type = 'website',
  lang = 'fr'
}) => {
  const { t } = useTranslation();
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.mdmcmusicads.com';
  const defaultImage = `${siteUrl}/images/og-image.jpg`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MDMC Music Ads',
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    sameAs: [
      'https://www.linkedin.com/company/mdmc-music-ads',
      'https://twitter.com/mdmcmusicads',
      'https://www.instagram.com/mdmcmusicads'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+33-1-23-45-67-89',
      contactType: 'customer service',
      availableLanguage: ['French', 'English']
    }
  };

  return (
    <Helmet>
      {/* Basic meta tags */}
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || defaultImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || defaultImage} />

      {/* Alternate language versions */}
      <link rel="alternate" hrefLang="fr" href={`${siteUrl}/fr`} />
      <link rel="alternate" hrefLang="en" href={`${siteUrl}/en`} />
      <link rel="alternate" hrefLang="x-default" href={siteUrl} />

      {/* Schema.org markup */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>

      {/* Preconnect to important domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
};

export default SEO; 