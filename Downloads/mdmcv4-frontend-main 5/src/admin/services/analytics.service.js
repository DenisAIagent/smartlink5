import api from './api';

const CACHE_TTL = {
  GENERAL: 5 * 60 * 1000, // 5 minutes
  DETAILED: 15 * 60 * 1000, // 15 minutes
};

const cache = new Map();

const getCacheKey = (endpoint, params) => {
  return `${endpoint}-${JSON.stringify(params)}`;
};

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL.GENERAL) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

export const analyticsService = {
  async getGeneralStats(period = '7d') {
    const cacheKey = getCacheKey('general-stats', { period });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/analytics/general', {
        params: { period },
      });
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getSmartlinkStats(smartlinkId, period = '7d') {
    const cacheKey = getCacheKey('smartlink-stats', { smartlinkId, period });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get(`/analytics/smartlinks/${smartlinkId}`, {
        params: { period },
      });
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getPlatformDistribution(period = '7d') {
    const cacheKey = getCacheKey('platform-distribution', { period });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/analytics/platforms', {
        params: { period },
      });
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getTopSmartlinks(period = '7d', limit = 10) {
    const cacheKey = getCacheKey('top-smartlinks', { period, limit });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/analytics/top-smartlinks', {
        params: { period, limit },
      });
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getDailyClicks(period = '7d') {
    const cacheKey = getCacheKey('daily-clicks', { period });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/analytics/daily-clicks', {
        params: { period },
      });
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async exportData(params) {
    try {
      const response = await api.post('/analytics/export', params, {
        responseType: 'blob',
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      throw error;
    }
  },

  clearCache() {
    cache.clear();
  },
};

export default analyticsService; 