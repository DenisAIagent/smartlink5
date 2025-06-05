import api from './api';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const reportsService = {
  async getTemplates() {
    const cacheKey = 'report_templates';
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/reports/templates');
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des modèles de rapport:', error);
      throw error;
    }
  },

  async createTemplate(template) {
    try {
      const response = await api.post('/reports/templates', template);
      cache.delete('report_templates');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du modèle de rapport:', error);
      throw error;
    }
  },

  async updateTemplate(id, template) {
    try {
      const response = await api.put(`/reports/templates/${id}`, template);
      cache.delete('report_templates');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du modèle de rapport:', error);
      throw error;
    }
  },

  async deleteTemplate(id) {
    try {
      await api.delete(`/reports/templates/${id}`);
      cache.delete('report_templates');
    } catch (error) {
      console.error('Erreur lors de la suppression du modèle de rapport:', error);
      throw error;
    }
  },

  async generateReport(params) {
    try {
      const response = await api.post('/reports/generate', params, {
        responseType: 'blob',
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-${new Date().toISOString()}.${params.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      throw error;
    }
  },

  async scheduleReport(schedule) {
    try {
      const response = await api.post('/reports/schedule', schedule);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la planification du rapport:', error);
      throw error;
    }
  },

  async getScheduledReports() {
    const cacheKey = 'scheduled_reports';
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await api.get('/reports/scheduled');
      const data = response.data;

      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports planifiés:', error);
      throw error;
    }
  },

  async updateScheduledReport(id, schedule) {
    try {
      const response = await api.put(`/reports/scheduled/${id}`, schedule);
      cache.delete('scheduled_reports');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rapport planifié:', error);
      throw error;
    }
  },

  async deleteScheduledReport(id) {
    try {
      await api.delete(`/reports/scheduled/${id}`);
      cache.delete('scheduled_reports');
    } catch (error) {
      console.error('Erreur lors de la suppression du rapport planifié:', error);
      throw error;
    }
  },

  clearCache() {
    cache.clear();
  },
};

export default reportsService; 