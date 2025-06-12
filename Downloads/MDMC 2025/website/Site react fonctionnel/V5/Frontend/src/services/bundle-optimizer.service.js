import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

class BundleOptimizerService {
  constructor() {
    this.metrics = createStore(
      persist(
        (set) => ({
          bundleSize: 0,
          chunkSizes: {},
          loadTimes: {},
          lastOptimization: null,
          setBundleSize: (size) => set({ bundleSize: size }),
          setChunkSizes: (sizes) => set({ chunkSizes: sizes }),
          setLoadTimes: (times) => set({ loadTimes: times }),
          setLastOptimization: (date) => set({ lastOptimization: date }),
        }),
        {
          name: 'bundle-optimization-metrics',
        }
      )
    );

    this.init();
  }

  init() {
    this.setupPerformanceObserver();
    this.analyzeCurrentBundle();
  }

  // Configuration de l'observateur de performance
  setupPerformanceObserver() {
    this.performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === 'script') {
          this.recordScriptLoadTime(entry);
        }
      }
    });

    this.performanceObserver.observe({
      entryTypes: ['resource'],
    });
  }

  // Analyse du bundle actuel
  async analyzeCurrentBundle() {
    const resources = performance.getEntriesByType('resource');
    const scripts = resources.filter((r) => r.initiatorType === 'script');

    const chunkSizes = {};
    const loadTimes = {};

    for (const script of scripts) {
      const name = this.extractChunkName(script.name);
      chunkSizes[name] = script.transferSize;
      loadTimes[name] = script.duration;
    }

    this.metrics.getState().setChunkSizes(chunkSizes);
    this.metrics.getState().setLoadTimes(loadTimes);
    this.metrics.getState().setBundleSize(
      Object.values(chunkSizes).reduce((acc, size) => acc + size, 0)
    );
  }

  // Extraction du nom du chunk
  extractChunkName(url) {
    const match = url.match(/([^/]+)\.js$/);
    return match ? match[1] : 'unknown';
  }

  // Enregistrement du temps de chargement d'un script
  recordScriptLoadTime(entry) {
    const name = this.extractChunkName(entry.name);
    const loadTimes = { ...this.metrics.getState().loadTimes };
    loadTimes[name] = entry.duration;
    this.metrics.getState().setLoadTimes(loadTimes);
  }

  // Analyse des dépendances
  async analyzeDependencies() {
    const dependencies = await this.getDependencies();
    return this.optimizeDependencies(dependencies);
  }

  // Récupération des dépendances
  async getDependencies() {
    // Simulation de la récupération des dépendances
    return {
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        '@mui/material': '^5.15.0',
        '@emotion/react': '^11.11.0',
        '@emotion/styled': '^11.11.0',
      },
      devDependencies: {
        '@babel/core': '^7.23.0',
        '@babel/preset-react': '^7.23.0',
        'babel-loader': '^9.1.3',
        webpack: '^5.89.0',
        'webpack-bundle-analyzer': '^4.10.0',
      },
    };
  }

  // Optimisation des dépendances
  optimizeDependencies(dependencies) {
    const recommendations = {
      updates: [],
      removals: [],
      additions: [],
    };

    // Vérification des versions obsolètes
    for (const [name, version] of Object.entries(dependencies.dependencies)) {
      const latestVersion = this.getLatestVersion(name);
      if (latestVersion && version !== latestVersion) {
        recommendations.updates.push({
          name,
          current: version,
          recommended: latestVersion,
        });
      }
    }

    // Vérification des dépendances inutilisées
    const unusedDeps = this.findUnusedDependencies(dependencies);
    recommendations.removals.push(...unusedDeps);

    // Recommandations de nouvelles dépendances
    const newDeps = this.recommendNewDependencies(dependencies);
    recommendations.additions.push(...newDeps);

    return recommendations;
  }

  // Récupération de la dernière version d'une dépendance
  getLatestVersion(packageName) {
    // Simulation de la récupération de la dernière version
    const versions = {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      '@mui/material': '^5.15.0',
    };
    return versions[packageName];
  }

  // Recherche des dépendances inutilisées
  findUnusedDependencies(dependencies) {
    // Simulation de la recherche de dépendances inutilisées
    return [
      {
        name: 'lodash',
        reason: 'Utilisation de méthodes natives JavaScript recommandée',
      },
    ];
  }

  // Recommandation de nouvelles dépendances
  recommendNewDependencies(dependencies) {
    // Simulation de recommandations de nouvelles dépendances
    return [
      {
        name: '@tanstack/react-query',
        reason: 'Gestion optimisée des requêtes et du cache',
        version: '^5.0.0',
      },
    ];
  }

  // Génération des recommandations d'optimisation
  generateOptimizationRecommendations() {
    const { chunkSizes, loadTimes } = this.metrics.getState();
    const recommendations = [];

    // Analyse des chunks trop volumineux
    for (const [name, size] of Object.entries(chunkSizes)) {
      if (size > 500 * 1024) { // 500KB
        recommendations.push({
          type: 'size',
          chunk: name,
          currentSize: this.formatSize(size),
          recommendation: 'Envisager le code splitting ou la lazy loading',
        });
      }
    }

    // Analyse des temps de chargement
    for (const [name, time] of Object.entries(loadTimes)) {
      if (time > 1000) { // 1 seconde
        recommendations.push({
          type: 'performance',
          chunk: name,
          currentTime: `${time.toFixed(2)}ms`,
          recommendation: 'Optimiser le chargement ou précharger le chunk',
        });
      }
    }

    return recommendations;
  }

  // Formatage de la taille
  formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  // Nettoyage des métriques
  cleanup() {
    this.performanceObserver.disconnect();
    this.metrics.getState().setBundleSize(0);
    this.metrics.getState().setChunkSizes({});
    this.metrics.getState().setLoadTimes({});
    this.metrics.getState().setLastOptimization(null);
  }
}

export const bundleOptimizerService = new BundleOptimizerService();
export default bundleOptimizerService; 