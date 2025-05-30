// src/config/api.config.js - CORRIGÉ

// Configuration pour connecter le frontend au backend
const API_CONFIG = {
    // URL du backend - CORRIGÉE
    // On garde le /api à la fin car tes routes backend l'utilisent
    // et ton api.service.js ajoute les chemins relatifs (/blog/latest, etc.)
    API_URL: 'https://mdmcv4-backend-production.up.railway.app/api', // <<<--- CORRECTION ICI

    // Timeout des requêtes en millisecondes
    TIMEOUT: 10000,

    // Headers par défaut
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

export default API_CONFIG;
