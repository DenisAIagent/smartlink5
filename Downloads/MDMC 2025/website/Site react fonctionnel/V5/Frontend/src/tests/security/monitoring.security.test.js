import { monitoringService } from '../../services/monitoring.service';
import { useMonitoring } from '../../hooks/useMonitoring';
import { renderHook, act } from '@testing-library/react-hooks';

describe('Tests de sécurité du système de monitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('sanitise les entrées utilisateur', async () => {
    const { result } = renderHook(() => useMonitoring());
    
    const maliciousInput = {
      type: 'click',
      target: '<script>alert("xss")</script>',
      timestamp: Date.now(),
    };

    await act(async () => {
      await result.current.trackUserAction(maliciousInput);
    });

    const metrics = monitoringService.getMetrics();
    expect(metrics.userActions[0].target).not.toContain('<script>');
  });

  it('protège contre les injections XSS dans les messages d\'erreur', async () => {
    const { result } = renderHook(() => useMonitoring());
    
    const maliciousError = {
      type: 'JavaScript Error',
      message: '<img src="x" onerror="alert(\'xss\')">',
      timestamp: Date.now(),
    };

    await act(async () => {
      await result.current.trackError(maliciousError);
    });

    const metrics = monitoringService.getMetrics();
    expect(metrics.errors[0].message).not.toContain('<img');
  });

  it('valide les URLs des requêtes réseau', async () => {
    const { result } = renderHook(() => useMonitoring());
    
    const maliciousRequest = {
      method: 'GET',
      url: 'javascript:alert("xss")',
      status: 200,
      duration: 100,
      timestamp: Date.now(),
    };

    await act(async () => {
      await result.current.trackNetworkRequest(maliciousRequest);
    });

    const metrics = monitoringService.getMetrics();
    expect(metrics.network[0].url).not.toContain('javascript:');
  });

  it('protège contre les attaques par déni de service', async () => {
    const { result } = renderHook(() => useMonitoring());
    
    // Simuler un grand nombre de requêtes
    const requests = Array(10000).fill({
      method: 'GET',
      url: '/api/test',
      status: 200,
      duration: 100,
      timestamp: Date.now(),
    });

    await act(async () => {
      await Promise.all(requests.map(req => result.current.trackNetworkRequest(req)));
    });

    const metrics = monitoringService.getMetrics();
    expect(metrics.network.length).toBeLessThan(1000); // Limite de 1000 requêtes
  });

  it('chiffre les données sensibles', async () => {
    const { result } = renderHook(() => useMonitoring());
    
    const sensitiveData = {
      type: 'login',
      username: 'test@example.com',
      password: 'secret123',
      timestamp: Date.now(),
    };

    await act(async () => {
      await result.current.trackUserAction(sensitiveData);
    });

    const metrics = monitoringService.getMetrics();
    expect(metrics.userActions[0].password).toBeUndefined();
    expect(metrics.userActions[0].username).not.toBe(sensitiveData.username);
  });

  it('protège contre les attaques CSRF', async () => {
    const { result } = renderHook(() => useMonitoring());
    
    const request = {
      method: 'POST',
      url: '/api/update',
      status: 200,
      duration: 100,
      timestamp: Date.now(),
      headers: {
        'X-CSRF-Token': 'invalid-token',
      },
    };

    await act(async () => {
      await result.current.trackNetworkRequest(request);
    });

    const metrics = monitoringService.getMetrics();
    expect(metrics.network[0].headers['X-CSRF-Token']).toBeUndefined();
  });

  it('protège contre les attaques par injection de données', async () => {
    const { result } = renderHook(() => useMonitoring());
    
    const maliciousData = {
      type: 'click',
      target: 'button',
      timestamp: Date.now(),
      __proto__: {
        isAdmin: true,
      },
    };

    await act(async () => {
      await result.current.trackUserAction(maliciousData);
    });

    const metrics = monitoringService.getMetrics();
    expect(metrics.userActions[0].__proto__).toBeUndefined();
  });

  it('valide les types de données', async () => {
    const { result } = renderHook(() => useMonitoring());
    
    const invalidData = {
      type: 123, // Devrait être une chaîne
      target: null, // Devrait être une chaîne
      timestamp: 'invalid', // Devrait être un nombre
    };

    await act(async () => {
      await result.current.trackUserAction(invalidData);
    });

    const metrics = monitoringService.getMetrics();
    expect(metrics.userActions[0].type).toBe('unknown');
    expect(metrics.userActions[0].target).toBe('unknown');
    expect(typeof metrics.userActions[0].timestamp).toBe('number');
  });

  it('protège contre les attaques par timing', async () => {
    const { result } = renderHook(() => useMonitoring());
    
    const startTime = Date.now();
    
    await act(async () => {
      await result.current.startMonitoring();
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Vérifier que le temps de réponse est constant
    expect(duration).toBeLessThan(100); // 100ms maximum
  });

  it('gère correctement les erreurs de sécurité', async () => {
    const { result } = renderHook(() => useMonitoring());
    
    const securityError = new Error('Security violation');
    securityError.name = 'SecurityError';
    
    await act(async () => {
      await result.current.trackError(securityError);
    });

    const metrics = monitoringService.getMetrics();
    expect(metrics.errors[0].type).toBe('SecurityError');
    expect(metrics.errors[0].message).not.toContain('violation');
  });
}); 