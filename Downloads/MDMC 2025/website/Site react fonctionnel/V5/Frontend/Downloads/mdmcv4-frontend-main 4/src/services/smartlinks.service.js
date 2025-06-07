import api from './api';
import cacheService from '../utils/cache';
import logger from '../utils/logger';

const CACHE_TTL = {
  LIST: 5 * 60 * 1000, // 5 minutes
  DETAIL: 10 * 60 * 1000 // 10 minutes
};

export const smartlinksService = {
  async getAll() {
    const cacheKey = cacheService.generateKey('smartlinks:all');
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await api.get('/smartlinks');
      cacheService.set(cacheKey, response.data, CACHE_TTL.LIST);
      return response.data;
    } catch (error) {
      logger.error('Erreur lors de la récupération des smartlinks', { error });
      throw error;
    }
  },

  async getById(id) {
    const cacheKey = cacheService.generateKey(`smartlinks:${id}`);
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await api.get(`/smartlinks/${id}`);
      cacheService.set(cacheKey, response.data, CACHE_TTL.DETAIL);
      return response.data;
    } catch (error) {
      logger.error(`Erreur lors de la récupération du smartlink ${id}`, { error });
      throw error;
    }
  },

  async create(data) {
    try {
      const response = await api.post('/smartlinks', data);
      cacheService.delete(cacheService.generateKey('smartlinks:all'));
      logger.info('Smartlink créé avec succès', { id: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Erreur lors de la création du smartlink', { error, data });
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/smartlinks/${id}`, data);
      cacheService.delete(cacheService.generateKey('smartlinks:all'));
      cacheService.delete(cacheService.generateKey(`smartlinks:${id}`));
      logger.info('Smartlink mis à jour avec succès', { id });
      return response.data;
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour du smartlink ${id}`, { error, data });
      throw error;
    }
  },

  async delete(id) {
    try {
      await api.delete(`/smartlinks/${id}`);
      cacheService.delete(cacheService.generateKey('smartlinks:all'));
      cacheService.delete(cacheService.generateKey(`smartlinks:${id}`));
      logger.info('Smartlink supprimé avec succès', { id });
    } catch (error) {
      logger.error(`Erreur lors de la suppression du smartlink ${id}`, { error });
      throw error;
    }
  }
}; 