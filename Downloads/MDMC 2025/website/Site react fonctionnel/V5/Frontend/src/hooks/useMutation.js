import { useState, useCallback } from 'react';
import useStore from '../store';
import { useNotification } from './useNotification';

export const useMutation = (mutationFn, options = {}) => {
  const {
    onSuccess,
    onError,
    onSettled,
    optimisticUpdate,
  } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotification();
  const { setCacheData, getCacheData } = useStore();

  const mutate = useCallback(async (variables, config = {}) => {
    const {
      onSuccess: configOnSuccess,
      onError: configOnError,
      onSettled: configOnSettled,
      optimisticUpdate: configOptimisticUpdate,
    } = config;

    setIsLoading(true);
    setError(null);

    // Gestion de la mise à jour optimiste
    if (optimisticUpdate || configOptimisticUpdate) {
      const optimisticData = typeof optimisticUpdate === 'function'
        ? optimisticUpdate(variables)
        : configOptimisticUpdate(variables);

      setData(optimisticData);
      if (optimisticData?.cacheKey) {
        setCacheData(optimisticData.cacheKey, optimisticData.data);
      }
    }

    try {
      const result = await mutationFn(variables);
      setData(result);

      // Mise à jour du cache si nécessaire
      if (result?.cacheKey) {
        setCacheData(result.cacheKey, result.data);
      }

      showSuccess(result.message || 'Opération réussie');
      onSuccess?.(result, variables);
      configOnSuccess?.(result, variables);
    } catch (err) {
      setError(err);

      // Restauration des données en cas d'erreur
      if (optimisticUpdate || configOptimisticUpdate) {
        const previousData = getCacheData(variables?.cacheKey);
        if (previousData) {
          setData(previousData);
          setCacheData(variables?.cacheKey, previousData);
        }
      }

      showError(err.message || 'Une erreur est survenue');
      onError?.(err, variables);
      configOnError?.(err, variables);
    } finally {
      setIsLoading(false);
      onSettled?.(data, error, variables);
      configOnSettled?.(data, error, variables);
    }
  }, [mutationFn, onSuccess, onError, onSettled, optimisticUpdate, showSuccess, showError, setCacheData, getCacheData]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    mutate,
    data,
    error,
    isLoading,
    reset,
  };
};

export default useMutation; 