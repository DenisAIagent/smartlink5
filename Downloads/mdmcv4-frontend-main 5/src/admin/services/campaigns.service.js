import api from './api';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const campaignsService = {
  async getAll() {
    const cacheKey = 'campaigns_all';
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/campaigns');
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des campagnes:', error);
      throw error;
    }
  },

  async getById(id) {
    const cacheKey = `campaign_${id}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get(`/campaigns/${id}`);
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la campagne:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const response = await api.post('/campaigns', data);
      this.clearCache();
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la campagne:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/campaigns/${id}`, data);
      cache.delete(`campaign_${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la campagne:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await api.delete(`/campaigns/${id}`);
      cache.delete(`campaign_${id}`);
      this.clearCache();
    } catch (error) {
      console.error('Erreur lors de la suppression de la campagne:', error);
      throw error;
    }
  },

  async getStats(id, period = '7d') {
    const cacheKey = `campaign_stats_${id}_${period}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get(`/campaigns/${id}/stats?period=${period}`);
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  async getSmartlinks(id) {
    const cacheKey = `campaign_smartlinks_${id}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get(`/campaigns/${id}/smartlinks`);
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des SmartLinks:', error);
      throw error;
    }
  },

  async addSmartlink(id, smartlinkId) {
    try {
      const response = await api.post(`/campaigns/${id}/smartlinks`, { smartlinkId });
      cache.delete(`campaign_smartlinks_${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du SmartLink:', error);
      throw error;
    }
  },

  async removeSmartlink(id, smartlinkId) {
    try {
      await api.delete(`/campaigns/${id}/smartlinks/${smartlinkId}`);
      cache.delete(`campaign_smartlinks_${id}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du SmartLink:', error);
      throw error;
    }
  },

  async updateStatus(id, status) {
    try {
      const response = await api.patch(`/campaigns/${id}/status`, { status });
      cache.delete(`campaign_${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  },

  async exportData(id, format = 'csv') {
    try {
      const response = await api.get(`/campaigns/${id}/export?format=${format}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `campaign-${id}-export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors de l\'export des données:', error);
      throw error;
    }
  },

  clearCache() {
    cache.clear();
  },
};

export default campaignsService; 