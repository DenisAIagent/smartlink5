class RateLimitService {
  constructor() {
    this.requests = new Map();
    this.defaultLimit = 100; // Requêtes par minute
    this.defaultWindow = 60000; // 1 minute en millisecondes
    this.retryAfter = 1000; // Délai initial de retry en millisecondes
    this.maxRetries = 3;
  }

  // Vérifier si une requête est autorisée
  canMakeRequest(endpoint) {
    const now = Date.now();
    const requestInfo = this.requests.get(endpoint) || {
      count: 0,
      resetTime: now + this.defaultWindow,
      retryCount: 0
    };

    // Réinitialiser le compteur si la fenêtre est expirée
    if (now > requestInfo.resetTime) {
      requestInfo.count = 0;
      requestInfo.resetTime = now + this.defaultWindow;
      requestInfo.retryCount = 0;
    }

    // Vérifier si la limite est atteinte
    if (requestInfo.count >= this.defaultLimit) {
      return {
        allowed: false,
        retryAfter: this.calculateRetryDelay(requestInfo.retryCount),
        resetTime: requestInfo.resetTime
      };
    }

    // Incrémenter le compteur
    requestInfo.count++;
    this.requests.set(endpoint, requestInfo);

    return {
      allowed: true,
      retryAfter: 0,
      resetTime: requestInfo.resetTime
    };
  }

  // Calculer le délai de retry avec backoff exponentiel
  calculateRetryDelay(retryCount) {
    if (retryCount >= this.maxRetries) {
      return this.retryAfter * Math.pow(2, this.maxRetries);
    }
    return this.retryAfter * Math.pow(2, retryCount);
  }

  // Incrémenter le compteur de retry
  incrementRetryCount(endpoint) {
    const requestInfo = this.requests.get(endpoint);
    if (requestInfo) {
      requestInfo.retryCount++;
      this.requests.set(endpoint, requestInfo);
    }
  }

  // Réinitialiser le compteur de retry
  resetRetryCount(endpoint) {
    const requestInfo = this.requests.get(endpoint);
    if (requestInfo) {
      requestInfo.retryCount = 0;
      this.requests.set(endpoint, requestInfo);
    }
  }

  // Obtenir les statistiques de limitation
  getStats(endpoint) {
    const requestInfo = this.requests.get(endpoint);
    if (!requestInfo) return null;

    return {
      remaining: Math.max(0, this.defaultLimit - requestInfo.count),
      resetTime: requestInfo.resetTime,
      retryCount: requestInfo.retryCount
    };
  }

  // Réinitialiser toutes les limites
  reset() {
    this.requests.clear();
  }
}

export const rateLimitService = new RateLimitService(); 