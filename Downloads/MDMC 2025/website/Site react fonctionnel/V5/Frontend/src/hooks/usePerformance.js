import { useEffect, useCallback } from 'react';
import { useStore } from '../store';

export const usePerformance = (componentName) => {
  const { setCacheData } = useStore();

  const measurePerformance = useCallback((metric) => {
    if (typeof window !== 'undefined' && window.performance) {
      const { timing } = window.performance;
      const metrics = {
        FCP: timing.domContentLoadedEventEnd - timing.navigationStart,
        LCP: timing.loadEventEnd - timing.navigationStart,
        FID: timing.responseEnd - timing.requestStart,
        CLS: 0, // Calculé via l'API Performance Observer
        TTI: timing.domInteractive - timing.navigationStart,
      };

      // Envoi des métriques au store
      setCacheData(`perf_${componentName}`, {
        ...metrics,
        timestamp: Date.now(),
      });

      // Envoi des métriques à l'API de monitoring si nécessaire
      if (process.env.NODE_ENV === 'production') {
        // TODO: Implémenter l'envoi à un service de monitoring
        console.log(`Performance metrics for ${componentName}:`, metrics);
      }
    }
  }, [componentName, setCacheData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Observer pour le CLS (Cumulative Layout Shift)
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'layout-shift') {
            measurePerformance({ CLS: entry.value });
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });

      // Observer pour le LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        measurePerformance({ LCP: lastEntry.startTime });
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      return () => {
        observer.disconnect();
        lcpObserver.disconnect();
      };
    }
  }, [measurePerformance]);

  const measureRender = useCallback(() => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      measurePerformance({ renderTime: end - start });
    };
  }, [measurePerformance]);

  return {
    measurePerformance,
    measureRender,
  };
};

export default usePerformance; 