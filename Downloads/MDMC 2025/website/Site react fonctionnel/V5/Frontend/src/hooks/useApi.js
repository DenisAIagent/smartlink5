import { useState, useCallback } from 'react';
import axios from 'axios';
import useNotification from './useNotification';

const useApi = (baseURL = process.env.VITE_API_URL) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useNotification();

  // Créer une instance axios avec la configuration de base
  const api = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Intercepteur pour les requêtes
  api.interceptors.request.use(
    (config) => {
      // Ajouter le token d'authentification si disponible
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Intercepteur pour les réponses
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Une erreur est survenue';

      // Gérer les erreurs spécifiques
      if (error.response) {
        switch (error.response.status) {
          case 401:
            // Rediriger vers la page de connexion
            window.location.href = '/login';
            break;
          case 403:
            showError('Accès refusé');
            break;
          case 404:
            showError('Ressource non trouvée');
            break;
          case 500:
            showError('Erreur serveur');
            break;
          default:
            showError(errorMessage);
        }
      } else if (error.request) {
        showError('Pas de réponse du serveur');
      } else {
        showError(errorMessage);
      }

      return Promise.reject(error);
    }
  );

  const request = useCallback(
    async (config) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api(config);
        return response.data;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const get = useCallback(
    (url, config = {}) => {
      return request({ ...config, method: 'GET', url });
    },
    [request]
  );

  const post = useCallback(
    (url, data = {}, config = {}) => {
      return request({ ...config, method: 'POST', url, data });
    },
    [request]
  );

  const put = useCallback(
    (url, data = {}, config = {}) => {
      return request({ ...config, method: 'PUT', url, data });
    },
    [request]
  );

  const patch = useCallback(
    (url, data = {}, config = {}) => {
      return request({ ...config, method: 'PATCH', url, data });
    },
    [request]
  );

  const del = useCallback(
    (url, config = {}) => {
      return request({ ...config, method: 'DELETE', url });
    },
    [request]
  );

  return {
    loading,
    error,
    get,
    post,
    put,
    patch,
    delete: del,
  };
};

export default useApi; 