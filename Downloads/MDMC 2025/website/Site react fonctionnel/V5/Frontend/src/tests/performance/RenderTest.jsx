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

const RenderTest = memo(() => {
  const theme = useTheme();
  const { recordMetric } = useMonitoring();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [renderMetrics, setRenderMetrics] = useState(null);

  const measureRender = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    const newResults = [];
    const metrics = {
      fcp: 0,
      lcp: 0,
      tti: 0,
      tbt: 0,
      cls: 0
    };

    // First Contentful Paint (FCP)
    const fcpStart = performance.now();
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        const fcpEnd = performance.now();
        metrics.fcp = fcpEnd - fcpStart;
        setProgress(20);
        resolve();
      });
    });

    // Largest Contentful Paint (LCP)
    const lcpStart = performance.now();
    await new Promise(resolve => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.lcp = lastEntry.startTime;
        observer.disconnect();
        setProgress(40);
        resolve();
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    });

    // Time to Interactive (TTI)
    const ttiStart = performance.now();
    await new Promise(resolve => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.tti = lastEntry.startTime;
        observer.disconnect();
        setProgress(60);
        resolve();
      });
      observer.observe({ entryTypes: ['longtask'] });
    });

    // Total Blocking Time (TBT)
    const tbtStart = performance.now();
    await new Promise(resolve => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        metrics.tbt = entries.reduce((total, entry) => total + entry.duration, 0);
        observer.disconnect();
        setProgress(80);
        resolve();
      });
      observer.observe({ entryTypes: ['longtask'] });
    });

    // Cumulative Layout Shift (CLS)
    const clsStart = performance.now();
    await new Promise(resolve => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        metrics.cls = entries.reduce((total, entry) => total + entry.value, 0);
        observer.disconnect();
        setProgress(100);
        resolve();
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    });

    // Résultats
    newResults.push({
      name: 'First Contentful Paint',
      metric: 'FCP',
      value: metrics.fcp,
      unit: 'ms',
      status: metrics.fcp < 100 ? 'success' : metrics.fcp < 200 ? 'warning' : 'error'
    });

    newResults.push({
      name: 'Largest Contentful Paint',
      metric: 'LCP',
      value: metrics.lcp,
      unit: 'ms',
      status: metrics.lcp < 2500 ? 'success' : metrics.lcp < 4000 ? 'warning' : 'error'
    });

    newResults.push({
      name: 'Time to Interactive',
      metric: 'TTI',
      value: metrics.tti,
      unit: 'ms',
      status: metrics.tti < 3500 ? 'success' : metrics.tti < 5000 ? 'warning' : 'error'
    });

    newResults.push({
      name: 'Total Blocking Time',
      metric: 'TBT',
      value: metrics.tbt,
      unit: 'ms',
      status: metrics.tbt < 300 ? 'success' : metrics.tbt < 600 ? 'warning' : 'error'
    });

    newResults.push({
      name: 'Cumulative Layout Shift',
      metric: 'CLS',
      value: metrics.cls,
      unit: 'score',
      status: metrics.cls < 0.1 ? 'success' : metrics.cls < 0.25 ? 'warning' : 'error'
    });

    // Enregistrement des métriques
    newResults.forEach(result => {
      recordMetric(result.name, result.value, {
        metric: result.metric,
        unit: result.unit,
        status: result.status
      });
    });

    setRenderMetrics(metrics);
    setResults(newResults);
    setIsRunning(false);
  }, [recordMetric]);

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
        Tests de Rendu
      </Typography>

      {isRunning && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}

      <Button
        variant="contained"
        onClick={measureRender}
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

      {renderMetrics && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Détails des métriques
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                First Contentful Paint (FCP)
              </Typography>
              <Typography>
                Temps écoulé entre le début du chargement de la page et l'affichage du premier élément de contenu.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Largest Contentful Paint (LCP)
              </Typography>
              <Typography>
                Temps écoulé entre le début du chargement de la page et l'affichage du plus grand élément de contenu.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Time to Interactive (TTI)
              </Typography>
              <Typography>
                Temps écoulé entre le début du chargement de la page et le moment où la page devient interactive.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Total Blocking Time (TBT)
              </Typography>
              <Typography>
                Temps total pendant lequel le thread principal a été bloqué, empêchant l'interaction avec la page.
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Cumulative Layout Shift (CLS)
              </Typography>
              <Typography>
                Mesure de la stabilité visuelle de la page, calculée en fonction des déplacements inattendus des éléments.
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
});

RenderTest.displayName = 'RenderTest';

export default RenderTest; 