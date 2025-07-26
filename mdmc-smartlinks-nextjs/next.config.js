/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  
  // Configuration pour les images optimisées
  images: {
    domains: [
      'res.cloudinary.com',
      'via.placeholder.com',
      'i.scdn.co', // Spotify images
      'is1-ssl.mzstatic.com', // Apple Music images
      'i.ytimg.com', // YouTube images
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Optimisations de performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configuration pour les redirections
  async redirects() {
    return [
      // Redirection des anciennes routes vers les nouvelles
      {
        source: '/smartlinks/:artistSlug/:trackSlug',
        destination: '/:artistSlug/:trackSlug',
        permanent: true,
      },
    ];
  },

  // Variables d'environnement publiques
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;