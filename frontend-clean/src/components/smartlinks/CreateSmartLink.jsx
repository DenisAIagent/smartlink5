// components/smartlinks/CreateSmartLink.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './CreateSmartLink.css';

const CreateSmartLink = ({ user = { id: 'anonymous' } }) => {
  const [sourceUrl, setSourceUrl] = useState('');
  const [scanResults, setScanResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [customizations, setCustomizations] = useState({
    slug: '',
    integrations: {
      gtmId: '',
      ga4Id: '',
      googleAdsId: '',
      facebookPixel: ''
    },
    branding: {
      primaryColor: '#1DB954',
      backgroundColor: '#000000',
      textColor: '#FFFFFF'
    }
  });
  const [createdLink, setCreatedLink] = useState(null);

  const handleScan = async () => {
    if (!sourceUrl.trim()) return;
    
    setIsScanning(true);
    try {
      const response = await axios.post('https://extraordinary-embrace-staring.up.railway.app/api/scan', {
        url: sourceUrl
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.success) {
        setScanResults(response.data);
        setCreatedLink({
          title: response.data.metadata.title,
          artist: response.data.metadata.artistName,
          artwork: response.data.metadata.thumbnailUrl,
          platforms: response.data.data.linksByPlatform
        });
      } else {
        throw new Error('Scan failed');
      }
    } catch (error) {
      console.error('Scan error:', error);
      if (error.code === 'ECONNABORTED') {
        alert('Timeout - Le serveur met trop de temps à répondre');
      } else if (error.response?.status === 502) {
        alert('Erreur de connexion - Service temporairement indisponible');
      } else {
        alert('Erreur lors du scan. Vérifiez l\'URL et réessayez.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Lien copié !');
  };

  return (
    <div className="create-smartlink">
      <div className="container">
        <h1>Créer un SmartLink</h1>
        
        {!createdLink ? (
          <>
            {/* Étape 1: Scan */}
            <div className="scan-section">
              <h2>Scanner votre release</h2>
              <p>Entrez une URL de Spotify, Apple Music, ou un code ISRC</p>
              
              <div className="input-group">
                <input
                  type="url"
                  placeholder="https://open.spotify.com/track/... ou ISRC"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="url-input"
                />
                <button 
                  onClick={handleScan} 
                  disabled={isScanning || !sourceUrl.trim()}
                  className="scan-btn"
                >
                  {isScanning ? 'Scan en cours...' : 'Scanner'}
                </button>
              </div>
            </div>

            {/* Étape 2: Personnalisation */}
            <div className="customization-section">
              <h2>Personnalisation</h2>
              
              <div className="form-group">
                <label>Slug personnalisé (optionnel)</label>
                <input
                  type="text"
                  placeholder="mon-titre-personnalise"
                  value={customizations.slug}
                  onChange={(e) => setCustomizations({
                    ...customizations,
                    slug: e.target.value
                  })}
                />
              </div>

              <div className="form-group">
                <label>Intégrations Tracking</label>
                <div className="integrations-grid">
                  <input
                    type="text"
                    placeholder="GTM ID (GTM-XXXXXXX)"
                    value={customizations.integrations.gtmId}
                    onChange={(e) => setCustomizations({
                      ...customizations,
                      integrations: {
                        ...customizations.integrations,
                        gtmId: e.target.value
                      }
                    })}
                  />
                  <input
                    type="text"
                    placeholder="GA4 ID (G-XXXXXXXXXX)"
                    value={customizations.integrations.ga4Id}
                    onChange={(e) => setCustomizations({
                      ...customizations,
                      integrations: {
                        ...customizations.integrations,
                        ga4Id: e.target.value
                      }
                    })}
                  />
                  <input
                    type="text"
                    placeholder="Google Ads ID"
                    value={customizations.integrations.googleAdsId}
                    onChange={(e) => setCustomizations({
                      ...customizations,
                      integrations: {
                        ...customizations.integrations,
                        googleAdsId: e.target.value
                      }
                    })}
                  />
                  <input
                    type="text"
                    placeholder="Facebook Pixel ID"
                    value={customizations.integrations.facebookPixel}
                    onChange={(e) => setCustomizations({
                      ...customizations,
                      integrations: {
                        ...customizations.integrations,
                        facebookPixel: e.target.value
                      }
                    })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Branding</label>
                <div className="branding-grid">
                  <div className="color-input">
                    <label>Couleur principale</label>
                    <input
                      type="color"
                      value={customizations.branding.primaryColor}
                      onChange={(e) => setCustomizations({
                        ...customizations,
                        branding: {
                          ...customizations.branding,
                          primaryColor: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="color-input">
                    <label>Arrière-plan</label>
                    <input
                      type="color"
                      value={customizations.branding.backgroundColor}
                      onChange={(e) => setCustomizations({
                        ...customizations,
                        branding: {
                          ...customizations.branding,
                          backgroundColor: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="color-input">
                    <label>Texte</label>
                    <input
                      type="color"
                      value={customizations.branding.textColor}
                      onChange={(e) => setCustomizations({
                        ...customizations,
                        branding: {
                          ...customizations.branding,
                          textColor: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Résultat */
          <div className="result-section">
            <h2>SmartLink créé avec succès ! 🎉</h2>
            
            <div className="link-result">
              <div className="link-info">
                <img src={createdLink.artwork || '/default-artwork.png'} alt="Artwork" />
                <div>
                  <h3>{createdLink.title}</h3>
                  <p>{createdLink.artist}</p>
                </div>
              </div>
              
              <div className="link-url">
                <input 
                  type="text" 
                  value={createdLink.url} 
                  readOnly 
                  className="url-display"
                />
                <button onClick={() => copyToClipboard(createdLink.url)}>
                  Copier
                </button>
              </div>

              <div className="platforms-preview">
                <h4>Plateformes détectées ({createdLink.platforms?.length || 0})</h4>
                <div className="platforms-grid">
                  {(createdLink.platforms || []).map((platform) => (
                    <div key={platform.id} className="platform-item">
                      <img src={platform.icon} alt={platform.name} />
                      <span>{platform.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="actions">
                <button onClick={() => window.open(createdLink.url, '_blank')}>
                  Prévisualiser
                </button>
                <button onClick={() => window.location.href = `/analytics/${createdLink.id}`}>
                  Voir Analytics
                </button>
                <button onClick={() => window.location.reload()}>
                  Créer un nouveau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateSmartLink;