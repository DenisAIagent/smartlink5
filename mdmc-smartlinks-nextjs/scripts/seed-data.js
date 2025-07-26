// Script pour insérer des données de test dans MongoDB

const mongoose = require('mongoose');
require('dotenv').config();

// Configuration de la connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mdmc-smartlinks';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'mdmc-smartlinks';

// Schémas (copie simplifiée pour le seeding)
const ArtistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  bio: String,
  avatarUrl: String,
  socialLinks: {
    instagram: String,
    twitter: String,
    tiktok: String,
    website: String
  },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const SmartLinkSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  trackTitle: { type: String, required: true },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  artworkUrl: { type: String, required: true },
  description: String,
  platforms: [{
    platform: String,
    url: String,
    isAvailable: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    affiliateUrl: String,
    country: { type: String, default: 'GLOBAL' }
  }],
  trackingConfig: {
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
    }
  },
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  metadata: {
    genre: String,
    releaseDate: Date,
    isrc: String,
    duration: Number,
    label: String
  },
  analytics: {
    totalViews: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  }
}, { timestamps: true });

const Artist = mongoose.model('Artist', ArtistSchema);
const SmartLink = mongoose.model('SmartLink', SmartLinkSchema);

// Données de test
const testArtists = [
  {
    name: 'MDMC Test Artist',
    slug: 'mdmc-test-artist',
    bio: 'Artiste de test pour la plateforme MDMC SmartLinks. Cet artiste sert à valider le bon fonctionnement du système de tracking.',
    avatarUrl: 'https://via.placeholder.com/300x300.png?text=MDMC+Artist',
    socialLinks: {
      instagram: 'https://instagram.com/mdmc.test',
      twitter: 'https://twitter.com/mdmc_test',
      website: 'https://mdmcmusicads.com'
    },
    isVerified: true
  },
  {
    name: 'Demo Band',
    slug: 'demo-band',
    bio: 'Groupe de démonstration pour tester les fonctionnalités avancées de tracking et d\'analytics.',
    avatarUrl: 'https://via.placeholder.com/300x300.png?text=Demo+Band',
    socialLinks: {
      instagram: 'https://instagram.com/demo.band',
      tiktok: 'https://tiktok.com/@demo.band'
    },
    isVerified: false
  }
];

const testSmartLinks = [
  {
    slug: 'test-track-nextjs',
    trackTitle: 'Test Track Next.js',
    description: 'Morceau de test pour valider l\'architecture Next.js avec tracking double moteur.',
    artworkUrl: 'https://via.placeholder.com/500x500.png?text=Test+Track',
    platforms: [
      {
        platform: 'spotify',
        url: 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh',
        isAvailable: true,
        priority: 1,
        country: 'GLOBAL'
      },
      {
        platform: 'apple_music',
        url: 'https://music.apple.com/album/test-track/1234567890?i=1234567890',
        isAvailable: true,
        priority: 2,
        country: 'GLOBAL'
      },
      {
        platform: 'youtube_music',
        url: 'https://music.youtube.com/watch?v=dQw4w9WgXcQ',
        isAvailable: true,
        priority: 3,
        country: 'GLOBAL'
      },
      {
        platform: 'deezer',
        url: 'https://deezer.com/track/123456789',
        isAvailable: true,
        priority: 4,
        country: 'GLOBAL'
      }
    ],
    trackingConfig: {
      ga4: {
        measurementId: 'G-TEST123456',
        enabled: true
      },
      gtm: {
        containerId: 'GTM-TEST123',
        enabled: true
      },
      metaPixel: {
        pixelId: '1234567890123456',
        enabled: true
      }
    },
    isPublished: true,
    publishedAt: new Date(),
    metadata: {
      genre: 'Electronic',
      releaseDate: new Date('2024-01-15'),
      duration: 180,
      label: 'MDMC Records'
    },
    analytics: {
      totalViews: 42,
      totalClicks: 15,
      conversionRate: 35.7
    }
  },
  {
    slug: 'demo-song-tracking',
    trackTitle: 'Demo Song - Tracking Test',
    description: 'Chanson de démonstration pour tester les capacités de tracking avancé et d\'analytics en temps réel.',
    artworkUrl: 'https://via.placeholder.com/500x500.png?text=Demo+Song',
    platforms: [
      {
        platform: 'spotify',
        url: 'https://open.spotify.com/track/demo123',
        isAvailable: true,
        priority: 1,
        country: 'GLOBAL'
      },
      {
        platform: 'apple_music',
        url: 'https://music.apple.com/album/demo-song/demo123',
        isAvailable: true,
        priority: 2,
        country: 'GLOBAL'
      },
      {
        platform: 'tidal',
        url: 'https://tidal.com/track/demo123',
        isAvailable: true,
        priority: 5,
        country: 'GLOBAL'
      }
    ],
    trackingConfig: {
      ga4: {
        measurementId: 'G-DEMO789012',
        enabled: true
      },
      gtm: {
        containerId: 'GTM-DEMO789',
        enabled: true
      }
    },
    isPublished: true,
    publishedAt: new Date(),
    metadata: {
      genre: 'Pop',
      releaseDate: new Date('2024-02-20'),
      duration: 210,
      label: 'Demo Records'
    },
    analytics: {
      totalViews: 127,
      totalClicks: 89,
      conversionRate: 70.1
    }
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Connecté à MongoDB');

    // Nettoyer les données existantes
    console.log('🧹 Nettoyage des données existantes...');
    await SmartLink.deleteMany({});
    await Artist.deleteMany({});

    // Créer les artistes
    console.log('👨‍🎤 Création des artistes...');
    const createdArtists = await Artist.insertMany(testArtists);
    console.log(`✅ ${createdArtists.length} artistes créés`);

    // Créer les SmartLinks en associant les artistes
    console.log('🔗 Création des SmartLinks...');
    const smartLinksWithArtists = testSmartLinks.map((smartlink, index) => ({
      ...smartlink,
      artistId: createdArtists[index % createdArtists.length]._id
    }));

    const createdSmartLinks = await SmartLink.insertMany(smartLinksWithArtists);
    console.log(`✅ ${createdSmartLinks.length} SmartLinks créés`);

    // Afficher un résumé
    console.log('\\n📊 Résumé des données créées:');
    console.log('================================');
    
    for (const smartlink of createdSmartLinks) {
      const artist = createdArtists.find(a => a._id.equals(smartlink.artistId));
      console.log(`\\n🎵 ${smartlink.trackTitle}`);
      console.log(`   👨‍🎤 Artiste: ${artist.name}`);
      console.log(`   🔗 Slug: ${smartlink.slug}`);
      console.log(`   🌐 URL: http://localhost:3000/${smartlink.slug}`);
      console.log(`   🎯 Plateformes: ${smartlink.platforms.length}`);
      console.log(`   📊 Vues: ${smartlink.analytics.totalViews}`);
    }

    console.log('\\n🎉 Données de test créées avec succès !');
    console.log('\\n🚀 Vous pouvez maintenant tester:');
    console.log('   • http://localhost:3000/test-track-nextjs');
    console.log('   • http://localhost:3000/demo-song-tracking');
    console.log('\\n🔧 Pour démarrer le serveur de développement:');
    console.log('   npm run dev');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };