import api from './api';
import cacheService from '../utils/cache';
import logger from '../utils/logger';

const CACHE_TTL = {
  LIST: 5 * 60 * 1000, // 5 minutes
  DETAIL: 10 * 60 * 1000 // 10 minutes
};

export const artistsService = {
  async getAll() {
    const cacheKey = cacheService.generateKey('artists:all');
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await api.get('/artists');
      cacheService.set(cacheKey, response.data, CACHE_TTL.LIST);
      return response.data;
    } catch (error) {
      logger.error('Erreur lors de la récupération des artistes', { error });
      throw error;
    }
  },

  async getById(id) {
    const cacheKey = cacheService.generateKey(`artists:${id}`);
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await api.get(`/artists/${id}`);
      cacheService.set(cacheKey, response.data, CACHE_TTL.DETAIL);
      return response.data;
    } catch (error) {
      logger.error(`Erreur lors de la récupération de l'artiste ${id}`, { error });
      throw error;
    }
  },

  async create(data) {
    try {
      const response = await api.post('/artists', data);
      cacheService.delete(cacheService.generateKey('artists:all'));
      logger.info('Artiste créé avec succès', { id: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Erreur lors de la création de l\'artiste', { error, data });
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/artists/${id}`, data);
      cacheService.delete(cacheService.generateKey('artists:all'));
      cacheService.delete(cacheService.generateKey(`artists:${id}`));
      logger.info('Artiste mis à jour avec succès', { id });
      return response.data;
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour de l'artiste ${id}`, { error, data });
      throw error;
    }
  },

  async delete(id) {
    try {
      await api.delete(`/artists/${id}`);
      cacheService.delete(cacheService.generateKey('artists:all'));
      cacheService.delete(cacheService.generateKey(`artists:${id}`));
      logger.info('Artiste supprimé avec succès', { id });
    } catch (error) {
      logger.error(`Erreur lors de la suppression de l'artiste ${id}`, { error });
      throw error;
    }
  }
}; 