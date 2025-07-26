// Configuration et connexion à MongoDB avec Mongoose

import mongoose from 'mongoose';
import { SmartLinkData, VisitData, ClickData, UserGeoData } from '@/types/smartlink';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'test';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Interface pour le cache de connexion global
interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cache global pour éviter les multiples connexions en développement
let cached: GlobalMongoose = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * Connexion à MongoDB avec mise en cache
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: MONGODB_DB_NAME,
      maxPoolSize: 10, // Maintenir jusqu'à 10 connexions socket
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ Connected to MongoDB');
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }
}

// =====================================================
// SCHÉMAS MONGOOSE
// =====================================================

// Schéma pour les plateformes de streaming
const PlatformLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: [
      'spotify', 'apple_music', 'youtube_music', 'youtube', 'deezer', 
      'tidal', 'soundcloud', 'bandcamp', 'amazon_music', 'qobuz',
      'audiomack', 'beatport', 'itunes', 'pandora', 'napster'
    ]
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0 // 0 = plus haute priorité
  },
  affiliateUrl: {
    type: String,
    trim: true
  },
  country: {
    type: String, // ISO 3166-1 alpha-2 (FR, US, etc.)
    default: 'GLOBAL'
  }
}, { _id: false });

// Schéma pour la configuration de tracking
const AnalyticsConfigSchema = new mongoose.Schema({
  ga4: {
    measurementId: String,
    enabled: { type: Boolean, default: true }
  },
  gtm: {
    containerId: String,
    enabled: { type: Boolean, default: true }
  },
  metaPixel: {
    pixelId: String,
    enabled: { type: Boolean, default: true }
  },
  customTracking: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: false });

// Schéma pour les artistes
const ArtistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  bio: {
    type: String,
    trim: true
  },
  avatarUrl: {
    type: String,
    trim: true
  },
  socialLinks: {
    instagram: String,
    twitter: String,
    tiktok: String,
    website: String
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Schéma principal pour les SmartLinks
const SmartLinkSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  trackTitle: {
    type: String,
    required: true,
    trim: true
  },
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
  },
  artworkUrl: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  platforms: [PlatformLinkSchema],
  trackingConfig: AnalyticsConfigSchema,
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  customDomain: {
    type: String,
    trim: true
  },
  shortUrl: {
    type: String,
    trim: true
  },
  metadata: {
    genre: String,
    releaseDate: Date,
    isrc: String,
    duration: Number, // en secondes
    label: String
  },
  analytics: {
    totalViews: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Schéma pour le tracking des visites
const VisitSchema = new mongoose.Schema({
  smartlinkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmartLink',
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  referrer: {
    type: String,
    default: 'Direct'
  },
  geoData: {
    country: String,
    region: String,
    city: String,
    countryCode: String,
    timezone: String
  },
  sessionId: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Schéma pour le tracking des clics
const ClickSchema = new mongoose.Schema({
  smartlinkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmartLink',
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  serviceDisplayName: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  ip: String,
  referrer: String,
  geoData: {
    country: String,
    region: String,
    city: String,
    countryCode: String,
    timezone: String
  },
  sessionId: String,
  trackingId: {
    type: String,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour les performances
SmartLinkSchema.index({ slug: 1 });
SmartLinkSchema.index({ artistId: 1, isPublished: 1 });
VisitSchema.index({ smartlinkId: 1, timestamp: -1 });
ClickSchema.index({ smartlinkId: 1, timestamp: -1 });
ClickSchema.index({ trackingId: 1 });

// =====================================================
// MODÈLES MONGOOSE
// =====================================================

export const Artist = mongoose.models.Artist || mongoose.model('Artist', ArtistSchema);
export const SmartLink = mongoose.models.SmartLink || mongoose.model('SmartLink', SmartLinkSchema);
export const Visit = mongoose.models.Visit || mongoose.model('Visit', VisitSchema);
export const Click = mongoose.models.Click || mongoose.model('Click', ClickSchema);

// =====================================================
// FONCTIONS D'ACCÈS AUX DONNÉES
// =====================================================

/**
 * Récupère un SmartLink par son slug
 */
export async function getSmartLinkBySlug(slug: string): Promise<SmartLinkData | null> {
  try {
    await connectToDatabase();
    
    const smartlink = await SmartLink.findOne({ 
      slug: slug.toLowerCase(),
      isPublished: true 
    }).populate('artistId').lean();

    if (!smartlink) {
      return null;
    }

    // Transformation du document MongoDB vers notre type TypeScript
    return {
      id: smartlink._id.toString(),
      slug: smartlink.slug,
      trackTitle: smartlink.trackTitle,
      artistId: smartlink.artistId._id.toString(),
      artist: {
        id: smartlink.artistId._id.toString(),
        name: smartlink.artistId.name,
        slug: smartlink.artistId.slug,
        bio: smartlink.artistId.bio,
        avatarUrl: smartlink.artistId.avatarUrl,
        socialLinks: smartlink.artistId.socialLinks,
        isVerified: smartlink.artistId.isVerified,
        createdAt: smartlink.artistId.createdAt.toISOString(),
        updatedAt: smartlink.artistId.updatedAt.toISOString()
      },
      artworkUrl: smartlink.artworkUrl,
      description: smartlink.description,
      platforms: smartlink.platforms || [],
      trackingConfig: smartlink.trackingConfig || {},
      isPublished: smartlink.isPublished,
      publishedAt: smartlink.publishedAt?.toISOString(),
      customDomain: smartlink.customDomain,
      shortUrl: smartlink.shortUrl,
      metadata: smartlink.metadata || {},
      analytics: smartlink.analytics || { totalViews: 0, totalClicks: 0, conversionRate: 0 },
      createdAt: smartlink.createdAt.toISOString(),
      updatedAt: smartlink.updatedAt.toISOString()
    };
  } catch (error) {
    console.error('Error fetching SmartLink by slug:', error);
    return null;
  }
}

/**
 * Enregistre une visite de SmartLink
 */
export async function logVisit(visitData: Omit<VisitData, 'timestamp'>): Promise<string> {
  try {
    await connectToDatabase();
    
    const visit = new Visit({
      ...visitData,
      timestamp: new Date()
    });

    await visit.save();
    
    // Mise à jour des statistiques du SmartLink
    await SmartLink.findByIdAndUpdate(
      visitData.smartlinkId,
      { $inc: { 'analytics.totalViews': 1 } }
    );

    console.log(`✅ Visit logged for SmartLink: ${visitData.smartlinkId}`);
    return visit._id.toString();
  } catch (error) {
    console.error('Error logging visit:', error);
    throw error;
  }
}

/**
 * Enregistre un clic sur un service
 */
export async function logClick(clickData: Omit<ClickData, 'timestamp'>): Promise<string> {
  try {
    await connectToDatabase();
    
    const trackingId = `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const click = new Click({
      ...clickData,
      trackingId,
      timestamp: new Date()
    });

    await click.save();
    
    // Mise à jour des statistiques du SmartLink
    await SmartLink.findByIdAndUpdate(
      clickData.smartlinkId,
      { $inc: { 'analytics.totalClicks': 1 } }
    );

    console.log(`✅ Click logged for SmartLink: ${clickData.smartlinkId}, Service: ${clickData.serviceName}`);
    return trackingId;
  } catch (error) {
    console.error('Error logging click:', error);
    throw error;
  }
}

/**
 * Récupère l'URL de destination pour un service spécifique
 */
export async function getDestinationUrl(smartlinkId: string, serviceName: string): Promise<string | null> {
  try {
    await connectToDatabase();
    
    const smartlink = await SmartLink.findById(smartlinkId);
    if (!smartlink) {
      return null;
    }

    const platform = smartlink.platforms.find((p: any) => p.platform === serviceName);
    return platform?.url || null;
  } catch (error) {
    console.error('Error getting destination URL:', error);
    return null;
  }
}