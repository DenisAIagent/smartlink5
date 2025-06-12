import React, { memo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { usePerformance } from '../../hooks/usePerformance';
import { useMedia } from '../../hooks/useMedia';

const OptimizedComponent = forwardRef(({
  children,
  component = 'div',
  role,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-live': ariaLive,
  className,
  style,
  sx,
  dataTestId,
  onFocus,
  onBlur,
  onClick,
  ...props
}, ref) => {
  const { measureRender } = usePerformance('OptimizedComponent');
  const { isReducedMotion } = useMedia();

  // Mesure du temps de rendu
  const endMeasure = measureRender();

  // Gestion des animations réduites
  const reducedMotionStyle = isReducedMotion ? {
    transition: 'none',
    animation: 'none',
  } : {};

  // Gestion des événements avec gestion des erreurs
  const handleEvent = (event, handler) => {
    try {
      handler?.(event);
    } catch (error) {
      console.error('Error in event handler:', error);
      // TODO: Implémenter la gestion des erreurs
    }
  };

  return (
    <Box
      ref={ref}
      component={component}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-live={ariaLive}
      className={className}
      style={{
        ...style,
        ...reducedMotionStyle,
      }}
      sx={sx}
      data-testid={dataTestId}
      onFocus={(e) => handleEvent(e, onFocus)}
      onBlur={(e) => handleEvent(e, onBlur)}
      onClick={(e) => handleEvent(e, onClick)}
      {...props}
    >
      {children}
    </Box>
  );
});

OptimizedComponent.propTypes = {
  children: PropTypes.node,
  component: PropTypes.elementType,
  role: PropTypes.string,
  'aria-label': PropTypes.string,
  'aria-describedby': PropTypes.string,
  'aria-live': PropTypes.oneOf(['off', 'polite', 'assertive']),
  className: PropTypes.string,
  style: PropTypes.object,
  sx: PropTypes.object,
  dataTestId: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onClick: PropTypes.func,
};

OptimizedComponent.displayName = 'OptimizedComponent';

// Utilisation de memo pour éviter les re-rendus inutiles
export default memo(OptimizedComponent, (prevProps, nextProps) => {
  // Comparaison personnalisée des props
  const keysToCompare = ['children', 'className', 'style', 'sx'];
  return keysToCompare.every(key => prevProps[key] === nextProps[key]);
}); 