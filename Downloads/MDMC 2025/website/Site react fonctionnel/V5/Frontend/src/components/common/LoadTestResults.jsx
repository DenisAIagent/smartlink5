import React, { memo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  Speed as SpeedIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const LoadTestResults = memo(
  ({ results, metrics, isRunning, onRefresh }) => {
    const theme = useTheme();

    if (!results && !isRunning) {
      return (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center">
              Aucun test de charge n'a été exécuté
            </Typography>
          </CardContent>
        </Card>
      );
    }

    if (isRunning) {
      return (
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <LinearProgress style={{ flexGrow: 1, marginRight: 16 }} />
              <Typography variant="body2">Test en cours...</Typography>
            </Box>
          </CardContent>
        </Card>
      );
    }

    const {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      minResponseTime,
      maxResponseTime,
      errorRate,
    } = results.summary;

    const webVitals = metrics || {};

    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Résultats des tests de charge</Typography>
            <Tooltip title="Rafraîchir">
              <IconButton onClick={onRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={3}>
            {/* Métriques principales */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Métriques principales
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Requêtes totales</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {totalRequests}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Requêtes réussies</Typography>
                      <Typography variant="body2" color="success.main" fontWeight="bold">
                        {successfulRequests}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Requêtes échouées</Typography>
                      <Typography variant="body2" color="error.main" fontWeight="bold">
                        {failedRequests}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Taux d'erreur</Typography>
                      <Typography
                        variant="body2"
                        color={errorRate > 5 ? 'error.main' : 'success.main'}
                        fontWeight="bold"
                      >
                        {errorRate.toFixed(2)}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Temps de réponse */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Temps de réponse
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Moyen</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {averageResponseTime.toFixed(2)}ms
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Minimum</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {minResponseTime.toFixed(2)}ms
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Maximum</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {maxResponseTime.toFixed(2)}ms
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Core Web Vitals */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Core Web Vitals
                  </Typography>
                  <Timeline>
                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot color={webVitals.lcp <= 2500 ? 'success' : 'error'}>
                          <SpeedIcon />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">LCP (Largest Contentful Paint)</Typography>
                        <Typography variant="body2">
                          {webVitals.lcp ? `${webVitals.lcp.toFixed(2)}ms` : 'Non mesuré'}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot color={webVitals.fid <= 100 ? 'success' : 'error'}>
                          <SpeedIcon />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">FID (First Input Delay)</Typography>
                        <Typography variant="body2">
                          {webVitals.fid ? `${webVitals.fid.toFixed(2)}ms` : 'Non mesuré'}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                      <TimelineSeparator>
                        <TimelineDot color={webVitals.cls <= 0.1 ? 'success' : 'error'}>
                          <SpeedIcon />
                        </TimelineDot>
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">CLS (Cumulative Layout Shift)</Typography>
                        <Typography variant="body2">
                          {webVitals.cls ? webVitals.cls.toFixed(3) : 'Non mesuré'}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  </Timeline>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
);

LoadTestResults.propTypes = {
  results: PropTypes.shape({
    summary: PropTypes.shape({
      totalRequests: PropTypes.number.isRequired,
      successfulRequests: PropTypes.number.isRequired,
      failedRequests: PropTypes.number.isRequired,
      averageResponseTime: PropTypes.number.isRequired,
      minResponseTime: PropTypes.number.isRequired,
      maxResponseTime: PropTypes.number.isRequired,
      errorRate: PropTypes.number.isRequired,
    }),
  }),
  metrics: PropTypes.shape({
    lcp: PropTypes.number,
    fid: PropTypes.number,
    cls: PropTypes.number,
  }),
  isRunning: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

LoadTestResults.displayName = 'LoadTestResults';

export default LoadTestResults; 