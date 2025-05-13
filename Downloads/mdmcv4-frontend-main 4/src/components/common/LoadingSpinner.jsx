import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
  gap: theme.spacing(2),
}));

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
  animation: 'rotate 1s linear infinite',
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round',
  },
}));

const LoadingSpinner = ({ message = 'Chargement...' }) => {
  return (
    <LoadingContainer>
      <StyledCircularProgress size={40} thickness={4} />
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          animation: 'fadeIn 0.5s ease-in-out',
        }}
      >
        {message}
      </Typography>
    </LoadingContainer>
  );
};

export default LoadingSpinner; 