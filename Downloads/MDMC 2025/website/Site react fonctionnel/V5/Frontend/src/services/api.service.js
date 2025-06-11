// src/services/api.service.js
import axios from 'axios';
// Supposons que api.config.js exporte quelque chose comme :
// export default {
//   BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api', // Votre URL backend avec /api
//   TIMEOUT: 10000,
// };
import API_CONFIG from '../config/api.config'; // Vérifiez que le chemin est correct

// Créer une instance Axios configurée
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL, // Doit être http://<backend_url>/api
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true, // ESSENTIEL pour que le navigateur envoie les cookies HttpOnly
});

// Intercepteur de réponse Axios
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error Interceptor caught an error:', error.response || error.message || error);

    let structuredError = {
      message: 'Une erreur inattendue est survenue. Veuillez réessayer.',
      status: null,
      data: null,
    };

    if (error.response) {
      structuredError.status = error.response.status;
      structuredError.data = error.response.data;
      structuredError.message =
        error.response.data?.error ||
        error.response.data?.message ||
        error.message ||
        `La requête a échoué avec le statut ${error.response.status}`;

      if (error.response.status === 401) {
        console.warn('API Error 401: Non autorisé. Le token est peut-être invalide, expiré ou non envoyé.');
      }
    } else if (error.request) {
      structuredError.message = 'Pas de réponse du serveur. Vérifiez votre connexion réseau ou la politique CORS du serveur.';
    } else {
      structuredError.message = error.message;
    }
    return Promise.reject(structuredError);
  }
);

// --- Service d'Authentification ---
export const authService = {
  getMe: async () => apiClient.get(`${API_CONFIG.ENDPOINTS.AUTH}/me`),
  login: async (credentials) => apiClient.post(`${API_CONFIG.ENDPOINTS.AUTH}/login`, credentials),
  logout: async () => apiClient.get(`${API_CONFIG.ENDPOINTS.AUTH}/logout`),
  register: async (userData) => apiClient.post(`${API_CONFIG.ENDPOINTS.AUTH}/register`, userData),
  // updatePassword: async (passwords) => apiClient.put('/auth/updatepassword', passwords),
};

// --- Service pour les SmartLinks (MIS À JOUR) ---
export const smartLinkService = {
  create: async (data) => apiClient.post(API_CONFIG.ENDPOINTS.SMARTLINKS, data),
  getAll: async (params) => apiClient.get(API_CONFIG.ENDPOINTS.SMARTLINKS, { params }),
  getById: async (id) => apiClient.get(`${API_CONFIG.ENDPOINTS.SMARTLINKS}/${id}`),
  update: async (id, data) => apiClient.put(`${API_CONFIG.ENDPOINTS.SMARTLINKS}/${id}`, data),
  deleteById: async (id) => apiClient.delete(`${API_CONFIG.ENDPOINTS.SMARTLINKS}/${id}`),

  // Pour la page publique SmartLink (utilise les slugs, non protégée)
  // Le backend (route /api/smartlinks/public/:artistSlug/:trackSlug) appellera le middleware logClick
  getBySlugs: async (artistSlug, trackSlug) =>
    apiClient.get(`${API_CONFIG.ENDPOINTS.SMARTLINKS}/public/${artistSlug}/${trackSlug}`),

  // Nouvelle méthode pour logguer un clic sur une plateforme spécifique
  logPlatformClick: async (smartlinkId, platformData) => // platformData pourrait être { platformName: 'Spotify' }
    apiClient.post(`${API_CONFIG.ENDPOINTS.SMARTLINKS}/${smartlinkId}/log-platform-click`, platformData),

  // Nouvelle méthode pour auto-fetch des liens de plateformes
  fetchPlatformLinks: async (sourceUrl) => 
    apiClient.post(`${API_CONFIG.ENDPOINTS.SMARTLINKS}/fetch-platform-links`, { sourceUrl }),
};

// --- Service pour les Artistes ---
export const artistService = {
  createArtist: async (artistData) => apiClient.post(API_CONFIG.ENDPOINTS.ARTISTS, artistData),
  getAllArtists: async (params) => apiClient.get(API_CONFIG.ENDPOINTS.ARTISTS, { params }),
  getArtistBySlug: async (slug) => apiClient.get(`${API_CONFIG.ENDPOINTS.ARTISTS}/${slug}`),
  updateArtist: async (slug, artistData) => apiClient.put(`${API_CONFIG.ENDPOINTS.ARTISTS}/${slug}`, artistData),
  deleteArtist: async (slug) => apiClient.delete(`${API_CONFIG.ENDPOINTS.ARTISTS}/${slug}`),
  // getArtistById: async (id) => apiClient.get(`/artists/id/${id}`), // Si vous avez une route spécifique pour l'ID
};

// --- Service pour l'Upload d'Images ---
export const uploadService = {
  uploadImage: async (formData) => {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.UPLOAD}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

// --- Service pour les Reviews (Exemple, basé sur votre code) ---
export const reviewService = {
  createReview: async (reviewData) => apiClient.post(API_CONFIG.ENDPOINTS.REVIEWS, reviewData),
  getReviews: async (params) => apiClient.get(API_CONFIG.ENDPOINTS.REVIEWS, { params }),
  updateReviewStatus: async (id, statusData) => apiClient.put(`${API_CONFIG.ENDPOINTS.REVIEWS}/${id}`, statusData),
  deleteReview: async (id) => apiClient.delete(`${API_CONFIG.ENDPOINTS.REVIEWS}/${id}`),
};

// --- Service pour WordPress/Blog Posts (Exemple, basé sur votre code) ---
export const blogService = {
  getLatestPosts: async (limit = 3) => 
    apiClient.get(`${API_CONFIG.ENDPOINTS.WORDPRESS}/posts`, { 
      params: { limit, sort: '-publishedDate' } 
    }),
  // getAllPosts: async (params) => apiClient.get('/wordpress/posts', { params }),
  // getPostBySlug: async (slug) => apiClient.get(`/wordpress/posts/slug/${slug}`),
};

// Exporter un objet contenant tous les services pour un accès facile et typé
const apiService = {
  auth: authService,
  smartlinks: smartLinkService,
  artists: artistService,
  upload: uploadService,
  reviews: reviewService,
  blog: blogService,
  // apiClientInstance: apiClient, // Si vous avez besoin d'accéder directement à l'instance
};

export default apiService;
