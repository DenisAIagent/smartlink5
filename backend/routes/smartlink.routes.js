// backend/routes/smartlink.routes.js - Routes pour la gestion des SmartLinks
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Rate limiting pour la création de SmartLinks
const createLinkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limite de 10 créations par IP par fenêtre
  message: {
    error: 'Too many SmartLinks created from this IP, please try again later.'
  }
});

// Rate limiting pour les scans
const scanLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limite de 30 scans par IP par minute
  message: {
    error: 'Too many scan requests from this IP, please try again later.'
  }
});

// Simuler une base de données temporaire (remplacer par MongoDB)
let smartlinks = [];
let linkCounter = 1;

// GET /api/smartlinks - Obtenir tous les SmartLinks
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    let filteredLinks = smartlinks;

    if (search) {
      filteredLinks = smartlinks.filter(link => 
        link.title.toLowerCase().includes(search.toLowerCase()) ||
        link.artist.toLowerCase().includes(search.toLowerCase())
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedLinks = filteredLinks.slice(startIndex, endIndex);

    res.json({
      smartlinks: paginatedLinks,
      total: filteredLinks.length,
      page: parseInt(page),
      pages: Math.ceil(filteredLinks.length / limit)
    });
  } catch (error) {
    console.error('Error fetching SmartLinks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/smartlinks/:slug - Obtenir un SmartLink spécifique
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const smartlink = smartlinks.find(link => link.slug === slug);

    if (!smartlink) {
      return res.status(404).json({ error: 'SmartLink not found' });
    }

    // Incrémenter les vues
    smartlink.views = (smartlink.views || 0) + 1;
    smartlink.lastAccessed = new Date();

    res.json(smartlink);
  } catch (error) {
    console.error('Error fetching SmartLink:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/smartlinks/scan - Scanner une URL musicale avec Odesli
router.post('/scan', scanLimiter, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validation URL basique
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    // Simuler l'appel à l'API Odesli (remplacer par vraie intégration)
    const mockOdesliResponse = {
      entityUniqueId: `mock_${Date.now()}`,
      userCountry: 'FR',
      pageUrl: url,
      linksByPlatform: {
        spotify: {
          url: 'https://open.spotify.com/track/example',
          nativeAppUriMobile: 'spotify://track/example',
          nativeAppUriDesktop: 'spotify://track/example'
        },
        appleMusic: {
          url: 'https://music.apple.com/track/example',
          nativeAppUriMobile: 'music://track/example',
          nativeAppUriDesktop: 'music://track/example'
        },
        deezer: {
          url: 'https://www.deezer.com/track/example',
          nativeAppUriMobile: 'deezer://track/example'
        },
        youtube: {
          url: 'https://www.youtube.com/watch?v=example',
          nativeAppUriMobile: 'youtube://watch?v=example'
        },
        soundcloud: {
          url: 'https://soundcloud.com/track/example'
        }
      },
      entitiesByUniqueId: {
        [`mock_${Date.now()}`]: {
          id: `mock_${Date.now()}`,
          type: 'song',
          title: 'Example Song',
          artistName: 'Example Artist',
          thumbnailUrl: 'https://via.placeholder.com/300x300?text=Album+Art',
          thumbnailWidth: 300,
          thumbnailHeight: 300
        }
      }
    };

    res.json({
      success: true,
      data: mockOdesliResponse,
      platforms: Object.keys(mockOdesliResponse.linksByPlatform),
      metadata: mockOdesliResponse.entitiesByUniqueId[Object.keys(mockOdesliResponse.entitiesByUniqueId)[0]]
    });
  } catch (error) {
    console.error('Error scanning URL:', error);
    res.status(500).json({ error: 'Failed to scan URL' });
  }
});

// POST /api/smartlinks - Créer un nouveau SmartLink
router.post('/', createLinkLimiter, async (req, res) => {
  try {
    const {
      originalUrl,
      title,
      artist,
      platforms,
      customization,
      analytics
    } = req.body;

    // Validation des données requises
    if (!originalUrl || !title || !artist) {
      return res.status(400).json({ 
        error: 'Original URL, title, and artist are required' 
      });
    }

    // Générer un slug unique
    const baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    while (smartlinks.find(link => link.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Créer le SmartLink
    const newSmartLink = {
      id: linkCounter++,
      slug,
      originalUrl,
      title,
      artist,
      platforms: platforms || {},
      customization: {
        logoUrl: customization?.logoUrl || '',
        backgroundColor: customization?.backgroundColor || '#ffffff',
        textColor: customization?.textColor || '#000000',
        buttonStyle: customization?.buttonStyle || 'rounded'
      },
      analytics: {
        gtmId: analytics?.gtmId || '',
        gaId: analytics?.gaId || '',
        googleAdsId: analytics?.googleAdsId || '',
        pixelId: analytics?.pixelId || ''
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      clicks: 0,
      isActive: true
    };

    smartlinks.push(newSmartLink);

    res.status(201).json({
      success: true,
      smartlink: newSmartLink,
      url: `${req.protocol}://${req.get('host')}/l/${slug}`
    });
  } catch (error) {
    console.error('Error creating SmartLink:', error);
    res.status(500).json({ error: 'Failed to create SmartLink' });
  }
});

// PUT /api/smartlinks/:slug - Mettre à jour un SmartLink
router.put('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const updates = req.body;

    const smartlinkIndex = smartlinks.findIndex(link => link.slug === slug);
    if (smartlinkIndex === -1) {
      return res.status(404).json({ error: 'SmartLink not found' });
    }

    // Mettre à jour le SmartLink
    smartlinks[smartlinkIndex] = {
      ...smartlinks[smartlinkIndex],
      ...updates,
      updatedAt: new Date()
    };

    res.json({
      success: true,
      smartlink: smartlinks[smartlinkIndex]
    });
  } catch (error) {
    console.error('Error updating SmartLink:', error);
    res.status(500).json({ error: 'Failed to update SmartLink' });
  }
});

// DELETE /api/smartlinks/:slug - Supprimer un SmartLink
router.delete('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const smartlinkIndex = smartlinks.findIndex(link => link.slug === slug);

    if (smartlinkIndex === -1) {
      return res.status(404).json({ error: 'SmartLink not found' });
    }

    smartlinks.splice(smartlinkIndex, 1);

    res.json({
      success: true,
      message: 'SmartLink deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting SmartLink:', error);
    res.status(500).json({ error: 'Failed to delete SmartLink' });
  }
});

// POST /api/smartlinks/:slug/click - Enregistrer un clic sur une plateforme
router.post('/:slug/click', async (req, res) => {
  try {
    const { slug } = req.params;
    const { platform, userAgent, country } = req.body;

    const smartlink = smartlinks.find(link => link.slug === slug);
    if (!smartlink) {
      return res.status(404).json({ error: 'SmartLink not found' });
    }

    // Incrémenter les clics
    smartlink.clicks = (smartlink.clicks || 0) + 1;
    
    // Initialiser les statistiques par plateforme si nécessaire
    if (!smartlink.platformStats) {
      smartlink.platformStats = {};
    }
    if (!smartlink.platformStats[platform]) {
      smartlink.platformStats[platform] = 0;
    }
    smartlink.platformStats[platform]++;

    res.json({
      success: true,
      message: 'Click recorded successfully'
    });
  } catch (error) {
    console.error('Error recording click:', error);
    res.status(500).json({ error: 'Failed to record click' });
  }
});

module.exports = router;