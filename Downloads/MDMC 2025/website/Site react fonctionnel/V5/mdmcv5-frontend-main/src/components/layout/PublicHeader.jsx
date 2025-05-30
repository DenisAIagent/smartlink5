import React from 'react';
import { Link } from 'react-router-dom';
import './PublicHeader.css';

/**
 * Composant Header pour l'interface publique
 * Version simplifiée sans menu utilisateur ni fonctionnalités d'administration
 * Utilisé uniquement sur les pages publiques du site
 */
const PublicHeader = () => {
  return (
    <header className="public-header">
      <div className="container">
        <div className="logo">
          <Link to="/">MDMC Music Ads</Link>
        </div>
        <nav className="main-nav">
          <ul>
            <li><a href="#services">Services</a></li>
            <li><a href="#about">À propos</a></li>
            <li><a href="#articles">Articles</a></li>
            <li><a href="#reviews">Avis</a></li>
            <li><a href="#contact">Contact</a></li>
            <li className="admin-link"><Link to="/admin">Admin</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default PublicHeader;
