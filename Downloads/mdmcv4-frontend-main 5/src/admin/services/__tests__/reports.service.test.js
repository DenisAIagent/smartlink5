import api from '../api';
import reportsService from '../reports.service';

// Mock de l'API
jest.mock('../api');

describe('reportsService', () => {
  beforeEach(() => {
    // Réinitialiser tous les mocks avant chaque test
    jest.clearAllMocks();
    reportsService.clearCache();
  });

  describe('getTemplates', () => {
    it('devrait récupérer les modèles de rapport depuis l\'API', async () => {
      const mockTemplates = [
        { id: 1, name: 'Rapport quotidien' },
        { id: 2, name: 'Rapport mensuel' },
      ];
      api.get.mockResolvedValueOnce({ data: mockTemplates });

      const result = await reportsService.getTemplates();

      expect(api.get).toHaveBeenCalledWith('/reports/templates');
      expect(result).toEqual(mockTemplates);
    });

    it('devrait utiliser le cache si les données sont récentes', async () => {
      const mockTemplates = [{ id: 1, name: 'Rapport quotidien' }];
      api.get.mockResolvedValueOnce({ data: mockTemplates });

      await reportsService.getTemplates();
      const result = await reportsService.getTemplates();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTemplates);
    });
  });

  describe('createTemplate', () => {
    it('devrait créer un nouveau modèle de rapport', async () => {
      const mockTemplate = { name: 'Nouveau rapport', description: 'Description' };
      api.post.mockResolvedValueOnce({ data: { id: 1, ...mockTemplate } });

      const result = await reportsService.createTemplate(mockTemplate);

      expect(api.post).toHaveBeenCalledWith('/reports/templates', mockTemplate);
      expect(result).toEqual({ id: 1, ...mockTemplate });
    });
  });

  describe('updateTemplate', () => {
    it('devrait mettre à jour un modèle de rapport existant', async () => {
      const mockTemplate = { id: 1, name: 'Rapport modifié' };
      api.put.mockResolvedValueOnce({ data: mockTemplate });

      const result = await reportsService.updateTemplate(1, mockTemplate);

      expect(api.put).toHaveBeenCalledWith('/reports/templates/1', mockTemplate);
      expect(result).toEqual(mockTemplate);
    });
  });

  describe('deleteTemplate', () => {
    it('devrait supprimer un modèle de rapport', async () => {
      api.delete.mockResolvedValueOnce({});

      await reportsService.deleteTemplate(1);

      expect(api.delete).toHaveBeenCalledWith('/reports/templates/1');
    });
  });

  describe('generateReport', () => {
    it('devrait générer un rapport', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/pdf' });
      api.post.mockResolvedValueOnce({ data: mockBlob });

      const params = {
        templateId: 1,
        format: 'pdf',
        period: 'last30days',
      };

      await reportsService.generateReport(params);

      expect(api.post).toHaveBeenCalledWith('/reports/generate', params, {
        responseType: 'blob',
      });
    });
  });

  describe('scheduleReport', () => {
    it('devrait planifier un rapport', async () => {
      const mockSchedule = {
        templateId: 1,
        frequency: 'daily',
        format: 'pdf',
        email: 'test@example.com',
      };
      api.post.mockResolvedValueOnce({ data: { id: 1, ...mockSchedule } });

      const result = await reportsService.scheduleReport(mockSchedule);

      expect(api.post).toHaveBeenCalledWith('/reports/schedule', mockSchedule);
      expect(result).toEqual({ id: 1, ...mockSchedule });
    });
  });

  describe('getScheduledReports', () => {
    it('devrait récupérer les rapports planifiés', async () => {
      const mockReports = [
        { id: 1, templateId: 1, frequency: 'daily' },
        { id: 2, templateId: 2, frequency: 'weekly' },
      ];
      api.get.mockResolvedValueOnce({ data: mockReports });

      const result = await reportsService.getScheduledReports();

      expect(api.get).toHaveBeenCalledWith('/reports/scheduled');
      expect(result).toEqual(mockReports);
    });

    it('devrait utiliser le cache si les données sont récentes', async () => {
      const mockReports = [{ id: 1, templateId: 1, frequency: 'daily' }];
      api.get.mockResolvedValueOnce({ data: mockReports });

      await reportsService.getScheduledReports();
      const result = await reportsService.getScheduledReports();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockReports);
    });
  });

  describe('updateScheduledReport', () => {
    it('devrait mettre à jour un rapport planifié', async () => {
      const mockSchedule = {
        id: 1,
        frequency: 'weekly',
        format: 'excel',
      };
      api.put.mockResolvedValueOnce({ data: mockSchedule });

      const result = await reportsService.updateScheduledReport(1, mockSchedule);

      expect(api.put).toHaveBeenCalledWith('/reports/scheduled/1', mockSchedule);
      expect(result).toEqual(mockSchedule);
    });
  });

  describe('deleteScheduledReport', () => {
    it('devrait supprimer un rapport planifié', async () => {
      api.delete.mockResolvedValueOnce({});

      await reportsService.deleteScheduledReport(1);

      expect(api.delete).toHaveBeenCalledWith('/reports/scheduled/1');
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs lors de la récupération des modèles', async () => {
      const mockError = new Error('API Error');
      api.get.mockRejectedValueOnce(mockError);

      await expect(reportsService.getTemplates()).rejects.toThrow('API Error');
    });

    it('devrait gérer les erreurs lors de la génération d\'un rapport', async () => {
      const mockError = new Error('API Error');
      api.post.mockRejectedValueOnce(mockError);

      await expect(reportsService.generateReport({})).rejects.toThrow('API Error');
    });
  });
}); 