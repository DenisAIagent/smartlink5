import React, { memo, useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import { useMonitoring } from '../../hooks/useMonitoring';

const MemoryTest = memo(() => {
  const theme = useTheme();
  const { recordMetric } = useMonitoring();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [memorySnapshots, setMemorySnapshots] = useState([]);

  const takeMemorySnapshot = useCallback(() => {
    if (window.performance && window.performance.memory) {
      return {
        timestamp: Date.now(),
        usedJSHeapSize: window.performance.memory.usedJSHeapSize,
        totalJSHeapSize: window.performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }, []);

  const runMemoryTest = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    const newResults = [];
    const snapshots = [];

    // Test de fuite de mémoire
    const initialSnapshot = takeMemorySnapshot();
    snapshots.push(initialSnapshot);

    // Création d'objets pour tester la mémoire
    const objects = [];
    for (let i = 0; i < 1000; i++) {
      objects.push(new Array(1000).fill('test'));
      if (i % 100 === 0) {
        setProgress(i / 10);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const afterCreationSnapshot = takeMemorySnapshot();
    snapshots.push(afterCreationSnapshot);

    // Suppression des objets
    objects.length = 0;
    await new Promise(resolve => setTimeout(resolve, 1000));

    const afterCleanupSnapshot = takeMemorySnapshot();
    snapshots.push(afterCleanupSnapshot);

    // Analyse des résultats
    const memoryGrowth = afterCreationSnapshot.usedJSHeapSize - initialSnapshot.usedJSHeapSize;
    const memoryCleanup = afterCreationSnapshot.usedJSHeapSize - afterCleanupSnapshot.usedJSHeapSize;
    const cleanupPercentage = (memoryCleanup / memoryGrowth) * 100;

    newResults.push({
      name: 'Fuite de mémoire',
      metric: 'Croissance de la mémoire',
      value: memoryGrowth / 1024 / 1024,
      unit: 'MB',
      status: cleanupPercentage > 90 ? 'success' : cleanupPercentage > 70 ? 'warning' : 'error'
    });

    newResults.push({
      name: 'Nettoyage mémoire',
      metric: 'Pourcentage de nettoyage',
      value: cleanupPercentage,
      unit: '%',
      status: cleanupPercentage > 90 ? 'success' : cleanupPercentage > 70 ? 'warning' : 'error'
    });

    // Test de fragmentation
    const fragmentation = (afterCleanupSnapshot.totalJSHeapSize - afterCleanupSnapshot.usedJSHeapSize) /
      afterCleanupSnapshot.totalJSHeapSize * 100;

    newResults.push({
      name: 'Fragmentation',
      metric: 'Pourcentage de fragmentation',
      value: fragmentation,
      unit: '%',
      status: fragmentation < 20 ? 'success' : fragmentation < 40 ? 'warning' : 'error'
    });

    // Test de limite de mémoire
    const memoryUsagePercentage = (afterCreationSnapshot.usedJSHeapSize / afterCreationSnapshot.jsHeapSizeLimit) * 100;

    newResults.push({
      name: 'Utilisation mémoire',
      metric: 'Pourcentage d\'utilisation',
      value: memoryUsagePercentage,
      unit: '%',
      status: memoryUsagePercentage < 50 ? 'success' : memoryUsagePercentage < 80 ? 'warning' : 'error'
    });

    // Enregistrement des métriques
    newResults.forEach(result => {
      recordMetric(result.name, result.value, {
        metric: result.metric,
        unit: result.unit,
        status: result.status
      });
    });

    setMemorySnapshots(snapshots);
    setResults(newResults);
    setProgress(100);
    setIsRunning(false);
  }, [recordMetric, takeMemorySnapshot]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.text.primary;
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        bgcolor: theme.palette.background.paper
      }}
    >
      <Typography variant="h6" gutterBottom>
        Tests de Mémoire
      </Typography>

      {isRunning && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}

      <Button
        variant="contained"
        onClick={runMemoryTest}
        disabled={isRunning}
        sx={{ mb: 2 }}
      >
        {isRunning ? 'Test en cours...' : 'Lancer les tests'}
      </Button>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Test</TableCell>
              <TableCell>Métrique</TableCell>
              <TableCell align="right">Valeur</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={index}>
                <TableCell>{result.name}</TableCell>
                <TableCell>{result.metric}</TableCell>
                <TableCell align="right">
                  {result.value.toFixed(2)} {result.unit}
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: getStatusColor(result.status)
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {memorySnapshots.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Snapshots de mémoire
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell align="right">Mémoire utilisée</TableCell>
                  <TableCell align="right">Mémoire totale</TableCell>
                  <TableCell align="right">Limite</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {memorySnapshots.map((snapshot, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(snapshot.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell align="right">
                      {(snapshot.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB
                    </TableCell>
                    <TableCell align="right">
                      {(snapshot.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB
                    </TableCell>
                    <TableCell align="right">
                      {(snapshot.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Paper>
  );
});

MemoryTest.displayName = 'MemoryTest';

export default MemoryTest; 