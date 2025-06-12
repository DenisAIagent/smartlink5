import { useEffect, useCallback, useRef } from 'react';
import { useStore } from './useStore';
import resourceService from '../services/resource.service';

export const useResource = (options = {}) => {
  const {
    url,
    type = 'image',
    priority = 'normal',
    preload = false,
    lazy = true,
    onLoad,
    onError,
  } = options;

  const elementRef = useRef(null);
  const { isMobile } = useStore();

  // Gestion du chargement des ressources
  const loadResource = useCallback(async () => {
    try {
      const resource = await resourceService.loadResource(url, type, priority);
      onLoad?.(resource);
      return resource;
    } catch (error) {
      onError?.(error);
      throw error;
    }
  }, [url, type, priority, onLoad, onError]);

  // Gestion du lazy loading
  useEffect(() => {
    if (lazy && elementRef.current) {
      resourceService.observeElement(elementRef.current, loadResource);
    } else if (preload) {
      loadResource();
    }

    return () => {
      if (elementRef.current) {
        resourceService.intersectionObserver?.unobserve(elementRef.current);
      }
    };
  }, [lazy, preload, loadResource]);

  // Optimisations spécifiques pour mobile
  useEffect(() => {
    if (isMobile) {
      // Réduire la qualité des images sur mobile
      if (type === 'image' && url) {
        const mobileUrl = url.replace(/\.[^/.]+$/, '-mobile$&');
        loadResource(mobileUrl);
      }
    }
  }, [isMobile, type, url, loadResource]);

  // Gestion du préchargement intelligent
  useEffect(() => {
    if (preload) {
      const preloadOptions = {
        url,
        type,
        priority: isMobile ? 'low' : priority,
      };
      resourceService.preloadResources([preloadOptions]);
    }
  }, [preload, url, type, priority, isMobile]);

  return {
    elementRef,
    loadResource,
    isLoaded: resourceService.resourceCache.has(url),
  };
};

// Hooks spécifiques pour différents types de ressources
export const useImage = (options) => useResource({ ...options, type: 'image' });
export const useFont = (options) => useResource({ ...options, type: 'font' });
export const useScript = (options) => useResource({ ...options, type: 'script' });
export const useStyle = (options) => useResource({ ...options, type: 'style' });

// Hook pour le préchargement en masse
export const usePreloadResources = (resources) => {
  useEffect(() => {
    resourceService.preloadResources(resources);
  }, [resources]);
};

export default useResource; 