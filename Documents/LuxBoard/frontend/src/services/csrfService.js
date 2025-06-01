import axios from 'axios';

class CsrfService {
  constructor() {
    this.token = null;
    this.headerName = 'X-CSRF-Token';
  }

  // Initialiser le service CSRF
  async initialize() {
    try {
      const response = await axios.get('/api/csrf-token');
      this.token = response.data.token;
      this.setupAxiosInterceptors();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du token CSRF:', error);
      throw error;
    }
  }

  // Configurer les intercepteurs Axios
  setupAxiosInterceptors() {
    axios.interceptors.request.use((config) => {
      // Ajouter le token CSRF aux requêtes non-GET
      if (config.method !== 'get' && this.token) {
        config.headers[this.headerName] = this.token;
      }
      return config;
    });

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Gérer les erreurs CSRF
        if (error.response?.status === 419) {
          this.handleCsrfError();
        }
        return Promise.reject(error);
      }
    );
  }

  // Gérer les erreurs CSRF
  async handleCsrfError() {
    try {
      // Rafraîchir le token CSRF
      await this.initialize();
      
      // Retenter la requête qui a échoué
      const config = error.config;
      if (config) {
        config.headers[this.headerName] = this.token;
        return axios(config);
      }
    } catch (error) {
      console.error('Erreur lors de la gestion de l\'erreur CSRF:', error);
      throw error;
    }
  }

  // Obtenir le token CSRF actuel
  getToken() {
    return this.token;
  }

  // Vérifier si le token CSRF est valide
  isTokenValid() {
    return !!this.token;
  }

  // Réinitialiser le token CSRF
  resetToken() {
    this.token = null;
  }
}

export const csrfService = new CsrfService(); 