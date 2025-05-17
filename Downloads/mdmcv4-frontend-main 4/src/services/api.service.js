import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Erreur avec réponse du serveur
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Non authentifié
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Non autorisé
          throw new Error('Vous n\'avez pas les permissions nécessaires');
        case 404:
          // Ressource non trouvée
          throw new Error('La ressource demandée n\'existe pas');
        case 500:
          // Erreur serveur
          throw new Error('Une erreur est survenue sur le serveur');
        default:
          // Autres erreurs
          throw new Error(data.message || 'Une erreur est survenue');
      }
    } else if (error.request) {
      // Pas de réponse du serveur
      throw new Error('Le serveur ne répond pas');
    } else {
      // Erreur lors de la configuration de la requête
      throw new Error('Une erreur est survenue lors de la requête');
    }
  }
);

export default api; 