import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  MusicNote as MusicNoteIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardSimulator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchSimulatorStats();
  }, []);

  const fetchSimulatorStats = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par l'appel API réel
      const data = {
        totalSimulations: 1500,
        activeUsers: 750,
        averageEngagement: 68,
        platformDistribution: {
          spotify: 45,
          youtube: 30,
          apple: 15,
          deezer: 10
        },
        timelineData: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
          datasets: [
            {
              label: 'Simulations',
              data: [200, 300, 400, 500, 600, 700],
              borderColor: theme.palette.primary.main,
              tension: 0.4
            },
            {
              label: 'Engagement',
              data: [150, 250, 350, 450, 550, 650],
              borderColor: theme.palette.secondary.main,
              tension: 0.4
            }
          ]
        }
      };
      setStats(data);
      setLoading(false);
    } catch (error) {
      setError("Erreur lors du chargement des statistiques");
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutData = {
    labels: ['Spotify', 'YouTube', 'Apple Music', 'Deezer'],
    datasets: [
      {
        data: [
          stats?.platformDistribution.spotify,
          stats?.platformDistribution.youtube,
          stats?.platformDistribution.apple,
          stats?.platformDistribution.deezer
        ],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.info.main
        ]
      }
    ]
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Simulateur de Campagne
      </Typography>

      <Grid container spacing={3}>
        {/* Statistiques principales */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Simulations Totales
                </Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {stats?.totalSimulations.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Utilisateurs Actifs
                </Typography>
              </Box>
              <Typography variant="h3" color="secondary">
                {stats?.activeUsers.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MusicNoteIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Engagement Moyen
                </Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                {stats?.averageEngagement}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShareIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Partages
                </Typography>
              </Box>
              <Typography variant="h3" color="info.main">
                {(stats?.totalSimulations * 0.3).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphiques */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Évolution des Simulations
            </Typography>
            <Box sx={{ height: 400 }}>
              <Line options={chartOptions} data={stats?.timelineData} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Distribution par Plateforme
            </Typography>
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut data={doughnutData} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardSimulator; 