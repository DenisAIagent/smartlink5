import React from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import themeConfig from './theme';

/**
 * Fournisseur de thème personnalisé pour MDMC Music Ads v4
 * Applique le thème à tous les composants Material UI de l'application
 */
const ThemeProvider = ({ children }) => {
  // Création du thème à partir de la configuration
  const theme = createTheme(themeConfig);

  return (
    <MuiThemeProvider theme={theme}>
      {/* CssBaseline normalise les styles CSS de base */}
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
