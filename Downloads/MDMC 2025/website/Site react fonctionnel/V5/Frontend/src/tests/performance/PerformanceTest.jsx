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

const PerformanceTest = memo(() => {
  const theme = useTheme();
  const { recordMetric } = useMonitoring();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);

  const runPerformanceTest = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    const newResults = [];

    // Test de rendu
    const renderStart = performance.now();
    const renderResult = await testRender();
    const renderTime = performance.now() - renderStart;
    newResults.push({
      name: 'Rendu',
      metric: 'First Contentful Paint',
      value: renderTime,
      unit: 'ms',
      status: renderTime < 100 ? 'success' : renderTime < 200 ? 'warning' : 'error'
    });

    setProgress(20);

    // Test de mémoire
    const memoryStart = performance.now();
    const memoryResult = await testMemory();
    const memoryTime = performance.now() - memoryStart;
    newResults.push({
      name: 'Mémoire',
      metric: 'Utilisation de la mémoire',
      value: memoryResult.usedJSHeapSize / 1024 / 1024,
      unit: 'MB',
      status: memoryResult.usedJSHeapSize < 50 * 1024 * 1024 ? 'success' : 'warning'
    });

    setProgress(40);

    // Test de charge
    const loadStart = performance.now();
    const loadResult = await testLoad();
    const loadTime = performance.now() - loadStart;
    newResults.push({
      name: 'Charge',
      metric: 'Temps de chargement',
      value: loadTime,
      unit: 'ms',
      status: loadTime < 1000 ? 'success' : loadTime < 2000 ? 'warning' : 'error'
    });

    setProgress(60);

    // Test de bundle
    const bundleStart = performance.now();
    const bundleResult = await testBundle();
    const bundleTime = performance.now() - bundleStart;
    newResults.push({
      name: 'Bundle',
      metric: 'Taille du bundle',
      value: bundleResult.size / 1024,
      unit: 'KB',
      status: bundleResult.size < 200 * 1024 ? 'success' : bundleResult.size < 500 * 1024 ? 'warning' : 'error'
    });

    setProgress(80);

    // Enregistrement des métriques
    newResults.forEach(result => {
      recordMetric(result.name, result.value, {
        metric: result.metric,
        unit: result.unit,
        status: result.status
      });
    });

    setResults(newResults);
    setProgress(100);
    setIsRunning(false);
  }, [recordMetric]);

  const testRender = async () => {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        const elements = document.querySelectorAll('*');
        resolve(elements.length);
      });
    });
  };

  const testMemory = async () => {
    return new Promise(resolve => {
      if (window.performance && window.performance.memory) {
        resolve(window.performance.memory);
      } else {
        resolve({ usedJSHeapSize: 0 });
      }
    });
  };

  const testLoad = async () => {
    return new Promise(resolve => {
      const start = performance.now();
      const img = new Image();
      img.onload = () => {
        resolve(performance.now() - start);
      };
      img.src = '/test-image.jpg';
    });
  };

  const testBundle = async () => {
    return new Promise(resolve => {
      const scripts = document.querySelectorAll('script');
      const totalSize = Array.from(scripts).reduce((size, script) => {
        return size + (script.src ? 0 : script.textContent.length);
      }, 0);
      resolve({ size: totalSize });
    });
  };

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
        Tests de Performance
      </Typography>

      {isRunning && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}

      <Button
        variant="contained"
        onClick={runPerformanceTest}
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
    </Paper>
  );
});

PerformanceTest.displayName = 'PerformanceTest';

export default PerformanceTest; 