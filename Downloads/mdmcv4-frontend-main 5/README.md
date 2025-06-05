# MDMCV4 Frontend

Application frontend pour la gestion des intégrations et des rapports.

## Fonctionnalités

### Paramètres et Configuration
- Gestion des paramètres généraux (nom de l'entreprise, fuseau horaire, format de date)
- Personnalisation de l'interface (thème, langue, mode sombre)
- Configuration des notifications (email, in-app, système)

### Export et Rapports
- Génération de rapports personnalisés
- Modèles de rapports configurables
- Planification des exports
- Formats d'export multiples (PDF, Excel)

### Intégrations
- Gestion des connexions avec les plateformes externes
- Configuration des webhooks
- Synchronisation des données
- Suivi des logs et des erreurs

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/votre-org/mdmcv4-frontend.git
cd mdmcv4-frontend
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
```
Modifier les valeurs dans le fichier `.env` selon votre environnement.

4. Démarrer l'application en mode développement :
```bash
npm run dev
```

## Structure du Projet

```
src/
├── admin/
│   ├── features/
│   │   ├── integrations/
│   │   ├── reports/
│   │   └── settings/
│   ├── services/
│   │   ├── integrations.service.js
│   │   ├── reports.service.js
│   │   └── settings.service.js
│   └── components/
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── App.jsx
```

## Tests

Exécuter les tests unitaires :
```bash
npm test
```

Exécuter les tests avec couverture :
```bash
npm run test:coverage
```

## API Endpoints

### Paramètres
- `GET /api/settings` - Récupérer les paramètres
- `PUT /api/settings` - Mettre à jour les paramètres
- `GET /api/settings/themes` - Récupérer les thèmes disponibles
- `PUT /api/settings/theme` - Mettre à jour le thème
- `GET /api/settings/notifications` - Récupérer les paramètres de notification
- `PUT /api/settings/notifications` - Mettre à jour les paramètres de notification

### Rapports
- `GET /api/reports/templates` - Récupérer les modèles de rapport
- `POST /api/reports/templates` - Créer un modèle de rapport
- `PUT /api/reports/templates/:id` - Mettre à jour un modèle de rapport
- `DELETE /api/reports/templates/:id` - Supprimer un modèle de rapport
- `POST /api/reports/generate` - Générer un rapport
- `POST /api/reports/schedule` - Planifier un rapport
- `GET /api/reports/scheduled` - Récupérer les rapports planifiés
- `PUT /api/reports/scheduled/:id` - Mettre à jour un rapport planifié
- `DELETE /api/reports/scheduled/:id` - Supprimer un rapport planifié

### Intégrations
- `GET /api/integrations` - Récupérer les intégrations disponibles
- `POST /api/integrations/connect` - Connecter une intégration
- `POST /api/integrations/:platform/disconnect` - Déconnecter une intégration
- `GET /api/integrations/:platform/webhooks` - Récupérer les webhooks
- `POST /api/integrations/:platform/webhooks` - Créer un webhook
- `PUT /api/integrations/:platform/webhooks/:id` - Mettre à jour un webhook
- `DELETE /api/integrations/:platform/webhooks/:id` - Supprimer un webhook
- `POST /api/integrations/:platform/sync` - Synchroniser les données
- `GET /api/integrations/:platform/sync/:id` - Récupérer le statut de synchronisation
- `GET /api/integrations/:platform/logs` - Récupérer les logs

## Déploiement

1. Construire l'application :
```bash
npm run build
```

2. Les fichiers de production seront générés dans le dossier `dist/`.

## Contribution

1. Créer une branche pour votre fonctionnalité :
```bash
git checkout -b feature/ma-fonctionnalite
```

2. Commiter vos changements :
```bash
git commit -m 'Ajout de ma fonctionnalité'
```

3. Pousser vers la branche :
```bash
git push origin feature/ma-fonctionnalite
```

4. Créer une Pull Request.

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 