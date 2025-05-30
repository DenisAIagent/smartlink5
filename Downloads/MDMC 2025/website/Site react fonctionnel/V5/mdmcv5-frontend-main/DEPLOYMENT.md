# Documentation de déploiement - MDMC Music Ads Frontend

Cette documentation explique comment installer, lancer et déployer le frontend de l'application MDMC Music Ads après nettoyage des configurations Docker et Nginx problématiques.

## Prérequis

- Node.js (version 16 ou supérieure)
- npm (inclus avec Node.js)

## Installation locale

1. Ouvrez un terminal et naviguez vers le dossier du projet frontend :
   ```bash
   cd chemin/vers/mdmcv4-frontend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

## Lancement en mode développement

Pour lancer l'application en mode développement avec rechargement à chaud :

```bash
npm run dev
```

L'application sera accessible à l'adresse : http://localhost:5173/

## Construction pour la production

Pour construire l'application pour la production :

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist`.

## Prévisualisation de la version de production

Pour prévisualiser la version de production localement :

```bash
npm run preview
```

## Structure du projet

- `src/` : Contient le code source de l'application
  - `components/` : Composants React
  - `assets/` : Fichiers statiques (styles, images, etc.)
  - `i18n/` : Fichiers de traduction
  - `App.jsx` : Composant principal de l'application
  - `main.jsx` : Point d'entrée de l'application

## Déploiement sur un serveur

### Option 1 : Déploiement sur un serveur web statique

1. Construisez l'application pour la production :
   ```bash
   npm run build
   ```

2. Copiez le contenu du dossier `dist` sur votre serveur web.

3. Configurez votre serveur web pour rediriger toutes les requêtes vers `index.html` (nécessaire pour le routage côté client).

### Option 2 : Déploiement sur Netlify/Vercel

1. Créez un compte sur [Netlify](https://www.netlify.com/) ou [Vercel](https://vercel.com/).

2. Connectez votre dépôt Git ou téléchargez directement le dossier du projet.

3. Configurez les paramètres de build :
   - Build command : `npm run build`
   - Publish directory : `dist`

4. Déployez l'application.

## Notes importantes

- Certains éléments dynamiques (compteurs, articles, témoignages) nécessitent une connexion au backend pour fonctionner correctement.
- Les messages d'erreur comme "Chargement des articles temporairement indisponible" ou "Erreur de configuration API" sont normaux en environnement de développement sans backend connecté.
- Pour une expérience complète, assurez-vous que le backend est correctement configuré et accessible.

## Résolution des problèmes courants

- **Erreur "Module not found"** : Vérifiez que toutes les dépendances sont installées avec `npm install`.
- **Page blanche après déploiement** : Assurez-vous que votre serveur est configuré pour rediriger vers `index.html`.
- **Problèmes d'affichage des données dynamiques** : Vérifiez la connexion avec le backend et les variables d'environnement.

Pour toute assistance supplémentaire, contactez l'équipe de développement.
