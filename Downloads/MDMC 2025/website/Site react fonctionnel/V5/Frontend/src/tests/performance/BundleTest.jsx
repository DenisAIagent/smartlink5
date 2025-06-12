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

const BundleTest = memo(() => {
  const theme = useTheme();
  const { recordMetric } = useMonitoring();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [bundleAnalysis, setBundleAnalysis] = useState(null);

  const analyzeBundle = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    const newResults = [];

    // Analyse des scripts
    const scripts = document.querySelectorAll('script');
    const scriptAnalysis = Array.from(scripts).map(script => ({
      src: script.src,
      size: script.src ? 0 : script.textContent.length,
      type: script.type || 'text/javascript'
    }));

    setProgress(20);

    // Analyse des styles
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    const styleAnalysis = Array.from(styles).map(style => ({
      href: style.href,
      size: 0, // La taille réelle nécessiterait une requête HTTP
      type: 'text/css'
    }));

    setProgress(40);

    // Analyse des images
    const images = document.querySelectorAll('img');
    const imageAnalysis = Array.from(images).map(img => ({
      src: img.src,
      size: 0, // La taille réelle nécessiterait une requête HTTP
      type: 'image'
    }));

    setProgress(60);

    // Calcul des totaux
    const totalScriptSize = scriptAnalysis.reduce((sum, script) => sum + script.size, 0);
    const totalStyleSize = styleAnalysis.reduce((sum, style) => sum + style.size, 0);
    const totalImageSize = imageAnalysis.reduce((sum, img) => sum + img.size, 0);
    const totalSize = totalScriptSize + totalStyleSize + totalImageSize;

    // Analyse des dépendances
    const dependencies = new Set();
    scriptAnalysis.forEach(script => {
      if (script.src) {
        const url = new URL(script.src);
        dependencies.add(url.hostname);
      }
    });

    setProgress(80);

    // Résultats
    newResults.push({
      name: 'Taille totale',
      metric: 'Taille du bundle',
      value: totalSize / 1024,
      unit: 'KB',
      status: totalSize < 200 * 1024 ? 'success' : totalSize < 500 * 1024 ? 'warning' : 'error'
    });

    newResults.push({
      name: 'Scripts',
      metric: 'Nombre de scripts',
      value: scriptAnalysis.length,
      unit: 'fichiers',
      status: scriptAnalysis.length < 5 ? 'success' : scriptAnalysis.length < 10 ? 'warning' : 'error'
    });

    newResults.push({
      name: 'Styles',
      metric: 'Nombre de styles',
      value: styleAnalysis.length,
      unit: 'fichiers',
      status: styleAnalysis.length < 3 ? 'success' : styleAnalysis.length < 5 ? 'warning' : 'error'
    });

    newResults.push({
      name: 'Images',
      metric: 'Nombre d\'images',
      value: imageAnalysis.length,
      unit: 'fichiers',
      status: imageAnalysis.length < 10 ? 'success' : imageAnalysis.length < 20 ? 'warning' : 'error'
    });

    newResults.push({
      name: 'Dépendances',
      metric: 'Nombre de domaines',
      value: dependencies.size,
      unit: 'domaines',
      status: dependencies.size < 3 ? 'success' : dependencies.size < 5 ? 'warning' : 'error'
    });

    // Enregistrement des métriques
    newResults.forEach(result => {
      recordMetric(result.name, result.value, {
        metric: result.metric,
        unit: result.unit,
        status: result.status
      });
    });

    setBundleAnalysis({
      scripts: scriptAnalysis,
      styles: styleAnalysis,
      images: imageAnalysis,
      dependencies: Array.from(dependencies)
    });

    setResults(newResults);
    setProgress(100);
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
        Tests de Bundle
      </Typography>

      {isRunning && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}

      <Button
        variant="contained"
        onClick={analyzeBundle}
        disabled={isRunning}
        sx={{ mb: 2 }}
      >
        {isRunning ? 'Analyse en cours...' : 'Analyser le bundle'}
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

      {bundleAnalysis && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Analyse détaillée
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell align="right">Taille</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bundleAnalysis.scripts.map((script, index) => (
                  <TableRow key={`script-${index}`}>
                    <TableCell>Script</TableCell>
                    <TableCell>{script.src || 'inline'}</TableCell>
                    <TableCell align="right">
                      {(script.size / 1024).toFixed(2)} KB
                    </TableCell>
                  </TableRow>
                ))}
                {bundleAnalysis.styles.map((style, index) => (
                  <TableRow key={`style-${index}`}>
                    <TableCell>Style</TableCell>
                    <TableCell>{style.href}</TableCell>
                    <TableCell align="right">
                      {(style.size / 1024).toFixed(2)} KB
                    </TableCell>
                  </TableRow>
                ))}
                {bundleAnalysis.images.map((image, index) => (
                  <TableRow key={`image-${index}`}>
                    <TableCell>Image</TableCell>
                    <TableCell>{image.src}</TableCell>
                    <TableCell align="right">
                      {(image.size / 1024).toFixed(2)} KB
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Dépendances externes
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {bundleAnalysis.dependencies.map((domain, index) => (
                <Box
                  key={index}
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText
                  }}
                >
                  {domain}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
});

BundleTest.displayName = 'BundleTest';

export default BundleTest; 