import { useState, useCallback, useEffect } from 'react';
import useStore from '../store';
import { useNotification } from './useNotification';

export const useQuery = (queryKey, queryFn, options = {}) => {
  const {
    enabled = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const { getCacheData, setCacheData } = useStore();
  const { showError } = useNotification();

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    const cachedData = !force && getCacheData(queryKey);
    if (cachedData) {
      setData(cachedData);
      return;
    }

    setIsLoading(true);
    setIsFetching(true);
    setError(null);

    let retryCount = 0;
    const executeQuery = async () => {
      try {
        const result = await queryFn();
        setData(result);
        setCacheData(queryKey, result);
        onSuccess?.(result);
      } catch (err) {
        if (retryCount < retry) {
          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, retryDelay * retryCount));
          return executeQuery();
        }
        setError(err);
        showError(err.message || 'Une erreur est survenue');
        onError?.(err);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    };

    await executeQuery();
  }, [queryKey, queryFn, enabled, retry, retryDelay, onSuccess, onError, getCacheData, setCacheData, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  };
};

export default useQuery; 