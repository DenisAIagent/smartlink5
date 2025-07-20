// components/smartlinks/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [smartLinks, setSmartLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalViews: 0,
    totalClicks: 0
  });

  useEffect(() => {
    loadUserSmartLinks();
  }, [user.id]);

  const loadUserSmartLinks = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}/smartlinks`);
      const data = await response.json();
      setSmartLinks(data.smartLinks || []);
      
      // Calculate stats
      const totalViews = data.smartLinks.reduce((sum, link) => sum + (link.analytics?.views || 0), 0);
      const totalClicks = data.smartLinks.reduce((sum, link) => 
        sum + (link.analytics?.clicks?.length || 0), 0);
      
      setStats({
        totalLinks: data.smartLinks.length,
        totalViews,
        totalClicks
      });
    } catch (error) {
      console.error('Failed to load SmartLinks:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert('Lien copié !');
  };

  if (loading) {
    return <div className="dashboard-loading">Chargement...</div>;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <header className="dashboard-header">
          <h1>Dashboard SmartLink</h1>
          <Link to="/create" className="create-btn">
            + Créer un SmartLink
          </Link>
        </header>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total SmartLinks</h3>
            <p className="stat-number">{stats.totalLinks}</p>
          </div>
          <div className="stat-card">
            <h3>Total Vues</h3>
            <p className="stat-number">{stats.totalViews.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Total Clics</h3>
            <p className="stat-number">{stats.totalClicks.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Taux de Conversion</h3>
            <p className="stat-number">
              {stats.totalViews > 0 ? 
                ((stats.totalClicks / stats.totalViews) * 100).toFixed(1) + '%' : 
                '0%'
              }
            </p>
          </div>
        </div>

        {/* SmartLinks List */}
        <div className="smartlinks-section">
          <h2>Mes SmartLinks</h2>
          
          {smartLinks.length === 0 ? (
            <div className="empty-state">
              <p>Aucun SmartLink créé.</p>
              <Link to="/create" className="create-btn">
                Créer votre premier SmartLink
              </Link>
            </div>
          ) : (
            <div className="smartlinks-grid">
              {smartLinks.map((link) => (
                <SmartLinkCard
                  key={link.id}
                  link={link}
                  onCopy={copyToClipboard}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SmartLinkCard = ({ link, onCopy }) => {
  const linkUrl = `${window.location.origin}/l/${link.slug}`;
  
  return (
    <div className="smartlink-card">
      <div className="card-header">
        <img 
          src={link.artwork || '/default-artwork.png'} 
          alt="Artwork"
          className="card-artwork"
        />
        <div className="card-info">
          <h3>{link.title}</h3>
          <p>{link.artist}</p>
          <span className="created-date">
            {new Date(link.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <div className="card-stats">
        <div className="stat">
          <span className="stat-label">Vues</span>
          <span className="stat-value">{link.analytics?.views || 0}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Clics</span>
          <span className="stat-value">{link.analytics?.clicks?.length || 0}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Plateformes</span>
          <span className="stat-value">{link.platforms?.length || 0}</span>
        </div>
      </div>
      
      <div className="card-url">
        <input 
          type="text" 
          value={linkUrl} 
          readOnly 
          className="url-input"
        />
        <button onClick={() => onCopy(linkUrl)} className="copy-btn">
          Copier
        </button>
      </div>
      
      <div className="card-actions">
        <button onClick={() => window.open(linkUrl, '_blank')}>
          Prévisualiser
        </button>
        <Link to={`/analytics/${link.id}`}>
          Analytics
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;