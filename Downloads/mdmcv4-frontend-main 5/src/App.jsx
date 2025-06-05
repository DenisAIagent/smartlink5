import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import AppRoutes from './routes';
import ErrorBoundary from './components/common/ErrorBoundary';
import performanceMonitor from './utils/performance';
import logger from './utils/logger';
import Hero from './components/landing/Hero';
import Services from './components/landing/Services';
import Reviews from './components/landing/Reviews';
import CaseStudySection from './components/CaseStudySection';

function App() {
  useEffect(() => {
    // Mesure du temps de chargement initial
    performanceMonitor.measureInitialLoad();

    // Configuration des seuils de performance
    performanceMonitor.setThresholds({
      initialLoad: 3000,
      componentRender: 100,
      apiCall: 1000
    });

    // Vérification périodique des performances
    const interval = setInterval(() => {
      const warnings = performanceMonitor.checkPerformance();
      if (warnings.length > 0) {
        logger.warn('Avertissements de performance', { warnings });
      }
    }, 60000); // Vérification toutes les minutes

    return () => clearInterval(interval);
  }, []);

  const merchandisingStats = [
    { value: '731,66%', label: 'ROAS' },
    { value: '2,4k €', label: 'Valeur' },
    { value: '328 €', label: 'Coût' }
  ];

  const streamingStats = [
    { value: '4 050', label: 'Conversions' },
    { value: '0,05 €', label: 'Coût/conversion' },
    { value: '201 €', label: 'Coût' }
  ];

  const youtubeStats = [
    { value: '27 300', label: 'Vues' },
    { value: '4,29%', label: 'Taux de conv.' },
    { value: '2 290', label: 'Conversions' },
    { value: '214 €', label: 'Coût' }
  ];

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <div className="app">
            <Hero />
            
            <CaseStudySection
              title="Preuves de résultats - Merchandising"
              description="Découvrez comment nous avons aidé un artiste à multiplier ses ventes de merchandising par 7 en seulement 2 mois."
              stats={merchandisingStats}
              image="/assets/stats-merchandising-mdmc.png"
              caption="Avril–Mai 2025"
            />

            <Services />

            <CaseStudySection
              title="Cas client - Streaming"
              description="Une campagne ciblée qui a généré plus de 4000 conversions à un coût par conversion ultra-compétitif."
              stats={streamingStats}
              image="/assets/stats-streaming-campaign.png"
              caption="Nov–Déc 2024"
            />

            <CaseStudySection
              title="Performance YouTube"
              description="Une campagne vidéo qui a généré plus de 27 000 vues avec un excellent taux de conversion."
              stats={youtubeStats}
              image="/assets/stats-youtube-campaign.png"
              caption="Avril–Mai 2025"
            />

            <Reviews />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App; 