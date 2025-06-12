import { useState, useCallback, useEffect } from 'react';
import { loadTestService } from '../services/load-test.service';

export const useLoadTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);

  // Exécution d'un test de charge
  const runTest = useCallback(async (config) => {
    try {
      setIsRunning(true);
      setError(null);

      const testResults = await loadTestService.runLoadTest(config);
      setResults(testResults);

      // Analyse des métriques de performance
      const performanceMetrics = loadTestService.analyzePerformanceMetrics();
      setMetrics(performanceMetrics);

      return testResults;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsRunning(false);
    }
  }, []);

  // Configuration d'un test de charge pour une route spécifique
  const runRouteTest = useCallback(
    async (route, options = {}) => {
      const config = {
        duration: options.duration || 60000,
        concurrentUsers: options.concurrentUsers || 10,
        endpoints: [
          {
            url: route,
            method: options.method || 'GET',
            headers: options.headers,
            body: options.body,
          },
        ],
        thinkTime: options.thinkTime || 1000,
      };

      return runTest(config);
    },
    [runTest]
  );

  // Configuration d'un test de charge pour plusieurs routes
  const runMultiRouteTest = useCallback(
    async (routes, options = {}) => {
      const config = {
        duration: options.duration || 60000,
        concurrentUsers: options.concurrentUsers || 10,
        endpoints: routes.map((route) => ({
          url: route.url,
          method: route.method || 'GET',
          headers: route.headers,
          body: route.body,
        })),
        thinkTime: options.thinkTime || 1000,
      };

      return runTest(config);
    },
    [runTest]
  );

  // Configuration d'un test de charge pour les Core Web Vitals
  const runWebVitalsTest = useCallback(async () => {
    const results = await runTest({
      duration: 30000,
      concurrentUsers: 1,
      endpoints: [
        {
          url: window.location.href,
          method: 'GET',
        },
      ],
    });

    const webVitals = loadTestService.analyzePerformanceMetrics();
    return {
      results,
      webVitals,
    };
  }, [runTest]);

  // Nettoyage des métriques
  const cleanup = useCallback(() => {
    loadTestService.cleanup();
    setResults(null);
    setMetrics(null);
    setError(null);
  }, []);

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isRunning,
    results,
    error,
    metrics,
    runTest,
    runRouteTest,
    runMultiRouteTest,
    runWebVitalsTest,
    cleanup,
  };
};

export default useLoadTest; 