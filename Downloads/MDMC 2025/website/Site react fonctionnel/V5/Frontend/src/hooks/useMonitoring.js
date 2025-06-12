import { useState, useCallback, useEffect } from 'react';
import { monitoringService } from '../services/monitoring.service';

export const useMonitoring = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [errorMetrics, setErrorMetrics] = useState(null);
  const [userActionMetrics, setUserActionMetrics] = useState(null);
  const [networkMetrics, setNetworkMetrics] = useState(null);
  const [error, setError] = useState(null);

  // Démarrage du monitoring
  const startMonitoring = useCallback(async () => {
    try {
      setIsMonitoring(true);
      setError(null);

      // Analyse des métriques de performance
      const performance = monitoringService.analyzePerformanceMetrics();
      setPerformanceMetrics(performance);

      // Analyse des erreurs
      const errors = monitoringService.analyzeErrors();
      setErrorMetrics(errors);

      // Analyse des actions utilisateur
      const userActions = monitoringService.analyzeUserActions();
      setUserActionMetrics(userActions);

      // Analyse des requêtes réseau
      const network = monitoringService.analyzeNetworkRequests();
      setNetworkMetrics(network);

      return {
        performance,
        errors,
        userActions,
        network,
      };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Enregistrement d'une action utilisateur personnalisée
  const trackUserAction = useCallback((action) => {
    monitoringService.recordUserAction({
      ...action,
      timestamp: Date.now(),
    });
  }, []);

  // Enregistrement d'une erreur personnalisée
  const trackError = useCallback((error) => {
    monitoringService.recordError({
      ...error,
      timestamp: Date.now(),
    });
  }, []);

  // Enregistrement d'une métrique de performance personnalisée
  const trackPerformance = useCallback((metric) => {
    monitoringService.recordPerformanceMetric({
      ...metric,
      timestamp: Date.now(),
    });
  }, []);

  // Enregistrement d'une requête réseau personnalisée
  const trackNetworkRequest = useCallback((request) => {
    monitoringService.recordNetworkRequest({
      ...request,
      timestamp: Date.now(),
    });
  }, []);

  // Nettoyage des métriques
  const cleanup = useCallback(() => {
    monitoringService.cleanup();
    setPerformanceMetrics(null);
    setErrorMetrics(null);
    setUserActionMetrics(null);
    setNetworkMetrics(null);
    setError(null);
  }, []);

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isMonitoring,
    performanceMetrics,
    errorMetrics,
    userActionMetrics,
    networkMetrics,
    error,
    startMonitoring,
    trackUserAction,
    trackError,
    trackPerformance,
    trackNetworkRequest,
    cleanup,
  };
};

export default useMonitoring; 