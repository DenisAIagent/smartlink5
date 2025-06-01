import React, { createContext, useContext } from 'react';
import axios from 'axios';

// Configuration de base pour l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Création de l'instance axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('luxboard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si le token est expiré (401), rediriger vers la connexion
    if (error.response?.status === 401) {
      localStorage.removeItem('luxboard_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Création du contexte
const ApiContext = createContext();

// Hook personnalisé pour utiliser le contexte API
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

// Provider du contexte API
export const ApiProvider = ({ children }) => {
  // Méthodes génériques pour les appels API
  const api = {
    // GET request
    get: async (url, config = {}) => {
      try {
        const response = await apiClient.get(url, config);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // POST request
    post: async (url, data = {}, config = {}) => {
      try {
        const response = await apiClient.post(url, data, config);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // PUT request
    put: async (url, data = {}, config = {}) => {
      try {
        const response = await apiClient.put(url, data, config);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // DELETE request
    delete: async (url, config = {}) => {
      try {
        const response = await apiClient.delete(url, config);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // PATCH request
    patch: async (url, data = {}, config = {}) => {
      try {
        const response = await apiClient.patch(url, data, config);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  };

  // Méthodes spécifiques pour les différentes entités

  // Authentification
  const auth = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (profileData) => api.put('/auth/profile', profileData),
    changePassword: (passwordData) => api.put('/auth/password', passwordData),
    refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken })
  };

  // Prestataires
  const providers = {
    getAll: (params = {}) => api.get('/providers', { params }),
    getById: (id) => api.get(`/providers/${id}`),
    create: (providerData) => api.post('/providers', providerData),
    update: (id, providerData) => api.put(`/providers/${id}`, providerData),
    delete: (id) => api.delete(`/providers/${id}`),
    validate: (id) => api.post(`/providers/${id}/validate`),
    getNearby: (longitude, latitude, maxDistance) => 
      api.get('/providers/nearby', { 
        params: { longitude, latitude, maxDistance } 
      })
  };

  // Offres
  const offers = {
    getAll: (params = {}) => api.get('/offers', { params }),
    getById: (id) => api.get(`/offers/${id}`),
    create: (offerData) => api.post('/offers', offerData),
    update: (id, offerData) => api.put(`/offers/${id}`, offerData),
    delete: (id) => api.delete(`/offers/${id}`),
    use: (id) => api.post(`/offers/${id}/use`),
    validate: (id) => api.post(`/offers/${id}/validate`),
    getExpiringSoon: (days = 7) => 
      api.get('/offers/expiring-soon', { params: { days } })
  };

  // Événements
  const events = {
    getAll: (params = {}) => api.get('/events', { params }),
    getById: (id) => api.get(`/events/${id}`),
    create: (eventData) => api.post('/events', eventData),
    update: (id, eventData) => api.put(`/events/${id}`, eventData),
    delete: (id) => api.delete(`/events/${id}`),
    validate: (id) => api.post(`/events/${id}/validate`),
    register: (id) => api.post(`/events/${id}/register`),
    unregister: (id) => api.post(`/events/${id}/unregister`),
    getUpcoming: (limit = 10) => 
      api.get('/events/upcoming', { params: { limit } }),
    getNearby: (longitude, latitude, maxDistance) => 
      api.get('/events/nearby', { 
        params: { longitude, latitude, maxDistance } 
      })
  };

  // Utilisateurs (admin seulement)
  const users = {
    getAll: (params = {}) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
    toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),
    delete: (id) => api.delete(`/users/${id}`),
    getStats: () => api.get('/users/stats')
  };

  // Valeurs du contexte
  const value = {
    // Instance axios brute pour des cas spéciaux
    apiClient,
    
    // Méthodes génériques
    api,
    
    // Méthodes spécifiques par entité
    auth,
    providers,
    offers,
    events,
    users,
    
    // URL de base
    baseURL: API_BASE_URL
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

