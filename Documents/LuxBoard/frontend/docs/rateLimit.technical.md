# Documentation Technique du Système de Limitation de Taux

## Architecture

### Vue d'ensemble

Le système de limitation de taux est composé de trois parties principales :

1. **Service de Limitation (RateLimitService)**
   - Gestion des quotas de requêtes
   - Calcul des délais de retry
   - Suivi des statistiques en temps réel

2. **Service de Statistiques (RateLimitStatsService)**
   - Stockage des métriques dans Redis
   - Agrégation des données
   - Mise en cache optimisée

3. **Interface d'Administration (RateLimitDashboard)**
   - Visualisation en temps réel
   - Filtrage des données
   - Métriques détaillées

## Composants Techniques

### RateLimitService

```javascript
class RateLimitService {
  constructor() {
    this.limits = new Map();
    this.counters = new Map();
    this.retryCounts = new Map();
  }

  canMakeRequest(endpoint) {
    // Vérification du quota
  }

  calculateRetryDelay(endpoint) {
    // Calcul du délai exponentiel
  }
}
```

#### Configuration

```javascript
{
  defaultLimit: 100,        // Requêtes par minute
  windowMs: 60000,         // Fenêtre de temps (ms)
  initialRetryDelay: 1000, // Délai initial (ms)
  maxRetries: 3,           // Nombre max de retries
  backoffFactor: 2         // Facteur d'augmentation
}
```

### RateLimitStatsService

#### Structure Redis

```
rate_limit:requests -> Sorted Set
  - Score: timestamp
  - Member: { endpoint, count, timestamp }

rate_limit:errors -> Sorted Set
  - Score: timestamp
  - Member: { endpoint, type, count, timestamp }

rate_limit:retries -> Sorted Set
  - Score: timestamp
  - Member: { endpoint, count, timestamp }

rate_limit:endpoints -> Set
  - Members: liste des endpoints

rate_limit:cache -> String
  - Key: stats:{timeRange}:{endpoint}
  - Value: JSON des statistiques
  - TTL: 60 secondes
```

#### Optimisations

1. **Pipeline Redis**
   ```javascript
   const pipeline = redis.pipeline();
   pipeline
     .zadd(key, timestamp, data)
     .sadd(endpointsKey, endpoint)
     .exec();
   ```

2. **Mise en Cache**
   ```javascript
   const cacheKey = `stats:${timeRange}:${endpoint}`;
   const cached = await redis.get(cacheKey);
   if (cached) return JSON.parse(cached);
   ```

3. **Transactions**
   ```javascript
   await redis.multi()
     .zadd(key, timestamp, data)
     .zremrangebyscore(key, 0, oldTimestamp)
     .exec();
   ```

### RateLimitDashboard

#### Composants React

```jsx
// Composant de métrique mémorisé
const MetricCard = React.memo(({ title, value, subValue, color }) => (
  <div className="metric-card">
    <h3>{title}</h3>
    <p className={`value ${color}`}>{value}</p>
    {subValue && <p className="sub-value">{subValue}</p>}
  </div>
));

// Composant de graphique optimisé
const StatsChart = React.memo(({ data, options }) => (
  <Line data={data} options={options} />
));
```

#### Optimisations Frontend

1. **Mémorisation**
   ```javascript
   const chartData = useMemo(() => ({
     labels: stats.requests.map(r => formatTime(r.timestamp)),
     datasets: [
       {
         label: 'Requêtes',
         data: stats.requests.map(r => r.count),
         borderColor: 'rgb(75, 192, 192)'
       }
     ]
   }), [stats]);
   ```

2. **Chargement Parallèle**
   ```javascript
   const [stats, endpoints] = await Promise.all([
     apiService.get('/stats'),
     apiService.get('/endpoints')
   ]);
   ```

## API Endpoints

### GET /admin/rate-limit/stats

Récupère les statistiques de limitation de taux.

**Paramètres de requête :**
- `timeRange` (string): Période de temps ('1h', '6h', '24h', '7d')
- `endpoint` (string): Endpoint spécifique ou 'all'

**Réponse :**
```json
{
  "requests": [
    {
      "endpoint": "/api/test",
      "count": 100,
      "timestamp": 1234567890
    }
  ],
  "errors": [
    {
      "type": "RATE_LIMIT",
      "count": 10,
      "timestamp": 1234567890
    }
  ],
  "retries": [
    {
      "endpoint": "/api/test",
      "count": 5,
      "timestamp": 1234567890
    }
  ]
}
```

### GET /admin/rate-limit/endpoints

Récupère la liste des endpoints suivis.

**Réponse :**
```json
[
  "/api/test",
  "/api/users"
]
```

### POST /admin/rate-limit/cleanup

Nettoie les anciennes données.

**Réponse :**
```json
{
  "message": "Nettoyage effectué avec succès"
}
```

## Métriques et Monitoring

### Métriques Clés

1. **Requêtes**
   - Total des requêtes
   - Requêtes par endpoint
   - Taux de succès

2. **Erreurs**
   - Nombre d'erreurs
   - Types d'erreurs
   - Taux d'erreur

3. **Retries**
   - Nombre de retries
   - Délais moyens
   - Taux de retry

### Alertes

1. **Seuils d'Alerte**
   - Taux d'erreur > 10%
   - Nombre de retries > 50%
   - Latence > 500ms

2. **Actions Automatiques**
   - Augmentation des limites
   - Nettoyage du cache
   - Notification admin

## Performance

### Benchmarks

1. **Latence**
   - Requête simple: < 50ms
   - Requête avec cache: < 10ms
   - Agrégation: < 100ms

2. **Throughput**
   - Requêtes/s: > 1000
   - Endpoints: > 100
   - Données: > 1M points

3. **Mémoire**
   - Cache Redis: < 100MB
   - Frontend: < 50MB
   - Backend: < 200MB

### Optimisations

1. **Redis**
   - Pipeline pour les opérations multiples
   - Transactions pour la cohérence
   - Cache avec TTL

2. **Frontend**
   - Mémorisation des composants
   - Chargement parallèle
   - Pagination des données

3. **Backend**
   - Agrégation optimisée
   - Nettoyage automatique
   - Gestion de la mémoire

## Sécurité

### Authentification

```javascript
const validateAdmin = async (req, res, next) => {
  try {
    await validateToken(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Accès non autorisé'
        });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur de validation'
    });
  }
};
```

### Protection des Données

1. **Validation**
   - Vérification des paramètres
   - Sanitization des entrées
   - Limites de taille

2. **Accès**
   - Rôles utilisateur
   - Tokens JWT
   - Rate limiting

## Maintenance

### Nettoyage

```javascript
async cleanup() {
  const now = Date.now();
  const pipeline = this.redis.pipeline();

  pipeline
    .zremrangebyscore(this.requestsKey, 0, now - 7 * 24 * 60 * 60 * 1000)
    .zremrangebyscore(this.errorsKey, 0, now - 7 * 24 * 60 * 60 * 1000)
    .zremrangebyscore(this.retriesKey, 0, now - 7 * 24 * 60 * 60 * 1000)
    .del(`${this.cacheKey}:*`);

  await pipeline.exec();
}
```

### Monitoring

1. **Logs**
   - Requêtes
   - Erreurs
   - Performance

2. **Métriques**
   - Utilisation Redis
   - Latence API
   - Taux d'erreur

3. **Alertes**
   - Seuils dépassés
   - Erreurs critiques
   - Performance dégradée 