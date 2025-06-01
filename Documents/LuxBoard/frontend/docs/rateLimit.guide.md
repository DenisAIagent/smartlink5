# Guide d'Utilisation du Système de Limitation de Taux

## Introduction

Ce guide explique comment utiliser efficacement le système de limitation de taux dans votre application. Il couvre les cas d'utilisation courants, les bonnes pratiques et les solutions aux problèmes fréquents.

## Installation

Le système est déjà intégré dans l'application. Aucune installation supplémentaire n'est nécessaire.

## Utilisation de base

### 1. Faire une requête simple

```javascript
import { apiService } from '../services/apiService';

// La limitation de taux est gérée automatiquement
const data = await apiService.get('/endpoint');
```

### 2. Gérer les erreurs de limitation

```javascript
try {
  const data = await apiService.get('/endpoint');
} catch (error) {
  if (error.code === 429) {
    // Attendre le délai recommandé
    await new Promise(resolve => setTimeout(resolve, error.retryAfter));
    // Réessayer
    return apiService.get('/endpoint');
  }
  throw error;
}
```

### 3. Afficher l'état de la limitation

```jsx
import { RateLimitDisplay } from '../components/common/RateLimitDisplay';

function MyComponent() {
  return (
    <div>
      <h1>Mon Composant</h1>
      <RateLimitDisplay />
      {/* Reste du composant */}
    </div>
  );
}
```

## Cas d'utilisation avancés

### 1. Requêtes en lot

```javascript
const batchRequests = async (endpoints) => {
  const results = [];
  for (const endpoint of endpoints) {
    try {
      const result = await apiService.get(endpoint);
      results.push(result);
    } catch (error) {
      if (error.code === 429) {
        await new Promise(resolve => setTimeout(resolve, error.retryAfter));
        results.push(await apiService.get(endpoint));
      } else {
        throw error;
      }
    }
  }
  return results;
};
```

### 2. Pagination avec limitation

```javascript
const fetchAllPages = async (endpoint) => {
  let page = 1;
  let allData = [];
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await apiService.get(`${endpoint}?page=${page}`);
      allData = [...allData, ...response.data];
      hasMore = page < response.pagination.totalPages;
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

### 3. Mise en cache intelligente

```javascript
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = async (endpoint) => {
  const cached = cache.get(endpoint);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const data = await apiService.get(endpoint);
    cache.set(endpoint, {
      data,
      timestamp: Date.now()
    });
    return data;
  } catch (error) {
    if (error.code === 429) {
      // En cas d'erreur de limitation, retourner les données en cache si disponibles
      if (cached) return cached.data;
      await new Promise(resolve => setTimeout(resolve, error.retryAfter));
      return getCachedData(endpoint);
    }
    throw error;
  }
};
```

## Bonnes pratiques

### 1. Optimisation des requêtes

- Regroupez les requêtes similaires
- Utilisez la pagination pour les grandes collections
- Mettez en cache les données fréquemment utilisées

### 2. Gestion des erreurs

- Implémentez toujours un mécanisme de retry
- Utilisez un backoff exponentiel
- Limitez le nombre de tentatives

### 3. Performance

- Surveillez l'utilisation de la mémoire
- Nettoyez régulièrement le cache
- Optimisez la taille des requêtes

## Dépannage

### Problème : Erreurs 429 fréquentes

**Solution :**
1. Vérifiez la fréquence de vos requêtes
2. Implémentez un système de mise en cache
3. Regroupez les requêtes similaires

```javascript
// Exemple de solution
const getDataWithCache = async (endpoint) => {
  const cached = cache.get(endpoint);
  if (cached) return cached;

  try {
    const data = await apiService.get(endpoint);
    cache.set(endpoint, data);
    return data;
  } catch (error) {
    if (error.code === 429) {
      // Retourner les données en cache si disponibles
      return cached || handleRateLimit(error);
    }
    throw error;
  }
};
```

### Problème : Performances lentes

**Solution :**
1. Optimisez la taille des requêtes
2. Utilisez la pagination
3. Mettez en place un système de mise en cache

```javascript
// Exemple de solution
const getPaginatedData = async (endpoint, pageSize = 20) => {
  let page = 1;
  let allData = [];

  while (true) {
    try {
      const response = await apiService.get(
        `${endpoint}?page=${page}&size=${pageSize}`
      );
      allData = [...allData, ...response.data];
      
      if (response.data.length < pageSize) break;
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

### Problème : Mémoire excessive

**Solution :**
1. Limitez la taille du cache
2. Nettoyez régulièrement les données expirées
3. Utilisez la pagination pour les grandes collections

```javascript
// Exemple de solution
const cache = new Map();
const MAX_CACHE_SIZE = 1000;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const cleanCache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
};

const getDataWithLimitedCache = async (endpoint) => {
  cleanCache();
  
  if (cache.size >= MAX_CACHE_SIZE) {
    // Supprimer les entrées les plus anciennes
    const oldestKey = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
    cache.delete(oldestKey);
  }

  const cached = cache.get(endpoint);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const data = await apiService.get(endpoint);
    cache.set(endpoint, {
      data,
      timestamp: Date.now()
    });
    return data;
  } catch (error) {
    if (error.code === 429) {
      return cached?.data || handleRateLimit(error);
    }
    throw error;
  }
};
```

## Exemples complets

### 1. Service de données avec limitation

```javascript
class DataService {
  constructor() {
    this.cache = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000;
  }

  async getData(endpoint) {
    const cached = this.cache.get(endpoint);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const data = await apiService.get(endpoint);
      this.cache.set(endpoint, {
        data,
        timestamp: Date.now()
      });
      return data;
    } catch (error) {
      if (error.code === 429) {
        if (cached) return cached.data;
        await new Promise(resolve => setTimeout(resolve, error.retryAfter));
        return this.getData(endpoint);
      }
      throw error;
    }
  }

  async getAllData(endpoint) {
    let page = 1;
    let allData = [];
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await this.getData(`${endpoint}?page=${page}`);
        allData = [...allData, ...response.data];
        hasMore = page < response.pagination.totalPages;
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
  }
}
```

### 2. Composant React avec limitation

```jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { RateLimitDisplay } from '../components/common/RateLimitDisplay';

function DataList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/data');
        setData(response.data);
        setError(null);
      } catch (error) {
        if (error.code === 429) {
          setError('Limite de requêtes atteinte. Réessai en cours...');
          await new Promise(resolve => setTimeout(resolve, error.retryAfter));
          return fetchData();
        }
        setError('Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <RateLimitDisplay />
      {loading && <div>Chargement...</div>}
      {error && <div className="error">{error}</div>}
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

## Conclusion

Le système de limitation de taux est un outil puissant pour protéger votre API et assurer une utilisation équitable des ressources. En suivant ce guide et en implémentant les bonnes pratiques recommandées, vous pourrez créer des applications robustes et performantes. 