// src/utils/performance.js

/**
 * Utilitaires pour améliorer les performances de l'application
 */

/**
 * Fonction de debounce pour limiter l'exécution de fonctions coûteuses
 * @param {Function} func - La fonction à exécuter
 * @param {number} wait - Le délai d'attente en ms
 * @returns {Function} - La fonction debounced
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Fonction de throttle pour limiter la fréquence d'exécution
 * @param {Function} func - La fonction à exécuter
 * @param {number} limit - La limite de temps en ms
 * @returns {Function} - La fonction throttled
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Charge une image de manière optimisée avec lazy loading
 * @param {string} src - URL de l'image
 * @returns {Promise} - Promise résolue quand l'image est chargée
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Mémoïse une fonction pour éviter des calculs répétés
 * @param {Function} fn - La fonction à mémoïser
 * @returns {Function} - La fonction mémoïsée
 */
export const memoize = (fn) => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};
