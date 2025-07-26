# MDMC SmartLinks - Next.js Architecture

## 🚀 **Architecture Double-Tracking Haute Performance**

Cette nouvelle implémentation utilise Next.js avec un système de tracking **double-moteur** qui garantit l'intégrité des données à 100% tout en optimisant les conversions publicitaires.

### 🏗️ **Architecture Technique**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Visit    │───▶│   Next.js SSR    │───▶│   MongoDB       │
│                 │    │                  │    │                 │
│ /artist/track   │    │ getServerSideProps │    │ Visit Logged    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Platform Click  │───▶│ Client Tracking  │───▶│ GTM/GA4/Meta    │
│                 │    │                  │    │                 │
│ handleClick()   │    │ dataLayer.push() │    │ Instant Event   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ API Call        │───▶│ Server Tracking  │───▶│ MongoDB         │
│                 │    │                  │    │                 │
│ /api/track/click│    │ logClick()       │    │ Click Logged    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌──────────────────┐
│ User Redirect   │◀───│ Secure Response  │
│                 │    │                  │
│ window.assign() │    │ destinationUrl   │
└─────────────────┘    └──────────────────┘
```

### 🔥 **Avantages Clés**

- **🎯 Tracking Fiable à 100%** : Double système serveur + client
- **⚡ Performance Optimale** : SSR pour chargement instantané
- **🔒 Sécurité Renforcée** : Validation côté serveur + CSP
- **📱 SEO Parfait** : Métadonnées pré-rendues
- **🌍 Géolocalisation** : Targeting automatique par pays
- **📊 Analytics Avancés** : GTM/GA4/Meta Pixel intégrés

## 🛠️ **Installation & Configuration**

### Prérequis
```bash
Node.js >= 18.0.0
MongoDB >= 4.4
npm >= 9.0.0
```

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration environnement
```bash
cp .env.example .env
```

Configurez vos variables dans `.env`:
```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/mdmc-smartlinks

# Tracking Analytics (Global)
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=1234567890

# URLs de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Initialisation de la base de données
```bash
node scripts/seed-data.js
```

### 4. Démarrage du serveur de développement
```bash
npm run dev
```

🌐 **Application disponible sur:** http://localhost:3000

## 📊 **Tests & Validation**

### Tests automatisés du système de tracking
```bash
# Tests complets
node scripts/test-tracking.js

# Tests spécifiques
node scripts/test-tracking.js api         # API de tracking
node scripts/test-tracking.js performance # Performance
node scripts/test-tracking.js validation  # Validation des données
node scripts/test-tracking.js geo         # Géolocalisation
```

### URLs de test disponibles
- http://localhost:3000/test-track-nextjs
- http://localhost:3000/demo-song-tracking

## 🎯 **Système de Tracking Double-Moteur**

### 1. **Tracking Serveur (Event: link_visit)**
- ✅ Exécuté dans `getServerSideProps`
- ✅ Enregistré avant le rendu de la page
- ✅ Fonctionne même si JavaScript est désactivé
- ✅ Géolocalisation automatique par IP

### 2. **Tracking Client (Event: service_click)**

#### Phase 1: Tracking Immédiat (GTM/dataLayer)
```javascript
window.dataLayer.push({
  event: 'service_click',
  smartlink_id: 'sl_123456',
  service_name: 'spotify',
  track_title: 'Track Name',
  artist_name: 'Artist Name',
  user_country: 'FR'
});
```

#### Phase 2: API Call Sécurisé
```javascript
const response = await fetch('/api/track/click', {
  method: 'POST',
  body: JSON.stringify({
    smartlinkId: 'sl_123456',
    serviceName: 'spotify',
    serviceDisplayName: 'Spotify',
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  })
});
```

#### Phase 3: Redirection Contrôlée
```javascript
setTimeout(() => {
  window.location.assign(response.destinationUrl);
}, 100); // Délai optimisé pour le tracking
```

## 📁 **Structure du Projet**

```
mdmc-smartlinks-nextjs/
├── pages/
│   ├── [smartlinkSlug].tsx      # Page dynamique des SmartLinks
│   ├── _document.tsx            # Configuration GTM globale
│   └── api/
│       └── track/
│           └── click.ts         # API de tracking des clics
├── src/
│   ├── components/              # Composants React
│   ├── lib/
│   │   └── database.ts         # Connexion MongoDB + modèles
│   ├── types/
│   │   └── smartlink.ts        # Types TypeScript
│   └── utils/
│       └── geolocation.ts      # Service de géolocalisation
├── scripts/
│   ├── seed-data.js            # Données de test
│   └── test-tracking.js        # Tests automatisés
└── public/
    └── assets/                 # Images & ressources statiques
```

## 🔧 **Configuration Avancée**

### Tracking par SmartLink
Chaque SmartLink peut avoir sa propre configuration de tracking :

```typescript
interface TrackingConfig {
  ga4?: {
    measurementId: string;    // GA4 spécifique au SmartLink
    enabled: boolean;
  };
  gtm?: {
    containerId: string;      // GTM spécifique au SmartLink  
    enabled: boolean;
  };
  metaPixel?: {
    pixelId: string;         // Meta Pixel spécifique
    enabled: boolean;
  };
}
```

### Géolocalisation Intelligente
- **Service principal** : ipapi.co
- **Service de fallback** : ip-api.com
- **Cache en mémoire** : 5 minutes
- **Timeout** : 3 secondes max

### Rate Limiting
- **10 requêtes/minute** par IP
- **Protection DDoS** intégrée
- **Logs de sécurité** automatiques

## 🚀 **Déploiement Production**

### 1. Build de production
```bash
npm run build
```

### 2. Démarrage production
```bash
npm start
```

### 3. Variables d'environnement production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mdmc-smartlinks
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 🔍 **Monitoring & Debug**

### Mode développement
- **Debug tools** disponibles dans la console
- **Logs détaillés** pour chaque tracking
- **Validation en temps réel** des événements

### Console helpers (dev uniquement)
```javascript
// Afficher le dataLayer
debugTracking.showDataLayer()

// Tester un événement
debugTracking.testEvent('test_event', {data: 'test'})

// Vérifier la configuration
debugTracking.checkConfig()
```

## 📈 **Performance**

### Métriques cibles
- **LCP** : < 1.5s
- **FID** : < 100ms  
- **CLS** : < 0.1
- **Time to Interactive** : < 2s

### Optimisations incluses
- **Image optimization** avec Next.js
- **Font preloading** pour les performances
- **Resource hints** (preconnect, dns-prefetch)
- **Bundle splitting** automatique

## 🔐 **Sécurité**

### Headers de sécurité
- **CSP** (Content Security Policy) strict
- **X-Frame-Options** : DENY
- **X-Content-Type-Options** : nosniff
- **Referrer-Policy** : strict-origin-when-cross-origin

### Validation des données
- **Validation côté serveur** systématique
- **Sanitization** des inputs utilisateur
- **Rate limiting** par IP
- **Logs de sécurité** complets

## 🤝 **Support & Contribution**

### Issues connues
- Géolocalisation peut échouer avec VPN
- Rate limiting peut bloquer les tests automatisés

### Roadmap
- [ ] Analytics dashboard en temps réel
- [ ] A/B testing pour les layouts
- [ ] PWA (Progressive Web App)
- [ ] API GraphQL
- [ ] Support multi-domaines

---

**🎵 MDMC Music Ads** - Plateforme de SmartLinks nouvelle génération  
*Architecture Next.js avec tracking double-moteur*