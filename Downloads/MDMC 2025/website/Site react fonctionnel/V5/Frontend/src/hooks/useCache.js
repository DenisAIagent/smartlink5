import { useCallback, useEffect, useRef } from 'react';
import { useStore } from './useStore';
import cacheService from '../services/cache.service';

export const useCache = (options = {}) => {
  const {
    key,
    ttl = 3600000, // 1 heure par défaut
    priority = 'normal',
    maxSize,
    forceRefresh = false,
    onSuccess,
    onError,
  } = options;

  const { isOnline } = useStore();
  const cacheRef = useRef(null);
  const timeoutRef = useRef(null);

  // Gestion du cache avec stratégie de revalidation
  const getCachedData = useCallback(async () => {
    try {
      const data = await cacheService.get(key, {
        priority,
        forceRefresh,
      });

      if (data) {
        cacheRef.current = data;
        onSuccess?.(data);
        return data;
      }

      return null;
    } catch (error) {
      onError?.(error);
      return null;
    }
  }, [key, priority, forceRefresh, onSuccess, onError]);

  // Mise en cache avec stratégie de mise à jour
  const setCachedData = useCallback(async (value) => {
    try {
      await cacheService.set(key, value, {
        ttl,
        priority,
        maxSize,
      });

      cacheRef.current = value;
      onSuccess?.(value);
      return value;
    } catch (error) {
      onError?.(error);
      throw error;
    }
  }, [key, ttl, priority, maxSize, onSuccess, onError]);

  // Gestion de la revalidation automatique
  useEffect(() => {
    if (isOnline) {
      const revalidate = async () => {
        await getCachedData();
      };

      // Revalidation périodique
      timeoutRef.current = setInterval(revalidate, ttl);

      // Revalidation initiale
      revalidate();
    }

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [isOnline, ttl, getCachedData]);

  // Gestion du nettoyage du cache
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, []);

  // Préchargement intelligent
  const preload = useCallback(async (keys) => {
    try {
      const data = await cacheService.preload(keys, { priority });
      return data;
    } catch (error) {
      onError?.(error);
      return null;
    }
  }, [priority, onError]);

  // Nettoyage intelligent
  const cleanup = useCallback(async (options) => {
    try {
      await cacheService.cleanup(options);
    } catch (error) {
      onError?.(error);
    }
  }, [onError]);

  // Récupération des métriques
  const getMetrics = useCallback(() => {
    return cacheService.getMetrics();
  }, []);

  return {
    getCachedData,
    setCachedData,
    preload,
    cleanup,
    getMetrics,
    data: cacheRef.current,
  };
};

// Hooks spécialisés pour différents types de données
export const useImageCache = (options) => useCache({
  ...options,
  priority: 'high',
  ttl: 86400000, // 24 heures pour les images
});

export const useDataCache = (options) => useCache({
  ...options,
  priority: 'normal',
  ttl: 3600000, // 1 heure pour les données
});

export const useConfigCache = (options) => useCache({
  ...options,
  priority: 'low',
  ttl: 604800000, // 1 semaine pour la configuration
});

export default useCache; 