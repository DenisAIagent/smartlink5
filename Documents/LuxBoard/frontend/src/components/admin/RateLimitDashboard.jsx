import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { apiService } from '../../services/apiService';
import { rateLimitService } from '../../services/rateLimitService';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RateLimitDashboard = () => {
  const [stats, setStats] = useState({
    requests: [],
    errors: [],
    retries: []
  });
  const [timeRange, setTimeRange] = useState('1h');
  const [endpoints, setEndpoints] = useState([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get('/admin/rate-limit/stats', {
          params: {
            timeRange,
            endpoint: selectedEndpoint
          }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Rafraîchir toutes les 30 secondes

    return () => clearInterval(interval);
  }, [timeRange, selectedEndpoint]);

  useEffect(() => {
    const fetchEndpoints = async () => {
      try {
        const response = await apiService.get('/admin/rate-limit/endpoints');
        setEndpoints(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des endpoints:', error);
      }
    };

    fetchEndpoints();
  }, []);

  const chartData = {
    labels: stats.requests.map(r => new Date(r.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Requêtes',
        data: stats.requests.map(r => r.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Erreurs',
        data: stats.errors.map(e => e.count),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      },
      {
        label: 'Retries',
        data: stats.retries.map(r => r.count),
        borderColor: 'rgb(255, 159, 64)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Statistiques de Limitation de Taux'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const calculateMetrics = () => {
    const totalRequests = stats.requests.reduce((sum, r) => sum + r.count, 0);
    const totalErrors = stats.errors.reduce((sum, e) => sum + e.count, 0);
    const totalRetries = stats.retries.reduce((sum, r) => sum + r.count, 0);
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    const retryRate = totalRequests > 0 ? (totalRetries / totalRequests) * 100 : 0;

    return {
      totalRequests,
      totalErrors,
      totalRetries,
      errorRate,
      retryRate
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Tableau de Bord de Limitation de Taux</h1>
        
        <div className="flex gap-4 mb-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="1h">Dernière heure</option>
            <option value="6h">6 dernières heures</option>
            <option value="24h">24 dernières heures</option>
            <option value="7d">7 derniers jours</option>
          </select>

          <select
            value={selectedEndpoint}
            onChange={(e) => setSelectedEndpoint(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">Tous les endpoints</option>
            {endpoints.map(endpoint => (
              <option key={endpoint} value={endpoint}>
                {endpoint}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Requêtes Totales</h3>
            <p className="text-3xl font-bold text-blue-600">{metrics.totalRequests}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Erreurs</h3>
            <p className="text-3xl font-bold text-red-600">{metrics.totalErrors}</p>
            <p className="text-sm text-gray-600">{metrics.errorRate.toFixed(1)}%</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Retries</h3>
            <p className="text-3xl font-bold text-orange-600">{metrics.totalRetries}</p>
            <p className="text-sm text-gray-600">{metrics.retryRate.toFixed(1)}%</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Taux de Succès</h3>
            <p className="text-3xl font-bold text-green-600">
              {(100 - metrics.errorRate).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Endpoints les Plus Utilisés</h2>
          <div className="space-y-2">
            {endpoints.map(endpoint => {
              const endpointStats = stats.requests.find(r => r.endpoint === endpoint);
              return (
                <div key={endpoint} className="flex justify-between items-center">
                  <span className="text-gray-600">{endpoint}</span>
                  <span className="font-semibold">{endpointStats?.count || 0}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Erreurs par Type</h2>
          <div className="space-y-2">
            {stats.errors.map(error => (
              <div key={error.type} className="flex justify-between items-center">
                <span className="text-gray-600">{error.type}</span>
                <span className="font-semibold">{error.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimitDashboard; 