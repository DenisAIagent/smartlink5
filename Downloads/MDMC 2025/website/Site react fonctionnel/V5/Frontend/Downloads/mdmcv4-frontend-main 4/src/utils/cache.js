import logger from './logger';

class CacheService {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut
  }

  set(key, value, ttl = this.defaultTTL) {
    const item = {
      value,
      expiry: Date.now() + ttl
    };
    this.cache.set(key, item);
    logger.debug(`Cache mis à jour pour la clé: ${key}`);
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      logger.debug(`Cache miss pour la clé: ${key}`);
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      logger.debug(`Cache expiré pour la clé: ${key}`);
      return null;
    }

    logger.debug(`Cache hit pour la clé: ${key}`);
    return item.value;
  }

  delete(key) {
    this.cache.delete(key);
    logger.debug(`Cache supprimé pour la clé: ${key}`);
  }

  clear() {
    this.cache.clear();
    logger.debug('Cache vidé');
  }

  // Méthode utilitaire pour générer une clé de cache
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }
}

export const cacheService = new CacheService();
export default cacheService; 