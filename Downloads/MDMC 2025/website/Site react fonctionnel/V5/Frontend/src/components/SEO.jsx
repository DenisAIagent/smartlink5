import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEO = ({ 
  title,
  description,
  keywords,
  image,
  type = 'website',
  lang,
  canonicalUrl,
  noindex = false
}) => {
  const { i18n } = useTranslation();
  const currentLang = lang || i18n.language;
  const siteUrl = 'https://www.mdmcmusicads.com';
  const fullUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
  const defaultImage = `${siteUrl}/images/mdmc-og-image.jpg`;

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
      {/* Balises de base */}
      <html lang={currentLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Balises Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:site_name" content="MDMC Music Ads" />
      <meta property="og:locale" content={currentLang} />
      
      {/* Balises Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || defaultImage} />
      
      {/* Balises de langue */}
      <link rel="alternate" hrefLang="fr" href={`${siteUrl}/fr`} />
      <link rel="alternate" hrefLang="en" href={`${siteUrl}/en`} />
      <link rel="alternate" hrefLang="x-default" href={siteUrl} />
      
      {/* Balises canoniques et robots */}
      <link rel="canonical" href={fullUrl} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default SEO; 