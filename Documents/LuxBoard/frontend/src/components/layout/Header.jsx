import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const scrollToForm = () => {
    const form = document.getElementById('signup-form');
    form?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="header">
      <nav className="nav">
        <a href="/" className="logo">
          <img 
            src="https://i.postimg.cc/FHNQXBwp/Chat-GPT-Image-1-juin-2025-15-02-02.png" 
            alt="LuxBoard Logo" 
            className="logo-image"
          />
          <div className="logo-text">LuxBoard</div>
        </a>
        <div className="header-cta">
          <a href="tel:+33123456789" className="header-phone">
            <i data-feather="phone"></i>
            01 23 45 67 89
          </a>
          <button className="header-button" onClick={scrollToForm}>
            Essai gratuit 14j
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header; 