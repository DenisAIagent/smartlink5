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
  (response) => {
    // Si la requête réussit, on retourne directement les 'data' de la réponse.
    return response.data; // Le backend renvoie { success: true, data: ... } ou { success: false, error: '...' }
  },
  (error) => {
    console.error('API Error Interceptor caught an error:', error.response || error.message || error);

    let structuredError = {
      message: 'An unexpected error occurred. Please try again.',
      status: null,
      data: null,
    };

    if (error.response) {
      structuredError.status = error.response.status;
      structuredError.data = error.response.data;
      structuredError.message =
        error.response.data?.error || // Notre backend utilise { success: false, error: 'message' }
        error.response.data?.message ||
        error.message ||
        `Request failed with status ${error.response.status}`;

      if (error.response.status === 401) {
        console.warn('API Error 401: Unauthorized. Token might be invalid, expired, or not sent.');
        // Gérer la déconnexion ou la redirection ici si nécessaire, par exemple :
        // window.location.href = '/login'; // Redirection brutale
        // Ou émettre un événement pour que l'UI réagisse.
      }
    } else if (error.request) {
      structuredError.message = 'No response from server. Check your network connection or CORS policy on the server.';
    } else {
      structuredError.message = error.message;
    }
    return Promise.reject(structuredError);
  }
);

// --- Service d'Authentification ---
export const authService = {
  getMe: async () => apiClient.get('/auth/me'),
  login: async (credentials) => apiClient.post('/auth/login', credentials),
  logout: async () => apiClient.get('/auth/logout'),
  register: async (userData) => apiClient.post('/auth/register', userData),
  // updatePassword: async (passwords) => apiClient.put('/auth/updatepassword', passwords),
};

// --- Service pour les SmartLinks (MIS À JOUR) ---
export const smartLinkService = {
  create: async (data) => apiClient.post("/smartlinks", data), // POST /api/smartlinks
  getAll: async (params) => apiClient.get("/smartlinks", { params }), // GET /api/smartlinks
  getById: async (id) => apiClient.get(`/smartlinks/${id}`), // GET /api/smartlinks/:id
  update: async (id, data) => apiClient.put(`/smartlinks/${id}`, data), // PUT /api/smartlinks/:id
  deleteById: async (id) => apiClient.delete(`/smartlinks/${id}`), // DELETE /api/smartlinks/:id

  // Pour la page publique SmartLink (utilise les slugs, non protégée)
  // Le backend (route /api/smartlinks/public/:artistSlug/:trackSlug) appellera le middleware logClick
  getBySlugs: async (artistSlug, trackSlug) =>
    apiClient.get(`/smartlinks/public/${artistSlug}/${trackSlug}`), // CORRIGÉ: Chemin pour correspondre aux routes backend

  // Nouvelle méthode pour logguer un clic sur une plateforme spécifique
  logPlatformClick: async (smartlinkId, platformData) => // platformData pourrait être { platformName: 'Spotify' }
    apiClient.post(`/smartlinks/${smartlinkId}/log-platform-click`, platformData), // POST /api/smartlinks/:id/log-platform-click
};

// --- Service pour les Artistes ---
export const artistService = {
  createArtist: async (artistData) => apiClient.post('/artists', artistData), // POST /api/artists
  getAllArtists: async (params) => apiClient.get('/artists', { params }), // GET /api/artists
  getArtistBySlug: async (slug) => apiClient.get(`/artists/${slug}`), // GET /api/artists/:slug (assurez-vous que la route est /:slug et non /slug/:slug)
  updateArtist: async (slug, artistData) => apiClient.put(`/artists/${slug}`, artistData), // PUT /api/artists/:slug
  deleteArtist: async (slug) => apiClient.delete(`/artists/${slug}`), // DELETE /api/artists/:slug
  // getArtistById: async (id) => apiClient.get(`/artists/id/${id}`), // Si vous avez une route spécifique pour l'ID
};

// --- Service pour l'Upload d'Images ---
export const uploadService = {
  uploadImage: async (formData) => { // formData doit être un objet FormData
    return apiClient.post('/upload/image', formData, { // POST /api/upload/image
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

// --- Service pour les Reviews (Exemple, basé sur votre code) ---
export const reviewService = {
  createReview: async (reviewData) => apiClient.post('/reviews', reviewData),
  getReviews: async (params) => apiClient.get('/reviews', { params }),
  updateReviewStatus: async (id, statusData) => apiClient.put(`/reviews/${id}`, statusData),
  deleteReview: async (id) => apiClient.delete(`/reviews/${id}`),
};

// --- Service pour WordPress/Blog Posts (Exemple, basé sur votre code) ---
export const blogService = {
  getLatestPosts: async (limit = 3) => apiClient.get('/wordpress/posts', { params: { limit, sort: '-publishedDate' } }),
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
