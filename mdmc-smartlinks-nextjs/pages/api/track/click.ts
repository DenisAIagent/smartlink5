import { NextApiRequest, NextApiResponse } from 'next';
import { logClick, getDestinationUrl } from '@/lib/database';
import { extractClientIP, getCachedGeoData } from '@/utils/geolocation';
import { ClickTrackingResponse, ApiRequest } from '@/types/smartlink';

/**
 * API Endpoint: /api/track/click
 * Méthode: POST
 * 
 * Gère le tracking côté serveur des clics sur les plateformes de streaming
 * et retourne l'URL de destination pour la redirection
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClickTrackingResponse>
) {
  // Vérification de la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      destinationUrl: '',
      message: 'Méthode non autorisée. Utilisez POST.'
    });
  }

  // Headers CORS pour les requêtes cross-origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    // Validation des données reçues
    const { 
      smartlinkId, 
      serviceName, 
      serviceDisplayName, 
      userAgent, 
      timestamp 
    }: ApiRequest = req.body;

    // Validation des champs requis
    if (!smartlinkId || !serviceName) {
      return res.status(400).json({
        success: false,
        destinationUrl: '',
        message: 'smartlinkId et serviceName sont requis.'
      });
    }

    // Validation du format de smartlinkId (MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(smartlinkId)) {
      return res.status(400).json({
        success: false,
        destinationUrl: '',
        message: 'Format de smartlinkId invalide.'
      });
    }

    console.log(`[API] 🎯 Nouveau clic reçu: ${serviceDisplayName} pour SmartLink ${smartlinkId}`);

    // ÉTAPE 1: Extraction des données de géolocalisation
    const clientIP = extractClientIP(req);
    const geoData = await getCachedGeoData(clientIP);

    console.log(`[API] 🌍 Géolocalisation: ${geoData.country}, ${geoData.region} (IP: ${clientIP})`);

    // ÉTAPE 2: Récupération de l'URL de destination depuis la base de données
    const destinationUrl = await getDestinationUrl(smartlinkId, serviceName);

    if (!destinationUrl) {
      console.warn(`[API] ⚠️ Aucune URL trouvée pour ${serviceName} du SmartLink ${smartlinkId}`);
      return res.status(404).json({
        success: false,
        destinationUrl: '',
        message: 'Service non trouvé pour ce SmartLink.'
      });
    }

    // ÉTAPE 3: Enregistrement du clic en base de données
    const trackingId = await logClick({
      smartlinkId,
      serviceName,
      serviceDisplayName: serviceDisplayName || serviceName,
      userAgent: userAgent || req.headers['user-agent'] || 'Unknown',
      geoData,
      sessionId: req.headers['x-session-id'] as string, // Optionnel
    });

    // ÉTAPE 4: Construction de l'URL finale avec paramètres de tracking
    const finalUrl = new URL(destinationUrl);
    
    // Ajout des paramètres UTM pour le tracking
    finalUrl.searchParams.set('utm_source', 'mdmc_smartlink');
    finalUrl.searchParams.set('utm_medium', 'click');
    finalUrl.searchParams.set('utm_campaign', smartlinkId);
    finalUrl.searchParams.set('utm_content', serviceName);
    
    // Paramètre de tracking interne (optionnel)
    if (process.env.NODE_ENV === 'development') {
      finalUrl.searchParams.set('mdmc_tracking_id', trackingId);
    }

    // ÉTAPE 5: Réponse avec l'URL de destination
    const response: ClickTrackingResponse = {
      success: true,
      destinationUrl: finalUrl.toString(),
      trackingId,
      message: 'Clic enregistré avec succès'
    };

    res.status(200).json(response);

    console.log(`[API] ✅ Réponse envoyée: redirection vers ${finalUrl.toString()}`);
    console.log(`[API] 📊 Tracking ID: ${trackingId}`);

  } catch (error) {
    console.error('[API] ❌ Erreur lors du traitement du clic:', error);

    // Log détaillé de l'erreur pour le debugging
    console.error('[API] 🔍 Détails de l\'erreur:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined,
      requestBody: req.body,
      timestamp: new Date().toISOString()
    });

    // Réponse d'erreur générique (sans exposer les détails internes)
    res.status(500).json({
      success: false,
      destinationUrl: '',
      message: process.env.NODE_ENV === 'development' 
        ? `Erreur interne: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        : 'Erreur interne du serveur'
    });
  }
}

// Configuration pour l'API Next.js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb', // Limite de taille du body
    },
    responseLimit: false, // Pas de limite sur la réponse
  },
};

// Types pour améliorer l'intellisense
export interface ClickApiRequest extends NextApiRequest {
  body: ApiRequest;
}

// Helper pour valider le rate limiting (optionnel)
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];
  
  // Nettoyer les requêtes anciennes
  const validRequests = requests.filter(time => now - time < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return false; // Rate limit dépassé
  }
  
  // Ajouter la nouvelle requête
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  
  return true; // Requête autorisée
}

// Version avec rate limiting (optionnel - à activer si nécessaire)
export async function handlerWithRateLimit(
  req: NextApiRequest,
  res: NextApiResponse<ClickTrackingResponse>
) {
  const clientIP = extractClientIP(req);
  
  // Vérifier le rate limiting
  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({
      success: false,
      destinationUrl: '',
      message: 'Trop de requêtes. Veuillez patienter.'
    });
  }
  
  // Continuer avec le handler normal
  return handler(req, res);
}