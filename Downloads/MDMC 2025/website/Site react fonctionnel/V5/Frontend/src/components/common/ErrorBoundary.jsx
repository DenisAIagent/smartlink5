import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log l'erreur à un service de monitoring
    if (process.env.NODE_ENV === 'production') {
      console.error('Error caught by boundary:', error, errorInfo);
      // TODO: Implémenter l'envoi à un service de monitoring
    }
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Oups ! Une erreur est survenue
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Nous nous excusons pour ce désagrément. Notre équipe a été notifiée.
          </Typography>
          {process.env.NODE_ENV === 'development' && (
            <Box
              component="pre"
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: 'grey.100',
                borderRadius: 1,
                overflow: 'auto',
                maxWidth: '100%',
              }}
            >
              <Typography variant="body2" component="code">
                {error?.toString()}
                {'\n'}
                {errorInfo?.componentStack}
              </Typography>
            </Box>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            sx={{ mt: 3 }}
          >
            Recharger la page
          </Button>
        </Box>
      );
    }

    return children;
  }
}

export default ErrorBoundary; 