import React from 'react';
import './CaseStudySection.css';

const CaseStudySection = ({ title, description, stats, image, caption }) => {
  return (
    <section className="case-study-section">
      <div className="case-study-container">
        <h2>{title}</h2>
        <div className="case-study-content">
          <div className="case-study-text">
            <p>{description}</p>
            <div className="case-study-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="case-study-image">
            <img src={image} alt={title} />
            <span className="image-caption">{caption}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudySection; 