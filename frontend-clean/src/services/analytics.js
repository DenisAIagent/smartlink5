// services/analytics.js - Analytics Management Service
export class AnalyticsManager {
  constructor(integrations = {}) {
    this.gtmId = integrations.gtmId;
    this.ga4Id = integrations.ga4Id;
    this.googleAdsId = integrations.googleAdsId;
    this.facebookPixel = integrations.facebookPixel;
    
    this.initializeTracking();
  }

  initializeTracking() {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function() {
      window.dataLayer.push(arguments);
    };

    // Google Tag Manager
    if (this.gtmId) {
      this.loadGTM();
    }

    // GA4 Direct Integration
    if (this.ga4Id) {
      this.loadGA4();
    }

    // Facebook Pixel
    if (this.facebookPixel) {
      this.loadFacebookPixel();
    }
  }

  loadGTM() {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${this.gtmId}`;
    document.head.appendChild(script);

    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });
  }

  loadGA4() {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.ga4Id}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', this.ga4Id, {
      custom_map: {
        'custom_parameter_1': 'artist',
        'custom_parameter_2': 'platform',
        'custom_parameter_3': 'link_id',
        'custom_parameter_4': 'track_title'
      }
    });
  }

  loadFacebookPixel() {
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', this.facebookPixel);
    window.fbq('track', 'PageView');
  }

  trackPageView(linkData) {
    const eventData = {
      page_title: `${linkData.artist} - ${linkData.title}`,
      page_location: window.location.href,
      artist: linkData.artist,
      track_title: linkData.title,
      link_id: linkData.id,
      platforms_count: linkData.platforms?.length || 0
    };

    // GA4 Page View
    if (window.gtag) {
      window.gtag('event', 'page_view', eventData);
      
      // Custom SmartLink View Event
      window.gtag('event', 'smartlink_view', {
        event_category: 'SmartLink',
        event_label: linkData.id,
        custom_parameter_1: linkData.artist,
        custom_parameter_3: linkData.id,
        custom_parameter_4: linkData.title
      });
    }

    // GTM DataLayer
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'smartlink_view',
        smartlink_id: linkData.id,
        artist_name: linkData.artist,
        track_title: linkData.title,
        platforms_available: linkData.platforms?.length || 0
      });
    }

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: `${linkData.artist} - ${linkData.title}`,
        content_category: 'Music',
        content_ids: [linkData.id]
      });
    }
  }

  trackPlatformClick(platform, linkData) {
    const eventData = {
      event_category: 'Platform Interaction',
      event_label: platform.name,
      value: 1,
      currency: 'EUR',
      artist: linkData.artist,
      platform: platform.name,
      platform_id: platform.id,
      link_id: linkData.id,
      track_title: linkData.title
    };

    // GA4 Conversion Event
    if (window.gtag) {
      window.gtag('event', 'platform_click', eventData);
      
      // Enhanced Ecommerce for music streaming
      window.gtag('event', 'select_content', {
        content_type: 'music_platform',
        content_id: platform.id,
        custom_parameter_1: linkData.artist,
        custom_parameter_2: platform.name,
        custom_parameter_3: linkData.id,
        custom_parameter_4: linkData.title
      });
    }

    // Google Ads Conversion
    if (this.googleAdsId && window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': `${this.googleAdsId}/platform_click`,
        'value': 1,
        'currency': 'EUR',
        'custom_parameters': {
          'platform': platform.name,
          'artist': linkData.artist,
          'track': linkData.title,
          'link_id': linkData.id
        }
      });
    }

    // GTM DataLayer
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'platform_click',
        platform_name: platform.name,
        platform_id: platform.id,
        smartlink_id: linkData.id,
        artist_name: linkData.artist,
        track_title: linkData.title,
        click_value: 1
      });
    }

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'Lead', {
        content_name: `${linkData.artist} - ${linkData.title}`,
        content_category: 'Music Platform Click',
        value: 1,
        currency: 'EUR'
      });
    }
  }

  trackCustomEvent(eventName, eventData) {
    // GA4
    if (window.gtag) {
      window.gtag('event', eventName, eventData);
    }

    // GTM
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...eventData
      });
    }

    // Facebook Pixel
    if (window.fbq && eventData.fbEvent) {
      window.fbq('track', eventData.fbEvent, eventData.fbData || {});
    }
  }
}