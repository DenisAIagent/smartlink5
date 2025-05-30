// src/hooks/useIntersectionObserver.js
import { useEffect } from 'react';

/**
 * Hook personnalisé pour animer les sections au défilement
 * @param {Object} options - Options de configuration
 * @param {string} options.selector - Sélecteur CSS des éléments à observer (par défaut: 'section')
 * @param {number} options.threshold - Seuil de visibilité (par défaut: 0.1)
 * @param {string} options.visibleClass - Classe CSS à ajouter (par défaut: 'visible')
 * @param {string} options.animationClass - Classe CSS d'animation (par défaut: 'section-fade-in')
 */
export const useIntersectionObserver = ({
  selector = 'section',
  threshold = 0.1,
  visibleClass = 'visible',
  animationClass = 'section-fade-in'
} = {}) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(visibleClass);
        }
      });
    }, { threshold });
    
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.classList.add(animationClass);
      observer.observe(element);
    });
    
    return () => {
      elements.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, [selector, threshold, visibleClass, animationClass]);
};
