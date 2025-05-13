// src/pages/admin/smartlinks/SmartlinkListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// Si AdminPanel.jsx gère la navigation interne pour le CRUD SmartLink,
// n'utilisez pas useNavigate ici pour les actions comme "Nouveau" ou "Modifier".
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Tooltip,
} from '@mui/material';
// GridColDef est un type TypeScript. En JS pur, on ne déclare pas le type explicitement.
// On importe GridActionsCellItem mais PAS GridColDef.
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'; 
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-toastify';

// Assurez-vous que cet alias est bien configuré dans votre vite.config.js
// et que api.service.js exporte bien un objet avec une propriété 'smartlinks'.
// Si l'alias ne fonctionne pas, utilisez le chemin relatif correct.
import apiService from '@/services/api.service'; 

// Ce composant reçoit des fonctions de callback pour la navigation depuis AdminPanel
function SmartlinkListPage({ onNavigateToCreate, onNavigateToEdit }) {
  const [smartlinks, setSmartlinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSmartlinks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Assurez-vous que apiService.smartlinks.getAll existe et fonctionne
      const response = await apiService.smartlinks.getAll(); 
      
      const smartlinksWithId = (response.data || []).map(sl => ({
        ...sl,
        id: sl._id, // DataGrid a besoin d'un champ 'id' unique pour chaque ligne
        artistName: sl.artistId?.name || 'Artiste inconnu',
        viewCount: sl.viewCount || 0,
        platformClickCount: sl.platformClickCount || 0,
      }));
      setSmartlinks(smartlinksWithId);
    } catch (err) {
      console.error("SmartlinkListPage - Failed to fetch SmartLinks:", err);
      const errorMsg = err.message || err.data?.error || 'Erreur serveur lors du chargement des SmartLinks.';
      setError(errorMsg);
      toast.error(errorMsg);
      setSmartlinks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSmartlinks();
  }, [fetchSmartlinks]);

  const handleEditClick = (id) => {
    if (onNavigateToEdit) {
      onNavigateToEdit(id); // Appel du callback fourni par AdminPanel
    } else {
      console.error("SmartlinkListPage: onNavigateToEdit prop is not defined. Check AdminPanel.jsx.");
    }
  };

  const handleCreateClick = () => {
    if (onNavigateToCreate) {
      onNavigateToCreate(); // Appel du callback fourni par AdminPanel
    } else {
      console.error("SmartlinkListPage: onNavigateToCreate prop is not defined. Check AdminPanel.jsx.");
    }
  }

  const handleViewPublicLink = (artistSlug, trackSlug) => {
    if (!artistSlug || !trackSlug) {
      toast.error("Slugs manquants, impossible d'ouvrir le lien.");
      return;
    }
    // Ce chemin doit correspondre à votre configuration de route publique dans App.jsx
    // pour le composant SmartLinkPage.jsx public
    const publicUrl = `/smartlink/${artistSlug}/${trackSlug}`; 
    window.open(publicUrl, '_blank'); // Ouvre dans un nouvel onglet
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le SmartLink "${title}" ? Cette action est irréversible.`)) {
      try {
        setLoading(true); 
        await apiService.smartlinks.deleteById(id);
        toast.success(`SmartLink "${title}" supprimé avec succès.`);
        fetchSmartlinks(); // Recharger la liste après suppression
      } catch (err) {
        console.error("SmartlinkListPage - Failed to delete SmartLink:", err);
        const errorMsg = err.message || err.data?.error || 'Erreur lors de la suppression du SmartLink.';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Définition des colonnes pour le DataGrid
  // LA LIGNE CI-DESSOUS EST CELLE QUI EST CORRIGÉE (pas de ': GridColDef[]')
  const columns = [
    {
      field: 'coverImageUrl', headerName: 'Pochette', width: 80,
      renderCell: (params) => params.value ? (<img src={params.value} alt={params.row.trackTitle} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />) : <Box sx={{width: 40, height: 40, backgroundColor: 'grey.200', borderRadius: 1}} />,
      sortable: false, filterable: false,
    },
    { field: 'trackTitle', headerName: 'Titre', flex: 1, minWidth: 150 },
    { field: 'artistName', headerName: 'Artiste', flex: 0.8, minWidth: 120 },
    {
      field: 'isPublished', headerName: 'Statut', width: 120,
      renderCell: (params) => (<Chip label={params.value ? 'Publié' : 'Brouillon'} color={params.value ? 'success' : 'default'} size="small" />),
    },
    { field: 'viewCount', headerName: 'Vues', type: 'number', width: 100, align: 'center', headerAlign: 'center' },
    { field: 'platformClickCount', headerName: 'Clics Plateforme', type: 'number', width: 150, align: 'center', headerAlign: 'center' },
    {
      field: 'createdAt', headerName: 'Créé le', type: 'dateTime', width: 180,
      valueGetter: (value) => value && new Date(value), // Pour le tri et le filtre
      renderCell: (params) => params.value && new Date(params.value).toLocaleDateString('fr-FR'), // Affichage localisé
    },
    {
      field: 'actions', type: 'actions', headerName: 'Actions', width: 150,
      getActions: ({ row }) => [
        <Tooltip title="Voir le SmartLink public" key={`view-${row.id}`}>
          <GridActionsCellItem
            icon={<VisibilityIcon />} label="Voir"
            onClick={() => handleViewPublicLink(row.artistId?.slug, row.slug)}
            disabled={!row.isPublished || !row.artistId?.slug || !row.slug} // Assurez-vous que row.artistId contient bien un objet avec 'slug'
            color="inherit"
          />
        </Tooltip>,
        <Tooltip title="Modifier" key={`edit-${row.id}`}>
          <GridActionsCellItem
            icon={<EditIcon />} label="Modifier"
            onClick={() => handleEditClick(row.id)}
            color="primary"
          />
        </Tooltip>,
        <Tooltip title="Supprimer" key={`delete-${row.id}`}>
          <GridActionsCellItem
            icon={<DeleteIcon />} label="Supprimer"
            onClick={() => handleDelete(row.id, row.trackTitle)}
            color="error"
          />
        </Tooltip>,
      ],
    },
  ];

  if (loading && smartlinks.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 5, minHeight: 400 }}>
        <CircularProgress size={50} />
        <Typography sx={{ mt: 2 }} variant="h6">Chargement des SmartLinks...</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', overflow: 'hidden', borderRadius: "8px", boxShadow: "none" }}>
      {error && !loading && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}> 
          Gestion des SmartLinks
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Nouveau SmartLink
        </Button>
      </Box>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={smartlinks}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] },
          }}
          density="standard"
          autoHeight={false}
        />
      </Box>
    </Paper>
  );
}

export default SmartlinkListPage;
