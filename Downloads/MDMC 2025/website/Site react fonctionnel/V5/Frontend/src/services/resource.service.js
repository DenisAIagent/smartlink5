import { createResource } from 'react-cache';
import { preloadImage, preloadFont } from 'react-preload';

class ResourceService {
  constructor() {
    this.resourceCache = new Map();
    this.priorityQueue = new Map();
    this.intersectionObserver = null;
    this.performanceObserver = null;
    this.init();
  }

  init() {
    // Initialisation de l'Intersection Observer pour le lazy loading
    this.intersectionObserver = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    // Initialisation du Performance Observer pour le monitoring
    this.performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.handlePerformanceEntry(entry);
      }
    });

    this.performanceObserver.observe({ entryTypes: ['resource'] });
  }

  // Gestion des ressources avec priorité
  async loadResource(url, type, priority = 'normal') {
    if (this.resourceCache.has(url)) {
      return this.resourceCache.get(url);
    }

    const resource = createResource(async () => {
      try {
        switch (type) {
          case 'image':
            return await this.loadImage(url);
          case 'font':
            return await this.loadFont(url);
          case 'script':
            return await this.loadScript(url);
          case 'style':
            return await this.loadStyle(url);
          default:
            return await this.fetchResource(url);
        }
      } catch (error) {
        console.error(`Erreur de chargement de la ressource: ${url}`, error);
        throw error;
      }
    });

    this.resourceCache.set(url, resource);
    this.priorityQueue.set(url, { type, priority });
    return resource;
  }

  // Chargement optimisé des images
  async loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.decoding = 'async';
      img.loading = 'lazy';
      
      if ('fetchPriority' in img) {
        img.fetchPriority = 'high';
      }

      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }

  // Chargement optimisé des polices
  async loadFont(url) {
    return new Promise((resolve, reject) => {
      const font = new FontFace('CustomFont', `url(${url})`);
      font.load()
        .then(loadedFont => {
          document.fonts.add(loadedFont);
          resolve(loadedFont);
        })
        .catch(reject);
    });
  }

  // Chargement optimisé des scripts
  async loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.defer = true;
      
      if ('fetchPriority' in script) {
        script.fetchPriority = 'high';
      }

      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Chargement optimisé des styles
  async loadStyle(url) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.media = 'print';
      link.onload = () => {
        link.media = 'all';
        resolve(link);
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  // Gestion du lazy loading
  observeElement(element, callback) {
    if (element) {
      this.intersectionObserver.observe(element);
      this.observedElements.set(element, callback);
    }
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const callback = this.observedElements.get(entry.target);
        if (callback) {
          callback();
          this.intersectionObserver.unobserve(entry.target);
          this.observedElements.delete(entry.target);
        }
      }
    });
  }

  // Gestion des métriques de performance
  handlePerformanceEntry(entry) {
    const { name, duration, transferSize } = entry;
    this.metrics.set(name, {
      duration,
      size: transferSize,
      timestamp: performance.now(),
    });
  }

  // Préchargement intelligent
  async preloadResources(resources) {
    const preloadPromises = resources.map(({ url, type, priority }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = type;
      
      if (priority) {
        link.fetchPriority = priority;
      }

      document.head.appendChild(link);
      return this.loadResource(url, type, priority);
    });

    return Promise.all(preloadPromises);
  }

  // Nettoyage des ressources
  cleanup() {
    this.intersectionObserver.disconnect();
    this.performanceObserver.disconnect();
    this.resourceCache.clear();
    this.priorityQueue.clear();
    this.observedElements.clear();
    this.metrics.clear();
  }
}

export const resourceService = new ResourceService();
export default resourceService; 