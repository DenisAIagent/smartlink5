import axios from 'axios';
import { errorService } from './errorService';
import { rateLimitService } from './rateLimitService';

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    this.client.interceptors.request.use(
      async (config) => {
        const endpoint = config.url;
        const rateLimit = rateLimitService.canMakeRequest(endpoint);

        if (!rateLimit.allowed) {
          const error = new Error('Rate limit exceeded');
          error.retryAfter = rateLimit.retryAfter;
          error.resetTime = rateLimit.resetTime;
          throw error;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        // Réinitialiser le compteur de retry en cas de succès
        rateLimitService.resetRetryCount(response.config.url);
        return response;
      },
      async (error) => {
        if (error.message === 'Rate limit exceeded') {
          // Gérer la limitation de taux
          const endpoint = error.config.url;
          rateLimitService.incrementRetryCount(endpoint);
          
          // Attendre le délai de retry
          await new Promise(resolve => setTimeout(resolve, error.retryAfter));
          
          // Retenter la requête
          return this.client(error.config);
        }

        // Gérer les autres erreurs
        errorService.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async post(endpoint, data = {}) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put(endpoint, data = {}) {
    try {
      const response = await this.client.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete(endpoint) {
    try {
      const response = await this.client.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Méthode pour obtenir les statistiques de limitation
  getRateLimitStats(endpoint) {
    return rateLimitService.getStats(endpoint);
  }
}

export const apiService = new ApiService(); 