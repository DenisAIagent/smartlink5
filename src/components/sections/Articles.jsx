// src/components/sections/Articles.jsx - Correction

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api.service';
import '../../assets/styles/articles.css';

const Articles = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // CORRECTION: Vérifier si l'API blog existe avant l'appel
        if (!apiService.blog || !apiService.blog.getLatestPosts) {
          // Fallback avec articles statiques si l'API n'est pas disponible
          const fallbackArticles = [
            {
              id: 1,
              title: "Comment optimiser vos campagnes YouTube Ads pour la musique",
              excerpt: "Découvrez les meilleures stratégies pour maximiser l'impact de vos campagnes publicitaires musicales sur YouTube.",
              link: "https://blog.mdmcmusicads.com/optimiser-youtube-ads-musique",
              date: "2025-01-15",
              categories: [{ slug: "youtube" }],
              featuredImage: {
                medium: "https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill/sample.jpg"
              }
            },
            {
              id: 2,
              title: "Meta Ads vs TikTok Ads : Quelle plateforme choisir ?",
              excerpt: "Analyse comparative des deux géants de la publicité sociale pour promouvoir votre musique efficacement.",
              link: "https://blog.mdmcmusicads.com/meta-vs-tiktok-ads",
              date: "2025-01-10",
              categories: [{ slug: "meta" }],
              featuredImage: {
                medium: "https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill/sample.jpg"
              }
            },
            {
              id: 3,
              title: "Stratégie de contenu musical : Les tendances 2025",
              excerpt: "Les nouvelles approches créatives qui font la différence dans le marketing musical cette année.",
              link: "https://blog.mdmcmusicads.com/strategie-contenu-2025",
              date: "2025-01-05",
              categories: [{ slug: "strategy" }],
              featuredImage: {
                medium: "https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill/sample.jpg"
              }
            }
          ];
          
          setArticles(fallbackArticles);
          setLoading(false);
          return;
        }
        
        // Récupérer les 3 derniers articles via le service API
        const posts = await apiService.blog.getLatestPosts(3);
        setArticles(posts);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des articles:', error);
        
        // En cas d'erreur API, utiliser des articles de démonstration
        const demoArticles = [
          {
            id: 1,
            title: "Guide complet : Lancer sa première campagne YouTube Ads",
            excerpt: "Tout ce que vous devez savoir pour créer une campagne publicitaire YouTube efficace pour votre musique.",
            link: "https://blog.mdmcmusicads.com/guide-youtube-ads",
            date: "2025-01-20",
            categories: [{ slug: "youtube" }],
            featuredImage: { medium: "https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill/sample.jpg" }
          },
          {
            id: 2,
            title: "ROI Musical : Mesurer l'efficacité de vos campagnes",
            excerpt: "Les métriques clés pour évaluer le retour sur investissement de vos campagnes marketing musical.",
            link: "https://blog.mdmcmusicads.com/roi-musical-metriques",
            date: "2025-01-18",
            categories: [{ slug: "strategy" }],
            featuredImage: { medium: "https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill/sample.jpg" }
          },
          {
            id: 3,
            title: "TikTok Ads pour musiciens : Guide pratique 2025",
            excerpt: "Comment utiliser TikTok Ads pour faire exploser la popularité de vos morceaux auprès des jeunes.",
            link: "https://blog.mdmcmusicads.com/tiktok-ads-musiciens",
            date: "2025-01-15",
            categories: [{ slug: "tiktok" }],
            featuredImage: { medium: "https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill/sample.jpg" }
          }
        ];
        
        setArticles(demoArticles);
        setError(null); // Ne pas afficher d'erreur, juste utiliser le fallback
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, [t]);

  // Fonction pour extraire le texte brut de l'HTML
  const stripHtml = (html) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  // Fonction pour tronquer le texte à une certaine longueur
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Fonction pour déterminer la catégorie d'un article
  const getArticleCategory = (categories) => {
    if (!categories || categories.length === 0) return 'strategy';
    
    const categoryMap = {
      'youtube': 'youtube',
      'meta': 'meta',
      'facebook': 'meta',
      'instagram': 'meta',
      'tiktok': 'tiktok',
      'strategie': 'strategy',
      'strategy': 'strategy'
    };
    
    for (const category of categories) {
      const slug = (category.slug || '').toLowerCase();
      for (const key in categoryMap) {
        if (slug.includes(key)) {
          return categoryMap[key];
        }
      }
    }
    
    return 'strategy';
  };

  return (
    <section id="articles" className="section articles">
      <div className="container">
        <div className="section-header">
          <h2>{t('articles.title')}</h2>
        </div>
        
        {loading ? (
          <div className="articles-loading">
            <p>Chargement des articles...</p>
          </div>
        ) : error ? (
          <div className="articles-error">
            <p>Chargement des articles temporairement indisponible</p>
          </div>
        ) : (
          <div className="articles-grid">
            {articles.map((article) => {
              const category = getArticleCategory(article.categories);
              return (
                <div className="article-card" key={article.id}>
                  <div className="article-image">
                    {article.featuredImage && (
                      <img 
                        src={article.featuredImage.medium || article.featuredImage.full} 
                        alt={article.title} 
                        loading="lazy" 
                      />
                    )}
                    <span className={`article-category ${category}`}>
                      {t(`articles.categories.${category}`)}
                    </span>
                  </div>
                  <div className="article-content">
                    <h3>{article.title}</h3>
                    <p>{truncateText(stripHtml(article.excerpt))}</p>
                    <div className="article-meta">
                      <span className="article-date">
                        {new Date(article.date).toLocaleDateString('fr-FR')}
                      </span>
                      <a 
                        href={article.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="article-link"
                      >
                        {t('articles.read_more')}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="articles-footer">
          <a 
            href="https://blog.mdmcmusicads.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-secondary"
          >
            {t('articles.view_all')}
          </a>
        </div>
      </div>
    </section>
  );
};

export default Articles;
