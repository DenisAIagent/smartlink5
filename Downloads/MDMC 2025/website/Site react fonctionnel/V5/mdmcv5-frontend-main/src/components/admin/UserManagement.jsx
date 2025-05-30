import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  useTheme,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  ColorLens as ColorLensIcon,
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import './UserManagement.css';

/**
 * Composant UserManagement pour la gestion des utilisateurs et des droits d'accès
 * Intègre la nouvelle charte graphique et améliore l'expérience utilisateur
 */
const UserManagement = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Effet pour simuler le chargement des données
  useEffect(() => {
    const fetchData = async () => {
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Données simulées pour les utilisateurs
      const mockUsers = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@mdmc.com',
          fullName: 'Administrateur Principal',
          role: 'admin',
          status: 'active',
          lastLogin: '2025-05-29T10:23:45',
          createdAt: '2025-01-15T08:30:00'
        },
        {
          id: 2,
          username: 'manager',
          email: 'manager@mdmc.com',
          fullName: 'Gestionnaire Marketing',
          role: 'manager',
          status: 'active',
          lastLogin: '2025-05-28T16:45:12',
          createdAt: '2025-02-10T09:15:00'
        },
        {
          id: 3,
          username: 'editor',
          email: 'editor@mdmc.com',
          fullName: 'Éditeur de Contenu',
          role: 'editor',
          status: 'active',
          lastLogin: '2025-05-27T14:30:22',
          createdAt: '2025-03-05T11:20:00'
        },
        {
          id: 4,
          username: 'analyst',
          email: 'analyst@mdmc.com',
          fullName: 'Analyste de Données',
          role: 'analyst',
          status: 'active',
          lastLogin: '2025-05-26T09:12:33',
          createdAt: '2025-03-20T13:45:00'
        },
        {
          id: 5,
          username: 'guest',
          email: 'guest@mdmc.com',
          fullName: 'Utilisateur Invité',
          role: 'guest',
          status: 'inactive',
          lastLogin: '2025-04-15T11:22:33',
          createdAt: '2025-04-10T10:30:00'
        }
      ];
      
      // Données simulées pour les rôles
      const mockRoles = [
        {
          id: 1,
          name: 'admin',
          displayName: 'Administrateur',
          description: 'Accès complet à toutes les fonctionnalités',
          permissions: ['all'],
          userCount: 1
        },
        {
          id: 2,
          name: 'manager',
          displayName: 'Gestionnaire',
          description: 'Gestion des artistes, smart links et contenu',
          permissions: ['artists:read', 'artists:write', 'smartlinks:read', 'smartlinks:write', 'content:read', 'content:write', 'analytics:read'],
          userCount: 1
        },
        {
          id: 3,
          name: 'editor',
          displayName: 'Éditeur',
          description: 'Édition du contenu et des smart links',
          permissions: ['artists:read', 'smartlinks:read', 'smartlinks:write', 'content:read', 'content:write'],
          userCount: 1
        },
        {
          id: 4,
          name: 'analyst',
          displayName: 'Analyste',
          description: 'Accès en lecture seule aux analytics',
          permissions: ['artists:read', 'smartlinks:read', 'analytics:read'],
          userCount: 1
        },
        {
          id: 5,
          name: 'guest',
          displayName: 'Invité',
          description: 'Accès limité en lecture seule',
          permissions: ['artists:read', 'smartlinks:read'],
          userCount: 1
        }
      ];
      
      // Données simulées pour les permissions
      const mockPermissions = [
        { id: 1, name: 'artists:read', description: 'Voir les artistes' },
        { id: 2, name: 'artists:write', description: 'Modifier les artistes' },
        { id: 3, name: 'smartlinks:read', description: 'Voir les smart links' },
        { id: 4, name: 'smartlinks:write', description: 'Modifier les smart links' },
        { id: 5, name: 'content:read', description: 'Voir le contenu' },
        { id: 6, name: 'content:write', description: 'Modifier le contenu' },
        { id: 7, name: 'analytics:read', description: 'Voir les analytics' },
        { id: 8, name: 'analytics:write', description: 'Configurer les analytics' },
        { id: 9, name: 'users:read', description: 'Voir les utilisateurs' },
        { id: 10, name: 'users:write', description: 'Gérer les utilisateurs' },
        { id: 11, name: 'settings:read', description: 'Voir les paramètres' },
        { id: 12, name: 'settings:write', description: 'Modifier les paramètres' },
        { id: 13, name: 'all', description: 'Accès complet' }
      ];
      
      setUsers(mockUsers);
      setRoles(mockRoles);
      setPermissions(mockPermissions);
      setLoading(false);
    };
    
    fetchData();
  }, []);
  
  // Changement d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Gestion du dialogue d'utilisateur
  const handleOpenUserDialog = (user = null) => {
    setCurrentUser(user);
    setOpenUserDialog(true);
  };
  
  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
    setCurrentUser(null);
  };
  
  // Gestion du dialogue de rôle
  const handleOpenRoleDialog = (role = null) => {
    setCurrentRole(role);
    setOpenRoleDialog(true);
  };
  
  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
    setCurrentRole(null);
  };
  
  // Simuler l'ajout ou la modification d'un utilisateur
  const handleSaveUser = () => {
    setLoading(true);
    
    // Simuler un délai de traitement
    setTimeout(() => {
      setOpenUserDialog(false);
      setCurrentUser(null);
      setLoading(false);
      
      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: currentUser ? 'Utilisateur modifié avec succès' : 'Nouvel utilisateur créé avec succès',
        severity: 'success'
      });
    }, 1000);
  };
  
  // Simuler l'ajout ou la modification d'un rôle
  const handleSaveRole = () => {
    setLoading(true);
    
    // Simuler un délai de traitement
    setTimeout(() => {
      setOpenRoleDialog(false);
      setCurrentRole(null);
      setLoading(false);
      
      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: currentRole ? 'Rôle modifié avec succès' : 'Nouveau rôle créé avec succès',
        severity: 'success'
      });
    }, 1000);
  };
  
  // Simuler la suppression d'un utilisateur
  const handleDeleteUser = (id) => {
    setLoading(true);
    
    // Simuler un délai de traitement
    setTimeout(() => {
      setLoading(false);
      
      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: 'Utilisateur supprimé avec succès',
        severity: 'success'
      });
    }, 1000);
  };
  
  // Simuler la suppression d'un rôle
  const handleDeleteRole = (id) => {
    setLoading(true);
    
    // Simuler un délai de traitement
    setTimeout(() => {
      setLoading(false);
      
      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: 'Rôle supprimé avec succès',
        severity: 'success'
      });
    }, 1000);
  };
  
  // Fermer le snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Rendu du contenu en fonction de l'onglet actif
  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // Utilisateurs
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                Liste des utilisateurs
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={() => handleOpenUserDialog()}
              >
                Nouvel utilisateur
              </Button>
            </Box>
            
            {loading ? (
              <LinearProgress sx={{ mb: 2 }} />
            ) : (
              <Paper 
                sx={{ 
                  width: '100%',
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[2],
                  overflow: 'hidden'
                }}
              >
                <List>
                  {users.map((user) => (
                    <React.Fragment key={user.id}>
                      <ListItem 
                        sx={{ 
                          py: 2,
                          '&:hover': { 
                            backgroundColor: theme.palette.action.hover 
                          }
                        }}
                      >
                        <ListItemIcon>
                          <Avatar 
                            sx={{ 
                              bgcolor: user.status === 'active' ? theme.palette.primary.light : theme.palette.grey[400]
                            }}
                          >
                            {user.fullName.charAt(0)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {user.fullName}
                              </Typography>
                              <Chip 
                                label={user.role} 
                                size="small" 
                                color={user.role === 'admin' ? 'primary' : 'default'}
                                sx={{ ml: 1 }}
                              />
                              <Chip 
                                label={user.status === 'active' ? 'Actif' : 'Inactif'} 
                                size="small" 
                                color={user.status === 'active' ? 'success' : 'default'}
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" component="span">
                                {user.email} • Nom d'utilisateur: {user.username}
                              </Typography>
                              <Typography variant="body2" component="div" color="text.secondary">
                                Dernière connexion: {formatDate(user.lastLogin)} • Créé le: {formatDate(user.createdAt)}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Modifier">
                            <IconButton 
                              edge="end" 
                              aria-label="modifier"
                              onClick={() => handleOpenUserDialog(user)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton 
                              edge="end" 
                              aria-label="supprimer"
                              onClick={() => handleDeleteUser(user.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        );
      
      case 1: // Rôles et permissions
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                Rôles et permissions
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={() => handleOpenRoleDialog()}
              >
                Nouveau rôle
              </Button>
            </Box>
            
            {loading ? (
              <LinearProgress sx={{ mb: 2 }} />
            ) : (
              <Paper 
                sx={{ 
                  width: '100%',
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[2],
                  overflow: 'hidden'
                }}
              >
                <List>
                  {roles.map((role) => (
                    <React.Fragment key={role.id}>
                      <ListItem 
                        sx={{ 
                          py: 2,
                          '&:hover': { 
                            backgroundColor: theme.palette.action.hover 
                          }
                        }}
                      >
                        <ListItemIcon>
                          <Avatar 
                            sx={{ 
                              bgcolor: role.name === 'admin' ? theme.palette.primary.main : theme.palette.primary.light
                            }}
                          >
                            {role.name === 'admin' ? <SecurityIcon /> : <PersonIcon />}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {role.displayName}
                              </Typography>
                              <Chip 
                                label={`${role.userCount} utilisateur${role.userCount > 1 ? 's' : ''}`} 
                                size="small" 
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" component="div">
                                {role.description}
                              </Typography>
                              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {role.permissions.includes('all') ? (
                                  <Chip 
                                    label="Accès complet" 
                                    size="small" 
                                    color="primary"
                                  />
                                ) : (
                                  role.permissions.map((perm, index) => (
                                    <Chip 
                                      key={index}
                                      label={permissions.find(p => p.name === perm)?.description || perm} 
                                      size="small" 
                                      variant="outlined"
                                    />
                                  ))
                                )}
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Modifier">
                            <IconButton 
                              edge="end" 
                              aria-label="modifier"
                              onClick={() => handleOpenRoleDialog(role)}
                              sx={{ mr: 1 }}
                              disabled={role.name === 'admin'} // Empêcher la modification du rôle admin
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton 
                              edge="end" 
                              aria-label="supprimer"
                              onClick={() => handleDeleteRole(role.id)}
                              color="error"
                              disabled={role.name === 'admin'} // Empêcher la suppression du rôle admin
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Titre de la page */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          Gestion des utilisateurs
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1000);
          }}
          disabled={loading}
        >
          Actualiser
        </Button>
      </Box>
      
      {/* Onglets */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Utilisateurs" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Rôles et permissions" icon={<SecurityIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* Contenu des onglets */}
      {renderTabContent()}
      
      {/* Dialogue d'ajout/édition d'utilisateur */}
      <Dialog 
        open={openUserDialog} 
        onClose={handleCloseUserDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentUser ? 'Modifier un utilisateur' : 'Ajouter un nouvel utilisateur'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom complet"
                variant="outlined"
                required
                defaultValue={currentUser?.fullName || ''}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom d'utilisateur"
                variant="outlined"
                required
                defaultValue={currentUser?.username || ''}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                required
                defaultValue={currentUser?.email || ''}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mot de passe"
                type="password"
                variant="outlined"
                required={!currentUser}
                margin="normal"
                helperText={currentUser ? "Laissez vide pour conserver le mot de passe actuel" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>Rôle</InputLabel>
                <Select
                  label="Rôle"
                  defaultValue={currentUser?.role || 'guest'}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.name}>
                      {role.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>Statut</InputLabel>
                <Select
                  label="Statut"
                  defaultValue={currentUser?.status || 'active'}
                >
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch 
                    defaultChecked={true} 
                    color="primary"
                  />
                }
                label="Envoyer un email de bienvenue avec les instructions de connexion"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Annuler</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveUser}
            disabled={loading}
            startIcon={<SaveIcon />}
          >
            {currentUser ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue d'ajout/édition de rôle */}
      <Dialog 
        open={openRoleDialog} 
        onClose={handleCloseRoleDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentRole ? 'Modifier un rôle' : 'Créer un nouveau rôle'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom d'affichage"
                variant="outlined"
                required
                defaultValue={currentRole?.displayName || ''}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Identifiant système"
                variant="outlined"
                required
                defaultValue={currentRole?.name || ''}
                margin="normal"
                helperText="Identifiant unique pour le système (sans espaces ni caractères spéciaux)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={2}
                defaultValue={currentRole?.description || ''}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Permissions
              </Typography>
              <FormControlLabel
                control={
                  <Switch 
                    defaultChecked={currentRole?.permissions.includes('all')} 
                    color="primary"
                  />
                }
                label="Accès complet (toutes les permissions)"
              />
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {permissions
                  .filter(perm => perm.name !== 'all')
                  .map((perm) => (
                    <Grid item xs={12} sm={6} md={4} key={perm.id}>
                      <FormControlLabel
                        control={
                          <Switch 
                            defaultChecked={currentRole?.permissions.includes(perm.name)} 
                            color="primary"
                            disabled={currentRole?.permissions.includes('all')}
                          />
                        }
                        label={perm.description}
                      />
                    </Grid>
                  ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>Annuler</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveRole}
            disabled={loading}
            startIcon={<SaveIcon />}
          >
            {currentRole ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManagement;
