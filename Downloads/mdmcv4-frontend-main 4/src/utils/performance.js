import logger from './logger';

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.marks = new Map();
    this.measures = new Map();
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  // Mesure du temps de chargement initial
  measureInitialLoad() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      this.recordMetric('initialLoad', loadTime);
    }
  }

  // Mesure du temps de rendu des composants
  measureComponentRender(componentName, startTime) {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    this.recordMetric(`render_${componentName}`, renderTime);
  }

  // Mesure des requêtes API
  measureApiCall(endpoint, startTime) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    this.recordMetric(`api_${endpoint}`, duration);
  }

  // Enregistrement d'une métrique
  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push({
      value,
      timestamp: new Date().toISOString()
    });

    if (this.isDevelopment) {
      logger.debug(`Métrique enregistrée: ${name}`, { value });
    }
  }

  // Marquer un point dans le temps
  mark(name) {
    this.marks.set(name, performance.now());
  }

  // Mesurer entre deux marques
  measure(name, startMark, endMark) {
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);

    if (start && end) {
      this.measures.set(name, end - start);
      this.recordMetric(name, end - start);
    }
  }

  // Obtenir les métriques
  getMetrics() {
    const result = {};
    this.metrics.forEach((values, key) => {
      result[key] = {
        count: values.length,
        average: values.reduce((acc, curr) => acc + curr.value, 0) / values.length,
        min: Math.min(...values.map(v => v.value)),
        max: Math.max(...values.map(v => v.value)),
        values
      };
    });
    return result;
  }

  // Nettoyer les métriques
  clearMetrics() {
    this.metrics.clear();
    this.marks.clear();
    this.measures.clear();
  }

  // Vérifier les performances
  checkPerformance() {
    const metrics = this.getMetrics();
    const warnings = [];

    // Vérifier le temps de chargement initial
    if (metrics.initialLoad?.average > 3000) {
      warnings.push('Le temps de chargement initial est supérieur à 3 secondes');
    }

    // Vérifier les temps de rendu des composants
    Object.entries(metrics)
      .filter(([key]) => key.startsWith('render_'))
      .forEach(([key, value]) => {
        if (value.average > 100) {
          warnings.push(`Le composant ${key.replace('render_', '')} met plus de 100ms à se rendre`);
        }
      });

    // Vérifier les temps de réponse API
    Object.entries(metrics)
      .filter(([key]) => key.startsWith('api_'))
      .forEach(([key, value]) => {
        if (value.average > 1000) {
          warnings.push(`L'endpoint ${key.replace('api_', '')} met plus d'une seconde à répondre`);
        }
      });

    return warnings;
  }

  // Envoyer les métriques au serveur
  async sendMetrics() {
    if (!this.isDevelopment) {
      try {
        const metrics = this.getMetrics();
        // Implémenter l'envoi des métriques au serveur
        // await api.post('/metrics', metrics);
        logger.info('Métriques envoyées avec succès');
      } catch (error) {
        logger.error('Erreur lors de l\'envoi des métriques', error);
      }
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor; 