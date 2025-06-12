import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useImage } from '../../hooks/useResource';
import { usePerformance } from '../../hooks/usePerformance';
import OptimizedComponent from './OptimizedComponent';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  lazy = true,
  quality = 90,
  format = 'webp',
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  className,
  style,
  ...props
}) => {
  const { measureRender } = usePerformance('OptimizedImage');
  const endMeasure = measureRender();

  const {
    elementRef,
    loadResource,
    isLoaded,
  } = useImage({
    url: src,
    priority,
    lazy,
    onLoad,
    onError,
  });

  // Génération des sources pour différentes tailles d'écran
  const generateSrcSet = () => {
    const sizes = [320, 640, 960, 1280, 1920];
    return sizes
      .map(size => `${src}?w=${size}&q=${quality}&fmt=${format} ${size}w`)
      .join(', ');
  };

  // Génération des sources pour différents formats
  const generateSources = () => {
    const formats = ['webp', 'avif', 'jpeg'];
    return formats.map(format => ({
      srcSet: generateSrcSet(),
      type: `image/${format}`,
    }));
  };

  return (
    <OptimizedComponent
      component="picture"
      ref={elementRef}
      className={className}
      style={{
        display: 'block',
        position: 'relative',
        ...style,
      }}
      {...props}
    >
      {generateSources().map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          type={source.type}
        />
      ))}
      
      <Box
        component="img"
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
          transition: 'opacity 0.3s ease-in-out',
          opacity: isLoaded ? 1 : 0,
        }}
        onLoad={loadResource}
      />

      {placeholder === 'blur' && blurDataURL && !isLoaded && (
        <Box
          component="img"
          src={blurDataURL}
          alt={`${alt} (placeholder)`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
            transition: 'opacity 0.3s ease-in-out',
            opacity: isLoaded ? 0 : 1,
          }}
        />
      )}
    </OptimizedComponent>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  priority: PropTypes.bool,
  lazy: PropTypes.bool,
  quality: PropTypes.number,
  format: PropTypes.oneOf(['webp', 'avif', 'jpeg']),
  placeholder: PropTypes.oneOf(['blur', 'none']),
  blurDataURL: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default memo(OptimizedImage); 