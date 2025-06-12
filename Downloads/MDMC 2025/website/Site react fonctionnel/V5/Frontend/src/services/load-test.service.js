import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

class LoadTestService {
  constructor() {
    this.metrics = createStore(
      persist(
        (set) => ({
          results: [],
          currentTest: null,
          setResults: (results) => set({ results }),
          setCurrentTest: (test) => set({ currentTest: test }),
          addResult: (result) =>
            set((state) => ({
              results: [...state.results, { ...result, timestamp: Date.now() }],
            })),
        }),
        {
          name: 'load-test-metrics',
        }
      )
    );

    this.init();
  }

  init() {
    this.setupPerformanceObserver();
    this.setupResourceObserver();
    this.setupNetworkObserver();
  }

  // Configuration des observateurs de performance
  setupPerformanceObserver() {
    this.performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordPerformanceMetric(entry);
      }
    });

    this.performanceObserver.observe({
      entryTypes: [
        'largest-contentful-paint',
        'first-input',
        'layout-shift',
        'longtask',
        'resource',
        'navigation',
      ],
    });
  }

  // Configuration de l'observateur de ressources
  setupResourceObserver() {
    this.resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordResourceMetric(entry);
      }
    });

    this.resourceObserver.observe({
      entryTypes: ['resource'],
    });
  }

  // Configuration de l'observateur réseau
  setupNetworkObserver() {
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.recordNetworkMetric(navigator.connection);
      });
    }
  }

  // Enregistrement des métriques de performance
  recordPerformanceMetric(entry) {
    const metric = {
      type: entry.entryType,
      name: entry.name,
      value: entry.value || entry.duration,
      timestamp: Date.now(),
    };

    this.metrics.getState().addResult({
      category: 'performance',
      ...metric,
    });
  }

  // Enregistrement des métriques de ressources
  recordResourceMetric(entry) {
    const metric = {
      type: 'resource',
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      timestamp: Date.now(),
    };

    this.metrics.getState().addResult({
      category: 'resource',
      ...metric,
    });
  }

  // Enregistrement des métriques réseau
  recordNetworkMetric(connection) {
    const metric = {
      type: 'network',
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      timestamp: Date.now(),
    };

    this.metrics.getState().addResult({
      category: 'network',
      ...metric,
    });
  }

  // Exécution d'un test de charge
  async runLoadTest(config) {
    const {
      duration = 60000, // 1 minute par défaut
      concurrentUsers = 10,
      endpoints = [],
      thinkTime = 1000,
    } = config;

    this.metrics.getState().setCurrentTest({
      startTime: Date.now(),
      config,
    });

    const startTime = Date.now();
    const results = [];

    while (Date.now() - startTime < duration) {
      const promises = Array(concurrentUsers)
        .fill()
        .map(async () => {
          for (const endpoint of endpoints) {
            const start = performance.now();
            try {
              const response = await fetch(endpoint.url, {
                method: endpoint.method || 'GET',
                headers: endpoint.headers,
                body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
              });

              const end = performance.now();
              results.push({
                endpoint: endpoint.url,
                status: response.status,
                duration: end - start,
                timestamp: Date.now(),
              });

              // Temps de réflexion entre les requêtes
              await new Promise((resolve) => setTimeout(resolve, thinkTime));
            } catch (error) {
              results.push({
                endpoint: endpoint.url,
                error: error.message,
                timestamp: Date.now(),
              });
            }
          }
        });

      await Promise.all(promises);
    }

    this.metrics.getState().addResult({
      category: 'load-test',
      results,
      summary: this.generateLoadTestSummary(results),
    });

    return results;
  }

  // Génération du résumé des tests de charge
  generateLoadTestSummary(results) {
    const successfulRequests = results.filter((r) => !r.error);
    const failedRequests = results.filter((r) => r.error);

    return {
      totalRequests: results.length,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      averageResponseTime:
        successfulRequests.reduce((acc, r) => acc + r.duration, 0) /
        successfulRequests.length,
      minResponseTime: Math.min(...successfulRequests.map((r) => r.duration)),
      maxResponseTime: Math.max(...successfulRequests.map((r) => r.duration)),
      errorRate: (failedRequests.length / results.length) * 100,
    };
  }

  // Analyse des métriques de performance
  analyzePerformanceMetrics() {
    const { results } = this.metrics.getState();
    const performanceMetrics = results.filter((r) => r.category === 'performance');

    return {
      lcp: this.calculateLCP(performanceMetrics),
      fid: this.calculateFID(performanceMetrics),
      cls: this.calculateCLS(performanceMetrics),
      ttfb: this.calculateTTFB(performanceMetrics),
    };
  }

  // Calcul des métriques Core Web Vitals
  calculateLCP(metrics) {
    const lcpEntries = metrics.filter((m) => m.type === 'largest-contentful-paint');
    return Math.max(...lcpEntries.map((m) => m.value));
  }

  calculateFID(metrics) {
    const fidEntries = metrics.filter((m) => m.type === 'first-input');
    return Math.min(...fidEntries.map((m) => m.value));
  }

  calculateCLS(metrics) {
    const clsEntries = metrics.filter((m) => m.type === 'layout-shift');
    return clsEntries.reduce((acc, m) => acc + m.value, 0);
  }

  calculateTTFB(metrics) {
    const navigationEntries = metrics.filter((m) => m.type === 'navigation');
    return navigationEntries.reduce((acc, m) => acc + m.value, 0) / navigationEntries.length;
  }

  // Nettoyage des métriques
  cleanup() {
    this.performanceObserver.disconnect();
    this.resourceObserver.disconnect();
    this.metrics.getState().setResults([]);
    this.metrics.getState().setCurrentTest(null);
  }
}

export const loadTestService = new LoadTestService();
export default loadTestService; 