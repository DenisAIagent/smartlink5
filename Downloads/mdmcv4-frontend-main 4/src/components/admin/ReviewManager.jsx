import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useConnectionError from '../../hooks/useConnectionError';
import apiService from '../../services/api.service';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Rating,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import ConnectionError from '../common/ConnectionError';

const ReviewManager = () => {
  const { t } = useTranslation();
  const { isConnected, handleRetry } = useConnectionError();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchReviews();
    }
  }, [isConnected]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await apiService.reviews.getAll();
      if (response?.success && Array.isArray(response.data)) {
        setReviews(response.data);
        setError(null);
      } else {
        throw new Error(response?.error || 'Erreur lors du chargement des avis');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Impossible de charger les avis');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const response = await apiService.reviews.updateStatus(reviewId, newStatus);
      if (response?.success) {
        setReviews(reviews.map(review =>
          review.id === reviewId ? { ...review, status: newStatus } : review
        ));
        toast.success(`Avis ${newStatus === 'approved' ? 'approuvé' : 'rejeté'} avec succès`);
      } else {
        throw new Error(response?.error || 'Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;
    try {
      const response = await apiService.reviews.delete(selectedReview.id);
      if (response?.success) {
        setReviews(reviews.filter(review => review.id !== selectedReview.id));
        toast.success('Avis supprimé avec succès');
        setIsDeleteDialogOpen(false);
      } else {
        throw new Error(response?.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    return review.status === filter;
  });

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
        <Button onClick={fetchReviews} variant="contained" sx={{ mt: 2 }}>
          {t('common.retry')}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
        Gestion des Avis
      </Typography>

      {/* Filtres */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="filter-label">Filtrer par statut</InputLabel>
              <Select
                labelId="filter-label"
                value={filter}
                label="Filtrer par statut"
                onChange={(e) => setFilter(e.target.value)}
                startAdornment={<FilterListIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="all">Tous les avis</MenuItem>
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="approved">Approuvés</MenuItem>
                <MenuItem value="rejected">Rejetés</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={8}>
            <Typography variant="body2" color="text.secondary">
              {filteredReviews.length} avis {filter !== 'all' ? `(${filter})` : ''}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Liste des avis */}
      <Grid container spacing={3}>
        {filteredReviews.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              Aucun avis {filter !== 'all' ? `avec le statut "${filter}"` : ''} trouvé
            </Alert>
          </Grid>
        ) : (
          filteredReviews.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="h6" gutterBottom>
                        {review.artistName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {review.email}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({review.rating}/5)
                        </Typography>
                      </Box>
                      <Typography variant="body1" paragraph>
                        {review.comment}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(review.date).toLocaleDateString('fr-FR')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
                        <Chip
                          label={review.status === 'approved' ? 'Approuvé' : review.status === 'rejected' ? 'Rejeté' : 'En attente'}
                          color={review.status === 'approved' ? 'success' : review.status === 'rejected' ? 'error' : 'warning'}
                          size="small"
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {review.status === 'pending' && (
                            <>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleStatusChange(review.id, 'approved')}
                                aria-label="Approuver l'avis"
                              >
                                <CheckCircleIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleStatusChange(review.id, 'rejected')}
                                aria-label="Rejeter l'avis"
                              >
                                <CancelIcon />
                              </IconButton>
                            </>
                          )}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedReview(review);
                              setIsDeleteDialogOpen(true);
                            }}
                            aria-label="Supprimer l'avis"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewManager;
