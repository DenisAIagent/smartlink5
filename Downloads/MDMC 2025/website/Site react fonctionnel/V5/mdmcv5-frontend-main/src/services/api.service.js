import axios from 'axios';
import API_CONFIG from '../config/api.config';

// Service pour interagir avec le backend
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.API_URL;
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS
    });
  }

  /**
   * Soumet le formulaire de contact
   * @param {Object} contactData - Données du formulaire de contact
   * @returns {Promise} - Promesse résolue avec la réponse de l'API
   */
  async submitContactForm(contactData) {
    try {
      const response = await this.axios.post('/contact/submit', contactData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire de contact:', error);
      throw error;
    }
  }

  /**
   * Soumet les résultats du simulateur
   * @param {Object} simulatorData - Données du simulateur
   * @returns {Promise} - Promesse résolue avec la réponse de l'API
   */
  async submitSimulatorResults(simulatorData) {
    try {
      const response = await this.axios.post('/simulator/submit', simulatorData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la soumission des résultats du simulateur:', error);
      throw error;
    }
  }

  /**
   * Récupère les derniers articles du blog
   * @param {Number} count - Nombre d'articles à récupérer (par défaut 3)
   * @returns {Promise} - Promesse résolue avec les articles
   */
  async getLatestBlogPosts(count = 3) {
    try {
      const response = await this.axios.get('/blog/latest', {
        params: { count }
      });
      return response.data.posts;
    } catch (error) {
      console.error('Erreur lors de la récupération des articles du blog:', error);
      throw error;
    }
  }
}

export default new ApiService();
