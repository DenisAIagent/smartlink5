import React, { useState, useEffect } from 'react';
import { getLatestPosts } from '../services/wordpress.service';
import BlogLoadingState from './BlogLoadingState';
import '../styles/LatestPosts.css';

const LatestPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getLatestPosts(3);
        setPosts(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des articles:', err);
        setError('Impossible de charger les articles. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <BlogLoadingState />;
  }

  if (error) {
    return (
      <div className="error-container" role="alert">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <section className="latest-posts" aria-labelledby="latest-posts-title">
      <h2 id="latest-posts-title" className="section-title">Derniers Articles</h2>
      <div className="posts-grid">
        {posts.map((post) => (
          <article key={post.id} className="post-card">
            {post.image && (
              <div className="post-image-container">
                <picture>
                  <source srcSet={post.image.replace(/\.(jpg|jpeg|png)$/, '.webp')} type="image/webp" />
                  <img
                    src={post.image}
                    alt=""
                    className="post-image"
                    loading="lazy"
                    width="400"
                    height="225"
                  />
                </picture>
              </div>
            )}
            <div className="post-content">
              <time dateTime={post.date} className="post-date">
                {post.date}
              </time>
              <h3 className="post-title">
                <a href={post.link} target="_blank" rel="noopener noreferrer">
                  {post.title}
                </a>
              </h3>
              <div 
                className="post-excerpt"
                dangerouslySetInnerHTML={{ __html: post.excerpt }}
              />
              <a
                href={post.link}
                className="read-more"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Lire l'article : ${post.title}`}
              >
                Lire la suite
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default LatestPosts; 