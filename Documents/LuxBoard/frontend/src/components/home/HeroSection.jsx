import React from 'react';
import SignupForm from './SignupForm';

export default function HeroSection() {
  const scrollToForm = () => {
    const form = document.getElementById('signup-form');
    form?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" style={{paddingTop: '5rem'}}>
      <div className="hero-content">
        {/* Colonne gauche */}
        <div className="hero-text">
          {/* Badge social proof */}
          <div className="social-proof">
            <span className="social-proof-stars">★★★★★</span>
            <span>Rejoignez 500+ concierges qui nous font confiance</span>
          </div>

          {/* Titre principal */}
          <h1>
            AUGMENTEZ VOS REVENUS DE <span className="hero-highlight">+40%</span><br />
            AVEC LA CONCIERGERIE DE LUXE #1
          </h1>

          {/* Sous-titre */}
          <div className="hero-subtitle">
            Fini les heures perdues à chercher des prestataires premium. LuxBoard centralise 500+ partenaires de luxe vérifiés avec des tarifs privilèges exclusifs.
          </div>

          {/* Liste des bénéfices */}
          <ul className="value-props">
            <li><span className="check-icon">✓</span> <strong>Gagnez 2h par jour</strong> avec notre base de données premium</li>
            <li><span className="check-icon">✓</span> <strong>Commissions exclusives</strong> sur 150+ offres privilégiées</li>
            <li><span className="check-icon">✓</span> <strong>Clients plus satisfaits</strong> = plus de recommandations</li>
          </ul>

          {/* CTA */}
          <div className="hero-ctas">
            <button className="cta-primary" onClick={scrollToForm}>
              <i data-feather="play-circle"></i>
              Commencer mon essai gratuit
            </button>
            <a href="#demo" className="cta-secondary">
              <i data-feather="video"></i>
              Voir la démo (2 minutes)
            </a>
          </div>

          {/* Offre limitée et garantie */}
          <div className="urgency-text">★ Offre limitée : -50% les 3 premiers mois</div>
          <div className="guarantee-text">✔ Garantie remboursé sous 30 jours</div>

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

        {/* Colonne droite : Formulaire */}
        <SignupForm />
      </div>
    </section>
  );
} 