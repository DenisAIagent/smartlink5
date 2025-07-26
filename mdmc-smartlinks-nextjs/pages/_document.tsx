import { Html, Head, Main, NextScript } from 'next/document';

// Configuration GTM globale (à adapter selon vos besoins)
const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || 'GTM-XXXXXXX';
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Préchargement des ressources critiques */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="//connect.facebook.net" />
        <link rel="dns-prefetch" href="//analytics.tiktok.com" />

        {/* Fonts Google - Optimisées pour les performances */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />

        {/* Initialisation du dataLayer avant le script GTM */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialisation du dataLayer global
              window.dataLayer = window.dataLayer || [];
              
              // Fonction helper pour pousser des événements
              function gtag(){dataLayer.push(arguments);}
              
              // Configuration initiale GA4
              gtag('js', new Date());
              gtag('config', '${GA4_MEASUREMENT_ID}', {
                page_title: document.title,
                page_location: window.location.href
              });
              
              // Configuration initiale pour GTM
              window.dataLayer.push({
                'gtm.start': new Date().getTime(),
                'event': 'gtm.js',
                'platform': 'smartlink_nextjs',
                'app_version': '2.0.0',
                'environment': '${process.env.NODE_ENV || 'development'}',
                'build_time': '${new Date().toISOString()}'
              });
              
              console.log('[TRACKING] DataLayer initialisé globalement');
            `,
          }}
        />

        {/* Script GA4 principal */}
        <script 
          async 
          src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
        />

        {/* Script GTM principal */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');
            `,
          }}
        />

        {/* Meta Pixel - Si configuré globalement */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                fbq('track', 'PageView');
                
                console.log('[META PIXEL] Initialisé avec ID: ${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
              `,
            }}
          />
        )}

        {/* Métadonnées globales */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="robots" content="index, follow" />
        
        {/* Favicons optimisés */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Manifest pour PWA */}
        <link rel="manifest" href="/manifest.json" />

        {/* Preload des images critiques communes */}
        <link rel="preload" as="image" href="/assets/images/default-artwork.webp" />
        
        {/* CSP pour la sécurité */}
        <meta httpEquiv="Content-Security-Policy" content={`
          default-src 'self';
          script-src 'self' 'unsafe-inline' 'unsafe-eval' 
            https://www.googletagmanager.com 
            https://www.google-analytics.com 
            https://connect.facebook.net 
            https://analytics.tiktok.com;
          style-src 'self' 'unsafe-inline' 
            https://fonts.googleapis.com;
          font-src 'self' 
            https://fonts.gstatic.com;
          img-src 'self' data: blob: https: 
            https://res.cloudinary.com 
            https://i.scdn.co 
            https://is1-ssl.mzstatic.com 
            https://i.ytimg.com;
          connect-src 'self' 
            https://www.google-analytics.com 
            https://region1.google-analytics.com 
            https://analytics.google.com 
            https://stats.g.doubleclick.net 
            https://connect.facebook.net 
            https://analytics.tiktok.com 
            https://ipapi.co 
            http://ip-api.com;
          frame-src 'self' 
            https://www.googletagmanager.com;
        `.replace(/\s+/g, ' ').trim()} />
      </Head>
      
      <body>
        {/* NoScript fallback pour GTM */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <Main />
        <NextScript />

        {/* Script de debugging et monitoring en développement */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Debug helpers pour développement
                window.debugTracking = {
                  // Afficher le contenu du dataLayer
                  showDataLayer: () => {
                    console.table(window.dataLayer);
                    return window.dataLayer;
                  },
                  
                  // Tester un événement GTM
                  testEvent: (eventName, data = {}) => {
                    window.dataLayer.push({
                      event: eventName,
                      ...data,
                      debug: true,
                      timestamp: new Date().toISOString()
                    });
                    console.log('🧪 Test event sent:', eventName, data);
                  },
                  
                  // Vérifier la configuration
                  checkConfig: () => {
                    return {
                      gtm: '${GTM_CONTAINER_ID}',
                      ga4: '${GA4_MEASUREMENT_ID}',
                      metaPixel: '${process.env.NEXT_PUBLIC_META_PIXEL_ID || 'Not configured'}',
                      environment: '${process.env.NODE_ENV}',
                      dataLayerSize: window.dataLayer?.length || 0
                    };
                  }
                };
                
                // Monitoring des erreurs de tracking
                window.addEventListener('error', (event) => {
                  if (event.filename?.includes('googletagmanager') || 
                      event.filename?.includes('google-analytics') ||
                      event.filename?.includes('fbevents')) {
                    console.warn('🔥 Tracking script error:', event);
                  }
                });
                
                console.log('🔧 Debug tracking tools available:');
                console.log('  - debugTracking.showDataLayer()');
                console.log('  - debugTracking.testEvent("test_event", {data})');
                console.log('  - debugTracking.checkConfig()');
              `,
            }}
          />
        )}

        {/* Performance monitoring pour Core Web Vitals */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Monitoring des Core Web Vitals pour GA4
              if ('PerformanceObserver' in window) {
                // LCP (Largest Contentful Paint)
                new PerformanceObserver((list) => {
                  const entries = list.getEntries();
                  const lastEntry = entries[entries.length - 1];
                  
                  gtag('event', 'web_vitals', {
                    name: 'LCP',
                    value: Math.round(lastEntry.startTime),
                    event_category: 'Performance'
                  });
                }).observe({ entryTypes: ['largest-contentful-paint'] });
                
                // FID (First Input Delay)
                new PerformanceObserver((list) => {
                  const entries = list.getEntries();
                  entries.forEach((entry) => {
                    gtag('event', 'web_vitals', {
                      name: 'FID',
                      value: Math.round(entry.processingStart - entry.startTime),
                      event_category: 'Performance'
                    });
                  });
                }).observe({ entryTypes: ['first-input'] });
                
                // CLS (Cumulative Layout Shift)
                let clsValue = 0;
                new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                      clsValue += entry.value;
                      
                      gtag('event', 'web_vitals', {
                        name: 'CLS',
                        value: Math.round(clsValue * 1000),
                        event_category: 'Performance'
                      });
                    }
                  }
                }).observe({ entryTypes: ['layout-shift'] });
              }
            `,
          }}
        />
      </body>
    </Html>
  );
}

// Extension du type Window pour TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    debugTracking?: {
      showDataLayer: () => any[];
      testEvent: (eventName: string, data?: any) => void;
      checkConfig: () => any;
    };
  }
}