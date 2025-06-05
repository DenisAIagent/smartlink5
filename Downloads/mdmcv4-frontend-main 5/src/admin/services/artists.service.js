import api from './api';
import useStore from '../store/useStore';

const CACHE_TTL = {
  LIST: 5 * 60 * 1000, // 5 minutes
  DETAIL: 10 * 60 * 1000, // 10 minutes
};

const cache = new Map();

const getCacheKey = (endpoint, params) => {
  return `${endpoint}-${JSON.stringify(params)}`;
};

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL.LIST) {
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

export const artistsService = {
  async getAll() {
    try {
      const response = await api.get('/artists');
      useStore.getState().setArtists(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getById(id) {
    const cacheKey = getCacheKey('artist', { id });
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get(`/artists/${id}`);
      setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async create(data) {
    try {
      const response = await api.post('/artists', data);
      useStore.getState().addArtist(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/artists/${id}`, data);
      useStore.getState().updateArtist(id, response.data);
      cache.delete(getCacheKey('artist', { id }));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async delete(id) {
    try {
      await api.delete(`/artists/${id}`);
      useStore.getState().deleteArtist(id);
      cache.delete(getCacheKey('artist', { id }));
    } catch (error) {
      throw error;
    }
  },

  async detectFromSpotify(url) {
    try {
      const response = await api.get(`/spotify/artist?url=${encodeURIComponent(url)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getSmartlinks(id) {
    try {
      const response = await api.get(`/artists/${id}/smartlinks`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getAnalytics(id, period = '7d') {
    try {
      const response = await api.get(`/artists/${id}/analytics`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async exportData(ids, format = 'csv') {
    try {
      const response = await api.post('/artists/export', {
        ids,
        format,
      }, {
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

export default artistsService; 