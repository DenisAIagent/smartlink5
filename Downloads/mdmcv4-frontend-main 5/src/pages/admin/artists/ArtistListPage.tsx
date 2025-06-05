import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useConnectionError from '../../../hooks/useConnectionError';
import apiService from '@/services/api.service';

// Import MUI Components
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Paper
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem, GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import ConnectionError from '../../../components/common/ConnectionError';

// Types
interface Artist {
    _id: string;
    id?: string;
    name: string;
    slug: string;
    artistImageUrl?: string;
}

interface ApiResponse {
    success: boolean;
    data?: Artist[];
    error?: string;
}

function ArtistListPage(): JSX.Element {
    const { t } = useTranslation();
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { isConnected, handleRetry } = useConnectionError();

    // Fonction pour récupérer les artistes
    const fetchArtists = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            console.log("Fetching artists from API...");
            const response: ApiResponse = await apiService.getAllArtists();
            console.log("API response for artists:", response);
            if (response.success && response.data) {
                const artistsWithId = response.data.map(artist => ({ ...artist, id: artist._id }));
                setArtists(artistsWithId);
            } else {
                setError(response.error || 'Erreur inconnue lors du chargement.');
                setArtists([]);
            }
        } catch (err: any) {
            console.error("Failed to fetch artists:", err);
            const errorMsg = err.response?.data?.error || err.message || 'Erreur serveur';
            setError(errorMsg);
            setArtists([]);
            if (err.response?.status === 401) {
                setError("Erreur d'authentification. Veuillez vous reconnecter.");
            } else if (err.response?.status === 403) {
                setError("Erreur d'autorisation. Vous n'avez pas les droits nécessaires.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isConnected) {
            fetchArtists();
        }
    }, [isConnected]);

    const handleEdit = (slug: string): void => {
        console.log("Edit artist with slug:", slug);
        navigate(`/admin/artists/edit/${slug}`);
    };

    const handleDelete = async (slug: string, name: string): Promise<void> => {
        console.log("Delete artist with slug:", slug);
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'artiste "${name}" ?`)) {
            try {
                await apiService.deleteArtist(slug);
                console.log(`Artiste "${name}" supprimé avec succès.`);
                fetchArtists();
            } catch (err: any) {
                console.error("Failed to delete artist:", err);
                const errorMsg = err.response?.data?.error || err.message || 'Erreur lors de la suppression';
                setError(errorMsg);
            }
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'artistImageUrl',
            headerName: 'Image',
            width: 80,
            renderCell: (params: GridRenderCellParams) => (
                params.value ? <img src={params.value} alt={params.row.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '50%' }} /> : null
            ),
            sortable: false,
            filterable: false,
        },
        { field: 'name', headerName: 'Nom', width: 300, flex: 1 },
        { field: 'slug', headerName: 'Slug', width: 300, flex: 1 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 120,
            cellClassName: 'actions',
            getActions: ({ row }) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Modifier"
                    onClick={() => handleEdit(row.slug)}
                    color="primary"
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Supprimer"
                    onClick={() => handleDelete(row.slug, row.name)}
                    color="primary"
                />,
            ],
        },
    ];

    if (!isConnected) {
        return <ConnectionError onRetry={handleRetry} />;
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">{error}</Typography>
                <Button onClick={fetchArtists} variant="contained" sx={{ mt: 2 }}>
                    {t('common.retry')}
                </Button>
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 2, width: '100%', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h1">
                    {t('admin.artists.title')}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/admin/artists/new')}
                >
                    {t('admin.artists.add_new')}
                </Button>
            </Box>

            <Box sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
                <DataGrid
                    rows={artists}
                    columns={columns}
                    loading={loading}
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10 },
                        },
                    }}
                />
            </Box>
        </Paper>
    );
}

export default ArtistListPage; 