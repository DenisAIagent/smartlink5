import axios from 'axios';

/**
 * Recherche un artiste ou un morceau sur toutes les plateformes via Odesli/Songlink
 * @param {Object} params - { url, artistName, trackName }
 * @returns {Promise<Object>} - Résultat de l'API Odesli
 *
 * Exemples d'appel :
 *   await searchOdesli({ artistName: 'Daft Punk' });
 *   await searchOdesli({ url: 'https://open.spotify.com/track/xxxx' });
 */
export async function searchOdesli(params) {
  const baseUrl = 'https://api.song.link/v1-alpha.1/links';
  let query = '';
  if (params.url) {
    query = `?url=${encodeURIComponent(params.url)}`;
  } else if (params.artistName) {
    query = `?artistName=${encodeURIComponent(params.artistName)}`;
    if (params.trackName) {
      query += `&trackName=${encodeURIComponent(params.trackName)}`;
    }
  } else {
    throw new Error('Vous devez fournir une url, un artistName ou un trackName');
  }

  try {
    const response = await axios.get(baseUrl + query);
    return response.data;
  } catch (error) {
    throw new Error('Erreur lors de la recherche Odesli : ' + error.message);
  }
}

/**
 * Exemple d'utilisation :
 *
 * import { searchOdesli } from '../utils/odesli';
 *
 * const result = await searchOdesli({ artistName: 'Daft Punk' });
 * // result.entitiesByUniqueId, result.linksByPlatform, etc.
 */ 