import React from 'react';

const SignupForm = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de soumission du formulaire à implémenter
  };

  return (
    <div className="hero-form" id="signup-form">
      <div className="exclusive-badge">Accès Privilège</div>
      
      <div className="form-title">Essai Gratuit</div>
      <div className="form-subtitle">14 jours sans engagement</div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Nom complet</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            className="form-input" 
            placeholder="Votre nom complet"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Adresse e-mail</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            className="form-input" 
            placeholder="votre@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="phone">Téléphone</label>
          <input 
            type="tel" 
            id="phone" 
            name="phone" 
            className="form-input" 
            placeholder="06 12 34 56 78"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="company">Entreprise</label>
          <input 
            type="text" 
            id="company" 
            name="company" 
            className="form-input" 
            placeholder="Nom de votre entreprise"
          />
        </div>

        <button type="submit" className="form-button">
          Démarrer mon essai gratuit
        </button>
      </form>

      <div className="form-footer">
        ✅ Sans engagement • ✅ Support inclus • ✅ Configuration gratuite
      </div>
    </div>
  );
};

export default SignupForm; 