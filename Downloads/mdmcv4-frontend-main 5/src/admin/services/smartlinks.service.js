import api from './api';
import useStore from '../store/useStore';

const CACHE_TTL = {
  LIST: 5 * 60 * 1000, // 5 minutes
  DETAIL: 10 * 60 * 1000, // 10 minutes
};

export const smartlinksService = {
  async getAll() {
    try {
      const response = await api.get('/smartlinks');
      useStore.getState().setSmartlinks(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/smartlinks/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async create(data) {
    try {
      const response = await api.post('/smartlinks', data);
      useStore.getState().addSmartlink(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await api.put(`/smartlinks/${id}`, data);
      useStore.getState().updateSmartlink(id, response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async delete(id) {
    try {
      await api.delete(`/smartlinks/${id}`);
      useStore.getState().deleteSmartlink(id);
    } catch (error) {
      throw error;
    }
  },

  async detectFromUrl(url) {
    try {
      const response = await api.get(`/odesli?url=${encodeURIComponent(url)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getAnalytics(id, period = '7d') {
    try {
      const response = await api.get(`/smartlinks/${id}/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getQRCode(id) {
    try {
      const response = await api.get(`/smartlinks/${id}/qr`, {
        responseType: 'blob',
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      throw error;
    }
  },

  async exportData(ids, format = 'csv') {
    try {
      const response = await api.post('/smartlinks/export', {
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
};

export default smartlinksService; 