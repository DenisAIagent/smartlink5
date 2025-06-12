import axios from 'axios';
import { STORAGE_KEYS, API_ENDPOINTS } from '../config/constants';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await this.refreshToken(refreshToken);
            const { token } = response.data;

            this.setToken(token);
            originalRequest.headers.Authorization = `Bearer ${token}`;

            return this.api(originalRequest);
          } catch (refreshError) {
            this.clearAuth();
            window.location.href = '/admin/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  getToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  setToken(token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  setRefreshToken(token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  clearAuth() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  async login(credentials) {
    try {
      const response = await this.api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      const { token, refreshToken } = response.data;
      
      this.setToken(token);
      this.setRefreshToken(refreshToken);
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await this.api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await this.api.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMe() {
    try {
      const response = await this.api.get(API_ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data.message || 'Une erreur est survenue',
      };
    }
    return {
      status: 500,
      message: 'Erreur de connexion au serveur',
    };
  }
}

export default new AuthService(); 