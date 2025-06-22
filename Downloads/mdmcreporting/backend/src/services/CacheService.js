class CacheService {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  async get(key) {
    return this.cache.get(key) || null;
  }

  async set(key, value, ttlSeconds = 300) {
    this.cache.set(key, value);
    
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttlSeconds * 1000);
    
    this.timers.set(key, timer);
  }

  async del(key) {
    this.cache.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  async clear() {
    this.cache.clear();
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  getStats() {
    return {
      keys: this.cache.size,
      timers: this.timers.size
    };
  }
}

module.exports = CacheService; 