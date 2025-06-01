# Déploiement LuxBoard sur Railway

## 🚀 Guide de Déploiement

### 1. Préparation du Projet

Le projet a été configuré pour Railway avec :
- ✅ `nixpacks.toml` - Configuration de build optimisée
- ✅ `railway.json` - Configuration de déploiement
- ✅ Scripts npm mis à jour pour installer les dépendances frontend
- ✅ Serveur configuré pour servir les fichiers statiques en production
- ✅ **NOUVEAU** : Correction des conflits de dépendances avec `--legacy-peer-deps`

### 2. Variables d'Environnement Requises

Configurez ces variables dans Railway :

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/luxboard
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
```

### 3. Base de Données

Utilisez MongoDB Atlas ou Railway PostgreSQL :
- **MongoDB Atlas** : Créez un cluster gratuit sur https://cloud.mongodb.com
- **Railway PostgreSQL** : Ajoutez le service PostgreSQL dans Railway

### 4. Déploiement

1. **Connectez votre repository GitHub à Railway**
2. **Configurez les variables d'environnement**
3. **Railway détectera automatiquement la configuration**
4. **Le build se fera automatiquement avec les scripts npm**

### 5. Structure de Build

```
npm install                              # Install backend dependencies
cd frontend && npm install --legacy-peer-deps  # Install frontend dependencies (with conflict resolution)
npm run build                           # Build frontend (cd frontend && npm run build)
npm start                              # Start server (node backend/server.js)
```

### 6. Vérification

Une fois déployé, vérifiez :
- ✅ `/health` - API health check
- ✅ `/` - Frontend React app
- ✅ `/api/*` - API endpoints

### 7. Troubleshooting

**Erreur "vite: not found"** ✅ CORRIGÉ
- Le script build installe maintenant les dépendances frontend avant le build

**Erreur de routing** ✅ CORRIGÉ  
- Le serveur sert maintenant l'index.html pour toutes les routes non-API

**Conflit de dépendances date-fns/react-day-picker** ✅ CORRIGÉ
- Mise à jour de react-day-picker vers v9.7.0
- Ajout de --legacy-peer-deps pour résoudre les conflits

**Variables d'environnement manquantes**
- Vérifiez que toutes les variables sont configurées dans Railway

### 8. Monitoring

Railway fournit automatiquement :
- 📊 Logs en temps réel
- 📈 Métriques de performance  
- 🔄 Redéploiement automatique sur push GitHub

---

**🌟 LuxBoard est maintenant prêt pour Railway ! 🌟**

