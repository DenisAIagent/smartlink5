#!/bin/bash

# FlowForge v2.1 - Script de déploiement Railway

echo "🚀 Déploiement FlowForge v2.1 sur Railway..."

# Vérifier que railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI non installé. Installation..."
    npm install -g @railway/cli
fi

# Login Railway (si pas déjà fait)
echo "🔐 Connexion Railway..."
railway login

# Créer un nouveau projet ou utiliser existant
echo "📦 Initialisation projet..."
railway init

# Ajouter PostgreSQL
echo "🐘 Ajout PostgreSQL..."
railway add postgresql

# Générer une clé de chiffrement si elle n'existe pas
if [ ! -f ".encryption-key" ]; then
    echo "🔑 Génération clé de chiffrement..."
    node generate-key.js > .encryption-key
    ENCRYPTION_KEY=$(cat .encryption-key)
    echo "Clé générée: $ENCRYPTION_KEY"
fi

# Configurer les variables d'environnement
echo "⚙️ Configuration variables d'environnement..."
railway variables set NODE_ENV=production
railway variables set ENCRYPTION_KEY="$(cat .encryption-key)"

# Demander la clé Claude API
read -p "🤖 Clé API Claude (requis): " CLAUDE_API_KEY
if [ ! -z "$CLAUDE_API_KEY" ]; then
    railway variables set CLAUDE_API_KEY="$CLAUDE_API_KEY"
fi

# Demander webhook Discord (optionnel)
read -p "📱 Discord Webhook URL (optionnel): " DISCORD_WEBHOOK
if [ ! -z "$DISCORD_WEBHOOK" ]; then
    railway variables set DISCORD_WEBHOOK_URL="$DISCORD_WEBHOOK"
fi

# Déployer
echo "🚀 Déploiement en cours..."
railway up

echo "✅ Déploiement terminé !"
echo "🌐 Votre application sera disponible sur: https://votre-app.railway.app"
echo "📊 Tableau de bord: https://railway.app/dashboard"

# Afficher les logs
echo "📋 Affichage des logs de déploiement..."
railway logs