import { useCallback, useEffect } from 'react';
import { useStore } from './useStore';
import securityService from '../services/security.service';

export const useSecurity = () => {
  const { isAuthenticated, setAuth } = useStore();

  // Vérification de l'authentification
  const checkAuth = useCallback(async () => {
    const isAuth = await securityService.checkAuthentication();
    if (!isAuth) {
      setAuth({ isAuthenticated: false, token: null, refreshToken: null });
    }
    return isAuth;
  }, [setAuth]);

  // Gestion de la connexion
  const login = useCallback(async (credentials) => {
    try {
      securityService.handleLoginAttempt();

      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': securityService.generateCSRFToken(),
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Échec de la connexion');
      }

      const { token, refreshToken } = await response.json();
      await securityService.handleAuthentication(token, refreshToken);
      return true;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    }
  }, []);

  // Gestion de la déconnexion
  const logout = useCallback(async () => {
    await securityService.logout();
  }, []);

  // Vérification périodique de l'authentification
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(checkAuth, 300000); // Vérification toutes les 5 minutes
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, checkAuth]);

  // Protection des routes
  const protectRoute = useCallback(async (Component) => {
    const isAuth = await checkAuth();
    if (!isAuth) {
      window.location.href = '/login';
      return null;
    }
    return Component;
  }, [checkAuth]);

  // Validation des entrées
  const validateInput = useCallback((input, type) => {
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      case 'password':
        return securityService.validatePassword(input);
      case 'url':
        return securityService.validateURL(input);
      default:
        return securityService.sanitizeInput(input);
    }
  }, []);

  // Gestion des données sensibles
  const encryptSensitiveData = useCallback((data) => {
    return securityService.encryptData(data);
  }, []);

  const decryptSensitiveData = useCallback((encryptedData) => {
    return securityService.decryptData(encryptedData);
  }, []);

  return {
    isAuthenticated,
    login,
    logout,
    protectRoute,
    validateInput,
    encryptSensitiveData,
    decryptSensitiveData,
  };
};

// Hooks spécialisés pour différents aspects de la sécurité
export const useAuth = () => {
  const { isAuthenticated, login, logout } = useSecurity();
  return { isAuthenticated, login, logout };
};

export const useInputValidation = () => {
  const { validateInput } = useSecurity();
  return { validateInput };
};

export const useDataEncryption = () => {
  const { encryptSensitiveData, decryptSensitiveData } = useSecurity();
  return { encryptSensitiveData, decryptSensitiveData };
};

export default useSecurity; 