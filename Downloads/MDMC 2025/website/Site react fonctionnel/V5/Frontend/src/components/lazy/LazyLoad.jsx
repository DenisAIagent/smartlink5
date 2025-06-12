import React, { Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// Composant de chargement par défaut
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      width: '100%'
    }}
  >
    <CircularProgress />
    <Typography sx={{ mt: 2 }}>Chargement en cours...</Typography>
  </Box>
);

// Composant de gestion d'erreur
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      width: '100%',
      p: 3,
      textAlign: 'center'
    }}
  >
    <Typography color="error" gutterBottom>
      Une erreur est survenue lors du chargement
    </Typography>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {error.message}
    </Typography>
    <button
      onClick={resetErrorBoundary}
      style={{
        padding: '8px 16px',
        marginTop: '16px',
        backgroundColor: '#1976d2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Réessayer
    </button>
  </Box>
);

// Composant de chargement paresseux
const LazyLoad = ({ children, fallback = <LoadingFallback /> }) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export { LazyLoad, LoadingFallback, ErrorFallback }; 