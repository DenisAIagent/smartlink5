import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { smartlinksService } from '../../services/smartlinks.service';
import { artistsService } from '../../services/artists.service';

const SmartlinkListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [smartlinks, setSmartlinks] = useState([]);
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [smartlinksData, artistsData] = await Promise.all([
        smartlinksService.getAll(),
        artistsService.getAll()
      ]);
      setSmartlinks(smartlinksData);
      setArtists(artistsData);
    } catch (err) {
      setError(err.message || t('admin.smartlinks.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/admin/smartlinks/create');
  };

  const handleEdit = (id) => {
    navigate(`/admin/smartlinks/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.smartlinks.delete_confirm'))) {
      try {
        await smartlinksService.delete(id);
        setSmartlinks(smartlinks.filter(sl => sl.id !== id));
      } catch (err) {
        setError(err.message || t('admin.smartlinks.delete_error'));
      }
    }
  };

  const getArtistName = (artistId) => {
    const artist = artists.find(a => a.id === artistId);
    return artist ? artist.name : artistId;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {t('admin.smartlinks.list_title')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          {t('admin.smartlinks.create')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('admin.smartlinks.name')}</TableCell>
                  <TableCell>{t('admin.smartlinks.platform')}</TableCell>
                  <TableCell>{t('admin.smartlinks.artist')}</TableCell>
                  <TableCell>{t('admin.smartlinks.url')}</TableCell>
                  <TableCell align="right">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {smartlinks.map((smartlink) => (
                  <TableRow key={smartlink.id}>
                    <TableCell>{smartlink.name}</TableCell>
                    <TableCell>{smartlink.platform}</TableCell>
                    <TableCell>{getArtistName(smartlink.artistId)}</TableCell>
                    <TableCell>{smartlink.url}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(smartlink.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(smartlink.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SmartlinkListPage; 