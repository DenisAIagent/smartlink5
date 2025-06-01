import { rateLimitService } from '../../services/rateLimitService';

describe('RateLimitService', () => {
  beforeEach(() => {
    rateLimitService.reset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('canMakeRequest', () => {
    it('devrait autoriser une requête dans la limite', () => {
      const result = rateLimitService.canMakeRequest('/test');
      expect(result.allowed).toBe(true);
      expect(result.retryAfter).toBe(0);
    });

    it('devrait refuser une requête au-delà de la limite', () => {
      // Simuler 101 requêtes
      for (let i = 0; i < 101; i++) {
        rateLimitService.canMakeRequest('/test');
      }

      const result = rateLimitService.canMakeRequest('/test');
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('devrait réinitialiser le compteur après la fenêtre de temps', () => {
      // Simuler 50 requêtes
      for (let i = 0; i < 50; i++) {
        rateLimitService.canMakeRequest('/test');
      }

      // Avancer le temps d'une minute
      jest.advanceTimersByTime(60000);

      const result = rateLimitService.canMakeRequest('/test');
      expect(result.allowed).toBe(true);
      expect(result.retryAfter).toBe(0);
    });
  });

  describe('calculateRetryDelay', () => {
    it('devrait calculer le délai de retry avec backoff exponentiel', () => {
      const delay1 = rateLimitService.calculateRetryDelay(0);
      const delay2 = rateLimitService.calculateRetryDelay(1);
      const delay3 = rateLimitService.calculateRetryDelay(2);

      expect(delay2).toBeGreaterThan(delay1);
      expect(delay3).toBeGreaterThan(delay2);
    });

    it('devrait limiter le délai maximum', () => {
      const maxDelay = rateLimitService.calculateRetryDelay(rateLimitService.maxRetries);
      const overMaxDelay = rateLimitService.calculateRetryDelay(rateLimitService.maxRetries + 1);

      expect(overMaxDelay).toBe(maxDelay);
    });
  });

  describe('getStats', () => {
    it('devrait retourner les statistiques correctes', () => {
      // Simuler quelques requêtes
      rateLimitService.canMakeRequest('/test');
      rateLimitService.canMakeRequest('/test');

      const stats = rateLimitService.getStats('/test');
      expect(stats).toEqual({
        remaining: 98,
        resetTime: expect.any(Number),
        retryCount: 0
      });
    });

    it('devrait retourner null pour un endpoint inconnu', () => {
      const stats = rateLimitService.getStats('/unknown');
      expect(stats).toBeNull();
    });
  });

  describe('retryCount', () => {
    it('devrait incrémenter et réinitialiser le compteur de retry', () => {
      const endpoint = '/test';
      
      rateLimitService.incrementRetryCount(endpoint);
      rateLimitService.incrementRetryCount(endpoint);
      
      const stats = rateLimitService.getStats(endpoint);
      expect(stats.retryCount).toBe(2);

      rateLimitService.resetRetryCount(endpoint);
      const updatedStats = rateLimitService.getStats(endpoint);
      expect(updatedStats.retryCount).toBe(0);
    });
  });
}); 