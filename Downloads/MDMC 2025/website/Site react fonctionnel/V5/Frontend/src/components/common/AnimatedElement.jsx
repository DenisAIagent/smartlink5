import React from 'react';
import { motion } from 'framer-motion';
import { useAnimations } from '../../hooks/useAnimations';

const AnimatedElement = ({
  children,
  type = 'fadeIn',
  as = 'div',
  className,
  style,
  ...props
}) => {
  const { getAnimation } = useAnimations();
  const animation = getAnimation(type);

  const MotionComponent = motion[as];

  return (
    <MotionComponent
      className={className}
      style={style}
      {...animation}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

// Composants animés prédéfinis
export const AnimatedSection = (props) => (
  <AnimatedElement type="section" as="section" {...props} />
);

export const AnimatedCard = (props) => (
  <AnimatedElement type="card" as="div" {...props} />
);

export const AnimatedButton = (props) => (
  <AnimatedElement type="button" as="button" {...props} />
);

export const AnimatedList = (props) => (
  <AnimatedElement type="list" as="ul" {...props} />
);

export const AnimatedListItem = (props) => (
  <AnimatedElement type="listItem" as="li" {...props} />
);

export const AnimatedModal = (props) => (
  <AnimatedElement type="modal" as="div" {...props} />
);

export const AnimatedNotification = (props) => (
  <AnimatedElement type="notification" as="div" {...props} />
);

export const AnimatedImage = (props) => (
  <AnimatedElement type="image" as="img" {...props} />
);

export const AnimatedText = (props) => (
  <AnimatedElement type="text" as="p" {...props} />
);

export default AnimatedElement; 