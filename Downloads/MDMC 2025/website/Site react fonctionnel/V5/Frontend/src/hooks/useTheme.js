import { useCallback, useEffect } from 'react';
import { useTheme as useMuiTheme } from '@mui/material';
import { useLocalStorage } from './useLocalStorage';

const useTheme = () => {
  const muiTheme = useMuiTheme();
  const [mode, setMode] = useLocalStorage('theme-mode', 'light');

  const toggleTheme = useCallback(() => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, [setMode]);

  const setThemeMode = useCallback(
    (newMode) => {
      if (newMode === 'light' || newMode === 'dark') {
        setMode(newMode);
      }
    },
    [setMode]
  );

  useEffect(() => {
    // Mettre à jour les attributs du document pour l'accessibilité
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.setAttribute('data-color-scheme', mode);

    // Mettre à jour la meta theme-color pour les navigateurs mobiles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        mode === 'dark' ? '#121212' : '#ffffff'
      );
    }
  }, [mode]);

  return {
    mode,
    toggleTheme,
    setThemeMode,
    isDarkMode: mode === 'dark',
    isLightMode: mode === 'light',
    theme: muiTheme,
  };
};

export default useTheme; 