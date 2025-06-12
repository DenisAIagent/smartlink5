import { useState, useCallback } from 'react';

const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    title: '',
    type: 'info',
    duration: 6000,
    position: {
      vertical: 'top',
      horizontal: 'right',
    },
  });

  const showNotification = useCallback(
    ({
      message,
      title = '',
      type = 'info',
      duration = 6000,
      position = {
        vertical: 'top',
        horizontal: 'right',
      },
    }) => {
      setNotification({
        open: true,
        message,
        title,
        type,
        duration,
        position,
      });
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  const showSuccess = useCallback(
    (message, title = 'Succès', options = {}) => {
      showNotification({
        message,
        title,
        type: 'success',
        ...options,
      });
    },
    [showNotification]
  );

  const showError = useCallback(
    (message, title = 'Erreur', options = {}) => {
      showNotification({
        message,
        title,
        type: 'error',
        ...options,
      });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message, title = 'Attention', options = {}) => {
      showNotification({
        message,
        title,
        type: 'warning',
        ...options,
      });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message, title = 'Information', options = {}) => {
      showNotification({
        message,
        title,
        type: 'info',
        ...options,
      });
    },
    [showNotification]
  );

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default useNotification; 