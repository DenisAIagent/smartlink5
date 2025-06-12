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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  NetworkCheck as NetworkIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const MonitoringDashboard = memo(
  ({
    performanceMetrics,
    errorMetrics,
    userActionMetrics,
    networkMetrics,
    isMonitoring,
    onRefresh,
  }) => {
    const theme = useTheme();

    if (!performanceMetrics && !isMonitoring) {
      return (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center">
              Aucune donnée de monitoring disponible
            </Typography>
          </CardContent>
        </Card>
      );
    }

    if (isMonitoring) {
      return (
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <LinearProgress style={{ flexGrow: 1, marginRight: 16 }} />
              <Typography variant="body2">Monitoring en cours...</Typography>
            </Box>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Tableau de bord de monitoring</Typography>
            <Tooltip title="Rafraîchir">
              <IconButton onClick={onRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={3}>
            {/* Métriques de performance */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <SpeedIcon color="primary" style={{ marginRight: 8 }} />
                    <Typography variant="subtitle1">Performance</Typography>
                  </Box>
                  <List>
                    {Object.entries(performanceMetrics).map(([type, metrics]) => (
                      <ListItem key={type}>
                        <ListItemText
                          primary={type}
                          secondary={`Moyenne: ${metrics.average.toFixed(2)}ms | Min: ${metrics.min.toFixed(
                            2
                          )}ms | Max: ${metrics.max.toFixed(2)}ms`}
                        />
                        {metrics.average > 1000 && (
                          <Chip
                            icon={<WarningIcon />}
                            label="Performance critique"
                            color="warning"
                            size="small"
                          />
                        )}
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Métriques d'erreurs */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <ErrorIcon color="error" style={{ marginRight: 8 }} />
                    <Typography variant="subtitle1">Erreurs</Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Total</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {errorMetrics.total}
                      </Typography>
                    </Box>
                    <Divider />
                    <Typography variant="subtitle2" gutterBottom>
                      Par type
                    </Typography>
                    {Object.entries(errorMetrics.byType).map(([type, count]) => (
                      <Box key={type} display="flex" justifyContent="space-between">
                        <Typography variant="body2">{type}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Métriques d'actions utilisateur */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PersonIcon color="primary" style={{ marginRight: 8 }} />
                    <Typography variant="subtitle1">Actions utilisateur</Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Total</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {userActionMetrics.total}
                      </Typography>
                    </Box>
                    <Divider />
                    <Typography variant="subtitle2" gutterBottom>
                      Par type
                    </Typography>
                    {Object.entries(userActionMetrics.byType).map(([type, count]) => (
                      <Box key={type} display="flex" justifyContent="space-between">
                        <Typography variant="body2">{type}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Métriques réseau */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <NetworkIcon color="primary" style={{ marginRight: 8 }} />
                    <Typography variant="subtitle1">Réseau</Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Total des requêtes</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {networkMetrics.total}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Temps moyen</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {networkMetrics.averageDuration.toFixed(2)}ms
                      </Typography>
                    </Box>
                    <Divider />
                    <Typography variant="subtitle2" gutterBottom>
                      Par statut
                    </Typography>
                    {Object.entries(networkMetrics.byStatus).map(([status, count]) => (
                      <Box key={status} display="flex" justifyContent="space-between">
                        <Typography variant="body2">{status}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
);

MonitoringDashboard.propTypes = {
  performanceMetrics: PropTypes.object,
  errorMetrics: PropTypes.shape({
    total: PropTypes.number.isRequired,
    byType: PropTypes.object.isRequired,
    bySource: PropTypes.object.isRequired,
    recent: PropTypes.array.isRequired,
  }),
  userActionMetrics: PropTypes.shape({
    total: PropTypes.number.isRequired,
    byType: PropTypes.object.isRequired,
    byTarget: PropTypes.object.isRequired,
    recent: PropTypes.array.isRequired,
  }),
  networkMetrics: PropTypes.shape({
    total: PropTypes.number.isRequired,
    byStatus: PropTypes.object.isRequired,
    byMethod: PropTypes.object.isRequired,
    averageDuration: PropTypes.number.isRequired,
    recent: PropTypes.array.isRequired,
  }),
  isMonitoring: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

MonitoringDashboard.displayName = 'MonitoringDashboard';

export default MonitoringDashboard; 