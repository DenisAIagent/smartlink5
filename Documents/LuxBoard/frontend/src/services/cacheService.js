import { providerService } from './providerService';

class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes par défaut
    this.maxSize = 1000; // Nombre maximum d'éléments en cache
  }

  // Générer une clé de cache unique
  generateKey(key, params = {}) {
    return `${key}:${JSON.stringify(params)}`;
  }

  // Vérifier si une donnée est en cache et valide
  async get(key, params = {}) {
    const cacheKey = this.generateKey(key, params);
    const cachedData = this.cache.get(cacheKey);

    if (cachedData) {
      if (Date.now() - cachedData.timestamp < this.ttl) {
        return cachedData.data;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    return null;
  }

  // Mettre en cache une donnée
  set(key, data, params = {}) {
    const cacheKey = this.generateKey(key, params);

    // Gérer la taille maximale du cache
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  // Invalider une donnée en cache
  invalidate(key, params = {}) {
    const cacheKey = this.generateKey(key, params);
    this.cache.delete(cacheKey);
  }

  // Vider tout le cache
  clear() {
    this.cache.clear();
  }

  // Gérer le cache des prestataires
  async getProviders(filters = {}) {
    const cacheKey = 'providers';
    const cachedData = await this.get(cacheKey, filters);

    if (cachedData) {
      return cachedData;
    }

    const providers = await providerService.getProviders(filters);
    this.set(cacheKey, providers, filters);
    return providers;
  }

  // Gérer le cache des détails d'un prestataire
  async getProviderDetails(providerId) {
    const cacheKey = `provider:${providerId}`;
    const cachedData = await this.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const provider = await providerService.getProviderById(providerId);
    this.set(cacheKey, provider);
    return provider;
  }

  // Gérer le cache des catégories
  async getCategories() {
    const cacheKey = 'categories';
    const cachedData = await this.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const categories = await providerService.getCategories();
    this.set(cacheKey, categories);
    return categories;
  }

  // Gérer le cache des statistiques
  async getStats() {
    const cacheKey = 'stats';
    const cachedData = await this.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const stats = await providerService.getProviderStats();
    this.set(cacheKey, stats);
    return stats;
  }

  // Mettre à jour le cache après une modification
  async updateCache(action, data) {
    switch (action) {
      case 'provider_updated':
        this.invalidate(`provider:${data.id}`);
        this.invalidate('providers');
        break;
      case 'provider_deleted':
        this.invalidate(`provider:${data.id}`);
        this.invalidate('providers');
        break;
      case 'category_updated':
        this.invalidate('categories');
        this.invalidate('providers');
        break;
      case 'stats_updated':
        this.invalidate('stats');
        break;
      default:
        this.clear();
    }
  }
}

export const cacheService = new CacheService(); 