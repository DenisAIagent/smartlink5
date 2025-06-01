import { rateLimitService } from '../../services/rateLimitService';
import { apiService } from '../../services/apiService';

describe('Performance Rate Limit', () => {
  beforeEach(() => {
    rateLimitService.reset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('devrait gérer efficacement un grand nombre de requêtes simultanées', async () => {
    const startTime = performance.now();
    const numRequests = 1000;
    const promises = [];

    // Simuler 1000 requêtes simultanées
    for (let i = 0; i < numRequests; i++) {
      promises.push(apiService.get(`/test/${i}`));
    }

    await Promise.all(promises);
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Vérifier que le temps d'exécution est raisonnable (moins de 5 secondes)
    expect(duration).toBeLessThan(5000);
  });

  it('devrait maintenir des performances constantes sous charge', async () => {
    const iterations = 10;
    const requestsPerIteration = 100;
    const durations = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      const promises = [];

      for (let j = 0; j < requestsPerIteration; j++) {
        promises.push(apiService.get(`/test/${i}/${j}`));
      }

      await Promise.all(promises);
      const endTime = performance.now();
      durations.push(endTime - startTime);

      // Attendre un peu entre les itérations
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Calculer la moyenne et l'écart-type des durées
    const average = durations.reduce((a, b) => a + b) / durations.length;
    const variance = durations.reduce((a, b) => a + Math.pow(b - average, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);

    // Vérifier que l'écart-type est raisonnable (moins de 20% de la moyenne)
    expect(stdDev / average).toBeLessThan(0.2);
  });

  it('devrait gérer efficacement la mémoire', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    const numRequests = 10000;
    const requests = new Map();

    // Simuler 10000 requêtes
    for (let i = 0; i < numRequests; i++) {
      const endpoint = `/test/${i}`;
      rateLimitService.canMakeRequest(endpoint);
      requests.set(endpoint, {
        count: 1,
        resetTime: Date.now() + 60000,
        retryCount: 0
      });
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryUsed = finalMemory - initialMemory;

    // Vérifier que l'utilisation de la mémoire est raisonnable (moins de 10MB)
    expect(memoryUsed).toBeLessThan(10 * 1024 * 1024);
  });

  it('devrait maintenir des performances constantes pendant une longue période', async () => {
    const duration = 60000; // 1 minute
    const interval = 100; // 100ms entre chaque lot de requêtes
    const requestsPerBatch = 10;
    const startTime = Date.now();
    const durations = [];

    while (Date.now() - startTime < duration) {
      const batchStartTime = performance.now();
      const promises = [];

      for (let i = 0; i < requestsPerBatch; i++) {
        promises.push(apiService.get(`/test/${Date.now()}/${i}`));
      }

      await Promise.all(promises);
      const batchEndTime = performance.now();
      durations.push(batchEndTime - batchStartTime);

      // Attendre l'intervalle
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    // Vérifier que les performances restent stables
    const average = durations.reduce((a, b) => a + b) / durations.length;
    const maxDuration = Math.max(...durations);

    // Vérifier que la durée maximale n'est pas trop élevée
    expect(maxDuration).toBeLessThan(average * 2);
  });

  it('devrait gérer efficacement la récupération après une surcharge', async () => {
    // Simuler une surcharge
    for (let i = 0; i < 200; i++) {
      rateLimitService.canMakeRequest('/test');
    }

    // Mesurer le temps de récupération
    const startTime = performance.now();
    let recovered = false;
    let attempts = 0;

    while (!recovered && attempts < 10) {
      const result = rateLimitService.canMakeRequest('/test');
      if (result.allowed) {
        recovered = true;
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const recoveryTime = performance.now() - startTime;

    // Vérifier que la récupération est rapide (moins de 10 secondes)
    expect(recoveryTime).toBeLessThan(10000);
    expect(recovered).toBe(true);
  });
}); 