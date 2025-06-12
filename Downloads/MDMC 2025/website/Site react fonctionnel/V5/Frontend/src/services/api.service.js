// src/services/api.service.js
import axios from 'axios';
// Supposons que api.config.js exporte quelque chose comme :
// export default {
//   BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api', // Votre URL backend avec /api
//   TIMEOUT: 10000,
// };
import API_CONFIG from '../config/api.config'; // Vérifiez que le chemin est correct

// Création d'une instance axios avec la configuration de base
const apiService = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour gérer les erreurs
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = 'Non autorisé. Veuillez vous connecter.';
          break;
        case 403:
          errorMessage = 'Accès refusé.';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée.';
          break;
        case 500:
          errorMessage = 'Erreur serveur.';
          break;
        default:
          errorMessage = error.response.data?.message || 'Une erreur est survenue';
      }
    }
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Service d'authentification
export const authService = {
  login: (credentials) => apiService.post(`${API_CONFIG.ENDPOINTS.AUTH}/login`, credentials),
  register: (userData) => apiService.post(`${API_CONFIG.ENDPOINTS.AUTH}/register`, userData),
  getCurrentUser: () => apiService.get(`${API_CONFIG.ENDPOINTS.AUTH}/me`),
  logout: () => apiService.post(`${API_CONFIG.ENDPOINTS.AUTH}/logout`)
};

// Service des smartlinks
export const smartLinkService = {
  create: (data) => apiService.post(API_CONFIG.ENDPOINTS.SMARTLINKS, data),
  getAll: () => apiService.get(API_CONFIG.ENDPOINTS.SMARTLINKS),
  getById: (id) => apiService.get(`${API_CONFIG.ENDPOINTS.SMARTLINKS}/${id}`),
  update: (id, data) => apiService.put(`${API_CONFIG.ENDPOINTS.SMARTLINKS}/${id}`, data),
  delete: (id) => apiService.delete(`${API_CONFIG.ENDPOINTS.SMARTLINKS}/${id}`)
};

// Service des artistes
export const artistService = {
  create: (data) => apiService.post(API_CONFIG.ENDPOINTS.ARTISTS, data),
  getAll: () => apiService.get(API_CONFIG.ENDPOINTS.ARTISTS),
  getById: (id) => apiService.get(`${API_CONFIG.ENDPOINTS.ARTISTS}/${id}`),
  update: (id, data) => apiService.put(`${API_CONFIG.ENDPOINTS.ARTISTS}/${id}`, data),
  delete: (id) => apiService.delete(`${API_CONFIG.ENDPOINTS.ARTISTS}/${id}`)
};

// Service d'upload
export const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiService.post(API_CONFIG.ENDPOINTS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// Service des avis
export const reviewService = {
  create: (data) => apiService.post(API_CONFIG.ENDPOINTS.REVIEWS, data),
  getAll: () => apiService.get(API_CONFIG.ENDPOINTS.REVIEWS),
  getById: (id) => apiService.get(`${API_CONFIG.ENDPOINTS.REVIEWS}/${id}`),
  update: (id, data) => apiService.put(`${API_CONFIG.ENDPOINTS.REVIEWS}/${id}`, data),
  delete: (id) => apiService.delete(`${API_CONFIG.ENDPOINTS.REVIEWS}/${id}`)
};

// Service du blog WordPress
export const blogService = {
  getLatestPosts: (limit = 3) => apiService.get(`${API_CONFIG.ENDPOINTS.WORDPRESS}/posts?per_page=${limit}`)
};

export default apiService;
