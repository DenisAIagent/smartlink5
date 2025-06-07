import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Divider,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Link as LinkIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  Analytics as AnalyticsIcon,
  RateReview as RateReviewIcon,
  Web as WebIcon,
  Extension as ExtensionIcon,
  Article as ArticleIcon,
  Sync as SyncIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';

const menuItems = [
  { 
    label: "Tableau de bord", 
    path: "/admin/dashboard", 
    icon: <DashboardIcon />
  },
  {
    label: "Smart Links",
    icon: <LinkIcon />,
    children: [
      { label: "Créer un Smart Link", path: "/admin/smartlinks/create" },
      { label: "Gérer les Smart Links", path: "/admin/smartlinks" }
    ]
  },
  {
    label: "Artistes",
    icon: <PersonIcon />,
    children: [
      { label: "Liste des Artistes", path: "/admin/artists" },
      { label: "Créer un Artiste", path: "/admin/artists/create" }
    ]
  },
  { 
    label: "Simulateur", 
    path: "/admin/simulator", 
    icon: <PsychologyIcon />
  },
  { 
    label: "Analytics", 
    path: "/admin/analytics", 
    icon: <AnalyticsIcon />
  },
  { 
    label: "Avis", 
    path: "/admin/reviews", 
    icon: <RateReviewIcon />
  },
  {
    label: "Landing Pages",
    icon: <WebIcon />,
    children: [
      { label: "Créer une Landing Page", path: "/admin/landing-pages/create" },
      { label: "Gérer les Landing Pages", path: "/admin/landing-pages" }
    ]
  },
  { 
    label: "Intégrations Marketing", 
    path: "/admin/integrations", 
    icon: <ExtensionIcon />
  },
  { 
    label: "Connecteur WordPress", 
    path: "/admin/wordpress", 
    icon: <ArticleIcon />
  },
  { 
    label: "Synchronisation WordPress", 
    path: "/admin/wordpress/sync", 
    icon: <SyncIcon />
  },
  { 
    label: "Paramètres", 
    path: "/admin/settings", 
    icon: <SettingsIcon />
  }
];

const AdminPanel = () => {
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleMenuClick = (label) => {
    setOpenMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const renderMenuItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.label];
    const isItemActive = isActive(item.path);

    return (
      <React.Fragment key={item.label}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                handleMenuClick(item.label);
              } else {
                navigate(item.path);
              }
            }}
            sx={{
              pl: level * 2 + 2,
              backgroundColor: isItemActive ? theme.palette.primary.light : 'transparent',
              '&:hover': {
                backgroundColor: theme.palette.primary.light + '80'
              }
            }}
          >
            <ListItemIcon sx={{ color: isItemActive ? theme.palette.primary.main : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                color: isItemActive ? theme.palette.primary.main : 'inherit',
                fontWeight: isItemActive ? 'bold' : 'normal'
              }}
            />
            {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box
      sx={{
        width: 280,
        minHeight: '100vh',
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          MDMC Admin
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map(item => renderMenuItem(item))}
      </List>
    </Box>
  );
};

export default AdminPanel; 