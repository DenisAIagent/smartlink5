import axios from 'axios';

// Configuration de base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Instance axios pour l'authentification
const authClient = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification
authClient.interceptors.request.use(
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

// Service d'authentification
export const authService = {
  // Connexion
  login: async (email, password) => {
    const response = await authClient.post('/login', { email, password });
    return response.data;
  },

  // Inscription
  register: async (userData) => {
    const response = await authClient.post('/register', userData);
    return response.data;
  },

  // Déconnexion
  logout: async () => {
    const response = await authClient.post('/logout');
    return response.data;
  },

  // Récupérer le profil
  getProfile: async () => {
    const response = await authClient.get('/profile');
    return response.data.data.user;
  },

  // Mettre à jour le profil
  updateProfile: async (profileData) => {
    const response = await authClient.put('/profile', profileData);
    return response.data;
  },

  // Changer le mot de passe
  changePassword: async (passwordData) => {
    const response = await authClient.put('/password', passwordData);
    return response.data;
  },

  // Rafraîchir le token
  refreshToken: async (refreshToken) => {
    const response = await authClient.post('/refresh', { refreshToken });
    return response.data;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    const token = localStorage.getItem('luxboard_token');
    return !!token;
  },

  // Récupérer le token stocké
  getToken: () => {
    return localStorage.getItem('luxboard_token');
  },

  // Supprimer le token
  removeToken: () => {
    localStorage.removeItem('luxboard_token');
  }
};

