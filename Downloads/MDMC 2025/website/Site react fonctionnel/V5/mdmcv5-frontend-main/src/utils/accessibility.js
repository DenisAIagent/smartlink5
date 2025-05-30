// src/utils/accessibility.js

/**
 * Utilitaire pour améliorer l'accessibilité des composants
 */

/**
 * Génère des attributs ARIA pour un composant interactif
 * @param {string} role - Le rôle ARIA de l'élément
 * @param {string} label - Le label accessible
 * @param {boolean} expanded - Si l'élément est déplié (pour les accordéons, menus, etc.)
 * @param {boolean} disabled - Si l'élément est désactivé
 * @returns {Object} - Les attributs ARIA à propager sur l'élément
 */
export const getAriaProps = (role, label, expanded = false, disabled = false) => {
  return {
    role,
    'aria-label': label,
    ...(expanded !== undefined && { 'aria-expanded': expanded }),
    ...(disabled !== undefined && { 'aria-disabled': disabled })
  };
};

/**
 * Ajoute des gestionnaires d'événements clavier pour la navigation au clavier
 * @param {Function} onClick - La fonction à exécuter lors du clic
 * @returns {Object} - Les gestionnaires d'événements à propager sur l'élément
 */
export const getKeyboardHandlers = (onClick) => {
  return {
    onClick,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    },
    tabIndex: 0
  };
};

/**
 * Crée un ID unique pour les associations label/input
 * @param {string} prefix - Préfixe pour l'ID
 * @returns {string} - ID unique
 */
export const generateUniqueId = (prefix) => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
};
