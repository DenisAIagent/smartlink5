import api from '../api';
import integrationsService from '../integrations.service';

// Mock de l'API
jest.mock('../api');

describe('integrationsService', () => {
  beforeEach(() => {
    // Réinitialiser tous les mocks avant chaque test
    jest.clearAllMocks();
    integrationsService.clearCache();
  });

  describe('getIntegrations', () => {
    it('devrait récupérer les intégrations disponibles', async () => {
      const mockIntegrations = [
        { id: 1, name: 'Plateforme A', status: 'connected' },
        { id: 2, name: 'Plateforme B', status: 'disconnected' },
      ];
      api.get.mockResolvedValueOnce({ data: mockIntegrations });

      const result = await integrationsService.getIntegrations();

      expect(api.get).toHaveBeenCalledWith('/integrations');
      expect(result).toEqual(mockIntegrations);
    });

    it('devrait utiliser le cache si les données sont récentes', async () => {
      const mockIntegrations = [{ id: 1, name: 'Plateforme A', status: 'connected' }];
      api.get.mockResolvedValueOnce({ data: mockIntegrations });

      await integrationsService.getIntegrations();
      const result = await integrationsService.getIntegrations();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockIntegrations);
    });
  });

  describe('connectIntegration', () => {
    it('devrait connecter une intégration', async () => {
      const mockCredentials = {
        platform: 'plateforme-a',
        apiKey: 'test-key',
        apiSecret: 'test-secret',
      };
      api.post.mockResolvedValueOnce({ data: { id: 1, ...mockCredentials } });

      const result = await integrationsService.connectIntegration(mockCredentials);

      expect(api.post).toHaveBeenCalledWith('/integrations/connect', mockCredentials);
      expect(result).toEqual({ id: 1, ...mockCredentials });
    });
  });

  describe('disconnectIntegration', () => {
    it('devrait déconnecter une intégration', async () => {
      api.post.mockResolvedValueOnce({});

      await integrationsService.disconnectIntegration('plateforme-a');

      expect(api.post).toHaveBeenCalledWith('/integrations/plateforme-a/disconnect');
    });
  });

  describe('getWebhooks', () => {
    it('devrait récupérer les webhooks d\'une plateforme', async () => {
      const mockWebhooks = [
        { id: 1, url: 'https://example.com/webhook1' },
        { id: 2, url: 'https://example.com/webhook2' },
      ];
      api.get.mockResolvedValueOnce({ data: mockWebhooks });

      const result = await integrationsService.getWebhooks('plateforme-a');

      expect(api.get).toHaveBeenCalledWith('/integrations/plateforme-a/webhooks');
      expect(result).toEqual(mockWebhooks);
    });
  });

  describe('createWebhook', () => {
    it('devrait créer un nouveau webhook', async () => {
      const mockWebhook = {
        platform: 'plateforme-a',
        url: 'https://example.com/webhook',
        events: ['event.created'],
      };
      api.post.mockResolvedValueOnce({ data: { id: 1, ...mockWebhook } });

      const result = await integrationsService.createWebhook(mockWebhook);

      expect(api.post).toHaveBeenCalledWith('/integrations/plateforme-a/webhooks', mockWebhook);
      expect(result).toEqual({ id: 1, ...mockWebhook });
    });
  });

  describe('updateWebhook', () => {
    it('devrait mettre à jour un webhook existant', async () => {
      const mockWebhook = {
        id: 1,
        url: 'https://example.com/webhook-updated',
        events: ['event.updated'],
      };
      api.put.mockResolvedValueOnce({ data: mockWebhook });

      const result = await integrationsService.updateWebhook('plateforme-a', 1, mockWebhook);

      expect(api.put).toHaveBeenCalledWith('/integrations/plateforme-a/webhooks/1', mockWebhook);
      expect(result).toEqual(mockWebhook);
    });
  });

  describe('deleteWebhook', () => {
    it('devrait supprimer un webhook', async () => {
      api.delete.mockResolvedValueOnce({});

      await integrationsService.deleteWebhook('plateforme-a', 1);

      expect(api.delete).toHaveBeenCalledWith('/integrations/plateforme-a/webhooks/1');
    });
  });

  describe('syncData', () => {
    it('devrait synchroniser les données avec une plateforme', async () => {
      const mockSync = {
        platform: 'plateforme-a',
        type: 'data',
        startDate: '2024-01-01',
      };
      api.post.mockResolvedValueOnce({ data: { id: 1, status: 'in_progress' } });

      const result = await integrationsService.syncData(mockSync);

      expect(api.post).toHaveBeenCalledWith('/integrations/plateforme-a/sync', mockSync);
      expect(result).toEqual({ id: 1, status: 'in_progress' });
    });
  });

  describe('getSyncStatus', () => {
    it('devrait récupérer le statut de synchronisation', async () => {
      const mockStatus = {
        id: 1,
        status: 'completed',
        progress: 100,
      };
      api.get.mockResolvedValueOnce({ data: mockStatus });

      const result = await integrationsService.getSyncStatus('plateforme-a', 1);

      expect(api.get).toHaveBeenCalledWith('/integrations/plateforme-a/sync/1');
      expect(result).toEqual(mockStatus);
    });
  });

  describe('getLogs', () => {
    it('devrait récupérer les logs d\'une plateforme', async () => {
      const mockLogs = [
        { id: 1, level: 'info', message: 'Sync started' },
        { id: 2, level: 'error', message: 'Sync failed' },
      ];
      api.get.mockResolvedValueOnce({ data: mockLogs });

      const result = await integrationsService.getLogs('plateforme-a', { level: 'error' });

      expect(api.get).toHaveBeenCalledWith('/integrations/plateforme-a/logs', {
        params: { level: 'error' },
      });
      expect(result).toEqual(mockLogs);
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs lors de la récupération des intégrations', async () => {
      const mockError = new Error('API Error');
      api.get.mockRejectedValueOnce(mockError);

      await expect(integrationsService.getIntegrations()).rejects.toThrow('API Error');
    });

    it('devrait gérer les erreurs lors de la connexion d\'une intégration', async () => {
      const mockError = new Error('API Error');
      api.post.mockRejectedValueOnce(mockError);

      await expect(integrationsService.connectIntegration({})).rejects.toThrow('API Error');
    });
  });
}); 