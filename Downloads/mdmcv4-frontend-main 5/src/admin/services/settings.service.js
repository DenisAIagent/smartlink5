import api from './api';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const settingsService = {
  async getSettings() {
    const cacheKey = 'settings';
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/settings');
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      throw error;
    }
  },

  async updateSettings(settings) {
    try {
      const response = await api.put('/settings', settings);
      cache.delete('settings');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      throw error;
    }
  },

  async getThemes() {
    const cacheKey = 'themes';
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/settings/themes');
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des thèmes:', error);
      throw error;
    }
  },

  async updateTheme(theme) {
    try {
      const response = await api.put('/settings/theme', { theme });
      cache.delete('settings');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du thème:', error);
      throw error;
    }
  },

  async getNotificationSettings() {
    const cacheKey = 'notification_settings';
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/settings/notifications');
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres de notification:', error);
      throw error;
    }
  },

  async updateNotificationSettings(settings) {
    try {
      const response = await api.put('/settings/notifications', settings);
      cache.delete('notification_settings');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres de notification:', error);
      throw error;
    }
  },

  async getInterfaceSettings() {
    const cacheKey = 'interface_settings';
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/settings/interface');
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres d\'interface:', error);
      throw error;
    }
  },

  async updateInterfaceSettings(settings) {
    try {
      const response = await api.put('/settings/interface', settings);
      cache.delete('interface_settings');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres d\'interface:', error);
      throw error;
    }
  },

  async getGeneralSettings() {
    const cacheKey = 'general_settings';
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/settings/general');
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres généraux:', error);
      throw error;
    }
  },

  async updateGeneralSettings(settings) {
    try {
      const response = await api.put('/settings/general', settings);
      cache.delete('general_settings');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres généraux:', error);
      throw error;
    }
  },

  clearCache() {
    cache.clear();
  },
};

export default settingsService; 