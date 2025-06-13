# 🚀 DevCraft AI

Plateforme de génération automatique de projets web avec intelligence artificielle.

## 📋 Fonctionnalités

- Génération de projets web complets avec React + Express
- Analyse sémantique des descriptions de projet
- Templates spécialisés par domaine
- Interface web moderne et intuitive
- Streaming en temps réel des logs de génération
- Export automatique des projets générés

## 🛠️ Installation

### Prérequis

- Python 3.11+
- Docker et Docker Compose (optionnel)
- Node.js 18+ (pour le développement frontend)

### Installation Locale

1. Cloner le repository :
```bash
git clone https://github.com/votre-username/devcraft-ai.git
cd devcraft-ai
```

2. Créer un environnement virtuel :
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
.\venv\Scripts\activate  # Windows
```

3. Installer les dépendances :
```bash
pip install -r requirements.txt
```

4. Lancer l'API :
```bash
uvicorn api.server:app --reload
```

### Installation avec Docker

1. Construire et lancer les conteneurs :
```bash
docker-compose up -d
```

## 🎯 Utilisation

### API Endpoints

- `POST /api/analyze` : Analyse du projet
- `POST /api/generate` : Génération du projet
- `GET /api/status/{job_id}` : Statut de la génération
- `GET /api/logs/{job_id}` : Logs en temps réel
- `GET /api/download/{job_id}` : Téléchargement du projet

### Exemple de Requête

```python
import requests

# Analyse du projet
response = requests.post("http://localhost:8000/api/analyze", json={
    "description": "Application de pêche avec géolocalisation",
    "features": ["carte interactive", "météo", "forum"]
})

# Génération du projet
job = requests.post("http://localhost:8000/api/generate", json={
    "description": "Application de pêche avec géolocalisation",
    "features": ["carte interactive", "météo", "forum"],
    "template_type": "fishing-platform"
})
```

## 📦 Templates Disponibles

- `fishing-platform` : Plateforme de pêche avec géolocalisation
- `ecommerce-stripe` : Boutique en ligne avec paiement Stripe
- `blog-seo` : Blog optimisé pour le SEO
- `realtime-chat` : Application de chat en temps réel

## 🔧 Configuration

Les variables d'environnement suivantes peuvent être configurées :

- `ENVIRONMENT` : Environnement (development/production)
- `LOG_LEVEL` : Niveau de logging
- `API_KEYS` : Clés API pour les services externes

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub. 