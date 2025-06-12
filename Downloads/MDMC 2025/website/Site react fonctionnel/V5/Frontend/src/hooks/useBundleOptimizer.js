import { useState, useCallback, useEffect } from 'react';
import { bundleOptimizerService } from '../services/bundle-optimizer.service';

export const useBundleOptimizer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bundleMetrics, setBundleMetrics] = useState(null);
  const [dependencies, setDependencies] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  // Analyse du bundle
  const analyzeBundle = useCallback(async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      // Analyse du bundle actuel
      await bundleOptimizerService.analyzeCurrentBundle();
      const metrics = {
        bundleSize: bundleOptimizerService.metrics.getState().bundleSize,
        chunkSizes: bundleOptimizerService.metrics.getState().chunkSizes,
        loadTimes: bundleOptimizerService.metrics.getState().loadTimes,
      };
      setBundleMetrics(metrics);

      // Analyse des dépendances
      const deps = await bundleOptimizerService.analyzeDependencies();
      setDependencies(deps);

      // Génération des recommandations
      const recs = bundleOptimizerService.generateOptimizationRecommendations();
      setRecommendations(recs);

      return { metrics, deps, recs };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Optimisation des dépendances
  const optimizeDependencies = useCallback(async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const deps = await bundleOptimizerService.analyzeDependencies();
      setDependencies(deps);

      return deps;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Mise à jour des dépendances
  const updateDependencies = useCallback(async (updates) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      // Simulation de la mise à jour des dépendances
      const updatedDeps = await bundleOptimizerService.analyzeDependencies();
      setDependencies(updatedDeps);

      return updatedDeps;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Nettoyage des métriques
  const cleanup = useCallback(() => {
    bundleOptimizerService.cleanup();
    setBundleMetrics(null);
    setDependencies(null);
    setRecommendations(null);
    setError(null);
  }, []);

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isAnalyzing,
    bundleMetrics,
    dependencies,
    recommendations,
    error,
    analyzeBundle,
    optimizeDependencies,
    updateDependencies,
    cleanup,
  };
};

export default useBundleOptimizer; 