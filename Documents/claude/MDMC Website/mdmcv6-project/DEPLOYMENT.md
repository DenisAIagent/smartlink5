# 🚀 Guide de Déploiement Production - MDMC SmartLinks

## Vue d'ensemble

Ce guide décrit le déploiement en production de MDMC SmartLinks, une plateforme professionnelle de liens intelligents avec analytics avancées et A/B testing.

## 🏗️ Architecture Production

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │───▶│  React Frontend │───▶│  Node.js API    │
│  Load Balancer  │    │   (Port 3000)   │    │  (Port 5001)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐    ┌─────────────────┐
         └─────────────▶│   Static CDN    │    │   MongoDB       │
                        │   (Assets)      │    │  (Port 27017)   │
                        └─────────────────┘    └─────────────────┘
                                 │                       │
                        ┌─────────────────┐    ┌─────────────────┐
                        │   Redis Cache   │    │   Analytics     │
                        │  (Port 6379)    │    │  (Prometheus)   │
                        └─────────────────┘    └─────────────────┘
```

## 📋 Prérequis

### Serveur
- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **RAM**: 4GB minimum, 8GB recommandé
- **CPU**: 2 cores minimum, 4 cores recommandé
- **Stockage**: 50GB minimum, SSD recommandé
- **Réseau**: IP publique, ports 80/443 ouverts

### Logiciels
- Docker 24.0+
- Docker Compose 2.0+
- Git
- Nginx (optionnel si utilisation du proxy intégré)

### Domaines
- Domaine principal: `smartlinks.mdmc.com`
- API: `api.mdmc.com`
- Admin: `admin.mdmc.com`
- CDN: `cdn.mdmc.com`

## 🔧 Configuration Production

### 1. Variables d'environnement

Créer et configurer les fichiers `.env.production`:

#### Frontend (`frontend/.env.production`)
```bash
# API & Services
VITE_API_URL=https://api.mdmc.com
VITE_SITE_URL=https://smartlinks.mdmc.com

# Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GTM_ID=GTM-XXXXXXX

# Features
VITE_ENABLE_AB_TESTING=true
VITE_ENABLE_GEOLOCATION=true
VITE_BYPASS_AUTH=false
```

#### Backend (`backend/.env.production`)
```bash
# Application
NODE_ENV=production
PORT=5001

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mdmc_prod
DB_NAME=mdmc_production

# Security
JWT_SECRET=your-256-bit-secret
BCRYPT_SALT_ROUNDS=12

# CORS
CORS_ORIGIN=https://smartlinks.mdmc.com,https://admin.mdmc.com
```

### 2. Configuration SSL/HTTPS

```bash
# Installation Certbot pour Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Obtenir les certificats SSL
sudo certbot --nginx -d smartlinks.mdmc.com -d api.mdmc.com -d admin.mdmc.com

# Auto-renouvellement
sudo crontab -e
# Ajouter: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Configuration Nginx

Créer `/etc/nginx/sites-available/mdmc-smartlinks`:

```nginx
# Configuration Nginx Production
server {
    listen 80;
    server_name smartlinks.mdmc.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name smartlinks.mdmc.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/smartlinks.mdmc.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/smartlinks.mdmc.com/privkey.pem;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🚀 Déploiement

### Méthode 1: Docker Compose (Recommandée)

```bash
# 1. Cloner le repository
git clone https://github.com/votre-org/mdmc-smartlinks.git
cd mdmc-smartlinks

# 2. Configurer les variables d'environnement
cp frontend/.env.example frontend/.env.production
cp backend/.env.example backend/.env.production
# Éditer les fichiers avec vos valeurs

# 3. Build et démarrage
docker-compose -f docker-compose.production.yml up -d

# 4. Vérifier le statut
docker-compose -f docker-compose.production.yml ps
```

### Méthode 2: Déploiement Manuel

```bash
# Backend
cd backend
npm ci --only=production
pm2 start ecosystem.config.js --env production

# Frontend
cd frontend
npm ci
npm run build
# Copier dist/ vers /var/www/html/
```

### Méthode 3: CI/CD avec GitHub Actions

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /opt/mdmc-smartlinks
            git pull origin main
            docker-compose -f docker-compose.production.yml up -d --build
```

## 📊 Monitoring & Analytics

### 1. Monitoring des performances
- **Prometheus**: Métriques système et application
- **Grafana**: Dashboards visuels
- **Uptime monitoring**: Surveillance 24/7

### 2. Analytics intégrées
- **Google Analytics 4**: Tracking des utilisateurs
- **A/B Testing**: Optimisation automatique des conversions
- **Custom metrics**: KPIs spécifiques aux SmartLinks

### 3. Logs et debugging
```bash
# Logs Docker
docker-compose -f docker-compose.production.yml logs -f

# Logs Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs application
docker logs mdmc-backend-prod -f
```

## 🔒 Sécurité

### 1. Authentification
- JWT tokens avec expiration
- Rate limiting sur l'API
- CORS configuré strictement

### 2. Protection des données
- Chiffrement des données sensibles
- HTTPS obligatoire
- Headers de sécurité

### 3. Backup
```bash
# Script de sauvegarde MongoDB
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="/backups/mongo_$DATE"
aws s3 cp "/backups/mongo_$DATE" s3://mdmc-backups/mongodb/ --recursive
```

## 🔄 Maintenance

### 1. Mises à jour
```bash
# Mise à jour avec zéro downtime
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d --no-deps frontend
docker-compose -f docker-compose.production.yml up -d --no-deps backend
```

### 2. Scaling horizontal
```bash
# Ajouter des instances backend
docker-compose -f docker-compose.production.yml up -d --scale backend=3
```

### 3. Monitoring santé
```bash
# Healthchecks automatiques
curl -f https://api.mdmc.com/health || alert-admin
```

## 📈 Performance

### Optimisations appliquées:
- ✅ **CDN** pour les assets statiques
- ✅ **Gzip/Brotli** compression
- ✅ **Browser caching** optimisé
- ✅ **Database indexing** sur les requêtes fréquentes
- ✅ **Redis caching** pour les API calls
- ✅ **Image optimization** automatique
- ✅ **Code splitting** React
- ✅ **Tree shaking** pour réduire la taille

### Benchmarks attendus:
- **Page load**: < 2 secondes
- **API response**: < 500ms
- **Uptime**: 99.9%
- **Conversion rate**: +15% vs baseline

## 🎯 KPIs Production

### Métriques techniques:
- Disponibilité: 99.9%
- Temps de réponse API: < 500ms
- Taux d'erreur: < 0.1%

### Métriques business:
- SmartLinks créés/jour
- Clics sur plateformes/jour
- Taux de conversion par territoire
- Performance A/B testing

## 🔗 Liens utiles

- **Monitoring**: https://monitoring.mdmc.com
- **Documentation API**: https://api.mdmc.com/docs
- **Status page**: https://status.mdmc.com
- **Support**: support@mdmc.com

---

**Version**: 1.0.0 Production Ready  
**Dernière mise à jour**: $(date)  
**Maintenance**: Équipe DevOps MDMC