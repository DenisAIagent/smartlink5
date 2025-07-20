// components/admin/AdminDashboard.jsx - Dashboard Administrateur
import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import './AdminDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentLinks, setRecentLinks] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [timeframe]);

  const loadAdminData = async () => {
    try {
      const [statsRes, usersRes, linksRes, healthRes] = await Promise.all([
        fetch(`/api/admin/stats?timeframe=${timeframe}`, {
          headers: { 'X-Admin-Key': process.env.REACT_APP_ADMIN_KEY }
        }),
        fetch('/api/admin/users', {
          headers: { 'X-Admin-Key': process.env.REACT_APP_ADMIN_KEY }
        }),
        fetch('/api/admin/recent-links', {
          headers: { 'X-Admin-Key': process.env.REACT_APP_ADMIN_KEY }
        }),
        fetch('/api/admin/health', {
          headers: { 'X-Admin-Key': process.env.REACT_APP_ADMIN_KEY }
        })
      ]);

      setStats(await statsRes.json());
      setUsers(await usersRes.json());
      setRecentLinks(await linksRes.json());
      setSystemHealth(await healthRes.json());
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  };

  if (!stats) {
    return <div className="admin-loading">Chargement du dashboard admin...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <header className="admin-header">
          <h1>Administration SmartLink</h1>
          <div className="admin-controls">
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              className="timeframe-select"
            >
              <option value="24h">24 dernières heures</option>
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
            </select>
            <button onClick={loadAdminData} className="refresh-btn">
              🔄 Actualiser
            </button>
          </div>
        </header>

        {/* System Health */}
        <div className="health-section">
          <h2>État du Système</h2>
          <div className="health-grid">
            <div className={`health-card ${systemHealth?.database ? 'healthy' : 'unhealthy'}`}>
              <span className="health-icon">{systemHealth?.database ? '✅' : '❌'}</span>
              <div>
                <h3>Base de Données</h3>
                <p>{systemHealth?.database ? 'Connectée' : 'Déconnectée'}</p>
              </div>
            </div>
            <div className={`health-card ${systemHealth?.odesli ? 'healthy' : 'unhealthy'}`}>
              <span className="health-icon">{systemHealth?.odesli ? '✅' : '❌'}</span>
              <div>
                <h3>API Odesli</h3>
                <p>{systemHealth?.odesli ? 'Fonctionnelle' : 'Indisponible'}</p>
              </div>
            </div>
            <div className="health-card healthy">
              <span className="health-icon">⚡</span>
              <div>
                <h3>Performance</h3>
                <p>{systemHealth?.responseTime}ms</p>
              </div>
            </div>
            <div className="health-card healthy">
              <span className="health-icon">💾</span>
              <div>
                <h3>Mémoire</h3>
                <p>{systemHealth?.memoryUsage}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="metrics-section">
          <h2>Métriques Globales</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Total SmartLinks</h3>
              <p className="metric-number">{stats.totalLinks?.toLocaleString()}</p>
              <span className="metric-change positive">+{stats.newLinksThisPeriod} cette période</span>
            </div>
            <div className="metric-card">
              <h3>Total Utilisateurs</h3>
              <p className="metric-number">{stats.totalUsers?.toLocaleString()}</p>
              <span className="metric-change positive">+{stats.newUsersThisPeriod} cette période</span>
            </div>
            <div className="metric-card">
              <h3>Total Vues</h3>
              <p className="metric-number">{stats.totalViews?.toLocaleString()}</p>
              <span className="metric-change positive">+{stats.viewsThisPeriod?.toLocaleString()} cette période</span>
            </div>
            <div className="metric-card">
              <h3>Total Clics</h3>
              <p className="metric-number">{stats.totalClicks?.toLocaleString()}</p>
              <span className="metric-change positive">+{stats.clicksThisPeriod?.toLocaleString()} cette période</span>
            </div>
            <div className="metric-card">
              <h3>Taux de Conversion</h3>
              <p className="metric-number">{stats.conversionRate}%</p>
              <span className={`metric-change ${stats.conversionChange >= 0 ? 'positive' : 'negative'}`}>
                {stats.conversionChange >= 0 ? '+' : ''}{stats.conversionChange}% vs période précédente
              </span>
            </div>
            <div className="metric-card">
              <h3>Revenus Estimés</h3>
              <p className="metric-number">€{stats.estimatedRevenue?.toLocaleString()}</p>
              <span className="metric-change positive">+€{stats.revenueThisPeriod} cette période</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-section">
          <div className="chart-row">
            <div className="chart-card">
              <h3>Évolution du Trafic</h3>
              <Line 
                data={stats.trafficChart}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
            <div className="chart-card">
              <h3>Top Plateformes</h3>
              <Doughnut 
                data={stats.platformsChart}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          </div>
          <div className="chart-card full-width">
            <h3>Utilisateurs Actifs par Jour</h3>
            <Bar 
              data={stats.activeUsersChart}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-section">
          <div className="activity-grid">
            <div className="activity-card">
              <h3>SmartLinks Récents</h3>
              <div className="activity-list">
                {recentLinks.map(link => (
                  <div key={link.id} className="activity-item">
                    <img src={link.artwork} alt="Artwork" className="activity-artwork" />
                    <div className="activity-info">
                      <h4>{link.title}</h4>
                      <p>{link.artist}</p>
                      <span className="activity-time">{formatTimeAgo(link.createdAt)}</span>
                    </div>
                    <div className="activity-stats">
                      <span>{link.views} vues</span>
                      <span>{link.clicks} clics</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="activity-card">
              <h3>Utilisateurs Actifs</h3>
              <div className="activity-list">
                {users.slice(0, 10).map(user => (
                  <div key={user.id} className="activity-item">
                    <div className="user-avatar">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="activity-info">
                      <h4>{user.name || 'Utilisateur'}</h4>
                      <p>{user.email}</p>
                      <span className="activity-time">
                        {user.smartLinksCount} SmartLinks • Rejoint {formatTimeAgo(user.createdAt)}
                      </span>
                    </div>
                    <div className="activity-stats">
                      <span className={`user-status ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Management Actions */}
        <div className="management-section">
          <h2>Actions de Gestion</h2>
          <div className="management-grid">
            <ManagementCard
              title="Gestion des Utilisateurs"
              description="Voir, modifier et gérer les comptes utilisateurs"
              icon="👥"
              action={() => window.location.href = '/admin/users'}
            />
            <ManagementCard
              title="Modération de Contenu"
              description="Examiner et modérer les SmartLinks signalés"
              icon="🛡️"
              action={() => window.location.href = '/admin/moderation'}
            />
            <ManagementCard
              title="Configuration Système"
              description="Paramètres généraux et configuration"
              icon="⚙️"
              action={() => window.location.href = '/admin/settings'}
            />
            <ManagementCard
              title="Logs et Monitoring"
              description="Consulter les logs système et erreurs"
              icon="📊"
              action={() => window.location.href = '/admin/logs'}
            />
            <ManagementCard
              title="Base de Données"
              description="Outils de maintenance et backup"
              icon="💾"
              action={() => window.location.href = '/admin/database'}
            />
            <ManagementCard
              title="API Keys"
              description="Gérer les clés API et intégrations"
              icon="🔑"
              action={() => window.location.href = '/admin/api-keys'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ManagementCard = ({ title, description, icon, action }) => (
  <div className="management-card" onClick={action}>
    <div className="management-icon">{icon}</div>
    <h4>{title}</h4>
    <p>{description}</p>
  </div>
);

const formatTimeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  return 'À l\'instant';
};

export default AdminDashboard;