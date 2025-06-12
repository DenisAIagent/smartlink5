import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const StyledButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&.Mui-disabled': {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
}));

const MotionButton = motion(StyledButton);

const AccessibleButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  startIcon,
  endIcon,
  ariaLabel,
  ariaDescribedby,
  className,
  ...props
}) => {
  const buttonProps = {
    onClick,
    disabled: disabled || loading,
    variant,
    color,
    size,
    fullWidth,
    startIcon,
    endIcon,
    className,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    'aria-busy': loading,
    ...props,
  };

  return (
    <MotionButton
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      {...buttonProps}
    >
      {loading ? (
        <span className="loading-spinner" aria-hidden="true">
          Chargement...
        </span>
      ) : (
        children
      )}
    </MotionButton>
  );
};

export default AccessibleButton; 