import React from 'react';

export default function SignupForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de soumission du formulaire à implémenter
  };

  return (
    <div className="signup-form-container" id="signup-form">
      {/* Badge accès privilège */}
      <div className="signup-form-badge">ACCÈS PRIVILÈGE</div>
      {/* Titre et sous-titre */}
      <div className="signup-form-title">ESSAI GRATUIT</div>
      <div className="signup-form-subtitle">14 jours sans engagement</div>
      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="signup-form">
        <label htmlFor="name">Nom complet</label>
        <input id="name" name="name" type="text" placeholder="Votre nom complet" required />
        <label htmlFor="email">Adresse e-mail</label>
        <input id="email" name="email" type="email" placeholder="votre@email.com" required />
        <label htmlFor="phone">Téléphone</label>
        <input id="phone" name="phone" type="tel" placeholder="06 12 34 56 78" required />
        <label htmlFor="company">Entreprise</label>
        <input id="company" name="company" type="text" placeholder="Nom de votre entreprise" />
        <button type="submit" className="signup-form-btn">DÉMARRER MON ESSAI GRATUIT</button>
      </form>
      {/* Mentions */}
      <div className="signup-form-footer">
        <span className="success">✓ Sans engagement</span> <span className="success">✓ Support inclus</span><br />
        <span className="info">Configuration gratuite</span>
      </div>
    </div>
  );
} 