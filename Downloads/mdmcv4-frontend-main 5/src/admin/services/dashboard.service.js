import api from './api';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const dashboardService = {
  async getStats(period = '7d') {
    const cacheKey = `dashboard_stats_${period}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get(`/dashboard/stats?period=${period}`);
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

  async getAlerts() {
    const cacheKey = 'dashboard_alerts';
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/dashboard/alerts');
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      throw error;
    }
  },

  async getRecentActivity(limit = 10) {
    const cacheKey = `dashboard_activity_${limit}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get(`/dashboard/activity?limit=${limit}`);
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'activité récente:', error);
      throw error;
    }
  },

  async getTopPerformers(period = '7d', limit = 5) {
    const cacheKey = `dashboard_top_performers_${period}_${limit}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get(`/dashboard/top-performers?period=${period}&limit=${limit}`);
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des meilleurs artistes:', error);
      throw error;
    }
  },

  async exportData(period = '7d', format = 'csv') {
    try {
      const response = await api.get(`/dashboard/export?period=${period}&format=${format}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard-export-${period}.${format}`);
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

export default dashboardService; 