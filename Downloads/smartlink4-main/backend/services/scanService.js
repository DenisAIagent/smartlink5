const axios = require('axios');

class ScanService {
  constructor() {
    this.odesliBaseUrl = 'https://api.song.link/v1-alpha.1/links';
  }

  async scanUrl(url) {
    try {
      console.log(`Scanning URL with Odesli: ${url}`);
      
      // Appel à l'API Odesli
      const response = await axios.get(this.odesliBaseUrl, {
        params: {
          url: url
        },
        timeout: 10000 // 10 secondes de timeout
      });

      const data = response.data;
      
      if (!data || !data.entitiesByUniqueId) {
        throw new Error('No data returned from Odesli API');
      }

      // Extraction des informations de la première entité trouvée
      const entityId = data.entityUniqueId;
      const entity = data.entitiesByUniqueId[entityId];
      
      if (!entity) {
        throw new Error('No entity found in Odesli response');
      }

      // Construction de la réponse avec les données Odesli
      const result = {
        artist: entity.artistName || 'Artiste inconnu',
        title: entity.title || 'Titre inconnu',
        thumbnail: entity.thumbnailUrl && this.isValidUrl(entity.thumbnailUrl) ? entity.thumbnailUrl : 'https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Album+Cover',
      links: this.extractLinks(data.linksByPlatform, url)
    };

    console.log(`Successfully scanned: ${result.artist} - ${result.title}`);
    return result;

  } catch (error) {
    console.error("Error scanning URL with Odesli:", error.message);

    // Fallback vers des données simulées en cas d'erreur
    console.log("Falling back to mock data");
    return this.getFallbackData(url);
  }
}

isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (e) {
    return false;
  }
}

extractLinks(linksByPlatform, originalUrl) {
  const links = {};

  // Mapping des plateformes Odesli vers nos noms de plateformes
  const platformMapping = {
    spotify: "spotify",
    appleMusic: "appleMusic",
    youtube: "youtube",
    youtubeMusic: "youtube",
    deezer: "deezer",
    amazonMusic: "amazonMusic",
    tidal: "tidal",
    pandora: "pandora",
    soundcloud: "soundcloud",
  };

  // Extraction des liens disponibles
  for (const [platform, linkData] of Object.entries(linksByPlatform || {})) {
    const mappedPlatform = platformMapping[platform];
    if (mappedPlatform && linkData.url && this.isValidUrl(linkData.url)) {
      links[mappedPlatform] = linkData.url;
    }
  }

  // S'assurer que l'URL originale est incluse
  const detectedPlatform = this.detectPlatform(originalUrl);
  if (detectedPlatform && !links[detectedPlatform] && this.isValidUrl(originalUrl)) {
    links[detectedPlatform] = originalUrl;
  }

  // Ajouter des liens par défaut pour les plateformes manquantes
  const defaultLinks = {
    spotify: links.spotify || "https://open.spotify.com/search",
    appleMusic: links.appleMusic || "https://music.apple.com/search",
    youtube: links.youtube || "https://www.youtube.com/results",
    deezer: links.deezer || "https://www.deezer.com/search",
    amazonMusic: links.amazonMusic || "https://music.amazon.com/search",
    tidal: links.tidal || "https://tidal.com/search",
  };

  return { ...defaultLinks, ...links };
}

  detectPlatform(url) {
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('music.apple.com')) return 'appleMusic';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('deezer.com')) return 'deezer';
    if (url.includes('music.amazon.com')) return 'amazonMusic';
    if (url.includes('tidal.com')) return 'tidal';
    return null;
  }

  getFallbackData(url) {
    // Données de fallback en cas d'échec de l'API Odesli
    const platform = this.detectPlatform(url);
    
    return {
      artist: 'Artiste non trouvé',
      title: 'Titre non trouvé',
      thumbnail: 'https://via.placeholder.com/300x300/1DB954/FFFFFF?text=Album+Cover',
      links: {
        spotify: platform === 'spotify' ? url : 'https://open.spotify.com/search',
        appleMusic: platform === 'appleMusic' ? url : 'https://music.apple.com/search',
        youtube: platform === 'youtube' ? url : 'https://www.youtube.com/results',
        deezer: platform === 'deezer' ? url : 'https://www.deezer.com/search',
        amazonMusic: platform === 'amazonMusic' ? url : 'https://music.amazon.com/search',
        tidal: platform === 'tidal' ? url : 'https://tidal.com/search'
      }
    };
  }
}

module.exports = new ScanService();

