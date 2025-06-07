import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import logger from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    logger.error('Erreur React capturée', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { t } = this.props;

    if (hasError) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          p={3}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" color="error" gutterBottom>
              {t('error.boundary.title')}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {t('error.boundary.message')}
            </Typography>

            {process.env.NODE_ENV === 'development' && (
              <Box
                component="pre"
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  overflow: 'auto',
                  textAlign: 'left'
                }}
              >
                <Typography variant="caption" component="div">
                  {error && error.toString()}
                </Typography>
                <Typography variant="caption" component="div">
                  {errorInfo && errorInfo.componentStack}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReset}
              sx={{ mt: 3 }}
            >
              {t('error.boundary.reset')}
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

// HOC pour ajouter la traduction
const withTranslation = (WrappedComponent) => {
  return function WithTranslationComponent(props) {
    const { t } = useTranslation();
    return <WrappedComponent {...props} t={t} />;
  };
};

export default withTranslation(ErrorBoundary); 