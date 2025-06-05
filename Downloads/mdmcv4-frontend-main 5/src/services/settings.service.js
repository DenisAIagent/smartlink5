import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const settingsService = {
  async getSettings() {
    const response = await axios.get(`${API_URL}/settings`);
    return response.data;
  },

  async updateSettings(settings) {
    const response = await axios.put(`${API_URL}/settings`, settings);
    return response.data;
  },

  async resetSettings() {
    const response = await axios.post(`${API_URL}/settings/reset`);
    return response.data;
  }
};

export default settingsService; 