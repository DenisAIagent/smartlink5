import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import SettingsPage from '../SettingsPage';
import settingsService from '../../../services/settings.service';

// Mock du service
jest.mock('../../../services/settings.service');

describe('SettingsPage', () => {
  const mockSettings = {
    general: {
      companyName: 'Test Company',
      timezone: 'Europe/Paris',
      dateFormat: 'DD/MM/YYYY',
    },
    interface: {
      theme: 'light',
      language: 'fr',
      darkMode: false,
    },
    notifications: {
      email: true,
      inApp: true,
      system: true,
    },
  };

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
    settingsService.getSettings.mockResolvedValue(mockSettings);
    settingsService.getThemes.mockResolvedValue(['light', 'dark', 'system']);
  });

  it('devrait charger les paramètres au montage', async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(settingsService.getSettings).toHaveBeenCalled();
    });

    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Europe/Paris')).toBeInTheDocument();
    expect(screen.getByDisplayValue('DD/MM/YYYY')).toBeInTheDocument();
  });

  it('devrait mettre à jour les paramètres généraux', async () => {
    settingsService.updateGeneralSettings.mockResolvedValue({ success: true });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
    });

    const companyInput = screen.getByDisplayValue('Test Company');
    fireEvent.change(companyInput, { target: { value: 'New Company' } });

    const saveButton = screen.getByText('Enregistrer');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(settingsService.updateGeneralSettings).toHaveBeenCalledWith({
        companyName: 'New Company',
        timezone: 'Europe/Paris',
        dateFormat: 'DD/MM/YYYY',
      });
    });
  });

  it('devrait mettre à jour les paramètres d\'interface', async () => {
    settingsService.updateInterfaceSettings.mockResolvedValue({ success: true });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Interface')).toBeInTheDocument();
    });

    // Cliquer sur l'onglet Interface
    fireEvent.click(screen.getByText('Interface'));

    // Changer le thème
    const themeSelect = screen.getByLabelText('Thème');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    // Activer le mode sombre
    const darkModeSwitch = screen.getByLabelText('Mode sombre');
    fireEvent.click(darkModeSwitch);

    const saveButton = screen.getByText('Enregistrer');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(settingsService.updateInterfaceSettings).toHaveBeenCalledWith({
        theme: 'dark',
        language: 'fr',
        darkMode: true,
      });
    });
  });

  it('devrait mettre à jour les paramètres de notification', async () => {
    settingsService.updateNotificationSettings.mockResolvedValue({ success: true });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    // Cliquer sur l'onglet Notifications
    fireEvent.click(screen.getByText('Notifications'));

    // Désactiver les notifications par email
    const emailSwitch = screen.getByLabelText('Notifications par email');
    fireEvent.click(emailSwitch);

    const saveButton = screen.getByText('Enregistrer');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(settingsService.updateNotificationSettings).toHaveBeenCalledWith({
        email: false,
        inApp: true,
        system: true,
      });
    });
  });

  it('devrait gérer les erreurs lors du chargement des paramètres', async () => {
    const mockError = new Error('Erreur de chargement');
    settingsService.getSettings.mockRejectedValue(mockError);

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Erreur lors du chargement des paramètres')).toBeInTheDocument();
    });
  });

  it('devrait gérer les erreurs lors de la mise à jour des paramètres', async () => {
    const mockError = new Error('Erreur de mise à jour');
    settingsService.updateGeneralSettings.mockRejectedValue(mockError);

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
    });

    const companyInput = screen.getByDisplayValue('Test Company');
    fireEvent.change(companyInput, { target: { value: 'New Company' } });

    const saveButton = screen.getByText('Enregistrer');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Erreur lors de la mise à jour des paramètres')).toBeInTheDocument();
    });
  });
}); 