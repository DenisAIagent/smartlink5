// Configuration des animations avec Framer Motion
export const ANIMATIONS = {
  // Animations de base
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },

  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },

  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },

  // Animations pour les sections
  section: {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.6, ease: 'easeOut' }
  },

  // Animations pour les cartes
  card: {
    initial: { scale: 0.95, opacity: 0 },
    whileInView: { scale: 1, opacity: 1 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: 0.4, ease: 'easeOut' }
  },

  // Animations pour les boutons
  button: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2 }
  },

  // Animations pour les listes
  list: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { staggerChildren: 0.1 }
  },

  listItem: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.3 }
  },

  // Animations pour les modales
  modal: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // Animations pour les notifications
  notification: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // Animations pour les images
  image: {
    initial: { scale: 1.1, opacity: 0 },
    whileInView: { scale: 1, opacity: 1 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: 'easeOut' }
  },

  // Animations pour les textes
  text: {
    initial: { y: 20, opacity: 0 },
    whileInView: { y: 0, opacity: 1 },
    viewport: { once: true },
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

// Variantes pour les animations séquentielles
export const SEQUENCE = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }
};

// Configuration pour le mode de réduction de mouvement
export const REDUCED_MOTION = {
  transition: { duration: 0 },
  whileHover: {},
  whileTap: {},
  animate: { opacity: 1 },
  initial: { opacity: 0 }
}; 