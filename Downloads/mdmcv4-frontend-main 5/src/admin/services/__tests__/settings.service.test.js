import api from '../api';
import settingsService from '../settings.service';

// Mock de l'API
jest.mock('../api');

describe('settingsService', () => {
  beforeEach(() => {
    // Réinitialiser tous les mocks avant chaque test
    jest.clearAllMocks();
    settingsService.clearCache();
  });

  describe('getSettings', () => {
    it('devrait récupérer les paramètres depuis l\'API', async () => {
      const mockSettings = { theme: 'light', language: 'fr' };
      api.get.mockResolvedValueOnce({ data: mockSettings });

      const result = await settingsService.getSettings();

      expect(api.get).toHaveBeenCalledWith('/settings');
      expect(result).toEqual(mockSettings);
    });

    it('devrait utiliser le cache si les données sont récentes', async () => {
      const mockSettings = { theme: 'light', language: 'fr' };
      api.get.mockResolvedValueOnce({ data: mockSettings });

      // Premier appel
      await settingsService.getSettings();
      // Deuxième appel (devrait utiliser le cache)
      const result = await settingsService.getSettings();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSettings);
    });
  });

  describe('updateSettings', () => {
    it('devrait mettre à jour les paramètres via l\'API', async () => {
      const mockSettings = { theme: 'dark', language: 'en' };
      api.put.mockResolvedValueOnce({ data: mockSettings });

      const result = await settingsService.updateSettings(mockSettings);

      expect(api.put).toHaveBeenCalledWith('/settings', mockSettings);
      expect(result).toEqual(mockSettings);
    });

    it('devrait effacer le cache après la mise à jour', async () => {
      const mockSettings = { theme: 'dark', language: 'en' };
      api.put.mockResolvedValueOnce({ data: mockSettings });

      await settingsService.updateSettings(mockSettings);
      await settingsService.getSettings();

      expect(api.get).toHaveBeenCalled();
    });
  });

  describe('getThemes', () => {
    it('devrait récupérer les thèmes depuis l\'API', async () => {
      const mockThemes = [{ id: 1, name: 'Light' }, { id: 2, name: 'Dark' }];
      api.get.mockResolvedValueOnce({ data: mockThemes });

      const result = await settingsService.getThemes();

      expect(api.get).toHaveBeenCalledWith('/settings/themes');
      expect(result).toEqual(mockThemes);
    });
  });

  describe('updateTheme', () => {
    it('devrait mettre à jour le thème via l\'API', async () => {
      const mockTheme = { id: 2, name: 'Dark' };
      api.put.mockResolvedValueOnce({ data: mockTheme });

      const result = await settingsService.updateTheme(mockTheme);

      expect(api.put).toHaveBeenCalledWith('/settings/theme', { theme: mockTheme });
      expect(result).toEqual(mockTheme);
    });
  });

  describe('getNotificationSettings', () => {
    it('devrait récupérer les paramètres de notification depuis l\'API', async () => {
      const mockSettings = {
        emailNotifications: { enabled: true },
        inAppNotifications: { enabled: true },
      };
      api.get.mockResolvedValueOnce({ data: mockSettings });

      const result = await settingsService.getNotificationSettings();

      expect(api.get).toHaveBeenCalledWith('/settings/notifications');
      expect(result).toEqual(mockSettings);
    });
  });

  describe('updateNotificationSettings', () => {
    it('devrait mettre à jour les paramètres de notification via l\'API', async () => {
      const mockSettings = {
        emailNotifications: { enabled: false },
        inAppNotifications: { enabled: true },
      };
      api.put.mockResolvedValueOnce({ data: mockSettings });

      const result = await settingsService.updateNotificationSettings(mockSettings);

      expect(api.put).toHaveBeenCalledWith('/settings/notifications', mockSettings);
      expect(result).toEqual(mockSettings);
    });
  });

  describe('getInterfaceSettings', () => {
    it('devrait récupérer les paramètres d\'interface depuis l\'API', async () => {
      const mockSettings = {
        darkMode: true,
        fontSize: 'medium',
      };
      api.get.mockResolvedValueOnce({ data: mockSettings });

      const result = await settingsService.getInterfaceSettings();

      expect(api.get).toHaveBeenCalledWith('/settings/interface');
      expect(result).toEqual(mockSettings);
    });
  });

  describe('updateInterfaceSettings', () => {
    it('devrait mettre à jour les paramètres d\'interface via l\'API', async () => {
      const mockSettings = {
        darkMode: false,
        fontSize: 'large',
      };
      api.put.mockResolvedValueOnce({ data: mockSettings });

      const result = await settingsService.updateInterfaceSettings(mockSettings);

      expect(api.put).toHaveBeenCalledWith('/settings/interface', mockSettings);
      expect(result).toEqual(mockSettings);
    });
  });

  describe('getGeneralSettings', () => {
    it('devrait récupérer les paramètres généraux depuis l\'API', async () => {
      const mockSettings = {
        companyName: 'Test Company',
        timezone: 'UTC',
      };
      api.get.mockResolvedValueOnce({ data: mockSettings });

      const result = await settingsService.getGeneralSettings();

      expect(api.get).toHaveBeenCalledWith('/settings/general');
      expect(result).toEqual(mockSettings);
    });
  });

  describe('updateGeneralSettings', () => {
    it('devrait mettre à jour les paramètres généraux via l\'API', async () => {
      const mockSettings = {
        companyName: 'New Company',
        timezone: 'CET',
      };
      api.put.mockResolvedValueOnce({ data: mockSettings });

      const result = await settingsService.updateGeneralSettings(mockSettings);

      expect(api.put).toHaveBeenCalledWith('/settings/general', mockSettings);
      expect(result).toEqual(mockSettings);
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs lors de la récupération des paramètres', async () => {
      const mockError = new Error('API Error');
      api.get.mockRejectedValueOnce(mockError);

      await expect(settingsService.getSettings()).rejects.toThrow('API Error');
    });

    it('devrait gérer les erreurs lors de la mise à jour des paramètres', async () => {
      const mockError = new Error('API Error');
      api.put.mockRejectedValueOnce(mockError);

      await expect(settingsService.updateSettings({})).rejects.toThrow('API Error');
    });
  });
}); 