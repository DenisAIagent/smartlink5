// Service de géolocalisation pour récupérer les données utilisateur

import { UserGeoData } from '@/types/smartlink';

/**
 * Interface pour les données retournées par l'API de géolocalisation
 */
interface GeoLocationAPIResponse {
  country_name: string;
  region: string;
  city: string;
  country_code: string;
  timezone: string;
  ip: string;
}

/**
 * Récupère les données de géolocalisation à partir d'une IP
 * Utilise ipapi.co comme service de géolocalisation
 */
export async function getGeoDataFromIP(ip: string): Promise<UserGeoData> {
  try {
    // Service de géolocalisation par défaut
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'MDMC-SmartLinks/1.0'
      },
      // Timeout de 3 secondes pour éviter les blocages
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
      throw new Error(`Geolocation API error: ${response.status}`);
    }

    const data: GeoLocationAPIResponse = await response.json();

    return {
      country: data.country_name || 'Unknown',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown',
      countryCode: data.country_code || 'XX',
      timezone: data.timezone || 'UTC',
      ip: data.ip
    };
  } catch (error) {
    console.warn('Geolocation service unavailable, using fallback:', error);
    
    // Fallback avec des données par défaut
    return getFallbackGeoData(ip);
  }
}

/**
 * Service de géolocalisation alternatif (fallback)
 */
async function getGeoDataFromIPFallback(ip: string): Promise<UserGeoData> {
  try {
    // Utiliser un service alternatif comme backup
    const response = await fetch(`http://ip-api.com/json/${ip}`, {
      signal: AbortSignal.timeout(2000)
    });

    if (!response.ok) {
      throw new Error(`Fallback geolocation API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      country: data.country || 'Unknown',
      region: data.regionName || 'Unknown', 
      city: data.city || 'Unknown',
      countryCode: data.countryCode || 'XX',
      timezone: data.timezone || 'UTC',
      ip: data.query || ip
    };
  } catch (error) {
    console.warn('Fallback geolocation also failed:', error);
    return getFallbackGeoData(ip);
  }
}

/**
 * Données de géolocalisation par défaut quand tous les services échouent
 */
function getFallbackGeoData(ip: string): UserGeoData {
  return {
    country: 'Unknown',
    region: 'Unknown',
    city: 'Unknown',
    countryCode: 'XX',
    timezone: 'UTC',
    ip: ip
  };
}

/**
 * Extrait l'IP réelle du client à partir des headers de la requête
 */
export function extractClientIP(req: any): string {
  // Vérifier plusieurs headers dans l'ordre de priorité
  const ip = 
    req.headers['cf-connecting-ip'] || // Cloudflare
    req.headers['x-real-ip'] || // Nginx proxy
    req.headers['x-forwarded-for']?.split(',')[0] || // Load balancer
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress ||
    '127.0.0.1';

  // Nettoyer l'IP (enlever le préfixe IPv6 si présent)
  return ip.replace(/^::ffff:/, '');
}

/**
 * Validation basique d'une adresse IP
 */
export function isValidIP(ip: string): boolean {
  // Regex simple pour IPv4
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // Regex simple pour IPv6
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Détermine si l'IP est privée/locale
 */
export function isPrivateIP(ip: string): boolean {
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/
  ];

  return privateRanges.some(range => range.test(ip));
}

/**
 * Service de géolocalisation robuste avec plusieurs tentatives
 */
export async function getGeoDataWithRetry(ip: string, maxRetries: number = 2): Promise<UserGeoData> {
  // Valider l'IP d'abord
  if (!isValidIP(ip) || isPrivateIP(ip)) {
    console.warn(`Invalid or private IP: ${ip}, using fallback`);
    return getFallbackGeoData(ip);
  }

  // Première tentative avec le service principal
  try {
    return await getGeoDataFromIP(ip);
  } catch (error) {
    console.warn('Primary geolocation failed, trying fallback');
    
    // Deuxième tentative avec le service de fallback
    if (maxRetries > 0) {
      try {
        return await getGeoDataFromIPFallback(ip);
      } catch (fallbackError) {
        console.warn('All geolocation services failed');
      }
    }
    
    return getFallbackGeoData(ip);
  }
}

/**
 * Cache simple en mémoire pour les géolocalisations récentes
 */
const geoCache = new Map<string, { data: UserGeoData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Service de géolocalisation avec cache
 */
export async function getCachedGeoData(ip: string): Promise<UserGeoData> {
  // Vérifier le cache d'abord
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Récupérer les nouvelles données
  const geoData = await getGeoDataWithRetry(ip);
  
  // Mettre en cache
  geoCache.set(ip, {
    data: geoData,
    timestamp: Date.now()
  });

  // Nettoyer le cache périodiquement (garder max 1000 entrées)
  if (geoCache.size > 1000) {
    const oldestEntries = Array.from(geoCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, 500);
    
    oldestEntries.forEach(([key]) => geoCache.delete(key));
  }

  return geoData;
}