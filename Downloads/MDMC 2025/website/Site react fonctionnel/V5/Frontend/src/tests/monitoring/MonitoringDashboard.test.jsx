import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import MonitoringDashboard from '../../components/common/MonitoringDashboard';

// Mock des données de test
const mockPerformanceMetrics = {
  'First Contentful Paint': { average: 800, min: 600, max: 1200 },
  'Largest Contentful Paint': { average: 1200, min: 800, max: 2000 },
  'Time to Interactive': { average: 1500, min: 1000, max: 2500 },
};

const mockErrorMetrics = {
  total: 5,
  byType: {
    'JavaScript Error': 2,
    'Network Error': 3,
  },
  bySource: {
    'Component Error': 2,
    'API Error': 3,
  },
  recent: [
    { type: 'JavaScript Error', message: 'Test error', timestamp: Date.now() },
  ],
};

const mockUserActionMetrics = {
  total: 10,
  byType: {
    click: 5,
    scroll: 3,
    input: 2,
  },
  byTarget: {
    button: 5,
    input: 2,
    link: 3,
  },
  recent: [
    { type: 'click', target: 'button', timestamp: Date.now() },
  ],
};

const mockNetworkMetrics = {
  total: 15,
  byStatus: {
    '200': 12,
    '404': 2,
    '500': 1,
  },
  byMethod: {
    GET: 10,
    POST: 5,
  },
  averageDuration: 250,
  recent: [
    { method: 'GET', status: 200, duration: 200, timestamp: Date.now() },
  ],
};

// Configuration du thème pour les tests
const theme = createTheme();

// Wrapper pour les tests
const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('MonitoringDashboard', () => {
  it('affiche un message quand aucune donnée n\'est disponible', () => {
    renderWithTheme(
      <MonitoringDashboard
        isMonitoring={false}
        onRefresh={() => {}}
      />
    );

    expect(screen.getByText('Aucune donnée de monitoring disponible')).toBeInTheDocument();
  });

  it('affiche un indicateur de chargement pendant le monitoring', () => {
    renderWithTheme(
      <MonitoringDashboard
        isMonitoring={true}
        onRefresh={() => {}}
      />
    );

    expect(screen.getByText('Monitoring en cours...')).toBeInTheDocument();
  });

  it('affiche correctement les métriques de performance', () => {
    renderWithTheme(
      <MonitoringDashboard
        performanceMetrics={mockPerformanceMetrics}
        errorMetrics={mockErrorMetrics}
        userActionMetrics={mockUserActionMetrics}
        networkMetrics={mockNetworkMetrics}
        isMonitoring={false}
        onRefresh={() => {}}
      />
    );

    // Vérification des métriques de performance
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('First Contentful Paint')).toBeInTheDocument();
    expect(screen.getByText(/Moyenne: 800.00ms/)).toBeInTheDocument();
  });

  it('affiche correctement les métriques d\'erreurs', () => {
    renderWithTheme(
      <MonitoringDashboard
        performanceMetrics={mockPerformanceMetrics}
        errorMetrics={mockErrorMetrics}
        userActionMetrics={mockUserActionMetrics}
        networkMetrics={mockNetworkMetrics}
        isMonitoring={false}
        onRefresh={() => {}}
      />
    );

    expect(screen.getByText('Erreurs')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Total des erreurs
    expect(screen.getByText('JavaScript Error')).toBeInTheDocument();
  });

  it('affiche correctement les métriques d\'actions utilisateur', () => {
    renderWithTheme(
      <MonitoringDashboard
        performanceMetrics={mockPerformanceMetrics}
        errorMetrics={mockErrorMetrics}
        userActionMetrics={mockUserActionMetrics}
        networkMetrics={mockNetworkMetrics}
        isMonitoring={false}
        onRefresh={() => {}}
      />
    );

    expect(screen.getByText('Actions utilisateur')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // Total des actions
    expect(screen.getByText('click')).toBeInTheDocument();
  });

  it('affiche correctement les métriques réseau', () => {
    renderWithTheme(
      <MonitoringDashboard
        performanceMetrics={mockPerformanceMetrics}
        errorMetrics={mockErrorMetrics}
        userActionMetrics={mockUserActionMetrics}
        networkMetrics={mockNetworkMetrics}
        isMonitoring={false}
        onRefresh={() => {}}
      />
    );

    expect(screen.getByText('Réseau')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // Total des requêtes
    expect(screen.getByText('250.00ms')).toBeInTheDocument(); // Temps moyen
  });

  it('appelle onRefresh lors du clic sur le bouton de rafraîchissement', async () => {
    const handleRefresh = jest.fn();
    renderWithTheme(
      <MonitoringDashboard
        performanceMetrics={mockPerformanceMetrics}
        errorMetrics={mockErrorMetrics}
        userActionMetrics={mockUserActionMetrics}
        networkMetrics={mockNetworkMetrics}
        isMonitoring={false}
        onRefresh={handleRefresh}
      />
    );

    const refreshButton = screen.getByRole('button', { name: /rafraîchir/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(handleRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('affiche un avertissement pour les performances critiques', () => {
    const criticalPerformanceMetrics = {
      'Slow Operation': { average: 1500, min: 1000, max: 2000 },
    };

    renderWithTheme(
      <MonitoringDashboard
        performanceMetrics={criticalPerformanceMetrics}
        errorMetrics={mockErrorMetrics}
        userActionMetrics={mockUserActionMetrics}
        networkMetrics={mockNetworkMetrics}
        isMonitoring={false}
        onRefresh={() => {}}
      />
    );

    expect(screen.getByText('Performance critique')).toBeInTheDocument();
  });
}); 