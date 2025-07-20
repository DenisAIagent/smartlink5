// components/smartlinks/SmartLinkLanding.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnalyticsManager } from '../../services/analytics';
import './SmartLinkLanding.css';

const SmartLinkLanding = () => {
  const { slug } = useParams();
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadSmartLink();
  }, [slug]);

  useEffect(() => {
    if (linkData) {
      // Initialize analytics
      const analyticsManager = new AnalyticsManager(linkData.integrations);
      setAnalytics(analyticsManager);
      
      // Track page view
      analyticsManager.trackPageView(linkData);
      trackServerEvent('view');

      // Auto-redirect logic
      const preferredPlatform = detectPreferredPlatform();
      if (preferredPlatform && !window.location.search.includes('no-redirect')) {
        setTimeout(() => {
          handlePlatformClick(preferredPlatform, true);
        }, 2000);
      }
    }
  }, [linkData]);

  const loadSmartLink = async () => {
    try {
      const response = await fetch(`/api/smartlinks/${slug}`);
      if (!response.ok) {
        throw new Error('SmartLink not found');
      }
      const data = await response.json();
      setLinkData(data);
    } catch (error) {
      console.error('Failed to load SmartLink:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectPreferredPlatform = () => {
    if (!linkData?.platforms) return null;
    
    const userAgent = navigator.userAgent;
    const platforms = linkData.platforms;
    
    // iOS -> Apple Music priority
    if (/iPhone|iPad|iPod/.test(userAgent)) {
      return platforms.find(p => p.id === 'appleMusic') || platforms[0];
    }
    
    // Android -> Spotify priority  
    if (/Android/.test(userAgent)) {
      return platforms.find(p => p.id === 'spotify') || platforms[0];
    }
    
    // Default to first platform
    return platforms[0];
  };

  const trackServerEvent = async (eventType, platform = null) => {
    try {
      await fetch(`/api/analytics/${linkData.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: eventType,
          platform: platform?.name,
          country: 'FR', // Would be detected from IP in real implementation
          referrer: document.referrer
        }),
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const handlePlatformClick = (platform, isAutoRedirect = false) => {
    // Track analytics
    if (analytics) {
      analytics.trackPlatformClick(platform, linkData);
    }
    
    // Track on server
    trackServerEvent('click', platform);
    
    // Redirect
    if (isAutoRedirect) {
      window.location.href = platform.url;
    } else {
      window.open(platform.url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="landing-loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="landing-error">
        <h1>SmartLink non trouvé</h1>
        <p>Ce lien n'existe pas ou a été supprimé.</p>
      </div>
    );
  }

  const branding = linkData.branding || {};

  return (
    <div 
      className="smartlink-landing"
      style={{
        '--primary-color': branding.primaryColor || '#1DB954',
        '--bg-color': branding.backgroundColor || '#000000',
        '--text-color': branding.textColor || '#FFFFFF'
      }}
    >
      {/* Analytics Scripts */}
      {linkData.integrations?.gtmId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${linkData.integrations.gtmId}');
            `
          }}
        />
      )}

      <div className="landing-container">
        {/* Header with artwork */}
        <div className="artwork-section">
          <div className="artwork-container">
            <img 
              src={linkData.artwork || '/default-artwork.png'} 
              alt={`${linkData.title} artwork`}
              className="artwork-image"
            />
          </div>
          
          <div className="release-info">
            <h1 className="track-title">{linkData.title}</h1>
            <h2 className="artist-name">{linkData.artist}</h2>
            {linkData.album && <p className="album-name">{linkData.album}</p>}
            <p className="cta-text">Choisir ma plateforme</p>
          </div>
        </div>

        {/* Platforms grid */}
        <div className="platforms-section">
          <div className="platforms-grid">
            {(linkData.platforms || []).map((platform) => (
              <PlatformButton
                key={platform.id}
                platform={platform}
                onClick={() => handlePlatformClick(platform)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="landing-footer">
          <p>Propulsé par SmartLink</p>
        </div>
      </div>
    </div>
  );
};

const PlatformButton = ({ platform, onClick }) => (
  <button 
    className="platform-btn"
    onClick={onClick}
    style={{ 
      '--platform-color': platform.color,
      borderColor: platform.color 
    }}
  >
    <div className="platform-content">
      <img 
        src={platform.icon || '/icons/default.svg'} 
        alt={platform.name}
        className="platform-icon"
      />
      <div className="platform-info">
        <span className="platform-name">{platform.name}</span>
        <span className="action-label">Écouter</span>
      </div>
    </div>
  </button>
);

export default SmartLinkLanding;