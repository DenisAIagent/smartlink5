import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getSmartLinkBySlug, logVisit } from '@/lib/database';
import { extractClientIP, getCachedGeoData } from '@/utils/geolocation';
import { SmartLinkPageProps, ServicePlatform, ClickTrackingResponse, GTMEvent } from '@/types/smartlink';

/**
 * Page de destination dynamique pour les SmartLinks
 * Route: /[smartlinkSlug]
 * 
 * Cette page utilise getServerSideProps pour:
 * 1. Récupérer les données du SmartLink depuis la BD
 * 2. Logger la visite côté serveur (1er tracking)
 * 3. Pré-rendre la page pour les performances et le SEO
 */

export const getServerSideProps: GetServerSideProps<SmartLinkPageProps> = async (context) => {
  const { smartlinkSlug } = context.params!;
  const { req } = context;

  try {
    console.log(`[SSR] 🔍 Chargement du SmartLink: ${smartlinkSlug}`);

    // 1. Récupération des données du SmartLink
    const smartlinkData = await getSmartLinkBySlug(smartlinkSlug as string);

    if (!smartlinkData) {
      console.log(`[SSR] ❌ SmartLink non trouvé: ${smartlinkSlug}`);
      return {
        notFound: true,
      };
    }

    console.log(`[SSR] ✅ SmartLink trouvé: ${smartlinkData.trackTitle} - ${smartlinkData.artist.name}`);

    // 2. Géolocalisation de l'utilisateur
    const clientIp = extractClientIP(req);
    const userGeoData = await getCachedGeoData(clientIp);

    console.log(`[SSR] 🌍 Utilisateur géolocalisé: ${userGeoData.country}, ${userGeoData.region}`);

    // 3. PREMIER TRACKING - Événement: link_visit (côté serveur)
    try {
      await logVisit({
        smartlinkId: smartlinkData.id,
        userAgent: req.headers['user-agent'] || 'Unknown',
        ip: clientIp,
        referrer: req.headers.referer || 'Direct',
        geoData: userGeoData,
        sessionId: req.headers['x-session-id'] as string || undefined,
      });

      console.log(`[SSR] 📊 Visite loggée pour SmartLink: ${smartlinkData.id}`);
    } catch (visitError) {
      console.error('[SSR] ⚠️ Erreur lors du logging de la visite:', visitError);
      // On continue même si le logging échoue
    }

    // 4. Retour des props pour le rendu côté client
    return {
      props: {
        smartlinkData,
        userGeoData,
      },
    };

  } catch (error) {
    console.error('[SSR] ❌ Erreur lors du chargement du SmartLink:', error);
    
    return {
      props: {
        smartlinkData: null,
        userGeoData: {
          country: 'Unknown',
          region: 'Unknown', 
          city: 'Unknown',
          countryCode: 'XX',
          timezone: 'UTC'
        },
        error: 'Erreur lors du chargement des données'
      },
    };
  }
};

/**
 * Composant principal de la page SmartLink
 */
export default function SmartLinkPage({ 
  smartlinkData, 
  userGeoData,
  error
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // États pour la gestion des clics
  const [isTracking, setIsTracking] = useState(false);
  const [trackingErrors, setTrackingErrors] = useState<string[]>([]);

  // Si erreur de chargement des données
  if (error || !smartlinkData) {
    return (
      <div className="error-container">
        <Head>
          <title>SmartLink non trouvé - MDMC Music Ads</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="error-content">
          <h1>SmartLink non trouvé</h1>
          <p>Ce lien musical n'existe pas ou n'est plus disponible.</p>
          <button onClick={() => window.history.back()}>
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Initialisation du tracking côté client
  useEffect(() => {
    // PREMIER ÉVÉNEMENT CLIENT - Page view dans dataLayer
    const pageViewEvent: GTMEvent = {
      event: 'smartlink_page_view',
      smartlink_id: smartlinkData.id,
      track_title: smartlinkData.trackTitle,
      artist_name: smartlinkData.artist.name,
      user_country: userGeoData.country,
      user_region: userGeoData.region,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      // Données supplémentaires pour GTM
      platforms_count: smartlinkData.platforms.length,
      is_mobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent),
      referrer: document.referrer || 'Direct'
    };

    // Push vers le dataLayer global
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(pageViewEvent);
      console.log('[CLIENT] 📊 Page view event envoyé vers GTM:', pageViewEvent);
    }

    // Tracking Meta Pixel si configuré spécifiquement pour ce SmartLink
    if (smartlinkData.trackingConfig.metaPixel?.enabled && smartlinkData.trackingConfig.metaPixel.pixelId) {
      const metaPixelId = smartlinkData.trackingConfig.metaPixel.pixelId;
      
      // Injection dynamique du Meta Pixel spécifique
      const metaScript = document.createElement('script');
      metaScript.innerHTML = `
        fbq('init', '${metaPixelId}');
        fbq('track', 'ViewContent', {
          content_name: '${smartlinkData.trackTitle}',
          content_category: 'Music',
          content_ids: ['${smartlinkData.id}'],
          artist_name: '${smartlinkData.artist.name}'
        });
      `;
      document.head.appendChild(metaScript);
      
      console.log(`[CLIENT] 🎯 Meta Pixel spécifique initialisé: ${metaPixelId}`);
    }

    // Tracking GA4 spécifique si configuré
    if (smartlinkData.trackingConfig.ga4?.enabled && smartlinkData.trackingConfig.ga4.measurementId) {
      const ga4MeasurementId = smartlinkData.trackingConfig.ga4.measurementId;
      
      window.gtag('config', ga4MeasurementId, {
        custom_map: {
          artist_name: smartlinkData.artist.name,
          track_title: smartlinkData.trackTitle
        }
      });
      
      window.gtag('event', 'page_view', {
        send_to: ga4MeasurementId,
        artist_name: smartlinkData.artist.name,
        track_title: smartlinkData.trackTitle,
        smartlink_id: smartlinkData.id
      });
      
      console.log(`[CLIENT] 📈 GA4 spécifique configuré: ${ga4MeasurementId}`);
    }

  }, [smartlinkData, userGeoData]);

  /**
   * Fonction de gestion des clics sur les plateformes - TRACKING HYBRIDE
   * Combine tracking client (GTM) + tracking serveur (API)
   */
  const handleServiceClick = async (platform: ServicePlatform) => {
    if (isTracking) {
      console.log('[CLIENT] ⏳ Clic ignoré - tracking en cours');
      return;
    }

    setIsTracking(true);
    setTrackingErrors([]);

    console.log(`[CLIENT] 🎯 Clic sur ${platform.displayName} détecté`);

    try {
      // PARTIE 1: Tracking côté client (GTM/dataLayer) - IMMÉDIAT
      const clickEvent: GTMEvent = {
        event: 'service_click',
        smartlink_id: smartlinkData.id,
        service_name: platform.name,
        service_display_name: platform.displayName,
        track_title: smartlinkData.trackTitle,
        artist_name: smartlinkData.artist.name,
        click_timestamp: new Date().toISOString(),
        user_country: userGeoData.country,
        user_region: userGeoData.region,
        // Données contextuelles
        platform_priority: platform.priority,
        is_affiliate: !!platform.affiliateUrl,
        click_position: smartlinkData.platforms.findIndex(p => p.id === platform.id) + 1
      };

      if (window.dataLayer) {
        window.dataLayer.push(clickEvent);
        console.log(`[CLIENT] 📊 Événement GTM envoyé:`, clickEvent);
      }

      // Meta Pixel tracking pour le clic
      if (window.fbq) {
        window.fbq('track', 'InitiateCheckout', {
          content_name: smartlinkData.trackTitle,
          content_category: 'Music Platform Click',
          value: 1,
          currency: 'EUR',
          platform: platform.displayName
        });
        console.log(`[CLIENT] 🎯 Meta Pixel - InitiateCheckout envoyé`);
      }

      // PARTIE 2: Tracking côté serveur + récupération URL (API call)
      const apiResponse = await fetch('/api/track/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': getSessionId(), // Helper pour session tracking
        },
        body: JSON.stringify({
          smartlinkId: smartlinkData.id,
          serviceName: platform.name,
          serviceDisplayName: platform.displayName,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }),
      });

      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.status} ${apiResponse.statusText}`);
      }

      const data: ClickTrackingResponse = await apiResponse.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur API inconnue');
      }

      console.log('[CLIENT] ✅ Réponse API reçue:', data);

      // PARTIE 3: Événement de redirection dans GTM
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'platform_redirect',
          smartlink_id: smartlinkData.id,
          service_name: platform.name,
          destination_url: data.destinationUrl,
          tracking_id: data.trackingId,
          redirect_timestamp: new Date().toISOString()
        });
      }

      // PARTIE 4: Redirection sécurisée avec délai optimisé
      const redirectDelay = 100; // 100ms - délai optimisé pour les performances
      
      setTimeout(() => {
        console.log(`[CLIENT] 🚀 Redirection vers: ${data.destinationUrl}`);
        window.location.assign(data.destinationUrl);
      }, redirectDelay);

    } catch (error) {
      console.error('[CLIENT] ❌ Erreur lors du tracking:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setTrackingErrors(prev => [...prev, errorMessage]);

      // Tracking de l'erreur dans GTM
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'tracking_error',
          error_type: 'click_tracking_failed',
          error_message: errorMessage,
          smartlink_id: smartlinkData.id,
          platform: platform.name,
          timestamp: new Date().toISOString()
        });
      }
      
      // Fallback: redirection directe vers l'URL originale
      console.log('[CLIENT] 🔄 Fallback: redirection directe');
      setTimeout(() => {
        window.location.assign(platform.url);
      }, 50);

    } finally {
      setIsTracking(false);
    }
  };

  // Helper pour générer/récupérer un ID de session
  const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('mdmc_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('mdmc_session_id', sessionId);
    }
    return sessionId;
  };

  // Tri des plateformes par priorité et disponibilité par pays
  const sortedPlatforms = smartlinkData.platforms
    .filter(platform => platform.isAvailable)
    .filter(platform => 
      platform.country === 'GLOBAL' || 
      platform.country === userGeoData.countryCode
    )
    .sort((a, b) => a.priority - b.priority);

  return (
    <>
      <Head>
        {/* SEO optimisé */}
        <title>{`${smartlinkData.trackTitle} - ${smartlinkData.artist.name}`}</title>
        <meta name="description" content={smartlinkData.description || `Écoutez ${smartlinkData.trackTitle} de ${smartlinkData.artist.name} sur toutes les plateformes de streaming musical.`} />
        <meta name="keywords" content={`${smartlinkData.artist.name}, ${smartlinkData.trackTitle}, musique, streaming, ${smartlinkData.metadata.genre || 'music'}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="music.song" />
        <meta property="og:title" content={`${smartlinkData.trackTitle} - ${smartlinkData.artist.name}`} />
        <meta property="og:description" content={smartlinkData.description} />
        <meta property="og:image" content={smartlinkData.artworkUrl} />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta property="og:site_name" content="MDMC Music Ads" />
        <meta property="music:musician" content={smartlinkData.artist.name} />
        <meta property="music:song" content={smartlinkData.trackTitle} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${smartlinkData.trackTitle} - ${smartlinkData.artist.name}`} />
        <meta name="twitter:description" content={smartlinkData.description} />
        <meta name="twitter:image" content={smartlinkData.artworkUrl} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />

        {/* Données structurées JSON-LD pour les moteurs de recherche */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MusicRecording",
              "name": smartlinkData.trackTitle,
              "byArtist": {
                "@type": "MusicGroup",
                "name": smartlinkData.artist.name,
                "url": smartlinkData.artist.socialLinks?.website,
                "sameAs": [
                  smartlinkData.artist.socialLinks?.instagram,
                  smartlinkData.artist.socialLinks?.twitter,
                  smartlinkData.artist.socialLinks?.tiktok
                ].filter(Boolean)
              },
              "image": smartlinkData.artworkUrl,
              "description": smartlinkData.description,
              "genre": smartlinkData.metadata.genre,
              "datePublished": smartlinkData.metadata.releaseDate,
              "duration": smartlinkData.metadata.duration ? `PT${smartlinkData.metadata.duration}S` : undefined,
              "recordLabel": smartlinkData.metadata.label,
              "isrcCode": smartlinkData.metadata.isrc,
              "url": typeof window !== 'undefined' ? window.location.href : '',
              "potentialAction": {
                "@type": "ListenAction",
                "target": sortedPlatforms.map(platform => ({
                  "@type": "EntryPoint",
                  "urlTemplate": platform.url,
                  "actionPlatform": platform.displayName
                }))
              }
            })
          }}
        />

        {/* Preload de l'artwork */}
        <link rel="preload" as="image" href={smartlinkData.artworkUrl} />
      </Head>

      <div className="smartlink-container">
        {/* Header avec artwork et informations */}
        <header className="smartlink-header">
          <div className="artwork-container">
            <Image
              src={smartlinkData.artworkUrl}
              alt={`${smartlinkData.trackTitle} artwork`}
              width={300}
              height={300}
              className="artwork"
              priority
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </div>
          
          <div className="track-info">
            <h1 className="track-title">{smartlinkData.trackTitle}</h1>
            <h2 className="artist-name">{smartlinkData.artist.name}</h2>
            {smartlinkData.description && (
              <p className="description">{smartlinkData.description}</p>
            )}
            
            {/* Métadonnées optionnelles */}
            <div className="metadata">
              {smartlinkData.metadata.genre && (
                <span className="genre">{smartlinkData.metadata.genre}</span>
              )}
              {smartlinkData.metadata.releaseDate && (
                <span className="release-date">
                  {new Date(smartlinkData.metadata.releaseDate).getFullYear()}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Liste des plateformes de streaming */}
        <main className="platforms-section">
          <h3 className="platforms-title">Écouter sur :</h3>
          
          {trackingErrors.length > 0 && (
            <div className="error-banner">
              <p>⚠️ Problème de connexion détecté. Les liens fonctionnent toujours.</p>
            </div>
          )}
          
          <div className="platforms-list">
            {sortedPlatforms.map((platform, index) => (
              <button
                key={platform.id}
                onClick={() => handleServiceClick(platform)}
                disabled={isTracking}
                className={`platform-button ${isTracking ? 'disabled' : ''}`}
                aria-label={`Écouter ${smartlinkData.trackTitle} sur ${platform.displayName}`}
                data-platform={platform.name}
              >
                <div className="platform-icon">
                  <Image
                    src={platform.iconUrl}
                    alt={`${platform.displayName} icon`}
                    width={32}
                    height={32}
                    className="icon"
                  />
                </div>
                
                <span className="platform-name">{platform.displayName}</span>
                
                <div className="platform-action">
                  {isTracking ? (
                    <span className="loading-indicator" aria-hidden="true">...</span>
                  ) : (
                    <span className="arrow" aria-hidden="true">→</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </main>

        {/* Footer avec informations de l'artiste */}
        <footer className="artist-footer">
          {smartlinkData.artist.bio && (
            <div className="artist-bio">
              <h4>À propos de {smartlinkData.artist.name}</h4>
              <p>{smartlinkData.artist.bio}</p>
            </div>
          )}
          
          {smartlinkData.artist.socialLinks && (
            <div className="social-links">
              <h4>Suivre {smartlinkData.artist.name}</h4>
              <div className="social-buttons">
                {smartlinkData.artist.socialLinks.instagram && (
                  <a 
                    href={smartlinkData.artist.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link instagram"
                  >
                    Instagram
                  </a>
                )}
                {smartlinkData.artist.socialLinks.twitter && (
                  <a 
                    href={smartlinkData.artist.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link twitter"
                  >
                    Twitter
                  </a>
                )}
                {smartlinkData.artist.socialLinks.tiktok && (
                  <a 
                    href={smartlinkData.artist.socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link tiktok"
                  >
                    TikTok
                  </a>
                )}
                {smartlinkData.artist.socialLinks.website && (
                  <a 
                    href={smartlinkData.artist.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link website"
                  >
                    Site web
                  </a>
                )}
              </div>
            </div>
          )}
        </footer>

        {/* Informations de debug en développement */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info">
            <details>
              <summary>Debug Info</summary>
              <div className="debug-content">
                <p><strong>SmartLink ID:</strong> {smartlinkData.id}</p>
                <p><strong>Slug:</strong> {smartlinkData.slug}</p>
                <p><strong>Pays détecté:</strong> {userGeoData.country} ({userGeoData.countryCode})</p>
                <p><strong>Région:</strong> {userGeoData.region}</p>
                <p><strong>Plateformes disponibles:</strong> {sortedPlatforms.length}</p>
                <p><strong>Tracking actif:</strong> {isTracking ? 'Oui' : 'Non'}</p>
                <p><strong>Erreurs:</strong> {trackingErrors.length}</p>
                {trackingErrors.map((error, i) => (
                  <p key={i} className="error-text">• {error}</p>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>

      <style jsx>{`
        .smartlink-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 2rem 1rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: white;
        }

        .smartlink-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .artwork-container {
          margin-bottom: 1.5rem;
        }

        .artwork {
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s ease;
        }

        .artwork:hover {
          transform: scale(1.02);
        }

        .track-info {
          margin-top: 1.5rem;
        }

        .track-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }

        .artist-name {
          font-size: 1.2rem;
          font-weight: 500;
          margin: 0 0 1rem 0;
          opacity: 0.9;
        }

        .description {
          font-size: 0.95rem;
          line-height: 1.5;
          opacity: 0.8;
          margin: 1rem 0;
        }

        .metadata {
          display: flex;
          gap: 1rem;
          justify-content: center;
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .platforms-section {
          margin: 2rem 0;
        }

        .platforms-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          text-align: center;
          opacity: 0.9;
        }

        .error-banner {
          background: rgba(255, 193, 7, 0.2);
          border: 1px solid rgba(255, 193, 7, 0.5);
          border-radius: 8px;
          padding: 0.75rem;
          margin-bottom: 1rem;
          text-align: center;
          font-size: 0.9rem;
        }

        .platforms-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .platform-button {
          display: flex;
          align-items: center;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
        }

        .platform-button:hover:not(.disabled) {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .platform-button.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .platform-icon {
          margin-right: 1rem;
          display: flex;
          align-items: center;
        }

        .icon {
          border-radius: 6px;
        }

        .platform-name {
          flex: 1;
          text-align: left;
          font-weight: 500;
        }

        .platform-action {
          margin-left: 1rem;
          font-size: 1.2rem;
          opacity: 0.7;
        }

        .loading-indicator {
          font-size: 1rem;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.3; }
        }

        .artist-footer {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .artist-bio {
          margin-bottom: 2rem;
          text-align: center;
        }

        .artist-bio h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .artist-bio p {
          font-size: 0.9rem;
          line-height: 1.5;
          opacity: 0.8;
        }

        .social-links {
          text-align: center;
        }

        .social-links h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .social-buttons {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .social-link {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          color: white;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .social-link:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .debug-info {
          margin-top: 2rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          font-size: 0.8rem;
        }

        .debug-content {
          margin-top: 0.5rem;
        }

        .debug-content p {
          margin: 0.25rem 0;
        }

        .error-text {
          color: #ff6b6b;
        }

        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          font-family: 'Inter', sans-serif;
        }

        .error-content {
          padding: 2rem;
        }

        .error-content h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .error-content p {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          opacity: 0.8;
        }

        .error-content button {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .error-content button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 640px) {
          .smartlink-container {
            padding: 1.5rem 1rem;
          }

          .track-title {
            font-size: 1.5rem;
          }

          .artist-name {
            font-size: 1.1rem;
          }

          .platform-button {
            padding: 0.9rem 1rem;
          }

          .social-buttons {
            gap: 0.5rem;
          }

          .social-link {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
}