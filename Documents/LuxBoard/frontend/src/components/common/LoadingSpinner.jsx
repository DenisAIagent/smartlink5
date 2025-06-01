import React from 'react';
import { Loader } from 'react-feather';

const LoadingSpinner = ({
  size = 'md',
  variant = 'primary',
  fullScreen = false,
  text = 'Chargement...'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <Loader
        className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]}`}
      />
      {text && (
        <p className={`mt-2 text-sm ${variantClasses[variant]}`}>{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner; 