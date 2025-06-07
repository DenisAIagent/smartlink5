import { useState, useCallback, useEffect } from 'react';
import useToast from './useToast';

const MAX_RETRIES = 3;
const RETRY_DELAY = 3000;

const useConnectionError = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch('/api/health-check', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur de connexion');
      }
      
      setIsConnected(true);
      setRetryCount(0);
      return true;
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  }, []);

  const handleRetry = useCallback(async () => {
    if (retryCount >= MAX_RETRIES) {
      toast('Nombre maximum de tentatives atteint. Veuillez réessayer plus tard.', 'error');
      return;
    }

    setRetryCount((prev) => prev + 1);
    const isSuccessful = await checkConnection();

    if (isSuccessful) {
      toast('Connexion rétablie avec succès !', 'success');
    } else {
      toast(`Tentative de reconnexion ${retryCount + 1}/${MAX_RETRIES} échouée`, 'error');
    }
  }, [retryCount, checkConnection, toast]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isConnected) {
        await handleRetry();
      }
    }, RETRY_DELAY);

    return () => clearInterval(interval);
  }, [isConnected, handleRetry]);

  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      setRetryCount(0);
      toast('Connexion internet rétablie', 'success');
    };

    const handleOffline = () => {
      setIsConnected(false);
      toast('Connexion internet perdue', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return {
    isConnected,
    retryCount,
    handleRetry,
    checkConnection,
  };
};

export default useConnectionError; 