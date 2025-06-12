import { monitoringService } from '../../services/monitoring.service';

// Mock des APIs du navigateur
const mockPerformanceObserver = {
  observe: jest.fn(),
  disconnect: jest.fn(),
};

const mockErrorObserver = {
  observe: jest.fn(),
  disconnect: jest.fn(),
};

const mockNavigationObserver = {
  observe: jest.fn(),
  disconnect: jest.fn(),
};

global.PerformanceObserver = jest.fn().mockImplementation((callback) => {
  if (callback.name === 'CLSObserver') {
    return mockPerformanceObserver;
  }
  if (callback.name === 'LPFObserver') {
    return mockPerformanceObserver;
  }
  if (callback.name === 'FIDObserver') {
    return mockPerformanceObserver;
  }
  return mockPerformanceObserver;
});

global.ErrorEvent = jest.fn();
global.PromiseRejectionEvent = jest.fn();

describe('MonitoringService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    monitoringService.cleanup();
  });

  it('initialise correctement le service', () => {
    expect(monitoringService).toBeDefined();
    expect(monitoringService.init).toBeDefined();
  });

  it('configure les observateurs de performance', () => {
    monitoringService.init();

    expect(PerformanceObserver).toHaveBeenCalledTimes(3); // CLS, LCP, FID
    expect(mockPerformanceObserver.observe).toHaveBeenCalledTimes(3);
  });

  it('configure les observateurs d\'erreurs', () => {
    monitoringService.init();

    expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
  });

  it('enregistre les métriques de performance', () => {
    const mockMetric = {
      name: 'CLS',
      value: 0.1,
      timestamp: Date.now(),
    };

    monitoringService.recordMetric(mockMetric);

    const metrics = monitoringService.getMetrics();
    expect(metrics.performance).toContainEqual(mockMetric);
  });

  it('enregistre les erreurs', () => {
    const mockError = {
      type: 'JavaScript Error',
      message: 'Test error',
      timestamp: Date.now(),
    };

    monitoringService.recordError(mockError);

    const metrics = monitoringService.getMetrics();
    expect(metrics.errors).toContainEqual(mockError);
  });

  it('enregistre les actions utilisateur', () => {
    const mockAction = {
      type: 'click',
      target: 'button',
      timestamp: Date.now(),
    };

    monitoringService.recordUserAction(mockAction);

    const metrics = monitoringService.getMetrics();
    expect(metrics.userActions).toContainEqual(mockAction);
  });

  it('enregistre les requêtes réseau', () => {
    const mockRequest = {
      method: 'GET',
      url: '/api/test',
      status: 200,
      duration: 100,
      timestamp: Date.now(),
    };

    monitoringService.recordNetworkRequest(mockRequest);

    const metrics = monitoringService.getMetrics();
    expect(metrics.network).toContainEqual(mockRequest);
  });

  it('persiste les métriques dans le localStorage', () => {
    const mockMetrics = {
      performance: [{ name: 'CLS', value: 0.1, timestamp: Date.now() }],
      errors: [{ type: 'JavaScript Error', message: 'Test error', timestamp: Date.now() }],
      userActions: [{ type: 'click', target: 'button', timestamp: Date.now() }],
      network: [{ method: 'GET', url: '/api/test', status: 200, duration: 100, timestamp: Date.now() }],
    };

    monitoringService.persistMetrics(mockMetrics);

    const storedMetrics = JSON.parse(localStorage.getItem('monitoring_metrics'));
    expect(storedMetrics).toEqual(mockMetrics);
  });

  it('nettoie les ressources lors de l\'arrêt', () => {
    monitoringService.init();
    monitoringService.cleanup();

    expect(mockPerformanceObserver.disconnect).toHaveBeenCalled();
    expect(mockErrorObserver.disconnect).toHaveBeenCalled();
    expect(mockNavigationObserver.disconnect).toHaveBeenCalled();
  });

  it('gère les limites de stockage', () => {
    const mockMetrics = Array(1000).fill({
      type: 'test',
      timestamp: Date.now(),
    });

    monitoringService.recordUserAction(...mockMetrics);

    const metrics = monitoringService.getMetrics();
    expect(metrics.userActions.length).toBeLessThanOrEqual(100); // Limite de 100 entrées
  });

  it('calcule correctement les statistiques', () => {
    const mockMetrics = [
      { value: 100, timestamp: Date.now() },
      { value: 200, timestamp: Date.now() },
      { value: 300, timestamp: Date.now() },
    ];

    mockMetrics.forEach(metric => monitoringService.recordMetric(metric));

    const stats = monitoringService.getStats();
    expect(stats.average).toBe(200);
    expect(stats.min).toBe(100);
    expect(stats.max).toBe(300);
  });

  it('gère les erreurs de stockage', () => {
    const mockError = new Error('Storage error');
    localStorage.setItem = jest.fn().mockImplementation(() => {
      throw mockError;
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    monitoringService.persistMetrics({});

    expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de la persistance des métriques:', mockError);
    consoleSpy.mockRestore();
  });

  it('synchronise les métriques entre les onglets', () => {
    const mockMetrics = {
      performance: [{ name: 'CLS', value: 0.1, timestamp: Date.now() }],
    };

    monitoringService.persistMetrics(mockMetrics);

    // Simuler un événement de stockage
    const storageEvent = new StorageEvent('storage', {
      key: 'monitoring_metrics',
      newValue: JSON.stringify(mockMetrics),
    });

    window.dispatchEvent(storageEvent);

    const metrics = monitoringService.getMetrics();
    expect(metrics).toEqual(mockMetrics);
  });
}); 