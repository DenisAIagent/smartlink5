import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const reportsService = {
  async getReports() {
    const response = await axios.get(`${API_URL}/reports`);
    return response.data;
  },

  async generateReport(reportId, params) {
    const response = await axios.post(`${API_URL}/reports/${reportId}/generate`, params);
    return response.data;
  },

  async downloadReport(reportId) {
    const response = await axios.get(`${API_URL}/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async scheduleReport(reportId, schedule) {
    const response = await axios.post(`${API_URL}/reports/${reportId}/schedule`, schedule);
    return response.data;
  }
};

export default reportsService; 