import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  Box, 
  Badge,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import './Header.css';

/**
 * Composant Header amélioré pour l'interface d'administration
 * Intègre la nouvelle charte graphique et améliore l'expérience utilisateur
 */
const Header = ({ toggleSidebar, user }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = React.useState(null);
  
  // État pour simuler des notifications non lues
  const [notifications] = React.useState([
    { id: 1, message: "Nouvel artiste ajouté", read: false },
    { id: 2, message: "Smart Link partagé 10 fois", read: false },
    { id: 3, message: "Mise à jour disponible", read: true }
  ]);
  
  // Nombre de notifications non lues
  const unreadCount = notifications.filter(notif => !notif.read).length;
  
  // Gestion du menu utilisateur
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Gestion du menu de notifications
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  // Gestion de la déconnexion
  const handleLogout = () => {
    // Logique de déconnexion à implémenter
    console.log('Déconnexion');
    handleMenuClose();
  };
  
  return (
    <AppBar 
      position="fixed" 
      className="header"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.primary.main,
        boxShadow: theme.shadows[3]
      }}
    >
      <Toolbar>
        {/* Bouton de toggle du sidebar */}
        <IconButton
          color="inherit"
          aria-label="ouvrir le menu"
          onClick={toggleSidebar}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* Logo et titre */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontFamily: theme.typography.h6.fontFamily,
            fontWeight: 600
          }}
        >
          MDMC Music Ads
        </Typography>
        
        {/* Notifications */}
        <Box sx={{ mx: 1 }}>
          <IconButton 
            color="inherit"
            onClick={handleNotificationsOpen}
            aria-label={`${unreadCount} notifications non lues`}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationsAnchorEl}
            open={Boolean(notificationsAnchorEl)}
            onClose={handleNotificationsClose}
            PaperProps={{
              sx: {
                width: 320,
                maxHeight: 400,
                mt: 1.5,
                boxShadow: theme.shadows[4]
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Notifications
              </Typography>
            </Box>
            {notifications.length === 0 ? (
              <MenuItem>
                <Typography variant="body2">Aucune notification</Typography>
              </MenuItem>
            ) : (
              notifications.map((notification) => (
                <MenuItem 
                  key={notification.id}
                  sx={{
                    backgroundColor: notification.read ? 'inherit' : theme.palette.action.hover,
                    borderLeft: notification.read ? 'none' : `4px solid ${theme.palette.primary.main}`
                  }}
                >
                  <Typography variant="body2">{notification.message}</Typography>
                </MenuItem>
              ))
            )}
            <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ cursor: 'pointer', fontWeight: 500 }}
              >
                Voir toutes les notifications
              </Typography>
            </Box>
          </Menu>
        </Box>
        
        {/* Paramètres */}
        <Box sx={{ mx: 1 }}>
          <IconButton color="inherit" aria-label="paramètres">
            <SettingsIcon />
          </IconButton>
        </Box>
        
        {/* Profil utilisateur */}
        <Box>
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            aria-label="compte de l'utilisateur"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            color="inherit"
          >
            <Avatar 
              alt={user?.name || "Utilisateur"} 
              src={user?.avatar || "/static/images/avatar/default.jpg"}
              sx={{ 
                width: 40, 
                height: 40,
                border: `2px solid ${theme.palette.background.paper}`
              }}
            />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {user?.name || "Utilisateur"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || "utilisateur@mdmc.com"}
              </Typography>
            </Box>
            <MenuItem onClick={handleMenuClose}>
              <Typography variant="body2">Mon profil</Typography>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Typography variant="body2">Mes paramètres</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">Déconnexion</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
