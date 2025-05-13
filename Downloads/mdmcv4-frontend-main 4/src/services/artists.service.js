import { api } from './api';

export const artistsService = {
  async create(data) {
    try {
      const response = await api.post('/artists', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'artiste');
    }
  },

  async getAll() {
    try {
      const response = await api.get('/artists');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des artistes');
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/artists/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'artiste');
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/artists/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'artiste');
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(`/artists/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de l\'artiste');
    }
  }
}; 