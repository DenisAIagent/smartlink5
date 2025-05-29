import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './assets/styles/global.css';
import './assets/styles/animations.css';

// Import des composants publics uniquement
// import PublicHeader from './components/layout/PublicHeader';
import Hero from './components/sections/Hero';
import Services from './components/sections/Services';
import About from './components/sections/About';
import Articles from './components/sections/Articles';
import Reviews from './components/sections/Reviews';
import Contact from './components/sections/Contact';
import Footer from './components/layout/Footer';
import Simulator from './components/features/Simulator';
import CookieBanner from './components/features/CookieBanner';
import AllReviews from './components/pages/AllReviews';

// Import de la configuration i18n
import { updateMetaTags } from './i18n';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';

// Composant pour la page d'accueil
const HomePage = ({ openSimulator }) => {
  // Utilisation du hook personnalisé pour l'animation des sections
  useIntersectionObserver();
  
  return (
    <>
      {/* <PublicHeader /> */}
      <main>
        <Hero openSimulator={openSimulator} />
        <Services />
        <About />
        <Articles />
        <Reviews />
        <Contact />
      </main>
      <Footer openSimulator={openSimulator} />
      <CookieBanner />
    </>
  );
};

function App() {
  const { t, i18n } = useTranslation();
  const simulatorRef = useRef(null);
  
  // Mise à jour des balises meta lors du changement de langue
  useEffect(() => {
    updateMetaTags(t);
    
    // Mise à jour de l'attribut lang de la balise html
    const lang = i18n.language.split('-')[0];
    document.documentElement.setAttribute('lang', lang);
    
    // Mise à jour de la balise meta og:locale
    const ogLocaleValue = i18n.language.replace('-', '_');
    const ogLocaleElement = document.querySelector('meta[property="og:locale"]');
    if (ogLocaleElement) {
      ogLocaleElement.setAttribute('content', ogLocaleValue);
    }
  }, [t, i18n.language]);
  
  // Fonction pour ouvrir le simulateur
  const openSimulator = () => {
    if (simulatorRef.current) {
      simulatorRef.current.openSimulator();
    }
  };
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage openSimulator={openSimulator} />} />
        <Route path="/all-reviews" element={<AllReviews />} />
        {/* Redirection des routes admin vers l'application admin */}
        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Simulator ref={simulatorRef} />
    </Router>
  );
}

export default App;
