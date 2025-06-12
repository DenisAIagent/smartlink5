// src/config/api.config.js

// Lire l'URL du backend depuis la variable d'environnement VITE_API_URL.
// Fournir une URL par défaut pour le développement local si la variable n'est pas définie.
const backendBaseUrl = import.meta.env.VITE_API_URL || 'https://mdmcv4-backend-production-b615.up.railway.app/api';

// Log pour vérifier quelle URL est utilisée (sera visible dans la console du navigateur pendant le dev et en production)
console.log("API Base URL for service calls (from api.config.js):", backendBaseUrl);

const API_CONFIG = {
    // BASE_URL est maintenant la base URL complète de ton API backend
    BASE_URL: process.env.REACT_APP_API_URL || 'https://mdmcv4-backend-production-b615.up.railway.app/api',

    // Timeout des requêtes en millisecondes
    TIMEOUT: 15000, // Un peu plus long pour tenir compte des variations réseau

    // Endpoints spécifiques
    ENDPOINTS: {
        AUTH: '/auth',
        ARTISTS: '/artists',
        SMARTLINKS: '/smartlinks',
        UPLOAD: '/upload',
        REVIEWS: '/reviews',
        WORDPRESS: '/wordpress'
    }
};

export default API_CONFIG;
