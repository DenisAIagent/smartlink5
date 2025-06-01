# Guide d'Intégration - Plateforme de Limitation de Taux

## Installation

### 1. Installation du Package
```bash
# NPM
npm install @luxboard/rate-limit

# Yarn
yarn add @luxboard/rate-limit
```

### 2. Configuration Initiale
```javascript
import { RateLimitClient } from '@luxboard/rate-limit';

const client = new RateLimitClient({
  apiKey: 'votre-clé-api',
  baseUrl: 'https://api.rate-limit.example.com',
  options: {
    timeout: 5000,
    retries: 3
  }
});
```

## Intégration de Base

### 1. Middleware Express
```javascript
import { rateLimitMiddleware } from '@luxboard/rate-limit/express';

app.use(rateLimitMiddleware({
  client,
  options: {
    defaultLimit: 100,
    windowMs: 60000
  }
}));
```

### 2. Hook React
```javascript
import { useRateLimit } from '@luxboard/rate-limit/react';

function MyComponent() {
  const { metrics, loading, error } = useRateLimit({
    endpoint: '/api/users',
    timeRange: '1h'
  });

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      <h2>Métriques</h2>
      <pre>{JSON.stringify(metrics, null, 2)}</pre>
    </div>
  );
}
```

## API Client

### 1. Configuration des Endpoints
```javascript
// Configuration d'un endpoint
await client.configureEndpoint({
  path: '/api/users',
  method: 'GET',
  limit: 100,
  window: '1m',
  retryDelay: 1000
});

// Configuration multiple
await client.configureEndpoints([
  {
    path: '/api/users',
    limit: 100
  },
  {
    path: '/api/products',
    limit: 200
  }
]);
```

### 2. Récupération des Métriques
```javascript
// Métriques globales
const metrics = await client.getMetrics({
  timeRange: '1h'
});

// Métriques par endpoint
const endpointMetrics = await client.getEndpointMetrics({
  path: '/api/users',
  timeRange: '1h'
});

// Métriques détaillées
const detailedMetrics = await client.getDetailedMetrics({
  path: '/api/users',
  timeRange: '1h',
  includeErrors: true,
  includeRetries: true
});
```

## Gestion des Erreurs

### 1. Intercepteurs
```javascript
client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 429) {
      // Gestion des erreurs de limite
      const retryAfter = error.response.headers['retry-after'];
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(client.request(error.config));
        }, retryAfter * 1000);
      });
    }
    return Promise.reject(error);
  }
);
```

### 2. Gestion des Retries
```javascript
const retryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: error => {
    return error.response?.status === 429;
  }
};

await client.request({
  url: '/api/users',
  ...retryConfig
});
```

## Intégration Avancée

### 1. Cache Personnalisé
```javascript
import { RedisCache } from '@luxboard/rate-limit/cache';

const cache = new RedisCache({
  host: 'localhost',
  port: 6379
});

client.setCache(cache);
```

### 2. Métriques Personnalisées
```javascript
client.on('request', (data) => {
  // Logging personnalisé
  console.log(`Requête vers ${data.path}`);
});

client.on('error', (error) => {
  // Gestion d'erreur personnalisée
  console.error(`Erreur: ${error.message}`);
});
```

## Tests

### 1. Tests Unitaires
```javascript
import { RateLimitClient } from '@luxboard/rate-limit';
import { mockClient } from '@luxboard/rate-limit/testing';

describe('RateLimitClient', () => {
  let client;

  beforeEach(() => {
    client = mockClient();
  });

  test('should configure endpoint', async () => {
    await client.configureEndpoint({
      path: '/api/test',
      limit: 100
    });
    expect(client.getConfig('/api/test')).toBeDefined();
  });
});
```

### 2. Tests d'Intégration
```javascript
import { createTestClient } from '@luxboard/rate-limit/testing';

describe('Integration', () => {
  let client;

  beforeAll(async () => {
    client = await createTestClient();
  });

  test('should handle rate limiting', async () => {
    const requests = Array(150).fill().map(() => 
      client.request({ url: '/api/test' })
    );
    const results = await Promise.allSettled(requests);
    expect(results.filter(r => r.status === 'rejected')).toHaveLength(50);
  });
});
```

## Déploiement

### 1. Configuration de Production
```javascript
const productionConfig = {
  apiKey: process.env.RATE_LIMIT_API_KEY,
  baseUrl: process.env.RATE_LIMIT_API_URL,
  options: {
    timeout: 10000,
    retries: 5,
    cache: {
      type: 'redis',
      url: process.env.REDIS_URL
    }
  }
};

const client = new RateLimitClient(productionConfig);
```

### 2. Variables d'Environnement
```env
RATE_LIMIT_API_KEY=votre-clé-api
RATE_LIMIT_API_URL=https://api.rate-limit.example.com
REDIS_URL=redis://localhost:6379
```

## Bonnes Pratiques

### 1. Performance
- Utilisez le cache
- Implémentez les retries
- Optimisez les requêtes

### 2. Sécurité
- Sécurisez les clés API
- Validez les entrées
- Gérez les erreurs

### 3. Maintenance
- Mettez à jour régulièrement
- Surveillez les métriques
- Testez les changements 