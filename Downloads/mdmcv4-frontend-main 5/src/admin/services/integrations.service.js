import api from './api';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const integrationsService = {
  async getIntegrations() {
    const cacheKey = 'integrations';
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/integrations');
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des intégrations:', error);
      throw error;
    }
  },

  async connectIntegration(platform, credentials) {
    try {
      const response = await api.post(`/integrations/${platform}/connect`, credentials);
      cache.delete('integrations');
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la connexion à ${platform}:`, error);
      throw error;
    }
  },

  async disconnectIntegration(platform) {
    try {
      await api.post(`/integrations/${platform}/disconnect`);
      cache.delete('integrations');
    } catch (error) {
      console.error(`Erreur lors de la déconnexion de ${platform}:`, error);
      throw error;
    }
  },

  async getWebhooks(platform) {
    const cacheKey = `webhooks_${platform}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get(`/integrations/${platform}/webhooks`);
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des webhooks pour ${platform}:`, error);
      throw error;
    }
  },

  async createWebhook(platform, webhook) {
    try {
      const response = await api.post(`/integrations/${platform}/webhooks`, webhook);
      cache.delete(`webhooks_${platform}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la création du webhook pour ${platform}:`, error);
      throw error;
    }
  },

  async updateWebhook(platform, webhookId, webhook) {
    try {
      const response = await api.put(`/integrations/${platform}/webhooks/${webhookId}`, webhook);
      cache.delete(`webhooks_${platform}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du webhook pour ${platform}:`, error);
      throw error;
    }
  },

  async deleteWebhook(platform, webhookId) {
    try {
      await api.delete(`/integrations/${platform}/webhooks/${webhookId}`);
      cache.delete(`webhooks_${platform}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du webhook pour ${platform}:`, error);
      throw error;
    }
  },

  async syncData(platform, options = {}) {
    try {
      const response = await api.post(`/integrations/${platform}/sync`, options);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la synchronisation des données pour ${platform}:`, error);
      throw error;
    }
  },

  async getSyncStatus(platform) {
    try {
      const response = await api.get(`/integrations/${platform}/sync/status`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du statut de synchronisation pour ${platform}:`, error);
      throw error;
    }
  },

  async getLogs(platform, filters = {}) {
    try {
      const response = await api.get(`/integrations/${platform}/logs`, { params: filters });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des logs pour ${platform}:`, error);
      throw error;
    }
  },

  clearCache() {
    cache.clear();
  },
};

export default integrationsService; 