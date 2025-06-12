import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const useDataFetching = (url, options = {}) => {
  const {
    method = 'GET',
    data = null,
    headers = {},
    cacheKey = url,
    cacheTime = CACHE_DURATION,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async (retryAttempt = 0) => {
    try {
      // Vérifier le cache
      const cachedData = cache.get(cacheKey);
      if (cachedData && Date.now() - cachedData.timestamp < cacheTime) {
        setState({
          data: cachedData.data,
          loading: false,
          error: null,
        });
        return;
      }

      const response = await axios({
        method,
        url,
        data,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      // Mettre en cache les données
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });

      setState({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      if (retryAttempt < retryCount) {
        setTimeout(() => {
          fetchData(retryAttempt + 1);
        }, retryDelay * Math.pow(2, retryAttempt));
      } else {
        setState({
          data: null,
          loading: false,
          error: error.message || 'Une erreur est survenue',
        });
      }
    }
  }, [url, method, data, headers, cacheKey, cacheTime, retryCount, retryDelay]);

  const refetch = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }));
    fetchData();
  }, [fetchData]);

  const clearCache = useCallback(() => {
    cache.delete(cacheKey);
  }, [cacheKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch,
    clearCache,
  };
};

export default useDataFetching; 