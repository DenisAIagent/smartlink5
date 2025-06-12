import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const usePageTransition = (options = {}) => {
  const {
    type = 'fade',
    duration = 0.5,
    delay = 0,
    easing = 'easeInOut',
  } = options;

  const location = useLocation();

  const getPageTransition = () => {
    const baseTransition = {
      duration,
      delay,
      ease: easing,
    };

    const transitions = {
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: baseTransition,
      },
      slide: {
        initial: { x: '100%' },
        animate: { x: 0 },
        exit: { x: '-100%' },
        transition: baseTransition,
      },
      slideUp: {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '-100%' },
        transition: baseTransition,
      },
      scale: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.2 },
        transition: baseTransition,
      },
      flip: {
        initial: { opacity: 0, rotateY: 90 },
        animate: { opacity: 1, rotateY: 0 },
        exit: { opacity: 0, rotateY: -90 },
        transition: {
          ...baseTransition,
          type: 'spring',
          stiffness: 100,
        },
      },
    };

    return transitions[type] || transitions.fade;
  };

  const pageTransition = getPageTransition();

  const PageTransition = ({ children }) => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageTransition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  };

  return {
    PageTransition,
    location,
  };
};

export default usePageTransition; 