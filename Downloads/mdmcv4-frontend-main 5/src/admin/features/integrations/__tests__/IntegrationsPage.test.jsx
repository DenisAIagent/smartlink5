import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IntegrationsPage from '../IntegrationsPage';
import integrationsService from '../../../services/integrations.service';

// Mock du service
jest.mock('../../../services/integrations.service');

describe('IntegrationsPage', () => {
  const mockIntegrations = [
    {
      id: 1,
      name: 'Plateforme A',
      status: 'connected',
      icon: 'platform-a-icon',
    },
    {
      id: 2,
      name: 'Plateforme B',
      status: 'disconnected',
      icon: 'platform-b-icon',
    },
  ];

  const mockWebhooks = [
    {
      id: 1,
      url: 'https://example.com/webhook1',
      events: ['event.created'],
      status: 'active',
    },
  ];

  const mockLogs = [
    {
      id: 1,
      level: 'info',
      message: 'Sync started',
      timestamp: '2024-03-20T10:00:00Z',
    },
  ];

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
    integrationsService.getIntegrations.mockResolvedValue(mockIntegrations);
    integrationsService.getWebhooks.mockResolvedValue(mockWebhooks);
    integrationsService.getLogs.mockResolvedValue(mockLogs);
  });

  it('devrait charger les intégrations au montage', async () => {
    render(<IntegrationsPage />);

    await waitFor(() => {
      expect(integrationsService.getIntegrations).toHaveBeenCalled();
    });

    expect(screen.getByText('Plateforme A')).toBeInTheDocument();
    expect(screen.getByText('Plateforme B')).toBeInTheDocument();
  });

  it('devrait connecter une intégration', async () => {
    integrationsService.connectIntegration.mockResolvedValue({
      id: 2,
      name: 'Plateforme B',
      status: 'connected',
    });

    render(<IntegrationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Plateforme B')).toBeInTheDocument();
    });

    const connectButton = screen.getAllByText('Connecter')[0];
    fireEvent.click(connectButton);

    // Remplir le formulaire de connexion
    const apiKeyInput = screen.getByLabelText('Clé API');
    fireEvent.change(apiKeyInput, { target: { value: 'test-key' } });

    const apiSecretInput = screen.getByLabelText('Secret API');
    fireEvent.change(apiSecretInput, { target: { value: 'test-secret' } });

    const submitButton = screen.getByText('Connecter');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(integrationsService.connectIntegration).toHaveBeenCalledWith({
        platform: 'plateforme-b',
        apiKey: 'test-key',
        apiSecret: 'test-secret',
      });
    });
  });

  it('devrait déconnecter une intégration', async () => {
    integrationsService.disconnectIntegration.mockResolvedValue({ success: true });

    render(<IntegrationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Plateforme A')).toBeInTheDocument();
    });

    const disconnectButton = screen.getByText('Déconnecter');
    fireEvent.click(disconnectButton);

    await waitFor(() => {
      expect(integrationsService.disconnectIntegration).toHaveBeenCalledWith('plateforme-a');
    });
  });

  it('devrait créer un webhook', async () => {
    integrationsService.createWebhook.mockResolvedValue({
      id: 2,
      url: 'https://example.com/webhook2',
      events: ['event.updated'],
    });

    render(<IntegrationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Plateforme A')).toBeInTheDocument();
    });

    // Sélectionner Plateforme A
    const platformCard = screen.getByText('Plateforme A').closest('.card');
    fireEvent.click(platformCard);

    // Cliquer sur l'onglet Webhooks
    const webhooksTab = screen.getByText('Webhooks');
    fireEvent.click(webhooksTab);

    const addWebhookButton = screen.getByText('Ajouter un webhook');
    fireEvent.click(addWebhookButton);

    // Remplir le formulaire de webhook
    const urlInput = screen.getByLabelText('URL');
    fireEvent.change(urlInput, { target: { value: 'https://example.com/webhook2' } });

    const eventsSelect = screen.getByLabelText('Événements');
    fireEvent.change(eventsSelect, { target: { value: 'event.updated' } });

    const submitButton = screen.getByText('Créer');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(integrationsService.createWebhook).toHaveBeenCalledWith({
        platform: 'plateforme-a',
        url: 'https://example.com/webhook2',
        events: ['event.updated'],
      });
    });
  });

  it('devrait supprimer un webhook', async () => {
    integrationsService.deleteWebhook.mockResolvedValue({ success: true });

    render(<IntegrationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Plateforme A')).toBeInTheDocument();
    });

    // Sélectionner Plateforme A
    const platformCard = screen.getByText('Plateforme A').closest('.card');
    fireEvent.click(platformCard);

    // Cliquer sur l'onglet Webhooks
    const webhooksTab = screen.getByText('Webhooks');
    fireEvent.click(webhooksTab);

    const deleteButton = screen.getByText('Supprimer');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(integrationsService.deleteWebhook).toHaveBeenCalledWith('plateforme-a', 1);
    });
  });

  it('devrait synchroniser les données', async () => {
    integrationsService.syncData.mockResolvedValue({
      id: 1,
      status: 'in_progress',
    });

    render(<IntegrationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Plateforme A')).toBeInTheDocument();
    });

    // Sélectionner Plateforme A
    const platformCard = screen.getByText('Plateforme A').closest('.card');
    fireEvent.click(platformCard);

    // Cliquer sur l'onglet Synchronisation
    const syncTab = screen.getByText('Synchronisation');
    fireEvent.click(syncTab);

    const syncButton = screen.getByText('Synchroniser');
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(integrationsService.syncData).toHaveBeenCalledWith({
        platform: 'plateforme-a',
        type: 'all',
      });
    });
  });

  it('devrait gérer les erreurs lors du chargement des intégrations', async () => {
    const mockError = new Error('Erreur de chargement');
    integrationsService.getIntegrations.mockRejectedValue(mockError);

    render(<IntegrationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Erreur lors du chargement des intégrations')).toBeInTheDocument();
    });
  });

  it('devrait gérer les erreurs lors de la connexion d\'une intégration', async () => {
    const mockError = new Error('Erreur de connexion');
    integrationsService.connectIntegration.mockRejectedValue(mockError);

    render(<IntegrationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Plateforme B')).toBeInTheDocument();
    });

    const connectButton = screen.getAllByText('Connecter')[0];
    fireEvent.click(connectButton);

    const submitButton = screen.getByText('Connecter');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Erreur lors de la connexion à la plateforme')).toBeInTheDocument();
    });
  });
}); 