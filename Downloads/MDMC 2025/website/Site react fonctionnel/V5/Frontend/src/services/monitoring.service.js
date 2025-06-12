import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

class MonitoringService {
  constructor() {
    this.metrics = createStore(
      persist(
        (set) => ({
          performance: {},
          errors: [],
          userActions: [],
          networkRequests: [],
          setPerformance: (metrics) => set({ performance: metrics }),
          addError: (error) =>
            set((state) => ({
              errors: [...state.errors, { ...error, timestamp: Date.now() }],
            })),
          addUserAction: (action) =>
            set((state) => ({
              userActions: [...state.userActions, { ...action, timestamp: Date.now() }],
            })),
          addNetworkRequest: (request) =>
            set((state) => ({
              networkRequests: [...state.networkRequests, { ...request, timestamp: Date.now() }],
            })),
        }),
        {
          name: 'monitoring-metrics',
        }
      )
    );

    this.init();
  }

  init() {
    this.setupPerformanceObserver();
    this.setupErrorObserver();
    this.setupNetworkObserver();
    this.setupUserActionObserver();
    this.setupResourceObserver();
  }

  // Configuration de l'observateur de performance
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
        'paint',
        'element',
      ],
    });
  }

  // Configuration de l'observateur d'erreurs
  setupErrorObserver() {
    window.addEventListener('error', (event) => {
      this.recordError({
        type: 'error',
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        type: 'unhandledrejection',
        message: event.reason?.message || 'Promise rejected',
        stack: event.reason?.stack,
      });
    });
  }

  // Configuration de l'observateur réseau
  setupNetworkObserver() {
    this.networkObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordNetworkRequest(entry);
      }
    });

    this.networkObserver.observe({
      entryTypes: ['resource'],
    });
  }

  // Configuration de l'observateur d'actions utilisateur
  setupUserActionObserver() {
    const userActions = [
      'click',
      'input',
      'submit',
      'scroll',
      'resize',
      'keydown',
      'mouseover',
    ];

    userActions.forEach((action) => {
      window.addEventListener(action, (event) => {
        this.recordUserAction({
          type: action,
          target: event.target.tagName,
          path: this.getElementPath(event.target),
          timestamp: Date.now(),
        });
      });
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

  // Enregistrement des métriques de performance
  recordPerformanceMetric(entry) {
    const metrics = this.metrics.getState().performance;
    const type = entry.entryType;

    if (!metrics[type]) {
      metrics[type] = [];
    }

    metrics[type].push({
      name: entry.name,
      value: entry.value || entry.duration,
      timestamp: Date.now(),
    });

    this.metrics.getState().setPerformance(metrics);
  }

  // Enregistrement des erreurs
  recordError(error) {
    this.metrics.getState().addError({
      ...error,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }

  // Enregistrement des requêtes réseau
  recordNetworkRequest(entry) {
    this.metrics.getState().addNetworkRequest({
      url: entry.name,
      method: entry.initiatorType,
      duration: entry.duration,
      size: entry.transferSize,
      status: entry.responseStatus,
    });
  }

  // Enregistrement des actions utilisateur
  recordUserAction(action) {
    this.metrics.getState().addUserAction(action);
  }

  // Enregistrement des métriques de ressources
  recordResourceMetric(entry) {
    const metrics = this.metrics.getState().performance;
    const type = 'resource';

    if (!metrics[type]) {
      metrics[type] = [];
    }

    metrics[type].push({
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      timestamp: Date.now(),
    });

    this.metrics.getState().setPerformance(metrics);
  }

  // Récupération du chemin d'un élément
  getElementPath(element) {
    const path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();
      if (element.id) {
        selector += `#${element.id}`;
      } else if (element.className) {
        selector += `.${element.className.split(' ').join('.')}`;
      }
      path.unshift(selector);
      element = element.parentNode;
    }
    return path.join(' > ');
  }

  // Analyse des métriques de performance
  analyzePerformanceMetrics() {
    const { performance } = this.metrics.getState();
    const analysis = {};

    for (const [type, metrics] of Object.entries(performance)) {
      analysis[type] = {
        count: metrics.length,
        average: this.calculateAverage(metrics.map((m) => m.value || m.duration)),
        min: Math.min(...metrics.map((m) => m.value || m.duration)),
        max: Math.max(...metrics.map((m) => m.value || m.duration)),
      };
    }

    return analysis;
  }

  // Analyse des erreurs
  analyzeErrors() {
    const { errors } = this.metrics.getState();
    const analysis = {
      total: errors.length,
      byType: {},
      bySource: {},
      recent: errors.slice(-10),
    };

    errors.forEach((error) => {
      analysis.byType[error.type] = (analysis.byType[error.type] || 0) + 1;
      analysis.bySource[error.source] = (analysis.bySource[error.source] || 0) + 1;
    });

    return analysis;
  }

  // Analyse des actions utilisateur
  analyzeUserActions() {
    const { userActions } = this.metrics.getState();
    const analysis = {
      total: userActions.length,
      byType: {},
      byTarget: {},
      recent: userActions.slice(-10),
    };

    userActions.forEach((action) => {
      analysis.byType[action.type] = (analysis.byType[action.type] || 0) + 1;
      analysis.byTarget[action.target] = (analysis.byTarget[action.target] || 0) + 1;
    });

    return analysis;
  }

  // Analyse des requêtes réseau
  analyzeNetworkRequests() {
    const { networkRequests } = this.metrics.getState();
    const analysis = {
      total: networkRequests.length,
      byStatus: {},
      byMethod: {},
      averageDuration: this.calculateAverage(networkRequests.map((r) => r.duration)),
      recent: networkRequests.slice(-10),
    };

    networkRequests.forEach((request) => {
      analysis.byStatus[request.status] = (analysis.byStatus[request.status] || 0) + 1;
      analysis.byMethod[request.method] = (analysis.byMethod[request.method] || 0) + 1;
    });

    return analysis;
  }

  // Calcul de la moyenne
  calculateAverage(values) {
    return values.reduce((acc, val) => acc + val, 0) / values.length;
  }

  // Nettoyage des métriques
  cleanup() {
    this.performanceObserver.disconnect();
    this.networkObserver.disconnect();
    this.resourceObserver.disconnect();
    this.metrics.getState().setPerformance({});
    this.metrics.getState().errors = [];
    this.metrics.getState().userActions = [];
    this.metrics.getState().networkRequests = [];
  }
}

export const monitoringService = new MonitoringService();
export default monitoringService; 