import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Download as DownloadIcon } from '@mui/icons-material';
import axios from 'axios';

const SimulatorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [platformData, setPlatformData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/simulator/clicks');
      setPlatformData(response.data.platformStats);
      setDailyData(response.data.dailyStats);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'YouTube', 'Meta', 'TikTok', 'Total'];
    const csvContent = [
      headers.join(','),
      ...dailyData.map(day => [
        day.date,
        day.youtube,
        day.meta,
        day.tiktok,
        day.total
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'simulator_stats.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Simulateur de Campagne
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
        >
          Exporter CSV
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Graphique des clics par plateforme */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Clics par Plateforme
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="clicks"
                      fill={theme.palette.primary.main}
                      name="Nombre de clics"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique d'évolution journalière */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Évolution Journalière
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="youtube"
                      stroke={theme.palette.error.main}
                      name="YouTube"
                    />
                    <Line
                      type="monotone"
                      dataKey="meta"
                      stroke={theme.palette.info.main}
                      name="Meta"
                    />
                    <Line
                      type="monotone"
                      dataKey="tiktok"
                      stroke={theme.palette.success.main}
                      name="TikTok"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistiques globales */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistiques Globales
              </Typography>
              <Grid container spacing={2}>
                {platformData.map((platform) => (
                  <Grid item xs={12} sm={4} key={platform.platform}>
                    <Box
                      p={2}
                      bgcolor={theme.palette.background.default}
                      borderRadius={1}
                    >
                      <Typography variant="subtitle2" color="textSecondary">
                        {platform.platform}
                      </Typography>
                      <Typography variant="h4">
                        {platform.clicks.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Clics totaux
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SimulatorDashboard; 