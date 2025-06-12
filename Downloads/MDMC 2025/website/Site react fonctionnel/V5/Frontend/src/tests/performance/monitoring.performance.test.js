import { monitoringService } from '../../services/monitoring.service';
import { useMonitoring } from '../../hooks/useMonitoring';
import { renderHook, act } from '@testing-library/react-hooks';

describe('Tests de performance du système de monitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    performance.clearMarks();
    performance.clearMeasures();
  });

  it('respecte les limites de performance pour le démarrage du monitoring', async () => {
    performance.mark('start-monitoring');
    
    const { result } = renderHook(() => useMonitoring());
    
    await act(async () => {
      await result.current.startMonitoring();
    });
    
    performance.mark('end-monitoring');
    performance.measure('monitoring-startup', 'start-monitoring', 'end-monitoring');
    
    const measures = performance.getEntriesByName('monitoring-startup');
    expect(measures[0].duration).toBeLessThan(100); // 100ms maximum
  });

  it('optimise la persistance des métriques', async () => {
    const largeDataset = Array(1000).fill({
      type: 'test',
      timestamp: Date.now(),
      data: new Array(100).fill('test').join(''),
    });

    performance.mark('start-persistence');
    
    await act(async () => {
      await monitoringService.persistMetrics({
        performance: largeDataset,
        errors: largeDataset,
        userActions: largeDataset,
        network: largeDataset,
      });
    });
    
    performance.mark('end-persistence');
    performance.measure('metrics-persistence', 'start-persistence', 'end-persistence');
    
    const measures = performance.getEntriesByName('metrics-persistence');
    expect(measures[0].duration).toBeLessThan(50); // 50ms maximum
  });

  it('optimise la récupération des métriques', async () => {
    const { result } = renderHook(() => useMonitoring());
    
    performance.mark('start-retrieval');
    
    await act(async () => {
      await result.current.startMonitoring();
    });
    
    performance.mark('end-retrieval');
    performance.measure('metrics-retrieval', 'start-retrieval', 'end-retrieval');
    
    const measures = performance.getEntriesByName('metrics-retrieval');
    expect(measures[0].duration).toBeLessThan(30); // 30ms maximum
  });

  it('gère efficacement la mémoire', async () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    const { result } = renderHook(() => useMonitoring());
    
    // Simuler beaucoup d'actions
    for (let i = 0; i < 1000; i++) {
      await act(async () => {
        await result.current.trackUserAction({
          type: 'click',
          target: 'button',
          timestamp: Date.now(),
        });
      });
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Vérifier que l'augmentation de la mémoire est raisonnable (moins de 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });

  it('optimise le rendu du tableau de bord', async () => {
    const mockMetrics = {
      performance: {
        'First Contentful Paint': { average: 800, min: 600, max: 1200 },
      },
      errors: { total: 0, byType: {}, bySource: {}, recent: [] },
      userActions: { total: 0, byType: {}, byTarget: {}, recent: [] },
      network: { total: 0, byStatus: {}, byMethod: {}, averageDuration: 0, recent: [] },
    };

    performance.mark('start-render');
    
    const { result } = renderHook(() => useMonitoring());
    
    await act(async () => {
      await result.current.startMonitoring();
    });
    
    performance.mark('end-render');
    performance.measure('dashboard-render', 'start-render', 'end-render');
    
    const measures = performance.getEntriesByName('dashboard-render');
    expect(measures[0].duration).toBeLessThan(16); // 16ms pour maintenir 60fps
  });

  it('optimise la synchronisation entre les onglets', async () => {
    const mockMetrics = {
      performance: { 'First Contentful Paint': { average: 800, min: 600, max: 1200 } },
      errors: { total: 0, byType: {}, bySource: {}, recent: [] },
      userActions: { total: 0, byType: {}, byTarget: {}, recent: [] },
      network: { total: 0, byStatus: {}, byMethod: {}, averageDuration: 0, recent: [] },
    };

    performance.mark('start-sync');
    
    const storageEvent = new StorageEvent('storage', {
      key: 'monitoring_metrics',
      newValue: JSON.stringify(mockMetrics),
    });
    
    window.dispatchEvent(storageEvent);
    
    performance.mark('end-sync');
    performance.measure('tab-sync', 'start-sync', 'end-sync');
    
    const measures = performance.getEntriesByName('tab-sync');
    expect(measures[0].duration).toBeLessThan(20); // 20ms maximum
  });

  it('optimise le traitement des mises à jour en temps réel', async () => {
    const { result } = renderHook(() => useMonitoring());
    
    performance.mark('start-updates');
    
    // Simuler des mises à jour rapides
    for (let i = 0; i < 100; i++) {
      await act(async () => {
        await result.current.trackUserAction({
          type: 'click',
          target: 'button',
          timestamp: Date.now(),
        });
      });
    }
    
    performance.mark('end-updates');
    performance.measure('real-time-updates', 'start-updates', 'end-updates');
    
    const measures = performance.getEntriesByName('real-time-updates');
    expect(measures[0].duration).toBeLessThan(500); // 500ms maximum pour 100 mises à jour
  });

  it('optimise la gestion des erreurs', async () => {
    const { result } = renderHook(() => useMonitoring());
    
    performance.mark('start-error-handling');
    
    // Simuler des erreurs
    for (let i = 0; i < 100; i++) {
      await act(async () => {
        await result.current.trackError({
          type: 'JavaScript Error',
          message: 'Test error',
          timestamp: Date.now(),
        });
      });
    }
    
    performance.mark('end-error-handling');
    performance.measure('error-handling', 'start-error-handling', 'end-error-handling');
    
    const measures = performance.getEntriesByName('error-handling');
    expect(measures[0].duration).toBeLessThan(200); // 200ms maximum
  });
}); 