import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useMediaQuery, useTheme } from '@mui/material';

export const useAnimation = (options = {}) => {
  const {
    threshold = 0.1,
    triggerOnce = true,
    delay = 0,
    duration = 0.5,
    animation = 'fadeIn',
  } = options;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [ref, inView] = useInView({
    threshold,
    triggerOnce,
  });

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [inView, delay]);

  const getAnimationVariants = () => {
    const baseVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration,
          ease: 'easeOut',
        },
      },
    };

    const animations = {
      fadeIn: baseVariants,
      slideUp: {
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            ease: 'easeOut',
          },
        },
      },
      slideDown: {
        hidden: { opacity: 0, y: -50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            ease: 'easeOut',
          },
        },
      },
      slideLeft: {
        hidden: { opacity: 0, x: 50 },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            duration,
            ease: 'easeOut',
          },
        },
      },
      slideRight: {
        hidden: { opacity: 0, x: -50 },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            duration,
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
            ease: 'easeOut',
          },
        },
      },
    };

    return animations[animation] || baseVariants;
  };

  const variants = getAnimationVariants();

  // Ajuster les animations pour mobile
  if (isMobile) {
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
    isAnimating,
    variants,
    initial: 'hidden',
    animate: isAnimating ? 'visible' : 'hidden',
  };
};

export default useAnimation; 