import { STORAGE_KEYS } from '../config/constants';

class SEOService {
  constructor() {
    this.defaultMetadata = {
      title: 'MDMC Music Ads',
      description: 'Solutions innovantes de marketing musical pour les artistes et les labels',
      keywords: 'marketing musical, promotion artiste, solutions marketing, MDMC Music Ads',
      ogType: 'website',
      twitterCard: 'summary_large_image',
    };
  }

  updateMetadata(metadata = {}) {
    const mergedMetadata = {
      ...this.defaultMetadata,
      ...metadata,
    };

    // Mise à jour des balises meta de base
    this.updateBasicMetaTags(mergedMetadata);

    // Mise à jour des balises Open Graph
    this.updateOpenGraphTags(mergedMetadata);

    // Mise à jour des balises Twitter
    this.updateTwitterTags(mergedMetadata);

    // Mise à jour des balises JSON-LD
    this.updateJSONLD(mergedMetadata);

    // Mise à jour des balises alternates pour l'internationalisation
    this.updateAlternateLinks(mergedMetadata);

    // Mise à jour des balises de performance
    this.updatePerformanceMetaTags(mergedMetadata);
  }

  updateBasicMetaTags(metadata) {
    const tags = {
      'title': metadata.title,
      'description': metadata.description,
      'keywords': metadata.keywords,
      'robots': metadata.robots || 'index, follow',
      'viewport': 'width=device-width, initial-scale=1, viewport-fit=cover',
      'theme-color': metadata.themeColor || '#000000',
      'color-scheme': metadata.colorScheme || 'light dark',
    };

    Object.entries(tags).forEach(([name, content]) => {
      this.updateMetaTag(name, content);
    });
  }

  updateOpenGraphTags(metadata) {
    const ogTags = {
      'og:title': metadata.title,
      'og:description': metadata.description,
      'og:type': metadata.ogType,
      'og:url': metadata.url || window.location.href,
      'og:image': metadata.ogImage,
      'og:site_name': metadata.siteName || 'MDMC Music Ads',
      'og:locale': metadata.locale || 'fr_FR',
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      if (content) {
        this.updateMetaTag(property, content, 'property');
      }
    });
  }

  updateTwitterTags(metadata) {
    const twitterTags = {
      'twitter:card': metadata.twitterCard,
      'twitter:title': metadata.title,
      'twitter:description': metadata.description,
      'twitter:image': metadata.twitterImage || metadata.ogImage,
      'twitter:site': metadata.twitterSite,
      'twitter:creator': metadata.twitterCreator,
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      if (content) {
        this.updateMetaTag(name, content);
      }
    });
  }

  updateJSONLD(metadata) {
    const jsonLD = {
      '@context': 'https://schema.org',
      '@type': metadata.schemaType || 'WebSite',
      name: metadata.title,
      description: metadata.description,
      url: metadata.url || window.location.href,
      ...metadata.schemaData,
    };

    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLD);
  }

  updateAlternateLinks(metadata) {
    if (metadata.alternateLanguages) {
      const existingLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
      existingLinks.forEach(link => link.remove());

      Object.entries(metadata.alternateLanguages).forEach(([lang, url]) => {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = lang;
        link.href = url;
        document.head.appendChild(link);
      });
    }
  }

  updatePerformanceMetaTags(metadata) {
    const performanceTags = {
      'preconnect': metadata.preconnectUrls || [],
      'dns-prefetch': metadata.dnsPrefetchUrls || [],
      'resource-hints': metadata.resourceHints || [],
    };

    // Gestion des preconnect
    performanceTags.preconnect.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      document.head.appendChild(link);
    });

    // Gestion des dns-prefetch
    performanceTags['dns-prefetch'].forEach(url => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = url;
      document.head.appendChild(link);
    });

    // Gestion des resource hints
    performanceTags['resource-hints'].forEach(hint => {
      const link = document.createElement('link');
      Object.entries(hint).forEach(([key, value]) => {
        link[key] = value;
      });
      document.head.appendChild(link);
    });
  }

  updateMetaTag(name, content, attribute = 'name') {
    let tag = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attribute, name);
      document.head.appendChild(tag);
    }
    tag.content = content;
  }

  // Méthode pour générer un sitemap dynamique
  generateSitemap(routes) {
    const baseUrl = window.location.origin;
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${routes.map(route => `
          <url>
            <loc>${baseUrl}${route.path}</loc>
            <lastmod>${route.lastmod || new Date().toISOString()}</lastmod>
            <changefreq>${route.changefreq || 'weekly'}</changefreq>
            <priority>${route.priority || '0.5'}</priority>
          </url>
        `).join('')}
      </urlset>`;

    return sitemap;
  }

  // Méthode pour générer un robots.txt dynamique
  generateRobotsTxt(disallowPaths = []) {
    const baseUrl = window.location.origin;
    return `User-agent: *
Allow: /
${disallowPaths.map(path => `Disallow: ${path}`).join('\n')}
Sitemap: ${baseUrl}/sitemap.xml`;
  }
}

export default new SEOService(); 