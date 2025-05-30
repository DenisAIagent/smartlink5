import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/admin.css';
import MarketingIntegrations from './MarketingIntegrations';
import WordPressConnector from './WordPressConnector';
import LandingPageGenerator from './LandingPageGenerator';
import AdminChatbot from './AdminChatbot';
import AuthenticationSettings from './AuthenticationSettings';
import WordPressSync from './WordPressSync';

const AdminPanel = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingReviews, setPendingReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Détecter la taille de l'écran pour la responsivité
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simuler le chargement des données
  useEffect(() => {
    // Dans une version réelle, cela serait une requête API
    setTimeout(() => {
      setPendingReviews([
        {
          id: 'rev-001',
          name: 'Pierre Martin',
          email: 'pierre.martin@example.com',
          rating: 5,
          message: "J'ai adoré travailler avec MDMC pour ma dernière campagne. Les résultats ont dépassé mes attentes !",
          date: '2025-04-26T14:32:00Z',
          status: 'pending'
        },
        {
          id: 'rev-002',
          name: 'Laura Dubois',
          email: 'laura.d@example.com',
          rating: 4,
          message: "Très bonne expérience avec l'équipe de MDMC. Professionnels et à l'écoute.",
          date: '2025-04-26T16:45:00Z',
          status: 'pending'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Fonction pour se déconnecter
  const handleLogout = () => {
    localStorage.removeItem('mdmc_admin_auth');
    window.location.href = '/admin';
  };

  // Fonction pour approuver un avis
  const approveReview = (id) => {
    // Dans une version réelle, cela enverrait une requête API
    setPendingReviews(pendingReviews.filter(review => review.id !== id));
  };

  // Fonction pour rejeter un avis
  const rejectReview = (id) => {
    // Dans une version réelle, cela enverrait une requête API
    setPendingReviews(pendingReviews.filter(review => review.id !== id));
  };

  // Fonction pour générer un lien d'avis
  const generateReviewLink = () => {
    // Dans une version réelle, cela générerait un lien unique
    const uniqueId = Math.random().toString(36).substring(2, 10);
    return `${window.location.origin}/review/${uniqueId}`;
  };

  // Fonction pour basculer l'état de la barre latérale
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Rendu du contenu en fonction de l'onglet actif
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="admin-dashboard">
            <h2>{t('admin.dashboard')}</h2>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>2</h3>
                <p>{t('admin.pending_reviews')}</p>
              </div>
              <div className="stat-card">
                <h3>15</h3>
                <p>{t('admin.approved_reviews')}</p>
              </div>
              <div className="stat-card">
                <h3>3</h3>
                <p>{t('admin.active_campaigns')}</p>
              </div>
              <div className="stat-card">
                <h3>8</h3>
                <p>{t('admin.total_campaigns')}</p>
              </div>
            </div>
            <div className="recent-activity">
              <h3>{t('admin.recent_activity')}</h3>
              <ul>
                <li>
                  <span className="activity-time">14:32</span>
                  <span className="activity-text">{t('admin.new_review_received')}</span>
                </li>
                <li>
                  <span className="activity-time">11:15</span>
                  <span className="activity-text">{t('admin.content_updated')}</span>
                </li>
                <li>
                  <span className="activity-time">09:45</span>
                  <span className="activity-text">{t('admin.campaign_started')}</span>
                </li>
              </ul>
            </div>
          </div>
        );
      case 'reviews':
        return (
          <div className="admin-reviews">
            <h2>{t('admin.reviews_management')}</h2>
            <div className="review-actions">
              <button className="btn btn-primary" onClick={() => {
                const link = generateReviewLink();
                navigator.clipboard.writeText(link);
                alert(t('admin.link_copied'));
              }}>
                {t('admin.generate_review_link')}
              </button>
            </div>
            <h3>{t('admin.pending_reviews')} ({pendingReviews.length})</h3>
            {isLoading ? (
              <div className="loading-spinner">{t('admin.loading')}</div>
            ) : (
              <div className="reviews-list">
                {pendingReviews.length === 0 ? (
                  <p className="no-reviews">{t('admin.no_pending_reviews')}</p>
                ) : (
                  pendingReviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <h4>{review.name}</h4>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`star ${i < review.rating ? 'filled' : 'empty'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="review-email">{review.email}</p>
                      <p className="review-message">{review.message}</p>
                      <div className="review-actions">
                        <button className="btn btn-approve" onClick={() => approveReview(review.id)}>
                          {t('admin.approve')}
                        </button>
                        <button className="btn btn-reject" onClick={() => rejectReview(review.id)}>
                          {t('admin.reject')}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      case 'content':
        return (
          <div className="admin-content-section">
            <h2>{t('admin.content_management')}</h2>
            <div className="content-editor">
              <div className="language-selector">
                <label>{t('admin.select_language')}</label>
                <select>
                  <option value="fr">{t('language.fr')}</option>
                  <option value="en">{t('language.en')}</option>
                  <option value="es">{t('language.es')}</option>
                  <option value="pt">{t('language.pt')}</option>
                </select>
              </div>
              <div className="section-selector">
                <label>{t('admin.select_section')}</label>
                <select>
                  <option value="hero">{t('admin.section_hero')}</option>
                  <option value="services">{t('admin.section_services')}</option>
                  <option value="about">{t('admin.section_about')}</option>
                  <option value="contact">{t('admin.section_contact')}</option>
                </select>
              </div>
              <div className="content-fields">
                <div className="form-group">
                  <label>{t('admin.field_title')}</label>
                  <input type="text" defaultValue="Propulsez votre musique avec des campagnes publicitaires qui convertissent" />
                </div>
                <div className="form-group">
                  <label>{t('admin.field_subtitle')}</label>
                  <input type="text" defaultValue="Push. Play. Blow up." />
                </div>
                <div className="form-group">
                  <label>{t('admin.field_description')}</label>
                  <textarea rows="4" defaultValue="Expertise en YouTube Ads, Meta Ads, TikTok Ads et stratégie de contenu pour artistes et labels." />
                </div>
                <button className="btn btn-primary">{t('admin.save_changes')}</button>
              </div>
            </div>
          </div>
        );
      case 'media':
        return (
          <div className="admin-media">
            <h2>{t('admin.media_management')}</h2>
            <div className="media-uploader">
              <div className="upload-zone">
                <input type="file" id="media-upload" multiple hidden />
                <label htmlFor="media-upload" className="upload-label">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{t('admin.drop_files')}</span>
                </label>
              </div>
              <div className="media-gallery">
                <h3>{t('admin.recent_uploads')}</h3>
                <div className="gallery-grid">
                  <div className="media-item">
                    <img src="/src/assets/images/logo.png" alt="Logo" />
                    <div className="media-actions">
                      <button className="btn-icon">{t('admin.view')}</button>
                      <button className="btn-icon">{t('admin.delete')}</button>
                    </div>
                  </div>
                  <div className="media-item">
                    <img src="/src/assets/images/hero-bg.jpg" alt="Hero background" />
                    <div className="media-actions">
                      <button className="btn-icon">{t('admin.view')}</button>
                      <button className="btn-icon">{t('admin.delete')}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return <AuthenticationSettings />;
      case 'wordpress-sync':
        return <WordPressSync />;
      case 'marketing-integrations':
        return <MarketingIntegrations />;
      case 'wordpress':
        return <WordPressConnector />;
      case 'landing-pages':
        return <LandingPageGenerator />;
      default:
        return null;
    }
  };

  return (
    <div className={`admin-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <AdminChatbot />
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <div className="admin-logo">
            <h1>MDMC</h1>
            <p>Admin</p>
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        <div className="admin-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="9" rx="2" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="5" rx="2" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="12" width="7" height="9" rx="2" stroke="currentColor" strokeWidth="2"/>
              <rect x="3" y="16" width="7" height="5" rx="2" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="nav-text">{t('admin.dashboard')}</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.0489 3.92705C11.3483 3.00574 12.6517 3.00574 12.9511 3.92705L14.0206 7.21885C14.1545 7.63087 14.5385 7.90983 14.9717 7.90983H18.4329C19.4016 7.90983 19.8044 9.14945 19.0207 9.71885L16.2205 11.7533C15.8684 12.0079 15.7234 12.4593 15.8572 12.8713L16.9268 16.1631C17.2261 17.0844 16.1717 17.8506 15.388 17.2812L12.5878 15.2467C12.2356 14.9921 11.7644 14.9921 11.4122 15.2467L8.61204 17.2812C7.82833 17.8506 6.77385 17.0844 7.0732 16.1631L8.14277 12.8713C8.27665 12.4593 8.13162 12.0079 7.77946 11.7533L4.97926 9.71885C4.19555 9.14945 4.59834 7.90983 5.56712 7.90983H9.02832C9.46154 7.90983 9.8455 7.63087 9.97937 7.21885L11.0489 3.92705Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="nav-text">
              {t('admin.reviews')}
              {pendingReviews.length > 0 && (
                <span className="badge">{pendingReviews.length}</span>
              )}
            </span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 7H4M14 12H4M14 17H4M19 7V17M17 9H21M17 15H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">{t('admin.content')}</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.5 11C9.32843 11 10 10.3284 10 9.5C10 8.67157 9.32843 8 8.5 8C7.67157 8 7 8.67157 7 9.5C7 10.3284 7.67157 11 8.5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 14L17.5 11L9 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">{t('admin.media')}</span>
          </button>
          <div className="nav-divider"></div>
          <button 
            className={`nav-item ${activeTab === 'marketing-integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('marketing-integrations')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 14L11 10L15 14L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">{t('admin.marketing_integrations')}</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'wordpress' ? 'active' : ''}`}
            onClick={() => setActiveTab('wordpress')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM3.68 12C3.68 7.41 7.41 3.68 12 3.68C16.59 3.68 20.32 7.41 20.32 12C20.32 16.59 16.59 20.32 12 20.32C7.41 20.32 3.68 16.59 3.68 12ZM12 6.8C9.1 6.8 6.8 9.1 6.8 12C6.8 14.9 9.1 17.2 12 17.2C14.9 17.2 17.2 14.9 17.2 12C17.2 9.1 14.9 6.8 12 6.8Z" fill="currentColor"/>
            </svg>
            <span className="nav-text">{t('admin.wordpress_connector')}</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'wordpress-sync' ? 'active' : ''}`}
            onClick={() => setActiveTab('wordpress-sync')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 6L12 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">{t('admin.wordpress_sync')}</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'landing-pages' ? 'active' : ''}`}
            onClick={() => setActiveTab('landing-pages')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">{t('admin.landing_pages')}</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">{t('admin.settings')}</span>
          </button>
        </div>
        <div className="admin-logout">
          <button onClick={handleLogout}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">{t('admin.logout')}</span>
          </button>
        </div>
      </div>
      <div className="admin-content-wrapper">
        {isMobile && (
          <div className="admin-header">
            <div className="header-left">
              <button className="mobile-menu-toggle" onClick={toggleSidebar}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1>MDMC Admin</h1>
            </div>
            <div className="admin-user">
              <div className="user-avatar">A</div>
            </div>
          </div>
        )}
        <div className="admin-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
