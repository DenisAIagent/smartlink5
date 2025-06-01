const axios = require('axios');

// Configuration des APIs externes
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'demo-key';
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'demo-key';

// Service Unsplash
const unsplashService = {
  // Rechercher des images
  searchPhotos: async (query, page = 1, perPage = 10) => {
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query,
          page,
          per_page: perPage,
          orientation: 'landscape'
        },
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      });

      return {
        success: true,
        data: {
          total: response.data.total,
          totalPages: response.data.total_pages,
          currentPage: page,
          photos: response.data.results.map(photo => ({
            id: photo.id,
            description: photo.description || photo.alt_description,
            urls: {
              small: photo.urls.small,
              regular: photo.urls.regular,
              full: photo.urls.full
            },
            author: {
              name: photo.user.name,
              username: photo.user.username,
              profileUrl: photo.user.links.html
            },
            downloadUrl: photo.links.download_location
          }))
        }
      };
    } catch (error) {
      console.error('Erreur Unsplash:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Erreur lors de la recherche d\'images Unsplash'
      };
    }
  },

  // Obtenir une image aléatoire
  getRandomPhoto: async (query = 'luxury') => {
    try {
      const response = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          query,
          orientation: 'landscape'
        },
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      });

      return {
        success: true,
        data: {
          id: response.data.id,
          description: response.data.description || response.data.alt_description,
          urls: {
            small: response.data.urls.small,
            regular: response.data.urls.regular,
            full: response.data.urls.full
          },
          author: {
            name: response.data.user.name,
            username: response.data.user.username,
            profileUrl: response.data.user.links.html
          }
        }
      };
    } catch (error) {
      console.error('Erreur Unsplash random:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Erreur lors de la récupération d\'image aléatoire'
      };
    }
  }
};

// Service Pexels (alternative)
const pexelsService = {
  // Rechercher des images
  searchPhotos: async (query, page = 1, perPage = 10) => {
    try {
      const response = await axios.get('https://api.pexels.com/v1/search', {
        params: {
          query,
          page,
          per_page: perPage,
          orientation: 'landscape'
        },
        headers: {
          'Authorization': PEXELS_API_KEY
        }
      });

      return {
        success: true,
        data: {
          total: response.data.total_results,
          totalPages: Math.ceil(response.data.total_results / perPage),
          currentPage: page,
          photos: response.data.photos.map(photo => ({
            id: photo.id,
            description: photo.alt,
            urls: {
              small: photo.src.medium,
              regular: photo.src.large,
              full: photo.src.original
            },
            author: {
              name: photo.photographer,
              profileUrl: photo.photographer_url
            }
          }))
        }
      };
    } catch (error) {
      console.error('Erreur Pexels:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Erreur lors de la recherche d\'images Pexels'
      };
    }
  }
};

// Service principal qui utilise Unsplash en priorité, Pexels en fallback
const imageService = {
  // Rechercher des images avec fallback
  searchPhotos: async (query, page = 1, perPage = 10, source = 'unsplash') => {
    if (source === 'unsplash') {
      const result = await unsplashService.searchPhotos(query, page, perPage);
      if (result.success) {
        return result;
      }
      // Fallback vers Pexels si Unsplash échoue
      return await pexelsService.searchPhotos(query, page, perPage);
    } else {
      return await pexelsService.searchPhotos(query, page, perPage);
    }
  },

  // Obtenir une image aléatoire
  getRandomPhoto: async (query = 'luxury') => {
    return await unsplashService.getRandomPhoto(query);
  },

  // Obtenir des images par catégorie pour LuxBoard
  getLuxuryImages: async (category = 'luxury', page = 1, perPage = 10) => {
    const luxuryQueries = {
      'luxury': 'luxury hotel restaurant',
      'restaurant': 'fine dining restaurant',
      'hotel': 'luxury hotel suite',
      'spa': 'luxury spa wellness',
      'travel': 'luxury travel destination',
      'fashion': 'luxury fashion boutique',
      'jewelry': 'luxury jewelry diamonds',
      'car': 'luxury car sports car',
      'yacht': 'luxury yacht boat',
      'wine': 'luxury wine champagne'
    };

    const query = luxuryQueries[category] || luxuryQueries['luxury'];
    return await imageService.searchPhotos(query, page, perPage);
  }
};

module.exports = {
  imageService,
  unsplashService,
  pexelsService
};

