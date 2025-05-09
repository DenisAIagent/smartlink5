// src/theme/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff003c', // Rouge vibrant MDMC
    },
    secondary: {
      main: '#1a1a1a', // Gris foncé pour éléments secondaires
    },
    background: {
      default: '#0d0d0d', // Noir profond (fond principal)
      paper: '#1a1a1a',   // Gris foncé (fonds de sections, cartes)
    },
    text: {
      primary: '#ffffff',   // Blanc pur (texte principal)
      secondary: '#f5f5f5', // Gris neutre clair (texte secondaire)
    },
    // Vous pouvez aussi définir error, warning, info, success si besoin
    // error: { main: '#d32f2f' },
    divider: '#1a1a1a', // Gris foncé pour les bordures subtiles
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    h1: { fontSize: '2.2rem', fontWeight: 600, marginBottom: '1rem', color: '#1a202c' }, // Ajusté pour être plus grand
    h2: { fontSize: '1.8rem', fontWeight: 600, marginBottom: '1rem', color: '#1a202c' }, // Titres de section
    h3: { fontSize: '1.4rem', fontWeight: 500, marginBottom: '0.75rem', color: '#1a202c' }, // Sous-titres
    h4: { fontSize: '1.2rem', fontWeight: 500, marginBottom: '0.5rem', color: '#1a202c' },
    body1: { fontSize: '1rem', color: '#4a5568' }, // Texte principal
    body2: { fontSize: '0.875rem', color: '#718096' }, // Texte secondaire, helperText
    button: {
      textTransform: 'none', // Pour que les boutons n'aient pas de majuscules par défaut
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Bordures un peu plus arrondies
          padding: '0.6rem 1.2rem', // Un peu plus de padding
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#c0392b', // Version plus foncée de votre primaire pour le survol
          },
        },
        // Vous pouvez ajouter des variantes pour outlined, text etc.
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined', // Standardiser la variante si vous le souhaitez
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e74c3c', // Couleur primaire au survol
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e74c3c', // Couleur primaire au focus
              // Vous pourriez vouloir une bordure plus épaisse au focus :
              // borderWidth: '2px',
            },
          },
          // Assurer que les labels ne sont pas coupés
          '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
              transform: 'translate(14px, -9px) scale(0.75)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#e8edf3', // Un gris très clair pour les en-têtes de tableau
          color: '#1a202c',
          fontWeight: 600,
        },
        body: {
          borderColor: '#e0e0e0', // Bordures de cellules plus subtiles
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 1, // Ombre par défaut subtile
      },
      styleOverrides: {
        root: {
          borderRadius: '8px',
          // L'ombre par défaut d'elevation 1 est souvent suffisante,
          // mais vous pouvez la personnaliser si '0 1px 3px rgba(0,0,0,0.1)' vous plaisait plus.
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '8px',
          // Le padding sera géré par DialogTitle, DialogContent, DialogActions
        },
      },
    },
    MuiDialogTitle: {
        styleOverrides: {
            root: {
                padding: '16px 24px', // Standard MUI padding
                borderBottom: '1px solid #e0e0e0' // Séparateur visuel
            }
        }
    },
    MuiDialogContent: {
        styleOverrides: {
            root: {
                padding: '20px 24px', // Standard MUI padding
            }
        }
    },
    MuiDialogActions: {
        styleOverrides: {
            root: {
                padding: '16px 24px', // Standard MUI padding
                borderTop: '1px solid #e0e0e0' // Séparateur visuel
            }
        }
    },
    MuiDrawer: { // Pour la sidebar
        styleOverrides: {
            paper: {
                backgroundColor: '#1a202c',
                color: '#ffffff',
                width: 250, // Largeur fixe de la sidebar
                padding: '16px', // theme.spacing(2)
                borderRight: 'none', // Pas de bordure si elle est collée
            }
        }
    },
    MuiListItem: { // Pour les éléments de navigation dans la sidebar
        styleOverrides: {
            root: {
                borderRadius: '8px',
                marginBottom: '8px', // theme.spacing(1)
                '&.Mui-selected': {
                    backgroundColor: '#e74c3c !important', // Couleur active
                    color: '#ffffff',
                    '& .MuiListItemIcon-root': {
                        color: '#ffffff',
                    },
                },
                '&:hover': {
                    backgroundColor: '#2d3748', // Survol dans la sidebar
                },
            }
        }
    },
    MuiListItemIcon: {
        styleOverrides: {
            root: {
                color: '#ffffff', // Couleur des icônes dans la sidebar
                minWidth: '40px', // Espace pour l'icône
            }
        }
    }
    // Vous pouvez continuer à personnaliser d'autres composants ici
  },
  spacing: 8, // Unité de base pour les espacements (theme.spacing(1) = 8px)
});

export default theme;
