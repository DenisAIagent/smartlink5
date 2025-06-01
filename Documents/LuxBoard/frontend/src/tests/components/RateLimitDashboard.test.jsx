import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import RateLimitDashboard from '../../components/admin/RateLimitDashboard';
import { apiService } from '../../services/apiService';

// Mock des services
jest.mock('../../services/apiService');
jest.mock('../../services/rateLimitService');

const mockStore = configureStore([]);

describe('RateLimitDashboard', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  const renderWithProviders = (component) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    );
  };

  it('devrait afficher le tableau de bord avec les métriques', async () => {
    // Mock des données
    const mockStats = {
      requests: [
        { endpoint: '/api/test', count: 100, timestamp: Date.now() }
      ],
      errors: [
        { type: 'RATE_LIMIT', count: 10, timestamp: Date.now() }
      ],
      retries: [
        { endpoint: '/api/test', count: 5, timestamp: Date.now() }
      ]
    };

    const mockEndpoints = ['/api/test', '/api/users'];

    // Mock des appels API
    apiService.get.mockImplementation((url) => {
      if (url === '/admin/rate-limit/stats') {
        return Promise.resolve({ data: mockStats });
      }
      if (url === '/admin/rate-limit/endpoints') {
        return Promise.resolve({ data: mockEndpoints });
      }
      return Promise.reject(new Error('URL non gérée'));
    });

    renderWithProviders(<RateLimitDashboard />);

    // Vérifier le chargement initial
    expect(screen.getByText('Tableau de Bord de Limitation de Taux')).toBeInTheDocument();
    expect(screen.getByText('Chargement...')).toBeInTheDocument();

    // Attendre le chargement des données
    await waitFor(() => {
      expect(screen.getByText('Requêtes Totales')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Erreurs')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Retries')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('devrait gérer les erreurs de chargement', async () => {
    // Mock d'une erreur
    apiService.get.mockRejectedValue(new Error('Erreur de chargement'));

    renderWithProviders(<RateLimitDashboard />);

    // Vérifier l'affichage de l'erreur
    await waitFor(() => {
      expect(screen.getByText('Erreur lors du chargement des données')).toBeInTheDocument();
    });
  });

  it('devrait mettre à jour les données périodiquement', async () => {
    // Mock des données initiales
    const initialStats = {
      requests: [{ count: 100 }],
      errors: [{ count: 10 }],
      retries: [{ count: 5 }]
    };

    const updatedStats = {
      requests: [{ count: 150 }],
      errors: [{ count: 15 }],
      retries: [{ count: 8 }]
    };

    // Mock des appels API avec des données différentes
    apiService.get
      .mockResolvedValueOnce({ data: initialStats })
      .mockResolvedValueOnce({ data: updatedStats });

    renderWithProviders(<RateLimitDashboard />);

    // Vérifier les données initiales
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    // Avancer le temps pour déclencher la mise à jour
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Vérifier les données mises à jour
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });

  it('devrait filtrer les données par période', async () => {
    renderWithProviders(<RateLimitDashboard />);

    // Sélectionner une période différente
    const periodSelect = screen.getByLabelText('Période');
    act(() => {
      periodSelect.value = '24h';
      periodSelect.dispatchEvent(new Event('change'));
    });

    // Vérifier que l'API est appelée avec la nouvelle période
    await waitFor(() => {
      expect(apiService.get).toHaveBeenCalledWith('/admin/rate-limit/stats', {
        params: { timeRange: '24h', endpoint: 'all' }
      });
    });
  });

  it('devrait filtrer les données par endpoint', async () => {
    renderWithProviders(<RateLimitDashboard />);

    // Sélectionner un endpoint spécifique
    const endpointSelect = screen.getByLabelText('Endpoint');
    act(() => {
      endpointSelect.value = '/api/test';
      endpointSelect.dispatchEvent(new Event('change'));
    });

    // Vérifier que l'API est appelée avec le nouvel endpoint
    await waitFor(() => {
      expect(apiService.get).toHaveBeenCalledWith('/admin/rate-limit/stats', {
        params: { timeRange: '1h', endpoint: '/api/test' }
      });
    });
  });
}); 