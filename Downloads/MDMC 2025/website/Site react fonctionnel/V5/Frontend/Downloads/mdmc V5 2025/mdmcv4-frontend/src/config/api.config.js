// src/config/api.config.js

// Lire l'URL du backend depuis la variable d'environnement VITE_API_URL.
// Fournir une URL par défaut pour le développement local si la variable n'est pas définie.
// Cette URL par défaut DOIT correspondre à la structure attendue (incluant /api).
const backendBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Log pour vérifier quelle URL est utilisée (sera visible dans la console du navigateur pendant le dev et en production)
console.log("API Base URL for service calls (from api.config.js):", backendBaseUrl);

const API_CONFIG = {
    // BASE_URL est maintenant la base URL complète de ton API backend, se terminant par /api
    BASE_URL: backendBaseUrl,

    // Timeout des requêtes en millisecondes
    TIMEOUT: 15000, // Un peu plus long pour tenir compte des variations réseau
};

export default API_CONFIG;
