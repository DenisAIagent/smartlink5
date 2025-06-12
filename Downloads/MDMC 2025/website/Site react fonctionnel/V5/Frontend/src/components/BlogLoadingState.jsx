import React from 'react';
import '../styles/BlogLoadingState.css';

const BlogLoadingState = () => {
  return (
    <div className="blog-loading-container" role="status" aria-label="Chargement des articles">
      {[1, 2, 3].map((index) => (
        <article key={index} className="blog-card-skeleton">
          <div className="image-skeleton" />
          <div className="content-skeleton">
            <div className="title-skeleton" />
            <div className="date-skeleton" />
            <div className="excerpt-skeleton" />
            <div className="button-skeleton" />
          </div>
        </article>
      ))}
    </div>
  );
};

export default BlogLoadingState; 