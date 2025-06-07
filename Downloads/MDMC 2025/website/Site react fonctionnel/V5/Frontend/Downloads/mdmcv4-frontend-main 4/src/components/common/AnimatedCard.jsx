import React from 'react';
import { Card, CardContent, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: theme.palette.primary.main,
    transform: 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform 0.3s ease',
  },
  '&:hover::after': {
    transform: 'scaleX(1)',
  },
}));

const CardIcon = styled(Box)(({ theme }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(244, 67, 54, 0.1) 100%)',
  color: theme.palette.primary.main,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: '0 0 20px rgba(244, 67, 54, 0.3)',
  },
}));

const AnimatedCard = ({ icon, title, children, onClick, ...props }) => {
  return (
    <StyledCard
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        animation: 'fadeIn 0.5s ease-out',
      }}
      {...props}
    >
      <CardContent>
        {icon && <CardIcon>{icon}</CardIcon>}
        {title && (
          <Box
            sx={{
              typography: 'h6',
              mb: 2,
              background: 'linear-gradient(135deg, #ffffff, #b0b0b0)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </Box>
        )}
        {children}
      </CardContent>
    </StyledCard>
  );
};

export default AnimatedCard; 