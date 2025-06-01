# Guide de Déploiement du Système de Limitation de Taux

## Prérequis

### Système
- Node.js >= 14.x
- Redis >= 6.x
- NPM >= 7.x

### Dépendances
```json
{
  "dependencies": {
    "ioredis": "^5.x",
    "react": "^18.x",
    "react-chartjs-2": "^4.x",
    "chart.js": "^3.x"
  }
}
```

## Installation

### 1. Configuration Redis

```bash
# Installation Redis
sudo apt-get install redis-server

# Configuration
sudo nano /etc/redis/redis.conf

# Paramètres recommandés
maxmemory 1gb
maxmemory-policy allkeys-lru
appendonly yes
```

### 2. Variables d'Environnement

```env
# .env
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### 3. Installation des Dépendances

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## Déploiement

### 1. Backend

```bash
# Build
npm run build

# Démarrage
npm start

# Avec PM2
pm2 start dist/server.js --name rate-limit-service
```

### 2. Frontend

```bash
# Build
npm run build

# Déploiement statique
npm run deploy
```

## Configuration

### 1. RateLimitService

```javascript
// config/rateLimit.js
module.exports = {
  defaultLimit: 100,
  windowMs: 60000,
  initialRetryDelay: 1000,
  maxRetries: 3,
  backoffFactor: 2
};
```

### 2. Redis

```javascript
// config/redis.js
module.exports = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  db: 0,
  keyPrefix: 'rate_limit:'
};
```

## Monitoring

### 1. Métriques Redis

```bash
# Installation Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.x.x/prometheus-2.x.x.linux-amd64.tar.gz

# Configuration
cat > prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:6379']
EOF
```

### 2. Logs

```bash
# Configuration des logs
cat > /etc/logrotate.d/rate-limit << EOF
/var/log/rate-limit/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data www-data
}
EOF
```

## Sécurité

### 1. Firewall

```bash
# Configuration UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 6379/tcp
```

### 2. SSL/TLS

```bash
# Installation Certbot
sudo apt-get install certbot

# Obtention certificat
sudo certbot certonly --standalone -d your-domain.com
```

## Maintenance

### 1. Nettoyage

```bash
# Script de nettoyage
cat > scripts/cleanup.sh << EOF
#!/bin/bash
redis-cli KEYS "rate_limit:*" | xargs redis-cli DEL
EOF

# Exécution quotidienne
0 0 * * * /path/to/scripts/cleanup.sh
```

### 2. Backup

```bash
# Script de backup
cat > scripts/backup.sh << EOF
#!/bin/bash
redis-cli SAVE
cp /var/lib/redis/dump.rdb /backup/redis-\$(date +%Y%m%d).rdb
EOF

# Exécution hebdomadaire
0 0 * * 0 /path/to/scripts/backup.sh
```

## Dépannage

### 1. Vérification des Services

```bash
# Redis
systemctl status redis

# Backend
pm2 status

# Frontend
curl -I http://localhost:3000
```

### 2. Logs

```bash
# Redis
tail -f /var/log/redis/redis-server.log

# Backend
pm2 logs rate-limit-service

# Frontend
tail -f /var/log/nginx/access.log
```

### 3. Métriques

```bash
# Redis
redis-cli info

# Backend
curl http://localhost:3000/metrics

# Frontend
curl http://localhost:3000/health
```

## Mise à l'Échelle

### 1. Redis Cluster

```bash
# Configuration
redis-cli --cluster create \
  127.0.0.1:7000 \
  127.0.0.1:7001 \
  127.0.0.1:7002 \
  127.0.0.1:7003 \
  127.0.0.1:7004 \
  127.0.0.1:7005 \
  --cluster-replicas 1
```

### 2. Load Balancer

```nginx
# Configuration Nginx
upstream backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://backend;
    }
}
```

## Récupération

### 1. Restauration Redis

```bash
# Restauration depuis backup
redis-cli FLUSHALL
cp /backup/redis-20240101.rdb /var/lib/redis/dump.rdb
systemctl restart redis
```

### 2. Rollback

```bash
# Backend
pm2 stop rate-limit-service
git checkout v1.0.0
npm install
pm2 start dist/server.js

# Frontend
cd frontend
git checkout v1.0.0
npm install
npm run build
```

## Bonnes Pratiques

### 1. Sécurité

- Utiliser des secrets forts
- Activer HTTPS
- Configurer le pare-feu
- Mettre à jour régulièrement

### 2. Performance

- Monitorer les métriques
- Optimiser le cache
- Nettoyer régulièrement
- Faire des backups

### 3. Maintenance

- Mettre à jour les dépendances
- Vérifier les logs
- Tester les backups
- Documenter les changements 