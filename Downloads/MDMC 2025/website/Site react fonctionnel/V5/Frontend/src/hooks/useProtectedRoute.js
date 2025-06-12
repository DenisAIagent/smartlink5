import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useProtectedRoute = () => {
  const [authStatus, setAuthStatus] = useState({
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    lastChecked: null,
  });

  const location = useLocation();
  const navigate = useNavigate();

  const checkAuth = useCallback(async (force = false) => {
    const now = Date.now();
    const shouldCheck = force || 
      !authStatus.lastChecked || 
      now - authStatus.lastChecked > CACHE_DURATION;

    if (!shouldCheck) {
      return;
    }

    try {
      const response = await authService.getMe();
      setAuthStatus({
        isLoading: false,
        isAuthenticated: true,
        isAdmin: response.data.role === 'admin',
        lastChecked: now,
      });
    } catch (error) {
      setAuthStatus({
        isLoading: false,
        isAuthenticated: false,
        isAdmin: false,
        lastChecked: now,
      });
      navigate('/admin/login', {
        state: { from: location },
        replace: true,
      });
    }
  }, [authStatus.lastChecked, location, navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth, location.key]);

  const refreshAuth = useCallback(() => {
    checkAuth(true);
  }, [checkAuth]);

  return {
    ...authStatus,
    refreshAuth,
  };
};

export default useProtectedRoute; 