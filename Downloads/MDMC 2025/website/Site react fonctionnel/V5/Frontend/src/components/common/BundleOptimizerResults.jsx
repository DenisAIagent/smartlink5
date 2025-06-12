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
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Update as UpdateIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const BundleOptimizerResults = memo(
  ({ metrics, dependencies, recommendations, isAnalyzing, onRefresh }) => {
    const theme = useTheme();

    if (!metrics && !isAnalyzing) {
      return (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center">
              Aucune analyse de bundle n'a été effectuée
            </Typography>
          </CardContent>
        </Card>
      );
    }

    if (isAnalyzing) {
      return (
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <LinearProgress style={{ flexGrow: 1, marginRight: 16 }} />
              <Typography variant="body2">Analyse en cours...</Typography>
            </Box>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Résultats de l'optimisation du bundle</Typography>
            <Tooltip title="Rafraîchir">
              <IconButton onClick={onRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={3}>
            {/* Métriques du bundle */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Métriques du bundle
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Taille totale</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatSize(metrics.bundleSize)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Nombre de chunks</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {Object.keys(metrics.chunkSizes).length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Chunks */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Chunks
                  </Typography>
                  <List>
                    {Object.entries(metrics.chunkSizes).map(([name, size]) => (
                      <ListItem key={name}>
                        <ListItemIcon>
                          <SpeedIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={name}
                          secondary={`${formatSize(size)} - ${metrics.loadTimes[name].toFixed(2)}ms`}
                        />
                        {size > 500 * 1024 && (
                          <Chip
                            icon={<WarningIcon />}
                            label="Trop volumineux"
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

            {/* Recommandations de dépendances */}
            {dependencies && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Recommandations de dépendances
                    </Typography>
                    <List>
                      {dependencies.updates.map((update) => (
                        <ListItem key={update.name}>
                          <ListItemIcon>
                            <UpdateIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={update.name}
                            secondary={`Mettre à jour de ${update.current} vers ${update.recommended}`}
                          />
                        </ListItem>
                      ))}
                      {dependencies.removals.map((removal) => (
                        <ListItem key={removal.name}>
                          <ListItemIcon>
                            <DeleteIcon color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary={removal.name}
                            secondary={removal.reason}
                          />
                        </ListItem>
                      ))}
                      {dependencies.additions.map((addition) => (
                        <ListItem key={addition.name}>
                          <ListItemIcon>
                            <AddIcon color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary={addition.name}
                            secondary={`${addition.reason} (${addition.version})`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Recommandations d'optimisation */}
            {recommendations && recommendations.length > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Recommandations d'optimisation
                    </Typography>
                    <List>
                      {recommendations.map((rec, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <WarningIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary={rec.chunk}
                            secondary={`${rec.type === 'size' ? 'Taille' : 'Performance'}: ${
                              rec.type === 'size' ? rec.currentSize : rec.currentTime
                            } - ${rec.recommendation}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  }
);

// Fonction utilitaire pour formater la taille
const formatSize = (bytes) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

BundleOptimizerResults.propTypes = {
  metrics: PropTypes.shape({
    bundleSize: PropTypes.number.isRequired,
    chunkSizes: PropTypes.object.isRequired,
    loadTimes: PropTypes.object.isRequired,
  }),
  dependencies: PropTypes.shape({
    updates: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        current: PropTypes.string.isRequired,
        recommended: PropTypes.string.isRequired,
      })
    ),
    removals: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        reason: PropTypes.string.isRequired,
      })
    ),
    additions: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        reason: PropTypes.string.isRequired,
        version: PropTypes.string.isRequired,
      })
    ),
  }),
  recommendations: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['size', 'performance']).isRequired,
      chunk: PropTypes.string.isRequired,
      currentSize: PropTypes.string,
      currentTime: PropTypes.string,
      recommendation: PropTypes.string.isRequired,
    })
  ),
  isAnalyzing: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

BundleOptimizerResults.displayName = 'BundleOptimizerResults';

export default BundleOptimizerResults; 