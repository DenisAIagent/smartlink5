#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Début du déploiement...${NC}"

# Déploiement du Backend
echo -e "${BLUE}Déploiement du Backend...${NC}"
cd Backend
npm install
npm start &
BACKEND_PID=$!

# Attendre que le backend soit prêt
echo -e "${BLUE}Attente du démarrage du Backend...${NC}"
sleep 10

# Déploiement du Frontend
echo -e "${BLUE}Déploiement du Frontend...${NC}"
cd ../Frontend
npm install
npm run build

echo -e "${GREEN}Déploiement terminé !${NC}"
echo -e "${BLUE}Backend en cours d'exécution avec PID: ${BACKEND_PID}${NC}"
echo -e "${BLUE}Pour arrêter le Backend, utilisez: kill ${BACKEND_PID}${NC}" 