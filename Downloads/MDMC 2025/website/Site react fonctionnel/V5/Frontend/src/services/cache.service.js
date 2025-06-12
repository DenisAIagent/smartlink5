import { createCache } from 'react-cache';
import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.persistentCache = createStore(
      persist(
        (set) => ({
          data: {},
          metadata: {},
          setData: (key, value, options = {}) => 
            set((state) => ({
              data: { ...state.data, [key]: value },
              metadata: {
                ...state.metadata,
                [key]: {
                  timestamp: Date.now(),
                  ttl: options.ttl || 3600000, // 1 heure par défaut
                  priority: options.priority || 'normal',
                  size: this.calculateSize(value),
                },
              },
            })),
          clearData: (key) =>
            set((state) => {
              const newData = { ...state.data };
              const newMetadata = { ...state.metadata };
              delete newData[key];
              delete newMetadata[key];
              return { data: newData, metadata: newMetadata };
            }),
        }),
        {
          name: 'app-cache',
          partialize: (state) => ({
            data: state.data,
            metadata: state.metadata,
          }),
        }
      )
    );

    this.reactCache = createCache();
    this.init();
  }

  init() {
    // Initialisation du cache avec les meilleures pratiques de 2025
    this.setupCacheEviction();
    this.setupCacheSync();
    this.setupCacheMetrics();
  }

  // Configuration de l'éviction intelligente du cache
  setupCacheEviction() {
    setInterval(() => {
      const now = Date.now();
      const { data, metadata } = this.persistentCache.getState();

      Object.entries(metadata).forEach(([key, meta]) => {
        if (now - meta.timestamp > meta.ttl) {
          this.persistentCache.getState().clearData(key);
        }
      });
    }, 60000); // Vérification toutes les minutes
  }

  // Synchronisation du cache entre les onglets
  setupCacheSync() {
    window.addEventListener('storage', (event) => {
      if (event.key === 'app-cache') {
        const newCache = JSON.parse(event.newValue);
        this.persistentCache.setState(newCache);
      }
    });
  }

  // Métriques de performance du cache
  setupCacheMetrics() {
    this.metrics = {
      hits: 0,
      misses: 0,
      size: 0,
      lastUpdated: Date.now(),
    };

    setInterval(() => {
      const { data, metadata } = this.persistentCache.getState();
      this.metrics.size = Object.values(metadata).reduce(
        (acc, meta) => acc + meta.size,
        0
      );
      this.metrics.lastUpdated = Date.now();
    }, 5000);
  }

  // Calcul de la taille des données
  calculateSize(data) {
    const str = JSON.stringify(data);
    return new Blob([str]).size;
  }

  // Gestion du cache avec priorité
  async get(key, options = {}) {
    const { priority = 'normal', forceRefresh = false } = options;

    // Vérification du cache mémoire
    if (this.memoryCache.has(key) && !forceRefresh) {
      this.metrics.hits++;
      return this.memoryCache.get(key);
    }

    // Vérification du cache persistant
    const { data, metadata } = this.persistentCache.getState();
    if (data[key] && !forceRefresh) {
      const meta = metadata[key];
      if (Date.now() - meta.timestamp < meta.ttl) {
        this.metrics.hits++;
        this.memoryCache.set(key, data[key]);
        return data[key];
      }
    }

    this.metrics.misses++;
    return null;
  }

  // Mise en cache avec stratégie intelligente
  async set(key, value, options = {}) {
    const { ttl, priority, maxSize } = options;

    // Vérification de la taille maximale
    if (maxSize) {
      const currentSize = this.calculateSize(value);
      if (currentSize > maxSize) {
        throw new Error('Données trop volumineuses pour le cache');
      }
    }

    // Mise en cache mémoire
    this.memoryCache.set(key, value);

    // Mise en cache persistant
    this.persistentCache.getState().setData(key, value, { ttl, priority });

    return value;
  }

  // Préchargement intelligent
  async preload(keys, options = {}) {
    const { priority = 'normal' } = options;
    const promises = keys.map((key) => this.get(key, { priority }));
    return Promise.all(promises);
  }

  // Nettoyage intelligent du cache
  async cleanup(options = {}) {
    const { maxSize, minPriority } = options;
    const { data, metadata } = this.persistentCache.getState();

    // Tri par priorité et date
    const sortedEntries = Object.entries(metadata)
      .sort((a, b) => {
        if (a[1].priority !== b[1].priority) {
          return a[1].priority.localeCompare(b[1].priority);
        }
        return a[1].timestamp - b[1].timestamp;
      });

    // Suppression des entrées selon les critères
    for (const [key, meta] of sortedEntries) {
      if (minPriority && meta.priority < minPriority) {
        this.persistentCache.getState().clearData(key);
        this.memoryCache.delete(key);
      }
    }

    // Vérification de la taille maximale
    if (maxSize) {
      let currentSize = 0;
      for (const [key, meta] of sortedEntries) {
        currentSize += meta.size;
        if (currentSize > maxSize) {
          this.persistentCache.getState().clearData(key);
          this.memoryCache.delete(key);
        }
      }
    }
  }

  // Récupération des métriques
  getMetrics() {
    return {
      ...this.metrics,
      hitRate: this.metrics.hits / (this.metrics.hits + this.metrics.misses),
    };
  }
}

export const cacheService = new CacheService();
export default cacheService; 