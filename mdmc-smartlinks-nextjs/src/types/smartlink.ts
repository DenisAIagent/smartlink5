// Types TypeScript pour la plateforme SmartLinks

export interface ServicePlatform {
  id: string;
  name: string;
  url: string;
  displayName: string;
  iconUrl: string;
  priority: number;
  isAvailable: boolean;
  affiliateUrl?: string;
  country?: string;
}

export interface TrackingConfig {
  ga4?: {
    measurementId: string;
    enabled: boolean;
  };
  gtm?: {
    containerId: string;
    enabled: boolean;
  };
  metaPixel?: {
    pixelId: string;
    enabled: boolean;
  };
  customTracking?: {
    [key: string]: any;
  };
}

export interface Artist {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    website?: string;
  };
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SmartLinkData {
  id: string;
  slug: string;
  trackTitle: string;
  artistId: string;
  artist: Artist;
  artworkUrl: string;
  description: string;
  platforms: ServicePlatform[];
  trackingConfig: TrackingConfig;
  isPublished: boolean;
  publishedAt?: string;
  customDomain?: string;
  shortUrl?: string;
  metadata: {
    genre?: string;
    releaseDate?: string;
    isrc?: string;
    duration?: number;
    label?: string;
  };
  analytics: {
    totalViews: number;
    totalClicks: number;
    conversionRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserGeoData {
  country: string;
  region: string;
  city: string;
  countryCode: string;
  timezone: string;
  ip?: string;
}

export interface VisitData {
  smartlinkId: string;
  timestamp: string;
  userAgent: string;
  ip: string;
  referrer: string;
  geoData: UserGeoData;
  sessionId?: string;
}

export interface ClickData {
  smartlinkId: string;
  serviceName: string;
  serviceDisplayName: string;
  userAgent: string;
  timestamp: string;
  geoData?: UserGeoData;
  sessionId?: string;
  referrer?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface ClickTrackingResponse {
  success: boolean;
  destinationUrl: string;
  trackingId?: string;
  message?: string;
}

// Types pour les événements GTM/Analytics
export interface GTMEvent {
  event: string;
  smartlink_id?: string;
  track_title?: string;
  artist_name?: string;
  service_name?: string;
  service_display_name?: string;
  user_country?: string;
  user_region?: string;
  click_timestamp?: string;
  page_path?: string;
  [key: string]: any;
}

// Types pour les pages Next.js
export interface SmartLinkPageProps {
  smartlinkData: SmartLinkData;
  userGeoData: UserGeoData;
  error?: string;
}

export interface ApiRequest {
  smartlinkId: string;
  serviceName: string;
  serviceDisplayName: string;
  userAgent: string;
  timestamp: string;
}

// Types pour les hooks
export interface UseTrackingReturn {
  trackPageView: (data: Partial<GTMEvent>) => void;
  trackServiceClick: (platform: ServicePlatform) => Promise<ClickTrackingResponse>;
  isTracking: boolean;
}

// Énumérations
export enum PlatformType {
  SPOTIFY = 'spotify',
  APPLE_MUSIC = 'apple_music',
  YOUTUBE_MUSIC = 'youtube_music',
  YOUTUBE = 'youtube',
  DEEZER = 'deezer',
  TIDAL = 'tidal',
  SOUNDCLOUD = 'soundcloud',
  BANDCAMP = 'bandcamp',
  AMAZON_MUSIC = 'amazon_music',
  QOBUZ = 'qobuz',
  AUDIOMACK = 'audiomack',
  BEATPORT = 'beatport',
  ITUNES = 'itunes',
  PANDORA = 'pandora',
  NAPSTER = 'napster'
}

export enum TrackingEventType {
  PAGE_VIEW = 'smartlink_page_view',
  SERVICE_CLICK = 'service_click',
  PLATFORM_REDIRECT = 'platform_redirect',
  ERROR = 'tracking_error'
}