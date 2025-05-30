import React, { useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Collapse,
  Divider,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  MusicNote as ArtistIcon,
  Link as SmartLinkIcon,
  BarChart as AnalyticsIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  ChatBubble as ChatbotIcon,
  Web as LandingPageIcon,
  WordPress as WordPressIcon,
  Campaign as MarketingIcon,
  Star as ReviewIcon,
  PermMedia as MediaIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

/**
 * Composant Sidebar amélioré pour l'interface d'administration
 * Intègre la nouvelle charte graphique et améliore l'expérience utilisateur
 */
const Sidebar = ({ open, toggleSidebar }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // États pour les sous-menus
  const [openSubMenus, setOpenSubMenus] = useState({
    marketing: false,
    content: false,
    settings: false
  });
  
  // Gestion des sous-menus
  const handleSubMenuToggle = (menu) => {
    setOpenSubMenus({
      ...openSubMenus,
      [menu]: !openSubMenus[menu]
    });
  };
  
  // Vérification si un chemin est actif
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Largeur du drawer en fonction de l'état (ouvert/fermé)
  const drawerWidth = open ? 260 : 72;
  
  // Style commun pour les éléments de menu
  const menuItemStyle = {
    borderRadius: '8px',
    mx: 1,
    my: 0.5,
    height: 48,
    '&.active': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
      '& .MuiListItemIcon-root': {
        color: theme.palette.primary.contrastText
      }
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  };
  
  // Contenu du drawer
  const drawerContent = (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: open ? 'space-between' : 'center',
          p: 2
        }}
      >
        {open && (
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.primary.main
            }}
          >
            MDMC Admin
          </Typography>
        )}
        {isMobile && (
          <IconButton onClick={toggleSidebar}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      
      <Divider />
      
      <List component="nav" sx={{ px: 1 }}>
        {/* Dashboard */}
        <Tooltip title={open ? "" : "Dashboard"} placement="right">
          <ListItem 
            button 
            component={Link} 
            to="/admin/dashboard" 
            className={isActive('/admin/dashboard') ? 'active' : ''}
            sx={menuItemStyle}
          >
            <ListItemIcon>
              <DashboardIcon color={isActive('/admin/dashboard') ? 'inherit' : 'action'} />
            </ListItemIcon>
            {open && <ListItemText primary="Dashboard" />}
          </ListItem>
        </Tooltip>
        
        {/* Gestion des artistes */}
        <Tooltip title={open ? "" : "Artistes"} placement="right">
          <ListItem 
            button 
            component={Link} 
            to="/admin/artists" 
            className={isActive('/admin/artists') ? 'active' : ''}
            sx={menuItemStyle}
          >
            <ListItemIcon>
              <ArtistIcon color={isActive('/admin/artists') ? 'inherit' : 'action'} />
            </ListItemIcon>
            {open && <ListItemText primary="Artistes" />}
          </ListItem>
        </Tooltip>
        
        {/* Smart Links */}
        <Tooltip title={open ? "" : "Smart Links"} placement="right">
          <ListItem 
            button 
            component={Link} 
            to="/admin/smartlinks" 
            className={isActive('/admin/smartlinks') ? 'active' : ''}
            sx={menuItemStyle}
          >
            <ListItemIcon>
              <SmartLinkIcon color={isActive('/admin/smartlinks') ? 'inherit' : 'action'} />
            </ListItemIcon>
            {open && <ListItemText primary="Smart Links" />}
          </ListItem>
        </Tooltip>
        
        {/* Analytics */}
        <Tooltip title={open ? "" : "Analytics"} placement="right">
          <ListItem 
            button 
            component={Link} 
            to="/admin/analytics" 
            className={isActive('/admin/analytics') ? 'active' : ''}
            sx={menuItemStyle}
          >
            <ListItemIcon>
              <AnalyticsIcon color={isActive('/admin/analytics') ? 'inherit' : 'action'} />
            </ListItemIcon>
            {open && <ListItemText primary="Analytics" />}
          </ListItem>
        </Tooltip>
        
        {/* Marketing */}
        <Tooltip title={open ? "" : "Marketing"} placement="right">
          <ListItem 
            button 
            onClick={() => handleSubMenuToggle('marketing')}
            sx={menuItemStyle}
          >
            <ListItemIcon>
              <MarketingIcon color="action" />
            </ListItemIcon>
            {open && (
              <>
                <ListItemText primary="Marketing" />
                {openSubMenus.marketing ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItem>
        </Tooltip>
        
        {/* Sous-menu Marketing */}
        {open && (
          <Collapse in={openSubMenus.marketing} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem 
                button 
                component={Link} 
                to="/admin/marketing/integrations" 
                className={isActive('/admin/marketing/integrations') ? 'active' : ''}
                sx={{ ...menuItemStyle, pl: 4 }}
              >
                <ListItemIcon>
                  <MarketingIcon color={isActive('/admin/marketing/integrations') ? 'inherit' : 'action'} fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Intégrations" />
              </ListItem>
              
              <ListItem 
                button 
                component={Link} 
                to="/admin/marketing/campaigns" 
                className={isActive('/admin/marketing/campaigns') ? 'active' : ''}
                sx={{ ...menuItemStyle, pl: 4 }}
              >
                <ListItemIcon>
                  <MarketingIcon color={isActive('/admin/marketing/campaigns') ? 'inherit' : 'action'} fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Campagnes" />
              </ListItem>
            </List>
          </Collapse>
        )}
        
        {/* Contenu */}
        <Tooltip title={open ? "" : "Contenu"} placement="right">
          <ListItem 
            button 
            onClick={() => handleSubMenuToggle('content')}
            sx={menuItemStyle}
          >
            <ListItemIcon>
              <LandingPageIcon color="action" />
            </ListItemIcon>
            {open && (
              <>
                <ListItemText primary="Contenu" />
                {openSubMenus.content ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItem>
        </Tooltip>
        
        {/* Sous-menu Contenu */}
        {open && (
          <Collapse in={openSubMenus.content} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem 
                button 
                component={Link} 
                to="/admin/content/landing-pages" 
                className={isActive('/admin/content/landing-pages') ? 'active' : ''}
                sx={{ ...menuItemStyle, pl: 4 }}
              >
                <ListItemIcon>
                  <LandingPageIcon color={isActive('/admin/content/landing-pages') ? 'inherit' : 'action'} fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Landing Pages" />
              </ListItem>
              
              <ListItem 
                button 
                component={Link} 
                to="/admin/content/wordpress" 
                className={isActive('/admin/content/wordpress') ? 'active' : ''}
                sx={{ ...menuItemStyle, pl: 4 }}
              >
                <ListItemIcon>
                  <WordPressIcon color={isActive('/admin/content/wordpress') ? 'inherit' : 'action'} fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="WordPress" />
              </ListItem>
              
              <ListItem 
                button 
                component={Link} 
                to="/admin/content/media" 
                className={isActive('/admin/content/media') ? 'active' : ''}
                sx={{ ...menuItemStyle, pl: 4 }}
              >
                <ListItemIcon>
                  <MediaIcon color={isActive('/admin/content/media') ? 'inherit' : 'action'} fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Médiathèque" />
              </ListItem>
            </List>
          </Collapse>
        )}
        
        {/* Reviews */}
        <Tooltip title={open ? "" : "Avis"} placement="right">
          <ListItem 
            button 
            component={Link} 
            to="/admin/reviews" 
            className={isActive('/admin/reviews') ? 'active' : ''}
            sx={menuItemStyle}
          >
            <ListItemIcon>
              <ReviewIcon color={isActive('/admin/reviews') ? 'inherit' : 'action'} />
            </ListItemIcon>
            {open && <ListItemText primary="Avis" />}
          </ListItem>
        </Tooltip>
        
        {/* Chatbot */}
        <Tooltip title={open ? "" : "Chatbot IA"} placement="right">
          <ListItem 
            button 
            component={Link} 
            to="/admin/chatbot" 
            className={isActive('/admin/chatbot') ? 'active' : ''}
            sx={menuItemStyle}
          >
            <ListItemIcon>
              <ChatbotIcon color={isActive('/admin/chatbot') ? 'inherit' : 'action'} />
            </ListItemIcon>
            {open && <ListItemText primary="Chatbot IA" />}
          </ListItem>
        </Tooltip>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Paramètres */}
        <Tooltip title={open ? "" : "Paramètres"} placement="right">
          <ListItem 
            button 
            onClick={() => handleSubMenuToggle('settings')}
            sx={menuItemStyle}
          >
            <ListItemIcon>
              <SettingsIcon color="action" />
            </ListItemIcon>
            {open && (
              <>
                <ListItemText primary="Paramètres" />
                {openSubMenus.settings ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItem>
        </Tooltip>
        
        {/* Sous-menu Paramètres */}
        {open && (
          <Collapse in={openSubMenus.settings} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem 
                button 
                component={Link} 
                to="/admin/settings/profile" 
                className={isActive('/admin/settings/profile') ? 'active' : ''}
                sx={{ ...menuItemStyle, pl: 4 }}
              >
                <ListItemIcon>
                  <SettingsIcon color={isActive('/admin/settings/profile') ? 'inherit' : 'action'} fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Profil" />
              </ListItem>
              
              <ListItem 
                button 
                component={Link} 
                to="/admin/settings/security" 
                className={isActive('/admin/settings/security') ? 'active' : ''}
                sx={{ ...menuItemStyle, pl: 4 }}
              >
                <ListItemIcon>
                  <SettingsIcon color={isActive('/admin/settings/security') ? 'inherit' : 'action'} fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Sécurité" />
              </ListItem>
              
              <ListItem 
                button 
                component={Link} 
                to="/admin/settings/preferences" 
                className={isActive('/admin/settings/preferences') ? 'active' : ''}
                sx={{ ...menuItemStyle, pl: 4 }}
              >
                <ListItemIcon>
                  <SettingsIcon color={isActive('/admin/settings/preferences') ? 'inherit' : 'action'} fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Préférences" />
              </ListItem>
            </List>
          </Collapse>
        )}
      </List>
    </>
  );
  
  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={isMobile ? toggleSidebar : undefined}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(['width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          backgroundColor: theme.palette.background.paper,
          boxShadow: open ? theme.shadows[1] : 'none'
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
