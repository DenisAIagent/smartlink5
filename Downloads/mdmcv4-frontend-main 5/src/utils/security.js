// Fonction pour nettoyer les données sensibles
export const sanitizeData = (data) => {
  if (!data) return data;
  
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '********';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  });
  
  return sanitized;
};

// Fonction pour valider les entrées utilisateur
export const validateInput = (input, type) => {
  const validations = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    phone: /^\+?[\d\s-]{10,}$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
  };

  if (!validations[type]) {
    throw new Error(`Type de validation non supporté: ${type}`);
  }

  return validations[type].test(input);
};

// Fonction pour gérer le stockage sécurisé
export const secureStorage = {
  set: (key, value) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Erreur lors du stockage sécurisé:', error);
    }
  },

  get: (key) => {
    try {
      const serializedValue = localStorage.getItem(key);
      return serializedValue ? JSON.parse(serializedValue) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération sécurisée:', error);
      return null;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Erreur lors de la suppression sécurisée:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Erreur lors du nettoyage sécurisé:', error);
    }
  }
};

// Fonction pour gérer les tokens CSRF
export const csrfToken = {
  get: () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  },

  set: (token) => {
    let meta = document.querySelector('meta[name="csrf-token"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'csrf-token';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', token);
  }
};

// Fonction pour gérer les en-têtes de sécurité
export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
}; 