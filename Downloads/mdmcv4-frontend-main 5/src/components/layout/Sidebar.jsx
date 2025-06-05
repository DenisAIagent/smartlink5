import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Extension as ExtensionIcon
} from '@mui/icons-material';

const menuItems = [
  { text: 'Paramètres', icon: <SettingsIcon />, path: '/admin/settings' },
  { text: 'Rapports', icon: <AssessmentIcon />, path: '/admin/reports' },
  { text: 'Intégrations', icon: <ExtensionIcon />, path: '/admin/integrations' }
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box'
        }
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 