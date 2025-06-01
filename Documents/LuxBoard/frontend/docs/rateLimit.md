# Documentation du Système de Limitation de Taux

## Vue d'ensemble

Le système de limitation de taux est conçu pour protéger l'API contre les abus et assurer une utilisation équitable des ressources. Il implémente une limitation basée sur le temps avec un backoff exponentiel pour les retries.

## Architecture

### Services

#### RateLimitService

Le service principal qui gère la limitation de taux.

```javascript
import { rateLimitService } from '../services/rateLimitService';

// Vérifier si une requête est autorisée
const result = rateLimitService.canMakeRequest('/endpoint');
if (result.allowed) {
  // Procéder avec la requête
} else {
  // Gérer le délai d'attente
  const waitTime = result.retryAfter;
}
```

#### ApiService

Service qui intègre la limitation de taux dans les requêtes HTTP.

```javascript
import { apiService } from '../services/apiService';

// Les requêtes sont automatiquement limitées
const response = await apiService.get('/endpoint');
```

### Composants

#### RateLimitDisplay

Composant React qui affiche l'état de la limitation de taux.

```jsx
import { RateLimitDisplay } from '../components/common/RateLimitDisplay';

// Dans votre composant
<RateLimitDisplay />
```

## Configuration

### Limites par défaut

- Requêtes par minute : 100
- Fenêtre de temps : 60 secondes
- Délai initial de retry : 1000ms
- Nombre maximum de retries : 3

### Personnalisation

```javascript
// Configuration personnalisée
rateLimitService.configure({
  limit: 200,
  windowMs: 30000,
  initialRetryDelay: 500,
  maxRetries: 5
});
```

## Gestion des erreurs

### Types d'erreurs

1. **RateLimitExceeded**
   - Code : 429
   - Message : "Limite de requêtes dépassée"
   - Solution : Attendre le délai de retry

2. **MaxRetriesExceeded**
   - Code : 429
   - Message : "Nombre maximum de tentatives atteint"
   - Solution : Réinitialiser le compteur de retries

### Gestion des retries

```javascript
try {
  await apiService.get('/endpoint');
} catch (error) {
  if (error.code === 429) {
    const retryAfter = error.retryAfter;
    // Attendre et réessayer
    await new Promise(resolve => setTimeout(resolve, retryAfter));
    return apiService.get('/endpoint');
  }
  throw error;
}
```

## Tests

### Tests unitaires

```javascript
// Exemple de test unitaire
it('devrait limiter les requêtes', () => {
  const result = rateLimitService.canMakeRequest('/test');
  expect(result.allowed).toBe(true);
});
```

### Tests d'intégration

```javascript
// Exemple de test d'intégration
it('devrait gérer le flux complet', async () => {
  const response = await apiService.get('/test');
  expect(response.status).toBe(200);
});
```

### Tests de performance

```javascript
// Exemple de test de performance
it('devrait gérer la charge', async () => {
  const startTime = performance.now();
  await Promise.all(Array(1000).fill().map(() => apiService.get('/test')));
  const duration = performance.now() - startTime;
  expect(duration).toBeLessThan(5000);
});
```

## Bonnes pratiques

1. **Gestion des erreurs**
   - Toujours gérer les erreurs 429
   - Implémenter un backoff exponentiel
   - Limiter le nombre de retries

2. **Optimisation**
   - Mettre en cache les réponses
   - Regrouper les requêtes
   - Utiliser la pagination

3. **Monitoring**
   - Surveiller les limites
   - Tracer les erreurs
   - Analyser les performances

## Exemples d'utilisation

### Requête simple

```javascript
const getData = async () => {
  try {
    const response = await apiService.get('/data');
    return response.data;
  } catch (error) {
    if (error.code === 429) {
      // Gérer la limitation
      await handleRateLimit(error);
      return getData();
    }
    throw error;
  }
};
```

### Requête avec retry

```javascript
const getDataWithRetry = async (retries = 3) => {
  try {
    return await apiService.get('/data');
  } catch (error) {
    if (error.code === 429 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, error.retryAfter));
      return getDataWithRetry(retries - 1);
    }
    throw error;
  }
};
```

### Gestion de la pagination

```javascript
const getAllData = async () => {
  let page = 1;
  let allData = [];
  
  while (true) {
    try {
      const response = await apiService.get(`/data?page=${page}`);
      allData = [...allData, ...response.data];
      
      if (page >= response.pagination.totalPages) break;
      page++;
    } catch (error) {
      if (error.code === 429) {
        await new Promise(resolve => setTimeout(resolve, error.retryAfter));
        continue;
      }
      throw error;
    }
  }
  
  return allData;
};
```

## Dépannage

### Problèmes courants

1. **Erreurs 429 fréquentes**
   - Vérifier les limites configurées
   - Optimiser les requêtes
   - Mettre en place du caching

2. **Performances lentes**
   - Vérifier le nombre de requêtes
   - Optimiser les retries
   - Utiliser la pagination

3. **Mémoire excessive**
   - Nettoyer les requêtes expirées
   - Limiter la taille du cache
   - Gérer les timeouts

### Solutions

1. **Optimisation des requêtes**
   ```javascript
   // Regrouper les requêtes
   const batchRequests = async (endpoints) => {
     return Promise.all(endpoints.map(endpoint => apiService.get(endpoint)));
   };
   ```

2. **Gestion du cache**
   ```javascript
   // Mettre en cache les réponses
   const cache = new Map();
   const getCachedData = async (endpoint) => {
     if (cache.has(endpoint)) return cache.get(endpoint);
     const response = await apiService.get(endpoint);
     cache.set(endpoint, response);
     return response;
   };
   ```

3. **Monitoring**
   ```javascript
   // Tracer les erreurs
   const logRateLimitError = (error) => {
     console.error('Rate limit error:', {
       endpoint: error.endpoint,
       retryAfter: error.retryAfter,
       timestamp: new Date().toISOString()
     });
   };
   ``` 