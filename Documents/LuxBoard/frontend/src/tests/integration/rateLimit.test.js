import { render, screen, act, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { rateLimitService } from '../../services/rateLimitService';
import ProvidersPage from '../../pages/ProvidersPage';
import configureStore from '../../store/configureStore';

jest.mock('../../services/apiService');
jest.mock('../../services/rateLimitService');

describe('Intégration Rate Limit', () => {
  let store;

  beforeEach(() => {
    store = configureStore();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
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

  it('devrait gérer correctement le flux complet de limitation de taux', async () => {
    // Mock des données initiales
    const mockProviders = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Provider ${i + 1}`,
      description: `Description ${i + 1}`,
      rating: 4.5,
      price: 100
    }));

    apiService.get.mockResolvedValue({
      providers: mockProviders,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 10
      }
    });

    // Simuler l'approche de la limite
    rateLimitService.getStats.mockReturnValue({
      remaining: 15,
      resetTime: Date.now() + 60000,
      retryCount: 0
    });

    renderWithProviders(<ProvidersPage />);

    // Vérifier l'affichage initial
    expect(await screen.findByText('Limite de requêtes')).toBeInTheDocument();
    expect(screen.getByText('15 / 100')).toBeInTheDocument();

    // Simuler une nouvelle requête qui échoue à cause de la limite
    rateLimitService.canMakeRequest.mockReturnValue({
      allowed: false,
      retryAfter: 1000,
      resetTime: Date.now() + 60000
    });

    // Tenter une nouvelle requête
    fireEvent.click(screen.getByText('Suivant'));

    // Vérifier que la requête est en attente
    expect(screen.getByText('Chargement...')).toBeInTheDocument();

    // Simuler le passage du temps pour le retry
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Simuler la réussite de la requête après le retry
    rateLimitService.canMakeRequest.mockReturnValue({
      allowed: true,
      retryAfter: 0,
      resetTime: Date.now() + 60000
    });

    // Vérifier que la requête a réussi
    expect(await screen.findByText('Provider 1')).toBeInTheDocument();
  });

  it('devrait gérer correctement la réinitialisation de la limite', async () => {
    // Configuration initiale
    rateLimitService.getStats.mockReturnValue({
      remaining: 5,
      resetTime: Date.now() + 30000,
      retryCount: 0
    });

    renderWithProviders(<ProvidersPage />);

    // Vérifier l'affichage initial
    expect(await screen.findByText('Limite de requêtes')).toBeInTheDocument();
    expect(screen.getByText('5 / 100')).toBeInTheDocument();

    // Simuler la réinitialisation de la limite
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    rateLimitService.getStats.mockReturnValue({
      remaining: 100,
      resetTime: Date.now() + 60000,
      retryCount: 0
    });

    // Vérifier que l'affichage a disparu
    expect(screen.queryByText('Limite de requêtes')).not.toBeInTheDocument();
  });

  it('devrait gérer correctement les erreurs de limitation', async () => {
    // Configuration initiale
    rateLimitService.getStats.mockReturnValue({
      remaining: 0,
      resetTime: Date.now() + 60000,
      retryCount: 3
    });

    apiService.get.mockRejectedValue(new Error('Rate limit exceeded'));

    renderWithProviders(<ProvidersPage />);

    // Vérifier l'affichage de l'erreur
    expect(await screen.findByText('Limite de requêtes dépassée')).toBeInTheDocument();
    expect(screen.getByText('Veuillez réessayer plus tard')).toBeInTheDocument();
  });

  it('devrait mettre à jour l\'interface en temps réel', async () => {
    // Configuration initiale
    rateLimitService.getStats
      .mockReturnValueOnce({
        remaining: 15,
        resetTime: Date.now() + 60000,
        retryCount: 0
      })
      .mockReturnValueOnce({
        remaining: 10,
        resetTime: Date.now() + 60000,
        retryCount: 0
      })
      .mockReturnValueOnce({
        remaining: 5,
        resetTime: Date.now() + 60000,
        retryCount: 0
      });

    renderWithProviders(<ProvidersPage />);

    // Vérifier les mises à jour successives
    expect(await screen.findByText('15 / 100')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('10 / 100')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('5 / 100')).toBeInTheDocument();
  });
}); 