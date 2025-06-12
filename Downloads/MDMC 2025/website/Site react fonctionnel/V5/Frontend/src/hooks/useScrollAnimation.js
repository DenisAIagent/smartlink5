import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTheme } from '@mui/material';

const useScrollAnimation = (options = {}) => {
  const {
    threshold = 0.1,
    triggerOnce = true,
    delay = 0,
    duration = 0.5,
    animation = 'fadeIn',
    distance = 50,
  } = options;

  const theme = useTheme();
  const [ref, inView] = useInView({
    threshold,
    triggerOnce,
  });

  const elementRef = useRef(null);

  const getAnimationVariants = () => {
    const baseVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration,
          delay,
          ease: 'easeOut',
        },
      },
    };

    const animations = {
      fadeIn: baseVariants,
      fadeInUp: {
        hidden: { opacity: 0, y: distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            delay,
            ease: 'easeOut',
          },
        },
      },
      fadeInDown: {
        hidden: { opacity: 0, y: -distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            delay,
            ease: 'easeOut',
          },
        },
      },
      fadeInLeft: {
        hidden: { opacity: 0, x: -distance },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            duration,
            delay,
            ease: 'easeOut',
          },
        },
      },
      fadeInRight: {
        hidden: { opacity: 0, x: distance },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            duration,
            delay,
            ease: 'easeOut',
          },
        },
      },
      scale: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: {
            duration,
            delay,
            ease: 'easeOut',
          },
        },
      },
      bounce: {
        hidden: { opacity: 0, y: distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            delay,
            type: 'spring',
            bounce: 0.4,
          },
        },
      },
    };

    return animations[animation] || baseVariants;
  };

  useEffect(() => {
    if (inView && elementRef.current) {
      // Ajouter une classe pour déclencher l'animation CSS si nécessaire
      elementRef.current.classList.add('animate');
    }
  }, [inView]);

  const variants = getAnimationVariants();

  // Ajuster les animations pour mobile
  if (theme.breakpoints.down('sm')) {
    variants.hidden = { ...variants.hidden, y: 0, x: 0 };
    variants.visible = {
      ...variants.visible,
      y: 0,
      x: 0,
      transition: {
        ...variants.visible.transition,
        duration: duration * 0.8,
      },
    };
  }

  return {
    ref,
    elementRef,
    inView,
    variants,
    initial: 'hidden',
    animate: inView ? 'visible' : 'hidden',
  };
};

export default useScrollAnimation; 