import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme, variant }) => ({
  position: 'relative',
  overflow: 'hidden',
  padding: '0.85rem 1.5rem',
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  ...(variant === 'contained' && {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: '0 5px 15px rgba(244, 67, 54, 0.3)',
    '&:hover': {
      background: theme.palette.primary.dark,
      transform: 'translateY(-2px) scale(1.05)',
      boxShadow: '0 8px 25px rgba(244, 67, 54, 0.4)',
    },
  }),
  ...(variant === 'outlined' && {
    border: `2px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    '&:hover': {
      background: 'rgba(244, 67, 54, 0.1)',
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 15px rgba(244, 67, 54, 0.2)',
    },
  }),
  ...(variant === 'text' && {
    color: theme.palette.primary.main,
    '&:hover': {
      background: 'rgba(244, 67, 54, 0.1)',
      transform: 'translateY(-2px)',
    },
  }),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 50%)',
    transform: 'translateY(-100%)',
    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  '&:hover::before': {
    transform: 'translateY(0)',
  },
  '&:disabled': {
    background: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
    transform: 'none',
    boxShadow: 'none',
  },
}));

const AnimatedButton = ({
  children,
  variant = 'contained',
  startIcon,
  endIcon,
  loading = false,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      startIcon={startIcon}
      endIcon={endIcon}
      disabled={loading || props.disabled}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default AnimatedButton; 