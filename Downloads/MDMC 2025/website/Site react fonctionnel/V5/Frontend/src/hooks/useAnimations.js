import { useEffect, useState } from 'react';
import { ANIMATIONS, REDUCED_MOTION } from '../config/animations.config';

export const useAnimations = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Vérifier les préférences de l'utilisateur
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Écouter les changements de préférences
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Fonction pour obtenir les animations en fonction des préférences
  const getAnimation = (type) => {
    if (prefersReducedMotion) {
      return REDUCED_MOTION;
    }
    return ANIMATIONS[type] || ANIMATIONS.fadeIn;
  };

  // Fonction pour les animations séquentielles
  const getSequenceAnimation = (type) => {
    if (prefersReducedMotion) {
      return {
        container: { ...REDUCED_MOTION },
        item: { ...REDUCED_MOTION }
      };
    }
    return SEQUENCE;
  };

  return {
    prefersReducedMotion,
    getAnimation,
    getSequenceAnimation
  };
}; 