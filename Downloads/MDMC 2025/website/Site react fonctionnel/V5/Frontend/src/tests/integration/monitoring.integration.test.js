import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import MonitoringDashboard from '../../components/common/MonitoringDashboard';
import { useMonitoring } from '../../hooks/useMonitoring';
import { monitoringService } from '../../services/monitoring.service';

// Wrapper pour les tests d'intégration
const IntegrationWrapper = ({ children }) => {
  const monitoring = useMonitoring();
  return (
    <ThemeProvider theme={createTheme()}>
      {children}
      <MonitoringDashboard
        performanceMetrics={monitoring.performanceMetrics}
        errorMetrics={monitoring.errorMetrics}
        userActionMetrics={monitoring.userActionMetrics}
        networkMetrics={monitoring.networkMetrics}
        isMonitoring={monitoring.isMonitoring}
        onRefresh={monitoring.startMonitoring}
      />
    </ThemeProvider>
  );
};

describe('Tests d\'intégration du système de monitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('intègre correctement le monitoring avec le tableau de bord', async () => {
    const mockMetrics = {
      performance: {
        'First Contentful Paint': { average: 800, min: 600, max: 1200 },
        'Largest Contentful Paint': { average: 1200, min: 800, max: 2000 },
      },
      errors: {
        total: 2,
        byType: { 'JavaScript Error': 2 },
        bySource: { 'Component Error': 2 },
        recent: [{ type: 'JavaScript Error', message: 'Test error', timestamp: Date.now() }],
      },
      userActions: {
        total: 5,
        byType: { click: 5 },
        byTarget: { button: 5 },
        recent: [{ type: 'click', target: 'button', timestamp: Date.now() }],
      },
      network: {
        total: 10,
        byStatus: { '200': 8, '404': 2 },
        byMethod: { GET: 10 },
        averageDuration: 250,
        recent: [{ method: 'GET', status: 200, duration: 200, timestamp: Date.now() }],
      },
    };

    monitoringService.getMetrics.mockResolvedValue(mockMetrics);

    render(
      <IntegrationWrapper>
        <div>Test Content</div>
      </IntegrationWrapper>
    );

    // Vérifier l'état initial
    expect(screen.getByText('Aucune donnée de monitoring disponible')).toBeInTheDocument();

    // Démarrer le monitoring
    const refreshButton = screen.getByRole('button', { name: /rafraîchir/i });
    fireEvent.click(refreshButton);

    // Vérifier le chargement
    expect(screen.getByText('Monitoring en cours...')).toBeInTheDocument();

    // Attendre les données
    await waitFor(() => {
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });

    // Vérifier les métriques
    expect(screen.getByText('First Contentful Paint')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Total des erreurs
    expect(screen.getByText('5')).toBeInTheDocument(); // Total des actions
    expect(screen.getByText('10')).toBeInTheDocument(); // Total des requêtes
  });

  it('gère correctement les erreurs en temps réel', async () => {
    const mockError = new Error('Test error');
    monitoringService.startMonitoring.mockRejectedValueOnce(mockError);

    render(
      <IntegrationWrapper>
        <div>Test Content</div>
      </IntegrationWrapper>
    );

    const refreshButton = screen.getByRole('button', { name: /rafraîchir/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText('Erreur de monitoring')).toBeInTheDocument();
    });
  });

  it('met à jour les métriques en temps réel', async () => {
    const initialMetrics = {
      performance: { 'First Contentful Paint': { average: 800, min: 600, max: 1200 } },
      errors: { total: 0, byType: {}, bySource: {}, recent: [] },
      userActions: { total: 0, byType: {}, byTarget: {}, recent: [] },
      network: { total: 0, byStatus: {}, byMethod: {}, averageDuration: 0, recent: [] },
    };

    const updatedMetrics = {
      ...initialMetrics,
      userActions: {
        total: 1,
        byType: { click: 1 },
        byTarget: { button: 1 },
        recent: [{ type: 'click', target: 'button', timestamp: Date.now() }],
      },
    };

    monitoringService.getMetrics
      .mockResolvedValueOnce(initialMetrics)
      .mockResolvedValueOnce(updatedMetrics);

    render(
      <IntegrationWrapper>
        <div>Test Content</div>
      </IntegrationWrapper>
    );

    // Démarrer le monitoring
    const refreshButton = screen.getByRole('button', { name: /rafraîchir/i });
    fireEvent.click(refreshButton);

    // Vérifier les métriques initiales
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument(); // Total des actions initial
    });

    // Simuler une action utilisateur
    fireEvent.click(screen.getByText('Test Content'));

    // Rafraîchir les métriques
    fireEvent.click(refreshButton);

    // Vérifier les métriques mises à jour
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // Total des actions mis à jour
    });
  });

  it('persiste et restaure les métriques entre les sessions', async () => {
    const mockMetrics = {
      performance: { 'First Contentful Paint': { average: 800, min: 600, max: 1200 } },
      errors: { total: 0, byType: {}, bySource: {}, recent: [] },
      userActions: { total: 0, byType: {}, byTarget: {}, recent: [] },
      network: { total: 0, byStatus: {}, byMethod: {}, averageDuration: 0, recent: [] },
    };

    monitoringService.getMetrics.mockResolvedValue(mockMetrics);

    // Première session
    const { unmount } = render(
      <IntegrationWrapper>
        <div>Test Content</div>
      </IntegrationWrapper>
    );

    const refreshButton = screen.getByRole('button', { name: /rafraîchir/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });

    unmount();

    // Deuxième session
    render(
      <IntegrationWrapper>
        <div>Test Content</div>
      </IntegrationWrapper>
    );

    // Vérifier que les métriques sont restaurées
    await waitFor(() => {
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });
  });

  it('gère correctement la synchronisation entre les onglets', async () => {
    const mockMetrics = {
      performance: { 'First Contentful Paint': { average: 800, min: 600, max: 1200 } },
      errors: { total: 0, byType: {}, bySource: {}, recent: [] },
      userActions: { total: 0, byType: {}, byTarget: {}, recent: [] },
      network: { total: 0, byStatus: {}, byMethod: {}, averageDuration: 0, recent: [] },
    };

    monitoringService.getMetrics.mockResolvedValue(mockMetrics);

    render(
      <IntegrationWrapper>
        <div>Test Content</div>
      </IntegrationWrapper>
    );

    // Simuler un événement de stockage
    const storageEvent = new StorageEvent('storage', {
      key: 'monitoring_metrics',
      newValue: JSON.stringify(mockMetrics),
    });

    window.dispatchEvent(storageEvent);

    // Vérifier que les métriques sont synchronisées
    await waitFor(() => {
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });
  });
}); 