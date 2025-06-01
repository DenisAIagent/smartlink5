# LuxBoard - Conciergerie de Luxe

## 🎯 Description

LuxBoard est une webapp de conciergerie de luxe inspirée du Guide Michelin. Elle centralise une base de données évolutive de prestataires premium, offres privilèges et événements exclusifs, avec une gestion des rôles et une interface moderne.

## 🚀 Fonctionnalités

- **Gestion des rôles** : Administrateur, Éditeur, Utilisateur (Concierge)
- **Base de données complète** : Prestataires, Offres privilèges, Événements
- **Recherche intelligente** : Filtres avancés et suggestions dynamiques
- **Interface moderne** : Design premium responsive
- **APIs externes** : Enrichissement automatique des données
- **Sécurité renforcée** : JWT, RBAC, conformité RGPD

## 🛠️ Stack Technique

### Backend
- **Node.js** avec **Express 4.x**
- **MongoDB** avec **Mongoose**
- **JWT** pour l'authentification
- **Multer** pour l'upload de fichiers
- **Helmet** pour la sécurité

### Frontend (à venir)
- **React 18** avec **Vite**
- **TailwindCSS** pour le design
- **React Router** pour la navigation
- **Axios** pour les appels API

## 📦 Installation

### Prérequis
- Node.js 18+
- MongoDB 7.0+
- npm ou yarn

### Configuration
1. Cloner le repository
2. Installer les dépendances : `npm install`
3. Copier `.env.example` vers `.env` et configurer les variables
4. Démarrer MongoDB : `sudo systemctl start mongod`
5. Lancer le serveur : `npm run dev`

## 🔧 Scripts disponibles

- `npm start` : Démarrer en production
- `npm run dev` : Démarrer en développement avec nodemon
- `npm run lint` : Vérifier le code avec ESLint
- `npm run lint:fix` : Corriger automatiquement les erreurs ESLint

## 📁 Structure du projet

```
luxboard/
├── backend/
│   ├── controllers/     # Contrôleurs API
│   ├── middleware/      # Middlewares personnalisés
│   ├── models/         # Modèles Mongoose
│   ├── routes/         # Routes Express
│   ├── utils/          # Utilitaires
│   ├── config/         # Configuration
│   └── server.js       # Serveur principal
├── frontend/           # Application React (à venir)
├── uploads/            # Fichiers uploadés
├── docs/              # Documentation
└── .env.example       # Variables d'environnement exemple
```

## 🔐 Variables d'environnement

Voir `.env.example` pour la liste complète des variables requises.

## 🚦 Statut du développement

- ✅ Phase 1 : Analyse et architecture
- ✅ Phase 2 : Configuration environnement et backend
- 🔄 Phase 3 : Modèles de données et authentification
- ⏳ Phase 4 : API REST et endpoints
- ⏳ Phase 5 : Interface frontend React
- ⏳ Phase 6 : Fonctionnalités avancées
- ⏳ Phase 7 : Tests et déploiement
- ⏳ Phase 8 : Documentation finale

## 📞 Support

Pour toute question ou suggestion, veuillez consulter la documentation dans le dossier `docs/`.

---

**LuxBoard** - La référence de la conciergerie de luxe

