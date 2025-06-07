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
        
        // Récupérer les 3 derniers articles via le service API
        const posts = await apiService.getLatestBlogPosts(3);
        setArticles(posts);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des articles:', error);
        setError(t('articles.error_loading'));
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, [t]);

  // Fonction pour extraire le texte brut de l'HTML
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  // Fonction pour tronquer le texte à une certaine longueur
  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Fonction pour déterminer la catégorie d'un article
  const getArticleCategory = (categories) => {
    if (!categories || categories.length === 0) return 'strategy';
    
    // Mapper les catégories WordPress aux catégories de l'application
    const categoryMap = {
      youtube: 'youtube',
      meta: 'meta',
      facebook: 'meta',
      instagram: 'meta',
      tiktok: 'tiktok',
      strategie: 'strategy',
      strategy: 'strategy'
    };
    
    // Trouver la première catégorie qui correspond à notre mapping
    for (const category of categories) {
      const slug = category.slug.toLowerCase();
      for (const key in categoryMap) {
        if (slug.includes(key)) {
          return categoryMap[key];
        }
      }
    }
    
    // Par défaut, retourner 'strategy'
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
                      <span className="article-date">{article.date}</span>
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
