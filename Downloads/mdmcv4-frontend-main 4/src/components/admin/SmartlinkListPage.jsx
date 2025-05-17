import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { smartlinksService } from '../../services/smartlinks.service';
import { artistsService } from '../../services/artists.service';
import withPerformance from '../../utils/withPerformance';
import logger from '../../utils/logger';
import cacheService from '../../utils/cache';

const SmartlinkListPage = ({ onNavigateToCreate }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [smartlinks, setSmartlinks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
        cacheService.delete(cacheService.generateKey('smartlinks:all'));
        cacheService.delete(cacheService.generateKey('artists:all'));
      }

      const [smartlinksData, artistsData] = await Promise.all([
        smartlinksService.getAll(),
        artistsService.getAll()
      ]);

      if (!Array.isArray(smartlinksData) || !Array.isArray(artistsData)) {
        throw new Error(t('admin.smartlinks.invalid_data'));
      }

      setSmartlinks(smartlinksData);
      setArtists(artistsData);
      setError(null);
    } catch (err) {
      logger.error('Erreur lors du chargement des données', { error: err });
      setError(t('errors.loadingFailed'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    if (typeof onNavigateToCreate === 'function') {
      onNavigateToCreate();
    } else {
      navigate('/admin/smartlinks/create');
    }
  };

  const handleEdit = (id) => {
    if (!id) {
      setError(t('admin.smartlinks.invalid_id'));
      return;
    }
    navigate(`/admin/smartlinks/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (!id) {
      setError(t('admin.smartlinks.invalid_id'));
      return;
    }

    if (window.confirm(t('admin.smartlinks.delete_confirm'))) {
      try {
        setLoading(true);
        await smartlinksService.delete(id);
        setSmartlinks(smartlinks.filter(sl => sl.id !== id));
        setSuccess(t('admin.smartlinks.delete_success'));
        logger.info('Smartlink supprimé avec succès', { id });
      } catch (err) {
        logger.error('Erreur lors de la suppression', { error: err, id });
        setError(t('errors.deleteFailed'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  const getArtistName = (artistId) => {
    if (!artistId) return t('admin.smartlinks.no_artist');
    const artist = artists.find(a => a.id === artistId);
    return artist ? artist.name : t('admin.smartlinks.unknown_artist');
  };

  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={handleRefresh} variant="contained">
          {t('common.retry')}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('smartlinks.title')}</Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ mr: 2 }}
          >
            {refreshing ? <CircularProgress size={24} /> : t('common.refresh')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreate}
          >
            {t('smartlinks.create')}
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('smartlinks.name')}</TableCell>
                  <TableCell>{t('smartlinks.platform')}</TableCell>
                  <TableCell>{t('smartlinks.artist')}</TableCell>
                  <TableCell>{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {smartlinks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {t('admin.smartlinks.no_data')}
                    </TableCell>
                  </TableRow>
                ) : (
                  smartlinks.map((smartlink) => (
                    <TableRow key={smartlink.id}>
                      <TableCell>{smartlink.name}</TableCell>
                      <TableCell>{smartlink.platform}</TableCell>
                      <TableCell>{getArtistName(smartlink.artistId)}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleEdit(smartlink.id)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(smartlink.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={success}
      />
    </Box>
  );
};

export default withPerformance(SmartlinkListPage); 