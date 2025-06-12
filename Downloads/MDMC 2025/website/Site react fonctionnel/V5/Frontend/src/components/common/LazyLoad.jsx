import React, { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import ErrorBoundary from './ErrorBoundary';

export const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      width: '100%',
    }}
  >
    <CircularProgress />
  </Box>
);

export const LazyLoad = ({ children, fallback = <LoadingFallback /> }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyLoad; 