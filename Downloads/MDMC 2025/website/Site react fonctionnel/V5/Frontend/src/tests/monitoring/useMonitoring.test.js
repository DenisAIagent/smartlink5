import { renderHook, act } from '@testing-library/react-hooks';
import { useMonitoring } from '../../hooks/useMonitoring';
import { monitoringService } from '../../services/monitoring.service';

// Mock du service de monitoring
jest.mock('../../services/monitoring.service', () => ({
  monitoringService: {
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn(),
    trackUserAction: jest.fn(),
    trackError: jest.fn(),
    trackPerformanceMetric: jest.fn(),
    trackNetworkRequest: jest.fn(),
    getMetrics: jest.fn(),
    cleanup: jest.fn(),
  },
}));

describe('useMonitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initialise correctement le monitoring', async () => {
    const { result } = renderHook(() => useMonitoring());

    expect(result.current.isMonitoring).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('démarre le monitoring correctement', async () => {
    const mockMetrics = {
      performance: { average: 100 },
      errors: { total: 0 },
      userActions: { total: 0 },
      network: { total: 0 },
    };

    monitoringService.startMonitoring.mockResolvedValueOnce();
    monitoringService.getMetrics.mockResolvedValueOnce(mockMetrics);

    const { result } = renderHook(() => useMonitoring());

    await act(async () => {
      await result.current.startMonitoring();
    });

    expect(monitoringService.startMonitoring).toHaveBeenCalled();
    expect(result.current.isMonitoring).toBe(true);
    expect(result.current.performanceMetrics).toEqual(mockMetrics.performance);
  });

  it('gère les erreurs lors du démarrage du monitoring', async () => {
    const mockError = new Error('Erreur de monitoring');
    monitoringService.startMonitoring.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useMonitoring());

    await act(async () => {
      await result.current.startMonitoring();
    });

    expect(result.current.error).toBe(mockError.message);
    expect(result.current.isMonitoring).toBe(false);
  });

  it('track les actions utilisateur correctement', async () => {
    const { result } = renderHook(() => useMonitoring());

    const mockAction = {
      type: 'click',
      target: 'button',
      timestamp: Date.now(),
    };

    await act(async () => {
      await result.current.trackUserAction(mockAction);
    });

    expect(monitoringService.trackUserAction).toHaveBeenCalledWith(mockAction);
  });

  it('track les erreurs correctement', async () => {
    const { result } = renderHook(() => useMonitoring());

    const mockError = {
      type: 'JavaScript Error',
      message: 'Test error',
      timestamp: Date.now(),
    };

    await act(async () => {
      await result.current.trackError(mockError);
    });

    expect(monitoringService.trackError).toHaveBeenCalledWith(mockError);
  });

  it('track les métriques de performance correctement', async () => {
    const { result } = renderHook(() => useMonitoring());

    const mockMetric = {
      type: 'First Contentful Paint',
      value: 800,
      timestamp: Date.now(),
    };

    await act(async () => {
      await result.current.trackPerformanceMetric(mockMetric);
    });

    expect(monitoringService.trackPerformanceMetric).toHaveBeenCalledWith(mockMetric);
  });

  it('track les requêtes réseau correctement', async () => {
    const { result } = renderHook(() => useMonitoring());

    const mockRequest = {
      method: 'GET',
      url: '/api/test',
      status: 200,
      duration: 100,
      timestamp: Date.now(),
    };

    await act(async () => {
      await result.current.trackNetworkRequest(mockRequest);
    });

    expect(monitoringService.trackNetworkRequest).toHaveBeenCalledWith(mockRequest);
  });

  it('nettoie les ressources lors du démontage', () => {
    const { unmount } = renderHook(() => useMonitoring());

    unmount();

    expect(monitoringService.cleanup).toHaveBeenCalled();
  });

  it('gère la reconnexion automatique', async () => {
    const mockMetrics = {
      performance: { average: 100 },
      errors: { total: 0 },
      userActions: { total: 0 },
      network: { total: 0 },
    };

    monitoringService.startMonitoring.mockResolvedValueOnce();
    monitoringService.getMetrics.mockResolvedValueOnce(mockMetrics);

    const { result } = renderHook(() => useMonitoring());

    // Simuler une perte de connexion
    await act(async () => {
      window.dispatchEvent(new Event('offline'));
    });

    // Simuler une reconnexion
    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });

    expect(monitoringService.startMonitoring).toHaveBeenCalledTimes(2);
  });

  it('met à jour les métriques périodiquement', async () => {
    jest.useFakeTimers();

    const mockMetrics = {
      performance: { average: 100 },
      errors: { total: 0 },
      userActions: { total: 0 },
      network: { total: 0 },
    };

    monitoringService.startMonitoring.mockResolvedValueOnce();
    monitoringService.getMetrics.mockResolvedValue(mockMetrics);

    const { result } = renderHook(() => useMonitoring());

    await act(async () => {
      await result.current.startMonitoring();
    });

    // Avancer le temps de 5 minutes
    await act(async () => {
      jest.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(monitoringService.getMetrics).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });
}); 