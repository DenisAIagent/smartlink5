import React from 'react';
import SignupForm from './SignupForm';

const HeroSection = () => {
  const scrollToForm = () => {
    const form = document.getElementById('signup-form');
    form?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <div className="social-proof">
            <span className="social-proof-stars">★★★★★</span>
            <span>Rejoignez 500+ concierges qui nous font confiance</span>
          </div>

          <h1>
            Augmentez vos revenus de <span className="hero-highlight">+40%</span> avec la conciergerie de luxe #1
          </h1>

          <p className="hero-subtitle">
            Fini les heures perdues à chercher des prestataires premium. LuxBoard centralise 
            500+ partenaires de luxe vérifiés avec des tarifs privilèges exclusifs.
          </p>

          <ul className="value-props">
            <li>
              <div className="check-icon">✓</div>
              <span><strong>Gagnez 2h par jour</strong> avec notre base de données premium</span>
            </li>
            <li>
              <div className="check-icon">✓</div>
              <span><strong>Commissions exclusives</strong> sur 150+ offres privilèges</span>
            </li>
            <li>
              <div className="check-icon">✓</div>
              <span><strong>Clients plus satisfaits</strong> = plus de recommandations</span>
            </li>
          </ul>

          <div className="hero-ctas">
            <button className="cta-primary" onClick={scrollToForm}>
              <i data-feather="play-circle"></i>
              Commencer mon essai gratuit
            </button>
            <a href="#demo" className="cta-secondary">
              <i data-feather="video"></i>
              Voir la démo (2 minutes)
            </a>
            <div className="urgency-text">⚡ Offre limitée : -50% les 3 premiers mois</div>
            <div className="guarantee-text">✅ Garantie remboursé sous 30 jours</div>
          </div>

          <div className="trust-indicators">
            <div className="trust-item">
              <i data-feather="shield"></i>
              <span>Données sécurisées</span>
            </div>
            <div className="trust-item">
              <i data-feather="clock"></i>
              <span>Support 24/7</span>
            </div>
            <div className="trust-item">
              <i data-feather="award"></i>
              <span>Certifié RGPD</span>
            </div>
          </div>
        </div>

        <SignupForm />
      </div>
    </section>
  );
};

export default HeroSection; 