# LuxBoard - Documentation Technique

## Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Technologies Utilisées](#technologies-utilisées)
4. [Installation et Configuration](#installation-et-configuration)
5. [API Documentation](#api-documentation)
6. [Base de Données](#base-de-données)
7. [Sécurité](#sécurité)
8. [Déploiement](#déploiement)
9. [Maintenance](#maintenance)

---

## Vue d'Ensemble

**LuxBoard** est une application web complète de conciergerie de luxe développée avec une architecture moderne séparant le frontend (React) du backend (Node.js/Express).

### Fonctionnalités Principales
- Gestion des utilisateurs avec authentification JWT
- CRUD complet pour prestataires, offres et événements
- Système de rôles (utilisateur, éditeur, admin)
- Upload et gestion d'images
- Intégration APIs externes (Unsplash, Pexels)
- Notifications en temps réel (Socket.IO)
- Interface responsive et moderne

---

## Architecture

### Architecture Générale
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Base de       │
│   (React)       │◄──►│  (Node.js)      │◄──►│   Données       │
│   Port: 5173    │    │   Port: 5000    │    │   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Structure des Dossiers

```
luxboard/
├── backend/
│   ├── controllers/     # Logique métier
│   ├── middleware/      # Middlewares (auth, upload, validation)
│   ├── models/          # Modèles Mongoose
│   ├── routes/          # Routes Express
│   ├── services/        # Services (images, notifications)
│   ├── utils/           # Utilitaires
│   ├── uploads/         # Fichiers uploadés
│   └── server.js        # Point d'entrée
├── frontend/
│   ├── src/
│   │   ├── components/  # Composants React
│   │   ├── contexts/    # Contextes React
│   │   ├── pages/       # Pages de l'application
│   │   ├── services/    # Services API
│   │   └── utils/       # Utilitaires
│   ├── dist/           # Build de production
│   └── package.json
├── docs/               # Documentation
└── README.md
```

---

## Technologies Utilisées

### Backend
- **Node.js** v20.18.0 - Runtime JavaScript
- **Express** v4.18.0 - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification
- **Socket.IO** - Notifications temps réel
- **Multer** - Upload de fichiers
- **Bcrypt** - Hachage des mots de passe
- **Joi** - Validation des données
- **Helmet** - Sécurité HTTP
- **CORS** - Gestion des origines croisées

### Frontend
- **React** v18 - Bibliothèque UI
- **Vite** - Build tool moderne
- **React Router** - Navigation
- **TailwindCSS** - Framework CSS
- **Axios** - Client HTTP
- **Lucide React** - Icônes

### Outils de Développement
- **Nodemon** - Rechargement automatique
- **ESLint** - Linting JavaScript
- **Prettier** - Formatage de code

---

## Installation et Configuration

### Prérequis
- Node.js v20+
- MongoDB v7.0+
- npm ou yarn

### Installation Backend

```bash
# Cloner le projet
git clone <repository-url>
cd luxboard

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Démarrer MongoDB
sudo systemctl start mongod

# Démarrer le serveur de développement
npm run dev
```

### Installation Frontend

```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

### Variables d'Environnement

```env
# Configuration de base
NODE_ENV=development
PORT=5000

# Base de données
MONGODB_URI=mongodb://localhost:27017/luxboard

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# APIs externes
UNSPLASH_ACCESS_KEY=your-unsplash-key
PEXELS_API_KEY=your-pexels-key

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## API Documentation

### Authentification

#### POST /api/auth/register
Inscription d'un nouvel utilisateur.

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+33123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": { ... },
    "token": "jwt-token"
  }
}
```

#### POST /api/auth/login
Connexion utilisateur.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Prestataires

#### GET /api/providers
Récupérer la liste des prestataires avec pagination.

**Query Parameters:**
- `page` (number): Numéro de page (défaut: 1)
- `limit` (number): Nombre d'éléments par page (défaut: 10)
- `category` (string): Filtrer par catégorie
- `search` (string): Recherche textuelle

#### POST /api/providers
Créer un nouveau prestataire (admin/éditeur uniquement).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Body:**
```json
{
  "name": "Restaurant Le Luxe",
  "category": "restaurant",
  "description": "Restaurant gastronomique...",
  "location": {
    "address": "123 Rue de la Paix",
    "city": "Paris",
    "country": "France"
  },
  "contact": {
    "phone": "+33123456789",
    "email": "contact@restaurant.com"
  }
}
```

### Upload d'Images

#### POST /api/upload/single
Upload d'une seule image.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Body:**
```
image: <file>
```

### Images Externes

#### GET /api/images/search
Rechercher des images via APIs externes.

**Query Parameters:**
- `query` (string): Terme de recherche
- `page` (number): Page
- `perPage` (number): Résultats par page
- `source` (string): 'unsplash' ou 'pexels'

---

## Base de Données

### Modèles de Données

#### User
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: ['user', 'editor', 'admin'],
  membershipLevel: ['standard', 'premium', 'vip'],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Provider
```javascript
{
  name: String,
  category: String,
  description: String,
  images: [String],
  location: {
    address: String,
    city: String,
    country: String,
    coordinates: [Number]
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  rating: Number,
  isVerified: Boolean,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

#### Offer
```javascript
{
  title: String,
  description: String,
  provider: ObjectId,
  category: String,
  discountPercentage: Number,
  originalPrice: Number,
  discountedPrice: Number,
  validFrom: Date,
  validUntil: Date,
  isActive: Boolean,
  membershipRequired: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Event
```javascript
{
  title: String,
  description: String,
  category: String,
  date: Date,
  location: String,
  maxAttendees: Number,
  currentAttendees: Number,
  price: Number,
  images: [String],
  isPrivate: Boolean,
  membershipRequired: String,
  createdBy: ObjectId,
  attendees: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Sécurité

### Authentification et Autorisation
- **JWT** pour l'authentification stateless
- **Bcrypt** pour le hachage des mots de passe (salt rounds: 12)
- **Middleware d'autorisation** basé sur les rôles
- **Rate limiting** pour prévenir les attaques par force brute

### Validation des Données
- **Joi** pour la validation côté serveur
- Validation des types de fichiers pour l'upload
- Sanitisation des entrées utilisateur

### Sécurité HTTP
- **Helmet** pour les en-têtes de sécurité
- **CORS** configuré pour les domaines autorisés
- **HTTPS** en production (recommandé)

### Gestion des Fichiers
- Limitation de taille (5MB par fichier)
- Types MIME autorisés pour les images
- Stockage sécurisé des fichiers uploadés

---

## Déploiement

### Frontend (Déployé)
L'application frontend est déployée sur : **https://ybsvqeiq.manus.space**

### Build de Production

```bash
# Frontend
cd frontend
npm run build

# Le dossier dist/ contient les fichiers statiques
```

### Variables d'Environnement Production

```env
NODE_ENV=production
MONGODB_URI=mongodb://production-server:27017/luxboard
JWT_SECRET=super-secure-production-secret
FRONTEND_URL=https://ybsvqeiq.manus.space
```

### Serveur de Production

Pour déployer le backend en production :

1. **Serveur VPS/Cloud**
   ```bash
   # Installer Node.js et MongoDB
   # Cloner le repository
   # Configurer les variables d'environnement
   # Installer PM2 pour la gestion des processus
   npm install -g pm2
   pm2 start backend/server.js --name luxboard-api
   ```

2. **Docker (optionnel)**
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["node", "backend/server.js"]
   ```

---

## Maintenance

### Monitoring
- Logs applicatifs avec Morgan
- Monitoring des performances
- Surveillance de la base de données

### Sauvegarde
- Sauvegarde quotidienne de MongoDB
- Sauvegarde des fichiers uploadés
- Tests de restauration réguliers

### Mises à Jour
- Mise à jour régulière des dépendances
- Tests de sécurité
- Monitoring des vulnérabilités

### Performance
- Optimisation des requêtes MongoDB
- Mise en cache des données fréquemment accédées
- Compression des réponses HTTP
- Optimisation des images

---

## Contact Technique

Pour toute question technique ou contribution :
- **Email** : dev@luxboard.com
- **Documentation** : Consultez ce fichier
- **Issues** : Utilisez le système de tickets du repository

---

**Version** : 1.0  
**Dernière mise à jour** : Juin 2025  
**Auteur** : Équipe de développement LuxBoard

