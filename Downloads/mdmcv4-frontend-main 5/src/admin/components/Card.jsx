import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  title,
  subtitle,
  icon,
  variant = 'default',
  className = '',
  onClick,
  isLoading = false,
  ...props
}) => {
  const baseStyles = 'bg-[#232326] rounded-xl shadow-lg overflow-hidden';
  
  const variants = {
    default: 'border border-[#2A2A2E]',
    elevated: 'shadow-xl hover:shadow-2xl transition-shadow duration-300',
    interactive: 'cursor-pointer hover:bg-[#2A2A2E] transition-colors duration-200',
    loading: 'animate-pulse',
  };

  const content = (
    <>
      {(title || subtitle || icon) && (
        <div className="p-4 border-b border-[#2A2A2E]">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-semibold text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </>
  );

  if (isLoading) {
    return (
      <div className={`${baseStyles} ${variants.loading} ${className}`} {...props}>
        <div className="p-4">
          <div className="h-4 bg-[#2A2A2E] rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-[#2A2A2E] rounded"></div>
            <div className="h-4 bg-[#2A2A2E] rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`${baseStyles} ${variants.interactive} ${className}`}
        {...props}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {content}
    </div>
  );
};

export default Card; 