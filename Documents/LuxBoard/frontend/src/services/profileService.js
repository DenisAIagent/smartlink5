import axios from 'axios';

const API_URL = '/api';

// Configuration d'axios pour inclure le token dans les requêtes
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const profileService = {
  // Récupérer les informations du profil
  getProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mettre à jour les informations du profil
  updateProfile: async (profileData) => {
    try {
      const response = await axios.put(`${API_URL}/profile`, profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Changer le mot de passe
  changePassword: async (passwordData) => {
    try {
      const response = await axios.put(`${API_URL}/profile/password`, passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mettre à jour l'avatar
  updateAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await axios.post(`${API_URL}/profile/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 